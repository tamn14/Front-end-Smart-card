import { useEffect, useState } from "react";

import type { CardResponse } from "../Models/Response/CardResponse";

type BannerItemProps = {
  card: CardResponse;
};

const BannerItem = ({ card }: BannerItemProps) => {
  

  return (
    <div className="swiper-slide">
      <div className="d-flex justify-content-center">
        <img
          src={card.url}
          alt={`Book ${card.name}`}
          className="img-fluid zoom-in-fade"
          style={{
            objectFit: "contain",
            width: "100%",
            height: "500px",
            borderRadius: "12px",
          }}
        />
      </div>
    </div>
  );
};

export default BannerItem;
