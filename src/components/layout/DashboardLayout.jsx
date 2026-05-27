import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import './DashboardLayout.css';
import AuthService from '../auth/AuthService';

const DashboardLayout = ({ userRole }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    AuthService.logout();
    navigate('/login', { replace: true });
  };

  const menuItems = {
    admin: [
      { path: '/dashboard/admin', name: 'Inicio', icon: '🏠' },
      { path: '/dashboard/admin/usuarios', name: 'Usuarios', icon: '👥' },
      { path: '/dashboard/admin/roles', name: 'Roles y Permisos', icon: '🔐' },
      { path: '/dashboard/admin/recursos', name: 'Recursos', icon: '📚' },
      { path: '/dashboard/admin/configuracion', name: 'Configuración', icon: '⚙️' },
      { path: '/dashboard/admin/reportes', name: 'Reportes', icon: '📊' },
    ],
    docente: [
      { path: '/dashboard/docente', name: 'Inicio', icon: '🏠' },
      { path: '/dashboard/docente/perfil', name: 'Mi Perfil', icon: '👤' },
      { path: '/dashboard/docente/estudiantes', name: 'Estudiantes', icon: '👥' },
      { path: '/dashboard/docente/actividades', name: 'Actividades', icon: '📚' },
      { path: '/dashboard/docente/reportes', name: 'Reportes', icon: '📊' },
      { path: '/dashboard/docente/configuracion', name: 'Configuración', icon: '⚙️' },
    ],
    estudiante: [
      { path: '/dashboard/estudiante', name: 'Inicio', icon: '🏠' },
      { path: '/dashboard/estudiante/perfil', name: 'Mi Perfil', icon: '👤' },
      { path: '/dashboard/estudiante/bienestar', name: 'Mi Bienestar', icon: '🧠' },
      { path: '/dashboard/estudiante/citas', name: 'Mis Citas', icon: '📅' },
      { path: '/dashboard/estudiante/experiencias-positivas', name: 'Experiencias Positivas', icon: '🌟' },
    ],

    psicoorientador: [
      { path: '/dashboard/psicoorientador', name: 'Inicio', icon: '🏠' },
      { path: '/dashboard/psicoorientador/perfil', name: 'Mi Perfil', icon: '👤' },
      { path: '/dashboard/psicoorientador/pacientes', name: 'Pacientes', icon: '👥' },
      { path: '/dashboard/psicoorientador/sesiones', name: 'Sesiones', icon: '🗓️' },
      { path: '/dashboard/psicoorientador/evaluaciones', name: 'Evaluaciones', icon: '📋' },
      { path: '/dashboard/psicoorientador/reportes', name: 'Reportes', icon: '📊' },
      { path: '/dashboard/psicoorientador/recursos', name: 'Recursos', icon: '📚' },
    ]
  };

  const currentMenu = menuItems[userRole] || [];

  const getRoleDisplayName = (role) => {
    const roleNames = {
      admin: 'Administrador',
      docente: 'Docente',
      estudiante: 'Estudiante',
      psicoorientador: 'Psicoorientador'
    };
    return roleNames[role] || 'Usuario';
  };

  return (
    <div className="dashboard-layout">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <button 
            className="menu-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            ☰
          </button>
          <div className="header-logo">
            <img src="/src/assets/common/logo-luda.png" alt="LUDA" className="header-logo-img" />
            <span className="header-title">LUDA</span>
          </div>
        </div>
        
        <div className="header-right">
          <div className="user-info">
            <span className="user-role">{getRoleDisplayName(userRole)}</span>
            <div className="user-avatar">
              <img src="/src/assets/common/usuario.png" alt="Usuario" className="avatar-img" />
            </div>
          </div>
          <button onClick={handleLogout} className="logout-btn">
            Cerrar Sesión
          </button>
        </div>
      </header>

      {/* Sidebar */}
      <aside className={`dashboard-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <nav className="sidebar-nav">
          <ul className="nav-list">
            {currentMenu.map((item, index) => (
              <li key={index} className="nav-item">
                <Link 
                  to={item.path} 
                  className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-text">{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className={`dashboard-main ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <div className="main-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;