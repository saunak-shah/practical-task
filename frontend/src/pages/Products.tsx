import React, { useEffect, useState, useCallback } from "react";
import { DatePicker, Space, Button, Select, Modal, Form, message } from "antd";
import axios from "axios";
import { DeleteOutlined, PlusOutlined, EditOutlined } from "@ant-design/icons";
import TableView from "../components/TableView";
import { pageSize } from "../global/constant";
import AddProductForm from "../components/AddProductForm";
import DeleteModal from "../components/DeleteModal";
import { Dayjs } from "dayjs";
import "../css/Home.css";
import { Product } from "../interfaces/ProductInterface";

type DateRange = [Dayjs | null, Dayjs | null] | null;
const { RangePicker } = DatePicker;
const { Option } = Select;

const Products = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [sortField, setSortField] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUserCount, setTotalUserCount] = useState(0);
  const [offset, setOffset] = useState(0);
  const [dataToDelete, setDataToDelete] = useState<Product | {}>({});
  const [isDeleteModalVisible, setDeleteModalVisibility] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [isEdit, setIsEdit] = useState(false);
  const [dateRange, setDateRange] = useState<(string | null)[]>([]);
  const [selectedValue, setSelectedValue] = useState<string | undefined>();
  const [productsData, setProductData] = useState<Product[]>([]);
  const [form] = Form.useForm();
  const token = localStorage.getItem("token");
  const active = localStorage.getItem("active") === "true";

  const apiHost = process.env.REACT_APP_API_HOST;

  const fetchData = async (offset: number, limit: number, searchKey = null) => {
    setLoading(true);
    try {
      let apiUrl = `${apiHost}/api/products?limit=${limit}&offset=${offset}&sortBy=${sortField}&sortOrder=${sortOrder}`;

      if (dateRange.length === 2) {
        const [startDate, endDate] = dateRange;
        apiUrl += `&createdAtFrom=${startDate}&createdAtTo=${endDate}`;
      }
      if (selectedValue) apiUrl += `&productId=${selectedValue}`;

      const response = await axios.get(apiUrl, {
        headers: { "Content-Type": "application/json", Authorization: token },
      });
      const { products = [], pagination } = response.data;
      setProducts(products);
      setTotalUserCount(pagination?.totalItems || 0);
    } catch (error) {
      console.error("Error during API call:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchproductsData = async () => {
    try {
      const limit = 20;
      const offset = 0;
      const apiHost = process.env.REACT_APP_API_HOST;
      let apiUrl = `${apiHost}/api/products?limit=${limit}&offset=${offset}&filter_by=true`;

      if (selectedValue) {
        apiUrl += `&productId=${selectedValue}`;
      }

      let headers = {
        "Content-Type": "application/json",
        Authorization: token,
      };
      const response = await axios.get(apiUrl, { headers });

      if (response.data && response.data.products.length > 0) {
        setProductData(response.data.products);
      } else {
        setProductData([]);
      }
    } catch (error) {
      console.error("Error during API call:", error);
    } finally {
      setLoading(false);
    }
  };


  const handleDateChange = (dates: DateRange) => {
    setDateRange(dates ? dates.map(date => date?.format("YYYY-MM-DD") ?? null) : []);
  };

  const handleDelete = (record: Product) => {
    setDeleteModalVisibility(true);
    setDataToDelete(record);
  };

  const addProduct = useCallback(() => {
    form.resetFields();
    setCurrentProduct(null);
    setIsModalVisible(true);
    setIsEdit(false);
  }, [form]); // Only recreate this function if `form` changes

  const editProduct = (product: Product) => {
    setCurrentProduct(product);
    form.setFieldsValue(product);
    setIsModalVisible(true);
    setIsEdit(true);
  };

  const handleAddOrEditProduct = async (formData: FormData) => {
    setLoading(true);
    try {
      const apiHost = process.env.REACT_APP_API_HOST;
      const endpoint = isEdit
        ? `/api/products/update/${currentProduct?._id}`
        : "/api/products/create";
      if (isEdit && !formData.get("image")) formData.delete("image");

      const response = await axios({
        method: isEdit ? "put" : "post",
        url: `${apiHost}${endpoint}`,
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: token,
        },
      });

      message.success(`Product ${isEdit ? "updated" : "added"} successfully.`);
      fetchData(0, pageSize);
    } catch (error) {
      console.error("Error during product submission:", error);
      message.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
      setIsModalVisible(false);
    }
  };

  const deleteProduct = async () => {
    const apiHost = process.env.REACT_APP_API_HOST;
    const endpoint = `${apiHost}/api/products/delete/${(dataToDelete as Product)._id}`;

    try {
      await axios.delete(endpoint, {
        headers: { "Content-Type": "application/json", Authorization: token },
      });
      setDeleteModalVisibility(false);
      fetchData(offset, pageSize);
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const columns = [
    { title: "Product Name", dataIndex: "productName", key: "productName", sorter: true },
    { title: "Description", dataIndex: "productDesc", key: "productDesc", sorter: true },
    {
      title: "Status",
      key: "status",
      render: (_: any, record: any) => <span>{record.isDelete ? "Deleted" : "Active"}</span>,
    },
    {
      title: "Image",
      dataIndex: "imageURL",
      key: "imageURL",
      render: (url: string) => (
        <img
          src={url}
          alt="Product"
          style={{ width: "50px", height: "50px", objectFit: "cover", cursor: "pointer" }}
          onClick={() => window.open(url, "_blank")}
        />
      ),
    },
    ...(active
      ? [
          {
            title: "Action",
            key: "action",
            render: (_: any, record: Product) => (
              <Space>
                <Button icon={<EditOutlined />} onClick={() => editProduct(record)}>
                  Edit
                </Button>
                <Button danger icon={<DeleteOutlined />} onClick={() => handleDelete(record)}>
                  Delete
                </Button>
              </Space>
            ),
          },
        ]
      : [{ title: "User Name", dataIndex: "createdBy", key: "createdBy", sorter: true }]),
  ];

  useEffect(() => {
    fetchData(0, pageSize);
    if (!selectedValue) {
      fetchproductsData();
    }
  }, [selectedValue, sortField, sortOrder, dateRange]);

  return (
    <div className="main-container">
      {isDeleteModalVisible && (
        <DeleteModal
          visible={isDeleteModalVisible}
          onCancel={() => setDeleteModalVisibility(false)}
          onConfirm={deleteProduct}
        />
      )}
      <div className="filter-section">

        <Space>
        <Select
            onChange={setSelectedValue}
            showSearch
            placeholder="Select Product"
            value={selectedValue}
            style={{ width: 200 }}
          >
            <Option key="None" value={undefined}>
              None
            </Option>
            {productsData.map(({ _id, productName }) => (
              <Option key={_id} value={_id}>
                {productName}
              </Option>
            ))}
          </Select>
          <RangePicker onChange={handleDateChange} />
        </Space>
      </div>
      {active && (
        <Button type="primary" icon={<PlusOutlined />} onClick={addProduct}>
          Add Product
        </Button>
      )}
      <div className="table-container">
        <TableView
          data={products}
          columns={columns}
          loading={loading}
          currentPage={currentPage}
          totalCount={totalUserCount}
          setSortField={setSortField}
          setSortOrder={setSortOrder}
          setOffset={setOffset}
          setCurrentPage={setCurrentPage}
          fetchData={fetchData}
        />
      </div>
      {isModalVisible && (
        <AddProductForm
        form={form}
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onSubmit={handleAddOrEditProduct}
        initialData={currentProduct}
      />
      )}
      
    </div>
  );
};

export default Products;
