import React, { useState, useEffect } from 'react';
import SimpleLoading from '../../../../components/ui/SimpleLoading';
import './Mensajes.css';
import AuthService from '../../../../components/auth/AuthService';

const EstudianteMensajes = () => {
  const [mensajes, setMensajes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMensajes();
  }, []);

  const fetchMensajes = async () => {
    try {
      const token = AuthService.getToken();
      const response = await fetch('http://localhost:5000/api/estudiante/messages', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        setMensajes(data.data);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMensajeIcon = (tipo) => {
    const icons = {
      'motivacional': '💪',
      'observacion': '👁️',
      'recordatorio': '⏰',
      'felicitacion': '🎉',
      'consejo': '💡',
      'aviso': '📢'
    };
    return icons[tipo] || '💬';
  };

  const getMensajeColor = (tipo) => {
    const colors = {
      'motivacional': '#10b981',
      'observacion': '#3b82f6',
      'recordatorio': '#f59e0b',
      'felicitacion': '#ec4899',
      'consejo': '#8b5cf6',
      'aviso': '#ef4444'
    };
    return colors[tipo] || '#6b7280';
  };

  const formatFecha = (fecha) => {
    const mensajeFecha = new Date(fecha);
    const hoy = new Date();
    const ayer = new Date(hoy);
    ayer.setDate(ayer.getDate() - 1);

    if (mensajeFecha.toDateString() === hoy.toDateString()) {
      return 'Hoy';
    } else if (mensajeFecha.toDateString() === ayer.toDateString()) {
      return 'Ayer';
    } else {
      return mensajeFecha.toLocaleDateString('es', { 
        day: 'numeric', 
        month: 'short', 
        year: mensajeFecha.getFullYear() !== hoy.getFullYear() ? 'numeric' : undefined 
      });
    }
  };

  const groupMensajesPorFecha = () => {
    const grupos = {};
    mensajes.forEach(mensaje => {
      const fecha = formatFecha(mensaje.fecha);
      if (!grupos[fecha]) {
        grupos[fecha] = [];
      }
      grupos[fecha].push(mensaje);
    });
    return grupos;
  };

  if (loading) {
    return <SimpleLoading text="Cargando mensajes..." />;
  }

  const mensajesAgrupados = groupMensajesPorFecha();

  return (
    <div className="mensajes-container">
      <div className="mensajes-header">
        <h1>Mensajes del Docente</h1>
        <p>Observaciones emocionales y mensajes motivacionales de tu docente</p>
      </div>

      {Object.keys(mensajesAgrupados).length > 0 ? (
        <div className="mensajes-list">
          {Object.entries(mensajesAgrupados).map(([fecha, mensajesDelDia]) => (
            <div key={fecha} className="mensajes-dia">
              <div className="fecha-separador">
                <span>{fecha}</span>
              </div>
              
              {mensajesDelDia.map(mensaje => (
                <div key={mensaje._id} className="mensaje-card">
                  <div className="mensaje-header">
                    <div 
                      className="mensaje-icon"
                      style={{ backgroundColor: getMensajeColor(mensaje.tipo) }}
                    >
                      {getMensajeIcon(mensaje.tipo)}
                    </div>
                    <div className="mensaje-info">
                      <h3 className="mensaje-titulo">{mensaje.titulo}</h3>
                      <p className="mensaje-hora">
                        {new Date(mensaje.fecha).toLocaleTimeString('es', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                    <div className="mensaje-tipo">
                      <span 
                        className="tipo-badge"
                        style={{ color: getMensajeColor(mensaje.tipo) }}
                      >
                        {mensaje.tipo}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mensaje-contenido">
                    <p className="mensaje-texto">{mensaje.contenido}</p>
                  </div>

                  {mensaje.actividades && mensaje.actividades.length > 0 && (
                    <div className="mensaje-actividades">
                      <h4>Actividades relacionadas:</h4>
                      <ul>
                        {mensaje.actividades.map((actividad, index) => (
                          <li key={index}>{actividad}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {mensaje.recomendaciones && mensaje.recomendaciones.length > 0 && (
                    <div className="mensaje-recomendaciones">
                      <h4>Recomendaciones:</h4>
                      <ul>
                        {mensaje.recomendaciones.map((recomendacion, index) => (
                          <li key={index}>{recomendacion}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div className="no-mensajes">
          <div className="no-mensajes-icon">💬</div>
          <h3>No tienes mensajes</h3>
          <p>Tu docente te enviará mensajes motivacionales y observaciones aquí</p>
          <div className="mensajes-info">
            <div className="info-item">
              <span className="info-icon">💪</span>
              <div className="info-content">
                <h4>Mensajes Motivacionales</h4>
                <p>Frases y palabras de aliento para mantenerte motivado</p>
              </div>
            </div>
            <div className="info-item">
              <span className="info-icon">👁️</span>
              <div className="info-content">
                <h4>Observaciones Emocionales</h4>
                <p>Comentarios sobre tu progreso y estado emocional</p>
              </div>
            </div>
            <div className="info-item">
              <span className="info-icon">⏰</span>
              <div className="info-content">
                <h4>Recordatorios</h4>
                <p>Avisos sobre actividades y fechas importantes</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EstudianteMensajes;
