import React, { useCallback, useEffect, useState } from "react";
import { authFetch } from "../../Utils/authFetch";

// --- Type Definitions ---
type MediaFile = {
  mediaId: number; // Đảm bảo mediaId luôn có và là number
  fileUrl: string;
  type: "image" | "video";
};

interface Props {
  isLogin: boolean;
  userId: string;
}

type ExperienceItem = {
  expId: number;
  name: string;
  position: string;
  description: string;
  startDate: string;
  endDate: string;
  mediaFiles: MediaFile[];
};

// --- Main Component ---
const ExperiencePage: React.FC<Props> = ({ isLogin, userId }) => {
  // --- State ---
  const [experienceList, setExperienceList] = useState<ExperienceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mediaType] = useState("EXPERIENCE");
  const [filters, setFilters] = useState<{ [id: number]: "all" | "image" | "video" }>({});
  const [editing, setEditing] = useState<{ section: string; id: number; field: string; value: string } | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newExperience, setNewExperience] = useState({
    name: "",
    position: "",
    description: "",
    startDate: "",
    endDate: "",
  });
  const [showAddMediaModal, setShowAddMediaModal] = useState(false);
  const [currentEntityForMedia, setCurrentEntityForMedia] = useState<{ section: string; id: number } | null>(null);
  const [viewingMedia, setViewingMedia] = useState<MediaFile | null>(null);

  // --- API Interaction Functions ---

  // 1. Fetch Experiences from DB (chỉ chạy một lần lúc đầu)
  const fetchExp = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`http://localhost:8080/exp/public/${userId}`);
      if (!res.ok) {
        throw new Error(`Failed to fetch Experiences: ${res.statusText}`);
      }
      const data = await res.json();

      if (data.result && Array.isArray(data.result)) {
        const expsWithMedia = await Promise.all(
          data.result.map(async (exp: ExperienceItem) => {
            try {
              const mediaRes = await fetch(`http://localhost:8080/media/public/${mediaType}/${exp.expId}`);
              if (!mediaRes.ok) {
                console.warn(`Failed to fetch media for Exp ${exp.expId}`);
                return { ...exp, mediaFiles: [] };
              }
              const mediaData = await mediaRes.json();
              const formattedMedia = mediaData.result.map((m: any) => ({
                mediaId: m.mediaId,
                fileUrl: m.link,
                type: m.fileType.startsWith("image") ? "image" : "video",
              }));
              return { ...exp, mediaFiles: formattedMedia };
            } catch (mediaErr) {
               console.error(`Error fetching media for Exp ${exp.expId}:`, mediaErr);
               return { ...exp, mediaFiles: [] };
            }
          })
        );
        setExperienceList(expsWithMedia);
      } else {
        setExperienceList([]);
      }
    } catch (err: any) {
      console.error("Error fetching Exp entries:", err);
      setError(err.message || "An error occurred while fetching data.");
      setExperienceList([]);
    } finally {
      setLoading(false);
    }
  }, [userId, mediaType]);

  useEffect(() => {
    fetchExp();
  }, [fetchExp]);

  // 2. Add New Experience
  // Sửa lại hàm handleAddExp để xử lý an toàn hơn
const handleAddExp = async () => {
  if (!isLogin || !newExperience.name.trim()) {
    alert("Vui lòng điền đầy đủ thông tin.");
    return;
  }

  try {
    const res = await authFetch("/exp", {
      method: "POST",
      body: JSON.stringify(newExperience),
    });

    if (!res.ok) {
      throw new Error(`Failed to add Exp entry: ${res.statusText}`);
    }
    
    const addedExpData = await res.json();
    const newExpItem = addedExpData.result;

    // **BẪY LỖI QUAN TRỌNG Ở ĐÂY**
    // Kiểm tra xem backend có trả về một expId hợp lệ hay không
    if (newExpItem && newExpItem.expId && newExpItem.expId > 0) {
      // Nếu ID hợp lệ, cập nhật state trực tiếp (cách tối ưu)
      setExperienceList(prevExp => [...prevExp, { ...newExpItem, mediaFiles: [] }]);
    } else {
      // Nếu ID không hợp lệ (0, null, undefined), hãy fetch lại toàn bộ danh sách
      // để đảm bảo dữ liệu đúng. Đây là phương án an toàn.
      console.warn("Backend returned an invalid expId. Refetching the entire list.");
      await fetchExp();
    }

    setNewExperience({ name: "", position: "", description: "", startDate: "", endDate: "" });
    setShowAddForm(false);
  } catch (err: any) {
    console.error("Error adding Exp entry:", err);
    alert(`Lỗi khi thêm kinh nghiệm: ${err.message}`);
  }
};

  // 3. Update Experience Information
  const handleUpdateField = async () => {
    if (!isLogin || !editing) return;

    const { id, field, value } = editing;
    const expToUpdate = experienceList.find(s => s.expId === id);
    if (!expToUpdate) return;

    const updatedPayload = { ...expToUpdate, [field]: value };

    try {
      const res = await authFetch(`/exp/${id}`, {
        method: "PUT",
        body: JSON.stringify({
             name: updatedPayload.name,
             position: updatedPayload.position,
             description: updatedPayload.description,
             startDate: updatedPayload.startDate,
             endDate: updatedPayload.endDate,
        }),
      });

      if (!res.ok) {
        throw new Error(`Failed to update Exp entry: ${res.statusText}`);
      }

      setExperienceList(prev =>
        prev.map(exp => (exp.expId === id ? updatedPayload : exp))
      );
      setEditing(null);
      // **TỐI ƯU**: Không cần gọi lại fetchExp()
    } catch (err: any) {
      console.error("Error updating Exp field:", err);
      alert(`Lỗi khi cập nhật: ${err.message}`);
    }
  };

  // 4. Delete Experience
  const handleDeleteExp = async (idToDelete: number) => {
    if (!isLogin || !window.confirm("Bạn có chắc chắn muốn xóa kinh nghiệm này?")) {
      return;
    }
    try {
      const res = await authFetch(`/exp/${idToDelete}`, { method: "DELETE" });
      if (!res.ok) {
        throw new Error(`Failed to delete Experience: ${res.statusText}`);
      }
      setExperienceList(prev => prev.filter(s => s.expId !== idToDelete));
      alert("Kinh nghiệm đã được xóa thành công!");
    } catch (err: any) {
      console.error("Error deleting Experience:", err);
      alert(`Lỗi khi xóa kinh nghiệm: ${err.message}`);
    }
  };

  // 5. Add Media to Experience
  const handleMediaFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isLogin || !e.target.files?.[0] || !currentEntityForMedia) return;

    const file = e.target.files[0];
    const fileType = file.type.startsWith("image/") ? "image" : file.type.startsWith("video/") ? "video" : null;

    if (!fileType) {
      alert("Loại file không được hỗ trợ. Vui lòng chọn ảnh hoặc video.");
      return;
    }

    const formData = new FormData();
    formData.append("entityType", "EXPERIENCE");
    formData.append("entityId", currentEntityForMedia.id.toString());
    formData.append("fileType", file.type);
    formData.append("fileName", file.name);
    formData.append("imageUrl", file);

    try {
      const res = await authFetch("/media", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`Failed to upload media: ${res.statusText}`);
      }

      const newMediaData = await res.json();
      const newMediaFile: MediaFile = {
        mediaId: newMediaData.result.mediaId,
        fileUrl: newMediaData.result.link,
        type: fileType,
      };

      setExperienceList(prevExp =>
        prevExp.map(exp =>
          exp.expId === currentEntityForMedia.id
            ? { ...exp, mediaFiles: [...exp.mediaFiles, newMediaFile] }
            : exp
        )
      );

      setShowAddMediaModal(false);
      setCurrentEntityForMedia(null);
      alert("Media đã được tải lên thành công!");
      // **TỐI ƯU**: Không cần gọi lại fetchExp()
    } catch (err: any) {
      console.error("Error uploading media:", err);
      alert(`Lỗi khi tải lên media: ${err.message}`);
    } finally {
        e.target.value = ''; // Luôn reset input
    }
  };

  // 6. Delete Media from Experience
  const handleDeleteMedia = async (expId: number, mediaIdToDelete: number) => {
    if (!isLogin || !window.confirm("Bạn có chắc chắn muốn xóa media này?")) {
      return;
    }
    try {
      const res = await authFetch(`/media/${mediaIdToDelete}`, { method: "DELETE" });
      if (!res.ok) {
        throw new Error(`Failed to delete media: ${res.statusText}`);
      }
      setExperienceList(prevExp =>
        prevExp.map(exp =>
          exp.expId === expId
            ? { ...exp, mediaFiles: exp.mediaFiles.filter(media => media.mediaId !== mediaIdToDelete) }
            : exp
        )
      );
      alert("Media đã được xóa thành công!");
    } catch (err: any) {
      console.error("Error deleting media:", err);
      alert(`Lỗi khi xóa media: ${err.message}`);
    }
  };

  // --- Helper Functions ---
  const handleFilter = (id: number, type: "all" | "image" | "video") => setFilters(prev => ({ ...prev, [id]: type }));
  const handleViewMedia = (media: MediaFile) => setViewingMedia(media);
  const closeViewMediaModal = () => setViewingMedia(null);

  // --- Render Functions ---
  const renderField = (
    label: string, value: string, section: string, id: number, field: keyof ExperienceItem, 
    type: string = "text", isTextArea: boolean = false
  ) => {
    const isEditing = editing?.section === section && editing.id === id && editing.field === field;
    return (
      <div className="mb-2 d-flex align-items-start">
        <strong className="me-2" style={{ minWidth: '90px' }}>{label}:</strong>
        {isEditing ? (
          <div className="d-flex flex-column w-100">
            {isTextArea ? (
              <textarea
                className="form-control form-control-sm mb-2"
                value={editing.value}
                onChange={(e) => setEditing({ ...editing, value: e.target.value })}
                rows={3}
                autoFocus
              />
            ) : (
              <input
                type={type}
                className="form-control form-control-sm mb-2"
                value={editing.value}
                onChange={(e) => setEditing({ ...editing, value: e.target.value })}
                onKeyDown={(e) => { if (e.key === 'Enter') handleUpdateField(); }}
                autoFocus
              />
            )}
            <div className="d-flex justify-content-end">
              <button className="btn btn-success btn-sm" onClick={handleUpdateField}><i className="fas fa-check"></i></button>
              <button className="btn btn-secondary btn-sm ms-2" onClick={() => setEditing(null)}><i className="fas fa-times"></i></button>
            </div>
          </div>
        ) : (
          <>
            <span className="flex-grow-1" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{value}</span>
            {isLogin && (
              <button
                className="btn btn-link text-primary p-0 ms-2"
                onClick={() => setEditing({ section, id, field, value })}
                title={`Edit ${label}`}
              >
                <i className="fas fa-pen fs-6"></i>
              </button>
            )}
          </>
        )}
      </div>
    );
  };

  const renderCard = (item: ExperienceItem) => {
    const id = item.expId;
    const currentFilter = filters[id] || "all";
    const filteredMedia = currentFilter === "all" ? item.mediaFiles : item.mediaFiles.filter(m => m.type === currentFilter);

    return (
      <div key={id} className="col-12 col-md-6">
        <div className="card h-100 shadow-lg rounded-4 p-4 position-relative">
            {renderField("Company", item.name, "Experience", id, "name")}
            {renderField("Position", item.position, "Experience", id, "position")}
            {renderField("Start Date", item.startDate, "Experience", id, "startDate", "text")}
            {renderField("End Date", item.endDate, "Experience", id, "endDate", "text")}
            {renderField("Description", item.description, "Experience", id, "description", "text", true)}
            
            <hr/>

            {/* Media Gallery */}
            <div className="d-flex justify-content-center space-x-2 mb-3">
              {["all", "image", "video"].map(type => (
                <button
                  key={type}
                  className={`btn btn-sm rounded-pill px-3 me-2 ${currentFilter === type ? "btn-primary" : "btn-outline-primary"}`}
                  onClick={() => handleFilter(id, type as any)}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>

            <div className="row g-3 mb-3">
              {filteredMedia.length > 0 ? (
                filteredMedia.map(media => (
                  // **SỬA LỖI**: Sử dụng `media.mediaId` làm key
                  <div key={media.mediaId} className="col-6 col-sm-4">
                    <div className="card h-100 shadow-sm rounded-3 overflow-hidden position-relative media-item-container">
                      {media.type === "image" ? (
                        <img src={media.fileUrl} alt="Experience Media" className="w-100 object-fit-cover" style={{ height: '120px' }} />
                      ) : (
                        <video src={media.fileUrl} className="w-100 object-fit-cover" style={{ height: '120px' }} />
                      )}
                      <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex align-items-center justify-content-center media-overlay">
                        <button className="btn btn-link text-white fs-4" onClick={() => handleViewMedia(media)} title="View Media"><i className="fas fa-eye"></i></button>
                        {isLogin && (
                          <button className="btn btn-link text-white fs-4" onClick={() => handleDeleteMedia(id, media.mediaId)} title="Delete Media"><i className="fas fa-trash-alt"></i></button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-12">
                  <div className="text-center text-muted py-4 border border-dashed rounded-3">
                    <p className="mb-1">No {currentFilter} files.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            {isLogin && (
              <div className="mt-auto pt-3">
                 <button
                    className="btn btn-success w-100 mb-2"
                    onClick={() => {
                        setCurrentEntityForMedia({ section: "Experience", id });
                        setShowAddMediaModal(true);
                    }}
                >
                    <i className="fas fa-upload me-2"></i>Add Media
                </button>
                <button
                    className="btn btn-danger w-100"
                    onClick={() => handleDeleteExp(id)}
                    title="Delete Experience Entry"
                >
                    <i className="fas fa-trash-alt me-2"></i>Delete Experience
                </button>
              </div>
            )}
        </div>
      </div>
    );
  };
  
  // --- Main Render ---
  return (
    <div className="min-vh-100 bg-light py-5">
      <div className="container px-lg-5">
        
        {/* --- Modals --- */}
        {showAddMediaModal && (
          <div className="modal d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content rounded-4">
                <div className="modal-header border-0">
                  <h5 className="modal-title fs-5 fw-bold">Add Media</h5>
                  <button type="button" className="btn-close" onClick={() => setShowAddMediaModal(false)}></button>
                </div>
                <div className="modal-body">
                  <input type="file" accept="image/*,video/*" className="form-control" onChange={handleMediaFileChange} />
                </div>
              </div>
            </div>
          </div>
        )}

        {viewingMedia && (
          <div className="modal d-block modal-fullscreen" onClick={closeViewMediaModal}>
            <div className="modal-dialog modal-dialog-centered modal-xl" onClick={e => e.stopPropagation()}>
              <div className="modal-content bg-transparent border-0">
                 <button className="btn-close btn-close-white position-absolute top-0 end-0 m-4 fs-3" onClick={closeViewMediaModal}></button>
                {viewingMedia.type === "image" ? (
                  <img src={viewingMedia.fileUrl} alt="Viewed Media" className="img-fluid rounded-3" style={{ maxHeight: '90vh', objectFit: 'contain' }} />
                ) : (
                  <video src={viewingMedia.fileUrl} controls autoPlay className="w-100 rounded-3" style={{ maxHeight: '90vh' }} />
                )}
              </div>
            </div>
          </div>
        )}

        {showAddForm && (
          <div className="modal d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content rounded-4">
                <div className="modal-header border-0">
                  <h5 className="modal-title fs-5 fw-bold">Add New Experience</h5>
                  <button type="button" className="btn-close" onClick={() => setShowAddForm(false)}></button>
                </div>
                <div className="modal-body">
                  <input className="form-control mb-3" placeholder="Company Name" value={newExperience.name} onChange={e => setNewExperience({ ...newExperience, name: e.target.value })} />
                  <input className="form-control mb-3" placeholder="Position" value={newExperience.position} onChange={e => setNewExperience({ ...newExperience, position: e.target.value })} />
                  <div className="row">
                      <div className="col"><input className="form-control mb-3" type="text" placeholder="Start Date" value={newExperience.startDate} onChange={e => setNewExperience({ ...newExperience, startDate: e.target.value })} /></div>
                      <div className="col"><input className="form-control mb-3" type="text" placeholder="End Date" value={newExperience.endDate} onChange={e => setNewExperience({ ...newExperience, endDate: e.target.value })} /></div>
                  </div>
                  <textarea className="form-control mb-3" placeholder="Description" rows={4} value={newExperience.description} onChange={e => setNewExperience({ ...newExperience, description: e.target.value })} />
                </div>
                 <div className="modal-footer border-0">
                    <button className="btn btn-secondary" onClick={() => setShowAddForm(false)}>Cancel</button>
                    <button className="btn btn-primary" onClick={handleAddExp}><i className="fas fa-save me-2"></i>Save</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- EXPERIENCE Section --- */}
        <section>
          <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center mb-4">
            <h2 className="fs-2 fw-bold text-dark mb-3 mb-sm-0"><i className="fas fa-briefcase text-primary me-3"></i>Professional Experience</h2>
            {isLogin && (
              <button className="btn btn-primary shadow-sm" onClick={() => setShowAddForm(true)}>
                <i className="fas fa-plus-circle me-2"></i>Add New Experience
              </button>
            )}
          </div>

          {loading ? (
            <div className="text-center py-5"><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div></div>
          ) : error ? (
            <div className="alert alert-danger text-center">{error}</div>
          ) : experienceList.length === 0 ? (
            <div className="text-center text-muted py-5 border border-dashed rounded-3">
              <p className="mb-1">No Experiences found.</p>
              {isLogin && <p>Click "Add New Experience" to get started!</p>}
            </div>
          ) : (
            <div className="row g-4">
                {experienceList.map(exp => renderCard(exp))}
            </div>
          )}
        </section>
      </div>

      <style>
        {`
          .media-item-container .media-overlay {
            opacity: 0;
            transition: opacity 0.3s ease-in-out;
          }
          .media-item-container:hover .media-overlay {
            opacity: 1;
          }
          .card {
             transition: all 0.3s ease;
          }
          .card:hover {
            transform: translateY(-5px);
            box-shadow: 0 0.75rem 1.5rem rgba(0, 0, 0, 0.1) !important;
          }
          .object-fit-cover {
            object-fit: cover;
          }
          .border-dashed {
            border-style: dashed !important;
            border-width: 2px !important;
          }
        `}
      </style>
    </div>
  );
};

export default ExperiencePage;