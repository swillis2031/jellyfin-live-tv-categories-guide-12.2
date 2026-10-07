#!/usr/bin/env python3
from pathlib import Path
import sys

if len(sys.argv) != 2:
    raise SystemExit("Usage: patch_guide.py /path/to/jellyfin-web")

root = Path(sys.argv[1])
guide_js = root / "src/components/guide/guide.js"
template = root / "src/components/guide/tvguide.template.html"

def replace_once(path: Path, old: str, new: str) -> None:
    text = path.read_text(encoding="utf-8")
    count = text.count(old)
    if count != 1:
        raise SystemExit(
            f"Safety check failed for {path}: expected exactly one patch target, found {count}"
        )
    path.write_text(text.replace(old, new, 1), encoding="utf-8")

# Jellyfin normally fetches every Live TV channel here. If the React Guide wrapper
# supplies options.channels, use that already-filtered list instead. The native
# Guide then builds /LiveTv/Programs channelIds from these rows as normal.
replace_once(
    guide_js,
    "        apiClient.getLiveTvChannels(channelQuery).then(function (channelsResult) {\n",
    """        const suppliedChannels = Array.isArray(options.channels) ? options.channels : null;
        const channelPromise = suppliedChannels
            ? Promise.resolve({
                Items: suppliedChannels.slice(
                    channelQuery.StartIndex,
                    channelQuery.StartIndex + channelLimit
                ),
                TotalRecordCount: suppliedChannels.length
            })
            : apiClient.getLiveTvChannels(channelQuery);

        channelPromise.then(function (channelsResult) {
""",
)

# Wire a back-to-category-picker control into the native Guide header.
replace_once(
    guide_js,
    """    guideContext.querySelector('.btnGuideViewSettings').addEventListener('click', function () {
        showViewSettings(self);
        restartAutoRefresh();
    });
""",
    """    guideContext.querySelector('.btnGuideViewSettings').addEventListener('click', function () {
        showViewSettings(self);
        restartAutoRefresh();
    });

    const btnGuideCategories = guideContext.querySelector('.btnGuideCategories');
    if (typeof options.onCategories === 'function') {
        btnGuideCategories.classList.remove('hide');
        btnGuideCategories.addEventListener('click', function () {
            options.onCategories();
        });
    }
""",
)

replace_once(
    template,
    """            <button is=\"paper-icon-button-light\" type=\"button\" class=\"btnGuideViewSettings\" title=\"${ButtonMore}\">
                <span class=\"material-icons btnGuideViewSettingsIcon more_vert\" aria-hidden=\"true\"></span>
            </button>
""",
    """            <button is=\"paper-icon-button-light\" type=\"button\" class=\"btnGuideCategories hide\" title=\"Back to Guide categories\">
                <span class=\"material-icons arrow_back\" aria-hidden=\"true\"></span>
            </button>
            <button is=\"paper-icon-button-light\" type=\"button\" class=\"btnGuideViewSettings\" title=\"${ButtonMore}\">
                <span class=\"material-icons btnGuideViewSettingsIcon more_vert\" aria-hidden=\"true\"></span>
            </button>
""",
)

print("Patched Jellyfin native Guide for supplied category channel lists")
