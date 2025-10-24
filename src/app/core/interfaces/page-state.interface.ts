export interface PageState {
  page: number;
  size: number;
  search?: string;
  filters?: Record<string, any>;
  sort?: {
    field: string;
    direction: 1 | -1;
  };
}