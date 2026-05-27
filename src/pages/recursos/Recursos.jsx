import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Recursos.css';
import CarouselSection from './CarouselSection';
import Biblioteca from './Biblioteca';
import Sonidos from './sonidos';
import JuegosEmocionales from './JuegosEmocionales';
import Frases from './Frases';


const Recursos = () => {
  useEffect(() => {
    // Scroll al hash con un delay para asegurar que todo está cargado
    const timer = setTimeout(() => {
      if (window.location.hash) {
        const element = document.getElementById(window.location.hash.substring(1));
        if (element) {
          element.scrollIntoView();
        }
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="app">

      {/* HEADER */}
      <header className="header">
        <div className="navbar-container">
          <div className="navbar-left">
            <img
              src="src/assets/common/logo.png"
              alt="LUDA Logo"
              className="navbar-logo"
            />
          </div>

          <nav className="navbarr-right">
            <ul className="navr-links">
              <li><Link to="/" className="navr-link">INICIO</Link></li>
              <li><a href="#biblioteca" className="navr-link">RECURSOS</a></li>
              <li>
                <Link to="/login" className="profile-btn">
                  <span className="profile-text">INICIO</span>
                  <img
                    src="src/assets/common/profile.png"
                    alt="Profile"
                    className="profile-img"
                  />
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      {/* CONTENIDO */}
      <main className="main-content">
        <CarouselSection />
        <Biblioteca />
        <Sonidos />
        <Frases id="frases" />
        <JuegosEmocionales id="juegos" />
        
      </main>

      {/* Footer */}
      <footer className="recursos-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>🌟 Recursos de Bienestar</h3>
            <p>Explora nuestra colección de herramientas para tu salud mental y crecimiento personal.</p>
          </div>
          
          <div className="footer-section">
            <h4>📚 Secciones</h4>
            <ul>
              <li><a href="#biblioteca">Biblioteca</a></li>
              <li><a href="#sonidos">Sonidos Relajantes</a></li>
              <li><a href="#frases">Frases Inspiradoras</a></li>
              <li><a href="#juegos">Juegos Psicoeducativos</a></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>💫 Motivación</h4>
            <p>"El cuidado de tu salud mental es el primer paso hacia una vida plena y feliz."</p>
            <p>"Cada día es una nueva oportunidad para crecer y transformar tu bienestar."</p>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>© 2026 LUDA · Proyecto académico con fines educativos.</p>
        </div>
      </footer>




    </div>
  );
};

export default Recursos;