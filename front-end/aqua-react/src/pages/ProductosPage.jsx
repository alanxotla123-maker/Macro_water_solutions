import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // NUEVO: Para poder navegar
import MensajeModal from "../components/MensajeModal";
import "../productos.css";

function ProductosPage({ agregarAlCarrito, usuario }) {
    const [productos, setProductos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [modal, setModal] = useState({ abierto: false, tipo: "", titulo: "", texto: "" });
    const [idAEliminar, setIdAEliminar] = useState(null);

    const navigate = useNavigate(); // NUEVO: Inicializamos el navegador

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
                                {usuario && (
                                    <button className="btn-carrito" onClick={() => agregarAlCarrito(prod)}>
                                        🛒 Agregar
                                    </button>
                                )}

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
        </section>
    );
}

export default ProductosPage; 