# 0.4.2.1 quick fix

This build fixes two issues found in the first 0.4.2.0 modern-guide test:

1. Channel/logo rows drifting out of alignment with programme rows.
2. Channel logos looking muted/washed out against the new dark card background.

The functional category filtering and tooltip code is otherwise unchanged.

# Live TV Categories — Jellyfin 12.2 + Modern Filtered Guide (0.4.2.1)

This is the next build of the category-filtered Guide work.

It retains the existing category picker and filtered native Jellyfin EPG, then adds a visual layer inspired by the supplied Home Assistant `epg-card.js`:

- larger and clearer channel logos
- rounded channel and programme surfaces
- softer borders and shadows
- slightly taller/less cramped rows
- subtle hover/focus lift animation
- stronger current-program highlight
- rounded date controls
- a fixed programme tooltip showing title, XMLTV/Jellyfin description and time

The Guide remains Jellyfin's native Guide. Playback, programme dialogs, DVR controls,
date handling and EPG loading remain Jellyfin functionality.

## Upgrade path

Build this repository with GitHub Actions exactly like the previous 0.4.1.0 builder.
The generated package is version **0.4.2.1**, so Jellyfin should offer it as an upgrade.

Repository URL after a successful build:

`https://github.com/YOUR-USERNAME/YOUR-REPOSITORY/releases/latest/download/manifest.json`

After installing:

1. Restart Jellyfin.
2. Hard refresh the browser (`Ctrl+Shift+R`).
3. If the old JavaScript/CSS is still cached, clear site data for the Jellyfin host and log in again.

## Rollback

If you dislike the redesign, uninstall 0.4.2.1 and reinstall your working 0.4.1.0
build from the previous repository, then restart Jellyfin and hard refresh.

## Styling location

The visual rules are isolated in:

`overlay/src/components/guide/category-modern.scss`

So visual tweaks can be made without rewriting the category filtering logic.

The tooltip/metadata wiring is isolated in:

`scripts/patch_guide_modern.py`

# Live TV Categories — Jellyfin 12.2 + Category-filtered Guide

This is a small builder/overlay repository for an **unofficial temporary** Jellyfin 12.2 build of JeKaQM's Live TV Categories plugin.

It preserves the existing category-first **Programmes** page and adds the same idea to **Live TV → Guide**:

1. Open Guide.
2. Choose an M3U `group-title` category such as `2.0-Sky Sports` or `6-Movies`.
3. Jellyfin's normal Guide opens with only that category's channels.
4. The normal programme grid, playback and DVR behavior remain Jellyfin-native.
5. Use the new back arrow in the Guide header to return to categories.
6. `All Channels` opens the normal unfiltered Guide.

## Build

1. Put this repository on GitHub as a **public** repository.
2. Open **Actions**.
3. Run **Build Live TV Categories 12.2 + Filtered Guide**.
4. If the workflow is green, GitHub creates a Release with the plugin ZIP and `manifest.json`.

## Jellyfin repository URL

After a successful build, add this URL to Jellyfin Plugins → Repositories:

`https://github.com/YOUR-USERNAME/YOUR-REPOSITORY/releases/latest/download/manifest.json`

Then run Jellyfin's **Update Plugins** scheduled task, install version **0.4.1.0**, restart Jellyfin, and hard-refresh the browser.

## Important safety behavior

The workflow deliberately verifies the three Jellyfin Web files that the upstream 12.1 overlay replaces. If Jellyfin Web 12.2 differs there, the workflow stops instead of blindly applying an unsafe patch.

If it stops, send the failed GitHub Actions step back to ChatGPT and the overlay can be ported against the actual 12.2 file.

## Rollback

If this custom build misbehaves:

1. Uninstall Live TV Categories 0.4.1.0.
2. Restart Jellyfin.
3. Re-enable your previously-working 0.4.0.1 repository/build.
4. Install 0.4.0.1.
5. Restart Jellyfin.
6. Hard-refresh/clear Jellyfin site data if the old Web bundle is cached.

The plugin serves its own Web bundle from the plugin directory; it does not permanently overwrite Jellyfin's stock Web installation.
