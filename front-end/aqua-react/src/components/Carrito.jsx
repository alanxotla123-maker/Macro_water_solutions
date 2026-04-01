import React from "react";
import { useNavigate } from "react-router-dom";

function Carrito({ 
  abierto = false, 
  cerrar = () => {}, 
  items = [], 
  actualizarCantidad = () => {}, 
  eliminar = () => {} 
}) {
  const navigate = useNavigate();

  // CÁLCULO DEL TOTAL CONSIDERANDO EL DESCUENTO DE CADA ITEM
  const total = items.reduce((acc, item) => {
    const precioBase = parseFloat(item?.precio || 0);
    const descuento = item?.descuento || 0;
    const precioConDescuento = precioBase * (1 - descuento / 100);
    return acc + (precioConDescuento * (item?.cantidad || 1));
  }, 0);

  const manejarPago = () => {
    cerrar(); 
    navigate("/checkout"); 
  };

  if (!abierto) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        display: "flex",
        justifyContent: "flex-end",
        zIndex: 99999,
      }}
      onClick={cerrar}
    >
      <div
        style={{
          width: "380px",
          backgroundColor: "white",
          height: "100%",
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          boxShadow: "-5px 0 15px rgba(0,0,0,0.3)",
          color: "black",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #eee", paddingBottom: "10px" }}>
          <h2 style={{ margin: 0 }}>Tu Carrito</h2>
          <button onClick={cerrar} style={{ fontSize: "24px", border: "none", background: "none", cursor: "pointer" }}>&times;</button>
        </div>

        {/* BODY */}
        <div style={{ flex: 1, overflowY: "auto", marginTop: "20px" }}>
          {items.length === 0 ? (
            <p style={{ textAlign: "center", color: "#666" }}>El carrito está vacío</p>
          ) : (
            items.map((item, index) => {
              const tieneDescuento = item.descuento > 0;
              const precioReal = tieneDescuento 
                ? (item.precio * (1 - item.descuento / 100)) 
                : item.precio;

              return (
                <div
                  key={item.id || index}
                  style={{ display: "flex", flexDirection: "column", marginBottom: "15px", padding: "12px", backgroundColor: "#f9f9f9", borderRadius: "8px", border: "1px solid #eee" }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ fontWeight: "bold" }}>{item?.nombre}</div>
                      
                      {/* PRECIO DINÁMICO */}
                      {tieneDescuento ? (
                        <div style={{ display: "flex", gap: "8px", alignItems: "center", marginTop: "4px" }}>
                           <span style={{ textDecoration: "line-through", color: "#999", fontSize: "0.8rem" }}>${item.precio}</span>
                           <span style={{ color: "#e84118", fontWeight: "bold" }}>${precioReal.toFixed(2)}</span>
                           <span style={{ background: "#e84118", color: "white", fontSize: "0.6rem", padding: "2px 4px", borderRadius: "4px" }}>-{item.descuento}%</span>
                        </div>
                      ) : (
                        <div style={{ color: "#2196f3", marginTop: "4px" }}>${item?.precio}</div>
                      )}
                    </div>
                    <button onClick={() => eliminar(item.id)} style={{ backgroundColor: "transparent", border: "none", color: "#ff6b6b", cursor: "pointer", fontSize: "16px" }}>
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  </div>

                  {/* CONTROLES */}
                  <div style={{ display: "flex", alignItems: "center", marginTop: "10px", gap: "10px" }}>
                    <div style={{ display: "flex", alignItems: "center", border: "1px solid #ccc", borderRadius: "5px", overflow: "hidden" }}>
                      <button onClick={() => actualizarCantidad(item.id, -1)} style={{ padding: "2px 10px", border: "none", background: "#eee", cursor: "pointer" }} disabled={item.cantidad <= 1}>-</button>
                      <span style={{ padding: "0 10px", fontWeight: "bold", minWidth: "25px", textAlign: "center" }}>{item.cantidad}</span>
                      <button onClick={() => actualizarCantidad(item.id, 1)} style={{ padding: "2px 10px", border: "none", background: item.cantidad >= item.stock ? "#ddd" : "#eee", cursor: item.cantidad >= item.stock ? "not-allowed" : "pointer" }} disabled={item.cantidad >= item.stock}>+</button>
                    </div>
                    <span style={{ fontSize: "12px", color: item.cantidad >= item.stock ? "#d32f2f" : "#666" }}>
                      {item.cantidad >= item.stock ? "Límite" : `Stock: ${item.stock}`}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* FOOTER */}
        {items.length > 0 && (
          <div style={{ borderTop: "1px solid #eee", paddingTop: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "18px", fontWeight: "bold", marginBottom: "20px" }}>
              <span>Total:</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <button
              onClick={manejarPago}
              style={{ width: "100%", padding: "15px", backgroundColor: "#2196f3", color: "white", border: "none", borderRadius: "10px", fontWeight: "bold", cursor: "pointer", transition: "background 0.3s" }}
              onMouseOver={(e) => e.target.style.backgroundColor = "#1976d2"}
              onMouseOut={(e) => e.target.style.backgroundColor = "#2196f3"}
            >
              PROCEDER AL PAGO
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Carrito;