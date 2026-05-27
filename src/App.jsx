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
import Recursos from './pages/recursos/Recursos'

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

/* ─── Iconos SVG inline reutilizables ─────────────────────── */
const Icon = ({ path, size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round"
    strokeLinejoin="round" aria-hidden="true">
    {path}
  </svg>
)

const ICONS = {
  heart:    <><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></>,
  users:    <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>,
  book:     <><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></>,
  calendar: <><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>,
  check:    <><polyline points="20 6 9 17 4 12"/></>,
  target:   <><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></>,
  smile:    <><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></>,
  shield:   <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></>,
  school:   <><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></>,
  handshake:<><path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z"/></>,
  clip:     <><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><polyline points="9 11 11 13 15 9"/></>,
  mail:     <><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></>,
  user:     <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
}

const LandingPage = () => (
  <div className="landing">

    {/* ── Navbar ── */}
    <header className="lp-nav">
      <div className="lp-nav-inner">
        <div className="lp-brand">
          <div className="lp-logo-pill">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              {ICONS.heart}
            </svg>
          </div>
          <span className="lp-brand-name">LUDA</span>
        </div>
        <nav aria-label="Navegación principal">
          <ul className="lp-nav-links">
            <li><a href="#inicio">Inicio</a></li>
            <li><a href="#nosotros">Nosotros</a></li>
            <li><a href="#recursos">Recursos</a></li>
            <li>
              <Link to="/login" className="lp-nav-cta">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{ICONS.user}</svg>
                Iniciar sesión
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>

    {/* ── Hero ── */}
    <section className="lp-hero" id="inicio" aria-labelledby="hero-title">
      <div className="hero-blob hero-blob-1" />
      <div className="hero-blob hero-blob-2" />
      <div className="hero-blob hero-blob-3" />

      <div className="hero-inner">
        <div className="hero-text">
          <div className="hero-label">Bienestar mental escolar</div>
          <h1 id="hero-title">
            Cuida tu <span className="hero-accent">Bienestar</span><br />mental
          </h1>
          <p>
            Una herramienta psicoeducativa diseñada para acompañar a estudiantes,
            docentes y orientadores en el fortalecimiento de la salud mental
            dentro del entorno escolar.
          </p>
          <div className="hero-btns">
            <Link to="/login" className="btn-primary-hero">Comenzar ahora</Link>
            <a href="#nosotros" className="btn-secondary-hero">Conocer más</a>
          </div>
        </div>

        <div className="hero-pills" aria-label="Roles en la plataforma">
          {[
            { icon: ICONS.school,     color: 'purple', title: 'Estudiantes',     desc: 'Espacio seguro emocional' },
            { icon: ICONS.book,       color: 'teal',   title: 'Docentes',        desc: 'Apoyo en el aula' },
            { icon: ICONS.handshake,  color: 'blue',   title: 'Orientadores',    desc: 'Seguimiento y sesiones' },
          ].map((p) => (
            <div className={`hero-pill hp-${p.color}`} key={p.title}>
              <div className="hp-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{p.icon}</svg>
              </div>
              <div>
                <p className="hp-title">{p.title}</p>
                <p className="hp-desc">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* ── Nosotros ── */}
    <section className="lp-section" id="nosotros" aria-labelledby="nosotros-title">
      <div className="lp-container">
        <div className="section-label">Nosotros</div>
        <h2 id="nosotros-title" className="section-title">¿Qué es LUDA?</h2>
        <p className="section-sub">
          Un aplicativo web psicoeducativo orientado a la prevención, el
          acompañamiento y el fortalecimiento del bienestar emocional.
        </p>
        <div className="nosotros-grid">
          <div className="nosotros-img-box" aria-hidden="true">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#534AB7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              {ICONS.shield}
            </svg>
          </div>
          <div className="nosotros-body">
            <p>
              LUDA es un aplicativo web psicoeducativo orientado a la prevención,
              el acompañamiento y el fortalecimiento del bienestar emocional en
              la comunidad educativa.
            </p>
            <p>
              A través de herramientas digitales, LUDA promueve el autoconocimiento,
              la regulación emocional y la detección temprana de posibles
              dificultades emocionales dentro del entorno escolar.
            </p>
          </div>
        </div>
      </div>
    </section>

    {/* ── Dirigido a ── */}
    <section className="lp-dirigido" aria-labelledby="dirigido-title">
      <div className="lp-container">
        <p id="dirigido-title" className="section-label-sm">¿A quién va dirigido?</p>
        <div className="rol-cards">
          {[
            { icon: ICONS.school,    color: 'purple', title: 'Estudiantes',      desc: 'Un espacio seguro para reconocer sus emociones, fortalecer el autoconocimiento y aprender estrategias de autocuidado emocional.' },
            { icon: ICONS.book,      color: 'teal',   title: 'Docentes',         desc: 'Una herramienta de apoyo que facilita el acompañamiento emocional en el aula y la identificación temprana de señales de alerta.' },
            { icon: ICONS.handshake, color: 'blue',   title: 'Psicoorientadores',desc: 'Un sistema que permite el seguimiento emocional, la orientación y el apoyo psicoeducativo dentro de la institución.' },
          ].map((r) => (
            <div className="rol-card" key={r.title}>
              <div className={`rol-ico ri-${r.color}`}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{r.icon}</svg>
              </div>
              <h3>{r.title}</h3>
              <p>{r.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* ── Recursos / Servicios ── */}
    <section className="lp-recursos" id="recursos" aria-labelledby="recursos-title">
      <div className="lp-container">
        <div className="section-label">Recursos</div>
        <h2 id="recursos-title" className="section-title">Nuestros servicios</h2>
        <p className="section-sub">
          Herramientas psicoeducativas para el bienestar emocional de toda la comunidad.
        </p>
        <div className="rec-grid">
          {[
            { icon: ICONS.calendar, color: 'teal',   title: 'Gestión de citas',    desc: 'Organiza y agenda citas de acompañamiento psicoeducativo de forma clara y segura.' },
            { icon: ICONS.clip,     color: 'purple', title: 'Autoevaluaciones',     desc: 'Instrumentos para identificar estados emocionales y necesidades de apoyo.' },
            { icon: ICONS.smile,    color: 'coral',  title: 'Gestión emocional',    desc: 'Herramientas para registrar, comprender y gestionar mejor tus emociones.' },
            { icon: ICONS.target,   color: 'blue',   title: 'Actividades',          desc: 'Actividades psicoeducativas para fortalecer el autoconocimiento y el bienestar.' },
          ].map((r) => (
            <div className="rec-card" key={r.title}>
              <div className={`rec-ico rci-${r.color}`}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{r.icon}</svg>
              </div>
              <h3>{r.title}</h3>
              <p>{r.desc}</p>
            </div>
          ))}
        </div>
        <div className="rec-cta">
          <Link to="/recursos#carousel" className="btn-rec">Ver recursos psicoeducativos</Link>
        </div>
      </div>
    </section>

    {/* ── Sobre el proyecto ── */}
    <section className="lp-sobre" aria-labelledby="sobre-title">
      <div className="lp-container">
        <div className="section-label">Sobre el proyecto</div>
        <h2 id="sobre-title" className="section-title">Todo lo que necesitas saber</h2>
        <div className="sobre-grid">
          <div className="sobre-card sc-light">
            <h3>¿Qué significa LUDA?</h3>
            <p>
              LUDA impulsa el acompañamiento psicoeducativo, promoviendo la salud
              mental y emocional en la comunidad escolar.
            </p>
          </div>
          <div className="sobre-card sc-primary">
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
          </div>
          <div className="sobre-card sc-light">
            <h3>¿Cómo funciona?</h3>
            <ul className="check-list">
              {['Acceso seguro a la plataforma', 'Herramientas según el rol', 'Autoevaluaciones emocionales', 'Actividades personalizadas', 'Seguimiento continuo'].map((item) => (
                <li key={item} className="check-item">
                  <div className="check-dot" aria-hidden="true">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#0F6E56" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{ICONS.check}</svg>
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>

    {/* ── Footer ── */}
    <footer className="lp-footer" id="contact">
      <div className="lp-container">
        <div className="footer-highlight">
          <div className="fh-text">
            <h2>Hablar puede salvar vidas</h2>
            <p>Recordemos la importancia de escuchar, acompañar y brindar apoyo emocional a quienes lo necesitan.</p>
          </div>
          <Link to="/login" className="fh-cta">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{ICONS.user}</svg>
            Iniciar sesión
          </Link>
        </div>

        <div className="footer-grid">
          <div className="footer-brand">
            <div className="footer-logo-row">
              <div className="footer-logo-pill">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{ICONS.heart}</svg>
              </div>
              <span>LUDA</span>
            </div>
            <p>
              Plataforma psicoeducativa orientada al fortalecimiento del
              bienestar emocional y la salud mental en la comunidad educativa.
            </p>
          </div>
          <div className="footer-col">
            <h4>Navegación</h4>
            <ul>
              <li><a href="#inicio">Inicio</a></li>
              <li><a href="#nosotros">Nosotros</a></li>
              <li><a href="#recursos">Recursos</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Servicios</h4>
            <ul>
              <li>Autoevaluaciones emocionales</li>
              <li>Gestión emocional</li>
              <li>Actividades psicoeducativas</li>
              <li>Acompañamiento preventivo</li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Contacto</h4>
            <ul>
              <li>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{ICONS.mail}</svg>
                luda.saludmental@gmail.com
              </li>
              <li>Ocaña, Colombia</li>
              <li>Proyecto académico</li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          © 2026 LUDA · Proyecto académico con fines educativos
        </div>
      </div>
    </footer>

  </div>
)

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/recursos" element={<Recursos />} />

        {/* Dashboard Administrador */}
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

        {/* Dashboard Docente */}
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

        {/* Dashboard Estudiante */}
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

        {/* Dashboard Psicoorientador */}
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

export default App