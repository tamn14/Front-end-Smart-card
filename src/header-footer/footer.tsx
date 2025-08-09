const Footer = () => {
  return (
    <div className="bg-light border-top mt-5 pt-5">
      <div className="container">
        <div className="row">
          {/* Giới thiệu */}
          <div className="col-md-4 mb-4">
            <h5 className="text-primary fw-bold">SmartCard</h5>
            <p className="text-muted">
              SmartCard là nền tảng cung cấp thẻ cá nhân thông minh – giúp bạn chia sẻ thông tin nhanh chóng, chuyên nghiệp và hiện đại chỉ với một chạm.
            </p>
          </div>

          {/* Liên hệ */}
          <div className="col-md-4 mb-4">
            <h6 className="fw-bold">Liên hệ</h6>
            <ul className="list-unstyled text-muted">
              <li>Email: support@smartcard.vn</li>
              <li>Hotline: 0909 123 456</li>
              <li>Địa chỉ: 123 Đường Số 1, Q.1, TP.HCM</li>
            </ul>
          </div>

          {/* Mạng xã hội */}
          <div className="col-md-4 mb-4">
            <h6 className="fw-bold">Theo dõi chúng tôi</h6>
            <ul className="list-unstyled text-muted">
              <li><a href="#" className="text-decoration-none text-muted">Facebook</a></li>
              <li><a href="#" className="text-decoration-none text-muted">Instagram</a></li>
              <li><a href="#" className="text-decoration-none text-muted">LinkedIn</a></li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center border-top pt-3 pb-2 mt-4 text-muted small">
          &copy; 2025 SmartCard. Đã đăng ký bản quyền.
        </div>
      </div>
    </div>
  );
};

export default Footer;
