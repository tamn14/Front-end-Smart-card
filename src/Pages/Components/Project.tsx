import React, { useCallback, useEffect, useState } from "react";
import { authFetch } from "../../Utils/authFetch";
import { line } from "framer-motion/client";

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
type ProjectItem = {
  projectId: number,
  title: string,
  tech: string,
  link: string,
  description: string,
  mediaFiles: MediaFile[];
};

// --- Main Education Component ---
const ProjectPage: React.FC<Props> = ({ isLogin, userId }) => {
  // --- State for Education list ---
  const [ProjectList, setProjectList] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mediaType] = useState("PROJECT");

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
  const [newProject, setNewProject] = useState({
    title: "", description: "", tech: "", link: ""
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
  const fetchProject = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`http://localhost:8080/project/public/${userId}`);
      if (!res.ok) {
        throw new Error(`Failed to fetch education entries: ${res.statusText}`);
      }
      const data = await res.json();
      console.log("Original project data:", data);
      // Đảm bảo data.result là một mảng trước khi map
      if (data.result && Array.isArray(data.result)) {
        // Fetch media for each edu
        const projectsWithMedia = await Promise.all(data.result.map(async (project: ProjectItem) => {
          const mediaRes = await fetch(`http://localhost:8080/media/public/${mediaType}/${project.projectId}`);
          if (!mediaRes.ok) {
            console.warn(`Failed to fetch media for project ${project.projectId}: ${mediaRes.statusText}`);
            return { ...project, mediaFiles: [] };
          }
          const mediaData = await mediaRes.json();
          // Map link to fileUrl and add type based on fileType
          const formattedMedia = mediaData.result.map((m: any) => ({
            mediaId: m.mediaId,
            fileUrl: m.link,
            type: m.fileType.startsWith("image") ? "image" : "video"
          }));
          return { ...project, mediaFiles: formattedMedia };
        }));
        setProjectList(projectsWithMedia);
      } else {
        setProjectList([]); // Đảm bảo luôn là một mảng nếu không có dữ liệu hợp lệ
      }
    } catch (err: any) {
      console.error("Error fetching project entries:", err);
      setError(err.message || "An error occurred while fetching project entries.");
      setProjectList([]); // Reset skills on error
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  // 2. Add New Edu
  const handleAddProject = async () => {
    if (!isLogin) {
      alert("Bạn cần đăng nhập để thêm thông tin học vấn mới!");
      return;
    }
    if (!newProject.title.trim()) {
      alert("Tên project không được để trống!");
      return;
    }

    try {
      const res = await authFetch("/project", {
        method: "POST",
        body: JSON.stringify({
          title: newProject.title,
          description: newProject.description,
          tech: newProject.tech,
          link: newProject.link
        }),
      });

      if (!res.ok) {
        throw new Error(`Failed to add project entry: ${res.statusText}`);
      }
      const addedProject = await res.json();
      // Thêm mục học vấn mới vào state, khởi tạo mediaFiles rỗng
      setProjectList(prevProj => [...prevProj, { ...addedProject, mediaFiles: [] }]);
      setNewProject({ title: "", description: "", tech: "", link: "" });
      setShowAddForm(false);
      await fetchProject()
      // await fetchProject(); // Đã xóa: Không cần fetch lại toàn bộ sau khi đã cập nhật state cục bộ
    } catch (err: any) {
      console.error("Error adding project entry:", err);
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

    const ProjectToUpdate = ProjectList.find(s => s.projectId === id);
    if (!ProjectToUpdate) return;

    const updatedPayload = {
      title: field === "title" ? value : ProjectToUpdate.title,
      tech: field === "tech" ? value : ProjectToUpdate.tech,
      link: field === "link" ? value : ProjectToUpdate.link,
      description: field === "description" ? value : ProjectToUpdate.description,
    };

    try {
      const res = await authFetch(`/project/${id}`, {
        method: "PUT",
        body: JSON.stringify(updatedPayload),
      });

      if (!res.ok) {
        throw new Error(`Failed to update project entry: ${res.statusText}`);
      }

      setProjectList(prev =>
        prev.map(s =>
          s.projectId === id
            ? { ...s, ...updatedPayload }
            : s
        )
      );

      setEditing(null);
      await fetchProject()
      // await fetchEdus(); // Đã xóa: Không cần fetch lại toàn bộ sau khi đã cập nhật state cục bộ
    } catch (err: any) {
      console.error("Error updating project field:", err);
      alert(`Lỗi khi cập nhật: ${err.message}`);
    }
  };

  // 4. Delete Edu
  const handleDeleteProject = async (idToDelete: number) => {
    if (!isLogin) {
      alert("Bạn cần đăng nhập để xóa project!");
      return;
    }
    if (!window.confirm("Bạn có chắc chắn muốn xóa project này?")) {
      return;
    }

    try {
      const res = await authFetch(`/project/${idToDelete}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error(`Failed to delete project: ${res.statusText}`);
      }

      // Xóa skill khỏi state
      setProjectList(prev => prev.filter(s => s.projectId !== idToDelete));
      alert("project đã được xóa thành công!");
    } catch (err: any) {
      console.error("Error deleting project:", err);
      alert(`Lỗi khi xóa project: ${err.message}`);
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
      formData.append("entityType", "PROJECT");
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
      setProjectList(prevProject =>
        prevProject.map(project =>
          project.projectId === currentEntityForMedia.id
            ? { ...project, mediaFiles: [...project.mediaFiles, newMediaFile] }
            : project
        )
      );

      setShowAddMediaModal(false);
      setCurrentEntityForMedia(null);
      e.target.value = '';
      alert("Media đã được tải lên thành công!");
      await fetchProject()
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
      setProjectList((prevPro) =>
        prevPro.map((pro) =>
          pro.projectId === EduId
            ? {
              ...pro,
              mediaFiles: pro.mediaFiles.filter((media) => media.mediaId !== mediaIdToDelete),
            }
            : pro
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
  // Đã di chuyển ra ngoài renderCard để có thể truy cập trực tiếp
  // Tìm hàm renderField
  // Tìm hàm renderField
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

    // Thêm một biến để kiểm tra xem trường hiện tại có phải là link hay không
    const isLinkField = field === "link";

    return (
      <div className="mb-2 d-flex align-items-start">
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
            {/* Thay đổi ở đây: Kiểm tra isLinkField để hiển thị thẻ <a> hoặc <span> */}
            {isLinkField && value ? (
              // Nếu là link và có giá trị, hiển thị thẻ <a>
              <a href={value} target="_blank" rel="noopener noreferrer" className="flex-grow-1 text-primary text-decoration-underline">
                {value}
              </a>
            ) : (
              // Ngược lại, hiển thị thẻ <span> thông thường
              <span className="flex-grow-1">{value}</span>
            )}

            {isLogin && <button
              className="btn btn-link text-primary p-0 ms-2"
              onClick={() => setEditing({ section, id, field, value })}
              title={`Edit ${label}`}
            >
              <i className="fas fa-pen fs-6"></i>
            </button>}
          </>
        )}
      </div>
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
                        {isLogin &&
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
            {isLogin &&
              <button
                className="btn btn-danger w-100 shadow-sm transition-all d-flex align-items-center justify-content-center mt-2" // Added mt-2
                onClick={() => handleDeleteProject(id)} // Call handleDeleteEdu with the correct ID
                title="Delete Education Entry"
              >
                <i className="fas fa-trash-alt me-2"></i>Delete Project
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
              <i className="fas fa-project-diagram text-info me-3"></i>Project
            </h2>
            {
              isLogin &&
              <button
                className="btn btn-info shadow-sm transition-all d-flex align-items-center"
                onClick={() => setShowAddForm(true)}
              >
                <i className="fas fa-plus-circle me-2"></i>Add New Project
              </button>
            }

          </div>

          {showAddForm && (
            <div className="modal d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content rounded-4 shadow-lg">
                  <div className="modal-header border-0 pb-0">
                    <h5 className="modal-title fs-4 fw-bold text-dark">Add New Project </h5>
                    <button type="button" className="btn-close" aria-label="Close" onClick={() => setShowAddForm(false)}></button>
                  </div>
                  <div className="modal-body pt-0">
                    <input className="form-control mb-3" placeholder="Project Title" value={newProject.title} onChange={(e) => setNewProject({ ...newProject, title: e.target.value })} />
                    <input className="form-control mb-3" placeholder="Techology" value={newProject.tech} onChange={(e) => setNewProject({ ...newProject, tech: e.target.value })} />
                    <input className="form-control mb-3" placeholder="Project Link" value={newProject.link} onChange={(e) => setNewProject({ ...newProject, link: e.target.value })} />
                    <textarea className="form-control mb-4" placeholder="Description" rows={3} value={newProject.description} onChange={(e) => setNewProject({ ...newProject, description: e.target.value })} />
                    <div className="d-flex justify-content-end">
                      <button className="btn btn-secondary me-3" onClick={() => setShowAddForm(false)}>Cancel</button>
                      <button
                        className="btn btn-success"
                        onClick={handleAddProject}
                      >
                        <i className="fas fa-save me-2"></i>Save Project
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
          ) : ProjectList.length === 0 ? (
            <div className="text-center text-muted py-5 border border-dashed border-2 border-secondary rounded-3">
              <p className="mb-2">No Project found.</p>
              {isLogin && <p>Click "Add New Project" to create your Project!</p>}
            </div>
          ) : (
            <div className="row g-4">
              {ProjectList.map((proj) => renderCard(
                proj,
                "projectId",
                "Project",
                <>
                  {renderField("Project Title", proj.title, "Project", proj.projectId, "title", "text", false, handleUpdateField)}
                  {renderField("Technology", proj.tech, "Project", proj.projectId, "tech", "text", false, handleUpdateField)}
                  {renderField("Link", proj.link, "Project", proj.projectId, "link", "text", false, handleUpdateField)}
                  {renderField("Description", proj.description, "Project", proj.projectId, "description", "text", true, handleUpdateField)}
                </>,
                handleDeleteProject,
                handleUpdateField
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

export default ProjectPage;
