import React, { useState } from 'react';
import '../styles/Checkout.css';
import { useNavigate } from 'react-router-dom';
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react';

// INICIALIZACIÓN CON TU PUBLIC KEY DE PRODUCCIÓN
initMercadoPago('APP_USR-4f05e260-c10e-435a-9677-32dcda03f947'); 

const Checkout = ({ carrito = [], usuario, setAuthModalAbierto }) => {
    const navigate = useNavigate();
    const [preferenceId, setPreferenceId] = useState(null);
    const [cargando, setCargando] = useState(false);

    // --- LÓGICA DE CÁLCULO CON DESCUENTO ---
    const subtotal = carrito.reduce((acc, prod) => {
        const precioOriginal = parseFloat(prod.precio) || 0;
        const descuento = prod.descuento || 0;
        const precioFinalItem = precioOriginal * (1 - descuento / 100);
        const cantidad = parseInt(prod.cantidad) || 1;
        return acc + (precioFinalItem * cantidad);
    }, 0);

    // COSTO DE ENVÍO ELIMINADO PARA PRUEBAS
    const envio = 0; 
    const total = subtotal + envio;

    const handlePago = async () => {
        setCargando(true);
        
        // Mapeamos los items aplicando el descuento
        const itemsParaPago = carrito.map(item => ({
            ...item,
            precio: (item.precio * (1 - (item.descuento || 0) / 100)).toFixed(2)
        }));

        try {
            const response = await fetch("https://macrowatersolutions.com/api/create_preference", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    items: itemsParaPago, 
                    envio: 0, // Envío a 0 para Mercado Pago
                    userId: usuario.id 
                }),
            });
            
            const data = await response.json();
            if (data.id) {
                setPreferenceId(data.id);
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Hubo un error al conectar con Mercado Pago");
        } finally {
            setCargando(false);
        }
    };

    if (!usuario) {
        return (
            <div className="checkout-empty-state">
                <i className="fa-solid fa-user-lock"></i>
                <h2>¡Casi listo para tu compra!</h2>
                <p>Inicia sesión para procesar tu envío.</p>
                <button className="action-btn" onClick={() => setAuthModalAbierto(true)}>Iniciar Sesión</button>
            </div>
        );
    }

    const tieneDireccion = usuario.direccion && usuario.direccion !== "Dirección no ingresada";
    if (!tieneDireccion) {
        return (
            <div className="checkout-empty-state">
                <i className="fa-solid fa-truck-fast"></i>
                <h2>¿A dónde enviamos tu pedido?</h2>
                <p>Configura una dirección de entrega en tu perfil.</p>
                <button className="action-btn" onClick={() => navigate('/perfil')}>Configurar Dirección</button>
            </div>
        );
    }

    return (
        <div className="checkout-container">
            <div className="checkout-content">
                <div className="delivery-section">
                    <h2 className="section-title">Revisa la forma de entrega</h2>
                    <div className="delivery-card">
                        <div className="delivery-header">
                            <div className="radio-group">
                                <input type="radio" checked readOnly />
                                <strong>Enviar a domicilio</strong>
                            </div>
                            <span className="free-tag">Gratis</span>
                        </div>
                        <div className="address-details">
                            <p className="address-text"><i className="fa-solid fa-location-dot"></i> {usuario.direccion}</p>
                            <p className="user-info-text">{usuario.nombre} - {usuario.correo}</p>
                            <button className="edit-address-link" onClick={() => navigate('/perfil')}>Modificar domicilio</button>
                        </div>
                    </div>

                    {!preferenceId ? (
                        <button className="continue-btn-main" onClick={handlePago} disabled={cargando || carrito.length === 0}>
                            {cargando ? "Preparando pago..." : "Continuar con el pago"}
                        </button>
                    ) : (
                        <div className="mp-button-container" style={{ marginTop: '20px' }}>
                            <Wallet initialization={{ preferenceId: preferenceId }} />
                        </div>
                    )}
                </div>

                <div className="summary-section">
                    <div className="summary-card">
                        <h3>Resumen de compra</h3>
                        <div className="summary-list">
                            {carrito.map((item, index) => {
                                const pFinal = item.precio * (1 - (item.descuento || 0) / 100);
                                return (
                                    <div key={index} className="summary-item">
                                        <span>{item.cantidad || 1}x {item.nombre}</span>
                                        <div style={{textAlign: 'right'}}>
                                            {item.descuento > 0 && <small style={{display: 'block', textDecoration: 'line-through', color: '#999'}}>${item.precio}</small>}
                                            <span>${(pFinal * item.cantidad).toFixed(2)}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="summary-divider"></div>
                        <div className="summary-row">
                            <span>Productos ({carrito.length})</span>
                            <span>${subtotal.toFixed(2)}</span>
                        </div>
                        <div className="summary-row">
                            <span>Envío</span>
                            <span className="green-text">Gratis</span>
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