import React, { useState } from "react";
import MensajeModal from "./MensajeModal";

function AuthModal({ cerrarModal, onLogin }) {
  const [status, setStatus] = useState(null); 
  const [esRegistro, setEsRegistro] = useState(false);
  const [infoModal, setInfoModal] = useState({ tipo: "", titulo: "", texto: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    
    // 1. CAMBIO VITAL: Usar la variable endpoint
    const endpoint = esRegistro ? '/api/auth/register' : '/api/auth/login';
    
    try {
      // 2. CAMBIO VITAL: Cambiamos el string fijo por la variable endpoint
      const res = await fetch(`http://localhost:3000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await res.json();

      if (res.ok) {
        // 3. REVISIÓN DE ESTRUCTURA: 
        // Tu backend devuelve 'usuario', pero aquí buscabas 'result.user'
        const usuarioFinal = result.usuario || result.user;

        setInfoModal({
          tipo: "exito",
          titulo: "¡Excelente!",
          texto: esRegistro 
            ? "Cuenta creada con éxito. Ahora puedes iniciar sesión." 
            : `Bienvenido, ${usuarioFinal?.nombre || 'Usuario'}`
        });
        setStatus("exito");

        setTimeout(() => { 
            if(esRegistro) { 
                setEsRegistro(false); 
                setStatus(null); 
            } else { 
                onLogin(usuarioFinal); 
                cerrarModal(); 
            }
        }, 1500);
      } else { 
        setInfoModal({ 
            tipo: "error", 
            titulo: "Error", 
            texto: result.message || "Credenciales incorrectas" 
        });
        setStatus("error"); 
      }
    } catch (error) { 
        console.error("Error en la conexión:", error);
        setInfoModal({ 
            tipo: "error", 
            titulo: "Error", 
            texto: "No se pudo conectar al servidor de Aqua Clean Pro." 
        });
        setStatus("error");
    }
  };

  if (status) return <MensajeModal info={infoModal} cerrar={() => setStatus(null)} />;

  return (
    <div className="modal-overlay active">
      <div className="modal">
        <span className="cerrar" onClick={cerrarModal}>&times;</span>
        
        <h2>{esRegistro ? 'Crear Cuenta' : 'Iniciar Sesión'}</h2>
        <p className="subtitle">Accede para gestionar tus compras de limpieza.</p>

        <form className="login-form" onSubmit={handleSubmit}>
          {esRegistro && (
            <>
              <label>Nombre Completo</label>
              <input name="nombre" type="text" placeholder="Tu nombre" required />
              <label>Dirección de Envío</label>
              <input name="direccion" type="text" placeholder="Calle, Número, Colonia" required />
            </>
          )}
          
          <label>Correo Electrónico</label>
          <input name="correo" type="email" placeholder="ejemplo@gmail.com" required />
          
          <label>Contraseña</label>
          <input name="password" type="password" placeholder="••••••••" required />
          
          <button type="submit" className="login-btn">
            {esRegistro ? 'Registrarse' : 'Entrar'}
          </button>

          <div className="divider">
            <span>O continúa con</span>
          </div>
          
          <button type="button" className="google-btn">
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width="18" alt="Google" />
            <span>Google</span>
          </button>

          <div className="modal-footer">
            <span className="footer-text">
              {esRegistro ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}
            </span>
            <span onClick={() => { setEsRegistro(!esRegistro); setStatus(null); }} className="link-auth">
              {esRegistro ? 'Inicia Sesión' : 'Regístrate'}
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AuthModal;