// Keep the original category name for matching; shorten only its display label.
export const getLiveTvCategoryLabel = (name: string): string =>
    name.replace(/^\d+(?:\.\d+)*-/, '');
