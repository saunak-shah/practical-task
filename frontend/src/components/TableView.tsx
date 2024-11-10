import { Card, Table } from "antd";
import React from "react";
import { pageSize } from "../global/constant";
import type { TableProps } from "antd";

// Define the types for the props
interface TableViewProps {
  data: any[]; // Adjust to the specific type of your data items if known
  columns: TableProps<any>["columns"];
  loading: boolean;
  currentPage: number;
  totalCount: number;
  setSortField: (field: string) => void;
  setSortOrder: (order: "asc" | "desc") => void;
  setOffset: (offset: number) => void;
  setCurrentPage: (page: number) => void;
  fetchData: (offset: number, pageSize: number) => void;
}

const TableView: React.FC<TableViewProps> = ({
  data,
  columns,
  loading,
  currentPage,
  totalCount,
  setSortField,
  setSortOrder,
  setOffset,
  setCurrentPage,
  fetchData,
}) => {
  const handleChange: TableProps<any>["onChange"] = (pagination, filters, sorter) => {

    const singleSorter = Array.isArray(sorter) ? sorter[0] : sorter;
    console.log("singleSorter.order", singleSorter.order)

    if (singleSorter && singleSorter.field) {
        setSortField(singleSorter.field as string);
        setSortOrder(singleSorter.order === "ascend" ? "asc" : "desc");
    }

    // Use the imported `pageSize` as the default value if `pagination.pageSize` is undefined
    const current = pagination.current || 1;
    const effectivePageSize = pagination.pageSize || pageSize;

    const newOffset = (current - 1) * effectivePageSize;
    setOffset(newOffset);
    setCurrentPage(current);
    fetchData(newOffset, effectivePageSize);
};

  return (
    <Card>
      <Table
        dataSource={data}
        columns={columns}
        bordered={true}
        onChange={handleChange}
        loading={loading}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: totalCount,
        }}
      />
    </Card>
  );
};

export default TableView;
