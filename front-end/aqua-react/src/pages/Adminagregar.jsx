import React, { useState } from "react";
import MensajeModal from "../components/MensajeModal";
import "../admin_agregar.css";

function Adminagregar({ usuario }) {
    const [producto, setProducto] = useState({
        nombre: "",
        precio: "",
        descripcion: "",
        categoria: "Cuidado General",
        stock: "10"
    });
    const [imagen, setImagen] = useState(null);
    const [preview, setPreview] = useState(null);
    const [cargando, setCargando] = useState(false);
    const [modal, setModal] = useState({ abierto: false, tipo: "", titulo: "", texto: "" });

    // 🔑 VALIDACIÓN MAESTRA: Acepta texto 'admin', número 1 o propiedad rol_id
    const esAdmin = usuario && (
        usuario.rol === "admin" || 
        usuario.rol == 1 || 
        usuario.rol_id == 1 || 
        usuario.rol_id == '1'
    );

    if (!esAdmin) {
        return (
            <div className="acceso-denegado">
                <div className="caja-error">
                    <h1>🚫 Acceso Restringido</h1>
                    <p>Tu rol detectado: <strong>{usuario?.rol || usuario?.rol_id || "Ninguno"}</strong></p>
                    <p>Necesitas permisos de administrador para ver esta página.</p>
                    <button onClick={() => window.location.href = "/"}>Volver al Inicio</button>
                </div>
            </div>
        );
    }

    const handleChange = (e) => {
        setProducto({ ...producto, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImagen(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!imagen) {
            setModal({ abierto: true, tipo: "error", titulo: "Falta imagen", texto: "Por favor selecciona una imagen." });
            return;
        }

        setCargando(true);
        const formData = new FormData();
        formData.append("nombre", producto.nombre);
        formData.append("precio", producto.precio);
        formData.append("descripcion", producto.descripcion);
        formData.append("stock", producto.stock);
        
        // Mapeo dinámico de categorías
        const catId = producto.categoria === "Piscinas" ? 2 : producto.categoria === "Accesorios" ? 3 : 1;
        formData.append("categoria_id", catId); 
        
        formData.append("imagen", imagen);

        try {
            const res = await fetch("https://macrowatersolutions.com/api/productos", {
                method: "POST",
                body: formData
            });

            if (res.ok) {
                setModal({
                    abierto: true,
                    tipo: "exito",
                    titulo: "¡Producto Añadido!",
                    texto: `El producto "${producto.nombre}" se guardó correctamente.`
                });
                setProducto({ nombre: "", precio: "", descripcion: "", categoria: "Cuidado General", stock: "10" });
                setImagen(null);
                setPreview(null);
            } else {
                setModal({ abierto: true, tipo: "error", titulo: "Error", texto: "El servidor rechazó la solicitud." });
            }
        } catch (error) {
            setModal({ abierto: true, tipo: "error", titulo: "Error", texto: "No hay conexión con el servidor." });
        } finally {
            setCargando(false);
        }
    };

    return (
        <main className="admin-layout">
            <section className="formulario-col">
                <div className="header-admin">
                    <nav className="breadcrumb">Admin ▸ <span>Agregar Producto</span></nav>
                    <h1>Nuevo Producto -prueba</h1>
                </div>

                <form onSubmit={handleSubmit} className="caja-formulario">
                    <div className="campo">
                        <label>Nombre del producto</label>
                        <input name="nombre" type="text" onChange={handleChange} value={producto.nombre} required />
                    </div>

                    <div className="fila-campos">
                        <div className="campo">
                            <label>Precio ($)</label>
                            <input name="precio" type="number" step="0.01" onChange={handleChange} value={producto.precio} required />
                        </div>
                        <div className="campo">
                            <label>Categoría</label>
                            <select name="categoria" onChange={handleChange} value={producto.categoria}>
                                <option value="Cuidado General">Cuidado General</option>
                                <option value="Piscinas">Piscinas</option>
                                <option value="Accesorios">Accesorios</option>
                            </select>
                        </div>
                        <div className="campo">
                            <label>Stock</label>
                            <input name="stock" type="number" onChange={handleChange} value={producto.stock} />
                        </div>
                    </div>

                    <div className="campo">
                        <label>Imagen del Producto</label>
                        <input type="file" accept="image/*" onChange={handleImageChange} required={!preview} />
                    </div>

                    <div className="campo">
                        <label>Descripción Corta</label>
                        <textarea name="descripcion" rows="3" onChange={handleChange} value={producto.descripcion}></textarea>
                    </div>

                    <div className="acciones-form">
                        <button type="submit" className="btn-guardar" disabled={cargando}>
                            {cargando ? "Guardando..." : "+ Guardar Producto"}
                        </button>
                    </div>
                </form>
            </section>

            <aside className="preview-col">
                <div className="card-preview">
                    <div className="img-container">
                        {preview ? <img src={preview} alt="Preview" /> : "Imagen"}
                    </div>
                    <h2>{producto.nombre || "Nombre"}</h2>
                    <span>${producto.precio || "0.00"}</span>
                </div>
            </aside>

            {modal.abierto && (
                <MensajeModal info={modal} cerrar={() => setModal({ ...modal, abierto: false })} />
            )}
        </main>
    );
}

export default Adminagregar;