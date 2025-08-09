import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getById } from "../API/CardAPI";
import Orders from "./Components/Orders";
import type { CardResponse } from "../Models/Response/CardResponse";


interface Props {
  isLogin: boolean;
}

const OrdersPage = ({ isLogin }: Props) => {
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
    return <div className="text-center mt-5 fw-bold text-primary fs-4">Đang tải...</div>;
  }

  if (!card) {
    return <div className="text-center mt-5 text-danger fw-bold fs-4">Không tìm thấy thẻ</div>;
  }

  return (
    <div className="container py-5">
      <Orders card={card} isLogin = {isLogin} />
    </div>
  );
};

export default OrdersPage;
