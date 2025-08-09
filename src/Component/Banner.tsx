import { useEffect, useState, useRef } from "react";
import BannerItem from "./BannerItem";
import { get1Card } from "../API/CardAPI";
import type { CardResponse } from "../Models/Response/CardResponse";




const Banner = () => {
  const [danhSachCard, setDanhSachCard] = useState<CardResponse[]>([]);
  const [dangTaiDuLieu, setDangTaiDuLieu] = useState(true);
  const [baoLoi, setBaoLoi] = useState<string | null>(null);
  const swiperRef = useRef(null);

  useEffect(() => {
    get1Card()
      .then((cardData) => {
        setDanhSachCard(cardData.ketqua);
        setDangTaiDuLieu(false);
      })
      .catch((error) => {
        setBaoLoi(error.message);
        setDangTaiDuLieu(false);
      });
  }, []);

  useEffect(() => {
    if (danhSachCard.length === 0) return;

    const Swiper = window.Swiper;
    if (!Swiper) return;

    const swiperInstance = new Swiper(swiperRef.current, {
      loop: true,
      grabCursor: true,
      autoplay: {
        delay: 4000,
        disableOnInteraction: false,
      },
      effect: "slide",
      speed: 800,
      pagination: {
        el: ".swiper-pagination",
        clickable: true,
      },
    });

    return () => swiperInstance.destroy();
  }, [danhSachCard]);

  if (dangTaiDuLieu) {
    return <h1>Đang tải dữ liệu...</h1>;
  }

  if (baoLoi) {
    return <h1>Gặp lỗi: {baoLoi}</h1>;
  }

  return (
    <div className="container col-10 mt-3">
      <div className="row mt-4 align-items-center">
        {/* LEFT TEXT */}
        <div className="col-lg-6 text-lg-start text-center mb-5 mb-lg-0">
          <h1 className="display-4 fw-bold animate__animated animate__fadeInLeft">
            Kết nối thông minh cùng <span className="text-primary">SmartCard</span>
          </h1>
          <p className="lead text-muted mt-3 animate__animated animate__fadeInLeft animate__delay-1s">
            Danh thiếp không chỉ là thông tin – đó là cách bạn ghi dấu ấn và tạo kết nối chuyên nghiệp mọi lúc, mọi nơi.
          </p>
          
        </div>

        {/* RIGHT SWIPER */}
        <div className="col-lg-6">
          <div
            ref={swiperRef}
            className="swiper book-swiper rounded-4 shadow-lg overflow-hidden animate__animated animate__fadeInRight animate__delay-1s"
          >
            <div className="swiper-wrapper">
              {danhSachCard.map((card) => (
                <BannerItem key={card.cardId} card={card} />
              ))}
            </div>
            <div className="swiper-pagination mt-3"></div>
          </div>
        </div>
      </div>

      <style>{`
        .zoom-in-fade {
          animation: zoomInFade 1.5s ease-out forwards;
          opacity: 0;
          transform: scale(0.9);
        }

        @keyframes zoomInFade {
          0% {
            opacity: 0;
            transform: scale(0.9);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        .banner-background {
          background: radial-gradient(circle at top left, #eef3f8, #d6e4f0, #ffffff);
        }
      `}</style>
    </div>
  );
};

export default Banner;
