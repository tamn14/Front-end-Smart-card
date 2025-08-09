import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getById } from "../API/CardAPI";
import type { CardResponse } from "../Models/Response/CardResponse";
import Orders from "../Pages/Components/Orders";
import OrdersPage from "../Pages/OrdersPage";

const ProductProp: React.FC = () => {
  const { cardId } = useParams();
  const [card, setCard] = useState<CardResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (cardId) {
      const id = parseInt(cardId);
      if (!isNaN(id)) {
        getById(id)
          .then((data) => setCard(data))
          .finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    }
  }, [cardId]);



  if (loading) {
    return (
      <div className="text-center mt-5 fw-bold text-primary fs-4">
        Đang tải thông tin thẻ...
      </div>
    );
  }

  if (!card) {
    return (
      <div className="text-center mt-5 text-danger fw-bold fs-4">
        Không tìm thấy thông tin thẻ
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center align-items-start g-5">
        {/* Hình ảnh thẻ */}
        <div className="col-md-5">
          <div className="border rounded-4 overflow-hidden shadow-sm">
            <img
              src={card.url}
              alt={card.name}
              className="img-fluid w-100"
              style={{
                objectFit: "cover",
                maxHeight: "480px",
                transition: "transform 0.3s ease",
              }}
              onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.03)")}
              onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
            />
          </div>
        </div>

        {/* Thông tin chi tiết thẻ */}
        <div className="col-md-7">
          <div className="bg-white rounded-4 shadow-sm p-5 h-100 d-flex flex-column justify-content-between">
            <div>
              <h1 className="fw-bold mb-3 text-dark">{card.name}</h1>

              <div className="text-danger fw-bold fs-3 mb-4">
                {card.price != null
                  ? `${card.price.toLocaleString("vi-VN")} ₫`
                  : "Đang cập nhật giá"}
              </div>

              <p className="text-secondary fs-5" style={{ whiteSpace: "pre-line" }}>
                {card.description || "Không có mô tả chi tiết cho thẻ này."}
              </p>
            </div>

            <div className="mt-5">
              <Link to={`/card/${card.cardId}/order`}>
                <button className="btn btn-lg btn-warning w-100 rounded-pill fw-semibold shadow">
                  🚀 Mua ngay
                </button>
              </Link>
              
              

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductProp;
