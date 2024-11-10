import React, { useEffect, useState } from "react";
import {
  Switch,
  message,
  Table
} from "antd";
import axios from "axios";
import { DeleteOutlined, PlusOutlined, EditOutlined } from "@ant-design/icons";
import TableView from "../components/TableView";
import { pageSize } from "../global/constant";
import DeleteModal from "../components/DeleteModal";
import "../css/Home.css"; // Import the new CSS file
import { ColumnsType } from "antd/es/table";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUserCount, setTotalUserCount] = useState(0);
  const [offset, setOffset] = useState(0);
  const [selectedValue, setSelectedValue] = useState<string | undefined>(undefined);

  const token = localStorage.getItem("token");

  const fetchData = async (offset: number, limit: any, searchKey = null) => {
    setLoading(true);
    try {
      const apiHost = process.env.REACT_APP_API_HOST;
      let apiUrl = `${apiHost}/api/users?limit=${limit}&offset=${offset}`;

      if (selectedValue) {
        apiUrl += `&productId=${selectedValue}`;
      }

      const headers = {
        "Content-Type": "application/json",
        Authorization: token,
      };

      const response = await axios.get(apiUrl, { headers });
      console.log(response)
      if (response.data && response.data.users) {
        setTotalUserCount(response.data.pagination.totalItems);
        setUsers(response.data.users);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error("Error during API call:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(0, pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStatusChange = async (value: boolean, userId: string) => {
    try {
        console.log(userId)
      const apiHost = process.env.REACT_APP_API_HOST;
      const url = `${apiHost}/api/users/updateUserStatus`;
      const headers = {
        "Content-Type": "application/json",
        Authorization: token,
      };

      const response = await axios.put(
        url,
        { userId, active: value },
        { headers }
      );

      if (response.status === 200) {
        message.success("User status updated successfully.");
        fetchData(offset, pageSize); // Refresh the data
      } else {
        message.error("Failed to update user status.");
      }
    } catch (error) {
      console.error("Error updating user status:", error);
      message.error("An error occurred while updating the status.");
    }
  };

  const columns = [
    {
      title: "Full Name",
      dataIndex: "fullName",
      key: "fullName",
      sorter: true,
    },
    {
      title: "Email Id",
      dataIndex: "emailID",
      key: "emailID",
      sorter: true,
    },
    {
      title: "Active",
      key: "active",
      render: (text: any, record: any) => {
        return (
          <Switch
            checked={record.active}
            onChange={(value) => handleStatusChange(value, record._id)}
            checkedChildren="On"
            unCheckedChildren="Off"
          />
        );
      },
    },
  ];

  return (
    <div className="main-container">
      <div className="table-container">
        <TableView
                  data={users}
                  columns={columns}
                  loading={loading}
                  currentPage={currentPage}
                  totalCount={totalUserCount}
                  setOffset={setOffset}
                  setCurrentPage={setCurrentPage}
                  fetchData={fetchData} setSortField={function (field: string): void {
                      throw new Error("Function not implemented.");
                  } } setSortOrder={function (order: "asc" | "desc"): void {
                      throw new Error("Function not implemented.");
                  } }        />
      </div>
    </div>
  );
};

export default Users;
