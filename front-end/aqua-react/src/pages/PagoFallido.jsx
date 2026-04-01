import React from 'react';
import { useNavigate } from 'react-router-dom';

const PagoFallido = () => {
    const navigate = useNavigate();
    return (
        <div style={{ textAlign: 'center', padding: '100px' }}>
            <h1 style={{ color: 'red' }}>El pago falló</h1>
            <p>Hubo un problema procesando tu transacción. Intenta de nuevo.</p>
            <button onClick={() => navigate('/checkout')}>Reintentar pago</button>
        </div>
    );
};
export default PagoFallido;