import React, { useState, useEffect } from 'react';
import SimpleLoading from '../../../../components/ui/SimpleLoading';
import './HomePage.css';
import AuthService from '../../../../components/auth/AuthService';

const EstudianteHomePage = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    actividadesCompletadas: 0,
    nivelBienestar: 'Bueno',
    proximaCita: null
  });
  const [actividadesEnCurso, setActividadesEnCurso] = useState([]);
  const [mensajesMotivacionales, setMensajesMotivacionales] = useState([]);

  useEffect(() => {
    fetchUserInfo();
    fetchDashboardData();
  }, []);

  const fetchUserInfo = () => {
    const user = AuthService.getUserInfo();
    if (user) {
      setUserInfo(user);
    }
    setLoading(false);
  };

  const fetchDashboardData = async () => {
    try {
      const token = AuthService.getToken();
      
      // Fetch estadísticas del estudiante
      const statsResponse = await fetch('http://localhost:5000/api/estudiante/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.data);
      }

      // Fetch actividades en curso
      const actividadesResponse = await fetch('http://localhost:5000/api/estudiante/actividades/activas', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (actividadesResponse.ok) {
        const actividadesData = await actividadesResponse.json();
        setActividadesEnCurso(actividadesData.data || []);
      }

      // Fetch mensajes motivacionales
      const mensajesResponse = await fetch('http://localhost:5000/api/estudiante/mensajes/motivacionales', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (mensajesResponse.ok) {
        const mensajesData = await mensajesResponse.json();
        setMensajesMotivacionales(mensajesData.data || []);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const getBienestarColor = (nivel) => {
    const colores = {
      'Excelente': '#10b981',
      'Bueno': '#3b82f6',
      'Regular': '#f59e0b',
      'Preocupante': '#ef4444'
    };
    return colores[nivel] || '#6b7280';
  };

  const getBienestarIcon = (nivel) => {
    const iconos = {
      'Excelente': '😊',
      'Bueno': '�',
      'Regular': '😐',
      'Preocupante': '😟'
    };
    return iconos[nivel] || '�';
  };

  const handleSolicitarCita = () => {
    // Navegar a la página de citas
    window.location.href = '/dashboard/estudiante/citas';
  };

  const handleIrChat = () => {
    // Navegar al chat
    window.location.href = '/dashboard/estudiante/chat';
  };

  const handleIrExperiencias = () => {
    // Navegar a experiencias positivas
    window.location.href = '/dashboard/estudiante/experiencias-positivas';
  };

  if (loading) {
    return <SimpleLoading text="Cargando dashboard..." />;
  }

  return (
    <div className="estudiante-home">
      {/* Bienvenida */}
      <div className="dashboard-welcome">
        <h1>¡Hola, {userInfo?.name || 'Estudiante'}! 👋</h1>
        <p>Estamos aquí para acompañarte en tu bienestar emocional</p>
      </div>

      {/* Indicadores Principales */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            📊
          </div>
          <div className="stat-content">
            <h3>Actividades Completadas</h3>
            <div className="stat-number">{stats.actividadesCompletadas}%</div>
            <div className="stat-label">Progreso general</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            {getBienestarIcon(stats.nivelBienestar)}
          </div>
          <div className="stat-content">
            <h3>Nivel de Bienestar</h3>
            <div 
              className="stat-number" 
              style={{ color: getBienestarColor(stats.nivelBienestar) }}
            >
              {stats.nivelBienestar}
            </div>
            <div className="stat-label">Estado emocional</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            📅
          </div>
          <div className="stat-content">
            <h3>Próxima Cita</h3>
            <div className="stat-date">
              {stats.proximaCita 
                ? new Date(stats.proximaCita).toLocaleDateString('es', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                : 'No agendada'
              }
            </div>
            <div className="stat-label">
              {stats.proximaCita ? 'Próxima sesión' : 'Solicitar cita'}
            </div>
          </div>
        </div>
      </div>

      {/* Secciones del Dashboard */}
      <div className="dashboard-sections">
        {/* Actividades en Curso */}
        <div className="activities-section">
          <h2>📝 Actividades en Curso</h2>
          {actividadesEnCurso.length > 0 ? (
            <div className="activities-list">
              {actividadesEnCurso.slice(0, 3).map((actividad, index) => (
                <div key={actividad._id || index} className="activity-item">
                  <div className="activity-icon">📚</div>
                  <div className="activity-info">
                    <h4>{actividad.titulo}</h4>
                    <p>{actividad.descripcion}</p>
                    <div className="activity-progress">
                      <div className="progress-bar-small">
                        <div 
                          className="progress-fill-small" 
                          style={{ width: `${actividad.progreso || 0}%` }}
                        ></div>
                      </div>
                      <span>{actividad.progreso || 0}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-activities">
              <p>No tienes actividades en curso</p>
            </div>
          )}
        </div>

        {/* Frases Motivacionales o Mensajes del Docente */}
        <div className="messages-section">
          <h2>💬 Mensajes de Apoyo</h2>
          {mensajesMotivacionales.length > 0 ? (
            <div className="messages-list">
              {mensajesMotivacionales.slice(0, 2).map((mensaje, index) => (
                <div key={mensaje._id || index} className="message-item">
                  <div className="message-icon">💝</div>
                  <div className="message-content">
                    <p>{mensaje.contenido}</p>
                    <span className="message-author">
                      - {mensaje.remitente?.name || 'Tu docente'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-messages">
              <p>No tienes mensajes nuevos</p>
            </div>
          )}
        </div>
      </div>

      {/* Acciones Rápidas */}
      <div className="quick-actions">
        <h2>🚀 Acciones Rápidas</h2>
        <div className="action-buttons">
          <button className="action-btn primary" onClick={handleSolicitarCita}>
            <span className="btn-icon">📅</span>
            Solicitar Cita
          </button>
          <button className="action-btn primary" onClick={handleIrChat}>
            <span className="btn-icon">💬</span>
            Ir al Chat
          </button>
          <button className="action-btn secondary" onClick={handleIrExperiencias}>
            <span className="btn-icon">🌟</span>
            Experiencias Positivas
          </button>
        </div>
      </div>
    </div>
  );
};

export default EstudianteHomePage;
