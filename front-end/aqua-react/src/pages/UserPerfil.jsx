import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import MensajeModal from '../components/MensajeModal';
import '../styles/UserProfile.css';

const UserPerfil = ({ usuario, onCerrarSesion, onActualizarDireccion }) => {
    const [mostrarForm, setMostrarForm] = useState(false);
    const [cargando, setCargando] = useState(false);
    const [tabActivo, setTabActivo] = useState('inventario');
    const [productos, setProductos] = useState([]);
    const [cargandoProductos, setCargandoProductos] = useState(false);
    const [modal, setModal] = useState({ abierto: false, tipo: '', titulo: '', texto: '' });
    const [idAEliminar, setIdAEliminar] = useState(null);
    const navigate = useNavigate();

    const esAdmin = usuario && (usuario.rol == 1 || usuario.rol === 'admin' || usuario.rol_id == 1);

    useEffect(() => {
        if (esAdmin && tabActivo === 'inventario') {
            setCargandoProductos(true);
            fetch('https://macrowatersolutions.com/api/productos')
                .then(res => res.json())
                .then(data => setProductos(data))
                .catch(err => console.error('Error cargando productos:', err))
                .finally(() => setCargandoProductos(false));
        }
    }, [esAdmin, tabActivo]);

    const ejecutarEliminado = async () => {
        setModal(m => ({ ...m, abierto: false }));
        try {
            const res = await fetch(`https://macrowatersolutions.com/api/productos/${idAEliminar}`, { method: 'DELETE' });
            if (res.ok) {
                setModal({ abierto: true, tipo: 'exito', titulo: '¡Borrado!', texto: 'Producto eliminado correctamente.' });
                setProductos(prev => prev.filter(p => p.id !== idAEliminar));
            } else {
                setModal({ abierto: true, tipo: 'error', titulo: 'Error', texto: 'No se pudo eliminar el producto.' });
            }
        } catch (e) {
            setModal({ abierto: true, tipo: 'error', titulo: 'Error', texto: 'No se pudo conectar con el servidor.' });
        }
    };

    const getStockClass = (stock) => {
        if (!stock || stock <= 0) return 'stock-agotado';
        if (stock <= 5) return 'stock-bajo';
        return 'stock-ok';
    };

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
            const res = await fetch(`https://macrowatersolutions.com/api/auth/UpdateD/${usuario.id}`, {
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
                            <span className={esAdmin ? 'badge-admin' : 'badge-cliente'}>{esAdmin ? 'ADMIN' : 'CLIENTE'}</span><br/>
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

            {esAdmin && (
                <div className="control-panel-card">
                    <div className="control-panel-header">
                        <i className="fa-solid fa-th-large icon-panel"></i>
                        <div>
                            <h4 className="control-panel-title">Panel de Control</h4>
                            <p className="control-panel-desc">Gestión general de la tienda y métricas.</p>
                        </div>
                    </div>
                    <div className="control-panel-tabs">
                        <button className={`tab-item ${tabActivo === 'pedidos' ? 'active' : ''}`} onClick={() => setTabActivo('pedidos')}>Pedidos</button>
                        <button className={`tab-item ${tabActivo === 'inventario' ? 'active' : ''}`} onClick={() => setTabActivo('inventario')}>Inventario</button>
                    </div>
                    {tabActivo === 'inventario' && (
                        <div className="inventario-content">
                            <div className="inventario-header">
                                <h5 className="inventario-subtitle">Listado de productos</h5>
                                <Link to="/admin" className="btn-agregar-nuevo"><i className="fa-solid fa-plus"></i> Agregar Nuevo</Link>
                            </div>
                            {cargandoProductos ? (
                                <p className="inventario-loading">Cargando productos...</p>
                            ) : (
                                <div className="productos-list-inventario">
                                    {productos.map((prod) => (
                                        <div className="producto-item-inventario" key={prod.id}>
                                            <div className="producto-item-img">
                                                {prod.imagen ? <img src={prod.imagen} alt={prod.nombre} /> : <div className="producto-placeholder"><i className="fa-solid fa-image"></i></div>}
                                            </div>
                                            <div className="producto-item-info">
                                                <h6 className="producto-item-nombre">{prod.nombre}</h6>
                                                <span className="producto-item-precio">${prod.precio}</span>
                                                <span className={`producto-item-stock ${getStockClass(prod.stock)}`}>
                                                    {!prod.stock || prod.stock <= 0 ? 'AGOTADO' : `Stock: ${prod.stock}`}
                                                </span>
                                            </div>
                                            <div className="producto-item-acciones">
                                                <button className="btn-icon-edit" onClick={() => navigate(`/admin/editar/${prod.id}`)} title="Editar"><i className="fa-solid fa-pen"></i></button>
                                                <button className="btn-icon-delete" onClick={() => { setIdAEliminar(prod.id); setModal({ abierto: true, tipo: 'pregunta', titulo: '¿Eliminar?', texto: 'Esta acción quitará el producto de la base de datos.' }); }} title="Eliminar"><i className="fa-solid fa-trash-can"></i></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                    {tabActivo === 'pedidos' && <div className="pedidos-content"><p className="pedidos-empty">Próximamente: listado de pedidos.</p></div>}
                </div>
            )}

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

            {modal.abierto && <MensajeModal info={modal} cerrar={() => setModal(m => ({ ...m, abierto: false }))} onConfirmar={ejecutarEliminado} />}
        </div>
    );
};

export default UserPerfil;
