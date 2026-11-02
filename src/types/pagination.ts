export interface PaginatedResult<T> {
  itemList: T[];
  totalItemCount: number;
  currentPage: number;
  pageSize: number;
  totalPageCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
