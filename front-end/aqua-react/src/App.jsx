import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Header from "./components/Header";
import AuthModal from "./components/AuthModal";
import Carrito from "./components/Carrito";
import Home from "./pages/Home";
import ProductosPage from "./pages/ProductosPage";
import Nosotros from "./pages/Nosotros";
import Adminagregar from "./pages/Adminagregar";

import "./index.css";
import "./styles/index.css";
import "./productos.css";
import "./styles/admin_agregar.css";
function App() {
  const [usuario, setUsuario] = useState(null);
  const [loginAbierto, setLoginAbierto] = useState(false);
  const [carrito, setCarrito] = useState([]);
  const [carritoAbierto, setCarritoAbierto] = useState(false);

  useEffect(() => {
    const sesion = JSON.parse(localStorage.getItem("usuario_sesion"));
    if (sesion) setUsuario(sesion);
    const cart = JSON.parse(localStorage.getItem("carrito_pro"));
    if (cart) setCarrito(cart);
  }, []);

  // Guardar carrito en cada cambio
  useEffect(() => {
    localStorage.setItem("carrito_pro", JSON.stringify(carrito));
  }, [carrito]);

  const agregarAlCarrito = (producto) => {
    setCarrito([...carrito, producto]);
    setCarritoAbierto(true); // <--- ESTO ABRE EL CARRITO AUTOMÁTICAMENTE
  };

  const cerrarSesion = () => {
    setUsuario(null);
    setCarrito([]);
    localStorage.clear();
    alert("Sesión cerrada");
  };

  return (
    <BrowserRouter>
      <Header 
        usuario={usuario} 
        abrirLogin={() => setLoginAbierto(true)} 
        cerrarSesion={cerrarSesion}
        abrirCarrito={() => setCarritoAbierto(true)}
        conteo={carrito.length}
      />

      {/* Fondo oscuro del carrito */}
      <div className={`overlay ${carritoAbierto ? 'activo' : ''}`} onClick={() => setCarritoAbierto(false)}></div>
      
      <Carrito 
        abierto={carritoAbierto} 
        cerrar={() => setCarritoAbierto(false)} 
        items={carrito} 
        eliminar={(i) => setCarrito(carrito.filter((_, idx) => idx !== i))} 
      />

      {loginAbierto && (
        <AuthModal 
          cerrarModal={() => setLoginAbierto(false)} 
          onLogin={(d) => { setUsuario(d); localStorage.setItem("usuario_sesion", JSON.stringify(d)); }} 
        />
      )}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/productos" element={<ProductosPage agregarAlCarrito={agregarAlCarrito} />} />
        <Route path="/nosotros" element={<Nosotros />} />
        
        {/* PROTECCIÓN ADMIN: Si no es admin, lo manda al inicio */}
        <Route 
          path="/admin" 
          element={usuario?.rol === "admin" ? <Adminagregar /> : <Navigate to="/" />} 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;