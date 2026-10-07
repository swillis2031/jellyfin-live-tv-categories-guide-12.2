#!/usr/bin/env python3
from pathlib import Path
import sys

if len(sys.argv) != 2:
    raise SystemExit("Usage: patch_guide_modern.py /path/to/jellyfin-web")

root = Path(sys.argv[1])
guide_js = root / "src/components/guide/guide.js"

def replace_once(path: Path, old: str, new: str) -> None:
    text = path.read_text(encoding="utf-8")
    count = text.count(old)
    if count != 1:
        raise SystemExit(
            f"Safety check failed for {path}: expected exactly one patch target, found {count}"
        )
    path.write_text(text.replace(old, new, 1), encoding="utf-8")

# Load our CSS after Jellyfin's normal Guide/Programs CSS so these are deliberate overrides.
replace_once(
    guide_js,
    "import './programs.scss';\n",
    "import './programs.scss';\nimport './category-modern.scss';\n",
)

# Guarantee the XMLTV/Jellyfin programme overview is available for the tooltip.
replace_once(
    guide_js,
    "            const programFields = [];\n",
    "            const programFields = ['Overview'];\n",
)

# Multiple requested ItemFields must be comma separated.
replace_once(
    guide_js,
    "                programQuery.Fields = programFields.join('');\n",
    "                programQuery.Fields = programFields.join(',');\n",
)

# Add safe data attributes used by the fixed tooltip.
replace_once(
    guide_js,
    "            const isAttribute = endPercent >= 2 ? ' is=\"emby-programcell\"' : '';\n",
    """            const tooltipTitle = program.Name || '';
            const tooltipOverview = program.Overview || program.EpisodeTitle || '';
            const tooltipTime = getDisplayTime(program.StartDateLocal) + ' – ' + getDisplayTime(program.EndDateLocal);
            const tooltipAttributes =
                ' data-guide-title="' + escapeHtml(tooltipTitle) + '"' +
                ' data-guide-overview="' + escapeHtml(tooltipOverview) + '"' +
                ' data-guide-time="' + escapeHtml(tooltipTime) + '"';

            const isAttribute = endPercent >= 2 ? ' is="emby-programcell"' : '';
""",
)

replace_once(
    guide_js,
    """            html += '<button' + isAttribute + ' data-action="' + clickAction + '"' + timerAttributes + ' data-channelid="' + program.ChannelId + '" data-id="' + program.Id + '" data-serverid="' + program.ServerId + '" data-startdate="' + program.StartDate + '" data-enddate="' + program.EndDate + '" data-type="' + program.Type + '" class="' + cssClass + '" style="left:' + startPercent + '%;width:' + endPercent + '%;">';
""",
    """            html += '<button' + isAttribute + tooltipAttributes + ' data-action="' + clickAction + '"' + timerAttributes + ' data-channelid="' + program.ChannelId + '" data-id="' + program.Id + '" data-serverid="' + program.ServerId + '" data-startdate="' + program.StartDate + '" data-enddate="' + program.EndDate + '" data-type="' + program.Type + '" class="' + cssClass + '" style="left:calc(' + startPercent + '% + 1px);width:calc(' + endPercent + '% - 2px);">';
""",
)

# Scope the visual redesign to this Guide only.
replace_once(
    guide_js,
    "    guideContext.classList.add('tvguide');\n",
    "    guideContext.classList.add('tvguide', 'modernCategoryGuide');\n",
)

# Install one delegated tooltip handler for the whole Guide.
replace_once(
    guide_js,
    """    const programGrid = guideContext.querySelector('.programGrid');
    const timeslotHeaders = guideContext.querySelector('.timeslotHeaders');
""",
    """    const programGrid = guideContext.querySelector('.programGrid');
    const timeslotHeaders = guideContext.querySelector('.timeslotHeaders');

    const modernGuideTooltip = document.createElement('div');
    modernGuideTooltip.className = 'modernGuideTooltip';
    modernGuideTooltip.hidden = true;

    const modernGuideTooltipTitle = document.createElement('div');
    modernGuideTooltipTitle.className = 'modernGuideTooltip-title';

    const modernGuideTooltipOverview = document.createElement('div');
    modernGuideTooltipOverview.className = 'modernGuideTooltip-overview';

    const modernGuideTooltipTime = document.createElement('div');
    modernGuideTooltipTime.className = 'modernGuideTooltip-time';

    modernGuideTooltip.append(
        modernGuideTooltipTitle,
        modernGuideTooltipOverview,
        modernGuideTooltipTime
    );
    document.body.appendChild(modernGuideTooltip);

    let modernGuideTooltipHideTimer;

    const hideModernGuideTooltip = () => {
        clearTimeout(modernGuideTooltipHideTimer);
        modernGuideTooltip.classList.remove('show');
        modernGuideTooltip.hidden = true;
    };

    const showModernGuideTooltip = cell => {
        if (!cell) return;

        clearTimeout(modernGuideTooltipHideTimer);

        const title = cell.getAttribute('data-guide-title') || '';
        const overview = cell.getAttribute('data-guide-overview') || '';
        const time = cell.getAttribute('data-guide-time') || '';

        if (!title && !overview && !time) {
            hideModernGuideTooltip();
            return;
        }

        modernGuideTooltipTitle.textContent = title;
        modernGuideTooltipOverview.textContent = overview;
        modernGuideTooltipOverview.hidden = !overview;
        modernGuideTooltipTime.textContent = time;
        modernGuideTooltipTime.hidden = !time;

        modernGuideTooltip.hidden = false;
        modernGuideTooltip.classList.add('show');

        const anchorRect = cell.getBoundingClientRect();
        const tooltipRect = modernGuideTooltip.getBoundingClientRect();
        const margin = 10;

        let x = anchorRect.left;
        let y = anchorRect.top - tooltipRect.height - 8;

        if (y < margin) {
            y = anchorRect.bottom + 8;
        }

        x = Math.max(
            margin,
            Math.min(x, window.innerWidth - tooltipRect.width - margin)
        );

        y = Math.max(
            margin,
            Math.min(y, window.innerHeight - tooltipRect.height - margin)
        );

        modernGuideTooltip.style.left = Math.round(x) + 'px';
        modernGuideTooltip.style.top = Math.round(y) + 'px';
    };

    const onModernGuideMouseOver = event => {
        const cell = dom.parentWithClass(event.target, 'programCell');
        if (cell) {
            showModernGuideTooltip(cell);
        }
    };

    const onModernGuideMouseOut = event => {
        const cell = dom.parentWithClass(event.target, 'programCell');
        if (!cell) return;

        const related = event.relatedTarget;
        if (related && cell.contains(related)) return;

        modernGuideTooltipHideTimer = setTimeout(hideModernGuideTooltip, 45);
    };

    const onModernGuideFocusIn = event => {
        const cell = dom.parentWithClass(event.target, 'programCell');
        if (cell) {
            showModernGuideTooltip(cell);
        }
    };

    const onModernGuideFocusOut = event => {
        const cell = dom.parentWithClass(event.target, 'programCell');
        if (cell) {
            hideModernGuideTooltip();
        }
    };

    guideContext.addEventListener('mouseover', onModernGuideMouseOver);
    guideContext.addEventListener('mouseout', onModernGuideMouseOut);
    guideContext.addEventListener('focusin', onModernGuideFocusIn);
    guideContext.addEventListener('focusout', onModernGuideFocusOut);
    programGrid.addEventListener('scroll', hideModernGuideTooltip, { passive: true });

    self._modernGuideTooltipCleanup = () => {
        clearTimeout(modernGuideTooltipHideTimer);
        guideContext.removeEventListener('mouseover', onModernGuideMouseOver);
        guideContext.removeEventListener('mouseout', onModernGuideMouseOut);
        guideContext.removeEventListener('focusin', onModernGuideFocusIn);
        guideContext.removeEventListener('focusout', onModernGuideFocusOut);
        programGrid.removeEventListener('scroll', hideModernGuideTooltip);
        modernGuideTooltip.remove();
        self._modernGuideTooltipCleanup = null;
    };
""",
)

# Clean up body tooltip/listeners when the Guide instance is destroyed.
replace_once(
    guide_js,
    """        setScrollEvents(options.element, false);
        itemShortcuts.off(options.element);
        items = {};
""",
    """        setScrollEvents(options.element, false);
        itemShortcuts.off(options.element);
        if (self._modernGuideTooltipCleanup) {
            self._modernGuideTooltipCleanup();
        }
        items = {};
""",
)

print("Applied modern Guide styling and programme hover/focus tooltips")
