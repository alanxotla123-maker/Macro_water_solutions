import React, { useState } from 'react';
import '../styles/UserProfile.css';

const UserPerfil = ({ usuario, onCerrarSesion, onActualizarDireccion }) => {
    const [mostrarForm, setMostrarForm] = useState(false);
    const [cargando, setCargando] = useState(false);

    if (!usuario) return <div className="loading">Cargando perfil...</div>;

    const handleSubmitDireccion = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        
        const calle = formData.get('calle');
        const colonia = formData.get('colonia');
        const ciudad = formData.get('ciudad');
        const cp = formData.get('cp');
        const telefono = formData.get('telefono');

        // Formato unificado
        const direccionFinal = `${calle}, Col. ${colonia}, ${ciudad}, CP: ${cp} - Tel: ${telefono}`;
        
        setCargando(true);
        try {
            // CAMBIO AQUÍ: Usamos direccionFinal en el body
            const res = await fetch(`http://localhost:3000/api/auth/UpdateD/${usuario.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ direccion: direccionFinal }) 
            });

            if (res.ok) {
                // 1. Actualizamos el estado global de la App
                if (onActualizarDireccion) onActualizarDireccion(direccionFinal);
                
                // 2. IMPORTANTE: Actualizar el localStorage para que al recargar no se pierda
                const usuarioLocal = JSON.parse(localStorage.getItem("usuario_aqua"));
                if(usuarioLocal) {
                    usuarioLocal.direccion = direccionFinal;
                    localStorage.setItem("usuario_aqua", JSON.stringify(usuarioLocal));
                }

                setMostrarForm(false);
                alert("¡Dirección actualizada con éxito!");
                window.location.reload();
            } else {
                const errorData = await res.json();
                alert(`Error: ${errorData.message || 'No se pudo actualizar'}`);
            }
        } catch (error) {
            console.error("Error al actualizar:", error);
            alert("Error de conexión con el servidor");
        } finally { setCargando(false); }
    };

    return (
        <div className="user-panel-container">
            <div className="profile-header-card">
                <div className="profile-banner-blue"></div>
                <div className="profile-content">
                    <div className="avatar-circle">
                        <i className="fa-regular fa-user"></i>
                    </div>
                    <h3 className="user-name-title">{usuario.nombre}</h3>
                    <div className="user-info-section">
                        <div className="tag-container">
                            <span className="badge-cliente">CLIENTE</span><br/>
                            <span className="user-email-text">{usuario.correo}</span>
                        </div>
                        <div className="address-display-box">
                            <i className="fa-solid fa-location-dot icon-gps"></i>
                            <span className="address-text">
                                {usuario.direccion || "Dirección no ingresada"}
                            </span>
                        </div>
                        <button 
                            className={`btn-toggle-form ${mostrarForm ? 'cancel' : 'edit'}`}
                            onClick={() => setMostrarForm(!mostrarForm)}
                        >
                            {mostrarForm ? 'Cancelar' : 'Actualizar dirección'}
                        </button>
                    </div>

                    {mostrarForm && (
                        <div className="shipping-container-fancy">
                            <div className="divider-line"></div>
                            <h4 className="shipping-title-fancy">Dirección de Envío</h4>
                            <form onSubmit={handleSubmitDireccion} className="fancy-form">
                                <div className="form-group-fancy">
                                    <label>Calle y Número</label>
                                    <input name="calle" type="text" placeholder="Ej. Paseo de la Alborada 1001" required />
                                </div>
                                <div className="form-row-fancy">
                                    <div className="form-group-fancy">
                                        <label>Colonia</label>
                                        <input name="colonia" type="text" placeholder="Ej. El Pueblito" required />
                                    </div>
                                    <div className="form-group-fancy">
                                        <label>Teléfono</label>
                                        <input name="telefono" type="tel" placeholder="442 275 2025" required />
                                    </div>
                                </div>
                                <div className="form-row-fancy">
                                    <div className="form-group-fancy">
                                        <label>Ciudad</label>
                                        <input name="ciudad" type="text" placeholder="Querétaro" required />
                                    </div>
                                    <div className="form-group-fancy">
                                        <label>C.P.</label>
                                        <input name="cp" type="text" placeholder="76113" required />
                                    </div>
                                </div>
                                <button type="submit" className="confirm-btn-fancy" disabled={cargando}>
                                    {cargando ? "Guardando..." : "Confirmar Dirección"}
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </div>

            <div className="account-menu-card">
                <h4>Mi cuenta</h4>
                <ul className="menu-list">
                    <li className="menu-item"><i className="fa-solid fa-box"></i> Mis Pedidos</li>
                    <li className="menu-item"><i className="fa-regular fa-clock"></i> Historial de compras</li>
                    <li className="menu-item"><i className="fa-solid fa-gear"></i> Configuración</li>
                    <li className="menu-item logout-item" onClick={onCerrarSesion}>
                        <i className="fa-solid fa-arrow-right-from-bracket"></i> Cerrar sesión
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default UserPerfil;