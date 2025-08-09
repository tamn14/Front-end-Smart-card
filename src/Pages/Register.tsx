import React, { useState } from "react";
import { Modal, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const RegisterUser = () => {
  // Các state đăng ký
  const [userId, setUserId] = useState();
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [thongBao, setThongBao] = useState("");

  // Lỗi validate
  const [errorPassword, setErrorPassword] = useState("");
  const [errorPasswordConfirm, setErrorPasswordConfirm] = useState("");

  // Modal nhập mã kích hoạt
  const [showActivationModal, setShowActivationModal] = useState(false);
  const [activationCode, setActivationCode] = useState("");
  const [activationMessage, setActivationMessage] = useState("");

  const navigate = useNavigate();

  const validatePassword = (pw: string): boolean => {
    if (pw.length < 6) {
      setErrorPassword("⚠️ Mật khẩu phải có ít nhất 6 ký tự");
      return false;
    }
    setErrorPassword("");
    return true;
  };

  const validatePasswordConfirm = (pwConfirm: string): boolean => {
    if (pwConfirm !== password) {
      setErrorPasswordConfirm("⚠️ Mật khẩu nhập lại không khớp");
      return false;
    }
    setErrorPasswordConfirm("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setErrorPassword("");
    setErrorPasswordConfirm("");
    setThongBao("");
    setActivationMessage("");

    const isPasswordValid = validatePassword(password);
    const isPasswordConfirmValid = validatePasswordConfirm(passwordConfirm);
    

    if (!isPasswordValid || !isPasswordConfirmValid) return;

    try {
      const response = await fetch("http://localhost:8080/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userName,
          email,
          password,
          lastName,
          firstName,
          address,
        }),
      });

      if (response.ok) {
        const data = await response.json();
      
        const newUserId = data.result.id;
        setUserId(newUserId);  // lấy id user mới tạo từ backend
        console.log(userId)
        setThongBao("🎉 Đăng ký thành công! Vui lòng kiểm tra email để kích hoạt.");
        setShowActivationModal(true);

        // Reset form
        setUserName("");
        setEmail("");
        setPassword("");
        setPasswordConfirm("");
        setLastName("");
        setFirstName("");
        setAddress("");
      } else {
        const errText = await response.text();
        setThongBao(`❌ Đăng ký thất bại: ${errText}`);
      }
    } catch (error) {
      setThongBao("❌ Lỗi kết nối, vui lòng thử lại sau.");
    }
  };
  
  const handleActivate = async () => {
    if (!userId) {
      setActivationMessage("❌ Không tìm thấy user để kích hoạt.");
      return;
    }
    setActivationMessage("");


    try {
      const response = await fetch(`http://localhost:8080/users/verify/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountNumber: activationCode,  // đúng với backend
        }),
      });

      if (response.ok) {
        setActivationMessage("✅ Kích hoạt tài khoản thành công!");
        setShowActivationModal(false);
         navigate("/login")
        
      } else {
        const errText = await response.text();
        setActivationMessage(`❌ Kích hoạt thất bại: ${errText}`);
      }
    } catch (error) {
      setActivationMessage("❌ Lỗi kết nối khi kích hoạt.");
    }
  };


  return (
    <div className="container my-5">
      {/* Form đăng ký */}
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card shadow-sm border-0 rounded-4">
            <div className="card-body p-5">
              <h3 className="text-center mb-4 fw-bold text-primary">📝 Đăng ký tài khoản</h3>

              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  {/* Tên đăng nhập */}
                  <div className="col-md-6">
                    <label className="form-label">Tên đăng nhập</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Nhập tên đăng nhập..."
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      required
                    />
                  </div>

                  {/* Email */}
                  <div className="col-md-6">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="Nhập email..."
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  {/* Họ đệm */}
                  <div className="col-md-6">
                    <label className="form-label">Họ đệm</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Nhập họ đệm..."
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </div>

                  {/* Tên */}
                  <div className="col-md-6">
                    <label className="form-label">Tên</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Nhập tên..."
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </div>

                  {/* Địa chỉ */}
                  <div className="col-12">
                    <label className="form-label">Địa chỉ</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Nhập địa chỉ..."
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      required
                    />
                  </div>

                  {/* Mật khẩu */}
                  <div className="col-md-6">
                    <label className="form-label">Mật khẩu</label>
                    <input
                      type="password"
                      className="form-control"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    {errorPassword && <div className="text-danger">{errorPassword}</div>}
                  </div>

                  {/* Nhập lại mật khẩu */}
                  <div className="col-md-6">
                    <label className="form-label">Nhập lại mật khẩu</label>
                    <input
                      type="password"
                      className="form-control"
                      value={passwordConfirm}
                      onChange={(e) => setPasswordConfirm(e.target.value)}
                      required
                    />
                    {errorPasswordConfirm && <div className="text-danger">{errorPasswordConfirm}</div>}
                  </div>

                  {/* Nút đăng ký */}
                  <div className="col-12 text-center mt-3">
                    <button type="submit" className="btn btn-primary btn-lg px-5 rounded-pill shadow">
                      Đăng ký
                    </button>
                  </div>

                  {/* Đăng nhập bằng Google */}
                  <div className="text-center mt-4 col-12">
                    <p>Hoặc đăng nhập bằng:</p>
                    <a
                      className="btn btn-lg w-80 mb-2"
                      style={{ backgroundColor: "#db4437", color: "#fff" }}
                      href="#!"
                    >
                      <i className="fab fa-google me-2"></i> Đăng nhập với Google
                    </a>
                  </div>
                </div>
              </form>

              {thongBao && (
                <div className="alert alert-info text-center mt-4" role="alert">
                  {thongBao}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal nhập mã kích hoạt */}
      <Modal show={showActivationModal} onHide={() => setShowActivationModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Kích hoạt tài khoản</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Vui lòng nhập mã kích hoạt bạn nhận được qua email:</p>
          <input
            type="text"
            className="form-control"
            placeholder="Mã kích hoạt"
            value={activationCode}
            onChange={(e) => setActivationCode(e.target.value)}
          />
          {activationMessage && <div className="mt-2">{activationMessage}</div>}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowActivationModal(false)}>
            Đóng
          </Button>
          <Button variant="primary" onClick={handleActivate}>
            Kích hoạt
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default RegisterUser;
