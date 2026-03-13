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
        
        if (esRegistro) {
            data.direccion = "Dirección no ingresada";
        }

        const endpoint = esRegistro ? '/api/auth/register' : '/api/auth/login';
        
        try {
            const res = await fetch(`https://macrowatersolutions.com${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const result = await res.json();

            if (res.ok) {
                const usuarioFinal = result.usuario || result.user;

                // 1. Mostramos el mensaje de éxito primero
                setInfoModal({
                    tipo: "exito",
                    titulo: esRegistro ? "¡Excelente!" : "¡Inicio de Sesión Exitoso!",
                    texto: esRegistro 
                        ? "Cuenta creada con éxito. Ya puedes iniciar sesión." 
                        : `Bienvenido de nuevo, ${usuarioFinal?.nombre || 'Usuario'}.`
                });
                setStatus("exito");

                // 2. Esperamos 1.5 segundos para que el usuario lea el mensaje
                setTimeout(() => { 
                    if(esRegistro) { 
                        setEsRegistro(false); 
                        setStatus(null); 
                    } else { 
                        // 3. AQUÍ es donde disparamos el login y cerramos
                        onLogin(usuarioFinal); 
                        cerrarModal(); 
                    }
                }, 1500);
                
            } else { 
                setInfoModal({ 
                    tipo: "error", 
                    titulo: "Error", 
                    texto: result.message || "Correo o contraseña incorrectos." 
                });
                setStatus("error"); 
            }
        } catch (error) { 
            console.error("Error en la conexión:", error);
            setInfoModal({ 
                tipo: "error", 
                titulo: "Error de Servidor", 
                texto: "Asegúrate de que el servidor esté encendido." 
            });
            setStatus("error");
        }
    };

    // Si hay un estado (exito o error), mostramos el MensajeModal
    if (status) {
        return <MensajeModal info={infoModal} cerrar={() => setStatus(null)} />;
    }

    return (
        <div className="modal-overlay active">
            <div className="modal">
                <span className="cerrar" onClick={cerrarModal}>&times;</span>
                <h2>{esRegistro ? 'Crear Cuenta' : 'Iniciar Sesión'}</h2>
                <p className="subtitle">Accede a Macro Water Solutions</p>

                <form className="login-form" onSubmit={handleSubmit}>
                    {esRegistro && (
                        <>
                            <label>Nombre Completo</label>
                            <input name="nombre" type="text" placeholder="Tu nombre" required />
                        </>
                    )}
                    
                    <label>Correo Electrónico</label>
                    <input name="correo" type="email" placeholder="correo@ejemplo.com" required />
                    
                    <label>Contraseña</label>
                    <input name="password" type="password" placeholder="••••••••" required />
                    
                    <button type="submit" className="login-btn">
                        {esRegistro ? 'Registrarse' : 'Entrar'}
                    </button>

                    <div className="modal-footer">
                        <span className="footer-text">
                            {esRegistro ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}
                        </span>
                        <span onClick={() => { setEsRegistro(!esRegistro); setStatus(null); }} className="link-auth">
                            {esRegistro ? ' Inicia Sesión' : ' Regístrate'}
                        </span>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AuthModal;