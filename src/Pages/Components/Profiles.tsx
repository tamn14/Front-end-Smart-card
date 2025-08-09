// ProfilePage.tsx
import React, { useEffect, useRef, useState } from "react";
import { authFetch } from "../../Utils/authFetch";

interface Props {
  isLogin: boolean;
  userId: string;
}

const ProfilePage: React.FC<Props> = ({ isLogin, userId }) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [profileImage, setProfileImage] = useState();


  const [media, setMedia] = useState<string | undefined>();
  const [mediaId, setMediaId] = useState<number | null>(null);
  const [mediaType] = useState("PROFILES");

  const [userInfo, setUserInfo] = useState({
    firstName: "Enter your firstname",
    lastName: "Enter your lastname",
    email: "Enter your email",
    address: "Enter your address",
  });

  const [profileInfo, setProfileInfo] = useState({
    hobby: "Enter your hobby",
    github: "Enter your github",
    facebook: "Enter your facebook",
    degree: "Enter your degree",
    summary: "Your summary",
    career: "Your career",
  });

  const [usersId, setUsersId] = useState<number | null>(null);
  const [profileId, setProfileId] = useState<number | null>(null);
  const [tempValue, setTempValue] = useState<string>("");
  const [editingField, setEditingField] = useState<string | null>(null);
  const [isHovering, setIsHovering] = useState(false);




  const deleteProfileImage = async () => {
    if (!mediaId) return;

    try {
      const res = await authFetch(`/media/${mediaId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete old hero image");
      }

      console.log("Old hero image deleted");
    } catch (err) {
      console.error("Error deleting old hero image:", err);
    }
  };


  const handleEditImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profileId) return;

    try {
      if (mediaId) {
        await deleteProfileImage(); // Xóa ảnh cũ trước
      }

      const formData = new FormData();
      formData.append("entityType", mediaType);
      formData.append("entityId", profileId.toString());
      formData.append("fileType", file.type);
      formData.append("fileName", file.name);
      formData.append("imageUrl", file);

      const res = await authFetch("/media", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to upload hero image");

      await fetchHeroImage(); // Cập nhật lại giao diện
    } catch (err) {
      console.error("Error uploading hero image:", err);
    }
  };




  const updateUserField = async (field: keyof typeof userInfo, value: string) => {
    try {
      await authFetch(`/users/${usersId}`, {
        method: "PUT",
        body: JSON.stringify({ [field]: value }),
      });
    } catch (err) {
      console.error("Update user failed:", err);
    }
  };

  const updateProfileField = async (field: keyof typeof profileInfo, value: string) => {
    try {
      const payload = { [field]: value, userId: usersId };

      if (!profileId) {
        const res = await authFetch(`/profile`, {
          method: "POST",
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        setProfileId(data.id);
      } else {
        await authFetch(`/profile/${profileId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      }
    } catch (err) {
      console.error("Update profile failed:", err);
    }
  };

  const fetchPublicUserInfo = async () => {
    try {
      // 1. Lấy dữ liệu từ users
      const resUser = await fetch(`http://localhost:8080/users/public/${userId}`);
      const dataUser = await resUser.json();
      const user = dataUser.result;

      if (user) {
        setUserInfo({
          firstName: user.firstName ?? "Enter your firstname",
          lastName: user.lastName ?? "Enter your lastname",
          email: user.email ?? "Enter your email",
          address: user.address ?? "Enter your address",
        });
      }

      // 2. Lấy dữ liệu từ profile riêng
      const resProfile = await fetch(`http://localhost:8080/profile/public/${userId}`);
      const dataProfile = await resProfile.json();
      const profile = dataProfile.result?.[0]; // là mảng

      if (profile) {
        setProfileInfo({
          career: profile.career ?? "Your career",
          hobby: profile.hobby ?? "Enter your hobby",
          github: profile.github ?? "Enter your github",
          facebook: profile.facebook ?? "Enter your facebook",
          degree: profile.degree ?? "Enter your degree",
          summary: profile.summary ?? "Your summary",
        });



      }

     
      setProfileId(profile.profileId);

    } catch (err) {
      console.error("Error fetching public user info:", err);
    }
  };


  const fetchHeroImage = async () => {
    try {
      const res = await fetch(`http://localhost:8080/media/public/${mediaType}/${profileId}`);
      const data = await res.json();

      if (data.result.length > 0) {
        const media = data.result[0];

        if (media.link) {
          setMedia(media.link);
          setMediaId(media.mediaId);
          setProfileImage(media.link); 
        }
      }

    } catch (err) {
      console.error("Error fetching profile image:", err);
    }
  };

  useEffect(() => {
    if (userId) fetchPublicUserInfo();
  }, [userId]);

  useEffect(() => {
    if (profileId) fetchHeroImage();
  }, [profileId]);

  const renderField = (
    label: string,
    value: string,
    setValue: (val: string) => void,
    fieldKey: string,
    fieldType: "user" | "profile"
  ) => {
    const isEditing = editingField === fieldKey;

    return (
      <li className="mb-3">
        <div className="d-flex justify-content-between align-items-start">
          <div className="flex-grow-1">
            <strong>{label}:</strong>
            {isEditing ? (
              <>
                <input
                  type="text"
                  value={tempValue}
                  onChange={(e) => setTempValue(e.target.value)}
                  className="form-control mt-1"
                />
                <div className="mt-2">
                  <button
                    className="btn btn-sm btn-success me-2"
                    onClick={() => {
                      setValue(tempValue);
                      setEditingField(null);
                      fieldType === "user"
                        ? updateUserField(fieldKey as keyof typeof userInfo, tempValue)
                        : updateProfileField(fieldKey as keyof typeof profileInfo, tempValue);
                    }}
                  >
                    Save
                  </button>
                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={() => setEditingField(null)}
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : ["github", "facebook"].includes(fieldKey) ? (
              <a
                href={value.startsWith("http") ? value : `https://${value}`}
                target="_blank"
                rel="noopener noreferrer"
                className="ms-2 d-inline-block text-break text-primary text-decoration-none"
                style={{
                  wordBreak: "break-word",
                  whiteSpace: "normal",
                }}
              >
                {value}
              </a>
            ) : (
              <span
                className="ms-2 text-break"
                style={{ wordBreak: "break-word", whiteSpace: "normal" }}
              >
                {value}
              </span>
            )}
          </div>

          {isLogin && !isEditing && (
            <i
              className="fa-solid fa-pen text-primary ms-2 mt-1"
              style={{ cursor: "pointer" }}
              onClick={() => {
                setTempValue(value);
                setEditingField(fieldKey);
              }}
            />
          )}
        </div>
      </li>
    );
  };


  return (
    <section id="about" className="about section py-5">
      <div className="container text-center mb-5" data-aos="fade-up">
        <h2 className="text-center fw-bold mb-5 text-white">
          <i className="bi bi-person-lines-fill me-3 text-primary" /> Profiles
        </h2>
      </div>

      <div className="container" data-aos="fade-up" data-aos-delay="100">
        <div className="row gy-4 justify-content-center align-items-center">
          <div
            className="col-lg-4 text-center position-relative"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            <div className="position-relative d-inline-block">
              <img
                src={profileImage}
                className="img-fluid rounded shadow"
                alt="Profile"
                style={{ maxHeight: "300px", objectFit: "cover" }}
              />
              {isLogin && isHovering && (
                <div
                  className="position-absolute bottom-0 end-0 m-2 bg-white rounded-circle p-2 shadow"
                  style={{ cursor: "pointer" }}
                  onClick={handleEditImageClick}
                >
                  <i className="fa-solid fa-pen text-black"></i>
                </div>
              )}
            </div>
            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} hidden />
          </div>

          <div className="col-lg-8">
            <div className="row">
              <div className="col-lg-6">
                <ul className="list-unstyled">
                  {renderField("Lastname", userInfo.lastName, (v) => setUserInfo((prev) => ({ ...prev, lastName: v })), "lastName", "user")}
                  {renderField("Firstname", userInfo.firstName, (v) => setUserInfo((prev) => ({ ...prev, firstName: v })), "firstName", "user")}
                  {renderField("Email", userInfo.email, (v) => setUserInfo((prev) => ({ ...prev, email: v })), "email", "user")}
                  {renderField("Address", userInfo.address, (v) => setUserInfo((prev) => ({ ...prev, address: v })), "address", "user")}
                  {renderField("Your Career", profileInfo.career, (v) => setProfileInfo((prev) => ({ ...prev, career: v })), "career", "profile")}
                </ul>
              </div>
              <div className="col-lg-6">
                <ul className="list-unstyled">
                  {renderField("Hobby", profileInfo.hobby, (v) => setProfileInfo((prev) => ({ ...prev, hobby: v })), "hobby", "profile")}
                  {renderField("Github", profileInfo.github, (v) => setProfileInfo((prev) => ({ ...prev, github: v })), "github", "profile")}
                  {renderField("Facebook", profileInfo.facebook, (v) => setProfileInfo((prev) => ({ ...prev, facebook: v })), "facebook", "profile")}
                  {renderField("Degree", profileInfo.degree, (v) => setProfileInfo((prev) => ({ ...prev, degree: v })), "degree", "profile")}
                </ul>
              </div>
            </div>

            <div className="mt-4">
              <h5 className="fw-bold">Summary</h5>
              {editingField === "summary" ? (
                <>
                  <textarea
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                    className="form-control"
                    rows={4}
                  />
                  <div className="mt-2">
                    <button
                      className="btn btn-sm btn-success me-2"
                      onClick={() => {
                        setProfileInfo((prev) => ({ ...prev, summary: tempValue }));
                        setEditingField(null);
                        updateProfileField("summary", tempValue);
                      }}
                    >
                      Save
                    </button>
                    <button className="btn btn-sm btn-secondary" onClick={() => setEditingField(null)}>
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <p>
                  {profileInfo.summary}
                  {isLogin && (
                    <i
                      className="fa-solid fa-pen text-primary ms-2"
                      style={{ cursor: "pointer" }}
                      onClick={() => {
                        setTempValue(profileInfo.summary);
                        setEditingField("summary");
                      }}
                    />
                  )}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProfilePage;
