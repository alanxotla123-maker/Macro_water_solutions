import ProductoCard from "../components/ProductoCard";
import "../styles/productos.css";

function ProductosPage({ agregarAlCarrito }) {

  const productos = [
    {
      nombre: "AquaBot X200",
      precio: 899,
      imagen: "/imagenes/producto1.jpg"
    }
  ];

  return (
    <section className="productos-section">
      <h2 className="productos-titulo">Nuestros Productos</h2>

      <div className="productos-grid">
        {productos.map((p, index) => (
          <ProductoCard
            key={index}
            producto={p}
            agregarAlCarrito={agregarAlCarrito}
          />
        ))}
      </div>
    </section>
  );
}

export default ProductosPage;