import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import MensajeModal from '../components/MensajeModal';
import '../styles/UserProfile.css';

const UserPerfil = ({ usuario, onCerrarSesion, onActualizarDireccion }) => {
    const [tabActivo, setTabActivo] = useState('pedidos'); 
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
    
    const [guiasTemporales, setGuiasTemporales] = useState({});

    const navigate = useNavigate();
    const esAdmin = usuario && (usuario.rol == 1 || usuario.rol === 'admin' || usuario.rol_id == 1);

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
                setModal({ abierto: true, tipo: "exito", titulo: "Estado actualizado", texto: "El estado del pedido se ha actualizado correctamente." });
            }
        } catch (error) { 
            setModal({ abierto: true, tipo: "error", titulo: "Error", texto: "Sin conexión." });
        }
    };

    const handleActualizarGuia = async (idPedidoAgrupado) => {
        const numero_guia = guiasTemporales[idPedidoAgrupado];
        if (!numero_guia) {
            setModal({ abierto: true, tipo: "error", titulo: "Atención", texto: "Ingresa un número de guía válido." });
            return;
        }
        try {
            const res = await fetch(`https://macrowatersolutions.com/api/pedidos/actualizar-guia/${idPedidoAgrupado}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ numero_guia })
            });
            if (res.ok) {
                setPedidos(prev => prev.map(p => (p.id === idPedidoAgrupado || p.id_pedidos === idPedidoAgrupado) ? { ...p, numero_guia } : p));
                setModal({ abierto: true, tipo: "exito", titulo: "¡Guía Guardada!", texto: `Se ha registrado el número: ${numero_guia}` });
            } else {
                const errorData = await res.json();
                setModal({ abierto: true, tipo: "error", titulo: "Error", texto: errorData.error || "Fallo en el servidor" });
            }
        } catch (error) {
            console.error(error);
            setModal({ abierto: true, tipo: "error", titulo: "Error", texto: "No se pudo conectar con el servidor." });
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
                body: JSON.stringify({ producto_id: pId, usuario_id: usuario.id, comentario: nuevoComentario, calificacion: estrellasSeleccionadas })
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
                setModal({ abierto: true, tipo: "exito", titulo: "¡Guardado!", texto: "Tu dirección principal ha sido actualizada." });
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
                setModal({ abierto: true, tipo: "exito", titulo: "¡Dirección Actualizada!", texto: "Se usará tu dirección actual para la entrega." });
                fetchData();
            }
        } catch (error) { console.error(error); }
    };

    if (!usuario) return <div className="loading">Cargando perfil...</div>;

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
                            <th>GUÍA ACTUAL / GESTIÓN</th>
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
                                <td className="col-guia">
                                    <div className="guia-admin-flex" style={{display: 'flex', flexDirection: 'column', gap: '5px', minWidth: '150px'}}>
                                        {p.numero_guia ? (
                                            <span style={{fontSize: '0.75rem', color: '#27ae60', fontWeight: 'bold'}}>Actual: {p.numero_guia}</span>
                                        ) : (
                                            <span style={{fontSize: '0.7rem', color: '#e67e22'}}>Sin guía asignada</span>
                                        )}
                                        <input 
                                            type="text" 
                                            placeholder={p.numero_guia ? "Cambiar guía" : "Ingresar guía"} 
                                            defaultValue={p.numero_guia || ""}
                                            onChange={(e) => setGuiasTemporales({...guiasTemporales, [p.id]: e.target.value})}
                                            style={{padding: '4px', fontSize: '0.8rem', borderRadius: '4px', border: '1px solid #ddd'}}
                                        />
                                        <button onClick={() => handleActualizarGuia(p.id)} style={{fontSize: '0.7rem', background: p.numero_guia ? '#f39c12' : '#00c2cb', color: 'white', border: 'none', padding: '5px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold'}}>
                                            {p.numero_guia ? "Actualizar" : "Guardar"}
                                        </button>
                                    </div>
                                </td>
                                <td className="col-status-final">
                                    <div className="status-box">
                                        <select value={p.estado?.toLowerCase()} onChange={(e) => handleCambiarEstado(p.id, e.target.value)} className="select-gestion">
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

    const renderListaCliente = (lista, esHistorial = false) => (
        <div className="pedidos-list-complete-view view-fade-in">
            {lista.length === 0 ? (
                <p className="empty-msg">No hay pedidos para mostrar.</p>
            ) : (
                lista.map(p => (
                    <div className="pedido-card-full" key={p.id} style={{background: 'white', borderRadius: '12px', padding: '20px', marginBottom: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid #f0f0f0'}}>
                        <div className="pedido-header-top" style={{display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '12px', marginBottom: '15px'}}>
                            <div>
                                <span style={{display: 'block', fontSize: '0.8rem', color: '#888', fontWeight: 'bold'}}>FOLIO</span>
                                <strong style={{color: '#007cc3'}}>#ORD-{p.id}</strong>
                            </div>
                            <div style={{textAlign: 'center'}}>
                                <span style={{display: 'block', fontSize: '0.8rem', color: '#888', fontWeight: 'bold'}}>FECHA</span>
                                <strong>{new Date(p.fecha).toLocaleDateString()}</strong>
                            </div>
                            <div style={{textAlign: 'right'}}>
                                <span style={{display: 'block', fontSize: '0.8rem', color: '#888', fontWeight: 'bold'}}>ESTATUS</span>
                                <span className={`badge-status ${p.estado?.toLowerCase()}`} style={{padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase'}}>{p.estado}</span>
                            </div>
                        </div>

                        <div className="pedido-body-products">
                            <span style={{display: 'block', fontSize: '0.8rem', color: '#888', fontWeight: 'bold', marginBottom: '10px'}}>PRODUCTOS</span>
                            <div className="products-mini-grid" style={{display: 'grid', gap: '10px'}}>
                                {p.productos?.map((item, idx) => (
                                    <div key={idx} className="product-item-row" style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                                        <img src={item.imagen} alt="" style={{width: '50px', height: '50px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #eee'}} />
                                        <div style={{flex: 1}}>
                                            <span style={{display: 'block', fontSize: '0.9rem', fontWeight: '500'}}>{item.nombre}</span>
                                            <small style={{color: '#666'}}>Cantidad: {item.cantidad}</small>
                                        </div>
                                        {esHistorial && (
                                            <button onClick={() => abrirDetalleConVerificacion(item)} style={{background: '#f1c40f', color: '#000', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.75rem'}}>
                                                <i className="fa-solid fa-star"></i> Escribir Reseña
                                            </button>
                                        )}
                                        <div style={{fontWeight: 'bold', color: '#333'}}>
                                            ${Number(item.precio || item.total_linea).toLocaleString()}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="pedido-footer-info" style={{marginTop: '20px', paddingTop: '15px', borderTop: '1px dotted #eee', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '15px'}}>
                            <div className="guia-display-area" style={{flex: '1', minWidth: '250px'}}>
                                <span style={{display: 'block', fontSize: '0.8rem', color: '#888', fontWeight: 'bold'}}>NÚMERO DE GUÍA</span>
                                {p.numero_guia ? (
                                    <div style={{display: 'flex', alignItems: 'center', gap: '8px', color: '#00a650', fontWeight: 'bold'}}>
                                        <i className="fa-solid fa-truck-fast"></i>
                                        <span>{p.numero_guia}</span>
                                    </div>
                                ) : (
                                    <div style={{color: '#e67e22', fontSize: '0.9rem', fontStyle: 'italic'}}>
                                        <i className="fa-solid fa-circle-info"></i> El vendedor aún no ha proporcionado el número de guía.
                                    </div>
                                )}
                            </div>
                            
                            <div style={{textAlign: 'right'}}>
                                <span style={{display: 'block', fontSize: '0.8rem', color: '#888', fontWeight: 'bold'}}>TOTAL PAGADO</span>
                                <strong style={{fontSize: '1.4rem', color: '#1a1a1a'}}>${Number(p.total).toLocaleString()}</strong>
                            </div>
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
    <div className="sidebar-header">
        <div className="sidebar-brand">Panel</div>
    </div>

    <nav className="sidebar-nav">
        <button className={`nav-link ${tabActivo === 'pedidos' ? 'active' : ''}`}
                onClick={() => { setTabActivo('pedidos'); setPedidoSeleccionado(null); setProductoDetalle(null); }}>
            <div className="nav-link-left">
                <div className="nav-link-icon">
                    <i className="fa-solid fa-box"></i>
                </div>
                <span>{esAdmin ? 'Ventas activas' : 'Mis pedidos'}</span>
            </div>
            {tabActivo === 'pedidos' && <i className="fa-solid fa-chevron-right nav-chevron"></i>}
        </button>

        <button className={`nav-link ${tabActivo === 'historial' ? 'active' : ''}`}
                onClick={() => { setTabActivo('historial'); setPedidoSeleccionado(null); setProductoDetalle(null); }}>
            <div className="nav-link-left">
                <div className="nav-link-icon">
                    <i className="fa-solid fa-clock-rotate-left"></i>
                </div>
                <span>Historial</span>
            </div>
            {tabActivo === 'historial' && <i className="fa-solid fa-chevron-right nav-chevron"></i>}
        </button>

        {esAdmin && (
            <button className={`nav-link ${tabActivo === 'inventario' ? 'active' : ''}`}
                    onClick={() => { setTabActivo('inventario'); setProductoDetalle(null); }}>
                <div className="nav-link-left">
                    <div className="nav-link-icon">
                        <i className="fa-solid fa-boxes-stacked"></i>
                    </div>
                    <span>Inventario</span>
                </div>
                {tabActivo === 'inventario' && <i className="fa-solid fa-chevron-right nav-chevron"></i>}
            </button>
        )}

        {!esAdmin && (
            <button className={`nav-link ${tabActivo === 'direccion' ? 'active' : ''}`}
                    onClick={() => { setTabActivo('direccion'); setProductoDetalle(null); }}>
                <div className="nav-link-left">
                    <div className="nav-link-icon">
                        <i className="fa-solid fa-location-dot"></i>
                    </div>
                    <span>Mi dirección</span>
                </div>
                {tabActivo === 'direccion' && <i className="fa-solid fa-chevron-right nav-chevron"></i>}
            </button>
        )}
    </nav>

    <div className="sidebar-divider"></div>

    <div className="sidebar-nav" style={{ paddingTop: '8px' }}>
        <button className="nav-link logout-item" onClick={onCerrarSesion}>
            <div className="nav-link-left">
                <div className="nav-link-icon">
                    <i className="fa-solid fa-arrow-right-from-bracket"></i>
                </div>
                <span>Cerrar sesión</span>
            </div>
        </button>
    </div>
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
                                </>
                            )}

                            {tabActivo === 'inventario' && esAdmin && (
                                <div className="inventory-list-container view-fade-in">
                                    <div className="inventory-header-flex">
                                        <h3 className="view-title">Gestión de Stock</h3>
                                        <Link to="/admin" className="btn-agregar-nuevo">+ Agregar Nuevo</Link>
                                    </div>
                                    {productos.map(prod => (
                                        <div className="inventory-row-item" key={prod.id} style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px', background: 'white', marginBottom: '8px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)'}}>
                                            <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
                                                <img src={prod.imagen} width="45" style={{borderRadius: '5px'}} alt=""/>
                                                <div><strong>{prod.nombre}</strong><br/><small>Stock: {prod.stock} - ${Number(prod.precio).toLocaleString()}</small></div>
                                            </div>
                                            <div className="inventory-actions">
                                                <button className="btn-action-edit" onClick={() => navigate(`/admin/editar/${prod.id}`)}><i className="fa-regular fa-pen-to-square"></i></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {tabActivo === 'direccion' && !esAdmin && (
                                <form onSubmit={handleSubmitDireccion} className="fancy-form" autoComplete="off">
                                    <div className="form-group-fancy"><label>Calle y Número</label><input name="calle" className="input-aqua" defaultValue={usuario.direccion?.split(',')[0] || ""} placeholder="Ej. Av. Reforma 123" required /></div>
                                    <div className="form-row-fancy">
                                        <div className="form-group-fancy"><label>Colonia</label><input name="colonia" className="input-aqua" defaultValue={usuario.direccion?.split('Col. ')[1]?.split(',')[0] || ""} placeholder="Tu colonia" required /></div>
                                        <div className="form-group-fancy"><label>Ciudad</label><input name="ciudad" className="input-aqua" defaultValue={usuario.direccion?.split(', ')[2]?.split(',')[0] || ""} placeholder="Ciudad" required /></div>
                                    </div>
                                    <div className="form-row-fancy">
                                        <div className="form-group-fancy"><label>CP</label><input name="cp" className="input-aqua" defaultValue={usuario.direccion?.split('CP: ')[1]?.split(' ')[0] || ""} required inputMode="numeric" maxLength={5} minLength={5} pattern="\d{5}" onInput={(e) => { e.target.value = e.target.value.replace(/\D/g, '').slice(0, 5); }} /></div>
                                        <div className="form-group-fancy"><label>Teléfono</label><input name="telefono" className="input-aqua" defaultValue={usuario.direccion?.split('Tel: ')[1] || ""} required inputMode="tel" maxLength={10} minLength={10} pattern="\d{10}" onInput={(e) => { e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10); }} /></div>
                                    </div>
                                    <button type="submit" className="confirm-btn-fancy" disabled={cargandoEnvio}>{cargandoEnvio ? "Guardando..." : "Actualizar Dirección"}</button>
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