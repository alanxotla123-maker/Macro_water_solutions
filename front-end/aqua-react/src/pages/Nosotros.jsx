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
          En Macro Water Solutions ofrecemos productos especializados para el mantenimiento y cuidado de albercas y piscinas, diseñados para garantizar agua limpia, segura y cristalina. Contamos con soluciones profesionales como químicos para piscinas, 
          sistemas de filtración, accesorios de limpieza y equipos de mantenimiento.
          Nuestra misión es brindar productos de alta calidad que faciliten el tratamiento del agua, mejoren la durabilidad de las instalaciones 
          y aseguren una experiencia óptima en cada uso.
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

      {/* --- NUEVA SECCIÓN: Misión, Visión y Valores --- */}
      <div className="nosotros-mvv-grid">
        <div className="mvv-card">
          <div className="mvv-icon-wrapper">
            <i className="fa-solid fa-bullseye"></i>
          </div>
          <h3>Misión</h3>
          <p>Proveer soluciones integrales y productos de alta especialidad para el mantenimiento de albercas, garantizando agua limpia, segura y cristalina mediante innovación y fórmulas responsables con el medio ambiente, facilitando así el cuidado y la durabilidad de cada instalación.</p>
        </div>

        <div className="mvv-card">
          <div className="mvv-icon-wrapper">
            <i className="fa-solid fa-eye"></i>
          </div>
          <h3>Visión</h3>
          <p>Ser el referente líder en el mercado de soluciones profesionales para el tratamiento de agua, reconocidos por nuestra excelencia técnica, nuestro compromiso con la sostenibilidad y por transformar el mantenimiento de piscinas en una experiencia sencilla y eficiente para todos nuestros clientes.</p>
        </div>

        <div className="mvv-card">
          <div className="mvv-icon-wrapper">
            <i className="fa-solid fa-gem"></i>
          </div>
          <h3>Valores</h3>
          <p>Calidad Garantizada: No negociamos con el estándar de nuestros productos; si es Macro, funciona y es seguro.</p>
        </div>
      </div>

    </section>
  );
}

export default Nosotros;