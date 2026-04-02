import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
 
function Header({ abrirCarrito, abrirLogin, usuario, cerrarSesion, conteo }) {
  const [searchOpen, setSearchOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sugerencias, setSugerencias] = useState([]);
  const [productos, setProductos] = useState([]);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();
 
  useEffect(() => {
    if (searchOpen) {
      fetch("https://macrowatersolutions.com/api/productos")
        .then((res) => res.json())
        .then((data) => setProductos(data || []))
        .catch(() => setProductos([]));
    }
  }, [searchOpen]);
 
  useEffect(() => {
    const q = searchQuery.trim().toLowerCase();
    if (q.length < 2) {
      setSugerencias([]);
      return;
    }
    const filtrados = productos
      .filter((p) => p.nombre && p.nombre.toLowerCase().includes(q))
      .slice(0, 10)
      .map((p) => p.nombre);
    setSugerencias(filtrados);
    setMostrarSugerencias(filtrados.length > 0);
  }, [searchQuery, productos]);
 
  useEffect(() => {
    function handleClickOutside(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
        setMostrarSugerencias(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
 
  const handleBuscar = () => {
    const q = searchQuery.trim();
    if (q) {
      navigate(`/productos?q=${encodeURIComponent(q)}`);
      setSearchOpen(false);
      setSearchQuery("");
      setMostrarSugerencias(false);
    }
  };
 
  const handleSugerenciaClick = (texto) => {
    setSearchQuery(texto);
    navigate(`/productos?q=${encodeURIComponent(texto)}`);
    setSearchOpen(false);
    setSearchQuery("");
    setMostrarSugerencias(false);
  };
 
  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleBuscar();
  };
 
  const esAdmin = usuario?.rol === "admin" || usuario?.rol == 1 || usuario?.rol_id == 1;
 
  return (
    <header className="main-header">
      <div className="header-content">
        <Link to="/" className="logo" style={{ textDecoration: "none", color: "inherit" }}>
          <img src="/favicon.ico" className="logo-img" alt="Logo" />
          <span className="logo-text">
            Macro <br /><span className="pro logo-ws">Water Solutions</span>
          </span>
        </Link>
 
        <div className="middle-header" ref={searchRef}>
          <div className="search-container open">
            <div className="search-bar-wrapper">
              <div className="search-bar">
                <input
                  type="text"
                  className="search-input"
                  placeholder="Buscar productos, marcas y más..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={() => sugerencias.length > 0 && setMostrarSugerencias(true)}
                />
                <button
                  type="button"
                  className="search-lupa-inner"
                  onClick={handleBuscar}
                  aria-label="Buscar"
                >
                  <i className="fa-solid fa-magnifying-glass"></i>
                </button>
              </div>
              {mostrarSugerencias && sugerencias.length > 0 && (
                <ul className="search-sugerencias">
                  {sugerencias.map((s, i) => (
                    <li key={i} onClick={() => handleSugerenciaClick(s)}>
                      <i className="fa-solid fa-magnifying-glass"></i>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
 
          <nav className="nav-menu">
            <Link to="/">Inicio</Link>
            <Link to="/productos">Productos</Link>
            <Link to="/nosotros">Nosotros</Link>
            <Link to="/contacto">Contacto</Link>
          </nav>
        </div>
 
        <div className="icons">
          {esAdmin && (
            <Link to="/admin" title="Agregar Producto">
              <i className="fa-solid fa-circle-plus icon-add"></i>
            </Link>
          )}
 
          <div className="cart-container" onClick={abrirCarrito}>
            <i className="fa-solid fa-cart-shopping"></i>
            {conteo > 0 && <span className="badge-conteo">{conteo}</span>}
          </div>
 
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
 
