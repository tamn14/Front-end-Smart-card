import React, { useCallback, useEffect, useState } from "react";
import { authFetch } from "../../Utils/authFetch";

// --- Types Definitions ---
type MediaFile = {
  mediaId?: number; // Thêm mediaId để dễ dàng xóa media cụ thể
  fileUrl: string;
  type: "image" | "video";
};

interface Props {
  isLogin: boolean;
  userId: string;
}

type EducationItem = {
  eduId: number;
  schoolName: string;
  degree: string;
  startDate: string;
  endDate: string; // "Present" or a date (YYYY-MM-DD)
  description: string;
  mediaFiles: MediaFile[];
};

// --- Main Education Component ---
const Education: React.FC<Props> = ({ isLogin, userId }) => {
  // --- State for Education list ---
  const [educationList, setEducationList] = useState<EducationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mediaType] = useState("EDUCATION");

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
  const [newEducation, setNewEducation] = useState({
    schoolName: "", degree: "", startDate: "", endDate: "", description: ""
  });

  // Media Management States
  const [showAddMediaModal, setShowAddMediaModal] = useState(false);
  const [currentEntityForMedia, setCurrentEntityForMedia] = useState<{
    section: string;
    id: number;
  } | null>(null);
  const [viewingMedia, setViewingMedia] = useState<MediaFile | null>(null);

  // --- API Interaction Functions ---

  // 1. Fetch Edus from DB
  const fetchEdus = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`http://localhost:8080/edu/public/${userId}`);
      if (!res.ok) {
        throw new Error(`Failed to fetch education entries: ${res.statusText}`);
      }
      const data = await res.json();
      // Đảm bảo data.result là một mảng trước khi map
      if (data.result && Array.isArray(data.result)) {
        // Fetch media for each edu
        const EdusWithMedia = await Promise.all(data.result.map(async (edu: EducationItem) => {
          const mediaRes = await fetch(`http://localhost:8080/media/public/${mediaType}/${edu.eduId}`);
          if (!mediaRes.ok) {
            console.warn(`Failed to fetch media for edu ${edu.eduId}: ${mediaRes.statusText}`);
            return { ...edu, mediaFiles: [] }; // Trả về edu không có media nếu lỗi
          }
          const mediaData = await mediaRes.json();
          // Map link to fileUrl and add type based on fileType
          const formattedMedia = mediaData.result.map((m: any) => ({
            mediaId: m.mediaId, // Lưu trữ mediaId từ backend
            fileUrl: m.link,
            type: m.fileType.startsWith("image") ? "image" : "video"
          }));
          return { ...edu, mediaFiles: formattedMedia };
        }));
        setEducationList(EdusWithMedia);
      } else {
        setEducationList([]); // Đảm bảo luôn là một mảng nếu không có dữ liệu hợp lệ
      }
    } catch (err: any) {
      console.error("Error fetching education entries:", err);
      setError(err.message || "An error occurred while fetching education entries.");
      setEducationList([]); // Reset skills on error
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchEdus();
  }, [fetchEdus]);

  // 2. Add New Edu
  const handleAddEdu = async () => {
    if (!isLogin) {
      alert("Bạn cần đăng nhập để thêm thông tin học vấn mới!");
      return;
    }
    if (!newEducation.schoolName.trim()) {
      alert("Tên Trường/Tổ chức không được để trống!");
      return;
    }

    try {
      const res = await authFetch("/edu", {
        method: "POST",
        body: JSON.stringify({
          schoolName: newEducation.schoolName,
          degree: newEducation.degree,
          startDate: newEducation.startDate,
          endDate: newEducation.endDate,
          description: newEducation.description
        }),
      });

      if (!res.ok) {
        throw new Error(`Failed to add education entry: ${res.statusText}`);
      }
      const addedEdu = await res.json();
      // Thêm mục học vấn mới vào state, khởi tạo mediaFiles rỗng
      setEducationList(prevEdus => [...prevEdus, { ...addedEdu, mediaFiles: [] }]);
      setNewEducation({ schoolName: "", degree: "", startDate: "", endDate: "", description: "" });
      setShowAddForm(false);
      await fetchEdus()
      // await fetchEdus(); // Đã xóa: Không cần fetch lại toàn bộ sau khi đã cập nhật state cục bộ
    } catch (err: any) {
      console.error("Error adding education entry:", err);
      alert(`Lỗi khi thêm thông tin học vấn: ${err.message}`);
    }
  };

  // 3. Update Edu Information
  const handleUpdateField = async () => {
    if (!isLogin) {
      alert("Bạn cần đăng nhập để chỉnh sửa thông tin!");
      setEditing(null);
      return;
    }
    if (!editing) return;

    const { id, field, value } = editing;

    const EduToUpdate = educationList.find(s => s.eduId === id);
    if (!EduToUpdate) return;

    const updatedPayload = {
      schoolName: field === "schoolName" ? value : EduToUpdate.schoolName,
      degree: field === "degree" ? value : EduToUpdate.degree,
      startDate: field === "startDate" ? value : EduToUpdate.startDate,
      endDate: field === "endDate" ? value : EduToUpdate.endDate,
      description: field === "description" ? value : EduToUpdate.description,
    };

    try {
      const res = await authFetch(`/edu/${id}`, {
        method: "PUT",
        body: JSON.stringify(updatedPayload),
      });

      if (!res.ok) {
        throw new Error(`Failed to update education entry: ${res.statusText}`);
      }

      setEducationList(prev =>
        prev.map(s =>
          s.eduId === id
            ? { ...s, ...updatedPayload }
            : s
        )
      );

      setEditing(null);
      await fetchEdus()
      // await fetchEdus(); // Đã xóa: Không cần fetch lại toàn bộ sau khi đã cập nhật state cục bộ
    } catch (err: any) {
      console.error("Error updating education field:", err);
      alert(`Lỗi khi cập nhật: ${err.message}`);
    }
  };

  // 4. Delete Edu
  const handleDeleteEdu = async (idToDelete: number) => {
    if (!isLogin) {
      alert("Bạn cần đăng nhập để xóa Education!");
      return;
    }
    if (!window.confirm("Bạn có chắc chắn muốn xóa Education này?")) {
      return;
    }

    try {
      const res = await authFetch(`/edu/${idToDelete}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error(`Failed to delete Education: ${res.statusText}`);
      }

      // Xóa skill khỏi state
      setEducationList(prev => prev.filter(s => s.eduId !== idToDelete));
      alert("Education đã được xóa thành công!");
    } catch (err: any) {
      console.error("Error deleting Education:", err);
      alert(`Lỗi khi xóa Education: ${err.message}`);
    }
  };

  // 5. Add Media to Edu
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
      formData.append("entityType", "EDUCATION");
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

      // Cập nhật state Education với media mới
      setEducationList(prevEdu =>
        prevEdu.map(edu =>
          edu.eduId === currentEntityForMedia.id
            ? { ...edu, mediaFiles: [...edu.mediaFiles, newMediaFile] }
            : edu
        )
      );

      setShowAddMediaModal(false);
      setCurrentEntityForMedia(null);
      e.target.value = '';
      alert("Media đã được tải lên thành công!");
      await fetchEdus()
      // await fetchEdus(); // Đã xóa: Không cần fetch lại toàn bộ sau khi đã cập nhật state cục bộ
    } catch (err: any) {
      console.error("Error uploading media:", err);
      alert(`Lỗi khi tải lên media: ${err.message}`);
    }
  };

  // 6. Delete Media from Edu
  const handleDeleteMedia = async (EduId: number, mediaIdToDelete: number, fileUrlToDelete: string) => {
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
      setEducationList((prevEdu) =>
        prevEdu.map((edu) =>
          edu.eduId === EduId
            ? {
              ...edu,
              mediaFiles: edu.mediaFiles.filter((media) => media.mediaId !== mediaIdToDelete),
            }
            : edu
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

  // --- Render Field Function (Reusable for inline editing) ---
  const renderField = (
    label: string,
    value: string,
    section: string,
    id: number,
    field: string,
    type: string = "text",
    isTextArea: boolean = false,
    onUpdateField: () => void
  ) => {
    const isEditing = editing?.section === section && editing.id === id && editing.field === field;

    return (
      <p className="mb-2 d-flex align-items-start">
        <strong className="me-2">{label}:</strong>
        {isEditing ? (
          <div className="d-flex flex-column w-100">
            {isTextArea ? (
              <textarea
                className="form-control form-control-sm mb-2"
                value={editing.value}
                onChange={(e) => setEditing({ ...editing, value: e.target.value })}
                rows={3}
              />
            ) : (
              <input
                type={type}
                className="form-control form-control-sm mb-2"
                value={editing.value}
                onChange={(e) => setEditing({ ...editing, value: e.target.value })}
                onKeyDown={(e) => { if (e.key === 'Enter') onUpdateField(); }}
              />
            )}
            <div className="d-flex justify-content-end">
              <button className="btn btn-success btn-sm" onClick={onUpdateField}>
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
            {
              isLogin && <button
              className="btn btn-link text-primary p-0 ms-2"
              onClick={() => setEditing({ section, id, field, value })}
              title={`Edit ${label}`}
            >
              <i className="fas fa-pen fs-6"></i>
            </button>
            }
            
          </>
        )}
      </p>
    );
  };

  // --- Generic Render Card Function (Reusable) ---
  const renderCard = <T extends { mediaFiles: MediaFile[] }>(
    item: T,
    idKey: keyof T, // e.g., "eduId"
    sectionName: string,
    content: React.ReactNode,
    onDelete: (id: number) => void,
    onUpdateField: () => void // Pass handleUpdateField to renderField
  ) => {
    const id = item[idKey] as number;
    const currentFilter = filters[id] || "all";
    const filteredMedia =
      currentFilter === "all" ? item.mediaFiles : item.mediaFiles.filter((m) => m.type === currentFilter);

    return (
      <div key={id} className="col-12 col-md-6 col-lg-6"> {/* Adjusted column size for Education cards */}
        <div className="card h-100 shadow-lg rounded-4 p-4 position-relative overflow-hidden group">
          <div className="position-relative" style={{ zIndex: 1 }}>
            {content} {/* Dynamic content for each section */}

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
                  <div key={idx} className="col-6">
                    <div className="card h-100 shadow-sm rounded-3 overflow-hidden position-relative media-item-container">
                      {media.type === "image" ? (
                        <img src={media.fileUrl} alt={`Media ${idx}`} className="w-100 h-100 object-fit-cover" style={{ height: '120px' }} />
                      ) : (
                        <video src={media.fileUrl} className="w-100 h-100 object-fit-cover" style={{ height: '120px' }} />
                      )}
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
                            onClick={() => handleDeleteMedia(id, media.mediaId!, media.fileUrl)}
                            title="Delete Media"
                          >
                            <i className="fas fa-trash-alt"></i>
                          </button>
                        }
                          
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-12">
                  <div className="text-center text-muted py-5 border border-dashed border-2 border-secondary rounded-3">
                    <p className="mb-2">No {currentFilter} files found.</p>
                    <p>Click "Add Media" to upload!</p>
                  </div>
                </div>
              )}
            </div>

            {/* Add Media Button */}
              {
                isLogin &&
                <button
                className="btn btn-success w-100 shadow-sm transition-all d-flex align-items-center justify-content-center mt-3" // Adjusted margin-top
                onClick={() => {
                  setCurrentEntityForMedia({ section: sectionName, id: id });
                  setShowAddMediaModal(true);
                }}
              >
                <i className="fas fa-upload me-2"></i>Add Media
              </button>
              }
              
            

            {/* New Delete Button at the bottom */}
              { isLogin &&
                <button
                className="btn btn-danger w-100 shadow-sm transition-all d-flex align-items-center justify-content-center mt-2" // Added mt-2
                onClick={() => handleDeleteEdu(id)} // Call handleDeleteEdu with the correct ID
                title="Delete Education Entry"
              >
                <i className="fas fa-trash-alt me-2"></i>Delete Education
              </button>
              }
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
        {showAddMediaModal && currentEntityForMedia && (
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

        {/* --- EDUCATION Section --- */}
        <section className="mb-5">
          <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center mb-4">
            <h2 className="fs-2 fw-bold text-dark mb-3 mb-sm-0 d-flex align-items-center">
              <i className="fas fa-graduation-cap text-success me-3"></i>Education
            </h2>
            {
              isLogin && <button
              className="btn btn-success shadow-sm transition-all d-flex align-items-center"
              onClick={() => setShowAddForm(true)}
            >
              <i className="fas fa-plus-circle me-2"></i>Add New Education
            </button>
            }
            
          </div>

          {showAddForm && (
            <div className="modal d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content rounded-4 shadow-lg">
                  <div className="modal-header border-0 pb-0">
                    <h5 className="modal-title fs-4 fw-bold text-dark">Add New Education Entry</h5>
                    <button type="button" className="btn-close" aria-label="Close" onClick={() => setShowAddForm(false)}></button>
                  </div>
                  <div className="modal-body pt-0">
                    <input className="form-control mb-3" placeholder="School Name" value={newEducation.schoolName} onChange={(e) => setNewEducation({ ...newEducation, schoolName: e.target.value })} />
                    <input className="form-control mb-3" placeholder="Degree (e.g., Bachelor of Computer Science)" value={newEducation.degree} onChange={(e) => setNewEducation({ ...newEducation, degree: e.target.value })} />
                    <input className="form-control mb-3" placeholder="Start Date (YYYY-MM-DD)" value={newEducation.startDate} onChange={(e) => setNewEducation({ ...newEducation, startDate: e.target.value })} />
                    <input className="form-control mb-3" placeholder="End Date (YYYY-MM-DD or Present)" value={newEducation.endDate} onChange={(e) => setNewEducation({ ...newEducation, endDate: e.target.value })} />
                    <textarea className="form-control mb-4" placeholder="Description" rows={3} value={newEducation.description} onChange={(e) => setNewEducation({ ...newEducation, description: e.target.value })} />
                    <div className="d-flex justify-content-end">
                      <button className="btn btn-secondary me-3" onClick={() => setShowAddForm(false)}>Cancel</button>
                      <button
                        className="btn btn-success"
                        onClick={handleAddEdu} // Đã sửa: Gọi handleAddEdu để xử lý API và cập nhật state
                      >
                        <i className="fas fa-save me-2"></i>Save Education
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
          ) : educationList.length === 0 ? (
            <div className="text-center text-muted py-5 border border-dashed border-2 border-secondary rounded-3">
              <p className="mb-2">No Education found.</p>
              {isLogin && <p>Click "Add New Education" to create your Education!</p>}
            </div>
          ) : (
          <div className="row g-4">
            {educationList.map((edu) => renderCard(
              edu,
              "eduId",
              "Education",
              <>
                {renderField("School", edu.schoolName, "Education", edu.eduId, "schoolName", "text", false, handleUpdateField)}
                {renderField("Degree", edu.degree, "Education", edu.eduId, "degree", "text", false, handleUpdateField)}
                {renderField("Start Date", edu.startDate, "Education", edu.eduId, "startDate", "text", false, handleUpdateField)}
                {renderField("End Date", edu.endDate, "Education", edu.eduId, "endDate", "text", false, handleUpdateField)}
                {renderField("Description", edu.description, "Education", edu.eduId, "description", "text", true, handleUpdateField)} {/* Pass true for isTextArea */}
              </>,
              handleDeleteEdu, // Đã sửa: Truyền hàm handleDeleteEdu trực tiếp
              handleUpdateField // Pass handleUpdateField here
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
        /* Custom group hover for Bootstrap */
        .group:hover .delete-card-btn { /* Target specific delete button for main card */
          opacity: 1;
        }
        .media-item-container:hover .media-overlay { /* Target media item overlay */
          opacity: 1;
        }
        .card.group:hover {
          transform: translateY(-5px); /* Slight lift effect */
          box-shadow: 0 0.75rem 1.5rem rgba(0, 0, 0, 0.15) !important; /* Stronger shadow on hover */
        }
        .object-fit-cover {
            object-fit: cover;
        }
        /* Custom style for inline editing buttons to align with text */
        .align-items-start .btn-link {
            align-self: flex-start;
            margin-top: 0.25rem; /* Adjust as needed */
        }
        /* Ensure media overlay is initially hidden */
        .media-overlay {
            opacity: 0;
            transition: opacity 0.3s ease-in-out;
        }
        /* Removed .delete-card-btn initial opacity: 0 as it's now always visible */
        `}
      </style>
    </div>
  );
};

export default Education;