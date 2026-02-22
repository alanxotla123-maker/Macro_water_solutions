import { Link } from "react-router-dom";

function Header({ abrirCarrito, abrirLogin }) {
  return (
    <header>
      {/* Logo y Nombre */}
      <div className="logo">
        <img src="/imagenes/logo.png" className="logo-img" alt="Logo" />
        Aqua <span className="pro">Clean Pro</span>
      </div>

      {/* Navegación con React Router */}
      <nav>
        <Link to="/">Inicio</Link>
        <Link to="/productos">Productos</Link>
        <Link to="/nosotros">Nosotros</Link>
      </nav>

      {/* Iconos con eventos de click */}
      <div className="icons">
        <i className="fa-solid fa-magnifying-glass"></i>
        {/* Aquí se usa la función que pasaste por props desde App.jsx */}
        <i className="fa-solid fa-cart-shopping" onClick={abrirCarrito}></i>
        <i className="fa-solid fa-user" onClick={abrirLogin}></i>
      </div>
    </header>
  );
}

export default Header;