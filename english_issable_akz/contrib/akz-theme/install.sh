#!/usr/bin/env bash
# Install the optional AKZ theme on an existing Issabel server.
set -euo pipefail
umask 022

activate=false
case "${1:-}" in
  --activate) activate=true ;;
  --help|-h)
    printf '%s\n' 'Usage: sudo bash contrib/akz-theme/install.sh [--activate]' \
      'Install the optional theme. --activate also selects it and sets the UI language to English.'
    exit 0 ;;
  '') ;;
  *) printf 'Unknown option: %s\n' "$1" >&2; exit 1 ;;
esac
[[ $# -le 1 ]] || { echo 'Only one option is accepted.' >&2; exit 1; }
[[ $EUID -eq 0 ]] || { echo 'Run this installer as root.' >&2; exit 1; }
for command_name in cp mv install stat find sqlite3 flock readlink; do
  command -v "$command_name" >/dev/null || { printf 'Missing command: %s\n' "$command_name" >&2; exit 1; }
done

package_root=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../.." && pwd -P)
source_dir="$package_root/framework/html/themes/akz"
html_dir=/var/www/html
theme_dir="$html_dir/themes/akz"
settings_db=/var/www/db/settings.db
state_dir=/var/lib/issabel/akz-theme

[[ -f "$html_dir/index.php" && -f "$settings_db" && -d "$html_dir/themes/tenant" ]] || {
  echo 'An existing Issabel installation with the tenant theme is required.' >&2; exit 1;
}
[[ -f "$source_dir/themesetup.php" && -s "$source_dir/css/akz-tailwind.css" ]] || {
  echo 'The package is incomplete. Keep framework/ and contrib/ together.' >&2; exit 1;
}
[[ ! -L "$theme_dir" && ! -L "$state_dir" ]] || { echo 'Refusing a symbolic-link destination.' >&2; exit 1; }
[[ $(readlink -f "$html_dir/themes") == /var/www/html/themes ]] || {
  echo 'This installer supports the standard /var/www/html/themes layout.' >&2; exit 1;
}
install -d -m 700 "$state_dir"
exec 9>"$state_dir/install.lock"
flock -n 9 || { echo 'Another theme operation is running.' >&2; exit 1; }
if [[ -e "$theme_dir" && ! -f "$state_dir/managed" ]]; then
  echo 'An unmanaged akz theme already exists. Rename it before installing this package.' >&2
  exit 1
fi
[[ $(sqlite3 "$settings_db" "SELECT count(*) FROM settings WHERE key IN ('theme','language');") == 2 ]] || {
  echo 'The Issabel theme/language settings could not be located.' >&2; exit 1;
}
if [[ ! -f "$state_dir/restore-settings.sql" ]]; then
  {
    printf 'BEGIN IMMEDIATE;\n'
    sqlite3 "$settings_db" "SELECT 'UPDATE settings SET value=' || quote(value) || ' WHERE key=' || quote(key) || ';' FROM settings WHERE key IN ('theme','language');"
    printf 'COMMIT;\n'
  } > "$state_dir/restore-settings.sql"
  chmod 600 "$state_dir/restore-settings.sql"
fi

stage="$html_dir/themes/.akz-stage-$$"
[[ ! -e "$stage" ]] || { echo 'A staging directory already exists.' >&2; exit 1; }
backup_dir="$state_dir/backups/$(date -u +%Y%m%dT%H%M%SZ)-$$"
install -d -m 700 "$backup_dir"
previous=false
deployed=false
cleanup() {
  result=$?
  if [[ $result -ne 0 && $deployed == true ]]; then
    mv -- "$theme_dir" "$backup_dir/failed-install"
    if [[ $previous == true ]]; then mv -- "$backup_dir/akz" "$theme_dir"; fi
  elif [[ $result -ne 0 && $previous == true && ! -e "$theme_dir" ]]; then
    mv -- "$backup_dir/akz" "$theme_dir"
  fi
  if [[ -d "$stage" ]]; then mv -- "$stage" "$backup_dir/incomplete-stage"; fi
  exit "$result"
}
trap cleanup EXIT
install -d -m 755 "$stage"
cp -a -- "$source_dir/." "$stage/"
find "$stage" -type d -exec chmod 755 {} +
find "$stage" -type f -exec chmod 644 {} +
chown -R "$(stat -c '%u:%g' "$html_dir/themes/tenant")" "$stage"
if command -v restorecon >/dev/null; then restorecon -R "$stage"; fi
if [[ -d "$theme_dir" ]]; then
  mv -- "$theme_dir" "$backup_dir/akz"
  previous=true
fi
mv -- "$stage" "$theme_dir"
deployed=true
if [[ $activate == true ]]; then
  sqlite3 "$settings_db" "BEGIN IMMEDIATE; UPDATE settings SET value='en' WHERE key='language'; UPDATE settings SET value='akz' WHERE key='theme'; COMMIT;"
fi
printf '1.0.0\n' > "$state_dir/managed"
chmod 600 "$state_dir/managed"
trap - EXIT
printf '%s\n' 'AKZ theme installed successfully.'
if [[ $activate == true ]]; then
  echo 'English and the AKZ theme are selected. Sign out, sign in again, and reload the page.'
else
  echo 'To activate in English, run this installer again with --activate.'
fi
printf 'Previous settings: %s/restore-settings.sql\n' "$state_dir"
echo 'No telephony, network, user permissions, or third-party modules were changed.'
