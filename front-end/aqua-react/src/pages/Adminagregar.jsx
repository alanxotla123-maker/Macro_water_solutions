import React, { useState } from "react";
import MensajeModal from "../components/MensajeModal";
import "../admin_agregar.css"; // Asegúrate de que este CSS tenga los estilos del HTML que pasaste

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

    const esAdmin = usuario && usuario.rol === 'admin';

    if (!esAdmin) {
        return (
            <div className="acceso-denegado">
                <div className="caja-error">
                    <h1>🚫 Acceso Restringido</h1>
                    <p>Lo sentimos, solo el administrador puede añadir nuevos productos.</p>
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
            setModal({ abierto: true, tipo: "error", titulo: "Falta imagen", texto: "Selecciona una imagen." });
            return;
        }

        setCargando(true);
        const formData = new FormData();
        formData.append("nombre", producto.nombre);
        formData.append("precio", producto.precio);
        formData.append("descripcion", producto.descripcion);
        formData.append("stock", producto.stock);
        formData.append("categoria_id", 1); 
        formData.append("imagen", imagen);

        try {
            const res = await fetch("http://localhost:3000/api/productos", {
                method: "POST",
                body: formData
            });

            if (res.ok) {
                setModal({
                    abierto: true,
                    tipo: "exito",
                    titulo: "¡Producto Añadido!",
                    texto: `El producto "${producto.nombre}" se guardó en AWS S3.`
                });
                setProducto({ nombre: "", precio: "", descripcion: "", categoria: "Cuidado General", stock: "10" });
                setImagen(null);
                setPreview(null);
            }
        } catch (error) {
            setModal({ abierto: true, tipo: "error", titulo: "Error", texto: "No se pudo conectar con el servidor." });
        } finally {
            setCargando(false);
        }
    };

    return (
        <main className="admin-layout">
            {/* COLUMNA IZQUIERDA: FORMULARIO */}
            <section className="formulario-col">
                <div className="header-admin">
                    <nav className="breadcrumb">Admin ▸ <span>Agregar Producto</span></nav>
                    <h1>Nuevo Producto</h1>
                    <p className="subtitulo">Agrega un nuevo ítem a tu catálogo de piscinas.</p>
                </div>

                <form onSubmit={handleSubmit} className="caja-formulario">
                    <div className="campo">
                        <label>Nombre del producto</label>
                        <input name="nombre" type="text" onChange={handleChange} value={producto.nombre} placeholder="Ej. AquaBot x200" required />
                    </div>

                    <div className="fila-campos">
                        <div className="campo">
                            <label>Precio</label>
                            <input name="precio" type="number" step="0.01" onChange={handleChange} value={producto.precio} placeholder="0.00" required />
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
                            <label>Stock Disponible</label>
                            <input name="stock" type="number" onChange={handleChange} value={producto.stock} />
                        </div>
                    </div>

                    <div className="seccion-divisora">
                        <h3>Multimedia</h3>
                        <hr />
                    </div>

                    <div className="campo">
                        <label>Imagen del Producto</label>
                        <div className="input-con-icono">
                            <input type="file" accept="image/*" onChange={handleImageChange} required={!preview} />
                        </div>
                        <small>Las imágenes se subirán automáticamente a AWS S3.</small>
                    </div>

                    <div className="seccion-divisora">
                        <h3>Detalles</h3>
                        <hr />
                    </div>

                    <div className="campo">
                        <label>Descripción Corta</label>
                        <textarea name="descripcion" rows="3" onChange={handleChange} value={producto.descripcion} placeholder="Limpieza automatizada inteligente..."></textarea>
                    </div>

                    <div className="acciones-form">
                        <button type="button" className="btn-text" onClick={() => window.location.href = "/"}>Cancelar</button>
                        <button type="submit" className="btn-guardar" disabled={cargando}>
                            {cargando ? "Guardando..." : "+ Guardar Producto"}
                        </button>
                    </div>
                </form>
            </section>

            {/* COLUMNA DERECHA: VISTA PREVIA */}
            <aside className="preview-col">
                <h3>VISTA PREVIA</h3>
                <div className="card-preview">
                    <div className="img-container">
                        {preview ? <img src={preview} alt="Preview" /> : <div id="placeholder-text">Imagen del producto</div>}
                    </div>
                    <div className="preview-content">
                        <div className="preview-header">
                            <h2>{producto.nombre || "Nombre del producto"}</h2>
                            <span>${producto.precio || "0.00"}</span>
                        </div>
                        <p>{producto.descripcion || "Descripción breve del producto..."}</p>
                        <button type="button" className="btn-add-preview">Añadir al carrito</button>
                    </div>
                </div>
            </aside>

            {modal.abierto && (
                <MensajeModal info={modal} cerrar={() => setModal({ ...modal, abierto: false })} />
            )}
        </main>
    );
}

export default Adminagregar;