import React, { useState, useEffect } from 'react';
import SimpleLoading from '../../../../components/ui/SimpleLoading';
import './Sesiones.css';
import AuthService from '../../../../components/auth/AuthService';

const PsicoorientadorSesiones = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showHorariosForm, setShowHorariosForm] = useState(false);
  const [citas, setCitas] = useState([]);
  const [loadingCitas, setLoadingCitas] = useState(false);
  const [vistaActual, setVistaActual] = useState('dashboard'); // 'dashboard', 'horarios', 'citas'
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [diaSeleccionado, setDiaSeleccionado] = useState('');
  
  // Estado para horarios con configuración mejorada
  const [horarios, setHorarios] = useState({
    lunes: { jornada: 'no-disponible' },
    martes: { jornada: 'no-disponible' },
    miercoles: { jornada: 'no-disponible' },
    jueves: { jornada: 'no-disponible' },
    viernes: { jornada: 'no-disponible' },
    sabado: { jornada: 'no-disponible' },
    domingo: { jornada: 'no-disponible' }
  });
  
  // Estado para filtros de citas
  const [filtrosCitas, setFiltrosCitas] = useState({
    estado: 'todos', // 'todos', 'pendiente', 'confirmada', 'cancelada', 'completada'
    fechaInicio: '',
    fechaFin: ''
  });

  useEffect(() => {
    const loadUserData = async () => {
      try {
        console.log('🚀 Iniciando carga de datos de sesiones...');
        
        const token = AuthService.getToken();
        if (!token) {
          console.error('❌ No se encontró token de autenticación');
          setError('No se encontró token de autenticación');
          return;
        }

        // Cargar datos del perfil
        const profileResponse = await fetch('http://localhost:5000/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!profileResponse.ok) {
          throw new Error(`HTTP error! status: ${profileResponse.status}`);
        }

        const profileData = await profileResponse.json();
        console.log('📊 Datos del perfil recibidos del backend:', profileData);

        if (profileData.success && profileData.data) {
          const userData = profileData.data;
          setUserInfo(userData);
          console.log('✅ Perfil cargado exitosamente');
          
          // Cargar los horarios del psicoorientador
          await loadHorarios();
          
          // Cargar las citas del psicoorientador
          await loadCitas();
        } else {
          console.error('❌ Error en la respuesta del servidor:', profileData);
          setError('Error al cargar el perfil');
        }
      } catch (error) {
        console.error('❌ Error cargando datos de MongoDB:', error);
        setError('Error de conexión con el servidor');
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  // Cargar citas del psicoorientador
  const loadCitas = async () => {
    try {
      setLoadingCitas(true);
      const token = AuthService.getToken();
      
      const params = new URLSearchParams();
      if (filtrosCitas.estado !== 'todos') params.append('estado', filtrosCitas.estado);
      if (filtrosCitas.fechaInicio) params.append('fechaInicio', filtrosCitas.fechaInicio);
      if (filtrosCitas.fechaFin) params.append('fechaFin', filtrosCitas.fechaFin);
      
      const response = await fetch(`http://localhost:5000/api/citas/citas/mis-citas?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('📅 Citas recibidas del backend:', data);
      
      if (data.success) {
        setCitas(data.data);
        console.log('✅ Citas cargadas exitosamente:', data.data.length);
      } else {
        console.warn('⚠️ No se encontraron citas');
        setCitas([]);
      }
    } catch (error) {
      console.error('❌ Error al obtener citas:', error);
      setCitas([]);
    } finally {
      setLoadingCitas(false);
    }
  };

  // Cargar horarios cuando cambian los filtros
  useEffect(() => {
    if (userInfo) {
      loadCitas();
    }
  }, [filtrosCitas]);

  // Funciones para manejar bloques de tiempo dinámicos
  const addBloque = (dia, periodo) => {
    setHorarios(prev => ({
      ...prev,
      [dia]: {
        ...prev[dia],
        [`bloques${periodo}`]: [...(prev[dia][`bloques${periodo}`] || []), { inicio: '', fin: '' }]
      }
    }));
  };

  const removeBloque = (dia, periodo, index) => {
    setHorarios(prev => {
      const nuevosBloques = [...prev[dia][`bloques${periodo}`]];
      nuevosBloques.splice(index, 1);
      
      // Si no quedan bloques, eliminar completamente el período
      if (nuevosBloques.length === 0) {
        const nuevoDia = { ...prev[dia] };
        delete nuevoDia[`bloques${periodo}`];
        
        // Si se eliminó el último período, cambiar a no-disponible
        if (!nuevoDia.bloquesMañana && !nuevoDia.bloquesTarde) {
          nuevoDia.jornada = 'no-disponible';
        }
        
        return {
          ...prev,
          [dia]: nuevoDia
        };
      }
      
      return {
        ...prev,
        [dia]: {
          ...prev[dia],
          [`bloques${periodo}`]: nuevosBloques
        }
      };
    });
  };

  const updateBloque = (dia, periodo, index, campo, valor) => {
    setHorarios(prev => {
      const nuevosBloques = [...prev[dia][`bloques${periodo}`]];
      nuevosBloques[index] = { ...nuevosBloques[index], [campo]: valor };
      
      return {
        ...prev,
        [dia]: {
          ...prev[dia],
          [`bloques${periodo}`]: nuevosBloques
        }
      };
    });
  };

  // Manejar cambio en horarios por día
  const handleDiaChange = (dia, campo, valor) => {
    setHorarios(prev => {
      const nuevoDia = { ...prev[dia] };
      
      if (campo === 'jornada') {
        nuevoDia.jornada = valor;
        
        // Agregar campos de tiempo según la jornada seleccionada
        if (valor === 'completa') {
          nuevoDia.bloquesMañana = [{ inicio: '', fin: '' }];
          nuevoDia.bloquesTarde = [{ inicio: '', fin: '' }];
        } else if (valor === 'mañana') {
          nuevoDia.bloquesMañana = [{ inicio: '', fin: '' }];
          delete nuevoDia.bloquesTarde;
        } else if (valor === 'tarde') {
          delete nuevoDia.bloquesMañana;
          nuevoDia.bloquesTarde = [{ inicio: '', fin: '' }];
        } else if (valor === 'no-disponible') {
          // Mantener solo la jornada, eliminar todos los campos de tiempo
          delete nuevoDia.bloquesMañana;
          delete nuevoDia.bloquesTarde;
        }
      } else {
        // Para cambios en campos de tiempo
        nuevoDia[campo] = valor;
      }
      
      return {
        ...prev,
        [dia]: nuevoDia
      };
    });
  };

  // Actualizar horario de un día específico
  const updateHorarioDia = async (dia) => {
    try {
      const token = AuthService.getToken();
      
      const horarioDia = horarios[dia];
      const requestData = {
        [dia]: horarioDia
      };
      
      const response = await fetch('http://localhost:5000/api/psicoorientadores/horarios', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setSuccess(`Horario de ${dia.charAt(0).toUpperCase() + dia.slice(1)} actualizado exitosamente`);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Error al actualizar horario');
      }
    } catch (error) {
      console.error('❌ Error al actualizar horario:', error);
      setError('Error de conexión al actualizar horario');
    }
  };

  // Manejar cambio de filtros
  const handleFiltroChange = (campo, valor) => {
    setFiltrosCitas(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  // Actualizar estado de cita
  const handleUpdateCitaEstado = async (citaId, nuevoEstado, notas = '', motivoCancelacion = '') => {
    try {
      const token = AuthService.getToken();
      
      const requestData = {
        estado: nuevoEstado
      };
      
      if (notas) requestData.notasPsicoorientador = notas;
      if (motivoCancelacion) requestData.motivoCancelacion = motivoCancelacion;
      
      const response = await fetch(`http://localhost:5000/api/citas/citas/${citaId}/estado`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('📨 Respuesta del backend:', data);
      
      if (data.success) {
        setSuccess(`Cita ${nuevoEstado} exitosamente`);
        await loadCitas(); // Recargar citas
        
        // Limpiar mensaje de éxito después de 3 segundos
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || `Error al ${nuevoEstado} cita`);
      }
    } catch (error) {
      console.error(`❌ Error al ${nuevoEstado} cita:`, error);
      setError(`Error de conexión al ${nuevoEstado} cita`);
    }
  };

  // Obtener color según estado
  const getEstadoColor = (estado) => {
    const colors = {
      'pendiente': '#fbbf24',
      'confirmada': '#10b981',
      'cancelada': '#ef4444',
      'completada': '#6b7280'
    };
    return colors[estado] || '#6b7280';
  };

  // Obtener texto según estado
  const getEstadoTexto = (estado) => {
    const estados = {
      'pendiente': 'Pendiente',
      'confirmada': 'Confirmada',
      'cancelada': 'Cancelada',
      'completada': 'Completada'
    };
    return estados[estado] || estado;
  };

  // Obtener icono según estado
  const getEstadoIcon = (estado) => {
    const icons = {
      'pendiente': '⏳',
      'confirmada': '✅',
      'cancelada': '❌',
      'completada': '✨'
    };
    return icons[estado] || '📅';
  };

  // Formatear fecha
  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Verificar si fecha es pasada
  const isPastDate = (fecha, hora = '00:00') => {
    // Crear fecha completa con hora
    const [horaNum, minutoNum] = hora.split(':').map(Number);
    const fechaCita = new Date(fecha);
    fechaCita.setHours(horaNum, minutoNum, 0, 0);
    
    const ahora = new Date();
    
    // Para citas del día actual, considerar la hora actual
    const esMismoDia = fechaCita.toDateString() === ahora.toDateString();
    
    if (esMismoDia) {
      // Si es el mismo día, la cita es pasada solo si la hora ya pasó
      return fechaCita < ahora;
    } else {
      // Para días diferentes, usar la lógica anterior con margen
      const fechaLimite = new Date(ahora.getTime() - 2 * 60 * 60 * 1000);
      return fechaCita < fechaLimite;
    }
  };

  // Filtrar citas según estado
  const filtrarCitas = (citas) => {
    if (filtrosCitas.estado === 'todos') return citas;
    return citas.filter(cita => cita.estado === filtrosCitas.estado);
  };

  // Separar citas próximas y pasadas
  const citasFiltradas = filtrarCitas(citas);
  const upcomingCitas = citasFiltradas.filter(cita => !isPastDate(cita.fecha));
  const pastCitas = citasFiltradas.filter(cita => isPastDate(cita.fecha));

  const handleSaveHorarios = async () => {
    try {
      const token = AuthService.getToken();
      const response = await fetch('http://localhost:5000/api/psicoorientadores/horarios', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ horariosDisponibilidad: horarios })
      });

      if (response.ok) {
        setSuccess('✅ Horarios actualizados exitosamente');
        setTimeout(() => setSuccess(''), 3000);
        // Recargar los horarios para mostrar los actualizados
        await loadHorarios();
      } else {
        alert('❌ Error al actualizar horarios');
      }
    } catch (error) {
      console.error('Error al actualizar horarios:', error);
      alert('❌ Error de conexión al actualizar horarios');
    }
  };

  const loadHorarios = async () => {
    try {
      console.log('🕐 Cargando horarios del psicoorientador desde la base de datos...');
      
      const token = AuthService.getToken();
      if (!token) {
        console.error('❌ No se encontró token para cargar horarios');
        return;
      }

      // Obtener el perfil completo que incluye los horarios
      const response = await fetch('http://localhost:5000/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('📊 Datos completos del perfil recibidos:', data);

      if (data.success && data.data) {
        const userData = data.data;
        
        // Si el perfil tiene horarios configurados, cargarlos
        if (userData.horariosDisponibilidad) {
          console.log('✅ Horarios encontrados en el perfil:', userData.horariosDisponibilidad);
          setHorarios(userData.horariosDisponibilidad);
          setUserInfo(userData);
        } else {
          console.log('ℹ️ No se encontraron horarios configurados, usando estado inicial limpio');
          // Mantener el estado inicial ya establecido (todos los días en no-disponible)
        }
      } else {
        console.warn('⚠️ No se encontraron datos del perfil para cargar horarios');
      }
    } catch (error) {
      console.error('❌ Error al cargar horarios desde el perfil:', error);
    }
  };

  if (loading) {
    return <SimpleLoading text="Cargando sesiones..." />;
  }

  return (
    <div className="sesiones-container">
      {/* Header con navegación */}
      <div className="sesiones-header">
        <div className="header-content">
          <div className="header-info">
            <h1>📅 Gestión de Sesiones</h1>
            <p>Administra tus horarios de atención y gestiona las citas con estudiantes</p>
          </div>
          <div className="header-stats">
            <div className="stat-card">
              <span className="stat-number">{upcomingCitas.length}</span>
              <span className="stat-label">Próximas Citas</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">{citas.filter(c => c.estado === 'pendiente').length}</span>
              <span className="stat-label">Pendientes</span>
            </div>
          </div>
        </div>
        
        {/* Navegación de vistas */}
        <div className="nav-tabs">
          <button 
            className={`nav-tab ${vistaActual === 'dashboard' ? 'active' : ''}`}
            onClick={() => setVistaActual('dashboard')}
          >
            📊 Dashboard
          </button>
          <button 
            className={`nav-tab ${vistaActual === 'horarios' ? 'active' : ''}`}
            onClick={() => setVistaActual('horarios')}
          >
            🕐 Horarios
          </button>
          <button 
            className={`nav-tab ${vistaActual === 'citas' ? 'active' : ''}`}
            onClick={() => setVistaActual('citas')}
          >
            📋 Citas
          </button>
        </div>
      </div>

      {/* Mensajes */}
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {/* Vista Dashboard */}
      {vistaActual === 'dashboard' && (
        <div className="dashboard-view">
          <div className="dashboard-grid">
            {/* Resumen de hoy */}
            <div className="dashboard-card">
              <h3>📅 Sesiones de Hoy</h3>
              {upcomingCitas.filter(cita => {
                const hoy = new Date();
                const fechaCita = new Date(cita.fecha);
                return fechaCita.toDateString() === hoy.toDateString();
              }).length > 0 ? (
                <div className="sesiones-hoy-list">
                  {upcomingCitas.filter(cita => {
                    const hoy = new Date();
                    const fechaCita = new Date(cita.fecha);
                    return fechaCita.toDateString() === hoy.toDateString();
                  }).map(cita => (
                    <div key={cita._id} className="sesion-hoy-item">
                      <div className="sesion-hora">
                        {new Date(cita.fecha).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="sesion-info">
                        <h4>{cita.estudianteName}</h4>
                        <p>{cita.motivo}</p>
                      </div>
                      <div className="sesion-estado">
                        <span 
                          className="estado-badge"
                          style={{ backgroundColor: getEstadoColor(cita.estado) }}
                        >
                          {getEstadoIcon(cita.estado)} {getEstadoTexto(cita.estado)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <p>No tienes sesiones programadas para hoy</p>
                </div>
              )}
            </div>

            {/* Próximas Citas */}
            <div className="dashboard-card">
              <h3>� Próximas Citas</h3>
              {upcomingCitas.length > 0 ? (
                <div className="proximas-citas-list">
                  {upcomingCitas.slice(0, 5).map(cita => (
                    <div key={cita._id} className="proxima-cita-item">
                      <div className="cita-fecha">
                        <div className="fecha-dia">
                          {new Date(cita.fecha).getDate()}
                        </div>
                        <div className="fecha-mes">
                          {new Date(cita.fecha).toLocaleDateString('es', { month: 'short' })}
                        </div>
                      </div>
                      <div className="cita-info">
                        <h4>{cita.estudianteName}</h4>
                        <p>{new Date(cita.fecha).toLocaleDateString('es-ES', { weekday: 'long' })}</p>
                      </div>
                      <div className="cita-estado">
                        <span 
                          className="estado-badge"
                          style={{ backgroundColor: getEstadoColor(cita.estado) }}
                        >
                          {getEstadoIcon(cita.estado)} {getEstadoTexto(cita.estado)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <p>No tienes próximas citas agendadas</p>
                </div>
              )}
            </div>

            {/* Estadísticas */}
            <div className="dashboard-card full-width">
              <h3>📈 Estadísticas de Atención</h3>
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-number">{citas.length}</span>
                  <span className="stat-label">Total Citas</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{citas.filter(c => c.estado === 'completada').length}</span>
                  <span className="stat-label">Completadas</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{citas.filter(c => c.estado === 'cancelada').length}</span>
                  <span className="stat-label">Canceladas</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Vista Horarios */}
      {vistaActual === 'horarios' && (
        <div className="horarios-view">
          <div className="horarios-header">
            <h2>🕐 Configuración de Horarios</h2>
            <p>Establece tus horarios de disponibilidad para que los estudiantes puedan solicitar citas</p>
            <button 
              className="btn-primary"
              onClick={() => setShowHorariosForm(!showHorariosForm)}
            >
              {showHorariosForm ? 'Ocultar Formulario' : 'Editar Horarios'}
            </button>
          </div>

          {showHorariosForm && (
            <div className="horarios-form-section">
              <div className="horarios-grid">
                {[
                  { nombre: 'Lunes', key: 'lunes' },
                  { nombre: 'Martes', key: 'martes' },
                  { nombre: 'Miércoles', key: 'miercoles' },
                  { nombre: 'Jueves', key: 'jueves' },
                  { nombre: 'Viernes', key: 'viernes' },
                  { nombre: 'Sábado', key: 'sabado' },
                  { nombre: 'Domingo', key: 'domingo' }
                ].map(dia => (
                  <div key={dia.key} className="dia-card">
                    <h3>{dia.nombre}</h3>
                    
                    <div className="form-group">
                      <label>Jornada</label>
                      <select
                        value={horarios[dia.key].jornada}
                        onChange={(e) => handleDiaChange(dia.key, 'jornada', e.target.value)}
                        className="jornada-select"
                      >
                        <option value="completa">Jornada Completa</option>
                        <option value="mañana">Solo Mañana</option>
                        <option value="tarde">Solo Tarde</option>
                        <option value="no-disponible">No Disponible</option>
                      </select>
                    </div>

                    {horarios[dia.key].jornada !== 'no-disponible' && (
                      <>
                        {horarios[dia.key].duracionSesion && (
                          <div className="form-group">
                            <label>Duración por sesión (minutos)</label>
                            <input
                              type="number"
                              value={horarios[dia.key].duracionSesion}
                              onChange={(e) => handleDiaChange(dia.key, 'duracionSesion', e.target.value)}
                              min="30"
                              max="120"
                              step="15"
                            />
                          </div>
                        )}

                        {horarios[dia.key].intervaloEntreSesiones && (
                          <div className="form-group">
                            <label>Intervalo entre sesiones (minutos)</label>
                            <input
                              type="number"
                              value={horarios[dia.key].intervaloEntreSesiones}
                              onChange={(e) => handleDiaChange(dia.key, 'intervaloEntreSesiones', e.target.value)}
                              min="0"
                              max="30"
                              step="5"
                            />
                          </div>
                        )}

                        {(horarios[dia.key].jornada === 'completa' || horarios[dia.key].jornada === 'mañana') && horarios[dia.key].bloquesMañana && (
                          <div className="horario-mañana">
                            <h4>🌅 Mañana</h4>
                            <div className="bloques-container">
                              {horarios[dia.key].bloquesMañana.map((bloque, index) => (
                                <div key={index} className="bloque-horario">
                                  <div className="bloque-header">
                                    <span>Bloque {index + 1}</span>
                                    <button 
                                      type="button"
                                      className="btn-remove-bloque"
                                      onClick={() => removeBloque(dia.key, 'Mañana', index)}
                                    >
                                      ❌
                                    </button>
                                  </div>
                                  <div className="horas-row">
                                    <div className="form-group">
                                      <label>Inicio</label>
                                      <input
                                        type="time"
                                        value={bloque.inicio || ''}
                                        onChange={(e) => updateBloque(dia.key, 'Mañana', index, 'inicio', e.target.value)}
                                        placeholder="Selecciona hora de inicio"
                                      />
                                    </div>
                                    <div className="form-group">
                                      <label>Fin</label>
                                      <input
                                        type="time"
                                        value={bloque.fin || ''}
                                        onChange={(e) => updateBloque(dia.key, 'Mañana', index, 'fin', e.target.value)}
                                        placeholder="Selecciona hora de fin"
                                      />
                                    </div>
                                  </div>
                                </div>
                              ))}
                              <button 
                                type="button"
                                className="btn-add-bloque"
                                onClick={() => addBloque(dia.key, 'Mañana')}
                              >
                                ➕ Agregar Bloque Mañana
                              </button>
                            </div>
                          </div>
                        )}

                        {(horarios[dia.key].jornada === 'completa' || horarios[dia.key].jornada === 'tarde') && horarios[dia.key].bloquesTarde && (
                          <div className="horario-tarde">
                            <h4>🌆 Tarde</h4>
                            <div className="bloques-container">
                              {horarios[dia.key].bloquesTarde.map((bloque, index) => (
                                <div key={index} className="bloque-horario">
                                  <div className="bloque-header">
                                    <span>Bloque {index + 1}</span>
                                    <button 
                                      type="button"
                                      className="btn-remove-bloque"
                                      onClick={() => removeBloque(dia.key, 'Tarde', index)}
                                    >
                                      ❌
                                    </button>
                                  </div>
                                  <div className="horas-row">
                                    <div className="form-group">
                                      <label>Inicio</label>
                                      <input
                                        type="time"
                                        value={bloque.inicio || ''}
                                        onChange={(e) => updateBloque(dia.key, 'Tarde', index, 'inicio', e.target.value)}
                                        placeholder="Selecciona hora de inicio"
                                      />
                                    </div>
                                    <div className="form-group">
                                      <label>Fin</label>
                                      <input
                                        type="time"
                                        value={bloque.fin || ''}
                                        onChange={(e) => updateBloque(dia.key, 'Tarde', index, 'fin', e.target.value)}
                                        placeholder="Selecciona hora de fin"
                                      />
                                    </div>
                                  </div>
                                </div>
                              ))}
                              <button 
                                type="button"
                                className="btn-add-bloque"
                                onClick={() => addBloque(dia.key, 'Tarde')}
                              >
                                ➕ Agregar Bloque Tarde
                              </button>
                            </div>
                          </div>
                        )}

                        <div className="dia-actions">
                          <button 
                            type="button"
                            className="btn-save-dia"
                            onClick={() => updateHorarioDia(dia.key)}
                          >
                            💾 Guardar {dia.nombre}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>

              <div className="horarios-actions">
                <button 
                  type="button" 
                  className="btn-cancel"
                  onClick={() => setShowHorariosForm(false)}
                >
                  Cancelar
                </button>
                <button 
                  type="button" 
                  className="btn-primary"
                  onClick={handleSaveHorarios}
                >
                  💾 Guardar Horarios
                </button>
              </div>
            </div>
          )}

          {/* Vista previa en tiempo real de horarios */}
          <div className="horarios-preview-realtime">
            <h3>📋 Vista Previa de Horarios</h3>
            <div className="horarios-preview-grid">
              {[
                { nombre: 'Lunes', key: 'lunes' },
                { nombre: 'Martes', key: 'martes' },
                { nombre: 'Miércoles', key: 'miercoles' },
                { nombre: 'Jueves', key: 'jueves' },
                { nombre: 'Viernes', key: 'viernes' },
                { nombre: 'Sábado', key: 'sabado' },
                { nombre: 'Domingo', key: 'domingo' }
              ].map(dia => {
                const horarioDia = horarios[dia.key];
                if (!horarioDia || horarioDia.jornada === 'no-disponible') {
                  return (
                    <div key={dia.key} className="horario-preview-card no-disponible">
                      <span className="dia-nombre">{dia.nombre}</span>
                      <span className="dia-estado">❌ No disponible</span>
                    </div>
                  );
                }

                // Renderizar bloques dinámicos
                const bloquesMañana = horarioDia.bloquesMañana || [];
                const bloquesTarde = horarioDia.bloquesTarde || [];
                const tieneBloquesValidos = [
                  ...bloquesMañana.filter(b => b.inicio && b.fin),
                  ...bloquesTarde.filter(b => b.inicio && b.fin)
                ].length > 0;

                if (!tieneBloquesValidos) {
                  return (
                    <div key={dia.key} className="horario-preview-card configurando">
                      <span className="dia-nombre">{dia.nombre}</span>
                      <span className="dia-estado">⏳ Configurando...</span>
                    </div>
                  );
                }

                return (
                  <div key={dia.key} className="horario-preview-card disponible">
                    <span className="dia-nombre">{dia.nombre}</span>
                    <div className="horario-info">
                      <span className="jornada">
                        {horarioDia.jornada === 'completa' ? '🌅🌆 Completa' : 
                         horarioDia.jornada === 'mañana' ? '🌅 Mañana' : '🌆 Tarde'}
                      </span>
                      {bloquesMañana.filter(b => b.inicio && b.fin).map((bloque, index) => (
                        <span key={`m-${index}`} className="horario-rango">
                          🌅 {bloque.inicio} - {bloque.fin}
                        </span>
                      ))}
                      {bloquesTarde.filter(b => b.inicio && b.fin).map((bloque, index) => (
                        <span key={`t-${index}`} className="horario-rango">
                          🌆 {bloque.inicio} - {bloque.fin}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Vista Citas */}
      {vistaActual === 'citas' && (
        <div className="citas-view">
          <div className="citas-header">
            <h2>📋 Gestión de Citas</h2>
            <div className="citas-filters">
              <div className="filter-group">
                <label>Estado</label>
                <select
                  value={filtrosCitas.estado}
                  onChange={(e) => handleFiltroChange('estado', e.target.value)}
                >
                  <option value="todos">Todos</option>
                  <option value="pendiente">Pendientes</option>
                  <option value="confirmada">Confirmadas</option>
                  <option value="completada">Completadas</option>
                  <option value="cancelada">Canceladas</option>
                </select>
              </div>
              <div className="filter-group">
                <label>Desde</label>
                <input
                  type="date"
                  value={filtrosCitas.fechaInicio}
                  onChange={(e) => handleFiltroChange('fechaInicio', e.target.value)}
                />
              </div>
              <div className="filter-group">
                <label>Hasta</label>
                <input
                  type="date"
                  value={filtrosCitas.fechaFin}
                  onChange={(e) => handleFiltroChange('fechaFin', e.target.value)}
                />
              </div>
            </div>
          </div>

          {loadingCitas ? (
            <SimpleLoading text="Cargando citas..." />
          ) : (
            <div className="citas-content">
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
                          <h4>{cita.estudianteName}</h4>
                          <p>{cita.motivo}</p>
                          <p>{formatearFecha(cita.fecha)}</p>
                        </div>
                        <div className="cita-estado">
                          <span 
                            className="estado-badge"
                            style={{ backgroundColor: getEstadoColor(cita.estado) }}
                          >
                            {getEstadoIcon(cita.estado)} {getEstadoTexto(cita.estado)}
                          </span>
                        </div>
                        <div className="cita-acciones">
                          {cita.estado === 'pendiente' && (
                            <>
                              <button 
                                className="btn-confirm"
                                onClick={() => handleUpdateCitaEstado(cita._id, 'confirmada')}
                              >
                                ✅ Confirmar
                              </button>
                              <button 
                                className="btn-cancel"
                                onClick={() => handleUpdateCitaEstado(cita._id, 'cancelada', '', 'Cancelada por psicoorientador')}
                              >
                                ❌ Cancelar
                              </button>
                            </>
                          )}
                          {cita.estado === 'confirmada' && (
                            <>
                              <button 
                                className="btn-complete"
                                onClick={() => handleUpdateCitaEstado(cita._id, 'completada')}
                              >
                                Confirmar Asistencia
                              </button>
                              <button 
                                className="btn-cancel"
                                onClick={() => handleUpdateCitaEstado(cita._id, 'cancelada', '', 'Cancelada por psicoorientador')}
                              >
                                Cancelar Cita
                              </button>
                            </>
                          )}
                          {cita.estado === 'agendada' && (
                            <>
                              <button 
                                className="btn-confirm"
                                onClick={() => handleUpdateCitaEstado(cita._id, 'confirmada')}
                              >
                                Confirmar Cita
                              </button>
                              <button 
                                className="btn-cancel"
                                onClick={() => handleUpdateCitaEstado(cita._id, 'cancelada', '', 'Cancelada por psicoorientador')}
                              >
                                Cancelar Cita
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <p>No tienes próximas citas</p>
                  </div>
                )}
              </div>

              {/* Citas pasadas */}
              {pastCitas.length > 0 && (
                <div className="citas-section">
                  <h3> Citas Anteriores</h3>
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
                          <h4>{cita.estudianteName}</h4>
                          <p>{cita.motivo}</p>
                          <p>{formatearFecha(cita.fecha)}</p>
                        </div>
                        <div className="cita-estado">
                          <span 
                            className="estado-badge"
                            style={{ backgroundColor: getEstadoColor(cita.estado) }}
                          >
                            {getEstadoIcon(cita.estado)} {getEstadoTexto(cita.estado)}
                          </span>
                        </div>
                        <div className="cita-acciones">
                          {cita.estado === 'pendiente' && (
                            <>
                              <button 
                                className="btn-confirm"
                                onClick={() => handleUpdateCitaEstado(cita._id, 'confirmada')}
                              >
                                Confirmar
                              </button>
                              <button 
                                className="btn-cancel"
                                onClick={() => handleUpdateCitaEstado(cita._id, 'cancelada', '', 'Cancelada por psicoorientador')}
                              >
                                Cancelar
                              </button>
                            </>
                          )}
                          {cita.estado === 'agendada' && (
                            <>
                              <button 
                                className="btn-confirm"
                                onClick={() => handleUpdateCitaEstado(cita._id, 'confirmada')}
                              >
                                Confirmar
                              </button>
                              <button 
                                className="btn-cancel"
                                onClick={() => handleUpdateCitaEstado(cita._id, 'cancelada', '', 'Cancelada por psicoorientador')}
                              >
                                Cancelar
                              </button>
                            </>
                          )}
                          {cita.estado === 'confirmada' && (
                            <>
                              <button 
                                className="btn-complete"
                                onClick={() => handleUpdateCitaEstado(cita._id, 'completada')}
                              >
                                Confirmada
                              </button>
                              <button 
                                className="btn-cancel"
                                onClick={() => handleUpdateCitaEstado(cita._id, 'cancelada', '', 'Cancelada por psicoorientador')}
                              >
                                Cancelar
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      </div>
  );
};

export default PsicoorientadorSesiones;
