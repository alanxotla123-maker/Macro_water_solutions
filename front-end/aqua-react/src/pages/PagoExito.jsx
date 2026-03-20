import React, { useEffect, useRef } from 'react'; // Agregamos useRef
import { useNavigate } from 'react-router-dom';

const PagoExitoso = ({ vaciarCarrito }) => {
    const navigate = useNavigate();
    const ejecutado = useRef(false); // Evita que se ejecute dos veces

    useEffect(() => {
        if (!ejecutado.current) {
            vaciarCarrito();
            ejecutado.current = true;

            const timer = setTimeout(() => {
                navigate('/');
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [vaciarCarrito, navigate]);

    return (
        <div style={{ textAlign: 'center', padding: '100px', color: 'black' }}>
            <i className="fa-solid fa-circle-check" style={{ fontSize: '60px', color: 'green', marginBottom: '20px' }}></i>
            <h1>¡Gracias por tu compra!</h1>
            <p>Tu pago ha sido procesado con éxito.</p>
            <p>Tu carrito se ha limpiado y serás redirigido al inicio en 5 segundos...</p>
            <button 
                onClick={() => navigate('/')}
                style={{ marginTop: '20px', padding: '10px 20px', cursor: 'pointer', backgroundColor: '#2196f3', color: 'white', border: 'none', borderRadius: '5px' }}
            >
                Volver a la tienda ahora
            </button>
        </div>
    );
};

export default PagoExitoso;