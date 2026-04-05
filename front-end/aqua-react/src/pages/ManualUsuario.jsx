import React, { useState } from 'react';

const ManualUsuario = () => {
  const [activeSection, setActiveSection] = useState(null);

  const sections = [
    {
      id: 1,
      title: "1. Registro e Inicio de Sesión",
      icon: "fa-user-plus",
      content: (
        <>
          Para comenzar a comprar, necesitas una cuenta. Haz clic en el ícono de usuario en la esquina superior derecha y selecciona <strong>Iniciar Sesión</strong>. Si no tienes cuenta, haz clic en registrarse y podrás crear tu perfil fácilmente llenando tus datos y creando una contraseña segura.
        </>
      ),
      images: ["/manual/i1.png", "/manual/i2.png", "/manual/i3.png"],
      alt: "Registro e Inicio de Sesión"
    },
    {
      id: 2,
      title: "2. Buscar y Explorar Productos",
      icon: "fa-magnifying-glass",
      content: (
        <>
          Puedes buscar lo que necesitas de dos maneras:<br /><br />
          - <strong>Menú de Productos:</strong> Haz clic en <strong>Productos</strong> en el menú principal para ver todo nuestro catálogo.<br />
          - <strong>Buscador Inteligente:</strong> En la barra superior, escribe el nombre del producto, marca o palabra clave y presiona la tecla enter, o elige una de las sugerencias.
        </>
      ),
      images: ["/manual/ii1.png", "/manual/ii2.png"],
      alt: "Buscar y Explorar Productos"
    },
    {
      id: 3,
      title: "3. Agregar al Carrito y Comprar",
      icon: "fa-cart-arrow-down",
      content: (
        <>
          Cuando encuentres un producto que te guste, presiona el botón para agregarlo. Puedes ver todo lo que has seleccionado dando clic al ícono del <strong>carrito</strong> en la parte superior.<br /><br />
          Desde tu carrito, haz clic en pagar para iniciar el proceso de checkout seguro integrado con Mercado Pago. Podrás elegir pagar con tarjeta, transferencia, o en efectivo.
        </>
      ),
      images: ["/manual/iii1.png", "/manual/iii2.png", "/manual/iii3.png", "/manual/iii4.png"],
      alt: "Agregar al Carrito y Comprar"
    },
    {
      id: 4,
      title: "4. Mi Perfil e Historial",
      icon: "fa-user-gear",
      content: (
        <>
          Con la sesión iniciada, si haces clic en tu icono de perfil, accederás a tu panel personal. Allí podrás ver tu información y, más importante, revisar tu detalle e historial de compras.
        </>
      ),
      images: ["/manual/iv1.png", "/manual/iv2.png"],
      alt: "Mi Perfil e Historial"
    },
    {
      id: 5,
      title: "5. ¿Necesitas más ayuda?",
      icon: "fa-headset",
      content: (
        <>
          Si tienes problemas adicionales o preguntas sobre instalación, servicios o envíos, no dudes en visitar nuestra sección de <strong>Contacto</strong> y enviarnos tu mensaje para que un experto pueda asistirte a la brevedad.
        </>
      ),
      images: ["/manual/v1.png"],
      alt: "¿Necesitas más ayuda?"
    }
  ];

  const toggleSection = (id) => {
    setActiveSection(activeSection === id ? null : id);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '20px', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ textAlign: 'center', color: '#0056b3', marginBottom: '30px', fontSize: '2.5rem' }}>
        <i className="fa-solid fa-book"></i> Manual de Usuario
      </h1>

      <p style={{ textAlign: 'center', fontSize: '1.1rem', color: '#555', marginBottom: '40px' }}>
        Bienvenido a Macro Water Solutions. Aquí encontrarás una guía paso a paso para usar nuestra plataforma.
      </p>

      {sections.map((sec) => (
        <section
          key={sec.id}
          style={{
            marginBottom: '30px',
            backgroundColor: '#fff',
            padding: '25px',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onClick={() => toggleSection(sec.id)}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: activeSection === sec.id ? '15px' : '0' }}>
            <h2 style={{ color: '#333', fontSize: '1.5rem', margin: 0 }}>
              <i className={`fa-solid ${sec.icon}`} style={{ color: '#0d6efd', marginRight: '10px' }}></i> {sec.title}
            </h2>
            <i className={`fa-solid fa-chevron-${activeSection === sec.id ? 'up' : 'down'}`} style={{ color: '#0d6efd', transition: 'transform 0.3s ease' }}></i>
          </div>

          {activeSection === sec.id && (
            <div style={{ animation: 'fadeIn 0.5s ease' }}>
              <p style={{ lineHeight: '1.6', color: '#555', marginBottom: '20px' }}>
                {sec.content}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
                {sec.images && sec.images.map((imgSrc, index) => (
                  <img
                    key={index}
                    src={imgSrc}
                    alt={`${sec.alt} - Parte ${index + 1}`}
                    style={{ maxWidth: '100%', maxHeight: '500px', borderRadius: '8px', border: '1px solid #ddd', objectFit: 'contain' }}
                  />
                ))}
              </div>
            </div>
          )}
        </section>
      ))}
    </div>
  );
};

export default ManualUsuario;
