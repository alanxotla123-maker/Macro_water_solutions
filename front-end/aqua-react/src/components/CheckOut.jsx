import React from 'react';
import '../styles/Checkout.css';

const Checkout = ({ carrito = [], usuario }) => {
    
    // --- LÓGICA DE CÁLCULO SEGURA ---
    const subtotal = carrito.reduce((acc, prod) => {
        // Convertimos a número por si vienen como string de la DB o el Front
        const precio = parseFloat(prod.precio) || 0;
        const cantidad = parseInt(prod.cantidad) || 1; // Si no hay cantidad, asumimos 1
        return acc + (precio * cantidad);
    }, 0);

    const envio = subtotal > 500 || subtotal === 0 ? 0 : 59.99;
    const total = subtotal + envio;

    // Si no hay usuario cargado aún
    if (!usuario) return <div className="loading">Cargando datos de envío...</div>;

    return (
        <div className="checkout-container">
            <div className="checkout-content">
                
                {/* SECCIÓN IZQUIERDA: DIRECCIÓN Y ENTREGA */}
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
                                <i className="fa-solid fa-location-dot"></i> {usuario.direccion || "No has registrado una dirección aún."}
                            </p>
                            <p className="user-info-text">
                                {usuario.nombre} - {usuario.correo}
                            </p>
                            <button className="edit-address-link" onClick={() => window.location.href='/perfil'}>
                                Modificar domicilio o elegir otro
                            </button>
                        </div>
                    </div>

                    <button className="continue-btn-main" onClick={() => alert("Próximamente: Integración con pasarela de pago")}>
                        Continuar
                    </button>
                </div>

                {/* SECCIÓN DERECHA: RESUMEN DE COMPRA */}
                <div className="summary-section">
                    <div className="summary-card">
                        <h3>Resumen de compra</h3>
                        
                        <div className="summary-list">
                            {carrito.length === 0 ? (
                                <p className="empty-msg">Tu carrito está vacío</p>
                            ) : (
                                carrito.map((item, index) => (
                                    <div key={index} className="summary-item">
                                        <span>{item.cantidad || 1}x {item.nombre}</span>
                                        <span>${(parseFloat(item.precio || 0) * (item.cantidad || 1)).toFixed(2)}</span>
                                    </div>
                                ))
                            )}
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
                            <span>Total </span>
                            <span>${total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Checkout;