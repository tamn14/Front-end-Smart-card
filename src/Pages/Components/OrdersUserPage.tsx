import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { authFetch } from '../../Utils/authFetch';

// TypeScript Interfaces for data structure
// (Các interfaces đã được sắp xếp lại và thêm interface thiếu)
interface CardResponse {
    cardId: number;
    name: string;
    description: string;
    price: number;
    url: string;
}

interface PaymentResponse {
    payId: number;
    method: string;
    status: string;
    payDate: string;
}

interface OrderResponse {
    orderId: number;
    orderType: string;
    totalAmount: number;
    status: string;
    address: string;
    ordersDate: string;
    paymentResponse: PaymentResponse;
    cardResponse: CardResponse;
}

// Thêm interface cho cấu trúc API trả về
interface OrdersApiResponse {
    code: number;
    mess: string;
    result: OrderResponse[];
}

const OrdersUserPage = () => {
    const [orders, setOrders] = useState<OrderResponse[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchOrders = async () => {
        const API_URL = "/orders/user"; 

        const response = await authFetch(API_URL, {
            method: "GET",
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.mess || `API trả về lỗi: ${response.status}`);
        }

        const data: OrdersApiResponse = await response.json();
        return data.result;
    };

    useEffect(() => {
        const getOrders = async () => {
            try {
                const ordersData = await fetchOrders();
                setOrders(ordersData);
            } catch (err: any) {
                console.error("Lỗi khi tải đơn hàng:", err);
                setError(err.message || "Có lỗi xảy ra khi tải dữ liệu đơn hàng. Vui lòng thử lại.");
            } finally {
                setLoading(false);
            }
        };
        getOrders();
    }, []);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case 'PENDING':
            case 'UNPAID':
                return 'bg-warning text-dark';
            case 'COMPLETED':
            case 'PAID':
                return 'bg-success';
            case 'CANCELED':
                return 'bg-danger';
            default:
                return 'bg-secondary';
        }
    };

    if (loading) {
        return (
            <div className="container my-5 text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3">Đang tải đơn hàng của bạn...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container my-5 text-center text-danger">
                <h4>{error}</h4>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="container my-5 text-center">
                <h4 className="mb-3">Bạn chưa có đơn hàng nào.</h4>
                <button className="btn btn-primary">Bắt đầu đặt hàng</button>
            </div>
        );
    }

    return (
        <div className="container my-5">
            <h2 className="text-center mb-4">Đơn hàng của tôi</h2>
            <div className="table-responsive">
                <table className="table table-striped table-hover align-middle">
                    <thead className="table-dark">
                        <tr>
                            <th scope="col">Mã ĐH</th>
                            <th scope="col">Loại ĐH</th>
                            <th scope="col">Sản phẩm</th>
                            <th scope="col">Tổng tiền</th>
                            <th scope="col">Ngày đặt</th>
                            <th scope="col">Thanh toán</th>
                            <th scope="col">Trạng thái</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map(order => (
                            <tr key={order.orderId}>
                                <th scope="row">{order.orderId}</th>
                                <td>{order.orderType}</td>
                                <td>{order.cardResponse.name}</td>
                                <td>{formatCurrency(order.totalAmount)}</td>
                                <td>{order.ordersDate}</td>
                                <td>
                                    <span className={`badge rounded-pill ${getStatusBadgeClass(order.paymentResponse.status)}`}>
                                        {order.paymentResponse.status}
                                    </span>
                                </td>
                                <td>
                                    <span className={`badge rounded-pill ${getStatusBadgeClass(order.status)}`}>
                                        {order.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default OrdersUserPage;
