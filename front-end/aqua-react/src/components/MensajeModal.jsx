function MensajeModal({ info, cerrar }) {
  return (
    <div className="modal-overlay active" id="modalMensaje">
      <div className="modal">
        <span className="cerrar" onClick={cerrar}>×</span>
        <div style={{ textAlign: "center", fontSize: "40px", marginBottom: "10px" }}>
          {info.tipo === "exito" ? "✓" : "✕"}
        </div>
        <h2 style={{ textAlign: "center" }}>{info.titulo}</h2>
        <p style={{ textAlign: "center", marginTop: "10px" }}>{info.texto}</p>
      </div>
    </div>
  );
}

export default MensajeModal;