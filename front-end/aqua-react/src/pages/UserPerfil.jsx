import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import MensajeModal from '../components/MensajeModal';
import '../styles/UserProfile.css';

const UserPerfil = ({ usuario, onCerrarSesion, onActualizarDireccion }) => {
    const [tabActivo, setTabActivo] = useState('historial'); 
    const [pedidos, setPedidos] = useState([]); 
    const [productos, setProductos] = useState([]); 
    const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null); 
    const [cargandoData, setCargandoData] = useState(false);
    const [cargandoEnvio, setCargandoEnvio] = useState(false);

    const esAdmin = usuario && (usuario.rol == 1 || usuario.rol === 'admin' || usuario.rol_id == 1);

    // Función de carga de datos memorizada para evitar re-creaciones innecesarias
    const fetchData = useCallback(async (signal) => {
        if (!usuario?.id) return;
        
        setCargandoData(true);
        try {
            let endpoint = '';
            if (tabActivo === 'historial') {
                endpoint = esAdmin ? 'api/admin/pedidos' : `api/mis-pedidos/${usuario.id}`;
            } else if (tabActivo === 'inventario') {
                endpoint = 'api/productos';
            }

            if (!endpoint) return;

            const res = await fetch(`https://macrowatersolutions.com/${endpoint}`, { signal });
            if (!res.ok) throw new Error('Error en la respuesta del servidor');
            
            const data = await res.json();
            
            if (tabActivo === 'inventario') {
                setProductos(Array.isArray(data) ? data : []);
            } else {
                setPedidos(Array.isArray(data) ? data : []);
            }
        } catch (err) {
            if (err.name !== 'AbortError') {
                console.error('Error al cargar datos:', err);
            }
        } finally {
            setCargandoData(false);
        }
    }, [tabActivo, usuario?.id, esAdmin]);

    useEffect(() => {
        const controller = new AbortController();
        fetchData(controller.signal);
        return () => controller.abort(); // Limpieza al desmontar o cambiar tab
    }, [fetchData]);

    const handleCambiarEstado = async (idPedidoAgrupado, nuevoEstado) => {
        if (!idPedidoAgrupado) return;

        try {
            const res = await fetch(`https://macrowatersolutions.com/api/admin/pedidos/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    id_pedidos: idPedidoAgrupado, 
                    nuevoEstado: nuevoEstado 
                })
            });

            if (res.ok) {
                setPedidoSeleccionado(prev => ({ ...prev, estado: nuevoEstado }));
                setPedidos(prevPedidos => prevPedidos.map(p => 
                    p.id === idPedidoAgrupado ? { ...p, estado: nuevoEstado } : p
                ));
                alert("✅ Estado actualizado correctamente");
            } else {
                const errorData = await res.json();
                alert("❌ Error: " + (errorData.error || "No se pudo actualizar"));
            }
        } catch (error) {
            alert("❌ Error de conexión");
        }
    };

    const handleSubmitDireccion = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        
        // Construcción de dirección igual a tu lógica original
        const direccionFinal = `${formData.get('calle')}, Col. ${formData.get('colonia')}, ${formData.get('ciudad')}, CP: ${formData.get('cp')} - Tel: ${formData.get('telefono')}`;
        
        setCargandoEnvio(true);
        try {
            const res = await fetch(`https://macrowatersolutions.com/api/auth/UpdateD/${usuario.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ direccion: direccionFinal }) 
            });

            if (res.ok) {
                if (onActualizarDireccion) onActualizarDireccion(direccionFinal);
                alert("¡Dirección actualizada con éxito!");
            }
        } catch (error) { 
            console.error(error); 
            alert("Hubo un error al actualizar.");
        } finally { 
            setCargandoEnvio(false); 
        }
    };

    if (!usuario) return <div className="loading">Cargando perfil...</div>;

    return (
        <div className="perfil-container-aqua">
            <header className="profile-header-card-centered">
                <div className="avatar-circle"><i className="fa-regular fa-user"></i></div>
                <div className="user-meta-centered">
                    <h3 className="user-name-title">{usuario.nombre}</h3>
                    <span className="user-email-text">{usuario.correo}</span>
                    <div className="badge-role-container">
                        <span className={esAdmin ? 'badge-admin' : 'badge-cliente'}>
                            {esAdmin ? 'MODO ADMINISTRADOR' : 'CLIENTE'}
                        </span>
                    </div>
                </div>
            </header>

            <div className="perfil-main-content-static">
                <aside className="perfil-sidebar-fixed">
                    <h4 className="sidebar-title">PANEL</h4>
                    <nav className="sidebar-nav">
                        <button className={`nav-link ${tabActivo === 'historial' ? 'active' : ''}`} 
                                onClick={() => {setTabActivo('historial'); setPedidoSeleccionado(null);}}>
                            <i className="fa-solid fa-file-invoice-dollar"></i> {esAdmin ? 'Ventas Globales' : 'Mis Pedidos'}
                        </button>
                        
                        {esAdmin && (
                            <button className={`nav-link ${tabActivo === 'inventario' ? 'active' : ''}`} 
                                    onClick={() => setTabActivo('inventario')}>
                                <i className="fa-solid fa-boxes-stacked"></i> Gestión Inventario
                            </button>
                        )}

                        <button className={`nav-link ${tabActivo === 'direccion' ? 'active' : ''}`} 
                                onClick={() => setTabActivo('direccion')}>
                            <i className="fa-solid fa-location-dot"></i> Mi Dirección
                        </button>
                        
                        <button className="nav-link logout-item" onClick={onCerrarSesion}>
                            <i className="fa-solid fa-arrow-right-from-bracket"></i> Salir
                        </button>
                    </nav>
                </aside>

                <section className="perfil-view-area-scrollable">
                    {/* VISTA DE HISTORIAL / PEDIDOS */}
                    {tabActivo === 'historial' && (
                        <div className="view-fade-in">
                            <h3 className="view-title">
                                {pedidoSeleccionado ? (
                                    <button onClick={() => setPedidoSeleccionado(null)} className="btn-back-link">
                                        <i className="fa-solid fa-chevron-left"></i> Volver al listado
                                    </button>
                                ) : esAdmin ? "Panel de Ventas Realizadas" : "Mis Compras"}
                            </h3>

                            {cargandoData ? (
                                <div className="loader-container"><p className="empty-text">Consultando datos...</p></div>
                            ) : !pedidoSeleccionado ? (
                                <div className="pedidos-list-aqua">
                                    {pedidos.length > 0 ? pedidos.map(p => (
                                        <div className="pedido-row-item" key={p.id}>
                                            <div className="pedido-info-left">
                                                <span className="pedido-id">Folio: {p.id}</span>
                                                {esAdmin && <span className="cliente-name">Cliente: {p.cliente}</span>}
                                                <span className="pedido-date">{new Date(p.fecha).toLocaleDateString()}</span>
                                                <span className={`badge-status ${p.estado?.toLowerCase()}`}>{p.estado?.toUpperCase()}</span>
                                            </div>
                                            <div className="pedido-info-right">
                                                <span className="pedido-price-tag">${Number(p.total).toLocaleString()}</span>
                                                <button className="btn-ver-detalles" onClick={() => setPedidoSeleccionado(p)}>
                                                    {esAdmin ? 'Gestionar' : 'Detalles'}
                                                </button>
                                            </div>
                                        </div>
                                    )) : <p className="empty-text">No hay registros aún.</p>}
                                </div>
                            ) : (
                                <div className="detalle-pedido-container view-fade-in">
                                    <div className="detalle-header-admin">
                                        <div>
                                            <strong>Pedido:</strong> #{pedidoSeleccionado.id}<br/>
                                            {esAdmin && <span><strong>Correo:</strong> {pedidoSeleccionado.correo}</span>}
                                        </div>
                                        
                                        {esAdmin ? (
                                            <div className="admin-status-control">
                                                <label>Estado: </label>
                                                <select 
                                                    value={pedidoSeleccionado.estado?.toLowerCase() || ""} 
                                                    onChange={(e) => handleCambiarEstado(pedidoSeleccionado.id, e.target.value)}
                                                    className="select-admin-aqua"
                                                >
                                                    <option value="pagado">Pendiente</option>
                                                    <option value="enviado">Pagado</option>
                                                    <option value="entregado">Enviado</option>
                                                    <option value="cancelado">Cancelado</option>
                                                </select>
                                            </div>
                                        ) : (
                                            <span className={`badge-status ${pedidoSeleccionado.estado?.toLowerCase()}`}>
                                                {pedidoSeleccionado.estado?.toUpperCase()}
                                            </span>
                                        )}
                                    </div>

                                    <div className="productos-comprados-lista">
                                        {pedidoSeleccionado.productos?.map((item, idx) => (
                                            <div key={idx} className="prod-item-mini">
                                                <span>{item.nombre}</span>
                                                <strong>x{item.cantidad}</strong>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="total-detalle">
                                        <span>Total pagado:</span>
                                        <span className="monto">${Number(pedidoSeleccionado.total).toLocaleString()}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* VISTA DE INVENTARIO (ADMIN) */}
                    {tabActivo === 'inventario' && esAdmin && (
                        <div className="view-fade-in">
                             <div className="inventory-header">
                                <h3 className="view-title">Gestión de Stock</h3>
                                <Link to="/admin" className="btn-add-inv">+ Agregar Producto</Link>
                            </div>
                            <div className="pedidos-list-aqua">
                                {productos.map(prod => (
                                    <div className="pedido-row-item" key={prod.id}>
                                        <div className="prod-info-admin">
                                            <img src={prod.imagen} alt={prod.nombre} />
                                            <div>
                                                <div className="pedido-id">{prod.nombre}</div>
                                                <div className="stock-label">
                                                    Stock: <strong className={prod.stock < 5 ? 'low-stock' : ''}>{prod.stock}</strong>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="prod-actions-admin">
                                            <span className="pedido-price-tag">${prod.precio}</span>
                                            <Link to={`/admin`} className="btn-ver-detalles">Editar</Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* VISTA DE DIRECCIÓN */}
                    {tabActivo === 'direccion' && (
                         <div className="view-fade-in">
                            <h3 className="view-title">Mi Dirección de Envío</h3>
                            <form onSubmit={handleSubmitDireccion} className="fancy-form">
                                <div className="form-group-fancy">
                                    <label>Calle y Número</label>
                                    <input name="calle" className="input-aqua" defaultValue={usuario.direccion?.split(',')[0]} placeholder="Ej. Av. Siempre Viva 123" required />
                                </div>
                                <div className="form-row-fancy">
                                    <div className="form-group-fancy">
                                        <label>Colonia</label>
                                        <input name="colonia" className="input-aqua" placeholder="Colonia" required />
                                    </div>
                                    <div className="form-group-fancy">
                                        <label>Ciudad</label>
                                        <input name="ciudad" className="input-aqua" placeholder="Ciudad" required />
                                    </div>
                                </div>
                                <div className="form-row-fancy">
                                    <div className="form-group-fancy">
                                        <label>Código Postal</label>
                                        <input name="cp" className="input-aqua" placeholder="C.P." required />
                                    </div>
                                    <div className="form-group-fancy">
                                        <label>Teléfono de Contacto</label>
                                        <input name="telefono" className="input-aqua" placeholder="10 dígitos" required />
                                    </div>
                                </div>
                                <button type="submit" className="confirm-btn-fancy" disabled={cargandoEnvio}>
                                    {cargandoEnvio ? "Guardando..." : "Actualizar Dirección"}
                                </button>
                            </form>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

export default UserPerfil;