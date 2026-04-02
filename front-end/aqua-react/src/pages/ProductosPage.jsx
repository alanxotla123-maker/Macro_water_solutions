import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import MensajeModal from "../components/MensajeModal";
import "../productos.css";

function ProductosPage({ agregarAlCarrito, usuario }) {
    const [searchParams, setSearchParams] = useSearchParams();
    const queryBusqueda = searchParams.get("q") || "";

    const limpiarBusqueda = () => {
        const next = new URLSearchParams(searchParams);
        next.delete("q");
        setSearchParams(next, { replace: true });
    };

    const [productos, setProductos] = useState([]);
    const [productosOriginales, setProductosOriginales] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [modal, setModal] = useState({ abierto: false, tipo: "", titulo: "", texto: "" });
    const [idAEliminar, setIdAEliminar] = useState(null);
    const [toast, setToast] = useState({ mostrar: false, mensaje: "", esError: false });

    // ESTADOS PARA EL DETALLE
    const [productoEnDetalle, setProductoEnDetalle] = useState(null);
    const [comentarios, setComentarios] = useState([]);
    const [promedioRating, setPromedioRating] = useState(0);
    const [totalReviews, setTotalReviews] = useState(0);

    const navigate = useNavigate();
    const esAdmin = usuario && (usuario.rol === 'admin' || usuario.rol_id === 1);

    const mostrarToast = (mensaje, esError = false) => {
        setToast({ mostrar: true, mensaje, esError });
        setTimeout(() => setToast(t => ({ ...t, mostrar: false })), 2500);
    };

    const obtenerProductos = async () => {
        try {
            const res = await fetch("https://macrowatersolutions.com/api/productos");
            const data = await res.json();
            setProductosOriginales(data || []);
            setProductos(data || []);
        } catch (error) {
            console.error("Error cargando productos:", error);
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => { obtenerProductos(); }, []);

    useEffect(() => {
        const q = (queryBusqueda || "").trim().toLowerCase();
        if (!q) { setProductos(productosOriginales); return; }
        const filtrados = productosOriginales.filter((p) => p.nombre && p.nombre.toLowerCase().includes(q));
        setProductos(filtrados);
    }, [queryBusqueda, productosOriginales]);

    const handleComprarAhora = (producto) => {
        if (producto.stock <= 0) return;
        agregarAlCarrito(producto, (ok, msg) => {
            if (ok) {
                navigate('/checkout'); 
            } else {
                mostrarToast("Error al procesar la compra rápida", true);
            }
        });
    };

    const abrirDetalle = async (prod) => {
        setProductoEnDetalle(prod);
        window.scrollTo(0, 0);
        try {
            const res = await fetch(`https://macrowatersolutions.com/api/productos/${prod.id}/comentarios`);
            const data = await res.json();
            
            if (data.comentarios) {
                setComentarios(data.comentarios);
                setPromedioRating(data.promedio || 0);
                setTotalReviews(data.totalReviews || 0);
            } else {
                setComentarios(Array.isArray(data) ? data : []);
                setPromedioRating(0);
                setTotalReviews(Array.isArray(data) ? data.length : 0);
            }
        } catch (error) {
            console.error("Error al cargar comentarios", error);
        }
    };

    const ejecutarEliminado = async () => {
        setModal({ ...modal, abierto: false });
        try {
            const res = await fetch(`https://macrowatersolutions.com/api/productos/${idAEliminar}`, { method: "DELETE" });
            if (res.ok) {
                setModal({ abierto: true, tipo: "exito", titulo: "¡Borrado!", texto: "Producto eliminado correctamente." });
                setProductos(prev => prev.filter(p => p.id !== idAEliminar));
                setProductosOriginales(prev => prev.filter(p => p.id !== idAEliminar));
                if(productoEnDetalle?.id === idAEliminar) setProductoEnDetalle(null);
            }
        } catch (error) { setModal({ abierto: true, tipo: "error", titulo: "Error", texto: "Servidor desconectado." }); }
    };

    const renderEstrellas = (rating) => {
        return [...Array(5)].map((_, i) => (
            <i key={i} className={`fa-star ${i < Math.round(rating) ? 'fa-solid' : 'fa-regular'}`}
               style={{ color: "#ffb300", fontSize: '0.9rem' }}></i>
        ));
    };

    if (cargando) return <div className="loader">Cargando productos...</div>;

    return (
        <section className="productos-section">
            {!productoEnDetalle && (
                <div className="productos-header-block">
                    <h2 className="productos-titulo">
                        {esAdmin ? "Panel de Gestión de Inventario" : "Nuestros Productos"}
                    </h2>
                    {queryBusqueda.trim() && (
                        <div className="search-status-chip" role="status" aria-live="polite">
                            <i className="fa-solid fa-magnifying-glass search-status-lupa"></i>
                            <span className="search-status-inner">
                                <span className="search-status-label">Búsqueda activa</span>
                                <span className="search-status-query">{queryBusqueda}</span>
                            </span>
                            <button type="button" className="search-status-clear" onClick={limpiarBusqueda}>
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </div>
                    )}
                </div>
            )}

            {productoEnDetalle ? (
                <div className="ML-container view-fade-in">
                    <button className="btn-back-ML" onClick={() => setProductoEnDetalle(null)}>
                        <i className="fa-solid fa-arrow-left"></i> Volver al listado
                    </button>
                    
                    <div className="ML-card">
                        <div className="ML-grid">
                            <div className="ML-photo-section">
                                <img src={productoEnDetalle.imagen} alt={productoEnDetalle.nombre} />
                            </div>
                            <div className="ML-info-section">
                                {totalReviews > 0 && (
                                    <div className="ML-rating-top">
                                        {renderEstrellas(promedioRating)}
                                        <span className="ML-reviews-count">({totalReviews} opiniones)</span>
                                    </div>
                                )}
                                <h1 className="ML-title">{productoEnDetalle.nombre}</h1>
                                
                                {/* SECCIÓN DE PRECIO CLARA */}
                                <div className="ML-price-container-detail">
                                    {productoEnDetalle.descuento > 0 ? (
                                        <div className="ML-price-logic">
                                            <span className="ML-price-original-strike">
                                                ${Number(productoEnDetalle.precio).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                            </span>
                                            <div className="ML-price-current-row">
                                                <span className="ML-price-final">
                                                    ${(productoEnDetalle.precio * (1 - productoEnDetalle.descuento / 100)).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </span>
                                                <span className="ML-discount-badge-detail">
                                                    {Math.round(productoEnDetalle.descuento)}% OFF
                                                </span>
                                            </div>
                                        </div>
                                    ) : (
                                        <span className="ML-price-final">
                                            ${Number(productoEnDetalle.precio).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                        </span>
                                    )}
                                </div>

                                <div className="ML-stock-status">
                                    {productoEnDetalle.stock > 0 ? (
                                        <p className="stock-available">Stock disponible: <strong>{productoEnDetalle.stock}</strong> unidades</p>
                                    ) : (
                                        <div className="stock-out-warning-detail">
                                            <i className="fa-solid fa-circle-exclamation"></i>
                                            <span>Producto agotado temporalmente</span>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="ML-actions-group">
                                    <button 
                                        className={`ML-btn-buy-now ${productoEnDetalle.stock <= 0 ? 'disabled' : ''}`} 
                                        onClick={() => handleComprarAhora(productoEnDetalle)}
                                        disabled={productoEnDetalle.stock <= 0}
                                    >
                                        {productoEnDetalle.stock > 0 ? "Comprar ahora" : "Sin Stock"}
                                    </button>
                                    
                                    <button 
                                        className={`ML-btn-add-cart ${productoEnDetalle.stock <= 0 ? 'disabled' : ''}`} 
                                        onClick={() => agregarAlCarrito(productoEnDetalle, (ok, msg) => mostrarToast(msg, !ok))}
                                        disabled={productoEnDetalle.stock <= 0}
                                    >
                                        Agregar al carrito
                                    </button>
                                </div>

                                <div className="ML-description-section">
                                    <h3>Descripción</h3>
                                    <p>{productoEnDetalle.descripcion || "Sin descripción disponible."}</p>
                                </div>
                            </div>
                        </div>

                        {/* SECCIÓN DE OPINIONES MEJORADA */}
                        <div className="ML-reviews-section">
                            <div className="ML-reviews-header-container">
                                <h3>Opiniones de clientes</h3>
                                {totalReviews > 0 && (
                                    <div className="ML-average-stats">
                                        <span className="ML-average-num">{Number(promedioRating).toFixed(1)}</span>
                                        <div className="stars-col">
                                            {renderEstrellas(promedioRating)}
                                            <span className="ML-total-label">{totalReviews} calificaciones</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="ML-reviews-list">
                                {comentarios.length > 0 ? comentarios.map((c, i) => (
                                    <div key={i} className="ML-review-card view-fade-in">
                                        <div className="ML-review-user-info">
                                            <div className="user-avatar-mini">{c.nombre?.charAt(0).toUpperCase()}</div>
                                            <div className="user-meta-data">
                                                <span className="user-name">{c.nombre}</span>
                                                <div className="stars-date-row">
                                                    <div className="review-stars">{renderEstrellas(c.calificacion || 5)}</div>
                                                    <span className="review-date">{new Date(c.fecha).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="ML-review-content">
                                            <p className="review-text">{c.comentario}</p>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="ML-no-reviews-empty">
                                        <i className="fa-regular fa-comments"></i>
                                        <p>Este producto aún no tiene opiniones.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                /* VISTA GRID NORMAL */
                <div className="productos-grid">
                    {productos.map((prod) => (
                        <div className={`producto-card ${prod.stock <= 0 ? 'out-of-stock' : ''}`} key={prod.id}>
                            <div className="img-container" onClick={() => abrirDetalle(prod)}>
                                {prod.descuento > 0 && prod.stock > 0 && <div className="badge-descuento-grid">-{Math.round(prod.descuento)}%</div>}
                                {prod.stock <= 0 && <div className="badge-exhausted">AGOTADO</div>}
                                
                                <img src={prod.imagen} alt={prod.nombre} style={{ opacity: prod.stock <= 0 ? 0.5 : 1, objectFit: 'cover' }} />
                                <div className="overlay-view">{prod.stock > 0 ? "Ver detalles" : "Agotado"}</div>
                            </div>
                            <div className="producto-info">
                                <h3 onClick={() => abrirDetalle(prod)} style={{cursor: 'pointer'}}>{prod.nombre}</h3>
                                {Number(prod.totalReviews) > 0 && (
                                    <div className="producto-card-rating">
                                        <i className="fa-solid fa-star producto-card-star"></i>
                                        <span className="producto-card-rating-num">{Number(prod.promedio).toFixed(1)}</span>
                                    </div>
                                )}

                                <div className="precio-container-grid">
                                    {prod.descuento > 0 ? (
                                        <div className="precio-con-descuento-card">
                                            <span className="precio-original-tachado">${Number(prod.precio).toLocaleString("es-MX", { minimumFractionDigits: 2 })}</span>
                                            <div className="precio-fila-oferta">
                                                <span className="precio-oferta-final">
                                                    ${Number(prod.precio * (1 - prod.descuento / 100)).toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                                                </span>
                                                <span className="precio-badge-off">{Math.round(Number(prod.descuento))}% OFF</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <span className="precio">${Number(prod.precio).toLocaleString("es-MX", { minimumFractionDigits: 2 })}</span>
                                    )}
                                </div>

                                <div className="acciones-container">
                                    <button 
                                        className={`btn-carrito ${prod.stock <= 0 ? 'btn-disabled' : ''}`} 
                                        onClick={() => agregarAlCarrito(prod, (ok, msg) => mostrarToast(msg, !ok))}
                                        disabled={prod.stock <= 0}
                                    >
                                        {prod.stock > 0 ? "🛒 Agregar" : "Agotado"}
                                    </button>
                                    {esAdmin && (
                                        <div className="acciones-admin">
                                            <button className="btn-edit" onClick={() => navigate(`/admin/editar/${prod.id}`)}>✏️</button>
                                            <button className="btn-delete" onClick={() => { setIdAEliminar(prod.id); setModal({ abierto: true, tipo: "pregunta", titulo: "¿Eliminar?", texto: "Se borrará de la base." }); }}>🗑️</button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {modal.abierto && <MensajeModal info={modal} cerrar={() => setModal({ ...modal, abierto: false })} onConfirmar={ejecutarEliminado} />}
            {toast.mostrar && <div className={`toast-agregado ${toast.esError ? 'toast-error' : ''}`}><span>{toast.mensaje}</span></div>}
        </section>
    );
}

export default ProductosPage;