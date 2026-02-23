import React from 'react';

function MensajeModal({ info, cerrar, onConfirmar }) {
  const esExito = info.tipo === "exito";
  const esPregunta = info.tipo === "pregunta";

  return (
    <div className="modal-overlay active">
      <div className="modal-diseno-nuevo">
        {/* Círculo con Icono dinámico */}
        <div className={`icono-circulo ${info.tipo}`}>
          <i className={
            esExito ? "fa-solid fa-check" : 
            esPregunta ? "fa-solid fa-trash-can" : 
            "fa-solid fa-xmark"
          }></i>
        </div>

        <h2 className="modal-titulo-nuevo">{info.titulo}</h2>
        <p className="modal-texto-nuevo">{info.texto}</p>

        <div className="modal-acciones-dobles">
          {esPregunta ? (
            <>
              <button className="btn-cancelar-gris" onClick={cerrar}>
                Cancelar
              </button>
              <button className="btn-confirmar-rojo" onClick={onConfirmar}>
                Sí, Eliminar
              </button>
            </>
          ) : (
            <button className="btn-accion-azul" onClick={cerrar}>
              {esExito ? "Entendido" : "Intentar de nuevo"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default MensajeModal;