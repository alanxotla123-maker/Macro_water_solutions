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
  const [emailError, setEmailError] = useState("");

  // Validación de formato de email
  const isValidEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
    return regex.test((email || "").trim());
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let val = value;
    // Solo números para el teléfono
    if (name === "telefono") val = value.replace(/\D/g, "").slice(0, 10);
    
    setFormData({ ...formData, [name]: val });
    if (name === "email") setEmailError("");
  };

  const handleEmailBlur = () => {
    if (formData.email && !isValidEmail(formData.email)) {
      setEmailError("Introduce un email válido");
    } else {
      setEmailError("");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isValidEmail(formData.email)) {
      setEmailError("Email no válido");
      return;
    }

    // --- CONFIGURACIÓN DE WHATSAPP ---
    const numeroTelefono = "4422752025"; 
    const textoWhatsApp = 
      `*Macro Water Solutions - Nuevo Mensaje*%0A%0A` +
      `*Cliente:* ${formData.nombre} ${formData.apellido}%0A` +
      `*Email:* ${formData.email}%0A` +
      `*WhatsApp:* ${formData.telefono}%0A` +
      `*Asunto:* ${formData.asunto}%0A` +
      `*Mensaje:* ${formData.mensaje}`;

    // Abrir link de WhatsApp en nueva pestaña
    window.open(`https://wa.me/${numeroTelefono}?text=${textoWhatsApp}`, "_blank");

    setEnviado(true);
    
    // Resetear formulario después de 3 segundos
    setTimeout(() => {
      setFormData({ nombre: "", apellido: "", email: "", telefono: "", asunto: "", mensaje: "" });
      setEnviado(false);
    }, 3000);
  };

  return (
    <section className="contacto-section">
      <div className="contacto-container">
        <div className="contacto-header view-fade-in">
            <span className="contacto-tag">Expertos en Piscinas</span>
            <h2 className="contacto-subtitle">¿Listo para mejorar tu agua?</h2>
        </div>

        <div className="contacto-content">
          {/* LADO IZQUIERDO: INFORMACIÓN DE LA EMPRESA */}
          <div className="contacto-info">
            <div className="info-content-wrap">
                <h3>Hablemos.</h3>
                <p>Soluciones técnicas y equipos de alta gama para el mantenimiento de albercas industriales y residenciales.</p>

                <div className="info-item">
                    <i className="fa-solid fa-map-location-dot"></i>
                    <div>
                        <h4>Ubicación</h4>
                        <p>Av. del Agua 123, Qro, MX</p>
                    </div>
                </div>

                <div className="info-item">
                    <i className="fa-solid fa-headset"></i>
                    <div>
                        <h4>Soporte Técnico</h4>
                        <p>+52 442 275 2025</p>
                    </div>
                </div>

                <div className="info-item">
                    <i className="fa-solid fa-shield-halved"></i>
                    <div>
                        <h4>Garantía de Calidad</h4>
                        <p>ventas@macrowater.com</p>
                    </div>
                </div>
            </div>
          </div>

          {/* LADO DERECHO: FORMULARIO DE CONTACTO */}
          <div className="contacto-form-container">
            {enviado ? (
              <div className="mensaje-exito view-fade-in">
                <i className="fa-solid fa-circle-check"></i>
                <h4>¡Todo listo!</h4>
                <p>Se ha preparado tu mensaje para enviarlo por WhatsApp. En breve un asesor te atenderá.</p>
              </div>
            ) : (
              <form className="contacto-form" onSubmit={handleSubmit} autoComplete="off">
                <div className="form-row">
                  <div className="form-group">
                    <label>Nombre</label>
                    <input type="text" name="nombre" placeholder="Tu nombre" value={formData.nombre} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label>Apellido</label>
                    <input type="text" name="apellido" placeholder="Tu apellido" value={formData.apellido} onChange={handleChange} required />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Email Corporativo</label>
                    <input 
                        type="email" 
                        name="email" 
                        placeholder="ejemplo@correo.com" 
                        value={formData.email} 
                        onChange={handleChange} 
                        onBlur={handleEmailBlur}
                        className={emailError ? "input-error" : ""}
                        required 
                    />
                    {emailError && <span className="email-error-msg">{emailError}</span>}
                  </div>
                  <div className="form-group">
                    <label>WhatsApp / Teléfono</label>
                    <input type="tel" name="telefono" placeholder="10 dígitos" value={formData.telefono} onChange={handleChange} inputMode="numeric" maxLength={10} />
                  </div>
                </div>

                <div className="form-group">
                  <label>¿En qué podemos ayudarte?</label>
                  <input type="text" name="asunto" placeholder="Ej: Cotización de filtros" value={formData.asunto} onChange={handleChange} required />
                </div>

                <div className="form-group">
                  <label>Mensaje detallado</label>
                  <textarea name="mensaje" placeholder="Cuéntanos más sobre tus necesidades..." value={formData.mensaje} onChange={handleChange} required rows="4"></textarea>
                </div>

                <button type="submit" className="btn-enviar">
                  Hablar con un asesor <i className="fa-brands fa-whatsapp"></i>
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