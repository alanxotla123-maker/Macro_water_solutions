import React from 'react';
import { Link } from 'react-router-dom';

function Hero() {
  return (
    <section className="hero">
      <div className="hero-overlay"></div>
      <div className="hero-content">
        <h1>Mantén tu alberca <span className="highlight">impecable</span></h1>
        <p>Los mejores productos químicos y accesorios para el mantenimiento de tu piscina.</p>
        <div className="buttons">
          <Link to="/productos" className="btn primary">Ver Productos</Link>
        </div>
      </div>
    </section>
  );
}

export default Hero;