import { Outlet } from "react-router-dom";
import SidebarAdmin from "./Components/Admin/SideBarAdmin";
interface Props {
  isLogin: boolean;
  setIsLogin: (value: boolean) => void;
}
const AdminLayout : React.FC<Props> = ({ isLogin, setIsLogin }) => {
  return (
    <div className="container-fluid">
      <div className="row min-vh-100">
        {/* Sidebar bên trái */}
        <div className="col-md-3 bg-dark text-white p-4">
          <SidebarAdmin isLogin={isLogin} setIsLogin={setIsLogin}  />
        </div>

        {/* Nội dung hiển thị bên phải */}
        <div className="col-md-9 p-4 bg-light">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
