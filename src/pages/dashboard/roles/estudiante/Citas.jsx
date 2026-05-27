import React, { useState, useEffect } from 'react';
import SimpleLoading from '../../../../components/ui/SimpleLoading';
import './Citas.css';
import AuthService from '../../../../components/auth/AuthService';

const EstudianteCitas = () => {
  const [citas, setCitas] = useState([]);
  const [psicoorientadores, setPsicoorientadores] = useState([]);
  const [disponibilidad, setDisponibilidad] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingDisponibilidad, setLoadingDisponibilidad] = useState(false);
  const [bloqueSeleccionado, setBloqueSeleccionado] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [vistaActual, setVistaActual] = useState('disponibilidad'); // 'disponibilidad', 'mis-citas'
  const [psicoorientadorSeleccionado, setPsicoorientadorSeleccionado] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [semanaActual, setSemanaActual] = useState(new Date());
  const [formData, setFormData] = useState({
    psicoorientadorId: '',
    fecha: '',
    horaInicio: '',
    motivo: ''
  });

  // Cargar datos iniciales
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      await Promise.all([
        loadCitas(),
        loadPsicoorientadores()
      ]);
    } catch (error) {
      console.error('Error cargando datos iniciales:', error);
    } finally {
      setLoading(false);
    }
  };

  // Cargar citas del estudiante
  const loadCitas = async () => {
    try {
      const token = AuthService.getToken();
      const response = await fetch('http://localhost:5000/api/estudiante/appointments', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        setCitas(data.data);
      }
    } catch (error) {
      console.error('Error cargando citas:', error);
    }
  };

  // Cargar psicoorientadores disponibles
  const loadPsicoorientadores = async () => {
    try {
      const token = AuthService.getToken();
      const response = await fetch('http://localhost:5000/api/estudiante/psicoorientadores-disponibles', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success && data.data) {
        setPsicoorientadores(data.data);
      }
    } catch (error) {
      console.error('Error cargando psicoorientadores:', error);
    }
  };

  // Cargar disponibilidad de psicoorientadores
  const loadDisponibilidad = async (psicoorientadorId = '') => {
    try {
      setLoadingDisponibilidad(true);
      const token = AuthService.getToken();
      
      const params = new URLSearchParams();
      if (psicoorientadorId) params.append('psicoorientadorId', psicoorientadorId);
      
      // Obtener inicio de la semana actual (lunes)
      const diaSemana = semanaActual.getDay();
      const diasLunes = diaSemana === 0 ? 6 : diaSemana - 1; // Ajustar para que lunes = 0
      const inicioSemana = new Date(semanaActual);
      inicioSemana.setDate(semanaActual.getDate() - diasLunes);
      inicioSemana.setHours(0, 0, 0, 0);
      
      params.append('semanaInicio', inicioSemana.toISOString());
      
      const response = await fetch(`http://localhost:5000/api/citas/disponibilidad?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        setDisponibilidad(data.data);
      } else {
        console.error('❌ Error en respuesta:', data.message);
      }
    } catch (error) {
      console.error('Error cargando disponibilidad:', error);
      setError('Error al cargar disponibilidad');
    } finally {
      setLoadingDisponibilidad(false);
    }
  };

  // Cargar disponibilidad cuando se selecciona un psicoorientador
  useEffect(() => {
    if (psicoorientadorSeleccionado) {
      loadDisponibilidad(psicoorientadorSeleccionado);
    }
  }, [psicoorientadorSeleccionado]);

  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'psicoorientadorId') {
      setPsicoorientadorSeleccionado(value);
    }
  };

  // Crear nueva cita
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setError('');
      setSuccess('');
      
      const token = AuthService.getToken();
      
      if (!formData.psicoorientadorId || !formData.fecha || !formData.horaInicio || !formData.motivo.trim()) {
        setError('Todos los campos son requeridos');
        return;
      }

      const requestData = {
        psicoorientadorId: formData.psicoorientadorId,
        fecha: formData.fecha,
        horaInicio: formData.horaInicio,
        motivo: formData.motivo.trim()
      };

      const response = await fetch('http://localhost:5000/api/estudiante/appointments', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      const data = await response.json();
      
      if (data.success) {
        setSuccess('✅ Cita agendada exitosamente');
        setShowForm(false);
        setBloqueSeleccionado(null);
        setFormData({ psicoorientadorId: '', fecha: '', horaInicio: '', motivo: '' });
        setPsicoorientadorSeleccionado('');
        
        // Recargar datos
        await loadCitas();
        await loadDisponibilidad(formData.psicoorientadorId);
        
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Error al agendar cita');
      }
    } catch (error) {
      console.error('Error creando cita:', error);
      setError('Error de conexión al agendar cita');
    }
  };

  // Cancelar cita
  const handleCancelarCita = async (citaId) => {
    if (!window.confirm('¿Estás seguro de que quieres cancelar esta cita?')) {
      return;
    }

    try {
      const token = AuthService.getToken();
      
      const response = await fetch(`http://localhost:5000/api/estudiante/appointments/${citaId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          motivoCancelacion: 'Cancelada por estudiante'
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setSuccess('Cita cancelada exitosamente');
        await loadCitas();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Error al cancelar cita');
      }
    } catch (error) {
      console.error('Error cancelando cita:', error);
      setError('Error de conexión al cancelar cita');
    }
  };

  // Funciones auxiliares
  const getEstadoColor = (estado) => {
    const colors = {
      'pendiente': '#fbbf24',
      'confirmada': '#10b981',
      'cancelada': '#ef4444',
      'completada': '#6b7280'
    };
    return colors[estado] || '#6b7280';
  };

  const getEstadoTexto = (estado) => {
    const estados = {
      'pendiente': 'Pendiente',
      'confirmada': 'Confirmada',
      'cancelada': 'Cancelada',
      'completada': 'Completada'
    };
    return estados[estado] || estado;
  };

  const getEstadoIcon = (estado) => {
    const icons = {
      'pendiente': '⏳',
      'confirmada': '✅',
      'cancelada': '❌',
      'completada': '✨'
    };
    return icons[estado] || '📅';
  };

  const formatFechaCita = (fecha, hora) => {
    // Crear fecha completa con hora local
    const [horaNum, minutoNum] = hora.split(':').map(Number);
    const fechaCita = new Date(fecha);
    fechaCita.setHours(horaNum, minutoNum, 0, 0);
    
    return fechaCita.toLocaleString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isPastDate = (fecha, hora = '00:00') => {
    // Crear fecha completa con hora
    const [horaNum, minutoNum] = hora.split(':').map(Number);
    const fechaCita = new Date(fecha);
    fechaCita.setHours(horaNum, minutoNum, 0, 0);
    
    const ahora = new Date();
    
    // Agregar un margen de 2 horas para permitir cancelación
    const fechaLimite = new Date(ahora.getTime() + 2 * 60 * 60 * 1000);
    
    // Comparar fecha y hora completas
    return fechaCita < fechaLimite;
  };

  const upcomingCitas = citas.filter(cita => !isPastDate(cita.fecha, cita.horaInicio));
  const pastCitas = citas.filter(cita => isPastDate(cita.fecha, cita.horaInicio));

  // Debug: Mostrar información de citas en consola
  console.log('=== DEBUG CITAS ESTUDIANTE ===');
  console.log('Total de citas cargadas:', citas.length);
  console.log('Vista actual:', vistaActual);
  console.log('Próximas citas:', upcomingCitas.length);
  console.log('Citas pasadas:', pastCitas.length);
  
  upcomingCitas.forEach((cita, index) => {
    console.log(`Cita ${index + 1}:`, {
      id: cita._id,
      estado: cita.estado,
      fecha: cita.fecha,
      hora: cita.horaInicio,
      psicologo: cita.psicoorientadorName,
      mostrarBoton: ['agendada', 'confirmada'].includes(cita.estado)
    });
  });

  // Renderizar disponibilidad por día
  const renderDisponibilidadDia = (diaData) => {
    return (
      <div key={diaData.dia} className="disponibilidad-dia">
        <h4>{diaData.dia.charAt(0).toUpperCase() + diaData.dia.slice(1)} - {diaData.fecha}</h4>
        <div className="bloques-grid">
          {diaData.bloquesDisponibles.map((bloque, index) => (
            <div 
              key={index} 
              className={`bloque-horario ${bloque.disponible ? 'disponible' : 'ocupado'}`}
              onClick={() => bloque.disponible && seleccionarBloque(bloque, diaData.fecha)}
            >
              <div className="bloque-hora">
                {bloque.horaInicio} - {bloque.horaFin}
              </div>
              <div className="bloque-estado">
                {bloque.disponible ? '✅ Disponible' : `❌ Ocupado (${bloque.citaOcupante?.estudianteName || 'Reservado'})`}
              </div>
              {!bloque.disponible && bloque.citaOcupante && (
                <div className="bloque-info">
                  <small>Con: {bloque.citaOcupante.estudianteName}</small>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Navegar entre semanas
  const cambiarSemana = (direccion) => {
    const nuevaSemana = new Date(semanaActual);
    nuevaSemana.setDate(semanaActual.getDate() + (direccion * 7));
    setSemanaActual(nuevaSemana);
  };

  const irSemanaActual = () => {
    setSemanaActual(new Date());
  };

  // Obtener texto de la semana
  const getSemanaTexto = () => {
    const diaSemana = semanaActual.getDay();
    const diasLunes = diaSemana === 0 ? 6 : diaSemana - 1;
    const inicio = new Date(semanaActual);
    inicio.setDate(semanaActual.getDate() - diasLunes);
    const fin = new Date(inicio);
    fin.setDate(inicio.getDate() + 6);
    
    return `${inicio.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} - ${fin.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}`;
  };

  // Recargar disponibilidad cuando cambia la semana
  useEffect(() => {
    if (psicoorientadorSeleccionado) {
      loadDisponibilidad(psicoorientadorSeleccionado);
    }
  }, [semanaActual]);
  const seleccionarBloque = (bloque, fecha) => {
    // Guardar información completa del bloque seleccionado
    const bloqueInfo = {
      ...bloque,
      fecha: fecha,
      fechaFormateada: new Date(fecha).toLocaleDateString('es-ES', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    };
    
    setBloqueSeleccionado(bloqueInfo);
    setFormData(prev => ({
      ...prev,
      fecha: fecha,
      horaInicio: bloque.horaInicio
    }));
    setShowForm(true);
  };

  if (loading) {
    return <SimpleLoading text="Cargando citas..." />;
  }

  return (
    <div className="citas-container">
      <div className="citas-header">
        <h1>📅 Mis Citas</h1>
        <p>Agenda tus sesiones de psicoorientación</p>
        
        {/* Navegación de vistas */}
        <div className="nav-tabs">
          <button 
            className={`nav-tab ${vistaActual === 'disponibilidad' ? 'active' : ''}`}
            onClick={() => setVistaActual('disponibilidad')}
          >
            🕐 Disponibilidad
          </button>
          <button 
            className={`nav-tab ${vistaActual === 'mis-citas' ? 'active' : ''}`}
            onClick={() => setVistaActual('mis-citas')}
          >
            📋 Mis Citas
          </button>
        </div>
      </div>

      {/* Mensajes */}
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {/* Vista Disponibilidad */}
      {vistaActual === 'disponibilidad' && (
        <div className="disponibilidad-view">
          <div className="disponibilidad-header">
            <h2>🕐 Disponibilidad de Psicoorientadores</h2>
            <p>Selecciona un psicoorientador para ver sus horarios disponibles</p>
          </div>

          {/* Navegación de semanas */}
          {psicoorientadorSeleccionado && (
            <div className="semana-navigator">
              <div className="semana-controls">
                <button 
                  className="semana-btn"
                  onClick={() => cambiarSemana(-1)}
                  title="Semana anterior"
                >
                  ◀
                </button>
                <div className="semana-info">
                  <span className="semana-texto">{getSemanaTexto()}</span>
                  {new Date().toDateString() === semanaActual.toDateString() && (
                    <span className="semana-actual-badge">Esta semana</span>
                  )}
                </div>
                <button 
                  className="semana-btn"
                  onClick={() => cambiarSemana(1)}
                  title="Semana siguiente"
                >
                  ▶
                </button>
              </div>
              <button 
                className="semana-actual-btn"
                onClick={irSemanaActual}
              >
                📅 Hoy
              </button>
            </div>
          )}

          {/* Selector de psicoorientadores */}
          <div className="psicoorientador-selector">
            <label>Seleccionar Psicoorientador:</label>
            <select
              name="psicoorientadorId"
              value={formData.psicoorientadorId}
              onChange={handleInputChange}
            >
              <option value="">👥 Elige un psicoorientador...</option>
              {psicoorientadores.map(psico => (
                <option key={psico._id} value={psico._id}>
                  🧑‍⚕️ {psico.name} - {psico.especialidad}
                </option>
              ))}
            </select>
          </div>

          {/* Mostrar disponibilidad */}
          {loadingDisponibilidad ? (
            <SimpleLoading text="Cargando disponibilidad..." />
          ) : disponibilidad.length > 0 ? (
            <div className="disponibilidad-content">
              {disponibilidad.map(psicoData => (
                <div key={psicoData.psicoorientador.id} className="psicoorientador-disponibilidad">
                  <div className="psicoorientador-info">
                    <h3> {psicoData.psicoorientador.name}</h3>
                    <p>{psicoData.psicoorientador.especialidad}</p>
                    <p>{psicoData.psicoorientador.email}</p>
                  </div>
                  
                  {psicoData.mensaje ? (
                    <div className="no-horarios-message">
                      <p> {psicoData.mensaje}</p>
                    </div>
                  ) : (
                    <div className="semana-disponibilidad">
                      <h4> Disponibilidad Semanal</h4>
                      {psicoData.disponibilidad && psicoData.disponibilidad.length > 0 ? (
                        <div className="dias-grid">
                          {psicoData.disponibilidad.map(diaData => (
                            <div key={diaData.dia} className="disponibilidad-dia-card">
                              <div className="dia-header">
                                <h5>{diaData.dia.charAt(0).toUpperCase() + diaData.dia.slice(1)}</h5>
                                <span className="dia-fecha">{diaData.fecha}</span>
                              </div>
                              <div className="bloques-container">
                                {diaData.bloquesDisponibles && diaData.bloquesDisponibles.length > 0 ? (
                                  diaData.bloquesDisponibles.map((bloque, index) => (
                                    <div 
                                      key={index} 
                                      className={`bloque-horario-card ${bloque.disponible ? 'disponible' : 'ocupado'}`}
                                      onClick={() => bloque.disponible && seleccionarBloque(bloque, diaData.fecha)}
                                    >
                                      <div className="bloque-tiempo">
                                        {bloque.horaInicio} - {bloque.horaFin}
                                      </div>
                                      <div className="bloque-estado">
                                        {bloque.disponible ? 'Disponible' : 'Ocupado'}
                                      </div>
                                    </div>
                                  ))
                                ) : (
                                  <div className="sin-bloques">
                                    <span>No disponible</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="no-disponibilidad">
                          <p>No hay disponibilidad configurada para esta semana</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : psicoorientadorSeleccionado ? (
            <div className="empty-state">
              <p> No hay disponibilidad configurada para este psicoorientador</p>
            </div>
          ) : (
            <div className="empty-state">
              <p> Selecciona un psicoorientador para ver su disponibilidad</p>
            </div>
          )}
        </div>
      )}

      {/* Vista Mis Citas */}
      {vistaActual === 'mis-citas' && (
        <div className="mis-citas-view">
          <div className="citas-actions">
            <button 
              className="solicitar-cita-btn"
              onClick={() => setVistaActual('disponibilidad')}
            >
              <span className="btn-icon">➕</span>
              Solicitar Nueva Cita
            </button>
          </div>

          {/* Próximas citas */}
          <div className="citas-section">
            <h3>📅 Próximas Citas</h3>
            {upcomingCitas.length > 0 ? (
              <div className="citas-list">
                {upcomingCitas.map(cita => (
                  <div key={cita._id} className="cita-card">
                    <div className="cita-fecha">
                      <div className="fecha-dia">
                        {new Date(cita.fecha).getDate()}
                      </div>
                      <div className="fecha-mes">
                        {new Date(cita.fecha).toLocaleDateString('es', { month: 'short' })}
                      </div>
                    </div>
                    <div className="cita-info">
                      <h4>Cita con {cita.psicoorientadorName}</h4>
                      <p>{cita.motivo}</p>
                      <p>{formatFechaCita(cita.fecha, cita.horaInicio)}</p>
                    </div>
                    <div className="cita-acciones">
                      <div className="cita-estado">
                        <span 
                          className="estado-badge"
                          style={{ backgroundColor: getEstadoColor(cita.estado) }}
                        >
                          {getEstadoIcon(cita.estado)} {getEstadoTexto(cita.estado)}
                        </span>
                      </div>
                      {['agendada', 'confirmada'].includes(cita.estado) && (
                        <button
                          className="btn-cancelar-pequeno"
                          onClick={() => handleCancelarCita(cita._id)}
                          title="Cancelar cita"
                        >
                          Cancelar
                        </button>
                      )}
                      
                      {/* Botón de prueba - siempre visible */}
                      <button
                        className="btn-cancelar"
                        onClick={() => console.log('Botón de prueba presionado para cita:', cita._id)}
                        style={{ backgroundColor: '#10b981', marginTop: '5px' }}
                        title="Botón de prueba"
                      >
                        Prueba
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No tienes próximas citas agendadas</p>
                <button 
                  className="btn-primary"
                  onClick={() => setVistaActual('disponibilidad')}
                >
                  Agendar una cita
                </button>
              </div>
            )}
          </div>

          {/* Citas pasadas */}
          {pastCitas.length > 0 && (
            <div className="citas-section">
              <h3>📚 Citas Anteriores</h3>
              <div className="citas-list">
                {pastCitas.map(cita => (
                  <div key={cita._id} className="cita-card past">
                    <div className="cita-fecha">
                      <div className="fecha-dia">
                        {new Date(cita.fecha).getDate()}
                      </div>
                      <div className="fecha-mes">
                        {new Date(cita.fecha).toLocaleDateString('es', { month: 'short' })}
                      </div>
                    </div>
                    <div className="cita-info">
                      <h4>Cita con {cita.psicoorientadorName}</h4>
                      <p>{cita.motivo}</p>
                      <p>{formatFechaCita(cita.fecha, cita.horaInicio)}</p>
                    </div>
                    <div className="cita-acciones">
                      <div className="cita-estado">
                        <span 
                          className="estado-badge"
                          style={{ backgroundColor: getEstadoColor(cita.estado) }}
                        >
                          {getEstadoIcon(cita.estado)} {getEstadoTexto(cita.estado)}
                        </span>
                      </div>
                      {['agendada', 'confirmada'].includes(cita.estado) && (
                        <button
                          className="btn-cancelar-pequeno"
                          onClick={() => handleCancelarCita(cita._id)}
                          title="Cancelar esta cita anterior"
                        >
                          Cancelar
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Formulario de nueva cita */}
      {showForm && (
        <div className="cita-form-overlay">
          <div className="cita-form">
            <div className="form-header">
              <h2>🗓️ Agendar Nueva Cita</h2>
              <button 
                className="close-btn"
                onClick={() => {
                  setShowForm(false);
                  setBloqueSeleccionado(null);
                }}
              >
                ✕
              </button>
            </div>

            {/* Información de la cita seleccionada */}
            {bloqueSeleccionado && (
              <div className="cita-info-seleccionada">
                <h3>📋 Detalles de la Cita Seleccionada</h3>
                <div className="cita-detalles">
                  <div className="detalle-item">
                    <span className="detalle-label">🧑‍⚕️ Psicoorientador:</span>
                    <span className="detalle-valor">
                      {psicoorientadores.find(p => p._id === formData.psicoorientadorId)?.name || 'No seleccionado'}
                    </span>
                  </div>
                  <div className="detalle-item">
                    <span className="detalle-label">📅 Fecha:</span>
                    <span className="detalle-valor">{bloqueSeleccionado.fechaFormateada}</span>
                  </div>
                  <div className="detalle-item">
                    <span className="detalle-label">🕐 Hora:</span>
                    <span className="detalle-valor">
                      {bloqueSeleccionado.horaInicio} - {bloqueSeleccionado.horaFin}
                    </span>
                  </div>
                  <div className="detalle-item">
                    <span className="detalle-label">⏱️ Duración:</span>
                    <span className="detalle-valor">60 minutos</span>
                  </div>
                </div>
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="motivo">📝 Motivo de la cita</label>
                <textarea
                  id="motivo"
                  name="motivo"
                  value={formData.motivo}
                  onChange={handleInputChange}
                  placeholder="Describe brevemente el motivo de tu consulta..."
                  rows="4"
                  required
                  className="motivo-textarea"
                />
              </div>

              <div className="form-actions">
                <button 
                  type="button"
                  className="cancel-btn"
                  onClick={() => {
                    setShowForm(false);
                    setBloqueSeleccionado(null);
                  }}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="submit-btn"
                  disabled={loading}
                >
                  {loading ? 'Agendando...' : '✅ Confirmar Cita'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
    </div>
  );
};

export default EstudianteCitas;
