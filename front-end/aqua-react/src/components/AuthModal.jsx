import React, { useState } from "react";

function AuthModal({ cerrarModal, onLogin }) {
  const [status, setStatus] = useState(null); 
  const [esRegistro, setEsRegistro] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    const endpoint = esRegistro ? '/api/auth/register' : '/api/auth/login';
    
    try {
      const res = await fetch(`http://localhost:3000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (res.ok) {
        const result = await res.json();
        setStatus("exito");
        setTimeout(() => { 
            if(esRegistro) { 
              setEsRegistro(false); 
              setStatus(null); 
            } else { 
              onLogin(result.user); 
              cerrarModal(); 
            }
        }, 1500);
      } else { setStatus("error"); }
    } catch (err) {
      console.error("Error de conexión:", err);
      setStatus("error");
    }
  };

  if (status) {
    return (
      <div className="modal-overlay active">
        <div className="modal">
          <div className={`circle ${status}`}>
            <i className={status === 'exito' ? "fa-solid fa-check" : "fa-solid fa-xmark"}></i>
          </div>
          <h2>{status === 'exito' ? '¡Éxito!' : 'Error'}</h2>
          <button className="login-btn" onClick={() => setStatus(null)}>REGRESAR</button>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay active">
      <div className="modal">
        <span className="cerrar" onClick={cerrarModal}>&times;</span>
        <h2>{esRegistro ? 'Crea tu cuenta' : '¡Bienvenido!'}</h2>
        <p className="subtitle">Aqua Clean Pro</p>
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
          <input name="correo" type="email" placeholder="ejemplo@aqua.pro" required />
          <label>Contraseña</label>
          <input name="password" type="password" placeholder="••••••••" required />
          <button type="submit" className="login-btn">{esRegistro ? 'REGISTRARME' : 'INGRESAR'}</button>
          <div className="divider">O</div>
          <p className="register-text">
            {esRegistro ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'} 
            <span onClick={() => setEsRegistro(!esRegistro)} style={{color: '#2196f3', cursor: 'pointer', fontWeight: 'bold'}}>
              {esRegistro ? ' Inicia Sesión' : ' Regístrate aquí'}
            </span>
          </p>
        </form>
      </div>
    </div>
  );
}

export default AuthModal;