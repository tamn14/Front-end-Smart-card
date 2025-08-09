import React, { useState, useEffect, type FormEvent } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { authFetch } from '../../../Utils/authFetch';

// --- Interfaces ---
interface CardResponse {
  cardId: number;
  name: string;
  description: string;
  price: number;
  url: string; // ảnh sau khi upload xong
}

interface ApiResponse<T> {
  code: number;
  mess: string;
  result: T;
}

interface PageableResponse {
  content: CardResponse[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

interface Props {
  isLogin: boolean;
}

const ManageCard:  React.FC<Props> = ({ isLogin }) => {
  const [cards, setCards] = useState<CardResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const PAGE_SIZE = 4;

  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCard, setEditingCard] = useState<CardResponse | null>(null);
  const [formState, setFormState] = useState<{
    name: string;
    description: string;
    price: number;
    url: File | null;
  }>({
    name: '',
    description: '',
    price: 0,
    url: null,
  });

  const fetchCards = async (page: number, name?: string) => {
    setLoading(true);
    setError(null);
    try {
      let url = name?.trim()
        ? `/cards/name/${encodeURIComponent(name)}?page=${page}&size=${PAGE_SIZE}`
        : `/cards?page=${page}&size=${PAGE_SIZE}`;

      const res = await authFetch(url);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.mess || 'Lỗi khi tải thẻ');
      }

      const data: ApiResponse<PageableResponse> = await res.json();
      setCards(data.result.content || []);
      setTotalPages(data.result.totalPages || 1);
    } catch (err: any) {
      setError(err.message || 'Lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards(currentPage, searchQuery);
  }, [currentPage, searchQuery]);

  const handleCreateClick = () => {
    setEditingCard(null);
    setFormState({ name: '', description: '', price: 0, url: null });
    setShowModal(true);
  };

  const handleEditClick = (card: CardResponse) => {
    setEditingCard(card);
    setFormState({ name: card.name, description: card.description, price: card.price, url: null });
    setShowModal(true);
  };

  const handleDeleteClick = async (cardId: number) => {
    try {
      const res = await authFetch(`/cards/${cardId}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Xoá thành công!');
        fetchCards(currentPage, searchQuery);
      } else {
        const err = await res.json();
        toast.error(err.mess || 'Xoá thất bại');
      }
    } catch (err) {
      toast.error('Lỗi khi xoá thẻ');
    }
  };

  const handleSaveCard = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      const method = editingCard ? 'PUT' : 'POST';
      const url = editingCard ? `/cards/${editingCard.cardId}` : `/cards`;

      const formData = new FormData();
      formData.append('name', formState.name);
      formData.append('description', formState.description);
      formData.append('price', String(formState.price));
      if (formState.url) {
        formData.append('imageUrl', formState.url); // key "image" cần backend nhận đúng
      }

      const res = await authFetch(url, {
        method,
        body: formData,
      });

      if (res.ok) {
        toast.success(editingCard ? 'Cập nhật thành công!' : 'Thêm thẻ mới thành công!');
        setShowModal(false);
        fetchCards(editingCard ? currentPage : 0, searchQuery);
      } else {
        const error = await res.json();
        toast.error(error.mess || 'Thêm/Cập nhật thất bại');
      }
    } catch (err) {
      toast.error('Lỗi xử lý dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(0);
  };

  return (
    <div className="container-fluid p-4">
      <ToastContainer position="top-right" autoClose={3000} />
      <h3 className="mb-4">Quản lý Thẻ</h3>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="input-group" style={{ maxWidth: '400px' }}>
          <input
            type="text"
            className="form-control"
            placeholder="Tìm kiếm theo tên thẻ..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
          <button className="btn btn-outline-secondary" type="button">
            <i className="bi bi-search"></i>
          </button>
        </div>
        {
          isLogin &&  <button className="btn btn-primary" onClick={handleCreateClick}>
          <i className="bi bi-plus-lg me-2"></i>Thêm thẻ mới
        </button>
        }
       
      </div>

      {error && <div className="alert alert-danger text-center">{error}</div>}

      {loading && !cards.length ? (
        <div className="text-center p-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Đang tải dữ liệu...</p>
        </div>
      ) : (
        <div className="card shadow-sm">
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead>
                  <tr>
                    <th>Mã</th>
                    <th>Ảnh</th>
                    <th>Tên</th>
                    <th>Mô tả</th>
                    <th>Giá</th>
                    <th className="text-center">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {cards.length ? (
                    cards.map((card) => (
                      <tr key={card.cardId}>
                        <td>#{card.cardId}</td>
                        <td>
                          <img src={card.url} alt={card.name} style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8 }} />
                        </td>
                        <td>{card.name}</td>
                        <td style={{ minWidth: 250 }}>{card.description}</td>
                        <td>{card.price.toLocaleString('vi-VN')} VNĐ</td>
                        {
                          isLogin && 
                           <td className="text-center">
                          <button className="btn btn-sm btn-outline-warning me-2" onClick={() => handleEditClick(card)}>
                            <i className="bi bi-pencil-fill"></i>
                          </button>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteClick(card.cardId)}>
                            <i className="bi bi-trash-fill"></i>
                          </button>
                        </td>
                        }
                       
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center p-4">Không tìm thấy thẻ nào.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {totalPages > 1 && (
        <nav className="d-flex justify-content-center mt-4">
          <ul className="pagination">
            <li className={`page-item ${currentPage === 0 ? 'disabled' : ''}`}>
              <button className="page-link" onClick={() => setCurrentPage(currentPage - 1)}>Trước</button>
            </li>
            {Array.from({ length: totalPages }, (_, i) => (
              <li key={i} className={`page-item ${currentPage === i ? 'active' : ''}`}>
                <button className="page-link" onClick={() => setCurrentPage(i)}>{i + 1}</button>
              </li>
            ))}
            <li className={`page-item ${currentPage >= totalPages - 1 ? 'disabled' : ''}`}>
              <button className="page-link" onClick={() => setCurrentPage(currentPage + 1)}>Sau</button>
            </li>
          </ul>
        </nav>
      )}

      {/* Modal */}
      <div className={`modal fade ${showModal ? 'show d-block' : 'd-none'}`} tabIndex={-1} style={{ backgroundColor: showModal ? 'rgba(0,0,0,0.5)' : 'transparent' }}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <form onSubmit={handleSaveCard}>
              <div className="modal-header">
                <h5 className="modal-title">{editingCard ? 'Sửa thẻ' : 'Thêm thẻ mới'}</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Tên thẻ</label>
                  <input type="text" className="form-control" value={formState.name} onChange={(e) => setFormState({ ...formState, name: e.target.value })} required />
                </div>
                <div className="mb-3">
                  <label className="form-label">Mô tả</label>
                  <textarea className="form-control" rows={3} value={formState.description} onChange={(e) => setFormState({ ...formState, description: e.target.value })} required />
                </div>
                <div className="mb-3">
                  <label className="form-label">Giá</label>
                  <input type="number" className="form-control" value={formState.price} onChange={(e) => setFormState({ ...formState, price: parseInt(e.target.value) || 0 })} required />
                </div>
                <div className="mb-3">
                  <label className="form-label">Ảnh</label>
                  <input type="file" accept="image/*" className="form-control" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setFormState({ ...formState, url: file });
                    }
                  }} required={!editingCard} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Đang lưu...' : 'Lưu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageCard;
