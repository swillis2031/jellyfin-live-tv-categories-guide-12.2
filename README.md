# 0.4.3.2 — channel-logo restore + theme-stable Guide rows

This build addresses the two issues seen while switching Jellyfin skins/themes:

1. Channel logos disappearing.
2. Fixed channel rows drifting out of alignment with programme rows on
   ElegantFin, NeutralFin, NetFin and similar themes.

Root causes:
- an earlier broad `> * { position: relative; }` rule could override Jellyfin's
  absolutely-positioned `.guideChannelImage`;
- third-party themes can alter font/spacing/cell geometry differently between
  the fixed channel column and programme grid.

Fix:
- restore `.guideChannelImage` to explicit absolute positioning while preserving
  Jellyfin's own inline `background-image` URL;
- use one fixed 72px row metric for BOTH `.guide-channelHeaderCell` and
  `.channelPrograms`;
- reset only row geometry with tightly-scoped `!important` rules;
- draw visual channel-card padding inside the row so it never changes layout;
- use pixel programme insets rather than `em`, avoiding font-size dependent
  vertical drift.

The overrides are scoped to `.tvguide.modernCategoryGuide`; other Jellyfin pages
remain theme-controlled.


# 0.4.3.2 — accordion UX + Material/glass polish

Changes:
- optional single-open accordion mode (enabled by default)
- more compact/fluid Material-like category browser
- active accordion header has a subtle tonal highlight and accent rail
- fluid child tile grid via CSS `auto-fit/minmax`
- smaller, cleaner icons/cards
- improved hover/focus motion
- All Channels becomes a full-width quick action
- all landing-page styling remains shared by Programmes and Guide

## DevTools class → source file

If Chrome DevTools shows generated classes such as `css-hkx3jt`, IGNORE them.
Those are runtime MUI-generated class names and can change every build.

Use the stable classes beside them:

- `.liveTvCategoryBrowser`
- `.liveTvCategoryHero`
- `.liveTvCategoryHeroCount`
- `.liveTvAllChannelsWrap`
- `.liveTvCategoryCard`
- `.liveTvCategoryCard-all`
- `.liveTvCategoryCardIcon`
- `.liveTvCategoryCardTitle`
- `.liveTvCategoryCardCount`
- `.liveTvCategoryGroup`
- `.liveTvCategoryGroupHeader`
- `.liveTvCategoryGroupIcon`
- `.liveTvCategoryGroupTitle`
- `.liveTvCategoryGroupMeta`
- `.liveTvCategoryGroupChevron`
- `.liveTvCategoryChildren`

They are all styled in:

`overlay/src/apps/modern/features/libraries/components/liveTvCategoryBrowser.scss`

The markup/behaviour for those classes is in:

`overlay/src/apps/modern/features/libraries/components/LiveTvCategoryBrowser.tsx`

The editable category mapping/behaviour settings are in:

`config/category-groups.json`

To permit multiple accordion sections open at once, set:

`"single_open": false`

To restore single-open behaviour:

`"single_open": true`


# 0.4.3.2 — editable top-level category accordions

This build adds the requested two-level category hierarchy to BOTH:

- Live TV → Programmes
- Live TV → Guide

The existing Jellyfin/Dispatcharr categories are not changed. They are simply
grouped visually under collapsible top-level sections.

## The one file you edit later

`config/category-groups.json`

Initial mapping:

- General
  - 1-General
  - 1.1-Entertainment & Lifestyle
  - 4-Nature & Documentary
- Sports
  - 2.0-Sky Sports
  - 2.1-TNT Sports
  - 2.2-EPL Sports
  - 2.4-NFL Sports
  - 2.9-Other Sports
- Entertainment
  - 3-Music & Radio
  - 6-Movies
- Other
  - 7-Kids & Family
  - 8.1-Shopping

If Jellyfin reports a category that is not present in the mapping, it is placed
under an automatic `Uncategorised` accordion rather than disappearing.

## Behaviour settings

The same JSON file contains:

- `default_open`: top groups opened on first use
- `remember_open_state`: save expanded/collapsed groups in browser localStorage
- `show_uncategorised`: show categories you have not mapped yet
- `show_group_channel_counts`: show total channel count in each top group

The build validates the JSON and refuses to build if a child category is mapped
to two different parent groups.

## Updating the mapping later

1. Edit only `config/category-groups.json` in VS Code.
2. Save it.
3. Source Control → Commit.
4. Sync/Push.
5. Run the same GitHub Action.
6. Update the plugin in Jellyfin.

No React/TypeScript editing is needed just to move categories between groups.


# 0.4.3.2 — responsive row-alignment fix

This confirms the row drift was not mainly the theme. Jellyfin renders the
fixed channel/logo column and programme grid as separate vertical stacks.

Previous styling changed the outer channel cells' height/margins. That can
appear correct at one viewport and drift at another.

0.4.3.2 leaves Jellyfin's native row geometry untouched. The glass/padded
channel card is now drawn inside the native cell using a pseudo-element, so
its visual spacing cannot alter row alignment.

The 0.4.2.2 programme gaps, tooltip styling and category glass styling remain.

# 0.4.3.2 — glass/polish pass

This build adds:

- semi-transparent glass/gradient category tiles and category header
- true 2px separation between adjacent programme cells
- hover lift without horizontal scaling/overlap
- channel cards inset vertically to visually match programme cards while preserving exact row alignment
- softer glass-style programme tooltip with larger radius and accent strip

# 0.4.3.2 quick fix

This build fixes two issues found in the first 0.4.2.0 modern-guide test:

1. Channel/logo rows drifting out of alignment with programme rows.
2. Channel logos looking muted/washed out against the new dark card background.

The functional category filtering and tooltip code is otherwise unchanged.

# Live TV Categories — Jellyfin 12.2 + Modern Filtered Guide (0.4.3.2)

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
The generated package is version **0.4.3.2**, so Jellyfin should offer it as an upgrade.

Repository URL after a successful build:

`https://github.com/YOUR-USERNAME/YOUR-REPOSITORY/releases/latest/download/manifest.json`

After installing:

1. Restart Jellyfin.
2. Hard refresh the browser (`Ctrl+Shift+R`).
3. If the old JavaScript/CSS is still cached, clear site data for the Jellyfin host and log in again.

## Rollback

If you dislike the redesign, uninstall 0.4.3.2 and reinstall your working 0.4.1.0
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
