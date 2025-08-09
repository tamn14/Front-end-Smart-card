import { Link } from "react-router-dom";
import type { CardResponse } from "../../Models/Response/CardResponse";

type CardItemProps = {
  card: CardResponse;
};

const CardItem = ({ card }: CardItemProps) => {
  const { cardId, name, description, url, price } = card;

  return (
    <div className="col-xl-3 col-lg-4 col-md-6 mb-4">
      <div className="card h-100 border-0 shadow-sm rounded-4">
        <Link to={`/card/${cardId}`} className="d-block overflow-hidden rounded-top-4">
          <img
            src={url}
            alt={name}
            className="w-100"
            style={{
              height: "220px",
              objectFit: "cover",
              transition: "transform 0.3s ease",
            }}
            onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
            onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
          />
        </Link>

        <div className="card-body d-flex flex-column px-3 pt-3 pb-2">
          <Link to={`/card/${cardId}`} className="text-decoration-none">
            <h5 className="card-title text-dark fw-semibold mb-2" style={{ fontSize: "1rem" }}>
              {name}
            </h5>
          </Link>

          <p className="card-text text-muted mb-3" style={{ fontSize: "0.875rem", minHeight: "48px" }}>
            {description?.length ? (
              description.length > 80 ? `${description.slice(0, 77)}...` : description
            ) : (
              "Không có mô tả"
            )}
          </p>

          <div className="mt-auto">
            <div className="mb-3">
              <span className="text-danger fw-bold fs-6">
                {price?.toLocaleString()} đ
              </span>
            </div>
            <div className="d-flex gap-2">
              <Link className="btn btn-outline-danger btn-sm w-70 rounded-pill fw-semibold" to={`/card/${cardId}`}>
                🛒 Mua ngay
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardItem;
