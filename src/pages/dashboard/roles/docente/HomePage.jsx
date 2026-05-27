import React, { useState, useEffect } from 'react';
import './HomePage.css';
import AuthService from '../../../../components/auth/AuthService';

const DocenteHomePage = () => {
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    const user = AuthService.getUserInfo();
    if (user) {
      setUserName(user.name || 'Docente');
      setUserRole(user.role || 'docente');
    }
  }, []);

  return (
    <div className="docente-home">
      <div className="welcome-section">
        <h1>¡Bienvenido/a, {userName}!</h1>
        <p>Gestiona tus estudiantes y actividades desde aquí</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <h3>25</h3>
            <p>Estudiantes Activos</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">📚</div>
          <div className="stat-info">
            <h3>12</h3>
            <p>Actividades Creadas</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <h3>89%</h3>
            <p>Tasa de Completación</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-info">
            <h3>4.8</h3>
            <p>Calificación Promedio</p>
          </div>
        </div>
      </div>

      <div className="content-grid">
        <div className="recent-activities">
          <h2>Actividades Recientes</h2>
          <div className="activity-list">
            <div className="activity-item">
              <div className="activity-icon">📝</div>
              <div className="activity-details">
                <h4>Evaluación de Bienestar</h4>
                <p>15 estudiantes completaron</p>
                <span className="activity-time">Hace 2 horas</span>
              </div>
            </div>
            
            <div className="activity-item">
              <div className="activity-icon">🎯</div>
              <div className="activity-details">
                <h4>Taller de Manejo del Estrés</h4>
                <p>8 estudiantes inscritos</p>
                <span className="activity-time">Hace 5 horas</span>
              </div>
            </div>
            
            <div className="activity-item">
              <div className="activity-icon">💬</div>
              <div className="activity-details">
                <h4>Foro de Discusión</h4>
                <p>23 nuevos mensajes</p>
                <span className="activity-time">Ayer</span>
              </div>
            </div>
          </div>
        </div>

        <div className="quick-actions">
          <h2>Acciones Rápidas</h2>
          <div className="action-buttons">
            <button className="action-btn primary">
              <span className="btn-icon">➕</span>
              Crear Nueva Actividad
            </button>
            <button className="action-btn secondary">
              <span className="btn-icon">📋</span>
              Ver Reportes
            </button>
            <button className="action-btn secondary">
              <span className="btn-icon">👥</span>
              Gestionar Estudiantes
            </button>
            <button className="action-btn secondary">
              <span className="btn-icon">📧</span>
              Enviar Notificación
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocenteHomePage;
