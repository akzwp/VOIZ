# Add an optional English LTR AKZ theme

This adds a separate `akz` theme for the Issabel web framework. It provides an English interface with a left sidebar, responsive navigation and search, light/dark appearances, consistent forms and tables, readable messages, and properly sized dialogs. The existing default theme is preserved.

The theme uses the framework's login, permissions, menu data, and module actions. Gregorian calendar styling retains space for date numbers above events. Embedded same-origin PBX pages inherit presentation styles while shown inside the theme; no PBX application files are replaced.

Editable CSS, a pinned Tailwind build, compiled assets, third-party notices, and optional installation/rollback scripts are included under `contrib/akz-theme`. Installation with `--activate` selects the theme and English, recording the previous selection for rollback.

## Validation

The distributable CSS was generated. No browser, installation, application, automated, or compatibility tests have been run for this export. The author must supply actual results, supported environment versions, and screenshots before marking this draft ready for review.

## Maintainer decisions

- Confirm the optional theme name and preferred contribution scope.
- Confirm the release/RPM packaging changes needed to ship the additional theme.
- Confirm the preferred presentation of attribution and bundled legacy assets.

This proposal does not change telephony configuration, network settings, user permissions, language packs, or the default theme for existing installations.
