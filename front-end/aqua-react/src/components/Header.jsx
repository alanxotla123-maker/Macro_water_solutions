import { Link } from "react-router-dom";

function Header({ abrirCarrito, abrirLogin, usuario, cerrarSesion, conteo }) {
  return (
    <header className="main-header">
      <div className="header-content">
        {/* LADO IZQUIERDO: LOGO */}
        <div className="logo">
          <img src="/imagenes/logo.png" className="logo-img" alt="Logo" />
          <span>Aqua <span className="pro">Clean Pro</span></span>
        </div>

        {/* CENTRO: NAVEGACIÓN */}
        <nav className="nav-menu">
          <Link to="/">Inicio</Link>
          <Link to="/productos">Productos</Link>
          <Link to="/nosotros">Nosotros</Link>
          <Link to="/">Contacto</Link>
          {usuario?.rol === 'admin' && (
            <Link to="/admin" className="link-admin">Gestionar</Link>
          )}
        </nav>

        {/* LADO DERECHO: ICONOS */}
        <div className="icons">
          <i className="fa-solid fa-magnifying-glass"></i>
          
          {usuario?.rol === 'admin' && (
            <Link to="/admin" title="Agregar Producto">
              <i className="fa-solid fa-circle-plus icon-add"></i>
            </Link>
          )}

          <div className="cart-container" onClick={abrirCarrito}>
            <i className="fa-solid fa-cart-shopping"></i>
            {conteo > 0 && <span className="badge-conteo">{conteo}</span>}
          </div>

          {/* CAMBIO AQUÍ: QUITAMOS NOMBRE Y LOGOUT, PONEMOS LINK A PERFIL */}
          {usuario ? (
            <Link to="/perfil" className="profile-link-header" title="Mi Perfil">
              <div className="user-icon-circle">
                 <i className="fa-regular fa-user"></i>
              </div>
            </Link>
          ) : (
            <i className="fa-solid fa-user login-icon" onClick={abrirLogin} title="Iniciar Sesión"></i>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;