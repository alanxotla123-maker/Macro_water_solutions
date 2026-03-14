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

    const navigate = useNavigate();

    const mostrarToast = (mensaje, esError = false) => {
        setToast({ mostrar: true, mensaje, esError });
        setTimeout(() => setToast(t => ({ ...t, mostrar: false })), 2500);
    }; //Inicializamos el navegador

    const esAdmin = usuario && usuario.rol === 'admin';

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

    useEffect(() => {
        obtenerProductos();
    }, []);

    useEffect(() => {
        const q = (queryBusqueda || "").trim().toLowerCase();
        if (!q) {
            setProductos(productosOriginales);
            return;
        }
        const filtrados = productosOriginales.filter(
            (p) => p.nombre && p.nombre.toLowerCase().includes(q)
        );
        setProductos(filtrados);
    }, [queryBusqueda, productosOriginales]);

    const ejecutarEliminado = async () => {
        setModal({ ...modal, abierto: false });
        try {
            const res = await fetch(`https://macrowatersolutions.com/api/productos/${idAEliminar}`, {
                method: "DELETE"
            });
            if (res.ok) {
                setModal({ abierto: true, tipo: "exito", titulo: "¡Borrado!", texto: "Producto eliminado correctamente." });
                setProductos(prev => prev.filter(p => p.id !== idAEliminar));
                setProductosOriginales(prev => prev.filter(p => p.id !== idAEliminar));
            }
        } catch (error) {
            setModal({ abierto: true, tipo: "error", titulo: "Error", texto: "No se pudo conectar con el servidor." });
        }
    };

    if (cargando) return <div className="loader">Cargando productos...</div>;

    return (
        <section className="productos-section">
            <h2 className="productos-titulo">
                {esAdmin ? "Panel de Gestión de Inventario" : "Nuestros Productos"}
                {queryBusqueda && (
                    <span className="search-badge"> Buscando: "{queryBusqueda}"</span>
                )}
            </h2>
            
            {queryBusqueda && productos.length === 0 && !cargando && (
                <p className="no-resultados">No se encontraron productos para "{queryBusqueda}"</p>
            )}
            
            <div className="productos-grid">
                {productos.map((prod) => (
                    <div className="producto-card" key={prod.id}>
                        <img src={prod.imagen} alt={prod.nombre} />
                        <div className="producto-info">
                            <h3>{prod.nombre}</h3>
                            <p>{prod.descripcion}</p>
                            <span className="precio">${prod.precio}</span>
                            
                            <div className="acciones-container">
                               
                                    <button className="btn-carrito" onClick={() => agregarAlCarrito(prod, (ok, msg) => mostrarToast(msg, !ok))}>
                                        🛒 Agregar
                                    </button>
                            

                                {esAdmin && (
                                    <div className="acciones-admin">
                                        {/* CAMBIO AQUÍ: Ahora navega a la ruta de edición con el ID */}
                                        <button 
                                            className="btn-edit" 
                                            onClick={() => navigate(`/admin/editar/${prod.id}`)}
                                        >
                                            ✏️
                                        </button>
                                        
                                        <button className="btn-delete" onClick={() => {
                                            setIdAEliminar(prod.id);
                                            setModal({ abierto: true, tipo: "pregunta", titulo: "¿Eliminar?", texto: "Esta acción quitará el producto de la base de datos." });
                                        }}>
                                            🗑️
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {modal.abierto && (
                <MensajeModal 
                    info={modal} 
                    cerrar={() => setModal({ ...modal, abierto: false })}
                    onConfirmar={ejecutarEliminado} 
                />
            )}

            {toast.mostrar && (
                <div className={`toast-agregado ${toast.esError ? 'toast-error' : ''}`}>
                    <i className={`fa-solid ${toast.esError ? 'fa-triangle-exclamation' : 'fa-check-circle'}`}></i>
                    <span>{toast.mensaje}</span>
                </div>
            )}
        </section>
    );
}

export default ProductosPage; 