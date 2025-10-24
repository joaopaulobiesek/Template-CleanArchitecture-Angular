export interface PaginatedList<T>
{
    data: T[];
    pageNumber: number;
    totalPages: number;
    totalItens: number;
    hasPagePrevious: boolean;
    hasNextPage: boolean;
    message: string;
    success: boolean;
}