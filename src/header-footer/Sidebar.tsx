import React, { useEffect, useRef, useState } from "react";

interface SidebarProps {
  activeSection: string;
  isLogin: boolean;
  userId: string;
}

const Sidebar: React.FC<SidebarProps> = ({ activeSection, isLogin, userId }) => {
  const navItems = [
    { id: "hero", icon: "bi-house-door", label: "Home" },
    { id: "profile", icon: "bi-person-badge", label: "Profile" },
    { id: "skill", icon: "bi-lightning-charge", label: "Skills" },
    { id: "education", icon: "bi-mortarboard", label: "Education" },
    { id: "project", icon: "bi-collection", label: "Projects" },
    { id: "experience", icon: "bi-briefcase", label: "Experience" },
    { id: "contact", icon: "bi-envelope-at", label: "Contact" },
  ];

  const [avatar, setAvatar] = useState<string>("/images/User.png");
  const [userName, setUserName] = useState<string>("Guest");
  const [gitHub, setGitHub] = useState<string>("");
  const [facebook, setFacebook] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (userId) {
      fetchPublicUserInfo();
      fetchWebSites();
    }
  }, [userId]);

  const fetchPublicUserInfo = async () => {
    try {
      const res = await fetch(`http://localhost:8080/users/public/${userId}`);
      const data = await res.json();
      const user = data.result;

      if (user.image) {
        
        setAvatar(user.image);


      }
      if (user?.firstName || user?.lastName) {
        setUserName(`${user.lastName} ${user.firstName}`);
      }
    } catch (err) {
      console.error("Error fetching public user info:", err);
    }
  };

  const fetchWebSites = async () => {
    try {
      const res = await fetch(`http://localhost:8080/profile/public/${userId}`);
      const data = await res.json();

      if (data.result) {
        setGitHub(data.result.github);
        setFacebook(data.result.facebook);
      }
    } catch (err) {
      console.error("Error fetching public profile:", err);
    }
  };

  const handleEditAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("imageUrl", file);

    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch("http://localhost:8080/users/update/image", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to upload avatar");

      await fetchPublicUserInfo(); // cập nhật lại avatar
    } catch (err) {
      console.error("Error uploading avatar:", err);
    }
  };

  return (
    <div
      className="d-flex flex-column align-items-center text-center p-3"
      style={{
        backgroundColor: "#1f1f2e",
        minHeight: "100vh",
        width: "100%",
        position: "sticky",
        top: 0,
        borderRight: "1px solid #2d2d44",
      }}
    >
      {/* Avatar + Edit Button */}
      <div className="position-relative mb-3">
        <img
          src={avatar}
          alt="Avatar"
          className="rounded-circle shadow"
          style={{
            width: "120px",
            height: "120px",
            objectFit: "cover",
            border: "4px solid #3b82f6",
          }}
        />
        {isLogin && (
          <button
            onClick={handleEditAvatarClick}
            className="position-absolute d-flex align-items-center justify-content-center"
            style={{
              bottom: "4px",
              right: "4px",
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              backgroundColor: "#fff",
              border: "none",
              boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
              cursor: "pointer",
            }}
          >
            <i className="fa-solid fa-pen"></i>
          </button>
        )}
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
      </div>

      {/* User Name */}
      <h4 className="text-white mb-3 fw-bold">{userName}</h4>

      {/* Socials */}
      <div className="d-flex gap-4 mb-4">
        {gitHub && (
          <a
            href={gitHub}
            target="_blank"
            rel="noreferrer"
            className="text-white-50 fs-5"
          >
            <i className="fab fa-github"></i>
          </a>
        )}
        {facebook && (
          <a
            href={facebook}
            target="_blank"
            rel="noreferrer"
            className="text-white-50 fs-5"
          >
            <i className="fab fa-facebook"></i>
          </a>
        )}
      </div>

      {/* Menu */}
      <ul className="nav nav-pills flex-column w-100 px-2">
        {navItems.map((item) => (
          <li className="nav-item" key={item.id}>
            <a
              href={`#${item.id}`}
              className={`nav-link d-flex align-items-center px-3 py-2 my-1 rounded-3 ${activeSection === item.id
                  ? "active bg-primary text-white"
                  : "text-white-50"
                }`}
              style={{ transition: "all 0.3s ease", fontSize: "1rem" }}
            >
              <i className={`bi ${item.icon} me-3 fs-5`}></i>
              <span className="fw-medium">{item.label}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
