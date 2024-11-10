import React, { useEffect, useState } from "react";
import { DatePicker, Space, Button, Select, Modal, Form, message } from "antd";
import axios from "axios";
import { DeleteOutlined, PlusOutlined, EditOutlined } from "@ant-design/icons";
import TableView from "../components/TableView";
import { pageSize } from "../global/constant";
import AddProductForm from "../components/AddProductForm";
import DeleteModal from "../components/DeleteModal";
import { Dayjs } from "dayjs";
import "../css/Home.css"; // Import the new CSS file

type DateRange = [Dayjs | null, Dayjs | null] | null;
const { RangePicker } = DatePicker;
const { Option } = Select;

const Products = () => {
  interface Product {
    _id: string;
    productName: string;
    productDesc: string;
    imageURL: string;
  }

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [sortField, setSortField] = useState("productID");
  const [sortOrder, setSortOrder] = useState("asc");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUserCount, setTotalUserCount] = useState(0);
  const [offset, setOffset] = useState(0);
  const [dataToDelete, setDataToDelete] = useState<Product | {}>({});
  const [isDeleteModalVisible, setDeleteModalVisibility] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [dateRange, setDateRange] = useState<(string | null)[]>([]);
  // const [selectedValue, setSelectedValue] = useState(null);
  const [selectedValue, setSelectedValue] = useState<string | undefined>(
    undefined
  );
  const [initialData, setInitialData] = useState(null); // Holds the initial data for editing

  const [productID, setproductID] = useState(0);
  const [productsData, setProductData] = useState<Product[]>([]);

  const [form] = Form.useForm();
  const token = localStorage.getItem("token");
  const active = localStorage.getItem("active");

  const handleDelete = (record: React.SetStateAction<{}>) => {
    setDeleteModalVisibility(true);
    setDataToDelete(record);
  };

  const addProduct = () => {
    form.resetFields(); // Clear form fields
    setCurrentProduct(null); // No current product when adding new
    setIsModalVisible(true);
    setIsEdit(false);
  };

  const handleFilterChange = (productID: any) => {
    setproductID(productID);
    setSelectedValue(productID); // This will trigger fetchproductsData due to useEffect
    setOffset(0);
    setCurrentPage(1);
    fetchData(offset, pageSize);
  };

  const editProduct = (product: React.SetStateAction<null>) => {
    setCurrentProduct(product); // Set current product to edit
    form.setFieldsValue(product); // Initialize form with product data
    setIsModalVisible(true);
    setIsEdit(true);
  };

  const handleAddOrEditProduct = async (formData: FormData) => {
    try {
      setLoading(true);
      const product = currentProduct as unknown as Product;
      const endpoint = isEdit
        ? `/api/products/update/${product._id}`
        : "/api/products/create";

      const apiHost = process.env.REACT_APP_API_HOST;
      // Check if the form contains an image file to upload
      if (isEdit && !formData.get("image")) {
        // If it's an edit and no new image is selected, remove the image field from the FormData
        formData.delete("image");
      }
      const res = isEdit
        ? await axios.put(`${apiHost}${endpoint}`, formData, {
            headers: {
              "Content-Type": "multipart/form-data", // Specify multipart form-data
              Authorization: token,
            },
          })
        : await axios.post(`${apiHost}${endpoint}`, formData, {
            headers: {
              "Content-Type": "multipart/form-data", // Specify multipart form-data
              Authorization: token,
            },
          });

      if (res.status === 201 || res.status === 200) {
        message.success(
          `Product ${isEdit ? "updated" : "added"} successfully.`
        );
        fetchData(0, pageSize); // Refresh data if needed
      } else {
        message.error("Failed to add/update product.");
      }
    } catch (error) {
      console.error("Error during product submission:", error);
      message.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async () => {
    const obj = { ...dataToDelete };

    const apiHost = process.env.REACT_APP_API_HOST;
    let headers = {
      "Content-Type": "application/json",
      Authorization: token,
    };
    let endpoint = `${apiHost}/api/products/delete/${obj._id}`;
    const response = await axios.delete(endpoint, { headers });

    setDeleteModalVisibility(false);
    setDataToDelete({});
    fetchData(offset, pageSize);
  };

  const fetchData = async (offset: number, limit: any, searchKey = null) => {
    setLoading(true);
    try {
      const apiHost = process.env.REACT_APP_API_HOST;
      let apiUrl = `${apiHost}/api/products?limit=${limit}&offset=${offset}`;

      if (sortField) {
        apiUrl = apiUrl + `&sortBy=${sortField}&sortOrder=${sortOrder}`;
      }

      if (dateRange.length === 2) {
        const [startDate, endDate] = dateRange;
        apiUrl += `&createdAtFrom=${startDate}&createdAtTo=${endDate}`;
      }

      if (selectedValue) {
        apiUrl += `&productId=${selectedValue}`;
      }

      let headers = {
        "Content-Type": "application/json",
        Authorization: token,
      };
      const response = await axios.get(apiUrl, { headers });
      if (response.data && response.data.products) {
        setTotalUserCount(response.data.pagination.totalItems);
        setProducts(response.data.products);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error("Error during API call:", error);
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

  useEffect(() => {
    fetchData(0, pageSize);
    if (!selectedValue) {
      fetchproductsData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedValue]);

  const handleDateChange = (dates: DateRange) => {
    if (dates) {
      setDateRange(
        dates.map((date) => (date ? date.format("YYYY-MM-DD") : null))
      );
    } else {
      setDateRange([]);
    }
  };

  const handleFilterSubmit = () => {
    fetchData(offset, pageSize);
  };

  const columns = [
    {
      title: "Product Name",
      dataIndex: "productName",
      key: "productName",
      sorter: true,
    },
    {
      title: "Description",
      dataIndex: "productDesc",
      key: "productDesc",
      sorter: true,
    },
    {
      title: "Status",
      key: "status",
      render: (text: any, record: any) => {
        return <span>{record.isDelete ? "Deleted" : "Active"}</span>;
      },
    },
    {
      title: "Image",
      dataIndex: "imageURL",
      key: "imageURL",
      sorter: true,
      render: (imageURL: string) => (
        <img
          src={imageURL}
          alt="Product"
          style={{
            width: "50px",
            height: "50px",
            objectFit: "cover",
            cursor: "pointer",
          }}
          onClick={() => window.open(imageURL, "_blank")}
        />
      ),
    },
  ];

  const actionColumn = {
    title: "Action",
    key: "action",
    render: (text: any, record: any) => {
      return (
        <Space>
          {active === "true" && (
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => editProduct(record)}
            >
              Edit
            </Button>
          )}
          {active === "true" && (
            <Button
              type="primary"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record)}
            >
              Delete
            </Button>
          )}
        </Space>
      );
    },
  };
  const userNameColumn = {
    title: "User Name",
    key: "createdBy",
    dataIndex: "createdBy",
    sorter: true,
  };

  if (active === "false") {
    columns.push(userNameColumn);
  } else{
    columns.push(actionColumn);
  }
  
  return (
    <div className="main-container">
      <DeleteModal
        visible={isDeleteModalVisible}
        onCancel={() => setDeleteModalVisibility(false)}
        onConfirm={deleteProduct}
      />
      <div className="filter-section">
        {active === "false" && (
          <Space>
            Filter by Name:
            <Select
              onChange={handleFilterChange}
              showSearch={true}
              placeholder="Select Product"
              optionFilterProp="children"
              value={selectedValue}
              filterOption={(input, option) => {
                const children: any = option?.children;
                // Ensure children is a string before calling toLowerCase
                if (typeof children === "string") {
                  return children.toLowerCase().includes(input.toLowerCase());
                }

                return false; // Return false if children is not a string
              }}
              style={{ width: 200 }}
            >
              <Option key={"None"} value={undefined}>
                None
              </Option>

              {productsData.map((productDetail, index) => (
                <Option key={index} value={productDetail._id}>
                  {productDetail.productName}
                </Option>
              ))}
            </Select>
          </Space>
        )}
        <Space>
          Filter by Date:
          <RangePicker onChange={handleDateChange} />
          <Button type="primary" onClick={handleFilterSubmit}>
            Submit
          </Button>
        </Space>
      </div>
      {active === "true" && (
        <Button
          className="button-class"
          type="primary"
          icon={<PlusOutlined />}
          onClick={addProduct}
        >
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

      <AddProductForm
        form={form}
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onSubmit={handleAddOrEditProduct}
        initialData={currentProduct}
      />
    </div>
  );
};

export default Products;
