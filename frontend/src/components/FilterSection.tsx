import React from "react";
import { Space, Select, DatePicker, Button } from "antd";

const { RangePicker } = DatePicker;
const { Option } = Select;

interface Product {
  _id: string;
  productName: string;
}

interface FilterSectionProps {
  onFilterChange: (value: string | undefined) => void;
  onDateChange: (dates: [string | null, string | null] | null) => void;
  productsData: Product[];
}

const FilterSection: React.FC<FilterSectionProps> = ({
  onFilterChange,
  onDateChange,
  productsData,
}) => (
  <div className="filter-section">
    <Space>
      Filter by Name:
      <Select
        onChange={onFilterChange}
        showSearch
        placeholder="Select Product"
        optionFilterProp="children"
        style={{ width: 200 }}
      >
        <Option key={"None"} value={undefined}>
          None
        </Option>

        {productsData.map((productDetail) => (
          <Option key={productDetail._id} value={productDetail._id}>
            {productDetail.productName}
          </Option>
        ))}
      </Select>
    </Space>

    <Space>
      Filter by Date:
      <RangePicker onChange={(dates) => onDateChange(dates ? dates.map((date) => date?.format("YYYY-MM-DD") || null) as [string | null, string | null] : null)} />
      <Button type="primary" onClick={() => onDateChange(null)}>
        Submit
      </Button>
    </Space>
  </div>
);

export default FilterSection;
