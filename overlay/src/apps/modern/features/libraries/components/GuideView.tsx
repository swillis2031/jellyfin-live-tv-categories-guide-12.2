import type { SvgIconComponent } from '@mui/icons-material';
import Apps from '@mui/icons-material/Apps';
import Article from '@mui/icons-material/Article';
import ChevronRight from '@mui/icons-material/ChevronRight';
import ChildCare from '@mui/icons-material/ChildCare';
import LiveTv from '@mui/icons-material/LiveTv';
import Movie from '@mui/icons-material/Movie';
import MusicNote from '@mui/icons-material/MusicNote';
import SportsSoccer from '@mui/icons-material/SportsSoccer';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import React, { type FC, useCallback, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';

import Guide from 'components/guide/guide';
import Loading from 'components/loading/LoadingComponent';
import globalize from 'lib/globalize';

import { useLiveTvCategories } from '../hooks/api/useLiveTvCategories';
import { useLiveTvCategoryGuideChannels } from '../hooks/api/useLiveTvCategoryGuideChannels';
import type { LiveTvCategorySummary } from '../utils/liveTvCategories';

import 'material-design-icons-iconfont';
import 'elements/emby-programcell/emby-programcell';
import 'elements/emby-button/emby-button';
import 'elements/emby-button/paper-icon-button-light';
import 'elements/emby-tabs/emby-tabs';
import 'elements/emby-scroller/emby-scroller';
import 'components/guide/guide.scss';
import 'components/guide/programs.scss';
import 'styles/scrollstyles.scss';
import 'styles/flexstyles.scss';

const ALL_CHANNELS_ID = 'all-channels';
const GUIDE_CATEGORY_PARAM = 'guideCategoryId';

interface CategoryEntry extends Omit<LiveTvCategorySummary, 'channelCount'> {
    channelCount: number | null;
}

interface CategoryTileProps {
    category: CategoryEntry;
    onSelect: (categoryId: string) => void;
}

const getCategoryIcon = (category: CategoryEntry): SvgIconComponent => {
    if (category.id === ALL_CHANNELS_ID) return Apps;

    const name = category.name.toUpperCase();
    if (/SPORT|F1|MOTOGP|FIFA|NFL|NHL|NBA|MLB|MLS|CRICKET|OLYMPIC/.test(name)) return SportsSoccer;
    if (/KIDS|CHILD|FAMILY|FAMIL|ENFANT|COCUK|FEMIJET/.test(name)) return ChildCare;
    if (/CINEMA|MOVIE|FILM|SINEMA/.test(name)) return Movie;
    if (/MUSIC|MUZIK|MUZIKE|RADIO|RADIOFONO/.test(name)) return MusicNote;
    if (/NEWS|INFORMATION|HABER|LAJME/.test(name)) return Article;

    return LiveTv;
};

const CategoryTile: FC<CategoryTileProps> = ({ category, onSelect }) => {
    const Icon = getCategoryIcon(category);
    const handleClick = useCallback(() => onSelect(category.id), [ category.id, onSelect ]);
    const channelText = category.channelCount === null
        ? globalize.translate('AllChannels')
        : `${category.channelCount.toLocaleString()} ${globalize.translate('Channels')}`;

    return (
        <Paper
            elevation={3}
            sx={{
                flex: {
                    xs: '1 1 calc(100% - 16px)',
                    sm: '1 1 calc(50% - 16px)',
                    md: '1 1 calc(33.333% - 16px)',
                    lg: '1 1 calc(25% - 16px)'
                },
                margin: 1,
                maxWidth: {
                    xs: 'calc(100% - 16px)',
                    sm: 'calc(50% - 16px)',
                    md: 'calc(33.333% - 16px)',
                    lg: 'calc(25% - 16px)'
                },
                minWidth: 0,
                overflow: 'visible'
            }}
        >
            <ButtonBase
                type='button'
                aria-label={`${category.name}, ${channelText}`}
                onClick={handleClick}
                sx={{
                    alignItems: 'center',
                    background: category.id === ALL_CHANNELS_ID
                        ? 'linear-gradient(135deg, rgba(0, 164, 220, 0.30), rgba(112, 68, 184, 0.23))'
                        : 'linear-gradient(145deg, rgba(128, 128, 128, 0.17), rgba(128, 128, 128, 0.07))',
                    border: '1px solid',
                    borderColor: category.id === ALL_CHANNELS_ID
                        ? 'rgba(0, 164, 220, 0.52)'
                        : 'rgba(128, 128, 128, 0.28)',
                    borderRadius: 1,
                    color: 'inherit',
                    display: 'flex',
                    justifyContent: 'flex-start',
                    minHeight: { xs: '5.5rem', sm: '6.4rem' },
                    padding: 2,
                    textAlign: 'left',
                    transition: 'transform 160ms ease, box-shadow 160ms ease',
                    width: '100%',
                    '& > * + *': { marginLeft: 1.5 },
                    '[dir="rtl"] & > * + *': { marginLeft: 0, marginRight: 1.5 },
                    '&:hover': { boxShadow: 6, transform: 'translateY(-0.15rem) scale(1.01)' },
                    '&:focus, &:focus-visible': {
                        boxShadow: 6,
                        outline: '0.2rem solid',
                        outlineColor: 'primary.main',
                        outlineOffset: '0.12rem',
                        transform: 'translateY(-0.15rem) scale(1.01)'
                    },
                    '@media (prefers-reduced-motion: reduce)': {
                        transition: 'none',
                        '&:hover, &:focus, &:focus-visible': { transform: 'none' }
                    }
                }}
            >
                <Box
                    sx={{
                        alignItems: 'center',
                        alignSelf: 'stretch',
                        backgroundColor: 'primary.main',
                        borderRadius: 1,
                        color: 'primary.contrastText',
                        display: 'flex',
                        flex: '0 0 3.2rem',
                        justifyContent: 'center',
                        minHeight: '3.2rem'
                    }}
                >
                    <Icon aria-hidden sx={{ fontSize: '2rem' }} />
                </Box>

                <Box sx={{ flex: '1 1 auto', minWidth: 0 }}>
                    <Typography
                        component='span'
                        sx={{
                            display: '-webkit-box',
                            fontWeight: 700,
                            lineHeight: 1.25,
                            overflow: 'hidden',
                            WebkitBoxOrient: 'vertical',
                            WebkitLineClamp: 2
                        }}
                    >
                        {category.name}
                    </Typography>
                    <Typography
                        component='span'
                        variant='body2'
                        sx={{
                            display: 'block',
                            marginTop: 0.5,
                            opacity: 0.72,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        {channelText}
                    </Typography>
                </Box>

                <ChevronRight aria-hidden sx={{ flex: '0 0 auto', opacity: 0.6 }} />
            </ButtonBase>
        </Paper>
    );
};

const GuideView: FC = () => {
    const [ searchParams, setSearchParams ] = useSearchParams();
    const categoryId = searchParams.get(GUIDE_CATEGORY_PARAM);
    const categoriesQuery = useLiveTvCategories();
    const categories = categoriesQuery.data ?? [];

    const requestedCategoryId = categoryId && categoryId !== ALL_CHANNELS_ID
        ? categoryId
        : null;
    const channelsQuery = useLiveTvCategoryGuideChannels(requestedCategoryId);

    const guideInstance = useRef<Guide | null>(null);
    const tvGuideContainerRef = useRef<HTMLDivElement>(null);

    const totalChannels = useMemo(
        () => categories.reduce((total, category) => total + category.channelCount, 0),
        [ categories ]
    );

    const selectedCategory = categoryId === ALL_CHANNELS_ID
        ? { id: ALL_CHANNELS_ID, name: globalize.translate('AllChannels'), channelCount: totalChannels }
        : categories.find(category => category.id === categoryId);

    const selectCategory = useCallback((selectedCategoryId: string) => {
        const nextParams = new URLSearchParams(searchParams);
        nextParams.delete('categoryId');
        nextParams.delete('categoryStartIndex');
        nextParams.set(GUIDE_CATEGORY_PARAM, selectedCategoryId);
        setSearchParams(nextParams);
    }, [ searchParams, setSearchParams ]);

    const returnToCategories = useCallback(() => {
        const nextParams = new URLSearchParams(searchParams);
        nextParams.delete(GUIDE_CATEGORY_PARAM);
        setSearchParams(nextParams);
    }, [ searchParams, setSearchParams ]);

    const suppliedChannels = categoryId === ALL_CHANNELS_ID
        ? undefined
        : channelsQuery.data?.Items;

    const guideReady = categoryId === ALL_CHANNELS_ID
        || (channelsQuery.isSuccess && (suppliedChannels?.length ?? 0) > 0);

    useEffect(() => {
        if (!categoryId || !guideReady) return;

        const element = tvGuideContainerRef.current;
        if (!element) return;

        if (guideInstance.current) {
            guideInstance.current.destroy();
            guideInstance.current = null;
        }

        element.innerHTML = '';

        const instance = new Guide({
            element,
            serverId: window.ApiClient.serverId(),
            channels: suppliedChannels,
            onCategories: returnToCategories
        });

        guideInstance.current = instance;

        return () => {
            instance.destroy();
            if (guideInstance.current === instance) guideInstance.current = null;
            element.innerHTML = '';
        };
    }, [ categoryId, guideReady, returnToCategories, suppliedChannels ]);

    if (!categoryId) {
        if (categoriesQuery.isPending) return <Loading />;

        const allChannels: CategoryEntry = {
            id: ALL_CHANNELS_ID,
            name: globalize.translate('AllChannels'),
            channelCount: null
        };

        return (
            <Box className='padded-bottom-page' sx={{ paddingTop: 2 }}>
                <Box
                    className='padded-left padded-right'
                    sx={{
                        alignItems: { xs: 'flex-start', sm: 'center' },
                        background: 'linear-gradient(125deg, rgba(0, 164, 220, 0.24), rgba(112, 68, 184, 0.16))',
                        border: '1px solid rgba(128, 128, 128, 0.26)',
                        borderRadius: 2,
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        justifyContent: 'space-between',
                        marginBottom: 2,
                        marginLeft: '3.3%',
                        marginRight: '3.3%',
                        minHeight: '6rem',
                        paddingBottom: 2,
                        paddingTop: 2
                    }}
                >
                    <Box>
                        <Typography component='h1' variant='h4'>Browse Guide</Typography>
                        <Typography sx={{ marginTop: 0.5, opacity: 0.72 }}>
                            Choose a category to see only those channels in the EPG.
                        </Typography>
                    </Box>
                    <Typography
                        role='status'
                        aria-live='polite'
                        sx={{
                            backgroundColor: 'rgba(0, 0, 0, 0.2)',
                            border: '1px solid rgba(255, 255, 255, 0.12)',
                            borderRadius: 10,
                            fontWeight: 600,
                            marginLeft: { xs: 0, sm: 2 },
                            marginTop: { xs: 2, sm: 0 },
                            padding: '0.65rem 1rem',
                            whiteSpace: 'nowrap',
                            '[dir="rtl"] &': { marginLeft: 0, marginRight: { xs: 0, sm: 2 } }
                        }}
                    >
                        {categories.length.toLocaleString()} categories · {totalChannels.toLocaleString()} channels
                    </Typography>
                </Box>

                {categoriesQuery.isError && (
                    <Alert severity='warning' className='padded-left padded-right'>
                        Live TV categories could not be loaded. All Channels is still available.
                    </Alert>
                )}

                {!categoriesQuery.isError && categories.length === 0 && (
                    <Alert severity='info' className='padded-left padded-right'>
                        No Live TV categories are available.
                    </Alert>
                )}

                <Box sx={{ display: 'flex', flexWrap: 'wrap', margin: '0 calc(3.3% - 8px)' }}>
                    <CategoryTile category={allChannels} onSelect={selectCategory} />
                    {categories.map(category => (
                        <CategoryTile key={category.id} category={category} onSelect={selectCategory} />
                    ))}
                </Box>
            </Box>
        );
    }

    if (categoryId !== ALL_CHANNELS_ID && categoriesQuery.isSuccess && !selectedCategory) {
        return (
            <Box className='padded-left padded-right' sx={{ paddingTop: 2 }}>
                <Alert severity='error'>That Live TV category no longer exists.</Alert>
                <ButtonBase onClick={returnToCategories} sx={{ marginTop: 2, padding: 1.5 }}>
                    Back to Guide categories
                </ButtonBase>
            </Box>
        );
    }

    if (categoryId !== ALL_CHANNELS_ID && channelsQuery.isPending) return <Loading />;

    if (categoryId !== ALL_CHANNELS_ID && channelsQuery.isError) {
        return (
            <Box className='padded-left padded-right' sx={{ paddingTop: 2 }}>
                <Alert severity='error'>This category could not be loaded for the Guide.</Alert>
                <ButtonBase onClick={returnToCategories} sx={{ marginTop: 2, padding: 1.5 }}>
                    Back to Guide categories
                </ButtonBase>
            </Box>
        );
    }

    if (categoryId !== ALL_CHANNELS_ID && channelsQuery.isSuccess && !suppliedChannels?.length) {
        return (
            <Box className='padded-left padded-right' sx={{ paddingTop: 2 }}>
                <Alert severity='info'>This category currently contains no visible channels.</Alert>
                <ButtonBase onClick={returnToCategories} sx={{ marginTop: 2, padding: 1.5 }}>
                    Back to Guide categories
                </ButtonBase>
            </Box>
        );
    }

    return (
        <Box
            ref={tvGuideContainerRef}
            className='absolutePageTabContent'
            data-guide-category={selectedCategory?.name ?? globalize.translate('AllChannels')}
            sx={{
                display: 'flex !important',
                width: 'auto',
                paddingTop: '0',
                paddingBottom: '0 !important',
                top: '0 !important'
            }}
        />
    );
};

export default GuideView;
