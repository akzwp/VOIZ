# Submitting the English theme to Issabel

## Destination and proposed scope

The appropriate starting repository for the main web theme is [IssabelFoundation/framework](https://github.com/IssabelFoundation/framework). Its default branch was `master` when inspected on 2026-09-21. The inspected revision was `8f0a6f3045cf1608d294036b77aa5e0f3c66cabc`.

The first proposed change is an **optional new `akz` theme**, together with its editable source and build instructions. Keep the default theme unchanged. Changes to IssabelPBX application files would belong to [IssabelFoundation/issabelPBX](https://github.com/IssabelFoundation/issabelPBX) and should be proposed separately; this package does not overwrite them.

No `CONTRIBUTING` file or pull-request template was found in the inspected framework tree. Check the current repository and any organization guidance again before opening a pull request. The workflow below is a recommendation, not a promise of acceptance or a statement of maintainer policy.

## 1. Agree on the proposal

Open an issue or discussion from your own GitHub account describing the optional English theme, its screenshots, compatibility goals, and maintenance plan. Ask whether maintainers prefer a new theme, improvements to `tenant`, or a separate theme package. The name, asset layout, and branding may need adjustment based on their feedback.

## 2. Fork and create a branch

Fork the official framework repository into your own account using GitHub's **Fork** button. Do not initialize an unrelated repository and try to merge its entire history into Issabel.

Using Git Bash on Windows, or a Linux terminal, replace `YOUR-GITHUB-USERNAME` with your actual account name:

```sh
git clone https://github.com/YOUR-GITHUB-USERNAME/framework.git
cd framework
git remote add upstream https://github.com/IssabelFoundation/framework.git
git fetch upstream
git switch -c codex/english-akz-theme upstream/master
```

## 3. Copy only the contribution directories

From this package into the cloned fork, copy:

| Package path | Same path in the framework fork |
| --- | --- |
| `framework/html/themes/akz/` | `framework/html/themes/akz/` |
| `contrib/akz-theme/` | `contrib/akz-theme/` |

Do not overwrite the framework's root README, LICENSE, `.gitignore`, or Git history with this package's root files. The contribution directory includes its own notices and a copy of the license text for the additional files. Do not add ZIP archives, caches, `node_modules`, server backups, databases, or credentials.

The official RPM specification enumerates installed theme files. Adding a directory alone does not establish that a new theme will be included in the released RPM. Agree on packaging with the maintainers and update `issabel-framework.spec` and its `%files` sections in the fork if they request inclusion. This standalone export intentionally does not guess or overwrite their release specification.

## 4. Provide actual validation evidence

This export was prepared without browser, installation, application, or automated tests, as requested. Before marking the PR ready, perform your own checks on a disposable Issabel installation and record the exact Issabel, PHP, browser, and screen-size versions.

Suggested evidence for a theme contribution:

- Installation, activation, update, and rollback; the current theme and language are restored correctly.
- Login and logout, password change, keyboard navigation, dialog focus, and light/dark mode.
- Desktop and narrow-screen views of the dashboard, PBX settings, contacts, hardware detection, call reports, recordings, phone provisioning, and GeoIP tooltips.
- Gregorian calendar navigation, event creation, all-day/multi-day entries, and readable date numbers.
- Existing permissions, form submissions, and telephony behavior continue to work.

Attach real before/after screenshots to the PR. Do not claim checks passed until you have run them. Inspect the changes for accidental assets, unrelated modifications, and broken paths.

## 5. Commit and push from your own account

Keep the commit message focused on the resulting behavior:

```sh
git add framework/html/themes/akz contrib/akz-theme
git commit -m "Add optional English LTR AKZ theme"
git push -u origin codex/english-akz-theme
```

On GitHub, create a **draft pull request** with:

- Base repository: `IssabelFoundation/framework`.
- Base branch: the current branch requested by maintainers, normally the default branch.
- Head repository: your fork.
- Compare branch: `codex/english-akz-theme`.

Use [PULL_REQUEST.md](PULL_REQUEST.md) as the starting description, replacing its validation status with your actual results. Explain the additive theme scope, include screenshots, and call out packaging work still under discussion. Respond to review comments in the same branch. A successful push publishes your branch; only the maintainers can approve and merge the contribution.

## References

- [Issabel framework and source layout](https://github.com/IssabelFoundation/framework)
- [Framework RPM specification](https://github.com/IssabelFoundation/framework/blob/master/issabel-framework.spec)
- [GitHub: contributing to a project through a fork and pull request](https://docs.github.com/en/get-started/exploring-projects-on-github/contributing-to-a-project)
