export interface SearchParams {
  pageNumber: number;
  pageSize: number;
  src?: string; 
  columnName?: string;
  ascDes?: number;
  customFilter?: Record<string, any>;
}