import React, { useEffect, useState } from "react";
import type { OrdersRequest } from "../../Models/Request/OrdersRequest";
import type { CardResponse } from "../../Models/Response/CardResponse";
import { Modal, Button } from "react-bootstrap";
import { authFetch } from "../../Utils/authFetch";
import { useNavigate } from "react-router-dom";



interface CardProp {
  card: CardResponse;
  isLogin: boolean;
}

const Orders: React.FC<CardProp> = ({ card, isLogin }) => {
  // Khởi tạo state orders với kiểu phù hợp, đảm bảo paymentRequest luôn tồn tại
  const [orders, setOrders] = useState<OrdersRequest>({
    orderType: "NEW_CARD",
    totalAmount: card.price ?? 0,
    status: "PENDING",
    address: "",
    ordersDate: new Date(), // sẽ convert về LocalDate
    cardId: card.cardId,
    paymentRequest: {
      method: "CASH",
      status: "PAID", // bổ sung status
      payDate: new Date(), // bổ sung payDate
    },
  });

  const navigate = useNavigate();

  const [isSubmitted, setIsSubmitted] = useState(false);

  const [orderId, setOrderId] = useState<number | null>(null);
  const [qr, setQr] = useState<string | null>(null);

  const [showQrModal, setShowQrModal] = useState(false);
  const [qrImage, setQrImage] = useState<string | null>(null);


  // Kiểm tra điều kiện submit để set trạng thái isSubmitted
  useEffect(() => {
    // Đảm bảo các trường không bị undefined, paymentRequest luôn có method
    if (
      orders.address?.trim() !== "" &&
      orders.paymentRequest?.method &&
      orders.orderType
    ) {
      setIsSubmitted(true);
    } else {
      setIsSubmitted(false);
    }
  }, [orders]);

  // Xử lý thay đổi input đơn giản cho các thuộc tính nằm ngoài paymentRequest
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    // Nếu name thuộc paymentRequest, phải cập nhật riêng
    if (name === "paymentMethod") {
      setOrders((prev) => ({
        ...prev,
        paymentRequest: {
          ...prev.paymentRequest,
          method: value,
        },
      }));
    } else if (name === "ordersDate") {
      // Nếu là ngày thì convert string về Date
      setOrders((prev) => ({
        ...prev,
        ordersDate: new Date(value),
      }));
    } else if (name === "totalAmount") {
      // Nếu là số, convert về number
      setOrders((prev) => ({
        ...prev,
        totalAmount: Number(value),
      }));
    } else {
      setOrders((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Xử lý chọn phương thức thanh toán
  const handlePaymentMethod = (method: "CASH" | "BANK_TRANSFER") => {
    setOrders((prev) => ({
      ...prev,
      paymentRequest: {
        ...prev.paymentRequest,
        method: method,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (!isLogin) {
        navigate("/login");
      }
      const response = await authFetch("/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orders),
      });

      if (!response.ok) throw new Error("Đặt hàng thất bại.");

      const responseData = await response.json();
      const newOrderId = responseData.result.orderId;
      setOrderId(newOrderId);

      console.log(orderId);


    } catch (error) {
      console.error("❌ Lỗi đặt hàng:", error);
      alert("❌ Đặt hàng thất bại. Vui lòng thử lại.");
    }
  };
  useEffect(() => {
    if (orderId && orders.paymentRequest?.method === "BANK_TRANSFER") {
      const fetchQr = async () => {
        try {
          const qrResponse = await authFetch(`/orders/qr/image/${orderId}`, {
            method: "GET",
          });
          if (!qrResponse.ok) throw new Error("Không thể lấy mã QR");
          const qrBlob = await qrResponse.blob();
          const qrUrl = URL.createObjectURL(qrBlob);
          setQrImage(qrUrl);
          setShowQrModal(true);
        } catch (error) {
          console.error("Lỗi lấy QR:", error);
        }
      };
      fetchQr();
    }
  }, [orderId]);


  return (
    <div className="container py-5">
      <h2 className="text-center fw-bold mb-4 text-success">📝 Đặt Thẻ Cá Nhân</h2>
      <div className="row g-4">
        {/* Cột trái: Hiển thị đơn hàng */}
        <div className="col-md-5">
          <div className="card shadow-sm border-0 rounded-4">
            <div className="card-body bg-light rounded-4">
              <h5 className="card-title text-center text-primary mb-4">
                📦 Thông Tin Đơn Hàng
              </h5>

              {isSubmitted ? (
                <>
                  <p>
                    <strong>📌 Loại:</strong>{" "}
                    {orders.orderType === "NEW_CARD"
                      ? "Mua thẻ mới"
                      : "Làm lại thẻ"}
                  </p>
                  <p>
                    <strong>🎫 Tên thẻ:</strong> {card.name}
                  </p>
                  <p>
                    <strong>💰 Tổng tiền:</strong>{" "}
                    {orders.totalAmount?.toLocaleString("vi-VN")} ₫
                  </p>
                  <p>
                    <strong>📍 Địa chỉ:</strong> {orders.address}
                  </p>
                  <p>
                    <strong>🕒 Ngày đặt:</strong>{" "}
                    {orders.ordersDate?.toISOString().slice(0, 10)}
                  </p>
                  <p>
                    <strong>💳 Thanh toán:</strong>{" "}
                    {orders.paymentRequest?.method === "BANK_TRANSFER"
                      ? "Chuyển khoản"
                      : "Tiền mặt"}
                  </p>
                  <p>
                    <strong>📌 Trạng thái:</strong> {orders.status}
                  </p>
                </>
              ) : (
                <p className="text-muted text-center">
                  Điền thông tin để hiển thị đơn hàng.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Cột phải: Form đặt hàng */}
        <div className="col-md-7">
          <div className="p-4 shadow-sm border rounded-4 bg-white">
            <form onSubmit={handleSubmit} className="row g-4">
              <div className="col-md-6">
                <label className="form-label">Loại đơn hàng</label>
                <select
                  name="orderType"
                  className="form-select"
                  value={orders.orderType}
                  onChange={handleChange}
                  required
                >
                  <option value="NEW_CARD">Mua thẻ mới</option>
                  <option value="RENEWAL">Làm lại thẻ</option>
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label">Tổng tiền</label>
                <input
                  type="number"
                  className="form-control"
                  value={orders.totalAmount}
                  readOnly
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Địa chỉ giao thẻ</label>
                <input
                  type="text"
                  name="address"
                  className="form-control"
                  value={orders.address}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Ngày đặt</label>
                <input
                  type="date"
                  className="form-control"
                  value={orders.ordersDate?.toISOString().slice(0, 10)}
                  readOnly
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Tên thẻ</label>
                <input
                  type="text"
                  className="form-control"
                  value={card.name}
                  readOnly
                />
              </div>

              {/* Phương thức thanh toán: 2 khối lựa chọn */}
              <div className="col-md-6">
                <label className="form-label">Phương thức thanh toán</label>
                <div className="d-flex gap-3">
                  <div
                    className={`p-3 border rounded-3 flex-fill text-center ${orders.paymentRequest?.method === "CASH"
                      ? "border-success"
                      : "border-secondary"
                      }`}
                    style={{ cursor: "pointer" }}
                    onClick={() => handlePaymentMethod("CASH")}
                  >
                    💵 Tiền mặt
                  </div>
                  <div
                    className={`p-3 border rounded-3 flex-fill text-center ${orders.paymentRequest?.method === "BANK_TRANSFER"
                      ? "border-success"
                      : "border-secondary"
                      }`}
                    style={{ cursor: "pointer" }}
                    onClick={() => handlePaymentMethod("BANK_TRANSFER")}
                  >
                    🏦 Chuyển khoản
                  </div>
                </div>
              </div>

              <div className="col-12 text-center mt-3">
                <button
                  type="submit"
                  className="btn btn-success btn-lg px-5 shadow"
                  disabled={!isSubmitted}
                >
                  🛒 Xác Nhận Đặt Hàng
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <Modal show={showQrModal} onHide={() => setShowQrModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>🎯 Quét mã QR để chuyển khoản</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          {qrImage && (
            <img
              src={qrImage}
              alt="QR chuyển khoản"
              style={{ maxWidth: "50%", height: "auto" }}
            />
          )}
          <p className="mt-3 text-muted">
            Vui lòng dùng app ngân hàng để quét mã và chuyển khoản đúng số tiền đã đặt.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowQrModal(false)}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>
    </div>

  );
};

export default Orders;
