import { useQuery } from '@tanstack/react-query';

import { useApi } from '../../utils/liveTvJellyfinAdapter';
import { fetchLiveTvCategoryChannels } from '../../utils/liveTvCategoriesApi';
import type { JellyfinApiContext } from '../../utils/liveTvJellyfinAdapter';
import type { ItemDtoQueryResult } from 'types/base/models/item-dto-query-result';

const PAGE_SIZE = 250;
const STALE_TIME = 5 * 60 * 1000;

const fetchAllPages = async (
    currentApi: JellyfinApiContext,
    categoryId: string,
    signal: AbortSignal
): Promise<ItemDtoQueryResult> => {
    const items: NonNullable<ItemDtoQueryResult['Items']> = [];
    let startIndex = 0;
    let totalRecordCount = Number.MAX_SAFE_INTEGER;

    while (startIndex < totalRecordCount) {
        const page = await fetchLiveTvCategoryChannels(
            currentApi,
            categoryId,
            startIndex,
            PAGE_SIZE,
            signal
        );
        const pageItems = page.Items ?? [];

        items.push(...pageItems);
        totalRecordCount = page.TotalRecordCount ?? items.length;

        if (pageItems.length === 0) break;
        startIndex += pageItems.length;
    }

    return {
        Items: items,
        TotalRecordCount: items.length
    };
};

export const useLiveTvCategoryGuideChannels = (categoryId: string | null) => {
    const currentApi = useApi();

    return useQuery({
        queryKey: [
            'LiveTvCategories',
            currentApi.api?.basePath,
            currentApi.user?.Id,
            categoryId,
            'GuideChannels'
        ],
        queryFn: ({ signal }) => fetchAllPages(currentApi, categoryId!, signal),
        enabled: !!currentApi.api && !!currentApi.user?.Id && !!categoryId,
        staleTime: STALE_TIME,
        refetchOnWindowFocus: false
    });
};
