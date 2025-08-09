import { form } from "framer-motion/client";
import React, { useEffect, useState } from "react";

interface Props {
  isLogin: boolean;
  userId: string;
}

// Helper function
const formatDate = (dateStr?: string) => {
  if (!dateStr) return "";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(dateStr));
};

const ContactSection: React.FC<Props> = ({ isLogin, userId }) => {
  const [userInfo, setUserInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    address: "",
    createAt: "",
    enable: true,
    image: "",
  });

  const [profileInfo, setProfileInfo] = useState({
    github: "",
    facebook: "",
  });

  

  const [name, setName] = useState("");
  const [from, setFrom] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const handleSubmitSendMail = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", name);
    formData.append("from", from);
    formData.append("title", title);
    formData.append("content", content);

    try {
      const response = await fetch("http://localhost:8080/mail/connect", {
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


  const fetchPublicUserInfo = async () => {
    try {
      const resUser = await fetch(`http://localhost:8080/users/public/${userId}`);
      const dataUser = await resUser.json();
      const user = dataUser.result;

      if (user) {
        setUserInfo({
          firstName: user.firstName ?? "",
          lastName: user.lastName ?? "",
          email: user.email ?? "",
          address: user.address ?? "",
          createAt: user.createAt ?? "",
          enable: user.enable ?? true,
          image: user.image ?? "",
        });
      }

      const resProfile = await fetch(`http://localhost:8080/profile/public/${userId}`);
      const dataProfile = await resProfile.json();
      const profile = dataProfile.result?.[0];

      if (profile) {
        setProfileInfo({
          github: profile.github ?? "",
          facebook: profile.facebook ?? "",
        });
      }
    } catch (err) {
      console.error("Error fetching public user info:", err);
    }
  };

  useEffect(() => {
    if (userId) fetchPublicUserInfo();
  }, [userId]);

  

  return (
    <section id="contact" className="py-5 bg-light">
      <div className="container">
        <h2 className="text-center fw-bold mb-5 text-dark">
          <i className="bi bi-person-lines-fill me-3 text-primary"></i>Get In Touch
        </h2>

        <div className="row g-5 justify-content-center">
          {/* Contact Info */}
          <div className="col-lg-5 col-md-7">
            <div className="card shadow-lg border-0 rounded-4 p-4 h-100">
              <div className="card-body text-center d-flex flex-column align-items-center justify-content-center">
                <div className="mb-4">
                  <img
                    src={userInfo.image || "/images/default-avatar.jpg"}
                    alt="User Avatar"
                    className="img-fluid rounded-circle shadow-sm border border-3 border-light"
                    style={{ width: 140, height: 140, objectFit: "cover" }}
                  />
                </div>
                <h3 className="fw-bold text-dark mb-2">
                  {userInfo.firstName} {userInfo.lastName}
                </h3>
                <p className="text-muted mb-3 lh-base">
                  <i className="bi bi-geo-alt-fill me-2 text-danger"></i>
                  {userInfo.address}
                </p>

                <ul className="list-unstyled text-start w-100 px-lg-4 mb-4">
                  <li className="d-flex align-items-center mb-3">
                    <i className="bi bi-envelope-at-fill me-3 fs-5 text-primary"></i>
                    <a href={`mailto:${userInfo.email}`} className="text-decoration-none text-body fw-semibold">
                      {userInfo.email}
                    </a>
                  </li>
                  <li className="d-flex align-items-center mb-3">
                    <i className="bi bi-calendar-check-fill me-3 fs-5 text-success"></i>
                    <span className="text-body">
                      Joined: <span className="text-muted">{formatDate(userInfo.createAt)}</span>
                    </span>
                  </li>
                  <li className="d-flex align-items-center">
                    <i className={`bi ${userInfo.enable ? "bi-check-circle-fill text-success" : "bi-x-circle-fill text-danger"} me-3 fs-5`}></i>
                    <span className="text-body">
                      {userInfo.enable ? "Account Active" : "Account Disabled"}
                    </span>
                  </li>
                </ul>

                <div className="d-flex justify-content-center gap-3 mt-auto">
                  {profileInfo.github && (
                    <a
                      href={profileInfo.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline-dark btn-lg rounded-circle d-flex align-items-center justify-content-center"
                      style={{ width: '48px', height: '48px' }}
                      aria-label="GitHub"
                    >
                      <i className="fab fa-github"></i>
                    </a>
                  )}
                  {profileInfo.facebook && (
                    <a
                      href={profileInfo.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline-primary btn-lg rounded-circle d-flex align-items-center justify-content-center"
                      style={{ width: '48px', height: '48px' }}
                      aria-label="Facebook"
                    >
                      <i className="fab fa-facebook-f"></i>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="col-lg-7 col-md-9">
            <div className="card shadow-lg border-0 rounded-4 p-4 h-100">
              <div className="card-body">
                <h4 className="fw-bold text-primary mb-4">Send Me a Message</h4>
                <form onSubmit={handleSubmitSendMail}>
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label fw-semibold">Your Name</label>
                    <input
                      type="text"
                      className="form-control"
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label fw-semibold">Your Email</label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      value={from}
                      onChange={(e) => setFrom(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="subject" className="form-label fw-semibold">Subject</label>
                    <input
                      type="text"
                      className="form-control"
                      id="subject"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="message" className="form-label fw-semibold">Message</label>
                    <textarea
                      className="form-control"
                      id="message"
                      rows={5}
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      required
                    ></textarea>
                  </div>
                  <div className="d-grid">
                    <button type="submit" className="btn btn-primary btn-lg rounded-pill">
                      <i className="bi bi-send-fill me-2"></i>Send Message
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
