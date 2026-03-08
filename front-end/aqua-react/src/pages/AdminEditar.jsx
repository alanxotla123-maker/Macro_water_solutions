import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MensajeModal from '../components/MensajeModal'; 
import '../styles/Admin_editar_productos.css';

const EditarProducto = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [producto, setProducto] = useState({
    nombre: '',
    precio: '',
    categoria_id: 1,
    stock: 0,
    descripcion: ''
  });

  const [archivo, setArchivo] = useState(null);
  const [preview, setPreview] = useState("");
  const [modal, setModal] = useState({ abierto: false, tipo: "", titulo: "", texto: "" });

  // 1. CARGAR DATOS DEL PRODUCTO AL INICIAR
  useEffect(() => {
    const obtenerProducto = async () => {
      try {
        const res = await fetch(`https://macrowatersolutions.com/api/productos/${id}`);
        if (res.ok) {
          const data = await res.json();
          setProducto(data);
          setPreview(data.imagen);
        } else {
          setModal({
            abierto: true,
            tipo: "error",
            titulo: "Error",
            texto: "No se pudo cargar el producto. Es posible que no exista."
          });
        }
      } catch (error) {
        console.error("Error al obtener producto:", error);
      }
    };
    obtenerProducto();
  }, [id]);

  // 2. FUNCIÓN PARA ELIMINAR REALMENTE
  const eliminarProductoReal = async () => {
    try {
      const res = await fetch(`https://macrowatersolutions.com/api/productos/${id}`, {
        method: "DELETE"
      });

      if (res.ok) {
        setModal({
          abierto: true,
          tipo: "exito",
          titulo: "¡Eliminado!",
          texto: "El producto ha sido borrado correctamente."
        });
      } else {
        throw new Error();
      }
    } catch (error) {
      setModal({
        abierto: true,
        tipo: "error",
        titulo: "Error",
        texto: "No se pudo eliminar el producto del servidor."
      });
    }
  };

  const preguntarEliminar = () => {
    setModal({
      abierto: true,
      tipo: "pregunta",
      titulo: "¿Estás seguro?",
      texto: `Vas a eliminar definitivamente "${producto.nombre}".`
    });
  };

  // 3. MANEJADOR DE CAMBIOS (CORREGIDO)
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    let valorFinal = value;
    
    if (type === 'number' || name === 'categoria_id' || name === 'stock') {
      valorFinal = value === '' ? 0 : Number(value);
    }
    
    setProducto({ ...producto, [name]: valorFinal });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setArchivo(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  // 4. GUARDAR CAMBIOS (PUT)
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
      const res = await fetch(`https://macrowatersolutions.com/api/productos/${id}`, {
        method: "PUT",
        body: formData 
      });

      if (res.ok) {
        setModal({
          abierto: true,
          tipo: "exito",
          titulo: "¡Guardado!",
          texto: "Los cambios se aplicaron correctamente."
        });
      } else {
        throw new Error();
      }
    } catch (error) {
      setModal({ 
        abierto: true, 
        tipo: "error", 
        titulo: "Error", 
        texto: "Hubo un problema al intentar guardar los cambios." 
      });
    }
  };

  const cerrarModal = () => {
    const redirigir = modal.tipo === "exito" || modal.titulo === "¡Eliminado!";
    setModal({ ...modal, abierto: false });
    if (redirigir) {
      navigate('/productos');
    }
  };

  return (
    <div className="admin-page">
      <main className="admin-layout">
        <section className="formulario-col">
          <div className="header-admin" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <nav className="breadcrumb">Admin ▸ <span>ID: {id}</span></nav>
            <div style={{ display: 'flex', gap: '10px' }}>
                <h1>Editar Producto</h1>
                
            </div>
          </div>

          <form className="caja-formulario" onSubmit={handleSubmit}>
            <div className="campo">
              <label>Nombre del producto</label>
              <input type="text" name="nombre" value={producto.nombre} onChange={handleChange} required />
            </div>

            <div className="fila-campos">
              <div className="campo">
                <label>Precio ($)</label>
                <input type="number" name="precio" value={producto.precio} onChange={handleChange} required />
              </div>
              <div className="campo">
                <label>Categoría</label>
                <select name="categoria_id" value={producto.categoria_id} onChange={handleChange}>
                  <option value="1">Cuidado General</option>
                  <option value="2">Piscinas</option>
                  <option value="3">Accesorios</option>
                </select>
              </div>
              <div className="campo">
                <label>Stock</label>
                <input type="number" name="stock" value={producto.stock} onChange={handleChange} required />
              </div>
            </div>

            <div className="campo">
              <label>Imagen del Producto (Opcional)</label>
              <input type="file" accept="image/*" onChange={handleFileChange} />
              <small>Deja vacío para mantener la imagen actual.</small>
            </div>

            <div className="campo">
              <label>Descripción</label>
              <textarea name="descripcion" rows="4" value={producto.descripcion} onChange={handleChange}></textarea>
            </div>

            <div className="acciones-form">
              <button type="button" className="btn-text" onClick={() => navigate('/productos')}>Cancelar</button>
              <button type="submit" className="btn-guardar">Guardar Cambios</button>
            </div>
          </form>
        </section>

        <aside className="preview-col">
          <div className="sticky-preview">
            <h3>VISTA PREVIA</h3>
            <div className="card-preview">
                <div className="img-container">
                    <img 
                        src={preview || "https://placehold.co/300x300?text=Sin+Imagen"} 
                        alt="Preview" 
                    />
                </div>
                <div className="preview-content">
                    <h2>{producto.nombre || "Nombre"}</h2>
                    <span className="precio-tag">${producto.precio || "0.00"}</span>
                </div>
            </div>
          </div>
        </aside>
      </main>

      {modal.abierto && (
        <MensajeModal 
          info={modal} 
          cerrar={cerrarModal} 
          onConfirmar={eliminarProductoReal} 
        />
      )}
    </div>
  );
};

export default EditarProducto;