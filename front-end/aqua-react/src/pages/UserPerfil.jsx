import React from 'react';
import '../styles/UserProfile.css';


const UserPerfil = ({ usuario, onCerrarSesion }) => {
    // Si no hay usuario, mostramos un estado de carga o vacío
    if (!usuario) return <div className="loading">Cargando perfil...</div>;

    return (
        <div className="user-panel-container">
            {/* Cabecera Dinámica */}
            <div className="profile-header-card">
                <div className="avatar-circle">
                    <i className="fa-regular fa-user"></i>
                </div>
                {/* Datos reales de la Base de Datos */}
                <h3 className="user-name-title">{usuario.nombre}</h3>
                <div className="user-detail-tags" id='adm'>
                    <span className="badge-rol">
                        {usuario.rol === 'admin' ? 'Administrador' : 'Cliente'}
                    </span>
                    <span className="user-email-text">{usuario.correo}</span>
                </div>
                <p className="user-address-text">
                    <i className="fa-solid fa-location-dot"></i> 
                    {usuario.direccion || "Sin dirección registrada"}
                </p>
            </div>

            {/* Menú de Cuenta */}
            <div className="account-menu-card">
                <h4>Mi cuenta</h4>
                <ul className="menu-list">
                    <li className="menu-item">
                        <i className="fa-solid fa-box"></i> Mis Pedidos
                    </li>
                    <li className="menu-item">
                        <i className="fa-regular fa-clock"></i> Historial de compras
                    </li>
                    <li className="menu-item">
                        <i className="fa-solid fa-gear"></i> Configuración
                    </li>
                    <li className="menu-item logout-item" onClick={onCerrarSesion}>
                        <i className="fa-solid fa-arrow-right-from-bracket"></i> Cerrar sesión
                    </li>
                </ul>
            </div>

            {/* Sección de Historial (Aquí irán tus compras de la DB más adelante) */}
            <div className="history-card">
                <div className="history-title">
                    <i className="fa-regular fa-clock"></i> 
                    <h4>Actividad reciente</h4>
                </div>
                <div className="empty-history">
                    <p>No tienes compras registradas recientemente.</p>
                </div>
            </div>
        </div>
    );
};

export default UserPerfil;