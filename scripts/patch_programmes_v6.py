#!/usr/bin/env python3
from pathlib import Path
import sys

if len(sys.argv) != 2:
    raise SystemExit("Usage: patch_programmes_v6.py /path/to/jellyfin-web")

root = Path(sys.argv[1])
path = root / "src/apps/modern/features/libraries/components/LiveTvCategoriesView.tsx"
text = path.read_text(encoding="utf-8")

browser_import = "import LiveTvCategoryBrowser from './LiveTvCategoryBrowser';\n"
if browser_import not in text:
    marker = "import React, { type FC, useCallback, useEffect, useMemo, useRef } from 'react';\n"
    if marker not in text:
        raise SystemExit("Could not find v6 React import marker in LiveTvCategoriesView.tsx")
    text = text.replace(marker, marker + "\n" + browser_import, 1)

label_import = "import { getLiveTvCategoryLabel } from '../utils/liveTvCategoryLabel';\n"
if label_import not in text:
    marker = "} from '../utils/liveTvCategoryNavigation';\n"
    if marker not in text:
        raise SystemExit("Could not find v6 navigation import marker in LiveTvCategoriesView.tsx")
    text = text.replace(marker, marker + label_import, 1)

start_marker = "    if (!categoryId) {"
end_marker = "    const items = channelsQuery.data?.Items ?? [];"
start = text.find(start_marker)
end = text.find(end_marker, start)
if start == -1 or end == -1:
    raise SystemExit(
        "Could not find the v6 Programmes category landing block. "
        "Upstream LiveTvCategoriesView.tsx has changed; stop rather than applying a blind patch."
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
                    storageKey='live-tv-programmes-top-category-groups-v2'
                    loadError={categoriesQuery.isError}
                />
            </Box>
        );
    }

"""
text = text[:start] + replacement + text[end:]

old_heading = """                <Typography component='h1' variant='h5'>
                    {selectedCategory?.name ?? globalize.translate('Channels')}
                </Typography>
"""
new_heading = """                <Typography component='h1' variant='h5'>
                    {getLiveTvCategoryLabel(selectedCategory?.name ?? globalize.translate('Channels'))}
                </Typography>
"""
count = text.count(old_heading)
if count != 1:
    raise SystemExit(
        f"Expected exactly one v6 selected-category heading, found {count}. "
        "Upstream changed; stop rather than applying a blind patch."
    )
text = text.replace(old_heading, new_heading, 1)

path.write_text(text, encoding="utf-8")
print("Patched upstream v6 Programmes view with custom grouped category browser")
