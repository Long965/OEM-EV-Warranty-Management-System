import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import './Layout.css'; 

const Layout = ({ onLogout }) => {
    return (
        <div className="app-layout">
            {/* 1. Header */}
            <header className="main-header">
                <div className="logo-area">
                    <Link to="/" className="app-title">OEM EV Analytics</Link>
                </div>
                <nav className="header-nav">
                    <span className="user-info">
                        SC Staff | 
                        <button onClick={onLogout} className="logout-button">Đăng xuất</button></span>
                </nav>
            </header>

            {/* 2. Main Content Area */}
            <div className="main-content-area">
                
                {/* Sidebar */}
                <aside className="sidebar">
                    <nav className="sidebar-nav">
                        <Link to="/" className="nav-item">
                            Chiến dịch & Thu hồi
                        </Link>
                        <Link to="/reports" className="nav-item">
                            Báo cáo & Dự báo
                        </Link>
                        <Link to="/fault-data" className="nav-item">
                            Quản lý Dữ liệu Lỗi
                        </Link>
                    </nav>
                </aside>

                <main className="page-content">
                    <Outlet />
                </main>
            </div>

            {/* 3. Footer */}
            <footer className="main-footer">
                © 2025 Campaign & Analytics Microservice
            </footer>
        </div>
    );
};

export default Layout;