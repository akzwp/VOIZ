# AKZ theme development

The runtime directory is `../../framework/html/themes/akz` relative to this directory. Keep both directories in the same checkout.

## Installation on Issabel

From the repository root, run `sudo bash contrib/akz-theme/install.sh --activate` to install the optional theme and select English. Omit `--activate` to preserve the current theme and language. The script requires the existing standard Issabel layout and does not install additional applications or alter telephony/network settings.

Run `sudo bash contrib/akz-theme/uninstall.sh` to archive the installed theme and restore the saved selection if `akz` is still active. Previous selections and asset backups are kept in `/var/lib/issabel/akz-theme` with access restricted to root. Sign out and sign in after changing the selected theme.

## Editing and building

```sh
cd contrib/akz-theme
npm ci --ignore-scripts
npm run build:css
```

Source CSS lives in `ui/`; `ui/akz-theme.css` is the entry point. The output is `../../framework/html/themes/akz/css/akz-tailwind.css`. Tailwind preflight is disabled to preserve legacy widget behavior. Commit the source and compiled CSS together. The server uses prebuilt files and does not need Node.js.

JavaScript lives in the runtime theme's `js/akz-ui.js` and `js/akz-embedded.js`. English labels and Gregorian widget defaults are defined there. Stock framework localization supplies module labels. The runtime helpers do not translate or rewrite user data.

## Contribution scope

This is an additive English/LTR theme. The framework default theme, PBX application files, authentication handlers, menu authorization, and module backends remain unchanged. The optional installation script changes the selected theme/language only when explicitly activated.

No browser, automated, installation, application, or compatibility tests were run while preparing this export. Validate on a disposable server and document the actual environment before requesting upstream approval. The upstream release specification must be reviewed separately with maintainers before including this theme in an RPM release.

## Notices

See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) and [LICENSES](LICENSES). Preserve file-level copyright and license notices when redistributing or contributing these files.
