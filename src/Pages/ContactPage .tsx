import { useState } from "react";

const ContactPage = () => {
  const [name, setName] = useState("");
  const [from, setFrom] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", name);
    formData.append("from", from);
    formData.append("title", title);
    formData.append("content", content);

    try {
      const response = await fetch("http://localhost:8080/mail/customer", {
        method: "POST",
        body: formData
      });

      const result = await response.json();
      console.log("API trả về:", result);
      alert("Gửi liên hệ thành công!");
    } catch (err) {
      console.error("Lỗi khi gửi:", err);
      alert("Gửi liên hệ thất bại!");
    }
  };

  return (
    <div className="container py-5">
      <div className="row g-4">

        {/* FORM LIÊN HỆ */}
        <div className="col-lg-6">
          <div className="bg-white shadow rounded-4 p-4 h-100">
            <h2 className="fw-bold mb-3">📬 Gửi liên hệ cho chúng tôi</h2>
            <p className="text-muted mb-4">
              Nếu bạn có câu hỏi hoặc cần hỗ trợ, hãy điền vào biểu mẫu bên dưới.
            </p>

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label fw-semibold">Họ và tên</label>
                <input
                  type="text"
                  className="form-control rounded-3"
                  placeholder="Nhập họ tên của bạn"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Email</label>
                <input
                  type="email"
                  className="form-control rounded-3"
                  placeholder="example@email.com"
                  required
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Tiêu đề</label>
                <input
                  type="text"
                  className="form-control rounded-3"
                  placeholder="Tiêu đề liên hệ"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="mb-4">
                <label className="form-label fw-semibold">Nội dung</label>
                <textarea
                  className="form-control rounded-3"
                  rows={5}
                  placeholder="Nhập nội dung..."
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>

              <button type="submit" className="btn btn-primary rounded-pill px-4 fw-semibold">
                Gửi liên hệ
              </button>
            </form>
          </div>
        </div>

        {/* THÔNG TIN CÔNG TY + MAP */}
        <div className="col-lg-6">
          <div className="bg-white shadow rounded-4 p-4 h-100 d-flex flex-column justify-content-between">

            <div>
              <h2 className="fw-bold mb-3">🏢 Thông tin công ty</h2>
              <ul className="list-unstyled text-muted">
                <li className="mb-2">
                  <strong>📍 Địa chỉ:</strong> 123 Nguyễn Văn Cừ, Quận 5, TP. Hồ Chí Minh
                </li>
                <li className="mb-2">
                  <strong>📞 Điện thoại:</strong> 0123 456 789
                </li>
                <li className="mb-2">
                  <strong>📧 Email:</strong> lienhe@cuahang.com
                </li>
                <li className="mb-2">
                  <strong>🕒 Giờ làm việc:</strong> Thứ 2 - Thứ 7 (8:00 - 17:30)
                </li>
              </ul>
            </div>

            <div className="mt-4">
              <h6 className="fw-semibold mb-2">📌 Bản đồ vị trí:</h6>
              <div className="ratio ratio-4x3 rounded-3 overflow-hidden shadow-sm">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.7629182856334!2d106.67998331533408!3d10.752682492340897!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752ed9bb44bdbf%3A0xe4c62c4e95be0ec0!2zMTIzIE5ndXnhu4VuIFbEg24gQ-G7rSwgUXXhuq1uIDUsIFRow6BuaCBwaOG7kSBI4buTIENow60gTWluaCBDaXR5!5e0!3m2!1sen!2s!4v1620000000000!5m2!1sen!2s"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={false}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Bản đồ Google"
                ></iframe>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
