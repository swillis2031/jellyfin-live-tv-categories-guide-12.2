#!/usr/bin/env python3
"""Verify the label formatter and its display wiring in the assembled Web source."""
from pathlib import Path
import re
import sys

root = Path(sys.argv[1])
base = root / "src/apps/modern/features/libraries"
helper = (base / "utils/liveTvCategoryLabel.ts").read_text(encoding="utf-8")
match = re.search(r"name\.replace\(/(.+)/, ''\)", helper)
if not match:
    raise SystemExit("Category label formatter is missing or has an unexpected form")

examples = {
    "1-General": "General",
    "2.1-TNT Sports": "TNT Sports",
    "2.0-Sky/TNT Sports": "Sky/TNT Sports",
    "9-Catch-up": "Catch-up",
    "9-Regional": "Regional",
    "General": "General",
}
for original, expected in examples.items():
    if re.sub(match[1], "", original) != expected:
        raise SystemExit(f"Unexpected display label for {original!r}")

browser = (base / "components/LiveTvCategoryBrowser.tsx").read_text(encoding="utf-8")
for required in (
    "import { getLiveTvCategoryLabel }",
    "getLiveTvCategoryLabel(category.name)",
    "<span className='liveTvCategoryCardTitle'>{label}</span>",
    "aria-label={`${label}, ${countText}`}",
):
    if required not in browser:
        raise SystemExit(f"Category browser label wiring missing: {required}")
guide = (base / "components/GuideView.tsx").read_text(encoding="utf-8")
if "data-guide-category={getLiveTvCategoryLabel(" not in guide:
    raise SystemExit("Guide category label wiring missing")
print("Category display labels verified in assembled Web source")
