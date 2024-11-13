import React, { useEffect, useState } from "react";
import { Switch, message, Space, DatePicker } from "antd";
import axios from "axios";
import TableView from "../components/TableView";
import { pageSize } from "../global/constant";
import "../css/Home.css"; // Import the new CSS file
import { Dayjs } from "dayjs";

type DateRange = [Dayjs | null, Dayjs | null] | null;
const { RangePicker } = DatePicker;

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUserCount, setTotalUserCount] = useState(0);
  const [offset, setOffset] = useState(0);
  const [dateRange, setDateRange] = useState<(string | null)[]>([]);
  const [sortField, setSortField] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  const token = localStorage.getItem("token");

  const fetchData = async (offset: number, limit: any, searchKey = null) => {
    setLoading(true);
    try {
      const apiHost = process.env.REACT_APP_API_HOST;
      let apiUrl = `${apiHost}/api/users?limit=${limit}&offset=${offset}&sortBy=${sortField}&sortOrder=${sortOrder}`;

      const headers = {
        "Content-Type": "application/json",
        Authorization: token,
      };

      if (dateRange.length === 2) {
        const [startDate, endDate] = dateRange;
        apiUrl += `&createdAtFrom=${startDate}&createdAtTo=${endDate}`;
      }

      const response = await axios.get(apiUrl, { headers });
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
  }, [dateRange, sortField, sortOrder]);

  const handleDateChange = (dates: DateRange) => {
    setDateRange(
      dates ? dates.map((date) => date?.format("YYYY-MM-DD") ?? null) : []
    );
  };

  const handleStatusChange = async (value: boolean, userId: string) => {
    try {
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
      <div className="filter-section">
        <Space>
          <RangePicker onChange={handleDateChange} />
        </Space>
      </div>
      <div className="table-container">
        <TableView
          data={users}
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
    </div>
  );
};

export default Users;
