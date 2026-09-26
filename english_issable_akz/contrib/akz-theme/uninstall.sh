#!/usr/bin/env bash
# Restore the saved selection and archive the optional theme.
set -euo pipefail
[[ ${1:-} != --help && ${1:-} != -h ]] || {
  echo 'Usage: sudo bash contrib/akz-theme/uninstall.sh'; exit 0;
}
[[ $# -eq 0 ]] || { echo 'No options are accepted.' >&2; exit 1; }
[[ $EUID -eq 0 ]] || { echo 'Run this command as root.' >&2; exit 1; }
for command_name in sqlite3 flock readlink mv; do
  command -v "$command_name" >/dev/null || { printf 'Missing command: %s\n' "$command_name" >&2; exit 1; }
done
state_dir=/var/lib/issabel/akz-theme
theme_dir=/var/www/html/themes/akz
settings_db=/var/www/db/settings.db
[[ ! -L "$state_dir" && ! -L "$theme_dir" ]] || { echo 'Refusing a symbolic-link destination.' >&2; exit 1; }
[[ $(readlink -f /var/www/html/themes) == /var/www/html/themes ]] || { echo 'Unsupported themes path.' >&2; exit 1; }
[[ -f "$state_dir/managed" && -s "$state_dir/restore-settings.sql" ]] || {
  echo 'No managed installation was found. No changes were made.' >&2; exit 1;
}
exec 9>"$state_dir/install.lock"
flock -n 9 || { echo 'Another theme operation is running.' >&2; exit 1; }
if [[ $(sqlite3 "$settings_db" "SELECT value FROM settings WHERE key='theme';") == akz ]]; then
  sqlite3 "$settings_db" < "$state_dir/restore-settings.sql"
fi
archive_dir="$state_dir/uninstalled-$(date -u +%Y%m%dT%H%M%SZ)-$$"
mkdir -m 700 "$archive_dir"
if [[ -d "$theme_dir" ]]; then mv -- "$theme_dir" "$archive_dir/akz"; fi
mv -- "$state_dir/managed" "$state_dir/restore-settings.sql" "$archive_dir/"
echo 'The AKZ theme was archived. The saved settings were restored if it was active.'
printf 'Archive: %s\n' "$archive_dir"
echo 'Sign out and sign in again to use the selected theme.'
