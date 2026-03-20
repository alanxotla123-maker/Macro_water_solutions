import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import MensajeModal from '../components/MensajeModal';
import '../styles/UserProfile.css';

const UserPerfil = ({ usuario, onCerrarSesion, onActualizarDireccion }) => {
    const [mostrarForm, setMostrarForm] = useState(false);
    const [cargando, setCargando] = useState(false);
    const [tabActivo, setTabActivo] = useState('inventario');
    const [productos, setProductos] = useState([]);
    const [pedidos, setPedidos] = useState([]);
    const [cargandoData, setCargandoData] = useState(false);
    const [modal, setModal] = useState({ abierto: false, tipo: '', titulo: '', texto: '' });
    const [idAEliminar, setIdAEliminar] = useState(null);
    const navigate = useNavigate();

    const esAdmin = usuario && (usuario.rol == 1 || usuario.rol === 'admin' || usuario.rol_id == 1);

    useEffect(() => {
        if (tabActivo === 'inventario' && esAdmin) {
            fetchData('productos', setProductos);
        } else if (tabActivo === 'pedidos') {
            fetchData(`mis-pedidos/${usuario.id}`, setPedidos);
        }
    }, [tabActivo, esAdmin, usuario.id]);

    const fetchData = (endpoint, setter) => {
        setCargandoData(true);
        fetch(`https://macrowatersolutions.com/api/${endpoint}`)
            .then(res => res.json())
            .then(data => setter(data))
            .catch(err => console.error(err))
            .finally(() => setCargandoData(false));
    };

    const ejecutarEliminado = async () => {
        setModal(m => ({ ...m, abierto: false }));
        try {
            const res = await fetch(`https://macrowatersolutions.com/api/productos/${idAEliminar}`, { method: 'DELETE' });
            if (res.ok) {
                setProductos(prev => prev.filter(p => p.id !== idAEliminar));
                setModal({ abierto: true, tipo: 'exito', titulo: '¡Borrado!', texto: 'Producto eliminado.' });
            }
        } catch (e) { console.error(e); }
    };

    const handleSubmitDireccion = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const direccionFinal = `${formData.get('calle')}, Col. ${formData.get('colonia')}, ${formData.get('ciudad')}, CP: ${formData.get('cp')} - Tel: ${formData.get('telefono')}`;
        
        setCargando(true);
        try {
            const res = await fetch(`https://macrowatersolutions.com/api/auth/UpdateD/${usuario.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ direccion: direccionFinal }) 
            });

            if (res.ok) {
                if (onActualizarDireccion) onActualizarDireccion(direccionFinal);
                const usuarioLocal = JSON.parse(localStorage.getItem("usuario_aqua"));
                if(usuarioLocal) {
                    usuarioLocal.direccion = direccionFinal;
                    localStorage.setItem("usuario_aqua", JSON.stringify(usuarioLocal));
                }
                alert("Dirección actualizada");
                window.location.reload();
            }
        } catch (error) { console.error(error); } finally { setCargando(false); }
    };

    if (!usuario) return <div className="loading">Cargando perfil...</div>;

    return (
        <div className="user-panel-container">
            {/* --- CABECERA DE PERFIL --- */}
            <div className="profile-header-card">
                <div className="profile-banner-blue"></div>
                <div className="profile-content">
                    <div className="avatar-circle"><i className="fa-regular fa-user"></i></div>
                    <h3 className="user-name-title">{usuario.nombre}</h3>
                    <div className="user-info-section">
                        <span className={esAdmin ? 'badge-admin' : 'badge-cliente'}>{esAdmin ? 'ADMIN' : 'CLIENTE'}</span>
                        <p className="user-email-text">{usuario.correo}</p>
                        <div className="address-display-box">
                            <i className="fa-solid fa-location-dot"></i>
                            <span>{usuario.direccion || "Sin dirección registrada"}</span>
                        </div>
                        <button className="btn-toggle-form edit" onClick={() => setMostrarForm(!mostrarForm)}>
                            {mostrarForm ? 'Cancelar' : 'Actualizar dirección'}
                        </button>
                    </div>
                    {mostrarForm && (
                        <form onSubmit={handleSubmitDireccion} className="fancy-form">
                            <input name="calle" placeholder="Calle y Número" required />
                            <div className="form-row-fancy">
                                <input name="colonia" placeholder="Colonia" required />
                                <input name="telefono" placeholder="Teléfono" required />
                            </div>
                            <div className="form-row-fancy">
                                <input name="ciudad" placeholder="Ciudad" required />
                                <input name="cp" placeholder="C.P." required />
                            </div>
                            <button type="submit" className="confirm-btn-fancy" disabled={cargando}>Confirmar</button>
                        </form>
                    )}
                </div>
            </div>

            {/* --- PANEL DE CONTROL --- */}
            <div className="control-panel-card">
                <div className="control-panel-tabs">
                    <button className={`tab-item ${tabActivo === 'pedidos' ? 'active' : ''}`} onClick={() => setTabActivo('pedidos')}>Pedidos</button>
                    {esAdmin && <button className={`tab-item ${tabActivo === 'inventario' ? 'active' : ''}`} onClick={() => setTabActivo('inventario')}>Inventario</button>}
                </div>

                {tabActivo === 'inventario' && esAdmin && (
                    <div className="inventario-content">
                        <Link to="/admin" className="btn-agregar-nuevo">+ Agregar</Link>
                        <div className="productos-list-inventario">
                            {productos.map(prod => (
                                <div className="producto-item-inventario" key={prod.id}>
                                    <h6>{prod.nombre}</h6>
                                    <span>${prod.precio} | Stock: {prod.stock}</span>
                                    <div className="producto-item-acciones">
                                        <button onClick={() => navigate(`/admin/editar/${prod.id}`)}><i className="fa-solid fa-pen"></i></button>
                                        <button onClick={() => { setIdAEliminar(prod.id); setModal({ abierto: true, tipo: 'pregunta', titulo: '¿Borrar?', texto: 'Confirmar eliminación' }); }}><i className="fa-solid fa-trash-can"></i></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {tabActivo === 'pedidos' && (
                    <div className="pedidos-content">
                        {pedidos.length === 0 ? <p>No hay pedidos.</p> : (
                            <div className="pedidos-list">
                                {pedidos.map(p => (
                                    <div key={p.id} className="pedido-card-simple" style={{border: '1px solid #eee', padding: '10px', marginBottom: '10px', borderRadius: '8px'}}>
                                        <div style={{display: 'flex', justifyContent: 'space-between'}}>
                                            <strong>{p.producto_nombre}</strong>
                                            <span className={`status-${p.estado}`} style={{color: 'green', fontWeight: 'bold'}}>{p.estado}</span>
                                        </div>
                                        <p>Cantidad: {p.cantidad} | Total: ${p.precio_total}</p>
                                        <small>{new Date(p.fecha).toLocaleDateString()}</small>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <button className="menu-item logout-item" onClick={onCerrarSesion} style={{marginTop: '20px'}}>Cerrar sesión</button>

            {modal.abierto && <MensajeModal info={modal} cerrar={() => setModal(m => ({ ...m, abierto: false }))} onConfirmar={ejecutarEliminado} />}
        </div>
    );
};

export default UserPerfil;