import React from 'react';
import { Link } from 'react-router-dom';

function Hero() {
  return (
    <section className="hero">
      <div className="hero-overlay"></div>
      <div className="hero-content">
        <h1>Transforma tu piscina en un <span className="highlight">oasis, limpio y cristalino</span></h1>
        <p>Productos premium en un solo lugar a tan solo un clik.</p>
        <div className="buttons">
          <Link to="/productos" className="btn primary">Ver Productos</Link>
        </div>
      </div>
    </section>
  );
}

export default Hero;