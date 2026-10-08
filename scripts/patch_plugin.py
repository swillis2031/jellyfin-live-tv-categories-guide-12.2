#!/usr/bin/env python3
from pathlib import Path
import sys

if len(sys.argv) != 2:
    raise SystemExit("Usage: patch_plugin.py /path/to/plugin-source")

root = Path(sys.argv[1])

def replace_exact(path: Path, old: str, new: str, expected_count: int = 1) -> None:
    text = path.read_text(encoding="utf-8")
    count = text.count(old)
    if count != expected_count:
        raise SystemExit(
            f"Safety check failed for {path}: expected {expected_count} occurrence(s) of {old!r}, found {count}"
        )
    path.write_text(text.replace(old, new), encoding="utf-8")

replace_exact(
    root / "Jellyfin.Plugin.LiveTvCategories/Jellyfin.Plugin.LiveTvCategories.csproj",
    'Version="12.1.0"',
    'Version="12.2.0"',
    expected_count=2,
)

replace_exact(
    root / "Jellyfin.Plugin.LiveTvCategories/WebClient/PluginWebClientStartupFilter.cs",
    "new(12, 1, 0, 0)",
    "new(12, 2, 0, 0)",
)

props = root / "Directory.Build.props"
text = props.read_text(encoding="utf-8")
for tag in ("Version", "AssemblyVersion", "FileVersion"):
    old = f"<{tag}>0.4.0.0</{tag}>"
    new = f"<{tag}>0.4.3.0</{tag}>"
    if text.count(old) != 1:
        raise SystemExit(f"Safety check failed for {props}: expected exactly one {old}")
    text = text.replace(old, new)
props.write_text(text, encoding="utf-8")

replace_exact(root / "build.yaml", 'version: "0.4.0.0"', 'version: "0.4.3.0"')
replace_exact(root / "build.yaml", 'targetAbi: "12.1.0.0"', 'targetAbi: "12.2.0.0"')

print("Patched plugin source for Jellyfin 12.2 and version 0.4.3.0")
