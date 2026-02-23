import React, { useState } from "react";
import MensajeModal from "../components/MensajeModal";
import "../admin_agregar.css";

// Recibimos 'usuario' como prop desde App.js
function Adminagregar({ usuario }) {
    const [producto, setProducto] = useState({
        nombre: "",
        precio: "",
        descripcion: "",
        categoria: "Químicos",
        stock: ""
    });
    const [imagen, setImagen] = useState(null);
    const [preview, setPreview] = useState(null);
    const [cargando, setCargando] = useState(false);

    const [modal, setModal] = useState({ abierto: false, tipo: "", titulo: "", texto: "" });

    // 1. VERIFICACIÓN DE SEGURIDAD
    const esAdmin = usuario && usuario.rol === 'admin';

    // Si no es admin, mostramos pantalla de error
    if (!esAdmin) {
        return (
            <div className="acceso-denegado">
                <div className="caja-error">
                    <h1>🚫 Acceso Restringido</h1>
                    <p>Lo sentimos, Alan. Solo el administrador puede añadir nuevos productos a Aqua Clean Pro.</p>
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
            setModal({
                abierto: true,
                tipo: "error",
                titulo: "Falta imagen",
                texto: "Por favor, selecciona una imagen para el producto."
            });
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
                    texto: `El producto "${producto.nombre}" se guardó correctamente.`
                });
                setProducto({ nombre: "", precio: "", descripcion: "", categoria: "Químicos", stock: "" });
                setImagen(null);
                setPreview(null);
            } else {
                const errorData = await res.json();
                setModal({
                    abierto: true,
                    tipo: "error",
                    titulo: "Error al guardar",
                    texto: errorData.details || "Hubo un fallo en el servidor."
                });
            }
        } catch (error) {
            setModal({
                abierto: true,
                tipo: "error",
                titulo: "Fallo de conexión",
                texto: "No se pudo conectar con el servidor."
            });
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="admin-layout">
            <div className="formulario-col">
                <div className="header-admin">
                    <p className="breadcrumb">Panel / <span>Nuevo Producto</span></p>
                    <h1>Añadir Producto</h1>
                </div>

                <form className="caja-formulario" onSubmit={handleSubmit}>
                    <div className="campo">
                        <label>Nombre del Producto</label>
                        <input name="nombre" type="text" onChange={handleChange} value={producto.nombre} required />
                    </div>

                    <div className="fila-campos">
                        <div className="campo">
                            <label>Precio ($)</label>
                            <input name="precio" type="number" onChange={handleChange} value={producto.precio} required />
                        </div>
                        <div className="campo">
                            <label>Stock</label>
                            <input name="stock" type="number" onChange={handleChange} value={producto.stock} required />
                        </div>
                    </div>

                    <div className="campo">
                        <label>Descripción</label>
                        <textarea name="descripcion" rows="4" onChange={handleChange} value={producto.descripcion} required />
                    </div>

                    <div className="campo">
                        <label>Imagen</label>
                        <input type="file" accept="image/*" onChange={handleImageChange} required={!preview} />
                    </div>

                    <button type="submit" className="btn-guardar" disabled={cargando}>
                        {cargando ? "Procesando..." : "Guardar Producto"}
                    </button>
                </form>
            </div>

            <div className="preview-col">
                <h3>VISTA PREVIA</h3>
                <div className="card-preview">
                    <div className="img-container">
                        {preview ? <img src={preview} alt="Preview" /> : <span>Sin imagen</span>}
                    </div>
                    <div className="preview-content">
                        <h4>{producto.nombre || "Nombre"}</h4>
                        <p>${producto.precio || "0.00"}</p>
                    </div>
                </div>
            </div>

            {modal.abierto && (
                <MensajeModal info={modal} cerrar={() => setModal({ ...modal, abierto: false })} />
            )}
        </div>
    );
}

export default Adminagregar;