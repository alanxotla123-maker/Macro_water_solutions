import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import MensajeModal from '../components/MensajeModal';
import '../styles/UserProfile.css';

const UserPerfil = ({ usuario, onCerrarSesion, onActualizarDireccion }) => {
    const [tabActivo, setTabActivo] = useState('historial'); 
    const [pedidos, setPedidos] = useState([]); 
    const [productos, setProductos] = useState([]); 
    const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null); 
    const [productoDetalle, setProductoDetalle] = useState(null); 
    const [nuevoComentario, setNuevoComentario] = useState("");
    const [cargandoData, setCargandoData] = useState(false);
    const [cargandoEnvio, setCargandoEnvio] = useState(false);

    const esAdmin = usuario && (usuario.rol == 1 || usuario.rol === 'admin' || usuario.rol_id == 1);

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

    const handleCambiarEstado = async (idPedidoAgrupado, nuevoEstado) => {
        try {
            const res = await fetch(`https://macrowatersolutions.com/api/admin/pedidos/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id_pedidos: idPedidoAgrupado, nuevoEstado })
            });
            if (res.ok) {
                setPedidoSeleccionado(prev => ({ ...prev, estado: nuevoEstado }));
                setPedidos(prev => prev.map(p => p.id === idPedidoAgrupado ? { ...p, estado: nuevoEstado } : p));
                alert("✅ Estado actualizado");
            }
        } catch (error) { alert("❌ Error de conexión"); }
    };
const handleEnviarComentario = async () => {
    // Imprimimos en la consola del navegador para debug
    console.log("Datos del producto seleccionado:", productoDetalle);

    // Buscamos el ID en cualquier propiedad posible
    const pId = productoDetalle?.id || 
                productoDetalle?.producto_id || 
                productoDetalle?.id_producto;

    if (!nuevoComentario.trim()) return alert("Por favor escribe un comentario.");
    
    if (!pId) {
        console.error("No se encontró ID. Objeto recibido:", productoDetalle);
        return alert("Error: No se pudo identificar el producto (ID no encontrado).");
    }

    try {
        const res = await fetch(`https://macrowatersolutions.com/api/productos/comentario`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                producto_id: pId,
                usuario_id: usuario.id,
                comentario: nuevoComentario
            })
        });

        if (res.ok) {
            alert("✅ ¡Gracias! Tu comentario ha sido publicado.");
            setNuevoComentario("");
        } else {
            const errorText = await res.text();
            alert("❌ Error del servidor: " + errorText);
        }
    } catch (error) { 
        console.error(error);
        alert("❌ Error de conexión con el servidor.");
    }
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
                alert("¡Dirección actualizada!");
            }
        } catch (error) { console.error(error); } finally { setCargandoEnvio(false); }
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
                                onClick={() => {setTabActivo('historial'); setPedidoSeleccionado(null); setProductoDetalle(null);}}>
                            <i className="fa-solid fa-file-invoice-dollar"></i> {esAdmin ? 'Ventas Globales' : 'Mis Pedidos'}
                        </button>
                        {esAdmin && (
                            <button className={`nav-link ${tabActivo === 'inventario' ? 'active' : ''}`} 
                                    onClick={() => {setTabActivo('inventario'); setProductoDetalle(null);}}>
                                <i className="fa-solid fa-boxes-stacked"></i> Gestión Inventario
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
                    
                    {/* VISTA 1: DETALLE DE PRODUCTO TIPO ML */}
                    {productoDetalle ? (
                        <div className="ML-detalle-producto view-fade-in">
                            <button onClick={() => setProductoDetalle(null)} className="btn-back-link-ML">
                                <i className="fa-solid fa-arrow-left"></i> Volver al listado
                            </button>
                            
                            <div className="ML-grid-container">
                                <div className="ML-col-img">
                                    <img src={productoDetalle.imagen} alt={productoDetalle.nombre} />
                                </div>
                                <div className="ML-col-info">
                                    <span className="ML-stock-tag">Nuevo | {productoDetalle.stock || 0} disponibles</span>
                                    <h1 className="ML-prod-title">{productoDetalle.nombre}</h1>
                                    <div className="ML-prod-price">${Number(productoDetalle.precio || productoDetalle.precio_unitario).toLocaleString()}</div>
                                    
                                    <div className="ML-description-box">
                                        <h3>Descripción</h3>
                                        <p>{productoDetalle.descripcion || "Sin descripción disponible."}</p>
                                    </div>

                                    <div className="ML-comment-section">
                                        <h3>Pregúntale al vendedor</h3>
                                        <textarea 
                                            placeholder="Escribe tu opinión o duda sobre el producto..."
                                            value={nuevoComentario}
                                            onChange={(e) => setNuevoComentario(e.target.value)}
                                        />
                                        <button onClick={handleEnviarComentario} className="confirm-btn-fancy">Enviar Comentario</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* VISTA 2: LISTADOS GENERALES */
                        <div className="view-fade-in">
                            {tabActivo === 'historial' && (
                                <>
                                    <h3 className="view-title">
                                        {pedidoSeleccionado ? (
                                            <button onClick={() => setPedidoSeleccionado(null)} className="btn-back-link">
                                                <i className="fa-solid fa-chevron-left"></i> Volver a pedidos
                                            </button>
                                        ) : esAdmin ? "Panel de Ventas Realizadas" : "Mis Compras"}
                                    </h3>

                                    {cargandoData ? (
                                        <p className="empty-text">Cargando...</p>
                                    ) : !pedidoSeleccionado ? (
                                        <div className="pedidos-list-aqua">
                                            {pedidos.map(p => (
                                                <div className="pedido-row-item" key={p.id}>
                                                    <div className="pedido-info-left">
                                                        <span className="pedido-id">Folio: {p.id}</span>
                                                        {esAdmin && <span className="cliente-name">Cliente: {p.cliente}</span>}
                                                        <span className="pedido-date">{new Date(p.fecha).toLocaleDateString()}</span>
                                                        <span className={`badge-status ${p.estado?.toLowerCase()}`}>{p.estado?.toUpperCase()}</span>
                                                    </div>
                                                    <div className="pedido-info-right">
                                                        <span className="pedido-price-tag">${Number(p.total).toLocaleString()}</span>
                                                        <button className="btn-ver-detalles" onClick={() => setPedidoSeleccionado(p)}>Gestionar</button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="detalle-pedido-container">
                                            <div className="detalle-header-admin">
                                                <strong>Folio: #{pedidoSeleccionado.id}</strong>
                                                {esAdmin && (
                                                    <select value={pedidoSeleccionado.estado?.toLowerCase() || ""} onChange={(e) => handleCambiarEstado(pedidoSeleccionado.id, e.target.value)}>
                                                        <option value="pagado">Pagado</option>
                                                        <option value="enviado">Enviado</option>
                                                        <option value="entregado">Entregado</option>
                                                        <option value="cancelado">Cancelado</option>
                                                    </select>
                                                )}
                                            </div>
                                            <div className="ML-mini-list-container">
                                                {pedidoSeleccionado.productos?.map((item, idx) => (
                                                    <div key={idx} className="ML-mini-item" onClick={() => setProductoDetalle(item)} style={{cursor:'pointer'}}>
                                                        <img src={item.imagen} alt="" width="60" />
                                                        <div className="ML-mini-info">
                                                            <span className="ML-mini-name">{item.nombre}</span>
                                                            <span className="ML-link-detail">Haz clic para comentar</span>
                                                        </div>
                                                        <div className="ML-mini-meta">
                                                            <span>Cant: {item.cantidad}</span>
                                                            <strong>${Number(item.precio || item.total_linea).toLocaleString()}</strong>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}

                            {tabActivo === 'inventario' && esAdmin && (
                                <div className="view-fade-in">
                                    <div className="inventory-header">
                                        <h3 className="view-title">Gestión de Stock</h3>
                                        <Link to="/admin" className="btn-add-inv">+ Agregar Producto</Link>
                                    </div>
                                    <div className="pedidos-list-aqua">
                                        {productos.map(prod => (
                                            <div className="pedido-row-item" key={prod.id} onClick={() => setProductoDetalle(prod)} style={{cursor:'pointer'}}>
                                                <div className="prod-info-admin">
                                                    <img src={prod.imagen} alt="" width="50" />
                                                    <div>
                                                        <div className="pedido-id">{prod.nombre}</div>
                                                        <div className="stock-label">Stock: <strong>{prod.stock}</strong></div>
                                                    </div>
                                                </div>
                                                <span className="pedido-price-tag">${prod.precio}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {tabActivo === 'direccion' && (
                                <div className="view-fade-in">
                                    <h3 className="view-title">Mi Dirección de Envío</h3>
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
                                            <div className="form-group-fancy"><label>CP</label><input name="cp" className="input-aqua" required /></div>
                                            <div className="form-group-fancy"><label>Teléfono</label><input name="telefono" className="input-aqua" required /></div>
                                        </div>
                                        <button type="submit" className="confirm-btn-fancy" disabled={cargandoEnvio}>
                                            {cargandoEnvio ? "Guardando..." : "Actualizar Dirección"}
                                        </button>
                                    </form>
                                </div>
                            )}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

export default UserPerfil;