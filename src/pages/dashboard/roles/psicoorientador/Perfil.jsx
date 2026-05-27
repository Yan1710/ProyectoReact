import React, { useState, useEffect } from 'react';
import SimpleLoading from '../../../../components/ui/SimpleLoading';
import './Perfil.css';
import AuthService from '../../../../components/auth/AuthService';
import avatar from "./psicoorientador.jpg";

const PsicoorientadorPerfil = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingCitas, setLoadingCitas] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    especialidad: '',
    experiencia: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const loadUserData = async () => {
      try {
        console.log('🚀 Iniciando carga de datos del perfil (psicoorientador)...');
        
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
          setFormData({
            name: userData.name || '',
            email: userData.email || '',
            especialidad: userData.especialidad || '',
            experiencia: userData.experiencia || ''
          });
          console.log('✅ Perfil cargado exitosamente');
          
          // Cargar las citas del psicoorientador
          await fetchCitas();
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

  const fetchCitas = async () => {
    try {
      setLoadingCitas(true);
      const token = AuthService.getToken();
      console.log('🔍 Obteniendo citas del psicoorientador...');
      
      const response = await fetch('http://localhost:5000/api/psicoorientador/citas', {
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
      
      if (data.success && data.data) {
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

  const handleUpdateCitaStatus = async (citaId, nuevoStatus) => {
    try {
      const token = AuthService.getToken();
      console.log(`🔄 Actualizando cita ${citaId} a estado: ${nuevoStatus}`);
      
      const response = await fetch(`http://localhost:5000/api/psicoorientador/citas/${citaId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: nuevoStatus })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('📨 Respuesta del backend:', data);
      
      if (data.success) {
        setSuccess(`Cita ${nuevoStatus} exitosamente`);
        await fetchCitas(); // Recargar citas
        
        // Limpiar mensaje de éxito después de 3 segundos
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || `Error al ${nuevoStatus} cita`);
      }
    } catch (error) {
      console.error(`❌ Error al ${nuevoStatus} cita:`, error);
      setError(`Error de conexión al ${nuevoStatus} cita`);
    }
  };

  const getEstadoColor = (estado) => {
    const colors = {
      'pendiente': '#fbbf24',
      'confirmada': '#10b981',
      'cancelada': '#ef4444',
      'completada': '#6b7280'
    };
    return colors[estado] || '#6b7280';
  };

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

  const handleEditToggle = () => {
    console.log('🔄 handleEditToggle - editMode actual:', editMode);
    
    if (!editMode) {
      // Activar modo edición - inicializar formData con datos actuales
      setFormData({
        name: userInfo?.name || '',
        email: userInfo?.email || '',
        especialidad: userInfo?.especialidad || '',
        experiencia: userInfo?.experiencia || ''
      });
    }
    
    setEditMode(!editMode);
    setError('');
    setSuccess('');
    console.log('🔄 handleEditToggle - nuevo editMode:', !editMode);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validaciones
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setError('Todos los campos de contraseña son obligatorios');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setError('La nueva contraseña debe tener al menos 8 caracteres');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Las contraseñas nuevas no coinciden');
      return;
    }

    try {
      const token = AuthService.getToken();
      
      const response = await fetch('http://localhost:5000/api/auth/change-password', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Contraseña actualizada exitosamente');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setTimeout(() => {
          setShowPasswordForm(false);
          setSuccess('');
        }, 2000);
      } else {
        setError(data.message || 'Error al cambiar contraseña');
      }
    } catch (error) {
      console.error('❌ Error al cambiar contraseña:', error);
      setError('Error de conexión con el servidor');
    }
  };

  const handleSave = async () => {
    try {
      const token = AuthService.getToken();
      const updateData = {
        name: formData.name,
        email: formData.email,
        especialidad: formData.especialidad,
        experiencia: formData.experiencia
      };

      const response = await fetch(`http://localhost:5000/api/admin/users/${userInfo.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (data.success) {
        // Actualizar localStorage con los nuevos datos
        const updatedUser = { ...userInfo, ...updateData };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUserInfo(updatedUser);
        setEditMode(false);
        console.log('✅ Perfil actualizado exitosamente');
      } else {
        console.error('❌ Error al actualizar perfil:', data.message);
      }
    } catch (error) {
      console.error('❌ Error de conexión:', error);
    }
  };




  if (loading) {
    return <SimpleLoading text="Cargando perfil..." />;
  }

  return (
    <div className="perfil-container">
      <div className="perfil-header">
        <h1>Mi Perfil</h1>
        <div className="header-buttons">
          <button 
            className="password-btn"
            onClick={() => setShowPasswordForm(!showPasswordForm)}
          >
            🔐 Cambiar Contraseña
          </button>
          <button 
            className={`edit-btn ${editMode ? 'save' : 'edit'}`}
            onClick={editMode ? handleSave : handleEditToggle}
          >
            {editMode ? '💾 Guardar' : '✏️ Editar'}
          </button>
        </div>
      </div>



      {showPasswordForm && (
        <div className="password-form">
          <h3>Cambiar Contraseña</h3>
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
          
          <form onSubmit={handleChangePassword}>
            <div className="password-form-grid">
              <div className="form-group">
                <label>Contraseña Actual</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  placeholder="Ingresa tu contraseña actual"
                  required
                />
              </div>

              <div className="form-group">
                <label>Nueva Contraseña</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="Mínimo 8 caracteres"
                  minLength="8"
                  required
                />
              </div>

              <div className="form-group">
                <label>Confirmar Nueva Contraseña</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="Repite la nueva contraseña"
                  minLength="8"
                  required
                />
              </div>
            </div>

            <div className="password-form-actions">
              <button 
                type="button" 
                className="btn-cancel"
                onClick={() => {
                  setShowPasswordForm(false);
                  setError('');
                  setSuccess('');
                  setPasswordData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                  });
                }}
              >
                Cancelar
              </button>
              <button type="submit" className="btn-submit">
                Actualizar Contraseña
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="perfil-content">
        <div className="perfil-card">
          <div className="perfil-avatar">
            <div className="avatar-emoji"> <img src={avatar} alt="psicoorientador" /></div>
            <div className="avatar-info">
              <h2>{userInfo?.name || 'Psicoorientador'}</h2>
              <span className="role-badge">Psicoorientador</span>
            </div>
          </div>

          <div className="perfil-details">
            <div className="detail-group">
              <label>Nombre Completo</label>
              {editMode ? (
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="detail-input"
                />
              ) : (
                <p className="detail-value">{userInfo?.name || 'No disponible'}</p>
              )}
            </div>

            <div className="detail-group">
              <label>Correo Electrónico</label>
              {editMode ? (
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="detail-input"
                />
              ) : (
                <p className="detail-value">{userInfo?.email || 'No disponible'}</p>
              )}
            </div>

            <div className="detail-group">
              <label>Especialidad</label>
              {editMode ? (
                <input
                  type="text"
                  name="especialidad"
                  value={formData.especialidad}
                  onChange={handleInputChange}
                  className="detail-input"
                  placeholder="Ej: Psicología infantil, orientación vocacional"
                />
              ) : (
                <p className="detail-value">
                  {userInfo?.especialidad || 'No especificada - Puedes agregarla editando tu perfil'}
                </p>
              )}
            </div>

            <div className="detail-group">
              <label>Años de Experiencia</label>
              {editMode ? (
                <input
                  type="text"
                  name="experiencia"
                  value={formData.experiencia}
                  onChange={handleInputChange}
                  className="detail-input"
                  placeholder="Ej: 5 años"
                />
              ) : (
                <p className="detail-value">
                  {userInfo?.experiencia || 'No especificada - Puedes agregarla editando tu perfil'}
                </p>
              )}
            </div>

            <div className="detail-group">
              <label>Fecha de Registro</label>
              <p className="detail-value">
                {userInfo?.fechaRegistro ? 
                  new Date(userInfo.fechaRegistro).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 
                  'No disponible'
                }
              </p>
            </div>

            <div className="detail-group">
              <label>Último Login</label>
              <p className="detail-value">
                {userInfo?.ultimoLogin ? 
                  new Date(userInfo.ultimoLogin).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) : 
                  'No disponible'
                }
              </p>
            </div>

            <div className="detail-group">
              <label>Estado</label>
              <span className={`status-badge ${userInfo?.status?.toLowerCase() || 'activo'}`}>
                {userInfo?.status || 'Activo'}
              </span>
            </div>

            <div className="detail-group">
              <label>ID de Usuario</label>
              <p className="detail-value" style={{ fontSize: '12px', color: '#6b7280' }}>
                {userInfo?._id || 'No disponible'}
              </p>
            </div>
          </div>
        </div>

        <div className="perfil-stats">
          <h3>Estadísticas de Atención</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-number">48</span>
              <span className="stat-label">Pacientes Activos</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">12</span>
              <span className="stat-label">Sesiones Hoy</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">85%</span>
              <span className="stat-label">Asistencia</span>
            </div>
          </div>
        </div>

        {/* Sección de Citas */}
        <div className="citas-section">
          <h3>📋 Gestión de Pacientes</h3>
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
          
          {loadingCitas ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <SimpleLoading text="Cargando pacientes..." />
            </div>
          ) : citas.length === 0 ? (
            <div className="no-citas">
              <div className="no-citas-icon">�</div>
              <h4>No tienes pacientes asignados</h4>
              <p>Los estudiantes que soliciten citas contigo aparecerán aquí</p>
            </div>
          ) : (
            <div className="citas-list">
              {citas.map(cita => (
                <div key={cita._id} className="cita-card">
                  <div className="cita-header">
                    <div className="cita-fecha">
                      <div className="fecha-dia">
                        {new Date(cita.fecha).getDate()}
                      </div>
                      <div className="fecha-mes">
                        {new Date(cita.fecha).toLocaleDateString('es', { month: 'short' })}
                      </div>
                    </div>
                    <div className="cita-info">
                      <h4>👤 {cita.estudianteName || 'Estudiante'}</h4>
                      <p className="cita-hora">
                        📅 {formatearFecha(cita.fecha)}
                      </p>
                      <span 
                        className="cita-status" 
                        style={{ backgroundColor: getEstadoColor(cita.status) }}
                      >
                        {cita.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="cita-motivo">
                    <strong>📝 Motivo de consulta:</strong> {cita.motivo}
                  </div>
                  
                  {cita.estudianteEmail && (
                    <div className="cita-contacto">
                      <strong>📧 Contacto:</strong> {cita.estudianteEmail}
                    </div>
                  )}
                  
                  <div className="cita-actions">
                    {cita.status === 'pendiente' && (
                      <>
                        <button
                          onClick={() => handleUpdateCitaStatus(cita._id, 'confirmada')}
                          className="cita-btn confirmar"
                        >
                          ✅ Aceptar Cita
                        </button>
                        <button
                          onClick={() => handleUpdateCitaStatus(cita._id, 'cancelada')}
                          className="cita-btn cancelar"
                        >
                          ❌ Rechazar Cita
                        </button>
                      </>
                    )}
                    
                    {cita.status === 'confirmada' && (
                      <button
                        onClick={() => handleUpdateCitaStatus(cita._id, 'completada')}
                        className="cita-btn completar"
                      >
                        ✅ Marcar Completada
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="perfil-recent">
          <h3>Actividad Reciente</h3>
          <div className="recent-list">
            <div className="recent-item">
              <span className="recent-icon">📋</span>
              <div className="recent-details">
                <p>Evaluación completada - María González</p>
                <span className="recent-time">Hace 2 horas</span>
              </div>
            </div>
            <div className="recent-item">
              <span className="recent-icon">🗓️</span>
              <div className="recent-details">
                <p>Sesión programada - Juan Pérez</p>
                <span className="recent-time">Mañana 10:00</span>
              </div>
            </div>
            <div className="recent-item">
              <span className="recent-icon">📊</span>
              <div className="recent-details">
                <p>Reporte mensual generado</p>
                <span className="recent-time">Ayer</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PsicoorientadorPerfil;
