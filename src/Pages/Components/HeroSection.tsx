import { useEffect, useRef, useState } from "react";
import { authFetch } from "../../Utils/authFetch";

interface Props {
  isLogin: boolean;
  userId: string; // keycloakId
}

const Hero: React.FC<Props> = ({ isLogin, userId }) => {
  const [heroImage, setHeroImage] = useState<string | undefined>();
  const [userName, setUserName] = useState("Guest");
  const [career, setCareer] = useState<string | undefined>();
  const [usersId, setUsersId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [mediaType, setMediaType] = useState("USER");

  const [heroImageId, setHeroImageId] = useState<number | null>(null);


  useEffect(() => {
    if (userId) {
      fetchPublicUserInfo();
      fetchProfileByUser();
    }
  }, [userId]);

  useEffect(() => {
    if (usersId) {
      fetchHeroImage();
    }
  }, [usersId]);

  // --- THÊM useEffect NÀY ĐỂ THEO DÕI heroImageId SAU KHI NÓ THAY ĐỔI ---
  useEffect(() => {
    
  }, [heroImageId]);
  // ----------------------------------------------------------------------

  const fetchPublicUserInfo = async () => {
    try {
      const res = await fetch(`http://localhost:8080/users/public/${userId}`);
      const data = await res.json();
      const user = data.result;

      if (user?.firstName || user?.lastName) {
        setUserName(`${user.lastName} ${user.firstName}`);
        setUsersId(user.id);
      }
    } catch (err) {
      console.error("Error fetching public user info:", err);
    }
  };

  const fetchProfileByUser = async () => {
    try {
      const res = await fetch(`http://localhost:8080/profile/public/${userId}`);
      const data = await res.json();

      if (data.result?.career) {
        setCareer(data.result.career);
      }
    } catch (err) {
      console.error("Error fetching public profile:", err);
    }
  };

  const fetchHeroImage = async () => {
    try {
      const res = await fetch(`http://localhost:8080/media/public/${mediaType}/${usersId}`);
      const data = await res.json();

      if (data.result.length > 0) {
        const media = data.result[0];
        
        if (media.link) {
          setHeroImage(media.link);
          setHeroImageId(media.mediaId);
        }
      }
    } catch (err) {
      console.error("Error fetching hero image:", err);
    }
  };

  const deleteHeroImage = async () => {
    if (!heroImageId) return;

    try {
      const res = await authFetch(`/media/${heroImageId}`, {
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
    if (!file || !usersId) return;

    try {
      if (heroImageId) {
        await deleteHeroImage(); // Xóa ảnh cũ trước
      }

      const formData = new FormData();
      formData.append("entityType", mediaType);
      formData.append("entityId", usersId.toString());
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


  return (
    <div className="hero-container position-relative">
      <img
        src={heroImage}
        alt="Hero"
        className="hero-image"
      />
      <div className="hero-overlay d-flex flex-column justify-content-center ps-5">
        
      </div>

      {/* Hover Edit Button */}
      {isLogin && (
        <div className="edit-button-wrapper" onClick={handleEditImageClick}>
          <i className="fa-solid fa-pen"></i>
        </div>
      )}

      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        hidden
      />
    </div>
  );
};

export default Hero;