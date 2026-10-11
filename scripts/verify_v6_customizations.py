#!/usr/bin/env python3
from pathlib import Path
import sys

if len(sys.argv) != 2:
    raise SystemExit("Usage: verify_v6_customizations.py /path/to/jellyfin-web")

root = Path(sys.argv[1])
checks = {
    "src/apps/modern/features/libraries/components/LiveTvCategoriesView.tsx": [
        "LiveTvCategoryBrowser",
        "live-tv-programmes-top-category-groups-v2",
        "getLiveTvCategoryLabel(selectedCategory?.name"
    ],
    "src/apps/modern/features/libraries/components/GuideView.tsx": [
        "LiveTvCategoryBrowser",
        "live-tv-guide-top-category-groups-v2",
        "useLiveTvCategoryGuideChannels",
        "data-guide-category={getLiveTvCategoryLabel("
    ],
    "src/apps/modern/features/libraries/hooks/api/useLiveTvCategoryGuideChannels.ts": [
        "fetchLiveTvCategoryChannels",
        "liveTvJellyfinAdapter",
        "GuideChannels"
    ],
    "src/apps/modern/features/libraries/utils/liveTvCategoriesApi.ts": [
        "fetchLiveTvCategoryChannels"
    ],
    "src/apps/modern/features/libraries/utils/liveTvJellyfinAdapter.ts": [
        "export { type JellyfinApiContext, useApi }"
    ],
    "src/apps/modern/features/libraries/utils/liveTvCategoryGroups.generated.ts": [
        '"Main Sports"',
        '"English Football"',
        '"Miscellaneous"'
    ],
    "src/components/guide/guide.js": [
        "Array.isArray(options.channels)",
        "btnGuideCategories",
        "category-modern.scss",
        "modernGuideTooltip"
    ],
    "src/components/guide/tvguide.template.html": [
        "btnGuideCategories"
    ]
}

for relative, needles in checks.items():
    path = root / relative
    if not path.is_file():
        raise SystemExit(f"Required assembled Web file is missing: {relative}")
    text = path.read_text(encoding="utf-8")
    for needle in needles:
        if needle not in text:
            raise SystemExit(f"Custom v6 verification failed: {relative} is missing {needle!r}")

print("Verified upstream v6 integration plus custom grouped Programmes + filtered Guide")
