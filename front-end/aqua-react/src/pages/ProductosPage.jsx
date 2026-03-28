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
        setProductos(q ? productosOriginales.filter(p => p.nombre?.toLowerCase().includes(q)) : productosOriginales);
    }, [queryBusqueda, productosOriginales]);

    // Función para abrir el detalle y solo LEER comentarios
    const abrirDetalle = async (prod) => {
        setProductoEnDetalle(prod);
        window.scrollTo(0, 0);
        try {
            const res = await fetch(`https://macrowatersolutions.com/api/productos/${prod.id}/comentarios`);
            const data = await res.json();
            setComentarios(data);
        } catch (error) {
            console.error("Error al cargar comentarios");
        }
    };

    // FUNCIÓN PARA COMPRAR AHORA (DIRECTO A MERCADO PAGO)
    const comprarAhora = async (prod) => {
        if (!usuario) {
            mostrarToast("Inicia sesión para comprar directamente", true);
            return;
        }

        try {
            mostrarToast("Generando orden de pago...");
            const res = await fetch("https://macrowatersolutions.com/api/create_preference", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    items: [{
                        id: prod.id,
                        nombre: prod.nombre,
                        precio: prod.precio,
                        cantidad: 1
                    }],
                    envio: 0,
                    userId: usuario.id
                }),
            });

            const data = await res.json();
            if (data.id) {
                // Redirigir directamente a la pasarela de Mercado Pago
                window.location.href = `https://www.mercadopago.com.mx/checkout/v1/redirect?pref_id=${data.id}`;
            }
        } catch (error) {
            console.error("Error al comprar ahora:", error);
            mostrarToast("Error al procesar el pago", true);
        }
    };

    const ejecutarEliminado = async () => {
        setModal({ ...modal, abierto: false });
        try {
            const res = await fetch(`https://macrowatersolutions.com/api/productos/${idAEliminar}`, { method: "DELETE" });
            if (res.ok) {
                setProductos(prev => prev.filter(p => p.id !== idAEliminar));
                setProductosOriginales(prev => prev.filter(p => p.id !== idAEliminar));
                if(productoEnDetalle?.id === idAEliminar) setProductoEnDetalle(null);
                mostrarToast("Producto eliminado");
            }
        } catch (error) { mostrarToast("Error al eliminar", true); }
    };

    if (cargando) return <div className="loader">Cargando productos...</div>;

    return (
        <section className="productos-section">
            {productoEnDetalle ? (
                /* --- VISTA DETALLE (ESTILO MERCADO LIBRE + COMPRAR AHORA) --- */
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
                                <span className="ML-label-top">Nuevo  |  {productoEnDetalle.stock} disponibles</span>
                                <h1 className="ML-title">{productoEnDetalle.nombre}</h1>
                                <div className="ML-price-large">${Number(productoEnDetalle.precio).toLocaleString()}</div>
                                
                                <div className="ML-specs">
                                    <p><strong>Vendido por:</strong> Macro Water Solutions</p>
                                    <p className="ML-stock-status">
                                        <i className="fa-solid fa-check"></i> Stock disponible
                                    </p>
                                </div>

                                <div className="ML-actions-group">
                                    {/* BOTÓN COMPRAR AHORA */}
                                    <button className="ML-btn-buy-now" onClick={() => comprarAhora(productoEnDetalle)}>
                                        Comprar ahora
                                    </button>

                                    {/* BOTÓN AGREGAR AL CARRITO */}
                                    <button className="ML-btn-add-cart" 
                                        onClick={() => agregarAlCarrito(productoEnDetalle, (ok, msg) => mostrarToast(msg, !ok))}>
                                        Agregar al carrito
                                    </button>
                                </div>

                                <div className="ML-description-section">
                                    <h3>Descripción</h3>
                                    <p>{productoEnDetalle.descripcion || "No hay descripción disponible para este producto."}</p>
                                </div>
                            </div>
                        </div>

                        {/* SECCIÓN DE COMENTARIOS (SOLO LECTURA) */}
                        <div className="ML-reviews-section">
                            <h3>Opiniones de clientes</h3>
                            <div className="ML-reviews-list">
                                {comentarios.length > 0 ? comentarios.map((c, i) => (
                                    <div key={i} className="ML-review-item">
                                        <div className="ML-review-user">
                                            <div className="user-icon-small"><i className="fa-solid fa-user"></i></div>
                                            <strong>{c.nombre}</strong>
                                            <span className="ML-review-date">{new Date(c.fecha).toLocaleDateString()}</span>
                                        </div>
                                        <p className="ML-review-text">{c.comentario}</p>
                                    </div>
                                )) : (
                                    <p className="ML-no-reviews">Este producto aún no tiene opiniones de compradores.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                /* --- VISTA GRID NORMAL (TIENDA) --- */
                <>
                    <h2 className="productos-titulo">
                        {esAdmin ? "Gestión de Inventario" : "Nuestros Productos"}
                    </h2>
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
                                        <button className="btn-carrito" onClick={() => agregarAlCarrito(prod, (ok, msg) => mostrarToast(msg, !ok))}>
                                            🛒 Agregar
                                        </button>
                                        <button className="btn-detalles-link" onClick={() => abrirDetalle(prod)}>
                                            Ver más
                                        </button>
                                        {esAdmin && (
                                            <div className="acciones-admin">
                                                <button className="btn-edit" onClick={() => navigate(`/admin/editar/${prod.id}`)}>✏️</button>
                                                <button className="btn-delete" onClick={() => {
                                                    setIdAEliminar(prod.id);
                                                    setModal({ abierto: true, tipo: "pregunta", titulo: "¿Eliminar?", texto: "Se borrará de la base de datos." });
                                                }}>🗑️</button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {modal.abierto && <MensajeModal info={modal} cerrar={() => setModal({ ...modal, abierto: false })} onConfirmar={ejecutarEliminado} />}
            {toast.mostrar && (
                <div className={`toast-agregado ${toast.esError ? 'toast-error' : ''}`}>
                    <span>{toast.mensaje}</span>
                </div>
            )}
        </section>
    );
}

export default ProductosPage;