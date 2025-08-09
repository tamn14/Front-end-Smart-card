import React, { useState, useEffect, useCallback } from "react";
import { authFetch } from "../../Utils/authFetch"; // Đảm bảo đường dẫn đúng

// --- Types Definitions ---
type MediaFile = {
  mediaId?: number; // Thêm mediaId để dễ dàng xóa media cụ thể
  fileUrl: string;
  type: "image" | "video";
};

interface Skill {
  skillId: number;
  name: string;
  level: number;
  mediaFiles: MediaFile[];
}

interface Props {
  isLogin: boolean;
  userId: string; // userId của người dùng đang đăng nhập
}

// --- Main SkillManager Component ---
const SkillManager: React.FC<Props> = ({ isLogin, userId }) => {
  // --- State for Skill list ---
  const [skills, setSkills] = useState<Skill[]>([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mediaType] = useState("SKILL");

  // --- Common States for Modals/Editing ---
  const [filters, setFilters] = useState<{ [id: number]: "all" | "image" | "video" }>({});
  const [editing, setEditing] = useState<{
    section: string;
    id: number;
    field: string;
    value: string
  } | null>(null);

  // Add Form States
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSkill, setNewSkill] = useState({ name: "", level: 0 });

  // Media Management States
  const [showAddMediaModal, setShowAddMediaModal] = useState(false);
  const [currentEntityForMedia, setCurrentEntityForMedia] = useState<{
    section: string;
    id: number; // skillId
  } | null>(null);
  const [viewingMedia, setViewingMedia] = useState<MediaFile | null>(null);

  // --- Utility Functions ---
  const getProgressColor = (level: number): string => {
    if (level >= 85) return "bg-success";
    if (level >= 70) return "bg-warning";
    return "bg-danger";
  };

  // --- API Interaction Functions ---

  // 1. Fetch Skills from DB
  const fetchSkills = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`http://localhost:8080/skill/public/${userId}`);
      if (!res.ok) {
        throw new Error(`Failed to fetch skills: ${res.statusText}`);
      }
      const data = await res.json();
      if (data.result) {
        // Fetch media for each skill
        const skillsWithMedia = await Promise.all(data.result.map(async (skill: Skill) => {
          const mediaRes = await fetch(`http://localhost:8080/media/public/${mediaType}/${skill.skillId}`);
          if (!mediaRes.ok) {
            console.warn(`Failed to fetch media for skill ${skill.skillId}: ${mediaRes.statusText}`);
            return { ...skill, mediaFiles: [] }; // Trả về skill không có media nếu lỗi
          }
          const mediaData = await mediaRes.json();
          // Map link to fileUrl and add type based on fileType
          const formattedMedia = mediaData.result.map((m: any) => ({
            mediaId: m.mediaId, // Lưu trữ mediaId từ backend
            fileUrl: m.link,
            type: m.fileType.startsWith("image") ? "image" : "video"
          }));
          return { ...skill, mediaFiles: formattedMedia };
        }));
        setSkills(skillsWithMedia);
      } else {
        setSkills([]);
      }
    } catch (err: any) {
      console.error("Error fetching skills:", err);
      setError(err.message || "An error occurred while fetching skills.");
      setSkills([]); // Reset skills on error
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]);

  // 2. Add New Skill
  const handleAddSkill = async () => {
    if (!isLogin) {
      alert("Bạn cần đăng nhập để thêm Skill mới!");
      return;
    }
    if (!newSkill.name.trim()) {
      alert("Tên Skill không được để trống!");
      return;
    }

    try {
      const res = await authFetch("/skill", {
        method: "POST",
        body: JSON.stringify({
          name: newSkill.name,
          level: newSkill.level,

        }),
      });

      if (!res.ok) {
        throw new Error(`Failed to add skill: ${res.statusText}`);
      }
      const addedSkill = await res.json();
      // Thêm skill mới vào state, khởi tạo mediaFiles rỗng
      setSkills(prevSkills => [...prevSkills, { ...addedSkill, mediaFiles: [] }]);
      setNewSkill({ name: "", level: 0 });
      setShowAddForm(false);
      await fetchSkills();
    } catch (err: any) {
      console.error("Error adding skill:", err);
      alert(`Lỗi khi thêm Skill: ${err.message}`);
    }
  };

  // 3. Update Skill Information (Name or Level)
  const handleUpdateField = async () => {
    if (!isLogin) {
      alert("Bạn cần đăng nhập để chỉnh sửa thông tin!");
      setEditing(null);
      return;
    }
    if (!editing) return;

    const { id, field, value } = editing;

    const skillToUpdate = skills.find(s => s.skillId === id);
    if (!skillToUpdate) return;

    const updatedPayload = {
      name: field === "name" ? value : skillToUpdate.name,
      level: field === "level" ? parseInt(value) : skillToUpdate.level
    };

    try {
      const res = await authFetch(`/skill/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(updatedPayload),
      });

      if (!res.ok) {
        throw new Error(`Failed to update skill: ${res.statusText}`);
      }

      setSkills(prev =>
        prev.map(s =>
          s.skillId === id
            ? { ...s, ...updatedPayload }
            : s
        )
      );

      setEditing(null);
      await fetchSkills();
    } catch (err: any) {
      console.error("Error updating skill field:", err);
      alert(`Lỗi khi cập nhật: ${err.message}`);
    }
  };


  // 4. Delete Skill
  const handleDeleteSkill = async (idToDelete: number) => {
    if (!isLogin) {
      alert("Bạn cần đăng nhập để xóa Skill!");
      return;
    }
    if (!window.confirm("Bạn có chắc chắn muốn xóa Skill này?")) {
      return;
    }

    try {
      const res = await authFetch(`/skill/${idToDelete}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error(`Failed to delete skill: ${res.statusText}`);
      }

      // Xóa skill khỏi state
      setSkills(prev => prev.filter(s => s.skillId !== idToDelete));
      alert("Skill đã được xóa thành công!");
    } catch (err: any) {
      console.error("Error deleting skill:", err);
      alert(`Lỗi khi xóa Skill: ${err.message}`);
    }
  };

  // 5. Add Media to Skill
  const handleMediaFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isLogin) {
      alert("Bạn cần đăng nhập để tải lên media!");
      e.target.value = ''; // Clear the input
      return;
    }

    const file = e.target.files?.[0];
    if (!file || !currentEntityForMedia) return;

    const fileType = file.type.startsWith("image/") ? "image" : file.type.startsWith("video/") ? "video" : null;

    if (!fileType) {
      console.error("Unsupported file type.");
      alert("Loại file không được hỗ trợ. Vui lòng chọn ảnh hoặc video.");
      e.target.value = '';
      return;
    }

    try {
      const formData = new FormData();
      formData.append("entityType", "SKILL");
      formData.append("entityId", currentEntityForMedia.id.toString());
      formData.append("fileType", file.type);
      formData.append("fileName", file.name);
      formData.append("imageUrl", file); // Tên trường này phải khớp với backend

      const res = await authFetch("/media", {
        method: "POST",
        body: formData,
        // Headers Content-Type không cần thiết khi gửi FormData, trình duyệt sẽ tự đặt
      });

      if (!res.ok) {
        throw new Error(`Failed to upload media: ${res.statusText}`);
      }

      const newMediaData = await res.json(); // Backend trả về thông tin media đã upload
      const newMediaFile: MediaFile = {
        mediaId: newMediaData.id, // Lấy mediaId từ response của backend
        fileUrl: newMediaData.link, // Lấy link từ response của backend
        type: fileType
      };

      // Cập nhật state Skills với media mới
      setSkills(prevSkills =>
        prevSkills.map(skill =>
          skill.skillId === currentEntityForMedia.id
            ? { ...skill, mediaFiles: [...skill.mediaFiles, newMediaFile] }
            : skill
        )
      );

      setShowAddMediaModal(false);
      setCurrentEntityForMedia(null);
      e.target.value = '';
      alert("Media đã được tải lên thành công!");
      await fetchSkills();
    } catch (err: any) {
      console.error("Error uploading media:", err);
      alert(`Lỗi khi tải lên media: ${err.message}`);
    }
  };

  // 6. Delete Media from Skill
  const handleDeleteMedia = async (skillId: number, mediaIdToDelete: number, fileUrlToDelete: string) => {
    if (!isLogin) {
      alert("Bạn cần đăng nhập để xóa media!");
      return;
    }
    if (!window.confirm("Bạn có chắc chắn muốn xóa media này?")) {
      return;
    }

    try {
      const res = await authFetch(`/media/${mediaIdToDelete}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error(`Failed to delete media: ${res.statusText}`);
      }

      // Cập nhật state Skills sau khi xóa media
      setSkills((prevSkills) =>
        prevSkills.map((skill) =>
          skill.skillId === skillId
            ? {
              ...skill,
              mediaFiles: skill.mediaFiles.filter((media) => media.mediaId !== mediaIdToDelete),
            }
            : skill
        )
      );
      alert("Media đã được xóa thành công!");
    } catch (err: any) {
      console.error("Error deleting media:", err);
      alert(`Lỗi khi xóa media: ${err.message}`);
    }
  };

  const handleFilter = (id: number, type: "all" | "image" | "video") => {
    setFilters((prev) => ({ ...prev, [id]: type }));
  };

  const handleViewMedia = (media: MediaFile) => {
    setViewingMedia(media);
  };

  const closeViewMediaModal = () => {
    setViewingMedia(null);
  };

  // Hàm renderField đã được cập nhật để sử dụng handleUpdateField
  const renderField = (
    label: string,
    value: string,
    section: string,
    field: string,
    type: string = "text",
    isTextArea: boolean = false
  ) => {
    const isEditing = editing?.section === section && editing.id === (currentEntityForMedia?.section === section ? currentEntityForMedia.id : editing.id) && editing.field === field;

    const InputComponent = isTextArea ? 'textarea' : 'input';

    return (
      <p className="mb-2 d-flex align-items-start">
        <strong className="me-2">{label}:</strong>
        {isEditing ? (
          <div className="d-flex flex-column w-100">
            <InputComponent
              type={type}
              className={`form-control form-control-sm ${isTextArea ? 'mb-2' : 'me-2'}`}
              value={editing?.value || ''} // Dùng optional chaining và fallback rỗng
              onChange={(e) => setEditing({ ...editing!, value: e.target.value })} // Dùng non-null assertion hoặc kiểm tra
              onKeyDown={(e) => { if (e.key === 'Enter' && !isTextArea) handleUpdateField(); }}
              rows={isTextArea ? 3 : undefined}
            />
            <div className="d-flex justify-content-end">
              <button className="btn btn-success btn-sm" onClick={handleUpdateField}>
                <i className="fas fa-check"></i>
              </button>
              <button className="btn btn-secondary btn-sm ms-2" onClick={() => setEditing(null)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
          </div>
        ) : (
          <>
            <span className="flex-grow-1">{value}</span>
            {isLogin && (
              <button
                className="btn btn-link text-primary p-0 ms-2"
                onClick={() => setEditing({ section, id: currentEntityForMedia?.id || 0, field, value })} // Đảm bảo id có giá trị
                title={`Edit ${label}`}
              >
                <i className="fas fa-pen fs-6"></i>
              </button>
            )}
          </>
        )}
      </p>
    );
  };


  // --- Generic Render Card Function (Reusable) ---
  const renderCard = <T extends { mediaFiles: MediaFile[] }>(
    item: T,
    idKey: keyof T, // e.g., "skillId"
    sectionName: string,
    content: React.ReactNode,
    onDelete: (id: number) => Promise<void>, // Thay đổi kiểu trả về là Promise<void>
    onUpdateField: () => Promise<void> // Thay đổi kiểu trả về là Promise<void>
  ) => {
    const id = item[idKey] as number;
    const currentFilter = filters[id] || "all";
    const filteredMedia =
      currentFilter === "all" ? item.mediaFiles : item.mediaFiles.filter((m) => m.type === currentFilter);

    return (
      <div key={id} className="col-12 col-md-6 col-lg-4">
        <div className="card h-100 shadow-lg rounded-4 p-4 position-relative overflow-hidden group">
          <div className="position-relative" style={{ zIndex: 1 }}>
            {content}

            {/* Filter buttons */}
            <div className="d-flex justify-content-center space-x-2 mb-4">
              {["all", "image", "video"].map((type) => (
                <button
                  key={type}
                  className={`btn btn-sm rounded-pill px-3 me-2 ${currentFilter === type ? "btn-primary" : "btn-outline-primary"
                    }`}
                  onClick={() => handleFilter(id, type as any)}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>

            {/* Media Gallery */}
            <div className="row g-3 mb-4">
              {filteredMedia.length > 0 ? (
                filteredMedia.map((media, idx) => (
                  <div key={media.mediaId || idx} className="col-6"> {/* Sử dụng mediaId làm key nếu có */}
                    <div className="card h-100 shadow-sm rounded-3 overflow-hidden position-relative media-item-container">
                      {media.type === "image" ? (
                        <img src={media.fileUrl} alt={`Media ${idx}`} className="w-100 h-100 object-fit-cover" style={{ height: '120px' }} />
                      ) : (
                        <video src={media.fileUrl} controls className="w-100 h-100 object-fit-cover" style={{ height: '120px' }} />
                      )}
                      {(
                        <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex align-items-center justify-content-center media-overlay">
                          <button
                            className="btn btn-link text-white fs-4 mx-2"
                            onClick={() => handleViewMedia(media)}
                            title="View Media"
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                          { isLogin &&
                            <button
                              className="btn btn-link text-white fs-4 mx-2"
                              onClick={() => handleDeleteMedia(id, media.mediaId!, media.fileUrl)} // Truyền skillId và mediaId
                              title="Delete Media"
                            >
                              <i className="fas fa-trash-alt"></i>
                            </button>
                          }

                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-12">
                  <div className="text-center text-muted py-5 border border-dashed border-2 border-secondary rounded-3">
                    <p className="mb-2">No {currentFilter} files found.</p>
                    {isLogin && <p>Click "Add Media" to upload!</p>}
                  </div>
                </div>
              )}
            </div>

            {/* Add Media Button */}
            {isLogin && (
              <button
                className="btn btn-primary w-100 shadow-sm transition-all d-flex align-items-center justify-content-center mt-3"
                onClick={() => {
                  setCurrentEntityForMedia({ section: sectionName, id: id });
                  setShowAddMediaModal(true);
                }}
              >
                <i className="fas fa-upload me-2"></i>Add Media
              </button>
            )}
            {/* Delete Button at the bottom */}
            {isLogin && (
              <button
                className="btn btn-danger w-100 shadow-sm transition-all d-flex align-items-center justify-content-center mt-2"
                onClick={() => onDelete(id)}
                title="Delete Skill"
              >
                <i className="fas fa-trash-alt me-2"></i>Delete Skill
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // --- Main Render ---
  return (
    <div className="min-vh-100 bg-light py-4 py-sm-5 py-lg-5">


      <div className="container px-3 px-sm-4 px-lg-5 mx-auto" style={{ maxWidth: '1200px' }}>
        {/* --- Common Modals (Add Media, View Media) --- */}
        {showAddMediaModal && currentEntityForMedia && isLogin && (
          <div className="modal d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content rounded-4 shadow-lg">
                <div className="modal-header border-0 pb-0">
                  <h5 className="modal-title fs-4 fw-bold text-dark">Add Media for {currentEntityForMedia.section} (ID: {currentEntityForMedia.id})</h5>
                  <button type="button" className="btn-close" aria-label="Close" onClick={() => { setShowAddMediaModal(false); setCurrentEntityForMedia(null); }}></button>
                </div>
                <div className="modal-body pt-0">
                  <input
                    type="file"
                    accept="image/*,video/*"
                    className="form-control mb-4"
                    onChange={handleMediaFileChange}
                  />
                  <div className="d-flex justify-content-end">
                    <button
                      className="btn btn-secondary"
                      onClick={() => {
                        setShowAddMediaModal(false);
                        setCurrentEntityForMedia(null);
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {viewingMedia && (
          <div
            className="modal d-block modal-fullscreen"
            tabIndex={-1}
            style={{ backgroundColor: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={closeViewMediaModal}
          >
            <div className="modal-dialog modal-dialog-centered modal-xl" onClick={(e) => e.stopPropagation()}>
              <div className="modal-content bg-transparent border-0 d-flex align-items-center justify-content-center" style={{ maxHeight: '90vh' }}>
                {viewingMedia.type === "image" ? (
                  <img src={viewingMedia.fileUrl} alt="Viewed Media" className="img-fluid rounded-3 shadow-lg" style={{ maxHeight: '80vh', objectFit: 'contain' }} />
                ) : (
                  <video src={viewingMedia.fileUrl} controls className="w-100 rounded-3 shadow-lg" style={{ maxHeight: '80vh', objectFit: 'contain' }} autoPlay />
                )}
                <button
                  className="btn-close btn-close-white position-absolute top-0 end-0 m-4 fs-3"
                  aria-label="Close"
                  onClick={closeViewMediaModal}
                ></button>
              </div>
            </div>
          </div>
        )}

        {/* --- SKILLS Section --- */}
        <section className="mb-5">
          <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center mb-4">
            <h2 className="fs-2 fw-bold text-dark mb-3 mb-sm-0 d-flex align-items-center">
              <i className="fas fa-code text-primary me-3"></i>Skills Manager
            </h2>
            {isLogin && (
              <button
                className="btn btn-primary shadow-sm transition-all d-flex align-items-center"
                onClick={() => setShowAddForm(true)}
              >
                <i className="fas fa-plus-circle me-2"></i>Add New Skill
              </button>
            )}
          </div>

          {showAddForm && isLogin && (
            <div className="modal d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content rounded-4 shadow-lg">
                  <div className="modal-header border-0 pb-0">
                    <h5 className="modal-title fs-4 fw-bold text-dark">Add New Skill</h5>
                    <button type="button" className="btn-close" aria-label="Close" onClick={() => setShowAddForm(false)}></button>
                  </div>
                  <div className="modal-body pt-0">
                    <input
                      className="form-control mb-3"
                      placeholder="Skill Name"
                      value={newSkill.name}
                      onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                    />
                    <input
                      type="number"
                      className="form-control mb-4"
                      placeholder="Level (0-100)"
                      value={newSkill.level}
                      onChange={(e) => setNewSkill({ ...newSkill, level: Math.min(100, Math.max(0, +e.target.value)) })}
                    />
                    <div className="d-flex justify-content-end">
                      <button
                        className="btn btn-secondary me-3"
                        onClick={() => setShowAddForm(false)}
                      >
                        Cancel
                      </button>
                      <button
                        className="btn btn-success"
                        onClick={handleAddSkill} // Gọi hàm xử lý API
                      >
                        <i className="fas fa-save me-2"></i>Save Skill
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading Skills...</span>
              </div>
              <p className="mt-2 text-muted">Loading Skills...</p>
            </div>
          ) : error ? (
            <div className="alert alert-danger text-center" role="alert">
              {error}
            </div>
          ) : skills.length === 0 ? (
            <div className="text-center text-muted py-5 border border-dashed border-2 border-secondary rounded-3">
              <p className="mb-2">No skills found.</p>
              {isLogin && <p>Click "Add New Skill" to create your skill!</p>}
            </div>
          ) : (
            <div className="row g-4">
              {skills.map((skill) => renderCard(
                skill,
                "skillId",
                "Skill",
                <>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    {editing?.section === "Skill" && editing.id === skill.skillId && editing.field === "name" ? (
                      <div className="d-flex align-items-center w-100">
                        <input
                          className="form-control me-2 fs-5 fw-semibold"
                          value={editing.value}
                          onChange={(e) => setEditing({ ...editing, value: e.target.value })}
                          onKeyDown={(e) => { if (e.key === 'Enter') handleUpdateField(); }}
                        />
                        <button className="btn btn-success btn-sm" onClick={handleUpdateField}>
                          <i className="fas fa-check"></i>
                        </button>
                        <button className="btn btn-secondary btn-sm ms-2" onClick={() => setEditing(null)}>
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    ) : (
                      <h3 className="fs-4 fw-bold text-dark">{skill.name}</h3>
                    )}
                    {isLogin && !(editing?.section === "Skill" && editing.id === skill.skillId && editing.field === "name") && (
                      <button
                        className="btn btn-link text-primary p-0 ms-2"
                        onClick={() => setEditing({ section: "Skill", id: skill.skillId, field: "name", value: skill.name })}
                        title="Edit Name"
                      >
                        <i className="fas fa-pen fs-5"></i>
                      </button>
                    )}
                  </div>
                  <p className="mb-2 d-flex align-items-start">
                    <strong className="me-2">Level:</strong>
                    {editing?.section === "Skill" && editing.id === skill.skillId && editing.field === "level" ? (
                      <div className="d-flex flex-column w-100">
                        <input
                          type="number"
                          className="form-control form-control-sm mb-2"
                          value={editing.value}
                          onChange={(e) => setEditing({ ...editing, value: e.target.value })}
                          onKeyDown={(e) => { if (e.key === 'Enter') handleUpdateField(); }}
                        />
                        <div className="d-flex justify-content-end">
                          <button className="btn btn-success btn-sm" onClick={handleUpdateField}>
                            <i className="fas fa-check"></i>
                          </button>
                          <button className="btn btn-secondary btn-sm ms-2" onClick={() => setEditing(null)}>
                            <i className="fas fa-times"></i>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <span className="flex-grow-1">{skill.level}%</span>
                        {isLogin && (
                          <button
                            className="btn btn-link text-primary p-0 ms-2"
                            onClick={() => setEditing({ section: "Skill", id: skill.skillId, field: "level", value: String(skill.level) })}
                            title="Edit Level"
                          >
                            <i className="fas fa-pen fs-6"></i>
                          </button>
                        )}
                      </>
                    )}
                  </p>
                  <div className="progress mb-3" style={{ height: "24px" }}>
                    <div
                      className={`progress-bar ${getProgressColor(skill.level)}`}
                      role="progressbar"
                      style={{ width: `${skill.level}%` }}
                      aria-valuenow={skill.level}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    >
                      {skill.level}%
                    </div>
                  </div>
                </>,
                handleDeleteSkill, // Truyền hàm xóa Skill
                handleUpdateField // Truyền hàm cập nhật Skill
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Custom CSS for hover effects */}
      <style>
        {`
        .transition-all {
          transition: all 0.3s ease-in-out;
        }
        .duration-300 {
          transition-duration: 0.3s;
        }
        .opacity-0 {
          opacity: 0;
        }
        .group:hover .delete-card-btn {
          opacity: 1;
        }
        .media-item-container:hover .media-overlay {
          opacity: 1;
        }
        .card.group:hover {
          transform: translateY(-5px);
          box-shadow: 0 0.75rem 1.5rem rgba(0, 0, 0, 0.15) !important;
        }
        .object-fit-cover {
            object-fit: cover;
        }
        .align-items-start .btn-link {
            align-self: flex-start;
            margin-top: 0.25rem;
        }
        .media-overlay {
            opacity: 0;
            transition: opacity 0.3s ease-in-out;
        }
        `}
      </style>
    </div>
  );
};

export default SkillManager;