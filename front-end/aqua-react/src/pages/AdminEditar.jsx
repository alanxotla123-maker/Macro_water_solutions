import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MensajeModal from '../components/MensajeModal'; // NUEVO
import '../styles/Admin_editar_productos.css';

const EditarProducto = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [producto, setProducto] = useState({
    nombre: '',
    precio: '',
    categoria_id: 1,
    stock: 0,
    imagen: '',
    descripcion: ''
  });

  const [archivo, setArchivo] = useState(null);
  const [preview, setPreview] = useState("");
  // NUEVO: Estado para controlar el modal
  const [modal, setModal] = useState({ abierto: false, tipo: "", titulo: "", texto: "" });

  useEffect(() => {
    const obtenerProducto = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/productos/${id}`);
        if (res.ok) {
          const data = await res.json();
          setProducto(data);
          setPreview(data.imagen);
        } else {
          // En lugar de alert, usamos modal de error
          setModal({
            abierto: true,
            tipo: "error",
            titulo: "Error",
            texto: "No se encontró el producto en la base de datos."
          });
        }
      } catch (error) {
        console.error("Error al obtener producto:", error);
      }
    };
    obtenerProducto();
  }, [id]);

  const handleChange = (e) => {
    const { id, value, type } = e.target;
    let valorFinal = value;
    if (type === 'number' || id === 'categoria_id') {
      valorFinal = value === '' ? 0 : Number(value);
    }
    setProducto({ ...producto, [id]: valorFinal });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setArchivo(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("nombre", producto.nombre);
    formData.append("precio", producto.precio);
    formData.append("descripcion", producto.descripcion);
    formData.append("stock", producto.stock);
    formData.append("categoria_id", producto.categoria_id);
    
    if (archivo) {
      formData.append("imagen", archivo);
    }

    try {
      const res = await fetch(`http://localhost:3000/api/productos/${id}`, {
        method: "PUT",
        body: formData 
      });

      if (res.ok) {
        // EN LUGAR DE ALERT: Mostramos éxito
        setModal({
          abierto: true,
          tipo: "exito",
          titulo: "¡Actualización Exitosa!",
          texto: `El producto "${producto.nombre}" ha sido actualizado correctamente en S3 y MySQL.`
        });
      } else {
        setModal({
          abierto: true,
          tipo: "error",
          titulo: "Fallo al Guardar",
          texto: "Hubo un problema al procesar los cambios en el servidor."
        });
      }
    } catch (error) {
      setModal({
        abierto: true,
        tipo: "error",
        titulo: "Error de Conexión",
        texto: "No se pudo conectar con el servidor de Aqua Clean Pro."
      });
    }
  };

  // Función para cerrar el modal y navegar si fue éxito
  const cerrarYSalir = () => {
    const salir = modal.tipo === "exito";
    setModal({ ...modal, abierto: false });
    if (salir) navigate('/productos');
  };

  return (
    <div className="admin-page">
      <main className="admin-layout">
        <section className="formulario-col">
          <div className="header-admin">
            <nav className="breadcrumb">Admin ▸ <span>ID: {id}</span></nav>
            <h1>Editar Producto</h1>
          </div>

          <form className="caja-formulario" onSubmit={handleSubmit}>
            {/* ... tus campos de input se mantienen igual ... */}
            <div className="campo">
              <label htmlFor="nombre">Nombre del producto</label>
              <input type="text" id="nombre" value={producto.nombre} onChange={handleChange} required />
            </div>

            <div className="fila-campos">
              <div className="campo">
                <label htmlFor="precio">Precio ($)</label>
                <input type="number" id="precio" value={producto.precio} onChange={handleChange} required />
              </div>
              <div className="campo">
                <label htmlFor="categoria_id">Categoría</label>
                <select id="categoria_id" value={producto.categoria_id} onChange={handleChange}>
                  <option value="1">Cuidado General</option>
                  <option value="2">Piscinas</option>
                  <option value="3">Accesorios</option>
                </select>
              </div>
            </div>

            <div className="campo">
              <label>Imagen del Producto</label>
              <input type="file" accept="image/*" onChange={handleFileChange} />
            </div>

            <div className="campo">
              <label htmlFor="descripcion">Descripción</label>
              <textarea id="descripcion" rows="4" value={producto.descripcion} onChange={handleChange}></textarea>
            </div>

            <div className="acciones-form">
              <button type="button" className="btn-text" onClick={() => navigate('/productos')}>Cancelar</button>
              <button type="submit" className="btn-guardar">Guardar Cambios</button>
            </div>
          </form>
        </section>

        <aside className="preview-col">
          <h3>VISTA PREVIA</h3>
          <div className="card-preview">
            <div className="img-container">
              <img src={preview || "https://via.placeholder.com/300"} alt="Preview" />
            </div>
            <div className="preview-content">
              <h2>{producto.nombre || "Nombre"}</h2>
              <span>${producto.precio || "0.00"}</span>
              <p>{producto.descripcion || "Sin descripción"}</p>
            </div>
          </div>
        </aside>
      </main>

      {/* RENDERIZADO DEL MODAL */}
      {modal.abierto && (
        <MensajeModal 
          info={modal} 
          cerrar={cerrarYSalir} 
        />
      )}
    </div>
  );
};

export default EditarProducto;