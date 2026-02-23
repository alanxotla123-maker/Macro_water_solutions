function ProductoCard({ producto, agregarAlCarrito }) {
  return (
    <div className="producto-card">
      <img src={producto.imagen} />

      <div className="producto-info">
        <div className="producto-top">
          <h3>{producto.nombre}</h3>
          <span className="precio">${producto.precio}</span>
        </div>

        <button
          className="btn-carrito"
          onClick={() => agregarAlCarrito(producto)}
        >
          Añadir al carrito
        </button>
      </div>
    </div>
  );
}

export default ProductoCard;