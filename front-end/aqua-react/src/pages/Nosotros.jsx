function Nosotros() {
  return (
    <section className="nosotros">
      <div className="nosotros-container">

        <div className="nosotros-img">
          <img src="/favicon.ico" alt="Nosotros" />
        </div>

        <div className="nosotros-texto">
          <h4>Sobre Nosotros</h4>
          <h2>Expertos en Limpieza Profesional</h2>
          <p>
            En Macro Water Solutions ofrecemos productos de limpieza de alta calidad
            diseñados para resultados profesionales. Nuestra misión es brindar
            soluciones eficientes, ecológicas y accesibles.
          </p>

          <div className="nosotros-beneficios">
            <div className="beneficio">
              <i className="fa-solid fa-check"></i>
              Productos Certificados
            </div>

            <div className="beneficio">
              <i className="fa-solid fa-truck"></i>
              Envíos Rápidos
            </div>

            <div className="beneficio">
              <i className="fa-solid fa-leaf"></i>
              Fórmulas Ecológicas
            </div>

            <div className="beneficio">
              <i className="fa-solid fa-star"></i>
              Calidad Garantizada
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

export default Nosotros;