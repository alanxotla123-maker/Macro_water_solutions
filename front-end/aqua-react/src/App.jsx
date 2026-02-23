import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Header from "./components/Header";
import AuthModal from "./components/AuthModal";
import Carrito from "./components/Carrito";
import Home from "./pages/Home";
import ProductosPage from "./pages/ProductosPage";
import Nosotros from "./pages/Nosotros";
import Adminagregar from "./pages/Adminagregar";
import MensajeModal from "./components/MensajeModal";

// LIMPIEZA DE CSS
import "./index.css";
import "./productos.css";

function App() {
  const [mostrarAvisoCierre, setMostrarAvisoCierre] = useState(false);
  const [loginAbierto, setLoginAbierto] = useState(false);
  const [carritoAbierto, setCarritoAbierto] = useState(false);

  // 1. USUARIO: Recuperar datos de sesión al cargar la app
  const [usuario, setUsuario] = useState(() => {
    const guardado = localStorage.getItem("usuario_aqua");
    return guardado ? JSON.parse(guardado) : null;
  });

  // 2. CARRITO: Recuperar items al cargar
  const [carrito, setCarrito] = useState(() => {
    const cartGuardado = localStorage.getItem("carrito_pro");
    return cartGuardado ? JSON.parse(cartGuardado) : [];
  });

  // 3. EFECTO: Sincronizar carrito con LocalStorage automáticamente
  useEffect(() => {
    localStorage.setItem("carrito_pro", JSON.stringify(carrito));
  }, [carrito]);

  const handleLogin = (datosUsuario) => {
    setUsuario(datosUsuario);
    localStorage.setItem("usuario_aqua", JSON.stringify(datosUsuario));
    setLoginAbierto(false);
  };

  const agregarAlCarrito = (producto) => {
    setCarrito([...carrito, producto]);
    setCarritoAbierto(true);
  };

  const cerrarSesion = () => {
    setUsuario(null);
    setCarrito([]);
    localStorage.clear();
    setMostrarAvisoCierre(true);
  };

  return (
    <BrowserRouter>
      {/* MODAL DE DESPEDIDA AL CERRAR SESIÓN */}
      {mostrarAvisoCierre && (
        <MensajeModal 
          info={{
            tipo: "exito",
            titulo: "¡Hasta luego!",
            texto: "Tu sesión en Aqua Clean Pro se ha cerrado correctamente."
          }} 
          cerrar={() => setMostrarAvisoCierre(false)} 
        />
      )}
      
      <Header 
        usuario={usuario} 
        abrirLogin={() => setLoginAbierto(true)} 
        cerrarSesion={cerrarSesion}
        abrirCarrito={() => setCarritoAbierto(true)}
        conteo={carrito.length}
      />

      {/* OVERLAY PARA EL CARRITO LATERAL */}
      <div 
        className={`overlay ${carritoAbierto ? 'activo' : ''}`} 
        onClick={() => setCarritoAbierto(false)}
      ></div>
      
      <Carrito 
        abierto={carritoAbierto} 
        cerrar={() => setCarritoAbierto(false)} 
        items={carrito} 
        usuario={usuario}
        eliminar={(i) => setCarrito(carrito.filter((_, idx) => idx !== i))} 
      />

      {/* MODAL DE LOGIN / REGISTRO */}
      {loginAbierto && (
        <AuthModal 
          cerrarModal={() => setLoginAbierto(false)} 
          onLogin={handleLogin} 
        />
      )}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/nosotros" element={<Nosotros />} />
      
        <Route 
          path="/productos" 
          element={
            <ProductosPage 
              agregarAlCarrito={agregarAlCarrito} 
              usuario={usuario} // Pasamos el usuario para mostrar botones de admin
              abrirLogin={() => setLoginAbierto(true)} 
            />
          } 
        />

        {/* PROTECCIÓN DE RUTA ADMIN */}
        <Route 
          path="/admin" 
          element={
            usuario?.rol === "admin" ? (
              <Adminagregar usuario={usuario} /> // Pasamos el usuario como prop
            ) : (
              <Navigate to="/" /> // Si no es admin, redirige al Home
            )
          } 
        />

        {/* REDIRECCIÓN POR DEFECTO */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;