import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const PagoExitoso = ({ vaciarCarrito }) => {
    const navigate = useNavigate();

    useEffect(() => {
        // Al cargar la página de éxito, limpiamos el estado local y localStorage
        vaciarCarrito();
        
        // Redirigir al inicio después de 5 segundos
        const timer = setTimeout(() => navigate('/'), 5000);
        return () => clearTimeout(timer);
    }, [vaciarCarrito, navigate]);

    return (
        <div style={{ textAlign: 'center', padding: '100px' }}>
            <i className="fa-solid fa-circle-check" style={{ fontSize: '50px', color: 'green' }}></i>
            <h1>¡Gracias por tu compra!</h1>
            <p>Tu pago ha sido procesado con éxito.</p>
            <p>Serás redirigido al inicio en unos segundos...</p>
            <button className="action-btn" onClick={() => navigate('/')}>Volver a la tienda</button>
        </div>
    );
};

export default PagoExitoso;