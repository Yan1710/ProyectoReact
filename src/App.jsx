import React from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import './App.css'
// Auth
import Login from './pages/login/Login.jsx'
import ForgotPassword from './pages/login/ForgotPassword.jsx'
import ProtectedRoute from './components/auth/ProtectedRoute.jsx'

// Dashboards
import DocenteDashboard from './pages/dashboard/DocenteDashboard.jsx'
import EstudianteDashboard from './pages/dashboard/EstudianteDashboard.jsx'
import PsicoorientadorDashboard from './pages/dashboard/PsicoorientadorDashboard.jsx'
import AdminDashboard from './pages/dashboard/AdminDashboard.jsx'
import Recursos from './pages/recursos/Recursos';

// Home por rol
import DocenteHomePage from './pages/dashboard/roles/docente/HomePage.jsx'
import EstudianteHomePage from './pages/dashboard/roles/estudiante/HomePage.jsx'
import PsicoorientadorHomePage from './pages/dashboard/roles/psicoorientador/HomePage.jsx'
import AdminHomePage from './pages/dashboard/roles/admin/HomePage.jsx'

// Perfil por rol
import DocentePerfil from './pages/dashboard/roles/docente/Perfil.jsx'
import EstudiantePerfil from './pages/dashboard/roles/estudiante/Perfil.jsx'
import PsicoorientadorPerfil from './pages/dashboard/roles/psicoorientador/Perfil.jsx'

// Sesiones para Psicoorientador
import PsicoorientadorSesiones from './pages/dashboard/roles/psicoorientador/Sesiones.jsx'

// Páginas de Estudiante
import EstudianteCitas from './pages/dashboard/roles/estudiante/Citas.jsx'
import EstudianteMensajes from './pages/dashboard/roles/estudiante/Mensajes.jsx'
import EstudianteRecursos from './pages/dashboard/roles/estudiante/Recursos.jsx'
import EstudianteBienestar from './pages/dashboard/roles/estudiante/Bienestar.jsx'
import EstudianteExperienciasPositivas from './pages/dashboard/roles/estudiante/ExperienciasPositivas.jsx'

// Páginas de Administrador
import AdminRecursos from './pages/dashboard/roles/admin/Recursos.jsx'


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <div>
            {/* Header */}
            <header className="header">
              <div className="header-container">
                <div className="logo">
                  <img src="/src/assets/common/logo.png" alt="LUDA" className="logo-img" />
                </div>
                <nav>
                  <ul className="nav-links">
                    <li><a href="#inicio">INICIO</a></li>
                    <li><a href="#nosotros">NOSOTROS</a></li>
                    <li><a href="#recursos">RECURSOS</a></li>
                    <li><Link to="/login" className="profile-btn">
                      <span className="profile-text">INICIO</span>
                      <img src="/src/assets/common/profile.png" alt="Profile" className="profile-img" />
                    </Link></li>
                  </ul>
                </nav>
              </div>
            </header>
              {/* Hero Section */}
              <section className="hero" id="inicio">
                <div className="hero-container">
                  <div className="hero-content">
                    <h1>CUIDA TU </h1>
                    <h1>BIENESTAR MENTAL</h1>
                    <p className="hero-description">
                      Una herramienta psicoeducativa diseñada para acompañar a estudiantes, docentes y orientadores en el fortalecimiento de la salud mental dentro del entorno escolar.
                    </p>
                    <div className="hero-buttons">
                      <Link to="/login" className="btn-comenzar">COMENZAR</Link>
                    </div>
                  </div>
                </div>
              </section>

              
      {/* Nosotros Section */}
      <section className="nosotros-section" id="nosotros">
        <div className="nosotros-container">
          <h2>NOSOTROS</h2>
          <div className="nosotros-content-image">
            <div className="nosotros-image-container">
              <img src="/src/assets/ui/image.png" alt="Nosotros" className="nosotros-image" />
            </div>

            <div className="nosotros-text">
              <h3>¿Qué es LUDA?</h3>
              <p className="nosotros-paragraph">
                LUDA es un aplicativo web psicoeducativo orientado a la prevención, el acompañamiento y
                el fortalecimiento del bienestar emocional en la comunidad educativa.
              </p>
              <p>A través de herramientas digitales, LUDA promueve el autoconocimiento, la regulación
                emocional y la detección temprana de posibles dificultades emocionales dentro del entorno escolar.</p>
            </div>
          </div>

          <div className="nosotros-dirigido">
            <h3>¿A QUIÉN VA DIRIGIDO?</h3>

            <div className="dirigido-cards">
              <div className="dirigido-card">
                <img
                  src="/src/assets/roles/students.png"
                  alt="students"
                  className="dirigido-icon"
                />
                <h3>Estudiantes</h3>
                <p>
                  Un espacio seguro para reconocer sus emociones,
                  fortalecer el autoconocimiento y aprender estrategias
                  de autocuidado emocional.
                </p>
              </div>

              <div className="dirigido-card">
                <img
                  src="/src/assets/roles/teachers.png"
                  alt="teachers"
                  className="dirigido-icon"
                />
                <h3>Docentes</h3>
                <p>
                  Una herramienta de apoyo que facilita el acompañamiento
                  emocional en el aula y la identificación temprana de señales de alerta.
                </p>
              </div>

              <div className="dirigido-card">
                <img
                  src="/src/assets/roles/psychologist.png"
                  alt="psychologist"
                  className="dirigido-icon"
                />
                <h3>Psicoorientadores</h3>
                <p>
                  Un sistema que permite el seguimiento emocional, la orientación y
                  el apoyo psicoeducativo dentro de la institución.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Resources Section */}
      <section className="resources" id="recursos">
        <div className="resources-major">
          <h3>RECURSOS</h3>
        </div>
        <div className="resources-container">
          <div className="resources-header">
            <h2>Nuestros Servicios</h2>
            <p>
              Herramientas psicoeducativas para el bienestar emocional.
            </p>
          </div>

          <div className="resources-grid">
            <div className="resource-card">
              <img
                src="/src/assets/resourcces/calendar.png"
                alt="Calendar"
                className="resource-icon"
              />
              <h3>Gestión de Citas</h3>
              <p>
                Organiza y agenda citas de acompañamiento psicoeducativo de forma clara, segura y accesible.
              </p>
            </div>

            <div className="resource-card">
              <img
                src="/src/assets/resourcces/self-assessments.png"
                alt="Self assessments"
                className="resource-icon"
              />
              <h3>Autoevaluaciones</h3>
              <p>
                Instrumentos de autoevaluación emocional que permita identificar estados emocionales y necesidades de apoyo.
              </p>
            </div>

            <div className="resource-card">
              <img
                src="/src/assets/resourcces/emotional-management.png"
                alt="Emotional management"
                className="resource-icon"
              />
              <h3>Gestión Emocional</h3>
              <p>
                Herramientas para registrar, comprender y gestionar mejor tus emociones.
              </p>
            </div>

            <div className="resource-card">
              <img
                src="/src/assets/resourcces/activities.png"
                alt="Activities"
                className="resource-icon"
              />
              <h3>Actividades</h3>
              <p>
                Actividades psicoeducativas diseñadas para fortalecer el autoconocimiento y el bienestar emocional.
              </p>
            </div>
          </div>

          {/* Recursos Button Section */}
              <div className="recursos-button-section">
                <Link to="/recursos#carousel" className="btn-comenzar">RECURSOS PSICOEDUCATIVOS</Link>
              </div>

        </div>
      </section>

      {/* Additional Services Section */}
      <section className="additional-services" id="additional-services">
        <div className="additional-services-container">

          {/* Content */}
          <div className="additional-services-grid">

            {/* Card 1 */}
            <div className="service-card light">
              <h3>¿Qué significa LUDA?</h3>
              <p>
                LUDA impulsa el acompañamiento psicoeducativo, promoviendo la salud
                mental y emocional en la comunidad escolar.
              </p>
              {/* Imagen debajo del texto */}
              <img
                src="/src/assets/ui/image2.png"
                alt="Proyecto LUDA"
                className="service-image2"
              />
            </div>

            {/* Card 2 */}
            <div className="service-card primary">
              <h3>Sobre LUDA</h3>
              <p>
                Somos un proyecto académico de carácter psicoeducativo que busca
                fortalecer la salud mental y el bienestar emocional en el entorno
                escolar.
              </p>
              <p>
                Integramos tecnología con un enfoque humano, preventivo y educativo,
                promoviendo el desarrollo integral de la comunidad educativa.
              </p>
              {/* Imagen debajo del texto */}
              <img
                src="/src/assets/ui/image1.png"
                alt="Proyecto LUDA"
                className="service-image"
              />
            </div>

            {/* Card 3 */}
            <div className="service-card light">
              <h3>¿Cómo funciona?</h3>
              <ul>
                <li>✔ Acceso seguro a la plataforma</li>
                <li>✔ Herramientas según el rol</li>
                <li>✔ Autoevaluaciones emocionales</li>
                <li>✔ Actividades personalizadas</li>
                <li>✔ Seguimiento continuo</li>
              </ul>

              <h3>Propósito</h3>
              <p>
                Promover el bienestar emocional y la salud mental mediante herramientas
                psicoeducativas que faciliten el autoconocimiento y la regulación emocional.
              </p>
            </div>

          </div>
        </div>
      </section>



      {/* FOOTER AJUSTADO */}
      <footer className="footer" id="contact">
        <div className="footer-highlight">
          <h2>Hablar puede salvar vidas</h2>
          <p>
            Recordemos la importancia de escuchar, acompañar y brindar apoyo
            emocional a quienes lo necesitan.
          </p>
        </div>

        <div className="footer-container">
          <div className="footer-section">
            <img
              src="/src/assets/common/logo-luda1.png"
              alt="LUDA"
              className="footer-logo"
            />
            <p>
              Plataforma psicoeducativa orientada al fortalecimiento del bienestar
              emocional y la salud mental en la comunidad educativa.
            </p>
          </div>

          <div className="footer-section">
            <h4>Enlaces rápidos</h4>
            <ul>
              <li><a href="#inicio">Inicio</a></li>
              <li><a href="#nosotros">Nosotros</a></li>
              <li><a href="#recursos">Recursos</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Servicios</h4>
            <ul>
              <li>Autoevaluaciones emocionales</li>
              <li>Gestión emocional</li>
              <li>Actividades psicoeducativas</li>
              <li>Acompañamiento preventivo</li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Contacto</h4>
            <ul>
              <li>luda.saludmental@gmail.com</li>
              <li>Ocaña, Colombia</li>
              <li>Proyecto Académico</li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          © 2026 LUDA · Proyecto académico con fines educativos
        </div>
      </footer>
          </div>
        } />
        <Route path="/login" element={<Login />} />
        
  {/* Rutas de Login */}
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        
        {/* Ruta Pública de Recursos */}
        <Route path="/recursos" element={<Recursos />} />

        {/* Rutas de Dashboard para Administrador */}
        <Route path="/dashboard/admin" element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }>
          <Route index element={<AdminHomePage />} />
          <Route path="usuarios" element={<AdminHomePage />} />
          <Route path="roles" element={<div>Gestión de Roles y Permisos</div>} />
          <Route path="recursos" element={<AdminRecursos />} />
          <Route path="configuracion" element={<div>Configuración del Sistema</div>} />
          <Route path="reportes" element={<div>Reportes del Sistema</div>} />
        </Route>

        {/* Rutas de Dashboard para Docente */}
        <Route path="/dashboard/docente" element={
          <ProtectedRoute requiredRole="docente">
            <DocenteDashboard />
          </ProtectedRoute>
        }>
          <Route index element={<DocenteHomePage />} />
          <Route path="perfil" element={<DocentePerfil />} />
          <Route path="estudiantes" element={<div>Gestión de Estudiantes</div>} />
          <Route path="actividades" element={<div>Actividades Docente</div>} />
          <Route path="reportes" element={<div>Reportes Docente</div>} />
          <Route path="configuracion" element={<div>Configuración Docente</div>} />
        </Route>

        {/* Rutas de Dashboard para Estudiante */}
        <Route path="/dashboard/estudiante" element={
          <ProtectedRoute requiredRole="estudiante">
            <EstudianteDashboard />
          </ProtectedRoute>
        }>
          <Route index element={<EstudianteHomePage />} />
          <Route path="perfil" element={<EstudiantePerfil />} />
          <Route path="bienestar" element={<EstudianteBienestar />} />
          <Route path="citas" element={<EstudianteCitas />} />
          <Route path="mensajes" element={<EstudianteMensajes />} />
          <Route path="recursos" element={<EstudianteRecursos />} />
          <Route path="experiencias-positivas" element={<EstudianteExperienciasPositivas />} />
        </Route>

        {/* Rutas de Dashboard para Psicoorientador */}
        <Route path="/dashboard/psicoorientador" element={
          <ProtectedRoute requiredRole="psicoorientador">
            <PsicoorientadorDashboard />
          </ProtectedRoute>
        }>
          <Route index element={<PsicoorientadorHomePage />} />
          <Route path="perfil" element={<PsicoorientadorPerfil />} />
          <Route path="pacientes" element={<div>Gestión de Pacientes</div>} />
          <Route path="sesiones" element={<PsicoorientadorSesiones />} />
          <Route path="evaluaciones" element={<div>Evaluaciones</div>} />
          <Route path="reportes" element={<div>Reportes Psicoorientador</div>} />
          <Route path="recursos" element={<div>Recursos Psicoorientador</div>} />
        </Route>
        
      </Routes>
    </Router>
  )
}

export default App;