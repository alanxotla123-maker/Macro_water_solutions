import React, { useState } from 'react';

function Adminagregar() {
  // Estado para manejar los datos del formulario y la vista previa
  const [producto, setProducto] = useState({
    nombre: '',
    precio: '',
    categoria: 'Cuidado General',
    stock: 10,
    imagen: '',
    descripcion: '',
    nuevo: false
  });

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    setProducto({
      ...producto,
      [id]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Aquí mandas el producto al backend que ya configuramos
    console.log("Guardando producto...", producto);
    alert(`Producto "${producto.nombre}" guardado con éxito.`);
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

        <form id="Formulario-Agregar-Producto" className="caja-formulario" onSubmit={handleSubmit}>
          <div className="campo">
            <label htmlFor="nombre">Nombre del producto</label>
            <input type="text" id="nombre" value={producto.nombre} onChange={handleChange} placeholder="Ej. AquaBot x200" required />
          </div>

          <div className="fila-campos">
            <div className="campo">
              <label htmlFor="precio">Precio</label>
              <input type="number" id="precio" value={producto.precio} onChange={handleChange} step="0.01" placeholder="0.00" required />
            </div>
            <div className="campo">
              <label htmlFor="categoria">Categoría</label>
              <select id="categoria" value={producto.categoria} onChange={handleChange}>
                <option value="Cuidado General">Cuidado General</option>
                <option value="Piscinas">Piscinas</option>
                <option value="Accesorios">Accesorios</option>
              </select>
            </div>
            <div className="campo">
              <label htmlFor="stock">Stock Disponible</label>
              <input type="number" id="stock" value={producto.stock} onChange={handleChange} />
            </div>
          </div>

          <div className="seccion-divisora">
            <h3>Multimedia</h3>
            <hr />
          </div>

          <div className="campo">
            <label htmlFor="imagen">URL de Imagen</label>
            <div className="input-con-icono">
              <input type="text" id="imagen" value={producto.imagen} onChange={handleChange} placeholder="https://.." />
              <button type="button" className="btn-upload"><i className="fas fa-upload"></i></button>
            </div>
            <small>Recomendado: 800×800px, formato JPG o PNG.</small>
          </div>

          <div className="seccion-divisora">
            <h3>Detalles</h3>
            <hr />
          </div>

          <div className="campo">
            <label htmlFor="descripcion">Descripción Corta</label>
            <textarea id="descripcion" value={producto.descripcion} onChange={handleChange} rows="3" placeholder="Limpieza automatizada inteligente..."></textarea>
          </div>

          <div className="campo-check">
            <input type="checkbox" id="nuevo" checked={producto.nuevo} onChange={handleChange} />
            <label htmlFor="nuevo">Marcar como "Nuevo"</label>
          </div>

          <div className="acciones-form">
            <button type="button" className="btn-text">Cancelar</button>
            <button type="submit" className="btn-guardar">+ Guardar Producto</button>
          </div>
        </form>
      </section>

      {/* COLUMNA DERECHA: VISTA PREVIA */}
      <aside className="preview-col">
        <h3>VISTA PREVIA</h3>
        <div className="card-preview">
          <div className="img-container">
            {producto.imagen ? (
              <img src={producto.imagen} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div id="placeholder-text">Imagen del producto</div>
            )}
          </div>
          <div className="preview-content">
            <div className="preview-header">
              <h2 id="view-nombre">{producto.nombre || "Nombre del producto"}</h2>
              <span id="view-precio">${producto.precio || "0.00"}</span>
            </div>
            <p id="view-desc">{producto.descripcion || "Descripción breve del producto..."}</p>
            <button type="button" className="btn-add-preview">Añadir al carrito</button>
          </div>
        </div>

        <div className="alert-info">
          <i className="fas fa-info-circle"></i>
          <p>Al guardar, el producto se añadirá inmediatamente a la cuadrícula de la página principal.</p>
        </div>
      </aside>
    </main>
  );
}

export default Adminagregar;