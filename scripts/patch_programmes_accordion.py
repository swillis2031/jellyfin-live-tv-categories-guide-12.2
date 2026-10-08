#!/usr/bin/env python3
from pathlib import Path
import sys

if len(sys.argv) != 2:
    raise SystemExit("Usage: patch_programmes_accordion.py /path/to/jellyfin-web")

root = Path(sys.argv[1])
path = root / "src/apps/modern/features/libraries/components/LiveTvCategoriesView.tsx"
text = path.read_text(encoding="utf-8")

import_marker = "import Loading from 'components/loading/LoadingComponent';\n"
if import_marker not in text:
    raise SystemExit("Could not find LiveTvCategoriesView import marker")

if "import LiveTvCategoryBrowser from './LiveTvCategoryBrowser';" not in text:
    text = text.replace(
        import_marker,
        import_marker + "import LiveTvCategoryBrowser from './LiveTvCategoryBrowser';\n",
        1
    )

start_marker = "    if (!categoryId) {"
end_marker = "    const items = channelsQuery.data?.Items ?? [];"

start = text.find(start_marker)
end = text.find(end_marker, start)

if start == -1 or end == -1:
    raise SystemExit(
        "Could not find the Programmes category landing block. "
        "Upstream LiveTvCategoriesView.tsx has changed."
    )

replacement = r"""    if (!categoryId) {
        if (categoriesQuery.isPending) return <Loading />;

        const totalChannels = categories.reduce(
            (total, category) => total + category.channelCount,
            0
        );

        return (
            <Box ref={contentRef}>
                <LiveTvCategoryBrowser
                    heading={`Browse ${globalize.translate('LiveTV')}`}
                    subheading='Choose a category to see its channels.'
                    categories={categories}
                    allChannels={{
                        id: ALL_CHANNELS_ID,
                        name: globalize.translate('AllChannels'),
                        channelCount: totalChannels
                    }}
                    onSelectAllChannels={showAllChannels}
                    onSelectCategory={selectCategory}
                    storageKey='live-tv-programmes-top-category-groups-v1'
                    loadError={categoriesQuery.isError}
                />
            </Box>
        );
    }

"""

text = text[:start] + replacement + text[end:]
path.write_text(text, encoding="utf-8")
print("Patched Programmes landing screen to use the shared top-level accordion browser")
