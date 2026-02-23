import React from "react";

function Carrito({ 
  abierto = false, 
  cerrar = () => {}, 
  items = [], 
  eliminar = () => {} 
}) {

  const total = items.reduce(
    (acc, item) => acc + parseFloat(item?.precio || 0),
    0
  );

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
          width: "350px",
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
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid #eee",
            paddingBottom: "10px",
          }}
        >
          <h2 style={{ margin: 0 }}>Tu Carrito</h2>
          <button
            onClick={cerrar}
            style={{
              fontSize: "24px",
              border: "none",
              background: "none",
              cursor: "pointer",
            }}
          >
            &times;
          </button>
        </div>

        {/* BODY */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            marginTop: "20px",
          }}
        >
          {items.length === 0 ? (
            <p style={{ textAlign: "center", color: "#666" }}>
              El carrito está vacío
            </p>
          ) : (
            items.map((item, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "15px",
                  padding: "10px",
                  backgroundColor: "#f9f9f9",
                  borderRadius: "8px",
                }}
              >
                <div>
                  <div style={{ fontWeight: "bold" }}>
                    {item?.nombre}
                  </div>
                  <div style={{ color: "#2196f3" }}>
                    ${item?.precio}
                  </div>
                </div>

                <button
                  onClick={() => eliminar(index)}
                  style={{
                    backgroundColor: "#ff6b6b",
                    border: "none",
                    borderRadius: "5px",
                    color: "white",
                    cursor: "pointer",
                    padding: "5px 10px",
                  }}
                >
                  <i className="fa-solid fa-trash"></i>
                </button>
              </div>
            ))
          )}
        </div>

        {/* FOOTER */}
        {items.length > 0 && (
          <div
            style={{
              borderTop: "1px solid #eee",
              paddingTop: "20px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "18px",
                fontWeight: "bold",
                marginBottom: "20px",
              }}
            >
              <span>Total:</span>
              <span>${total.toFixed(2)}</span>
            </div>

            <button
              style={{
                width: "100%",
                padding: "15px",
                backgroundColor: "#2196f3",
                color: "white",
                border: "none",
                borderRadius: "10px",
                fontWeight: "bold",
                cursor: "pointer",
              }}
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