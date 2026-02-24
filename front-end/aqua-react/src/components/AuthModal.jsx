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
        
        // El prefijo /api/auth ya lo tiene el server, aquí solo elegimos el final
        const endpoint = esRegistro ? '/api/auth/register' : '/api/auth/login';
        
        try {
            // CAMBIO CLAVE: Puerto 8080
            const res = await fetch(`http://localhost:3000${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            // Si el res.ok es falso, atrapamos el error antes de que truene el JSON
            const result = await res.json();

            if (res.ok) {
                const usuarioFinal = result.usuario || result.user;

                setInfoModal({
                    tipo: "exito",
                    titulo: "¡Excelente!",
                    texto: esRegistro 
                        ? "Cuenta creada con éxito. Ya puedes iniciar sesión." 
                        : `Bienvenido de nuevo, ${usuarioFinal?.nombre || 'Usuario'}`
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
                    texto: result.message || "Correo o contraseña incorrectos." 
                });
                setStatus("error"); 
            }
        } catch (error) { 
            console.error("Error en la conexión:", error);
            setInfoModal({ 
                tipo: "error", 
                titulo: "Error de Servidor", 
                texto: "Asegúrate de que el servidor en el puerto 8080 esté encendido." 
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
                <p className="subtitle">Accede a Aqua Clean Pro</p>

                <form className="login-form" onSubmit={handleSubmit}>
                    {esRegistro && (
                        <>
                            <label>Nombre Completo</label>
                            <input name="nombre" type="text" placeholder="Tu nombre" required />
                            <label>Dirección</label>
                            <input name="direccion" type="text" placeholder="Tu dirección" required />
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