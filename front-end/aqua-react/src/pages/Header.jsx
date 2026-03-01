import React from 'react';
import { Link } from 'react-router-dom';
import './header.css';

const Header = ({ usuario, abrirLogin, abrirCarrito, conteo }) => {
    return (
        <header className="main-header">
            <div className="header-container">
                {/* LOGO */}
                <Link to="/" className="logo">
                    <i className="fa-solid fa-droplet"></i> Aqua Clean Pro
                </Link>

                {/* NAVEGACIÓN CENTRAL */}
                <nav className="nav-links">
                    <Link to="/">Inicio</Link>
                    <Link to="/productos">Productos</Link>
                    <Link to="/nosotros">Nosotros</Link>
                    <Link to="/contacto">Contacto</Link>
                    {usuario?.rol === 'admin' && <Link to="/admin" className="admin-link">Admin</Link>}
                </nav>

                {/* ICONOS DE ACCIÓN (DERECHA) */}
                <div className="header-actions">
                    {/* BUSCADOR */}
                    <div className="action-icon">
                        <i className="fa-solid fa-magnifying-glass"></i>
                    </div>

                    {/* CARRITO */}
                    <div className="icon-badge-container" onClick={abrirCarrito}>
                        <i className="fa-solid fa-cart-shopping"></i>
                        {conteo > 0 && <span className="badge">{conteo}</span>}
                    </div>

                    {/* PERFIL: Solo el icono cuando hay sesión iniciada */}
                    {usuario ? (
                        <Link to="/perfil" className="profile-link-only" title="Mi Perfil">
                            <div className="user-icon-circle">
                                <i className="fa-regular fa-user"></i>
                            </div>
                        </Link>
                    ) : (
                        <button className="btn-login-nav" onClick={abrirLogin}>
                            Iniciar Sesión
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;