import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import MensajeModal from '../components/MensajeModal';
import '../styles/UserProfile.css';

const UserPerfil = ({ usuario, onCerrarSesion, onActualizarDireccion }) => {
    const [tabActivo, setTabActivo] = useState('pedidos'); // Pestaña inicial: Pedidos
    const [pedidos, setPedidos] = useState([]); 
    const [productos, setProductos] = useState([]); 
    const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null); 
    const [productoDetalle, setProductoDetalle] = useState(null); 
    const [nuevoComentario, setNuevoComentario] = useState("");
    const [estrellasSeleccionadas, setEstrellasSeleccionadas] = useState(5);
    const [yaCalificado, setYaCalificado] = useState(false);
    const [cargandoData, setCargandoData] = useState(false);
    const [cargandoEnvio, setCargandoEnvio] = useState(false);
    const [modal, setModal] = useState({ abierto: false, tipo: "", titulo: "", texto: "" });

    const navigate = useNavigate();
    const esAdmin = usuario && (usuario.rol == 1 || usuario.rol === 'admin' || usuario.rol_id == 1);

    // 1. CARGA DE DATOS
    const fetchData = useCallback(async (signal) => {
        if (!usuario?.id) return;
        setCargandoData(true);
        try {
            let endpoint = '';
            if (tabActivo === 'pedidos' || tabActivo === 'historial') {
                endpoint = esAdmin ? 'api/admin/pedidos' : `api/mis-pedidos/${usuario.id}`;
            } else if (tabActivo === 'inventario') {
                endpoint = 'api/productos';
            }
            if (!endpoint) return;

            const res = await fetch(`https://macrowatersolutions.com/${endpoint}`, { signal });
            if (!res.ok) throw new Error('Error en el servidor');
            const data = await res.json();
            
            if (tabActivo === 'inventario') {
                setProductos(Array.isArray(data) ? data : []);
            } else {
                setPedidos(Array.isArray(data) ? data : []);
            }
        } catch (err) {
            if (err.name !== 'AbortError') console.error('Error:', err);
        } finally {
            setCargandoData(false);
        }
    }, [tabActivo, usuario?.id, esAdmin]);

    useEffect(() => {
        const controller = new AbortController();
        fetchData(controller.signal);
        return () => controller.abort();
    }, [fetchData]);

    // --- LÓGICA DE FILTRADO ---
    const pedidosActivos = pedidos.filter(p => 
        ['pagado', 'en proceso', 'enviado', 'pendiente'].includes(p.estado?.toLowerCase())
    );

    const historialPedidos = pedidos.filter(p => 
        ['entregado', 'cancelado'].includes(p.estado?.toLowerCase())
    );

    const abrirDetalleConVerificacion = async (prod) => {
        setProductoDetalle(prod);
        setYaCalificado(false);
        const pId = prod.id || prod.producto_id;
        try {
            const res = await fetch(`https://macrowatersolutions.com/api/productos/${pId}/comentarios`);
            const data = await res.json();
            const lista = data.comentarios || (Array.isArray(data) ? data : []);
            const encontro = lista.some(c => c.nombre === usuario.nombre);
            if (encontro) setYaCalificado(true);
        } catch (e) { console.error(e); }
    };

    const handleCambiarEstado = async (idPedidoAgrupado, nuevoEstado) => {
        try {
            const res = await fetch(`https://macrowatersolutions.com/api/admin/pedidos/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id_pedidos: idPedidoAgrupado, nuevoEstado })
            });
            if (res.ok) {
                setPedidos(prev => prev.map(p => p.id === idPedidoAgrupado ? { ...p, estado: nuevoEstado } : p));
                setModal({
                    abierto: true,
                    tipo: "exito",
                    titulo: "Estado actualizado",
                    texto: "El estado del pedido se ha actualizado correctamente."
                });
            }
        } catch (error) { 
            setModal({ abierto: true, tipo: "error", titulo: "Error", texto: "Sin conexión." });
        }
    };

    const handleEnviarComentario = async () => {
        const pId = productoDetalle?.id || productoDetalle?.producto_id;
        if (!nuevoComentario.trim()) {
            setModal({ abierto: true, tipo: "error", titulo: "Atención", texto: "Escribe un comentario." });
            return;
        }
        try {
            const res = await fetch(`https://macrowatersolutions.com/api/productos/comentario`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    producto_id: pId, usuario_id: usuario.id, comentario: nuevoComentario, calificacion: estrellasSeleccionadas
                })
            });
            if (res.ok) {
                setModal({ abierto: true, tipo: "exito", titulo: "¡Gracias!", texto: "Comentario publicado." });
                setYaCalificado(true);
            }
        } catch (error) { console.error(error); }
    };

    const handleSubmitDireccion = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
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
                setModal({ abierto: true, tipo: "exito", titulo: "Éxito", texto: "Dirección guardada." });
            }
        } catch (error) { console.error(error); } finally { setCargandoEnvio(false); }
    };

    const handleActualizarDireccionPedido = async (idPedidoAgrupado) => {
        try {
            const res = await fetch(`https://macrowatersolutions.com/api/pedidos/actualizar-direccion/${idPedidoAgrupado}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nuevaDireccion: usuario.direccion })
            });
            if (res.ok) {
                setModal({ 
                    abierto: true, 
                    tipo: "exito", 
                    titulo: "¡Dirección Actualizada!", 
                    texto: "Se usará tu dirección actual para la entrega de este pedido." 
                });
                fetchData(); 
            } else {
                const errData = await res.json();
                setModal({ abierto: true, tipo: "error", titulo: "No se puede cambiar", texto: errData.error || "Error al actualizar." });
            }
        } catch (error) {
            setModal({ abierto: true, tipo: "error", titulo: "Error", texto: "Sin conexión con el servidor." });
        }
    };

    if (!usuario) return <div className="loading">Cargando perfil...</div>;

    // --- RENDERIZADO DE TABLA ADMIN ---
    const renderTablaAdmin = (lista) => (
        <div className="gestion-pedido-panel view-fade-in">
            <div className="gestion-table-wrap">
                <table className="gestion-table">
                    <thead>
                        <tr>
                            <th>ID PEDIDO</th>
                            <th>CLIENTE</th>
                            <th>FECHA</th>
                            <th>PRODUCTOS</th>
                            <th>ESTADO / TOTAL</th>
                        </tr>
                    </thead>
                    <tbody>
                        {lista.map((p) => (
                            <tr key={p.id}>
                                <td className="col-folio">#ORD-{p.id}</td>
                                <td className="col-cliente">
                                    <div className="cliente-flex">
                                        <div className="avatar-mini">{p.cliente?.charAt(0)}</div>
                                        <div className="cliente-datos">
                                            <strong>{p.cliente}</strong>
                                            <p><i className="fa-solid fa-location-dot"></i> {p.direccion_historica || p.direccion || 'No registrada'}</p>
                                            <p><i className="fa-solid fa-envelope"></i> {p.correo}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="col-fecha">
                                    {new Date(p.fecha).toLocaleDateString()}<br/>
                                    <small>{new Date(p.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small>
                                </td>
                                <td className="col-productos-lista">
                                    {p.productos?.map((item, idx) => (
                                        <div key={idx} className="prod-mini-item">
                                            <img src={item.imagen} alt="" width="30" />
                                            <div className="prod-mini-info"><strong>{item.nombre}</strong><span>x{item.cantidad}</span></div>
                                        </div>
                                    ))}
                                </td>
                                <td className="col-status-final">
                                    <div className="status-box">
                                        <select 
                                            value={p.estado?.toLowerCase()} 
                                            onChange={(e) => handleCambiarEstado(p.id, e.target.value)}
                                            className="select-gestion"
                                        >
                                            <option value="pagado">Pagado</option>
                                            <option value="en proceso">En proceso</option>
                                            <option value="enviado">Enviado</option>
                                            <option value="entregado">Entregado</option>
                                        </select>
                                        <div className="total-destacado">${Number(p.total).toLocaleString()}</div>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    // --- RENDERIZADO DE LISTA CLIENTE ---
    const renderListaCliente = (lista, mostrarCalificar = false) => (
        <div className="pedidos-list-aqua">
            {lista.length === 0 ? (
                <p className="empty-msg">No hay registros para mostrar.</p>
            ) : (
                lista.map(p => (
                    <div className="pedido-row-item" key={p.id}>
                        <div className="pedido-info-left">
                            <span className="pedido-id">Folio: {p.id}</span>
                            <span className="pedido-date">{new Date(p.fecha).toLocaleDateString()}</span>
                            <span className={`badge-status ${p.estado?.toLowerCase()}`}>{p.estado?.toUpperCase()}</span>
                        </div>
                        <div className="pedido-info-right">
                            <span className="pedido-price-tag">${Number(p.total).toLocaleString()}</span>
                            <button className="btn-ver-detalles" onClick={() => setPedidoSeleccionado(p)}>
                                {mostrarCalificar ? "Calificar" : "Detalles"}
                            </button>
                        </div>
                    </div>
                ))
            )}
        </div>
    );

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
                        <button className={`nav-link ${tabActivo === 'pedidos' ? 'active' : ''}`} 
                                onClick={() => {setTabActivo('pedidos'); setPedidoSeleccionado(null); setProductoDetalle(null);}}>
                            <i className="fa-solid fa-box"></i> {esAdmin ? 'Ventas Activas' : 'Mis Pedidos'}
                        </button>
                        <button className={`nav-link ${tabActivo === 'historial' ? 'active' : ''}`} 
                                onClick={() => {setTabActivo('historial'); setPedidoSeleccionado(null); setProductoDetalle(null);}}>
                            <i className="fa-solid fa-clock-rotate-left"></i> Historial
                        </button>
                        {esAdmin && (
                            <button className={`nav-link ${tabActivo === 'inventario' ? 'active' : ''}`} 
                                    onClick={() => {setTabActivo('inventario'); setProductoDetalle(null);}}>
                                <i className="fa-solid fa-boxes-stacked"></i> Inventario
                            </button>
                        )}
                        <button className={`nav-link ${tabActivo === 'direccion' ? 'active' : ''}`} 
                                onClick={() => {setTabActivo('direccion'); setProductoDetalle(null);}}>
                            <i className="fa-solid fa-location-dot"></i> Mi Dirección
                        </button>
                        <button className="nav-link logout-item" onClick={onCerrarSesion}>
                            <i className="fa-solid fa-arrow-right-from-bracket"></i> Salir
                        </button>
                    </nav>
                </aside>

                <section className="perfil-view-area-scrollable">
                    {productoDetalle ? (
                        <div className="ML-detalle-producto view-fade-in">
                            <button onClick={() => setProductoDetalle(null)} className="btn-back-link-ML"><i className="fa-solid fa-arrow-left"></i> Volver</button>
                            <div className="ML-grid-container">
                                <div className="ML-col-img"><img src={productoDetalle.imagen} alt="" /></div>
                                <div className="ML-col-info">
                                    <h1>{productoDetalle.nombre}</h1>
                                    <div className="ML-prod-price">${Number(productoDetalle.precio || productoDetalle.precio_unitario).toLocaleString()}</div>
                                    <div className="ML-comment-section">
                                        <h3>Califica tu producto</h3>
                                        {!yaCalificado ? (
                                            <>
                                                <div className="star-rating-selector">
                                                    {[1, 2, 3, 4, 5].map((num) => (
                                                        <i key={num} className={`fa-star ${estrellasSeleccionadas >= num ? 'fa-solid' : 'fa-regular'}`}
                                                           style={{ color: "#ffb300", fontSize: '1.5rem', cursor: 'pointer' }}
                                                           onClick={() => setEstrellasSeleccionadas(num)}></i>
                                                    ))}
                                                </div>
                                                <textarea placeholder="Cuéntanos tu experiencia..." value={nuevoComentario} onChange={(e) => setNuevoComentario(e.target.value)} />
                                                <button onClick={handleEnviarComentario} className="confirm-btn-fancy">Enviar Calificación</button>
                                            </>
                                        ) : (
                                            <div className="already-reviewed-msg">Ya calificaste este producto.</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="view-fade-in">
                            {/* VISTA DE PEDIDOS O HISTORIAL */}
                            {(tabActivo === 'pedidos' || tabActivo === 'historial') && (
                                <>
                                    <h3 className="view-title">
                                        {tabActivo === 'pedidos' ? (esAdmin ? "Gestión de Ventas Activas" : "Mis Pedidos Activos") : "Historial de Finalizados"}
                                    </h3>
                                    
                                    {esAdmin ? (
                                        renderTablaAdmin(tabActivo === 'pedidos' ? pedidosActivos : historialPedidos)
                                    ) : (
                                        renderListaCliente(tabActivo === 'pedidos' ? pedidosActivos : historialPedidos, tabActivo === 'historial')
                                    )}

                                    {pedidoSeleccionado && (
                                        <div className="detalle-pedido-container view-fade-in">
                                            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '15px'}}>
                                                <button onClick={() => setPedidoSeleccionado(null)} className="btn-back-link">Cerrar detalle</button>
                                                {/* Cambio de dirección solo en pedidos activos */}
                                                {tabActivo === 'pedidos' && !esAdmin && (
                                                    <button className="btn-update-address-order" onClick={() => handleActualizarDireccionPedido(pedidoSeleccionado.id)} style={{background: '#24a0ed', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem'}}>
                                                        Usar dirección actual del perfil
                                                    </button>
                                                )}
                                            </div>
                                            <div className="ML-mini-list-container">
                                                {pedidoSeleccionado.productos?.map((item, idx) => (
                                                    <div key={idx} className="ML-mini-item" onClick={() => tabActivo === 'historial' && abrirDetalleConVerificacion(item)} style={{cursor: tabActivo === 'historial' ? 'pointer' : 'default'}}>
                                                        <img src={item.imagen} alt="" width="60" />
                                                        <div className="ML-mini-info">
                                                            <span className="ML-mini-name">{item.nombre}</span>
                                                            {tabActivo === 'historial' && <span className="ML-link-detail">Escribir reseña</span>}
                                                        </div>
                                                        <div className="ML-mini-meta"><strong>${Number(item.precio || item.total_linea).toLocaleString()}</strong></div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}

                            {tabActivo === 'inventario' && esAdmin && (
                                <div className="inventory-list-container view-fade-in">
                                    <div className="inventory-header-flex">
                                        <h3 className="view-title">Gestión de Stock</h3>
                                        <Link to="/admin" className="btn-agregar-nuevo">+ Agregar Nuevo</Link>
                                    </div>
                                    {productos.map(prod => (
                                        <div className="inventory-row-item" key={prod.id}>
                                            <div className="inventory-col-main">
                                                <div className="inventory-img-box"><img src={prod.imagen} alt="" /></div>
                                                <div className="inventory-info-text">
                                                    <h4>{prod.nombre}</h4>
                                                    <div className="inventory-meta">
                                                        <span>${Number(prod.precio).toLocaleString()}</span>
                                                        <span className={`meta-stock ${prod.stock <= 0 ? 'agotado' : ''}`}>Stock: {prod.stock}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="inventory-actions">
                                                <button className="btn-action-edit" onClick={() => navigate(`/admin/editar/${prod.id}`)}><i className="fa-regular fa-pen-to-square"></i></button>
                                                <button className="btn-action-delete" onClick={() => setModal({ abierto: true, tipo: "pregunta", titulo: "¿Eliminar?", texto: `¿Borrar ${prod.nombre}?` })}><i className="fa-regular fa-trash-can"></i></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {tabActivo === 'direccion' && (
                                <form onSubmit={handleSubmitDireccion} className="fancy-form">
                                    <div className="form-group-fancy">
                                        <label>Calle y Número</label>
                                        <input name="calle" className="input-aqua" defaultValue={usuario.direccion?.split(',')[0]} required />
                                    </div>
                                    <div className="form-row-fancy">
                                        <div className="form-group-fancy"><label>Colonia</label><input name="colonia" className="input-aqua" required /></div>
                                        <div className="form-group-fancy"><label>Ciudad</label><input name="ciudad" className="input-aqua" required /></div>
                                    </div>
                                    <div className="form-row-fancy">
                                        <div className="form-group-fancy">
                                            <label>CP</label>
                                            <input name="cp" className="input-aqua" required inputMode="numeric" maxLength={5} minLength={5} pattern="\d{5}" onInput={(e) => { e.target.value = e.target.value.replace(/\D/g, '').slice(0, 5); }} />
                                        </div>
                                        <div className="form-group-fancy">
                                            <label>Teléfono</label>
                                            <input name="telefono" className="input-aqua" required inputMode="tel" maxLength={10} minLength={10} pattern="\d{10}" onInput={(e) => { e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10); }} />
                                        </div>
                                    </div>
                                    <button type="submit" className="confirm-btn-fancy" disabled={cargandoEnvio}>Actualizar Dirección</button>
                                </form>
                            )}
                        </div>
                    )}
                </section>
            </div>
            {modal.abierto && <MensajeModal info={modal} cerrar={() => setModal({ ...modal, abierto: false })} />}
        </div>
    );
};

export default UserPerfil;