import React, { useState, useEffect } from 'react';
import './HomePage.css';
import AuthService from '../../../../components/auth/AuthService';

const PsicoorientadorHomePage = () => {
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    const user = AuthService.getUserInfo();
    if (user) {
      setUserName(user.name || 'Psicoorientador');
      setUserRole(user.role || 'psicoorientador');
    }
  }, []);

  return (
    <div className="psicoorientador-home">
      <div className="welcome-section">
        <h1>¡Bienvenido/a, {userName}!</h1>
        <p>Gestiona el bienestar emocional de tu comunidad</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <h3>48</h3>
            <p>Pacientes Activos</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">🗓️</div>
          <div className="stat-info">
            <h3>12</h3>
            <p>Sesiones Hoy</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <h3>85%</h3>
            <p>Tasa de Asistencia</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">⚡</div>
          <div className="stat-info">
            <h3>6</h3>
            <p>Casos Urgentes</p>
          </div>
        </div>
      </div>

      <div className="content-grid">
        <div className="upcoming-sessions">
          <h2>Próximas Sesiones</h2>
          <div className="session-list">
            <div className="session-item urgent">
              <div className="session-time">
                <span className="time">09:00</span>
                <span className="date">Hoy</span>
              </div>
              <div className="session-details">
                <h4>María González - 10°A</h4>
                <p>Sesión de manejo de ansiedad</p>
                <div className="session-tags">
                  <span className="tag urgent">Urgente</span>
                  <span className="tag">Individual</span>
                </div>
              </div>
              <button className="session-action">Iniciar</button>
            </div>
            
            <div className="session-item">
              <div className="session-time">
                <span className="time">10:30</span>
                <span className="date">Hoy</span>
              </div>
              <div className="session-details">
                <h4>Grupo 8°B - Taller</h4>
                <p>Técnicas de estudio y concentración</p>
                <div className="session-tags">
                  <span className="tag">Grupal</span>
                  <span className="tag">8 estudiantes</span>
                </div>
              </div>
              <button className="session-action">Ver</button>
            </div>
            
            <div className="session-item">
              <div className="session-time">
                <span className="time">14:00</span>
                <span className="date">Hoy</span>
              </div>
              <div className="session-details">
                <h4>Juan Pérez - 11°C</h4>
                <p>Seguimiento de progreso</p>
                <div className="session-tags">
                  <span className="tag">Individual</span>
                  <span className="tag">Seguimiento</span>
                </div>
              </div>
              <button className="session-action">Ver</button>
            </div>
          </div>
        </div>

        <div className="quick-actions">
          <h2>Acciones Rápidas</h2>
          <div className="action-buttons">
            <button className="action-btn primary">
              <span className="btn-icon">➕</span>
              Nueva Sesión
            </button>
            <button className="action-btn secondary">
              <span className="btn-icon">👥</span>
              Ver Pacientes
            </button>
            <button className="action-btn secondary">
              <span className="btn-icon">📋</span>
              Evaluaciones
            </button>
            <button className="action-btn secondary">
              <span className="btn-icon">📊</span>
              Reportes
            </button>
          </div>
        </div>
      </div>

      <div className="alerts-section">
        <h2>Alertas y Seguimientos</h2>
        <div className="alerts-grid">
          <div className="alert-card critical">
            <div className="alert-icon">⚠️</div>
            <div className="alert-content">
              <h4>Caso Crítico</h4>
              <p>Carlos Rodríguez - Bajo rendimiento académico y signos de depresión</p>
              <span className="alert-time">Hace 2 horas</span>
            </div>
            <button className="alert-action">Intervenir</button>
          </div>
          
          <div className="alert-card warning">
            <div className="alert-icon">📈</div>
            <div className="alert-content">
              <h4>Progreso Positivo</h4>
              <p>Ana Martínez - Mejora significativa en manejo del estrés</p>
              <span className="alert-time">Ayer</span>
            </div>
            <button className="alert-action">Revisar</button>
          </div>
          
          <div className="alert-card info">
            <div className="alert-icon">📅</div>
            <div className="alert-content">
              <h4>Recordatorio</h4>
              <p>Reunión semanal con equipo docente mañana 10:00</p>
              <span className="alert-time">Hoy</span>
            </div>
            <button className="alert-action">Agendar</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PsicoorientadorHomePage;
