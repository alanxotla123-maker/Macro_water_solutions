import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import MensajeModal from "../components/MensajeModal";
import "../productos.css";

function ProductosPage({ agregarAlCarrito, usuario }) {
    const [searchParams] = useSearchParams();
    const queryBusqueda = searchParams.get("q") || "";
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

    // --- FUNCIÓN PARA COMPRA RÁPIDA ---
    const handleComprarAhora = (producto) => {
        agregarAlCarrito(producto, (ok, msg) => {
            if (ok) {
                // Redirige al checkout/carrito una vez agregado
                navigate('/checkout'); 
            } else {
                mostrarToast("Error al procesar la compra rápida", true);
            }
        });
    };

    // --- FUNCIÓN PARA ABRIR DETALLE Y CARGAR COMENTARIOS ---
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
                <h2 className="productos-titulo">
                    {esAdmin ? "Panel de Gestión de Inventario" : "Nuestros Productos"}
                    {queryBusqueda && <span className="search-badge"> Buscando: "{queryBusqueda}"</span>}
                </h2>
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
                                <div className="ML-rating-top">
                                    {renderEstrellas(promedioRating)}
                                    <span className="ML-reviews-count">({totalReviews} opiniones)</span>
                                </div>
                                <h1 className="ML-title">{productoEnDetalle.nombre}</h1>
                                <div className="ML-price-large">${Number(productoEnDetalle.precio).toLocaleString()}</div>
                                
                                <div className="ML-actions-group">
                                    {/* BOTÓN ACTUALIZADO */}
                                    <button 
                                        className="ML-btn-buy-now" 
                                        onClick={() => handleComprarAhora(productoEnDetalle)}
                                    >
                                        Comprar ahora
                                    </button>
                                    
                                    <button className="ML-btn-add-cart" 
                                        onClick={() => agregarAlCarrito(productoEnDetalle, (ok, msg) => mostrarToast(msg, !ok))}>
                                        Agregar al carrito
                                    </button>
                                </div>

                                <div className="ML-description-section">
                                    <h3>Descripción</h3>
                                    <p>{productoEnDetalle.descripcion || "Sin descripción disponible."}</p>
                                </div>
                            </div>
                        </div>

                        <div className="ML-reviews-section">
                            <h3>Opiniones de clientes</h3>
                            <div className="ML-reviews-list">
                                {comentarios.length > 0 ? comentarios.map((c, i) => (
                                    <div key={i} className="ML-review-item">
                                        <div className="ML-review-header">
                                            <div className="stars-row">{renderEstrellas(c.calificacion || 5)}</div>
                                            <span className="user-name">{c.nombre}</span>
                                            <span className="date">{new Date(c.fecha).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text">{c.comentario}</p>
                                    </div>
                                )) : (
                                    <p className="ML-no-reviews">Este producto aún no tiene opiniones. ¡Sé el primero al comprarlo!</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                /* VISTA GRID NORMAL */
                <div className="productos-grid">
                    {productos.map((prod) => (
                        <div className="producto-card" key={prod.id}>
                            <div className="img-container" onClick={() => abrirDetalle(prod)}>
                                <img src={prod.imagen} alt={prod.nombre} />
                                <div className="overlay-view">Ver detalles</div>
                            </div>
                            <div className="producto-info">
                                <h3 onClick={() => abrirDetalle(prod)} style={{cursor: 'pointer'}}>{prod.nombre}</h3>
                                <span className="precio">${prod.precio}</span>
                                <div className="acciones-container">
                                    <button className="btn-carrito" onClick={() => agregarAlCarrito(prod, (ok, msg) => mostrarToast(msg, !ok))}>🛒 Agregar</button>
                                    <button className="btn-detalles-link" onClick={() => abrirDetalle(prod)}>Ver más</button>
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