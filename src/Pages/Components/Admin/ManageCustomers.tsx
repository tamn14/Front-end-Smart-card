import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { authFetch } from '../../../Utils/authFetch';

// Interfaces

interface User {
  id: number;
  lastName: string;
  firstName: string;
  email: string;
  address: string;
  createAt: string;
}

interface ApiResponse<T> {
  code: number;
  mess: string;
  result: T;
}

interface PageableResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

interface Order {
  orderId: number;
  totalAmount: number;
  usersResponse: User;
}

interface UserWithTotal extends User {
  totalAmount: number;
}

interface Props {
  isLogin: boolean;
}

const ManageUsers: React.FC<Props> = ({ isLogin }) => {
  const [users, setUsers] = useState<UserWithTotal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const PAGE_SIZE = 10;

  const fetchUsers = async (page: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await authFetch(`/users?page=${page}&size=${PAGE_SIZE}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.mess || 'Lỗi khi tải người dùng');
      }
      const data: ApiResponse<PageableResponse<User>> = await res.json();
      return data.result.content || [];
    } catch (err: any) {
      setError(err.message || 'Lỗi khi tải dữ liệu người dùng');
      return [];
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await authFetch(`/orders?page=0&size=1000`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.mess || 'Lỗi khi tải đơn hàng');
      }
      const data: ApiResponse<PageableResponse<Order>> = await res.json();
      return data.result.content || [];
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi tải đơn hàng');
      return [];
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const [userList, orderList] = await Promise.all([fetchUsers(currentPage), fetchOrders()]);

      // Tính tổng tiền mua cho từng userId
      const totalMap: Record<number, number> = {};
      orderList.forEach(order => {
        const uid = order.usersResponse.id;
        if (!totalMap[uid]) totalMap[uid] = 0;
        totalMap[uid] += order.totalAmount;
      });

      // Gán totalAmount vào từng user
      const usersWithTotal: UserWithTotal[] = userList.map(user => ({
        ...user,
        totalAmount: totalMap[user.id] || 0,
      }));

      // Sắp xếp theo tổng tiền mua giảm dần
      usersWithTotal.sort((a, b) => b.totalAmount - a.totalAmount);

      setUsers(usersWithTotal);
      setLoading(false);
    };

    loadData();
  }, [currentPage]);

  return (
    <div className="container-fluid p-4">
      <ToastContainer position="top-right" autoClose={3000} />
      <h3 className="mb-4">Quản lý Người dùng</h3>

      {error && <div className="alert alert-danger text-center">{error}</div>}

      {loading && !users.length ? (
        <div className="text-center p-5">
          <div className="spinner-border text-primary" role="status" />
          <p className="mt-3">Đang tải dữ liệu...</p>
        </div>
      ) : (
        <div className="card shadow-sm">
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Họ và Tên</th>
                    <th>Email</th>
                    <th>Địa chỉ</th>
                    <th>Ngày tạo</th>
                    <th>Tổng tiền mua</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length ? (
                    users.map(user => (
                      <tr key={user.id}>
                        <td>{user.id}</td>
                        <td>{user.lastName} {user.firstName}</td>
                        <td>{user.email}</td>
                        <td>{user.address}</td>
                        <td>{new Date(user.createAt).toLocaleDateString()}</td>
                        <td>{user.totalAmount.toLocaleString('vi-VN')} VNĐ</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center p-4">
                        Không tìm thấy người dùng nào.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {totalPages > 1 && (
        <nav className="d-flex justify-content-center mt-4">
          <ul className="pagination">
            <li className={`page-item ${currentPage === 0 ? 'disabled' : ''}`}>
              <button className="page-link" onClick={() => setCurrentPage(currentPage - 1)}>Trước</button>
            </li>
            {Array.from({ length: totalPages }, (_, i) => (
              <li key={i} className={`page-item ${currentPage === i ? 'active' : ''}`}>
                <button className="page-link" onClick={() => setCurrentPage(i)}>{i + 1}</button>
              </li>
            ))}
            <li className={`page-item ${currentPage >= totalPages - 1 ? 'disabled' : ''}`}>
              <button className="page-link" onClick={() => setCurrentPage(currentPage + 1)}>Sau</button>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
};

export default ManageUsers;
