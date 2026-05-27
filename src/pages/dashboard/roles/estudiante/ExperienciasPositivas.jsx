import React, { useState, useEffect, useRef } from 'react';
import SimpleLoading from '../../../../components/ui/SimpleLoading';
import './ExperienciasPositivas.css';
import AuthService from '../../../../components/auth/AuthService';

const ExperienciasPositivas = () => {
  const [experiencias, setExperiencias] = useState([]);
  const [nuevaExperiencia, setNuevaExperiencia] = useState('');
  const [esAnonimo, setEsAnonimo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [mensajeDelDia, setMensajeDelDia] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchExperiencias();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [experiencias]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchExperiencias = async () => {
    try {
      setLoading(true);
      const token = AuthService.getToken();
      const response = await fetch('http://localhost:5000/api/estudiante/experiencias-positivas', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        setExperiencias(data.data);
        setMensajeDelDia(data.mensajeDelDia);
      }
    } catch (error) {
      console.error('Error fetching experiencias:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePublicarExperiencia = async (e) => {
    e.preventDefault();
    
    if (!nuevaExperiencia.trim()) return;

    try {
      setSending(true);
      const token = AuthService.getToken();
      const response = await fetch('http://localhost:5000/api/estudiante/experiencias-positivas', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          contenido: nuevaExperiencia.trim(),
          esAnonimo: esAnonimo
        })
      });

      const data = await response.json();
      if (data.success) {
        setNuevaExperiencia('');
        setEsAnonimo(false);
        fetchExperiencias(); // Refrescar experiencias
      } else {
        alert(data.message || 'Error al publicar experiencia');
      }
    } catch (error) {
      console.error('Error publishing experience:', error);
      alert('Error de conexión al publicar experiencia');
    } finally {
      setSending(false);
    }
  };

  const handleReaccion = async (experienciaId, tipoReaccion) => {
    try {
      const token = AuthService.getToken();
      const response = await fetch(`http://localhost:5000/api/estudiante/experiencias-positivas/${experienciaId}/reaccion`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ tipoReaccion })
      });

      const data = await response.json();
      if (data.success) {
        fetchExperiencias(); // Refrescar para actualizar reacciones
      }
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  const formatHora = (fecha) => {
    return new Date(fecha).toLocaleTimeString('es', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatFecha = (fecha) => {
    const experienciaFecha = new Date(fecha);
    const hoy = new Date();
    
    if (experienciaFecha.toDateString() === hoy.toDateString()) {
      return 'Hoy';
    } else {
      return experienciaFecha.toLocaleDateString('es', { 
        day: 'numeric', 
        month: 'short' 
      });
    }
  };

  const getReaccionIcon = (tipo) => {
    switch (tipo) {
      case 'me_gusta': return '❤️';
      case 'me_inspira': return '✨';
      case 'gracias': return '🙏';
      default: return '👍';
    }
  };

  const getReaccionText = (tipo) => {
    switch (tipo) {
      case 'me_gusta': return 'Me gusta';
      case 'me_inspira': return 'Me inspira';
      case 'gracias': return 'Gracias';
      default: return 'Me gusta';
    }
  };

  if (loading) {
    return <SimpleLoading text="Cargando experiencias positivas..." />;
  }

  return (
    <div className="experiencias-container">
      <div className="experiencias-header">
        <div className="header-info">
          <h1>🌟 Experiencias Positivas</h1>
          <p>Comparte tus experiencias y reflexiones para motivar y apoyar a tus compañeros</p>
        </div>
      </div>

      {/* Mensaje del Día Destacado */}
      {mensajeDelDia && (
        <div className="mensaje-dia-destacado">
          <div className="mensaje-dia-header">
            <span className="mensaje-dia-icon">⭐</span>
            <h3>Mensaje del Día</h3>
          </div>
          <div className="mensaje-dia-contenido">
            <p className="mensaje-dia-texto">{mensajeDelDia.contenido}</p>
            <div className="mensaje-dia-autor">
              <span className="autor-nombre">
                {mensajeDelDia.esAnonimo ? 'Anónimo' : mensajeDelDia.autorNombre}
              </span>
              <span className="mensaje-dia-fecha">
                {formatFecha(mensajeDelDia.fecha)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Formulario para Publicar */}
      <div className="publicar-form">
        <form onSubmit={handlePublicarExperiencia}>
          <div className="form-header">
            <h3>📝 Comparte tu Experiencia Positiva</h3>
            <div className="anonimo-option">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={esAnonimo}
                  onChange={(e) => setEsAnonimo(e.target.checked)}
                />
                <span className="checkmark"></span>
                Publicar de forma anónima
              </label>
            </div>
          </div>
          <div className="input-container">
            <textarea
              value={nuevaExperiencia}
              onChange={(e) => setNuevaExperiencia(e.target.value)}
              placeholder="Comparte una experiencia positiva, reflexión o mensaje de apoyo..."
              className="experiencia-textarea"
              maxLength={300}
              rows={3}
            />
            <div className="input-info">
              <span className="char-count">{nuevaExperiencia.length}/300</span>
            </div>
          </div>
          <button 
            type="submit" 
            className="publicar-btn"
            disabled={!nuevaExperiencia.trim() || sending}
          >
            {sending ? (
              <span className="loading-icon">⏳</span>
            ) : (
              <span className="btn-content">
                <span className="btn-icon">🌟</span>
                Compartir Experiencia
              </span>
            )}
          </button>
        </form>
      </div>

      {/* Feed de Experiencias */}
      <div className="experiencias-feed">
        <div className="feed-header">
          <h2>💫 Feed de Apoyo Mutuo</h2>
          <p>Lee y comparte experiencias positivas de la comunidad estudiantil</p>
        </div>
        
        <div className="experiencias-list">
          {experiencias.length > 0 ? (
            experiencias.map(experiencia => (
              <div key={experiencia._id} className="experiencia-card">
                <div className="experiencia-header">
                  <div className="autor-info">
                    <span className="autor-nombre">
                      {experiencia.esAnonimo ? '👤 Anónimo' : experiencia.autorNombre}
                    </span>
                    <span className="experiencia-fecha">
                      {formatFecha(experiencia.fecha)} • {formatHora(experiencia.fecha)}
                    </span>
                  </div>
                </div>
                
                <div className="experiencia-contenido">
                  <p className="experiencia-texto">{experiencia.contenido}</p>
                </div>
                
                <div className="experiencia-reacciones">
                  <div className="reacciones-list">
                    {['me_gusta', 'me_inspira', 'gracias'].map(tipo => {
                      const reaccion = experiencia.reacciones?.find(r => r.tipo === tipo);
                      const count = reaccion ? reaccion.count : 0;
                      const usuarioReacciono = reaccion?.usuarioReacciono;
                      
                      return (
                        <button
                          key={tipo}
                          className={`reaccion-btn ${usuarioReacciono ? 'active' : ''}`}
                          onClick={() => handleReaccion(experiencia._id, tipo)}
                          title={getReaccionText(tipo)}
                        >
                          <span className="reaccion-icon">{getReaccionIcon(tipo)}</span>
                          <span className="reaccion-count">{count > 0 ? count : ''}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="feed-vacio">
              <div className="feed-vacio-icon">🌸</div>
              <h3>Sé el primero en compartir</h3>
              <p>Comienza compartiendo tu experiencia positiva para motivar a la comunidad</p>
            </div>
          )}
        </div>
      </div>
      
      <div ref={messagesEndRef} />
      
      {/* Guía de Comunidad */}
      <div className="comunidad-guia">
        <h3>🤝 Guía de Comunidad Positiva</h3>
        <div className="guia-grid">
          <div className="guia-section">
            <h4>💝 Comparte Experiencias</h4>
            <ul>
              <li>Relata momentos de superación personal</li>
              <li>Comparte estrategias que te han funcionado</li>
              <li>Describe logros académicos o personales</li>
              <li>Narra situaciones de crecimiento emocional</li>
            </ul>
          </div>
          
          <div className="guia-section">
            <h4>🌟 Ofrece Apoyo</h4>
            <ul>
              <li>Agradece las experiencias compartidas</li>
              <li>Ofrece palabras de aliento</li>
              <li>Comparte cómo te inspiran las historias</li>
              <li>Expresa gratitud por la comunidad</li>
            </ul>
          </div>
          
          <div className="guia-section">
            <h4>🛡️ Espacio Seguro</h4>
            <ul>
              <li>Mantén un lenguaje positivo y respetuoso</li>
              <li>Evita comparaciones o juicios negativos</li>
              <li>Protege tu privacidad y la de otros</li>
              <li>Reporta contenido inapropiado</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExperienciasPositivas;
