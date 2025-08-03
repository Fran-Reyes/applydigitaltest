export type Paginated<T> = {
  page: number;
  limit: number;
  total: number;
  items: T[];
};
