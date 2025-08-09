import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

interface Props {
  setTuKhoaTimKiem: (value: string) => void;
  isLogin: boolean;
  setIsLogin: (value: boolean) => void;
}

const Navbar = ({ setTuKhoaTimKiem, isLogin, setIsLogin }: Props) => {
  const [inputText, setInputText] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const navigate = useNavigate();
  const [image, setImage] = useState();


  const fetchPublicUserInfo = async () => {
    try {
      const res = await fetch(`http://localhost:8080/users/public/${userId}`);
      const data = await res.json();
      const user = data.result;

      if (user.image) {
        setImage(user.image);

      }
    } catch (err) {
      console.error("Error fetching public user info:", err);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchPublicUserInfo();
    }
  }, [userId]);

  useEffect(() => {
    if (isLogin) {
      const token = localStorage.getItem("accessToken");
      if (token) {
        try {
          const decoded: any = jwtDecode(token);
          setUserId(decoded.sub);
        } catch (error) {
          console.error("Token không hợp lệ:", error);
        }
      }
    }
  }, [isLogin]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setTuKhoaTimKiem(inputText);
  };

  const handleLogout = async () => {
    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");

    if (!accessToken || !refreshToken) return;

    try {
      const res = await fetch("http://localhost:8080/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ accessToken, refreshToken }),
      });
      if (!res.ok) {
        const err = await res.json();

        throw new Error(err.message || "Logout thất bại");
      }

      // 🧹 Xoá token khỏi localStorage
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");

      // 👇 Cập nhật UI
      setIsLogin(false);
      setUserId(null);
      navigate("/");
    } catch (err) {
      console.error("Logout thất bại:", err);
      alert("Logout thất bại. Vui lòng thử lại.");
    }
  };
  const authButtons = (
    <>
      <Link to="/login" className="btn btn-outline-primary btn-sm">Login</Link>
      <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
    </>
  );

  const userDropdown = (
    <div className="dropdown text-end">
      <a
        href="#"
        className="d-block link-dark text-decoration-none dropdown-toggle"
        id="dropdownUser1"
        data-bs-toggle="dropdown"
        aria-expanded="false"
      >
        <img
          src={image != null ? image : "/images/User.png"}
          alt="avatar"
          width="32"
          height="32"
          className="rounded-circle"
        />
      </a>
      <ul className="dropdown-menu text-small" aria-labelledby="dropdownUser1">
        <li>
          {userId ? (
            <Link className="dropdown-item" to={`/portfolio/${userId}`}>
              Portfolio
            </Link>
          ) : (
            <span className="dropdown-item text-muted">Loading...</span>
          )}
        </li>
        <li><Link className="dropdown-item" to="/my-order">Orders</Link></li>
        <li><hr className="dropdown-divider" /></li>
        <li>
          <button className="dropdown-item" onClick={handleLogout}>
            Log out
          </button>
        </li>
      </ul>
    </div>
  );

  return (
    <div className="container-fluid p-0">
      <nav className="navbar navbar-expand-lg navbar-light bg-light border-bottom shadow-sm">
        <div className="container">
          <Link className="navbar-brand fw-bold text-primary" to="/">
            Smart<span className="text-dark">Card</span>
          </Link>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse justify-content-between" id="navbarNav">
            <ul className="navbar-nav">
              <li className="nav-item"><Link className="nav-link active" to="/">Trang chủ</Link></li>
              <li className="nav-item"><Link className="nav-link active" to="/sanpham">Sản phẩm</Link></li>
              <li className="nav-item"><Link className="nav-link active" to="/lienhe">Liên hệ</Link></li>
            </ul>

            <div className="d-flex align-items-center gap-3 mt-3 mt-lg-0">
              {isLogin ? userDropdown : authButtons}
            </div>
          </div>
        </div>
      </nav>

      <header className="py-4 bg-white border-bottom shadow-sm">
        <div className="container d-flex flex-wrap align-items-center justify-content-between">
          <form
            className="d-flex align-items-center ms-auto"
            role="search"
            onSubmit={handleSubmit}
          >
            <input
              type="search"
              className="form-control form-control-sm me-2"
              placeholder="Search card..."
              aria-label="Search"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            <button className="btn btn-outline-secondary btn-sm" type="submit">
              <i className="fa fa-search"></i>
            </button>
          </form>
        </div>
      </header>
    </div>
  );
};

export default Navbar;
