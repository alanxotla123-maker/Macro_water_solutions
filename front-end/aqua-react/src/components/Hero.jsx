function Hero() {
  return (
    <section className="hero">
      <div className="hero-overlay"></div>

      <div className="hero-content">
        <h1>
          Transforma tu piscina en un{" "}
          <span className="highlight">
            oasis, limpio y cristalino
          </span>
        </h1>

        <p>Productos premium en un solo lugar a tan solo un click.</p>

        <div className="buttons">
          <button className="btn primary">Comprar ahora</button>
          <button className="btn secondary">Ver más</button>
        </div>
      </div>
    </section>
  );
}

export default Hero;