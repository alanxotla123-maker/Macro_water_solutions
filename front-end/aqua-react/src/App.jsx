import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";

// Componentes
import Header from "./components/Header";
import AuthModal from "./components/AuthModal";
import MensajeModal from "./components/MensajeModal";

// Páginas
import Home from "./pages/Home";
import ProductosPage from "./pages/ProductosPage";
import Nosotros from "./pages/Nosotros";

// Estilos
import "./index.css"; 

function App() {
  // --- ESTADOS ---
  const [carrito, setCarrito] = useState([]);
  const [carritoAbierto, setCarritoAbierto] = useState(false);
  const [loginAbierto, setLoginAbierto] = useState(false);
  const [mensaje, setMensaje] = useState(null); // Para los mensajes de éxito/error

  // --- EFECTOS ---
  useEffect(() => {
    // Recupera el carrito guardado al iniciar la app
    const guardado = JSON.parse(localStorage.getItem("carrito")) || [];
    setCarrito(guardado);
  }, []);

  // --- LÓGICA DEL CARRITO ---
  const abrirCarrito = () => setCarritoAbierto(true);
  const cerrarCarrito = () => setCarritoAbierto(false);

  const agregarAlCarrito = (producto) => {
    const nuevoCarrito = [...carrito, producto];
    setCarrito(nuevoCarrito);
    localStorage.setItem("carrito", JSON.stringify(nuevoCarrito));
    abrirCarrito();
  };

  const eliminarDelCarrito = (index) => {
    const nuevoCarrito = carrito.filter((_, i) => i !== index);
    setCarrito(nuevoCarrito);
    localStorage.setItem("carrito", JSON.stringify(nuevoCarrito));
  };

  const calcularTotal = () => {
    const subtotal = carrito.reduce((acc, item) => acc + item.precio, 0);
    // Suma el envío de $59.99 solo si hay productos
    return subtotal > 0 ? subtotal + 59.99 : 0;
  };

  // --- LÓGICA DE LOGIN Y MENSAJES ---
  const abrirLogin = () => setLoginAbierto(true);
  const cerrarLogin = () => setLoginAbierto(false);

  const notificar = (tipo, titulo, texto) => {
    setMensaje({ tipo, titulo, texto });
    // Autocierre del mensaje después de 4 segundos
    setTimeout(() => setMensaje(null), 4000);
  };

  return (
    <BrowserRouter>
      {/* HEADER: Recibe funciones para abrir modales y el conteo de items */}
      <Header 
        abrirCarrito={abrirCarrito} 
        abrirLogin={abrirLogin} 
        conteo={carrito.length}
      />

      {/* MODAL DE LOGIN/REGISTRO */}
      {loginAbierto && (
        <AuthModal 
          cerrarModal={cerrarLogin} 
          notificar={notificar} 
        />
      )}

      {/* MODAL DE MENSAJES (Éxito o Error) */}
      {mensaje && (
        <MensajeModal 
          info={mensaje} 
          cerrar={() => setMensaje(null)} 
        />
      )}

      {/* PANEL DEL CARRITO Y OVERLAY */}
      <div 
        className={`overlay ${carritoAbierto ? "activo" : ""}`} 
        onClick={cerrarCarrito}
      />

      <div className={`carrito-panel ${carritoAbierto ? "activo" : ""}`}>
        <div className="carrito-header">
          <h2>🛒 Tu Carrito</h2>
          <span onClick={cerrarCarrito} style={{cursor:"pointer", fontSize:"28px"}}>&times;</span>
        </div>

        <div className="carrito-body">
          {carrito.length === 0 ? (
            <p style={{textAlign: "center", marginTop: "20px"}}>Tu carrito está vacío</p>
          ) : (
            carrito.map((item, index) => (
              <div key={index} className="item-carrito">
                <div>
                  <strong>{item.nombre}</strong>
                  <p>${item.precio.toFixed(2)}</p>
                </div>
                <button onClick={() => eliminarDelCarrito(index)}>🗑️</button>
              </div>
            ))
          )}
        </div>

        <div className="carrito-footer">
          <div className="resumen">
            <div style={{display: "flex", justifyContent: "space-between"}}>
              <span>Envío</span>
              <span>$59.99</span>
            </div>
          </div>
          <div className="total">
            <strong>Total</strong>
            <strong>${calcularTotal().toFixed(2)}</strong>
          </div>
          <button className="btn-pagar" disabled={carrito.length === 0}>
            Proceder al pago
          </button>
        </div>
      </div>

      {/* RUTAS PRINCIPALES */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route 
          path="/productos" 
          element={<ProductosPage agregarAlCarrito={agregarAlCarrito} />} 
        />
        <Route path="/nosotros" element={<Nosotros />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;