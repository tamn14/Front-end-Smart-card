import React, { useState, useEffect, useMemo } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { authFetch } from '../../../Utils/authFetch';
import { toast } from 'react-toastify';

interface PaymentResponse {
  payId: number;
  method: string;
  status: 'PAID' | 'PENDING' | 'CANCELLED';
  payDate: string;
}

interface UsersResponseInOrder {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

interface CardResponse {
  cardId: number;
  name: string;
  price: number;
}

interface Order {
  orderId: number;
  orderType: string;
  totalAmount: number;
  status: string;
  ordersDate: string;
  paymentResponse: PaymentResponse;
  usersResponse: UsersResponseInOrder;
  cardResponse: CardResponse;
}

interface Props {
  isLogin: boolean;
}

interface ApiResponse<T> {
  code: number;
  mess: string;
  result: T;
}

const ManageOrders: React.FC<Props> = ({ isLogin }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentSearchTerm, setCurrentSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => String(currentYear - i));
  }, []);

  const months = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const ordersResponse = await authFetch('/orders?page=0&size=100');
      const ordersApiResult: ApiResponse<any> = await ordersResponse.json();
      const ordersData = ordersApiResult?.result?.content || [];

      if (Array.isArray(ordersData)) {
        setOrders(ordersData);
      } else {
        setOrders([]);
      }
    } catch (err: any) {
      setError(err.message || 'Lỗi khi tải dữ liệu từ API.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleSearch = () => {
    setSearchTerm(currentSearchTerm);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  const handleUpdatePaymentStatus = async (orderId: number, newPaymentStatus: string) => {
    const statusMapping: Record<string, string> = {
      PAID: 'COMPLETED',
      PENDING: 'PENDING',
      CANCELLED: 'CANCELLED'
    };

    const newOrderStatus = statusMapping[newPaymentStatus];

    try {
      const response = await authFetch(`/orders/${orderId}/update-status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          paymentStatus: newPaymentStatus,
          orderStatus: newOrderStatus
        })
      });

      if (!response.ok) throw new Error('Lỗi khi cập nhật trạng thái');

      toast.success('Cập nhật thành công!');
      fetchDashboardData();
    } catch (err: any) {
      toast.error(err.message || 'Cập nhật thất bại');
    }
  };

  const { filteredOrders, totalCustomers, totalRevenue } = useMemo(() => {
    let filtered = orders;
    if (selectedYear) {
      filtered = filtered.filter(order => new Date(order.ordersDate).getFullYear().toString() === selectedYear);
    }
    if (selectedMonth) {
      filtered = filtered.filter(order => (new Date(order.ordersDate).getMonth() + 1).toString().padStart(2, '0') === selectedMonth);
    }
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.orderId.toString().includes(searchTerm) ||
        (order.usersResponse?.firstName + ' ' + order.usersResponse?.lastName).toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    const customerIds = new Set<number>();
    filtered.forEach(order => {
      if (order.usersResponse?.id) customerIds.add(order.usersResponse.id);
    });
    const totalCustomersCount = customerIds.size;
    const revenue = filtered.reduce((sum, order) => {
      if (order.status === 'COMPLETED') return sum + order.totalAmount;
      return sum;
    }, 0);

    return {
      filteredOrders: filtered,
      totalCustomers: totalCustomersCount,
      totalRevenue: revenue
    };
  }, [orders, searchTerm, selectedMonth, selectedYear]);

  const sortedDisplayedOrders = useMemo(() => {
    return [...filteredOrders].sort((a, b) => {
      const statusA = a.status;
      const statusB = b.status;
      const dateA = new Date(a.ordersDate);
      const dateB = new Date(b.ordersDate);

      if (statusA === 'PENDING' && statusB !== 'PENDING') return -1;
      if (statusA !== 'PENDING' && statusB === 'PENDING') return 1;

      return dateB.getTime() - dateA.getTime();
    });
  }, [filteredOrders]);

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-success';
      case 'PENDING': return 'bg-warning text-dark';
      case 'CANCELLED': return 'bg-danger';
      default: return 'bg-secondary';
    }
  };

  if (loading) {
    return (
      <div className="text-center p-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Đang tải dữ liệu dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger text-center m-4" role="alert">
        {error}
      </div>
    );
  }

  return (
    <div className="p-4">
      <h3 className="mb-4">Manage Orders</h3>

      <div className="card shadow-sm">
        <div className="card-header bg-white d-flex flex-wrap justify-content-between align-items-center">
          <h5 className="mb-2 mb-md-0">Đơn hàng gần đây</h5>
          <div className="d-flex flex-wrap align-items-center gap-2">
            <select className="form-select" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
              <option value="">-- Chọn tháng --</option>
              {months.map(month => <option key={month} value={month}>{`Tháng ${parseInt(month)}`}</option>)}
            </select>
            <select className="form-select" value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
              <option value="">-- Chọn năm --</option>
              {years.map(year => <option key={year} value={year}>{`Năm ${year}`}</option>)}
            </select>
            <div className="input-group" style={{ maxWidth: '300px' }}>
              <input type="text" className="form-control" placeholder="Tìm kiếm theo mã, tên..."
                value={currentSearchTerm} onChange={(e) => setCurrentSearchTerm(e.target.value)} onKeyDown={handleKeyDown} />
              <button className="btn btn-outline-secondary" type="button" onClick={handleSearch}>
                <i className="bi bi-search"></i>
              </button>
            </div>
          </div>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead>
                <tr>
                  <th>Mã ĐH</th>
                  <th>Khách hàng</th>
                  <th>Tổng tiền</th>
                  <th>Ngày</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {sortedDisplayedOrders.length > 0 ? (
                  sortedDisplayedOrders.map((order) => (
                    <tr key={order.orderId}>
                      <td>{order.orderId}</td>
                      <td>{order.usersResponse?.firstName} {order.usersResponse?.lastName}</td>
                      <td>{order.totalAmount.toLocaleString('vi-VN')} VNĐ</td>
                      <td>{new Date(order.ordersDate).toLocaleDateString('vi-VN')}</td>
                      <td>
                        <span className={`badge rounded-pill ${getStatusBadgeClass(order.status)}`}>
                          {order.status}
                        </span>
                        {isLogin && (
                          <div className="mt-2">
                            <select className="form-select form-select-sm"
                              value={order.paymentResponse.status}
                              onChange={(e) => handleUpdatePaymentStatus(order.orderId, e.target.value)}>
                              <option value="PAID">Đã thanh toán</option>
                              <option value="PENDING">Đang xử lý</option>
                              <option value="CANCELLED">Đã hủy</option>
                            </select>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center">Không có đơn hàng nào được tìm thấy.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageOrders;
