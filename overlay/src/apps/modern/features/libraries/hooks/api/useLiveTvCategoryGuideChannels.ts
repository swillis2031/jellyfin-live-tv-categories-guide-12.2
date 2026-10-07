import type { Api } from '@jellyfin/sdk';
import type { AxiosRequestConfig } from 'axios';
import { useQuery } from '@tanstack/react-query';

import { type JellyfinApiContext, useApi } from 'hooks/useApi';
import type { ItemDtoQueryResult } from 'types/base/models/item-dto-query-result';

const PAGE_SIZE = 250;
const STALE_TIME = 5 * 60 * 1000;

const getRequestConfig = (
    api: Api,
    options: AxiosRequestConfig
): AxiosRequestConfig => ({
    ...(api.configuration.baseOptions as AxiosRequestConfig | undefined),
    ...options
});

const fetchPage = async (
    { api, user }: JellyfinApiContext,
    categoryId: string,
    startIndex: number,
    signal: AbortSignal
): Promise<ItemDtoQueryResult> => {
    if (!api || !user?.Id) {
        throw new Error('A Jellyfin API session is required');
    }

    const response = await api.axiosInstance.get<ItemDtoQueryResult>(
        api.getUri(`/LiveTvCategories/${encodeURIComponent(categoryId)}/Channels`),
        getRequestConfig(api, {
            params: {
                userId: user.Id,
                startIndex,
                limit: PAGE_SIZE,
                addCurrentProgram: false
            },
            signal
        })
    );

    if (
        !response.data
        || !Array.isArray(response.data.Items)
        || !Number.isInteger(response.data.TotalRecordCount)
        || (response.data.TotalRecordCount ?? -1) < 0
    ) {
        throw new TypeError('Live TV category channel response is invalid');
    }

    return response.data;
};

const fetchAllPages = async (
    currentApi: JellyfinApiContext,
    categoryId: string,
    signal: AbortSignal
): Promise<ItemDtoQueryResult> => {
    const items: NonNullable<ItemDtoQueryResult['Items']> = [];
    let startIndex = 0;
    let totalRecordCount = Number.MAX_SAFE_INTEGER;

    while (startIndex < totalRecordCount) {
        const page = await fetchPage(currentApi, categoryId, startIndex, signal);
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
