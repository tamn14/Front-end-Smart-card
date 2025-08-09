import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { setTokens } from "../Utils/auth";
import { jwtDecode } from "jwt-decode";

interface Props {
  setIsLogin: (value: boolean) => void;
}

const Login = ({ setIsLogin }: Props) => {
  const [username, setUserName] = useState("");
  const [password, setPassWord] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!username || !password) {
      setError("Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.");
      return;
    }

    try {
      const res = await fetch("http://localhost:8080/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userName: username, password }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Đăng nhập thất bại");
      }

      const data = await res.json();
      const accessToken = data.result.accessToken;
      const refreshToken = data.result.refreshToken;

      // Lưu token vào localStorage (hoặc cookie)
      setTokens(accessToken, refreshToken);
      setSuccess("Đăng nhập thành công");
      setIsLogin(true);

      // Giải mã token để lấy vai trò
      const decoded: any = jwtDecode(accessToken);
      const roles: string[] = decoded.realm_access?.roles || [];

      // Điều hướng theo quyền
      if (roles.includes("ADMIN")) {
        navigate("/admin");
      } else if (roles.includes("USER")) {
        navigate("/");
      } else {
        setError("Bạn không có quyền truy cập.");
      }
    } catch (err: any) {
      if (import.meta.env.MODE === "development") {
        console.error("Lỗi đăng nhập:", err);
      }
      setError("Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.");
    }
  };

  return (
    <div className="container py-5">
      <section className="vh-100 d-flex align-items-center justify-content-center">
        <div className="container h-100">
          <div className="row justify-content-center align-items-center h-100">
            <div className="col-lg-10 col-xl-8">
              <div className="card shadow-lg rounded-4 border-0">
                <div className="row g-0">
                  <div className="col-md-6 d-none d-md-block">
                    <img
                      src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-login-form/draw2.svg"
                      alt="login form"
                      className="img-fluid h-100 w-100 rounded-start-4"
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                  <div className="col-md-6">
                    <div className="card-body p-5">
                      <h3 className="mb-4 text-center fw-bold">Đăng nhập</h3>

                      {error && <div className="alert alert-danger text-center py-2">{error}</div>}
                      {success && <div className="alert alert-success text-center py-2">{success}</div>}

                      <form onSubmit={handleLogin}>
                        <div className="form-outline mb-4">
                          <input
                            type="text"
                            id="usernameInput"
                            className="form-control form-control-lg"
                            placeholder="Nhập username"
                            value={username}
                            onChange={(e) => setUserName(e.target.value)}
                          />
                          <label className="form-label" htmlFor="usernameInput">Username</label>
                        </div>

                        <div className="form-outline mb-4">
                          <input
                            type="password"
                            id="passwordInput"
                            className="form-control form-control-lg"
                            placeholder="Nhập password"
                            value={password}
                            onChange={(e) => setPassWord(e.target.value)}
                          />
                          <label className="form-label" htmlFor="passwordInput">Password</label>
                        </div>

                        <div className="d-flex justify-content-between align-items-center mb-4">
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id="rememberCheck"
                              defaultChecked
                            />
                            <label className="form-check-label" htmlFor="rememberCheck">
                              Ghi nhớ đăng nhập
                            </label>
                          </div>
                          <a href="#!" className="text-muted small">Quên mật khẩu?</a>
                        </div>

                        <button type="submit" className="btn btn-primary btn-lg w-100 mb-3">
                          Đăng nhập
                        </button>
                      </form>

                      <div className="divider d-flex align-items-center my-4">
                        <hr className="flex-grow-1" />
                        <p className="text-center fw-bold mx-3 mb-0 text-muted">HOẶC</p>
                        <hr className="flex-grow-1" />
                      </div>

                      <a
                        className="btn btn-lg w-100 mb-2"
                        style={{ backgroundColor: "#db4437", color: "#fff" }}
                        href={import.meta.env.VITE_GOOGLE_AUTH_URL || "/oauth2/authorization/google"}
                      >
                        <i className="fab fa-google me-2"></i> Đăng nhập với Google
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Login;
