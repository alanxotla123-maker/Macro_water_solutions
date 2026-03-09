import React, { useState } from "react";
import "../styles/Contacto.css";

function Contacto() {
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    asunto: "",
    mensaje: ""
  });

  const [enviado, setEnviado] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí irá la lógica para enviar el formulario
    console.log("Formulario enviado:", formData);
    setEnviado(true);
    
    // Limpiar formulario después de 2 segundos
    setTimeout(() => {
      setFormData({
        nombre: "",
        apellido: "",
        email: "",
        telefono: "",
        asunto: "",
        mensaje: ""
      });
      setEnviado(false);
    }, 2000);
  };

  return (
    <section className="contacto-section">
      <div className="contacto-container">
        <h1 className="contacto-title">¿Necesitas Ayuda?</h1>
        <h2 className="contacto-subtitle">Contacta a un Asesor</h2>

        <div className="contacto-content">
          {/* LADO IZQUIERDO: INFORMACIÓN */}
          <div className="contacto-info">
            <h3>Información de Contacto</h3>
            <p>Completa el formulario y nuestro equipo de expertos te responderá en menos de 24 horas. ¡Estamos listos para transformar tu piscina!</p>

            <div className="info-item">
              <i className="fa-solid fa-location-dot"></i>
              <div>
                <h4>Oficina Central</h4>
                <p>Av. del Agua 123, Ciudad Paraíso, CP 90210</p>
              </div>
            </div>

            <div className="info-item">
              <i className="fa-solid fa-phone"></i>
              <div>
                <h4>Llámanos</h4>
                <p>+52 (555) 123-4567</p>
              </div>
            </div>

            <div className="info-item">
              <i className="fa-solid fa-envelope"></i>
              <div>
                <h4>Email</h4>
                <p>ventas@aquapro.com</p>
              </div>
            </div>
          </div>

          {/* LADO DERECHO: FORMULARIO */}
          <div className="contacto-form-container">
            {enviado ? (
              <div className="mensaje-exito">
                <i className="fa-solid fa-check-circle"></i>
                <h4>¡Mensaje enviado!</h4>
                <p>Nos pondremos en contacto pronto.</p>
              </div>
            ) : (
              <form className="contacto-form" onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="nombre">Nombre</label>
                    <input
                      type="text"
                      id="nombre"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      required
                      placeholder=""
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="apellido">Apellido</label>
                    <input
                      type="text"
                      id="apellido"
                      name="apellido"
                      value={formData.apellido}
                      onChange={handleChange}
                      required
                      placeholder=""
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder=""
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="telefono">Teléfono</label>
                    <input
                      type="tel"
                      id="telefono"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleChange}
                      placeholder=""
                    />
                  </div>
                </div>

                <div className="form-group full-width">
                  <label htmlFor="asunto">Asunto</label>
                  <input
                    type="text"
                    id="asunto"
                    name="asunto"
                    value={formData.asunto}
                    onChange={handleChange}
                    required
                    placeholder=""
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="mensaje">Mensaje</label>
                  <textarea
                    id="mensaje"
                    name="mensaje"
                    value={formData.mensaje}
                    onChange={handleChange}
                    required
                    placeholder=""
                    rows="5"
                  ></textarea>
                </div>

                <button type="submit" className="btn-enviar">
                  Enviar Mensaje
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Contacto;