import { Link } from "react-router-dom";

function Header({ abrirCarrito, abrirLogin, usuario, cerrarSesion, conteo }) {
  return (
    <header>
      <div className="logo">
        <img src="/imagenes/logo.png" className="logo-img" alt="Logo" />
        Aqua <span className="pro">Clean Pro</span>
      </div>
      <nav>
        <Link to="/">Inicio</Link>
        <Link to="/productos">Productos</Link>
        <Link to="/nosotros">Nosotros</Link>
        {usuario?.rol === 'admin' && <Link to="/admin" style={{color: '#00bfff'}}>Gestionar</Link>}
      </nav>
      <div className="icons">
        <i className="fa-solid fa-magnifying-glass"></i>
        {usuario?.rol === 'admin' && (
          <Link to="/admin" title="Agregar Producto">
            <i className="fa-solid fa-circle-plus" style={{color: '#2196f3'}}></i>
          </Link>
        )}
        <div style={{position: 'relative', cursor: 'pointer'}} onClick={abrirCarrito}>
          <i className="fa-solid fa-cart-shopping"></i>
          {conteo > 0 && <span className="badge-conteo">{conteo}</span>}
        </div>
        {usuario ? (
          <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
            <span style={{fontSize: '12px', fontWeight: 'bold'}}>{usuario.nombre}</span>
            <i className="fa-solid fa-right-from-bracket" onClick={cerrarSesion} style={{cursor: 'pointer'}}></i>
          </div>
        ) : (
          <i className="fa-solid fa-user" onClick={abrirLogin} style={{cursor: 'pointer'}}></i>
        )}
      </div>
    </header>
  );
}

export default Header;