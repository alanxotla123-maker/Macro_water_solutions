import React, { useState } from "react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import MensajeModal from "./MensajeModal";
 
const GOOGLE_CLIENT_ID = "561610268736-8eam83vcf2694ihti70pb4dc4t64k6u5.apps.googleusercontent.com";
 
function AuthModal({ cerrarModal, onLogin }) {
    const [status, setStatus] = useState(null);
    const [esRegistro, setEsRegistro] = useState(false);
    const [infoModal, setInfoModal] = useState({ tipo: "", titulo: "", texto: "" });
 
    // ── Login/Registro normal ──────────────────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
 
        if (esRegistro) {
            data.direccion = "Dirección no ingresada";
        }
 
        const endpoint = esRegistro ? "/api/auth/register" : "/api/auth/login";
 
        try {
            const res = await fetch(`https://macrowatersolutions.com${endpoint}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
 
            const result = await res.json();
 
            if (res.ok) {
                const usuarioFinal = result.usuario || result.user;
                setInfoModal({
                    tipo: "exito",
                    titulo: "¡Excelente!",
                    texto: esRegistro
                        ? "Cuenta creada con éxito. Ya puedes iniciar sesión."
                        : `Bienvenido de nuevo, ${usuarioFinal?.nombre || "Usuario"}`,
                });
                setStatus("exito");
 
                setTimeout(() => {
                    if (esRegistro) {
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
                    texto: result.message || "Correo o contraseña incorrectos.",
                });
                setStatus("error");
            }
        } catch (error) {
            console.error("Error en la conexión:", error);
            setInfoModal({
                tipo: "error",
                titulo: "Error de Servidor",
                texto: "Asegúrate de que el servidor esté encendido.",
            });
            setStatus("error");
        }
    };
 
    // ── Login con Google (éxito) ───────────────────────────────────────────
    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            const res = await fetch("https://macrowatersolutions.com/api/auth/google", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token: credentialResponse.credential }),
            });
 
            const result = await res.json();
 
            if (res.ok) {
                const usuarioFinal = result.usuario || result.user;
                setInfoModal({
                    tipo: "exito",
                    titulo: "¡Bienvenido!",
                    texto: `Hola, ${usuarioFinal?.nombre || "Usuario"}`,
                });
                setStatus("exito");
                setTimeout(() => {
                    onLogin(usuarioFinal);
                    cerrarModal();
                }, 1500);
            } else {
                setInfoModal({
                    tipo: "error",
                    titulo: "Error",
                    texto: result.message || "No se pudo iniciar sesión con Google.",
                });
                setStatus("error");
            }
        } catch (error) {
            console.error("Error Google login:", error);
            setInfoModal({
                tipo: "error",
                titulo: "Error de Servidor",
                texto: "No se pudo conectar con el servidor.",
            });
            setStatus("error");
        }
    };
 
    // ── Login con Google (error) ───────────────────────────────────────────
    const handleGoogleError = () => {
        setInfoModal({
            tipo: "error",
            titulo: "Error",
            texto: "No se pudo iniciar sesión con Google. Intenta de nuevo.",
        });
        setStatus("error");
    };
 
    if (status) return <MensajeModal info={infoModal} cerrar={() => setStatus(null)} />;
 
    return (
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <div className="modal-overlay active">
                <div className="modal">
                    <span className="cerrar" onClick={cerrarModal}>&times;</span>
                    <h2>{esRegistro ? "Crear Cuenta" : "Iniciar Sesión"}</h2>
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
                            {esRegistro ? "Registrarse" : "Entrar"}
                        </button>
                    </form>
 
                    {/* ── Separador ── */}
                    <div className="google-divider">
                        <span>o continúa con</span>
                    </div>
 
                    {/* ── Botón Google ── */}
                    <div className="google-btn-wrapper">
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={handleGoogleError}
                            text={esRegistro ? "signup_with" : "signin_with"}
                            shape="rectangular"
                            locale="es"
                        />
                    </div>
 
                    <div className="modal-footer">
                        <span className="footer-text">
                            {esRegistro ? "¿Ya tienes cuenta?" : "¿No tienes cuenta?"}
                        </span>
                        <span
                            onClick={() => { setEsRegistro(!esRegistro); setStatus(null); }}
                            className="link-auth"
                        >
                            {esRegistro ? " Inicia Sesión" : " Regístrate"}
                        </span>
                    </div>
                </div>
            </div>
        </GoogleOAuthProvider>
    );
}
 
export default AuthModal;