import React, { useState } from "react";
function ProductoCard({ producto, agregarAlCarrito }) {
  const [mensajeVisible, setMensajeVisible] = useState(false);

  const manejarAgregar = () => {
    if (agregarAlCarrito) {
      agregarAlCarrito(producto);
    }
    setMensajeVisible(true);
    setTimeout(() => {
      setMensajeVisible(false);
    }, 3000);
  };

  return (
    <div className="producto-card">
      <img src={producto?.imagen || "https://via.placeholder.com/250"} alt={producto?.nombre} />

      <div className="producto-info">
        <div className="producto-top">
          <h3>{producto?.nombre || "Producto"}</h3>
          <span className="precio">${producto?.precio || "0.00"}</span>
        </div>

        {mensajeVisible && (
          <div style={{
            backgroundColor: "#e8f5e9",
            color: "#2e7d32",
            padding: "8px",
            borderRadius: "5px",
            fontSize: "13px",
            textAlign: "center",
            marginBottom: "12px",
            border: "1px solid #c8e6c9",
            fontWeight: "bold",
            animation: "fadeIn 0.3s ease-in-out"
          }}> 
            ¡Se agregó al carrito con éxito! 
          </div>
        )}

        <button
          className="btn-carrito"
          onClick={manejarAgregar}
          disabled={mensajeVisible} 
          style={{ opacity: mensajeVisible ? 0.7 : 1, cursor: mensajeVisible ? "default" : "pointer" }}
        >
          {mensajeVisible ? "Añadido" : "Añadir al carrito"}
        </button>
      </div>
    </div>
  );
}

export default ProductoCard;