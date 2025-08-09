import { BrowserRouter, Route, Routes } from "react-router-dom";
import { useState } from "react";
import HomePages from "../Pages/HomePage";
import Products from "../Pages/Product";

import ProductProp from "../Products/productProp";
import OrdersPage from "../Pages/OrdersPage";
import Login from "../Pages/Login";
import RegisterUser from "../Pages/Register";
import PortfolioHomePage from "../Pages/Fortfolio";
import MainLayout from "../Layout/MainLayout";
import ContactPage from "../Pages/ContactPage ";
import AdminHome from "../Pages/Components/Admin/AdminHome";
import ManageCard from "../Pages/Components/Admin/ManageCard";
import ManageOrders from "../Pages/Components/Admin/ManageOrders";
import ManageCustomers from "../Pages/Components/Admin/ManageCustomers";
import AdminPage from "../Pages/AdminPage";
import OrdersUserPage from "../Pages/Components/OrdersUserPage";


const AppRoutes = () => {
  const [tuKhoaTimKiem, setTuKhoaTimKiem] = useState('');
  const [isLogin, setIsLogin] = useState<boolean>(() => !!localStorage.getItem("accessToken"));

  return (
    <BrowserRouter>
      <Routes>
        {/* Các route dùng chung layout */}
        <Route
          element={
            <MainLayout
              setTuKhoaTimKiem={setTuKhoaTimKiem}
              isLogin={isLogin}
              setIsLogin={setIsLogin}
            />
          }
        >
          <Route path="/" element={<HomePages tuKhoaTimKiem={tuKhoaTimKiem} />} />
          <Route path="/sanpham" element={<Products tuKhoaTimKiem={tuKhoaTimKiem} />} />
          <Route path="/lienhe" element={<ContactPage />} />
          <Route path="/card/:cardId" element={<ProductProp />} />
          <Route path="/card/:cardId/order" element={<OrdersPage isLogin={isLogin} />} />
          <Route path="/login" element={<Login setIsLogin={setIsLogin} />} />
          <Route path="/register" element={<RegisterUser />} />
           <Route path="/my-order" element={<OrdersUserPage />} />
        </Route>

        {/* PortfolioPage KHÔNG dùng layout */}
        <Route path="/portfolio/:userId" element={<PortfolioHomePage isLogin={isLogin} />} />
        <Route path="/admin" element={<AdminPage  isLogin={isLogin} setIsLogin={setIsLogin} />}>
          <Route index element={<AdminHome />} />
          <Route path="card" element={<ManageCard  isLogin={isLogin}/>} />
          <Route path="orders" element={<ManageOrders isLogin={isLogin}/>} />
          <Route path="customers" element={<ManageCustomers isLogin={isLogin} />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
