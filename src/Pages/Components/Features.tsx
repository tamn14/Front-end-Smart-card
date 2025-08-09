const Features = () => (
  <section className="container py-5">
    <div className="text-center mb-5">
      <h2 className="fw-bold text-primary display-5">✨ Tính năng nổi bật</h2>
      <p className="text-muted fs-5">
        Danh thiếp thông minh không chỉ là một tấm thẻ thông tin, mà là công cụ hiện đại giúp bạn tạo dấu ấn, kết nối nhanh chóng, chuyên nghiệp và bảo mật trong thời đại số.
      </p>
    </div>

    {/* Feature 1 - Rút gọn và sinh động */}
    <div className="row align-items-center mb-4">
      <div className="col-md-5 mb-3 mb-md-0">
        <img
          src="/images/feature1.jpg"
          alt="Chia sẻ nhanh chóng"
          className="img-fluid rounded-4 shadow-sm"
          style={{ transform: 'rotate(-2deg)', transition: 'transform 0.3s', objectFit: 'cover', height: '260px', width: '100%' }}
          onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.03) rotate(0deg)')}
          onMouseLeave={e => (e.currentTarget.style.transform = 'rotate(-2deg)')}
        />
      </div>
      <div className="col-md-7">
        <h4 className="fw-bold text-success mb-2">🚀 Chia sẻ nhanh trong tích tắc</h4>
        <p className="text-muted">
          Không cần mang theo hàng tá danh thiếp giấy. Bạn chỉ cần một cú chạm hoặc quét mã QR để người khác nhận toàn bộ thông tin cá nhân: họ tên, chức vụ, số điện thoại, mạng xã hội, và cả website riêng của bạn. Trải nghiệm chia sẻ hiện đại, tiện lợi và đầy chuyên nghiệp.
        </p>
      </div>
    </div>

    {/* Feature 2 - Rút gọn và sinh động */}
    <div className="row align-items-center flex-md-row-reverse mb-4">
      <div className="col-md-5 mb-3 mb-md-0">
        <img
          src="/images/feature2.jpg"
          alt="Tương thích đa nền tảng"
          className="img-fluid rounded-4 shadow-sm"
          style={{ transform: 'rotate(2deg)', transition: 'transform 0.3s', objectFit: 'cover', height: '260px', width: '100%' }}
          onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.03) rotate(0deg)')}
          onMouseLeave={e => (e.currentTarget.style.transform = 'rotate(2deg)')}
        />
      </div>
      <div className="col-md-7">
        <h4 className="fw-bold text-primary mb-2">📱 Hoạt động mượt trên mọi thiết bị</h4>
        <p className="text-muted">
          Danh thiếp số được thiết kế tối ưu cho mọi nền tảng: từ điện thoại thông minh, máy tính bảng, laptop đến desktop. Giao diện luôn hiển thị chuẩn chỉnh, dễ thao tác và mang đến trải nghiệm mượt mà cho người dùng dù ở bất kỳ đâu.
        </p>
      </div>
    </div>

    {/* Feature 3 - Mô tả dài và nổi bật hơn */}
    <div className="row align-items-center mb-5">
      <div className="col-md-6 mb-4 mb-md-0">
        <img
          src="/images/feature3.jpg"
          alt="Bảo mật dữ liệu"
          className="img-fluid rounded-4 shadow-lg"
          style={{
            transition: 'transform 0.4s ease',
            objectFit: 'cover',
            width: '100%',
            height: '320px',
            transform: 'scale(1) rotate(-1deg)',
          }}
          onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.05) rotate(0deg)')}
          onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1) rotate(-1deg)')}
        />
      </div>
      <div className="col-md-6">
        <h4 className="fw-bold text-danger mb-3">🔒 An toàn tuyệt đối với công nghệ bảo mật</h4>
        <p className="text-muted">
          Chúng tôi hiểu rằng thông tin cá nhân của bạn là tài sản quý giá. Hệ thống danh thiếp thông minh sử dụng công nghệ mã hóa hiện đại nhất để đảm bảo mọi dữ liệu được bảo vệ tối đa khỏi truy cập trái phép.
          <br /><br />
          Bạn có thể toàn quyền kiểm soát quyền hiển thị thông tin, đặt chế độ riêng tư theo từng nhóm người nhận, và theo dõi lịch sử truy cập theo thời gian thực. Bảo mật, linh hoạt và luôn trong tầm tay bạn.
        </p>
      </div>
    </div>
  </section>
);

export default Features;
