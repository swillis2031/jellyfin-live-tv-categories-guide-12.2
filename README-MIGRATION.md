# v6 rebase kit — exact instructions

This kit replaces the old 0.4-era build logic with a v6-first build.

## What it does

1. Pins JeKaQM upstream to v0.6.0.0 / commit `8792acda...`.
2. Pins Jellyfin Web to the exact 12.2 commit required by upstream v6.
3. Runs upstream v6's own `prepare-jellyfin-web.sh` first.
4. Applies only the custom layer afterwards:
   - editable parent category hierarchy;
   - clean display labels;
   - grouped Programmes landing page;
   - category-filtered native Guide;
   - modern Guide styling/tooltips.
5. Builds/tests the upstream v6 server plugin.
6. Packages with upstream v6's catalog builder, preserving the standalone browser.

## Upload/replace these files on branch `v6-rebase`

Replace:
- `.github/workflows/build.yml`
- `scripts/patch_programmes_accordion.py` (delete it; v6 uses `patch_programmes_v6.py`)
- `overlay/src/apps/modern/features/libraries/components/GuideView.tsx`
- `overlay/src/apps/modern/features/libraries/hooks/api/useLiveTvCategoryGuideChannels.ts`

Add:
- `upstream.lock.json`
- `scripts/patch_programmes_v6.py`
- `scripts/set_custom_version.py`
- `scripts/verify_v6_customizations.py`

Keep (the kit also contains known-good copies):
- `config/category-groups.json`
- `scripts/generate_category_groups.py`
- `scripts/patch_guide.py`
- `scripts/patch_guide_modern.py`
- `scripts/check_category_labels.py`
- `overlay/src/apps/modern/features/libraries/components/LiveTvCategoryBrowser.tsx`
- `overlay/src/apps/modern/features/libraries/components/liveTvCategoryBrowser.scss`
- `overlay/src/apps/modern/features/libraries/utils/liveTvCategoryLabel.ts`
- `overlay/src/components/guide/category-modern.scss`

Old files no longer used and safe to delete after the new build succeeds:
- `scripts/patch_plugin.py`
- `scripts/patch_programmes_accordion.py`

## Then

Run the GitHub Action named:

`Build Live TV Categories v6 + Modern Filtered Guide`

on branch `v6-rebase`.

Do not install the plugin until this workflow is green and the release is `0.6.0.1`.
