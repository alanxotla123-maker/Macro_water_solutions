import { useState } from "react";

function AuthModal({ cerrarModal }) {
  const [esRegistro, setEsRegistro] = useState(false); // Estado para alternar entre login y registro

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    const endpoint = esRegistro ? "/api/auth/register" : "/api/auth/login";

    try {
      const res = await fetch(`https://macrowatersolutions.com${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (res.ok) {
        alert(esRegistro ? "Usuario registrado correctamente" : "Inicio de sesión exitoso");
        cerrarModal();
      } else {
        alert(result.message || "Error en la operación");
      }
    } catch (error) {
      alert("Error conectando con el servidor");
    }
  };

  return (
    <div className="modal-overlay active">
      <div className="modal">
        <span className="cerrar" onClick={cerrarModal}>×</span>

        <form className="login-form" onSubmit={handleSubmit}>
          <h2>{esRegistro ? "Crear cuenta" : "Iniciar sesión"}</h2>
          <p className="subtitle">Accede para gestionar tus compras.</p>

          {esRegistro && (
            <>
              <label>Nombre</label>
              <input name="nombre" type="text" placeholder="Nombre" required />
              <label>Dirección</label>
              <input name="direccion" type="text" placeholder="Dirección" required />
            </>
          )}

          <label>Correo</label>
          <input name="correo" type="email" placeholder="ejemplo@gmail.com" required />

          <label>Contraseña</label>
          <input name="password" type="password" placeholder="**********" required />

          <button type="submit" className="login-btn">
            {esRegistro ? "Registrarme" : "Entrar"}
          </button>

          <div className="divider"><span>O continúa con</span></div>

          <button type="button" className="google-btn">
            <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg" width="18" alt="G" />
            Google
          </button>

          <p className="register-text">
            {esRegistro ? "¿Ya tienes cuenta?" : "¿No tienes cuenta?"} {" "}
            <a href="#" onClick={(e) => { e.preventDefault(); setEsRegistro(!esRegistro); }}>
              {esRegistro ? "Regresar" : "Crear cuenta"}
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}

export default AuthModal;