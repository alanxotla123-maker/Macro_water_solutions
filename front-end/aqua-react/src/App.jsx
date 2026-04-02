import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// COMPONENTES
import Header from "./components/Header";
import Footer from "./components/Footer";
import AuthModal from "./components/AuthModal";
import Carrito from "./components/Carrito";
import MensajeModal from "./components/MensajeModal";
import Checkout from "./components/CheckOut";
// --- NUEVOS COMPONENTES (Crea estos archivos en tu carpeta pages) ---
import PagoExitoso from "./pages/PagoExito"; 
import PagoFallido from "./pages/PagoFallido";

// PÁGINAS
import Adminagregar from "./pages/AdminAgregar";
import Home from "./pages/Home";
import ProductosPage from "./pages/ProductosPage";
import Nosotros from "./pages/Nosotros";
import UserProfile from "./pages/UserPerfil";
import EditarProducto from './pages/AdminEditar';
import Contacto from "./pages/Contacto";

function App() {
  const [mostrarAvisoCierre, setMostrarAvisoCierre] = useState(false);
  const [loginAbierto, setLoginAbierto] = useState(false);
  const [carritoAbierto, setCarritoAbierto] = useState(false);

  const [usuario, setUsuario] = useState(() => {
    const guardado = localStorage.getItem("usuario_aqua");
    return guardado ? JSON.parse(guardado) : null;
  });

  const [carrito, setCarrito] = useState(() => {
    const cartGuardado = localStorage.getItem("carrito_pro");
    return cartGuardado ? JSON.parse(cartGuardado) : [];
  });

  useEffect(() => {
    localStorage.setItem("carrito_pro", JSON.stringify(carrito));
  }, [carrito]);

  // --- NUEVA FUNCIÓN: VACIAR CARRITO ---
  const vaciarCarrito = () => {
    setCarrito([]);
    localStorage.removeItem("carrito_pro");
  };

  const handleLogin = (datosUsuario) => {
    setUsuario(datosUsuario);
    localStorage.setItem("usuario_aqua", JSON.stringify(datosUsuario));
    setLoginAbierto(false);
  };

  const agregarAlCarrito = (producto, onResult) => {
    setCarrito((prev) => {
      const existe = prev.find((item) => item.id === producto.id);
      if (existe) {
        if (onResult) onResult(true, "Producto agregado");
        return prev.map((item) =>
          item.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item
        );
      }
      if (onResult) onResult(true, "Producto agregado");
      return [...prev, { ...producto, cantidad: 1 }];
    });
  };

  const actualizarCantidad = (id, cambio) => {
    setCarrito((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nuevaCantidad = item.cantidad + cambio;
          if (nuevaCantidad > 0) return { ...item, cantidad: nuevaCantidad };
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
          info={{ tipo: "exito", titulo: "¡Hasta luego!", texto: "Sesión cerrada correctamente." }} 
          cerrar={() => setMostrarAvisoCierre(false)} 
        />
      )}
      
      <div className="app-layout">
        <Header 
          usuario={usuario} 
          abrirLogin={() => setLoginAbierto(true)} 
          cerrarSesion={cerrarSesion}
          abrirCarrito={() => setCarritoAbierto(true)}
          conteo={carrito.reduce((acc, item) => acc + item.cantidad, 0)}
        />

        <main className="app-main">
          <div className={`overlay ${carritoAbierto ? 'activo' : ''}`} onClick={() => setCarritoAbierto(false)}></div>
          
          <Carrito 
            abierto={carritoAbierto} 
            cerrar={() => setCarritoAbierto(false)} 
            items={carrito} 
            usuario={usuario}
            actualizarCantidad={actualizarCantidad}
            eliminar={eliminarDelCarrito}
          />

          {loginAbierto && (
            <AuthModal cerrarModal={() => setLoginAbierto(false)} onLogin={handleLogin} />
          )}

          <Routes>
            <Route path="/" element={<Home />} />
            
            <Route 
              path="/checkout" 
              element={
                <Checkout 
                  carrito={carrito} 
                  usuario={usuario} 
                  setAuthModalAbierto={setLoginAbierto} 
                />
              } 
            />
            
            <Route path="/nosotros" element={<Nosotros />} />
            <Route path="/contacto" element={<Contacto />} />
            
            <Route path="/perfil" element={usuario ? <UserProfile usuario={usuario} onCerrarSesion={cerrarSesion} /> : <Navigate to="/" />} />

            <Route path="/productos" element={<ProductosPage agregarAlCarrito={agregarAlCarrito} usuario={usuario} abrirLogin={() => setLoginAbierto(true)} />} />

            <Route path="/admin" element={usuario?.rol === "admin" || usuario?.rol_id == 1 ? <Adminagregar usuario={usuario} /> : <Navigate to="/" />} />

            <Route path="/admin/editar/:id" element={usuario?.rol === "admin" || usuario?.rol_id == 1 ? <EditarProducto /> : <Navigate to="/" />} />

            {/* RUTAS DE MERCADO PAGO */}
            <Route path="/pago-exitoso" element={<PagoExitoso vaciarCarrito={vaciarCarrito} />} />
            <Route path="/pago-fallido" element={<PagoFallido />} />

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;