import React, { useState, useEffect } from 'react';
import AuthService from '../../../../../components/auth/AuthService';
import './Horarios.css';

const Horarios = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [horarios, setHorarios] = useState({
    lunes: { jornada: 'no-disponible' },
    martes: { jornada: 'no-disponible' },
    miercoles: { jornada: 'no-disponible' },
    jueves: { jornada: 'no-disponible' },
    viernes: { jornada: 'no-disponible' },
    sabado: { jornada: 'no-disponible' },
    domingo: { jornada: 'no-disponible' }
  });

  useEffect(() => {
    fetchHorarios();
  }, []);

  const fetchHorarios = async () => {
    try {
      const token = AuthService.getToken();
      const response = await fetch('http://localhost:5000/api/psicoorientadores', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Buscar el psicoorientador actual y obtener sus horarios
        const psicoorientadorActual = data.data.find(p => p.email === AuthService.getUserEmail());
        if (psicoorientadorActual && psicoorientadorActual.horariosDisponibilidad) {
          setHorarios(psicoorientadorActual.horariosDisponibilidad);
        }
      }
    } catch (error) {
      console.error('Error al cargar horarios:', error);
    }
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

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
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        alert('Error al actualizar horarios');
      }
    } catch (error) {
      console.error('Error al actualizar horarios:', error);
      alert('Error de conexión al actualizar horarios');
    } finally {
      setLoading(false);
    }
  };

  const dias = [
    { nombre: 'Lunes', key: 'lunes' },
    { nombre: 'Martes', key: 'martes' },
    { nombre: 'Miércoles', key: 'miercoles' },
    { nombre: 'Jueves', key: 'jueves' },
    { nombre: 'Viernes', key: 'viernes' },
    { nombre: 'Sábado', key: 'sabado' },
    { nombre: 'Domingo', key: 'domingo' }
  ];

  return (
    <div className="horarios-container">
      <div className="page-header">
        <h1>🕐 Mis Horarios de Disponibilidad</h1>
        <p>Configura tus horarios de atención para que los estudiantes puedan solicitar citas</p>
        <div className="instruction-box">
          <p><strong>📝 Instrucciones:</strong></p>
          <ul>
            <li>Selecciona la jornada para cada día que trabajas</li>
            <li>Configura tus horas reales de inicio y fin</li>
            <li>Agrega más bloques con "➕ Agregar Bloque" si necesitas varios intervalos</li>
            <li>Elimina bloques con "❌" si no los necesitas</li>
            <li>Si eliminas todos los bloques, el día cambiará a "No Disponible"</li>
            <li>Guarda tus cambios para que los estudiantes vean tu disponibilidad</li>
          </ul>
        </div>
      </div>

      {success && (
        <div className="success-message">
          ✅ Horarios actualizados exitosamente
        </div>
      )}

      <form onSubmit={handleSubmit} className="horarios-form">
        <div className="horarios-grid">
          {dias.map(dia => (
            <div key={dia.key} className="horario-dia">
              <div className="dia-header">
                <h3>{dia.nombre}</h3>
              </div>
              
              <div className="jornada-select">
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
                            <div className="horario-time-inputs">
                              <div className="time-input-group">
                                <label>Inicio</label>
                                <input
                                  type="time"
                                  value={bloque.inicio || ''}
                                  onChange={(e) => updateBloque(dia.key, 'Mañana', index, 'inicio', e.target.value)}
                                  placeholder="Selecciona hora de inicio"
                                />
                              </div>
                              <div className="time-input-group">
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
                            <div className="horario-time-inputs">
                              <div className="time-input-group">
                                <label>Inicio</label>
                                <input
                                  type="time"
                                  value={bloque.inicio || ''}
                                  onChange={(e) => updateBloque(dia.key, 'Tarde', index, 'inicio', e.target.value)}
                                  placeholder="Selecciona hora de inicio"
                                />
                              </div>
                              <div className="time-input-group">
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
                </>
              )}
            </div>
          ))}
        </div>

        <div className="form-actions">
          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary"
          >
            {loading ? 'Guardando...' : '💾 Guardar Horarios'}
          </button>
        </div>
      </form>

      {/* Vista previa en tiempo real de horarios */}
      <div className="horarios-preview-realtime">
        <h3>📋 Vista Previa de Horarios</h3>
        <div className="horarios-preview-grid">
          {dias.map(dia => {
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
  );
};

export default Horarios;
