import React, { useState, useEffect } from 'react';
import SimpleLoading from '../../../../components/ui/SimpleLoading';
import './Actividades.css';
import AuthService from '../../../../components/auth/AuthService';

const EstudianteActividades = () => {
  const [actividades, setActividades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('todas'); // todas, en_curso, completadas, pendientes

  useEffect(() => {
    fetchActividades();
  }, []);

  const fetchActividades = async () => {
    try {
      const token = AuthService.getToken();
      const response = await fetch('http://localhost:5000/api/estudiante/activities', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        setActividades(data.data);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredActividades = actividades.filter(actividad => {
    if (filter === 'todas') return true;
    return actividad.estado === filter;
  });

  const getActivityIcon = (tipo) => {
    const icons = {
      'mindfulness': '🧘',
      'diario_emociones': '📝',
      'manejo_estres': '🎯',
      'meditacion': '🌸',
      'ejercicio': '🏃',
      'social': '👥',
      'creatividad': '🎨',
      'aprendizaje': '📚'
    };
    return icons[tipo] || '📋';
  };

  const getEstadoColor = (estado) => {
    const colors = {
      'pendiente': '#fbbf24',
      'en_curso': '#3b82f6',
      'completada': '#10b981',
      'vencida': '#ef4444'
    };
    return colors[estado] || '#6b7280';
  };

  const getEstadoTexto = (estado) => {
    const textos = {
      'pendiente': 'Pendiente',
      'en_curso': 'En curso',
      'completada': 'Completada',
      'vencida': 'Vencida'
    };
    return textos[estado] || estado;
  };

  const handleStartActivity = (actividadId) => {
    // Lógica para iniciar actividad
    console.log('Iniciando actividad:', actividadId);
  };

  const handleCompleteActivity = (actividadId) => {
    // Lógica para marcar como completada
    console.log('Completando actividad:', actividadId);
  };

  if (loading) {
    return <SimpleLoading text="Cargando actividades..." />;
  }

  return (
    <div className="actividades-container">
      <div className="actividades-header">
        <h1>Mis Actividades</h1>
        <p>Explora y completa las actividades de bienestar asignadas por tu docente</p>
      </div>

      {/* Filtros */}
      <div className="filtros-container">
        <div className="filtro-buttons">
          <button 
            className={`filtro-btn ${filter === 'todas' ? 'active' : ''}`}
            onClick={() => setFilter('todas')}
          >
            Todas ({actividades.length})
          </button>
          <button 
            className={`filtro-btn ${filter === 'en_curso' ? 'active' : ''}`}
            onClick={() => setFilter('en_curso')}
          >
            En curso ({actividades.filter(a => a.estado === 'en_curso').length})
          </button>
          <button 
            className={`filtro-btn ${filter === 'completadas' ? 'active' : ''}`}
            onClick={() => setFilter('completadas')}
          >
            Completadas ({actividades.filter(a => a.estado === 'completada').length})
          </button>
          <button 
            className={`filtro-btn ${filter === 'pendiente' ? 'active' : ''}`}
            onClick={() => setFilter('pendiente')}
          >
            Pendientes ({actividades.filter(a => a.estado === 'pendiente').length})
          </button>
        </div>
      </div>

      {/* Lista de actividades */}
      <div className="actividades-list">
        {filteredActividades.length > 0 ? (
          filteredActividades.map(actividad => (
            <div key={actividad._id} className="actividad-card">
              <div className="actividad-header">
                <div className="actividad-icon">
                  {getActivityIcon(actividad.tipo)}
                </div>
                <div className="actividad-info">
                  <h3>{actividad.titulo}</h3>
                  <p className="actividad-descripcion">{actividad.descripcion}</p>
                  <div className="actividad-meta">
                    <span className="actividad-fecha">
                      Asignada: {new Date(actividad.fechaAsignacion).toLocaleDateString()}
                    </span>
                    {actividad.fechaLimite && (
                      <span className="actividad-limite">
                        Límite: {new Date(actividad.fechaLimite).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <div className="actividad-estado">
                  <span 
                    className="estado-badge"
                    style={{ backgroundColor: getEstadoColor(actividad.estado) }}
                  >
                    {getEstadoTexto(actividad.estado)}
                  </span>
                </div>
              </div>

              {actividad.estado === 'en_curso' && (
                <div className="actividad-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${actividad.progreso || 0}%` }}
                    ></div>
                  </div>
                  <span className="progress-text">{actividad.progreso || 0}% completado</span>
                </div>
              )}

              <div className="actividad-actions">
                {actividad.estado === 'pendiente' && (
                  <button 
                    className="action-btn primary"
                    onClick={() => handleStartActivity(actividad._id)}
                  >
                    Comenzar Actividad
                  </button>
                )}
                {actividad.estado === 'en_curso' && (
                  <button 
                    className="action-btn primary"
                    onClick={() => handleCompleteActivity(actividad._id)}
                  >
                    Continuar
                  </button>
                )}
                {actividad.estado === 'completada' && (
                  <button className="action-btn secondary" disabled>
                    Completada
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="no-actividades">
            <div className="no-actividades-icon">📋</div>
            <h3>No hay actividades</h3>
            <p>
              {filter === 'todas' 
                ? 'No tienes actividades asignadas todavía.' 
                : `No tienes actividades ${filter === 'en_curso' ? 'en curso' : filter === 'completadas' ? 'completadas' : 'pendientes'}.`
              }
            </p>
            {filter !== 'todas' && (
              <button 
                className="ver-todas-btn"
                onClick={() => setFilter('todas')}
              >
                Ver todas las actividades
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EstudianteActividades;
