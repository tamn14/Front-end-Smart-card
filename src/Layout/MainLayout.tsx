// src/layouts/MainLayout.tsx
import { Outlet } from "react-router-dom";
import Navbar from "../header-footer/navbar";
import Footer from "../header-footer/footer";

interface Props {
  setTuKhoaTimKiem: (value: string) => void;
  isLogin: boolean;
  setIsLogin: (value: boolean) => void;
}
const MainLayout = ({ setTuKhoaTimKiem, isLogin, setIsLogin }: Props) => {
  return (
    <>
      <Navbar setTuKhoaTimKiem={setTuKhoaTimKiem} isLogin={isLogin} setIsLogin={setIsLogin} />
      <Outlet />
      <Footer />
    </>
  );
};

export default MainLayout;
