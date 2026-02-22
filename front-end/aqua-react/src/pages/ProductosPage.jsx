import React from 'react';

// Aquí definimos los productos manualmente
const PRODUCTOS_ESTATICOS = [
  {
    id: 1,
    nombre: "Cloro Triple Acción",
    descripcion: "Mantiene el agua cristalina y libre de bacterias. Ideal para uso semanal.",
    precio: "450.00",
    imagen: "/imagenes/cloro.jpg" // Asegúrate de que existan en public/imagenes/
  },
  {
    id: 2,
    nombre: "Alguicida Concentrado",
    descripcion: "Elimina y previene la formación de algas verdes y moho en las paredes.",
    precio: "280.00",
    imagen: "/imagenes/alguicida.jpg"
  },
  {
    id: 3,
    nombre: "Clarificador Rápido",
    descripcion: "Agrupa las partículas de suciedad para que el filtro las atrape fácilmente.",
    precio: "195.00",
    imagen: "/imagenes/clarificador.jpg"
  },
  {
    id: 4,
    nombre: "Kit de Prueba pH",
    descripcion: "Mide con precisión los niveles de cloro y pH de tu alberca.",
    precio: "320.00",
    imagen: "/imagenes/kit-ph.jpg"
  },
  {
    id: 5,
    nombre: "Cepillo de Cerdas de Acero",
    descripcion: "Remueve la suciedad incrustada en el azulejo sin dañarlo.",
    precio: "150.00",
    imagen: "/imagenes/cepillo.jpg"
  },
  {
    id: 6,
    nombre: "Red Saca Hojas",
    descripcion: "Malla reforzada para limpieza superficial de hojas e insectos.",
    precio: "210.00",
    imagen: "/imagenes/red.jpg"
  }
];

function ProductosPage({ agregarAlCarrito }) {
  return (
    <div className="productos-section">
      <h2 className="productos-titulo">Nuestros Productos</h2>
      
      <div className="productos-grid">
        {PRODUCTOS_ESTATICOS.map((prod) => (
          <div key={prod.id} className="producto-card">
            <img 
              src={prod.imagen} 
              alt={prod.nombre} 
              // Si la imagen falla, ponemos una de respaldo
              onError={(e) => { e.target.src = 'https://via.placeholder.com/250?text=Aqua+Clean+Pro' }} 
            />
            <div className="producto-info">
              <div className="producto-top">
                <h3>{prod.nombre}</h3>
                <span className="precio">${prod.precio}</span>
              </div>
              <p>{prod.descripcion}</p>
              <button 
                className="btn-carrito" 
                onClick={() => agregarAlCarrito(prod)}
              >
                <i className="fa-solid fa-cart-plus"></i> Añadir al carrito
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProductosPage;