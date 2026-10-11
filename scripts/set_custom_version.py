#!/usr/bin/env python3
from pathlib import Path
import re
import sys
import xml.etree.ElementTree as ET

if len(sys.argv) != 3:
    raise SystemExit("Usage: set_custom_version.py /path/to/upstream VERSION")

root = Path(sys.argv[1])
version = sys.argv[2]

props = root / "Directory.Build.props"
tree = ET.parse(props)
xml_root = tree.getroot()
for tag in ("Version", "AssemblyVersion", "FileVersion"):
    node = xml_root.find(f".//{tag}")
    if node is None:
        raise SystemExit(f"Missing {tag} in {props}")
    node.text = version
ET.indent(tree, space="  ")
tree.write(props, encoding="utf-8", xml_declaration=False)

build_yaml = root / "build.yaml"
text = build_yaml.read_text(encoding="utf-8")
text, count = re.subn(r'(?m)^version:\s*"[^"]+"\s*$', f'version: "{version}"', text, count=1)
if count != 1:
    raise SystemExit(f"Could not update exactly one version in {build_yaml}")
build_yaml.write_text(text, encoding="utf-8")

print(f"Set custom plugin version to {version}")
