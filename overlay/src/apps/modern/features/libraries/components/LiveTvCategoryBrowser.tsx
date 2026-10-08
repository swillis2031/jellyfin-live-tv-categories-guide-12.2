import type { SvgIconComponent } from '@mui/icons-material';
import Apps from '@mui/icons-material/Apps';
import Article from '@mui/icons-material/Article';
import ChevronRight from '@mui/icons-material/ChevronRight';
import ChildCare from '@mui/icons-material/ChildCare';
import ExpandMore from '@mui/icons-material/ExpandMore';
import LiveTv from '@mui/icons-material/LiveTv';
import Movie from '@mui/icons-material/Movie';
import MoreHoriz from '@mui/icons-material/MoreHoriz';
import MusicNote from '@mui/icons-material/MusicNote';
import SportsSoccer from '@mui/icons-material/SportsSoccer';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Collapse from '@mui/material/Collapse';
import Typography from '@mui/material/Typography';
import React, { type FC, useCallback, useMemo, useState } from 'react';

import globalize from 'lib/globalize';
import liveTvCategoryGroupConfig from '../utils/liveTvCategoryGroups.generated';
import { getLiveTvCategoryLabel } from '../utils/liveTvCategoryLabel';

import './liveTvCategoryBrowser.scss';

export interface LiveTvBrowserCategory {
    id: string;
    name: string;
    channelCount: number | null;
}

interface LiveTvCategoryBrowserProps {
    heading: string;
    subheading: string;
    categories: LiveTvBrowserCategory[];
    allChannels: LiveTvBrowserCategory;
    onSelectAllChannels: () => void;
    onSelectCategory: (categoryId: string) => void;
    storageKey: string;
    loadError?: boolean;
}

interface ResolvedGroup {
    name: string;
    icon: string;
    categories: LiveTvBrowserCategory[];
    channelCount: number;
}

const normalise = (value: string) => value.trim().toLocaleLowerCase();

const getCategoryIcon = (category: LiveTvBrowserCategory): SvgIconComponent => {
    const name = category.name.toUpperCase();

    if (/SPORT|F1|MOTOGP|FIFA|NFL|NHL|NBA|MLB|MLS|CRICKET|OLYMPIC/.test(name)) {
        return SportsSoccer;
    }

    if (/KIDS|CHILD|FAMILY|FAMIL|ENFANT|COCUK|FEMIJET/.test(name)) {
        return ChildCare;
    }

    if (/CINEMA|MOVIE|FILM|SINEMA/.test(name)) return Movie;
    if (/MUSIC|MUZIK|MUZIKE|RADIO|RADIOFONO/.test(name)) return MusicNote;
    if (/NEWS|INFORMATION|HABER|LAJME/.test(name)) return Article;

    return LiveTv;
};

const getGroupIcon = (icon: string): SvgIconComponent => {
    switch (icon.toLowerCase()) {
        case 'sports':
            return SportsSoccer;
        case 'entertainment':
            return Movie;
        case 'general':
            return LiveTv;
        case 'other':
            return MoreHoriz;
        default:
            return Apps;
    }
};

const loadOpenGroups = (storageKey: string): string[] => {
    const defaults = liveTvCategoryGroupConfig.settings.default_open;

    if (!liveTvCategoryGroupConfig.settings.remember_open_state) {
        return defaults;
    }

    try {
        const raw = window.localStorage.getItem(storageKey);
        if (!raw) return defaults;

        const parsed = JSON.parse(raw);
        return Array.isArray(parsed)
            ? parsed.filter((value): value is string => typeof value === 'string')
            : defaults;
    } catch {
        return defaults;
    }
};

interface CategoryTileProps {
    category: LiveTvBrowserCategory;
    onSelect: () => void;
    allChannels?: boolean;
}

const CategoryTile: FC<CategoryTileProps> = ({
    category,
    onSelect,
    allChannels = false
}) => {
    const Icon = allChannels ? Apps : getCategoryIcon(category);
    const label = allChannels ? category.name : getLiveTvCategoryLabel(category.name);

    const countText = category.channelCount === null
        ? globalize.translate('AllChannels')
        : `${category.channelCount.toLocaleString()} ${globalize.translate('Channels')}`;

    return (
        <ButtonBase
            type='button'
            className={`liveTvCategoryCard${allChannels ? ' liveTvCategoryCard-all' : ''}`}
            aria-label={`${label}, ${countText}`}
            onClick={onSelect}
        >
            <span className='liveTvCategoryCardIcon'>
                <Icon aria-hidden />
            </span>

            <span className='liveTvCategoryCardText'>
                <span className='liveTvCategoryCardTitle'>{label}</span>
                <span className='liveTvCategoryCardCount'>{countText}</span>
            </span>

            <ChevronRight className='liveTvCategoryCardArrow' aria-hidden />
        </ButtonBase>
    );
};

const LiveTvCategoryBrowser: FC<LiveTvCategoryBrowserProps> = ({
    heading,
    subheading,
    categories,
    allChannels,
    onSelectAllChannels,
    onSelectCategory,
    storageKey,
    loadError = false
}) => {
    const [ openGroups, setOpenGroups ] = useState<string[]>(
        () => loadOpenGroups(storageKey)
    );

    const resolvedGroups = useMemo<ResolvedGroup[]>(() => {
        const categoryByName = new Map(
            categories.map(category => [ normalise(category.name), category ])
        );
        const mappedNames = new Set<string>();

        const groups: ResolvedGroup[] = liveTvCategoryGroupConfig.groups.map(group => {
            const groupCategories = group.categories
                .map(name => {
                    mappedNames.add(normalise(name));
                    return categoryByName.get(normalise(name));
                })
                .filter((category): category is LiveTvBrowserCategory => !!category);

            return {
                name: group.name,
                icon: group.icon,
                categories: groupCategories,
                channelCount: groupCategories.reduce(
                    (total, category) => total + (category.channelCount ?? 0),
                    0
                )
            };
        });

        if (liveTvCategoryGroupConfig.settings.show_uncategorised) {
            const uncategorised = categories.filter(
                category => !mappedNames.has(normalise(category.name))
            );

            if (uncategorised.length > 0) {
                groups.push({
                    name: 'Uncategorised',
                    icon: 'other',
                    categories: uncategorised,
                    channelCount: uncategorised.reduce(
                        (total, category) => total + (category.channelCount ?? 0),
                        0
                    )
                });
            }
        }

        return groups;
    }, [ categories ]);

    const totalChannels = categories.reduce(
        (total, category) => total + (category.channelCount ?? 0),
        0
    );

    const toggleGroup = useCallback((groupName: string) => {
        setOpenGroups(current => {
            const isOpen = current.includes(groupName);
            const next = liveTvCategoryGroupConfig.settings.single_open
                ? (isOpen ? [] : [ groupName ])
                : (
                    isOpen
                        ? current.filter(name => name !== groupName)
                        : [ ...current, groupName ]
                );

            if (liveTvCategoryGroupConfig.settings.remember_open_state) {
                try {
                    window.localStorage.setItem(storageKey, JSON.stringify(next));
                } catch {
                    // localStorage may be unavailable in privacy-restricted clients.
                }
            }

            return next;
        });
    }, [ storageKey ]);

    return (
        <Box className='padded-bottom-page liveTvCategoryBrowser'>
            <Box className='liveTvCategoryHero'>
                <Box>
                    <Typography component='h1' variant='h4'>
                        {heading}
                    </Typography>
                    <Typography className='liveTvCategoryHeroSubtitle'>
                        {subheading}
                    </Typography>
                </Box>

                <Typography
                    component='span'
                    role='status'
                    aria-live='polite'
                    className='liveTvCategoryHeroCount'
                >
                    {categories.length.toLocaleString()} categories · {totalChannels.toLocaleString()} channels
                </Typography>
            </Box>

            {loadError && (
                <Alert severity='warning' className='liveTvCategoryAlert'>
                    Live TV categories could not be loaded. All Channels is still available.
                </Alert>
            )}

            {!loadError && categories.length === 0 && (
                <Alert severity='info' className='liveTvCategoryAlert'>
                    No Live TV categories are available.
                </Alert>
            )}

            <Box className='liveTvAllChannelsWrap'>
                <CategoryTile
                    category={allChannels}
                    allChannels
                    onSelect={onSelectAllChannels}
                />
            </Box>

            <Box className='liveTvCategoryGroupList'>
                {resolvedGroups.map(group => {
                    const isOpen = openGroups.includes(group.name);
                    const GroupIcon = getGroupIcon(group.icon);

                    return (
                        <Box className='liveTvCategoryGroup' key={group.name}>
                            <ButtonBase
                                type='button'
                                className='liveTvCategoryGroupHeader'
                                aria-expanded={isOpen}
                                onClick={() => toggleGroup(group.name)}
                            >
                                <span className='liveTvCategoryGroupIcon'>
                                    <GroupIcon aria-hidden />
                                </span>

                                <span className='liveTvCategoryGroupText'>
                                    <span className='liveTvCategoryGroupTitle'>
                                        {group.name}
                                    </span>
                                    <span className='liveTvCategoryGroupMeta'>
                                        {group.categories.length.toLocaleString()} categories
                                        {liveTvCategoryGroupConfig.settings.show_group_channel_counts
                                            ? ` · ${group.channelCount.toLocaleString()} channels`
                                            : ''}
                                    </span>
                                </span>

                                <ExpandMore
                                    className={`liveTvCategoryGroupChevron${isOpen ? ' is-open' : ''}`}
                                    aria-hidden
                                />
                            </ButtonBase>

                            <Collapse
                                in={isOpen}
                                timeout={220}
                                unmountOnExit
                            >
                                <Box className='liveTvCategoryChildren'>
                                    {group.categories.map(category => (
                                        <CategoryTile
                                            key={category.id}
                                            category={category}
                                            onSelect={() => onSelectCategory(category.id)}
                                        />
                                    ))}
                                </Box>
                            </Collapse>
                        </Box>
                    );
                })}
            </Box>
        </Box>
    );
};

export default LiveTvCategoryBrowser;
