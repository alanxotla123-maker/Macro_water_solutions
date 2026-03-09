import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// COMPONENTES
import Header from "./components/Header";
import AuthModal from "./components/AuthModal";
import Carrito from "./components/Carrito";
import MensajeModal from "./components/MensajeModal";
import Checkout from "./components/CheckOut";
// PÁGINAS
import Adminagregar from "./pages/AdminAgregar";
import Home from "./pages/Home";
import ProductosPage from "./pages/ProductosPage";
import Nosotros from "./pages/Nosotros";
import UserProfile from "./pages/UserPerfil";
import EditarProducto from './pages/AdminEditar';
import Contacto from "./pages/Contacto";
// ESTILOS
import "./index.css";
import "./productos.css";

function App() {
  const [mostrarAvisoCierre, setMostrarAvisoCierre] = useState(false);
  const [loginAbierto, setLoginAbierto] = useState(false);
  const [carritoAbierto, setCarritoAbierto] = useState(false);

  // 1. USUARIO: Recuperar datos de sesión
  const [usuario, setUsuario] = useState(() => {
    const guardado = localStorage.getItem("usuario_aqua");
    return guardado ? JSON.parse(guardado) : null;
  });

  // 2. CARRITO: Recuperar items
  const [carrito, setCarrito] = useState(() => {
    const cartGuardado = localStorage.getItem("carrito_pro");
    return cartGuardado ? JSON.parse(cartGuardado) : [];
  });

  // 3. EFECTO: Sincronizar con LocalStorage
  useEffect(() => {
    localStorage.setItem("carrito_pro", JSON.stringify(carrito));
  }, [carrito]);

  const handleLogin = (datosUsuario) => {
    setUsuario(datosUsuario);
    localStorage.setItem("usuario_aqua", JSON.stringify(datosUsuario));
    setLoginAbierto(false);
  };

  // FUNCIONES DEL CARRITO (Lógica de Stock y Cantidad)
  const agregarAlCarrito = (producto) => {
    setCarrito((prev) => {
      const existe = prev.find((item) => item.id === producto.id);
      if (existe) {
        if (existe.cantidad < producto.stock) {
          return prev.map((item) =>
            item.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item
          );
        } else {
          alert("¡Ups! No hay más stock disponible.");
          return prev;
        }
      }
      return [...prev, { ...producto, cantidad: 1 }];
    });
  };

  const actualizarCantidad = (id, cambio) => {
    setCarrito((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nuevaCantidad = item.cantidad + cambio;
          if (nuevaCantidad > 0 && nuevaCantidad <= item.stock) {
            return { ...item, cantidad: nuevaCantidad };
          }
        }
        return item;
      })
    );
  };

  const eliminarDelCarrito = (id) => {
    setCarrito((prev) => prev.filter((item) => item.id !== id));
  };

  const cerrarSesion = () => {
    setUsuario(null);
    setCarrito([]);
    localStorage.clear();
    setMostrarAvisoCierre(true);
  };

  return (
    <BrowserRouter>
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
        conteo={carrito.reduce((acc, item) => acc + item.cantidad, 0)} // Conteo total de piezas
      />

      <div 
        className={`overlay ${carritoAbierto ? 'activo' : ''}`} 
        onClick={() => setCarritoAbierto(false)}
      ></div>
      
      <Carrito 
        abierto={carritoAbierto} 
        cerrar={() => setCarritoAbierto(false)} 
        items={carrito} 
        usuario={usuario}
        actualizarCantidad={actualizarCantidad} // ¡Importante pasar esto!
        eliminar={eliminarDelCarrito} // Usamos la función por ID
      />

      {loginAbierto && (
        <AuthModal 
          cerrarModal={() => setLoginAbierto(false)} 
          onLogin={handleLogin} 
        />
      )}

      <Routes>
        <Route path="/" element={<Home />} />
        
        {/* CORRECCIÓN AQUÍ: Se usa 'carrito' en lugar de 'items' y 'usuario' en lugar de 'user' */}
        <Route path="/checkout" element={<Checkout carrito={carrito} usuario={usuario} />} />
        
        <Route path="/nosotros" element={<Nosotros />} />

        <Route path="/contacto" element={<Contacto />} />
      
        <Route 
          path="/perfil" 
          element={
            usuario ? (
              <UserProfile usuario={usuario} onCerrarSesion={cerrarSesion} />
            ) : (
              <Navigate to="/" />
            )
          } 
        />

        <Route 
          path="/productos" 
          element={
            <ProductosPage 
              agregarAlCarrito={agregarAlCarrito} 
              usuario={usuario} 
              abrirLogin={() => setLoginAbierto(true)} 
            />
          } 
        />
<Route 
          path="/admin" 
          element={
            // Validamos que sea 1 (número) o "1" (texto) para estar seguros
            usuario?.rol == 1 || usuario?.rol === "admin" || usuario?.rol_id == 1 ? (
              <Adminagregar usuario={usuario} /> 
            ) : (
              <Navigate to="/" />
            )
          } 
        />

        <Route 
          path="/admin/editar/:id" 
          element={
            usuario?.rol == 1 ||usuario?.rol === "admin"|| usuario?.rol_id == 1 ? (
              <EditarProducto /> 
            ) : (
              <Navigate to="/" />
            )
          } 
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;