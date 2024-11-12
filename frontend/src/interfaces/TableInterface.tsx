import { Product } from "../interfaces/ProductInterface";


export interface TableViewProps {
    data: Product[]; // Adjust to the specific type of your data items if known
    columns: Array<{ title: string; dataIndex: string; key: string; sorter?: boolean; render?: Function }>;
    loading: boolean;
    currentPage: number;
    totalCount: number;
    setSortField: (field: string) => void;
    setSortOrder: (order: "asc" | "desc") => void;
    setOffset: (offset: number) => void;
    setCurrentPage: (page: number) => void;
    fetchData: (offset: number, pageSize: number) => void;
  }