import { useState } from "react";

function AuthModal({ cerrarModal, notificar }) {
  // Estado para saber si estamos en modo "Login" o "Registro"
  const [esRegistro, setEsRegistro] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Captura de datos del formulario de forma sencilla
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    // Determinamos el endpoint basado en el estado
    const endpoint = esRegistro ? "/api/auth/register" : "/api/auth/login";

    try {
      const res = await fetch(`http://localhost:3000${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (res.ok) {
        cerrarModal();
        // Llamamos a la notificación de éxito que configuramos en App.jsx
        notificar(
          "exito", 
          "¡Excelente!", 
          esRegistro ? "Tu cuenta ha sido creada." : "Has iniciado sesión correctamente."
        );
      } else {
        // Notificación de error si el servidor responde mal
        notificar("error", "Vuelve a intentarlo", result.message || "Credenciales incorrectas");
      }
    } catch (error) {
      notificar("error", "Error de conexión", "No se pudo conectar con el servidor.");
    }
  };

  return (
    <div className="modal-overlay active">
      <div className="modal">
        {/* Botón de cerrar */}
        <span className="cerrar" onClick={cerrarModal}>&times;</span>

        <form className="login-form" onSubmit={handleSubmit}>
          <h2>{esRegistro ? "Crear cuenta" : "Iniciar sesión"}</h2>
          <p className="subtitle">
            {esRegistro 
              ? "Regístrate para disfrutar de Aqua Clean Pro." 
              : "Accede para gestionar tus compras."}
          </p>

          {/* Campos adicionales si es registro */}
          {esRegistro && (
            <>
              <label>Nombre Completo</label>
              <input name="nombre" type="text" placeholder="Tu nombre" required />
              
              <label>Dirección</label>
              <input name="direccion" type="text" placeholder="Calle, Número, Ciudad" required />
            </>
          )}

          <label>Correo Electrónico</label>
          <input name="correo" type="email" placeholder="ejemplo@gmail.com" required />

          <label>Contraseña</label>
          <input name="password" type="password" placeholder="**********" required />

          <button type="submit" className="login-btn">
            {esRegistro ? "Registrarme" : "Entrar"}
          </button>

          <div className="divider">
            <span>O continúa con</span>
          </div>

          <button 
            type="button" 
            className="google-btn"
            onClick={() => notificar("exito", "Google", "Próximamente disponible")}
          >
            <img 
              src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg" 
              width="18" 
              alt="G" 
            />
            Google
          </button>

          <p className="register-text">
            {esRegistro ? "¿Ya tienes cuenta?" : "¿No tienes cuenta?"} {" "}
            <a 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                setEsRegistro(!esRegistro); // Cambia el modo
              }}
            >
              {esRegistro ? "Inicia Sesión" : "Regístrate aquí"}
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}

export default AuthModal;