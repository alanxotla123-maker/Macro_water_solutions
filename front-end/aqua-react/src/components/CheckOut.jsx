import React from 'react';
import '../styles/Checkout.css';
import { useNavigate } from 'react-router-dom';

const Checkout = ({ carrito = [], usuario, setAuthModalAbierto }) => {
    const navigate = useNavigate();
    
    // --- LÓGICA DE CÁLCULO ---
    const subtotal = carrito.reduce((acc, prod) => {
        const precio = parseFloat(prod.precio) || 0;
        const cantidad = parseInt(prod.cantidad) || 1;
        return acc + (precio * cantidad);
    }, 0);

    const envio = subtotal > 500 || subtotal === 0 ? 0 : 59.99;
    const total = subtotal + envio;

    // --- ESCENARIO 1: NO HAY SESIÓN INICIADA ---
    if (!usuario) {
        return (
            <div className="checkout-empty-state">
                <i className="fa-solid fa-user-lock"></i>
                <h2>¡Casi listo para tu compra!</h2>
                <p>Para poder procesar tu envío de productos de piscina, necesitas iniciar sesión.</p>
                <button className="action-btn" onClick={() => setAuthModalAbierto(true)}>
                    Iniciar Sesión / Registrarse
                </button>
            </div>
        );
    }

    // --- ESCENARIO 2: TIENE SESIÓN PERO NO TIENE DIRECCIÓN ---
    // Verificamos si la dirección es nula, vacía o el texto por defecto
    const tieneDireccion = usuario.direccion && usuario.direccion !== "Dirección no ingresada";

    if (!tieneDireccion) {
        return (
            <div className="checkout-empty-state">
                <i className="fa-solid fa-truck-fast"></i>
                <h2>¿A dónde enviamos tu pedido?</h2>
                <p>Parece que aún no has configurado una dirección de entrega en tu perfil.</p>
                <button className="action-btn" onClick={() => navigate('/perfil')}>
                    Configurar Dirección de Envío
                </button>
            </div>
        );
    }

    // --- ESCENARIO 3: TODO CORRECTO (VISTA DE PAGO) ---
    return (
        <div className="checkout-container">
            <div className="checkout-content">
                
                <div className="delivery-section">
                    <h2 className="section-title">Revisa la forma de entrega</h2>
                    
                    <div className="delivery-card">
                        <div className="delivery-header">
                            <div className="radio-group">
                                <input type="radio" checked readOnly name="entrega" />
                                <strong>Enviar a domicilio</strong>
                            </div>
                            <span className="free-tag">
                                {envio === 0 ? 'Gratis' : `$${envio.toFixed(2)}`}
                            </span>
                        </div>
                        
                        <div className="address-details">
                            <p className="address-text">
                                <i className="fa-solid fa-location-dot"></i> {usuario.direccion}
                            </p>
                            <p className="user-info-text">
                                {usuario.nombre} - {usuario.correo}
                            </p>
                            <button className="edit-address-link" onClick={() => navigate('/perfil')}>
                                Modificar domicilio o elegir otro
                            </button>
                        </div>
                    </div>

                    <button className="continue-btn-main" onClick={() => alert("Próximamente: Mercado Pago")}>
                        Continuar con el pago
                    </button>
                </div>

                <div className="summary-section">
                    <div className="summary-card">
                        <h3>Resumen de compra</h3>
                        <div className="summary-list">
                            {carrito.map((item, index) => (
                                <div key={index} className="summary-item">
                                    <span>{item.cantidad || 1}x {item.nombre}</span>
                                    <span>${(parseFloat(item.precio || 0) * (item.cantidad || 1)).toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                        <div className="summary-divider"></div>
                        <div className="summary-row">
                            <span>Productos ({carrito.length})</span>
                            <span>${subtotal.toFixed(2)}</span>
                        </div>
                        <div className="summary-row">
                            <span>Envío</span>
                            <span className={envio === 0 ? 'green-text' : ''}>
                                {envio === 0 ? 'Gratis' : `$${envio.toFixed(2)}`}
                            </span>
                        </div>
                        <div className="summary-total-row">
                            <span>Total</span>
                            <span>${total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;