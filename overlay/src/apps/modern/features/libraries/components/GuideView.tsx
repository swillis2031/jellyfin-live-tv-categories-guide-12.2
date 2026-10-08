import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';
import React, { type FC, useCallback, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';

import Guide from 'components/guide/guide';
import Loading from 'components/loading/LoadingComponent';
import LiveTvCategoryBrowser from './LiveTvCategoryBrowser';
import globalize from 'lib/globalize';

import { useLiveTvCategories } from '../hooks/api/useLiveTvCategories';
import { useLiveTvCategoryGuideChannels } from '../hooks/api/useLiveTvCategoryGuideChannels';
import type { LiveTvCategorySummary } from '../utils/liveTvCategories';
import { getLiveTvCategoryLabel } from '../utils/liveTvCategoryLabel';

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

        return (
            <LiveTvCategoryBrowser
                heading='Browse Guide'
                subheading='Choose a category to see only those channels in the EPG.'
                categories={categories}
                allChannels={{
                    id: ALL_CHANNELS_ID,
                    name: globalize.translate('AllChannels'),
                    channelCount: totalChannels
                }}
                onSelectAllChannels={() => selectCategory(ALL_CHANNELS_ID)}
                onSelectCategory={selectCategory}
                storageKey='live-tv-guide-top-category-groups-v1'
                loadError={categoriesQuery.isError}
            />
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
            data-guide-category={getLiveTvCategoryLabel(selectedCategory?.name ?? globalize.translate('AllChannels'))}
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
