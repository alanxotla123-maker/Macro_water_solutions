import React, { useEffect, useState } from "react";
import MensajeModal from "../components/MensajeModal";
import "../productos.css";

function ProductosPage({ agregarAlCarrito, usuario }) {
    const [productos, setProductos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [modal, setModal] = useState({ abierto: false, tipo: "", titulo: "", texto: "" });
    const [idAEliminar, setIdAEliminar] = useState(null);

    // 1. VERIFICACIÓN DE SEGURIDAD
    // Comprobamos si el objeto usuario existe y si su propiedad rol es 'admin'
    const esAdmin = usuario && usuario.rol === 'admin';

    const obtenerProductos = async () => {
        try {
            const res = await fetch("http://localhost:3000/api/productos");
            const data = await res.json();
            setProductos(data);
        } catch (error) {
            console.error("Error cargando productos:", error);
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        obtenerProductos();
    }, []);

    const ejecutarEliminado = async () => {
        setModal({ ...modal, abierto: false });
        try {
            const res = await fetch(`http://localhost:3000/api/productos/${idAEliminar}`, {
                method: "DELETE"
            });
            if (res.ok) {
                setModal({ abierto: true, tipo: "exito", titulo: "¡Borrado!", texto: "Producto eliminado correctamente." });
                setProductos(productos.filter(p => p.id !== idAEliminar));
            }
        } catch (error) {
            setModal({ abierto: true, tipo: "error", titulo: "Error", texto: "No se pudo conectar con el servidor." });
        }
    };

    if (cargando) return <div className="loader">Cargando productos...</div>;

    return (
        <section className="productos-section">
            {/* Título dinámico según el rol */}
            <h2 className="productos-titulo">
                {esAdmin ? "Panel de Gestión de Inventario" : "Nuestros Productos"}
            </h2>
            
            <div className="productos-grid">
                {productos.map((prod) => (
                    <div className="producto-card" key={prod.id}>
                        <img src={prod.imagen} alt={prod.nombre} />
                        <div className="producto-info">
                            <h3>{prod.nombre}</h3>
                            <p>{prod.descripcion}</p>
                            <span className="precio">${prod.precio}</span>
                            
                            <div className="acciones-container">
                                {/* BOTÓN DE CARRITO (Visible para todos si hay sesión) */}
                                {usuario && (
                                    <button className="btn-carrito" onClick={() => agregarAlCarrito(prod)}>
                                        🛒 Agregar
                                    </button>
                                )}

                                {/* BOTONES DE ADMIN (Solo si esAdmin es true) */}
                                {esAdmin && (
                                    <div className="acciones-admin">
                                        <button className="btn-edit" onClick={() => alert("Editar...")}>
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
        </section>
    );
}

export default ProductosPage;