import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { authFetch } from "../../../Utils/authFetch";

// Định nghĩa các interfaces
interface Props {
   isLogin: boolean;
  setIsLogin: (value: boolean) => void;
}

interface ApiResponse<T> {
  code: number;
  mess: string;
  result: T;
}

interface UsersResponse {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  image: string;
}

const SidebarAdmin: React.FC<Props> = ({ isLogin, setIsLogin }) => {
  const location = useLocation();
  const [userName, setUserName] = useState("Admin");
  const [avatar, setAvatar] = useState("/images/hero-bg.jpg");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const navigate = useNavigate();

  const isExactPath = (path: string) => location.pathname === path;

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
      navigate("/login");
    } catch (err) {
      console.error("Logout thất bại:", err);
      alert("Logout thất bại. Vui lòng thử lại.");
    }
  };

  const fetchAdminInfo = async () => {
    try {
      const res = await authFetch("/users/me");
      const data: ApiResponse<UsersResponse> = await res.json();
      const user = data.result;

      if (user) {
        if (user.firstName || user.lastName) {
          setUserName(`${user.lastName} ${user.firstName}`);
        }
        if (user.image) {
          setAvatar(user.image);
        }
      }
    } catch (err) {
      console.error("Lỗi khi tải thông tin admin:", err);
    }
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await authFetch("/users/update/image", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        fetchAdminInfo();
        alert("Cập nhật ảnh đại diện thành công!");
      } else {
        alert("Cập nhật ảnh đại diện thất bại.");
        console.error("Lỗi khi cập nhật avatar:", await res.text());
      }
    } catch (err) {
      alert("Đã xảy ra lỗi trong quá trình cập nhật.");
      console.error("Lỗi khi gửi request cập nhật avatar:", err);
    }
  };

  const handleIconClick = () => {
    fileInputRef.current?.click();
  };

  useEffect(() => {
    if (isLogin) {
      fetchAdminInfo();
    }
  }, [isLogin]);

  return (
    <div className="d-flex flex-column h-100 p-3 bg-dark text-white">
      <div className="text-center mb-4">
        {/* Vùng chứa avatar và icon cập nhật */}
        <div style={{ position: "relative", display: "inline-block" }}>
          <img
            src={avatar}
            alt="Profile"
            className="img-fluid rounded-circle mb-2"
            style={{ width: "100px", height: "100px", objectFit: "cover" }}
          />
          {/* Biểu tượng (icon) cập nhật ảnh */}
          <div
            onClick={handleIconClick}
            style={{
              position: "absolute",
              bottom: "5px",
              right: "5px",
              cursor: "pointer",
              backgroundColor: "rgba(0, 0, 0, 0.6)",
              borderRadius: "50%",
              padding: "8px",
            }}
          >
            <i className="bi bi-camera-fill text-white fs-6"></i>
          </div>
        </div>
        {/* Input file ẩn */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleAvatarChange}
          style={{ display: "none" }}
          accept="image/*"
        />
        <h5 className="mt-2">{userName}</h5>
      </div>

      <ul className="nav nav-pills flex-column mb-auto">
        <li className="nav-item">
          <Link
            to="/admin"
            className={`nav-link ${isExactPath("/admin") ? "active" : "text-white"}`}
          >
            <i className="bi bi-house me-2"></i> Dashboard
          </Link>
        </li>
        <li>
          <Link
            to="/admin/card"
            className={`nav-link ${isExactPath("/admin/card") ? "active" : "text-white"}`}
          >
            <i className="bi bi-credit-card me-2"></i> Card
          </Link>
        </li>
        <li>
          <Link
            to="/admin/orders"
            className={`nav-link ${isExactPath("/admin/orders") ? "active" : "text-white"}`}
          >
            <i className="bi bi-cart-check me-2"></i> Orders
          </Link>
        </li>
        <li>
          <Link
            to="/admin/customers"
            className={`nav-link ${isExactPath("/admin/customers") ? "active" : "text-white"}`}
          >
            <i className="bi bi-people me-2"></i> Customers
          </Link>
        </li>
      </ul>

      <hr className="text-white" />

      <button
        className="btn btn-outline-danger w-100 mt-auto"
        onClick={handleLogout}
      >
        <i className="bi bi-box-arrow-right me-2"></i> Logout
      </button>
    </div>
  );
};

export default SidebarAdmin;