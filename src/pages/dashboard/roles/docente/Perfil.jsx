import React, { useState, useEffect } from 'react';
import SimpleLoading from '../../../../components/ui/SimpleLoading';
import './Perfil.css';
import AuthService from '../../../../components/auth/AuthService';
import avatar1Image from '../../../../assets/common/avatar1.jpg';


const DocentePerfil = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
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
        console.log('🚀 Iniciando carga de datos del perfil...');
        
        const user = AuthService.getUserInfo();
        console.log('👤 Usuario desde localStorage:', user);
        console.log('🔑 Token disponible:', !!AuthService.getToken());
        
        if (AuthService.getToken()) {
          // Obtener datos completos del usuario autenticado desde el backend
          const token = AuthService.getToken();
          const url = `http://localhost:5000/api/auth/me`;
          
          console.log('🌐 URL de la petición:', url);
          console.log('📤 Enviando petición GET a /api/auth/me...');
          
          const response = await fetch(url, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          console.log('📡 Respuesta del servidor - Status:', response.status);
          console.log('📡 Respuesta del servidor - OK:', response.ok);

          if (response.ok) {
            const data = await response.json();
            console.log('📦 Datos recibidos del backend (CRUDO):', data);
            console.log('📦 ¿Success?:', data.success);
            console.log('📦 Usuario recibido:', data.data);
            
            if (data.success && data.data) {
              console.log('✅ Procesando datos del usuario...');
              console.log('🎯 Nombre:', data.data.name);
              console.log('🎯 Email:', data.data.email);
              console.log('🎯 Especialidad:', data.data.especialidad);
              console.log('🎯 Experiencia:', data.data.experiencia);
              console.log('🎯 Status:', data.data.status);
              console.log('🎯 FechaRegistro:', data.data.fechaRegistro);
              
              setUserInfo(data.data);
              setFormData({
                name: data.data.name || '',
                email: data.data.email || '',
                especialidad: data.data.especialidad || '',
                experiencia: data.data.experiencia || ''
              });
              
              console.log('✅ Estado de userInfo después de setUserInfo:', data.data);
              console.log('✅ Estado de formData después de setFormData:', {
                name: data.data.name || '',
                email: data.data.email || '',
                especialidad: data.data.especialidad || '',
                experiencia: data.data.experiencia || ''
              });
              console.log('✅ Datos de MongoDB cargados exitosamente');
            } else {
              console.log('❌ La respuesta no tiene success true o no hay usuario');
            }
          } else {
            console.log('❌ Error en la respuesta del servidor');
            const errorText = await response.text();
            console.log('🚫 Error como texto:', errorText);
            
            try {
              const errorData = await response.json();
              console.log('🚫 Error como JSON:', errorData);
            } catch (e) {
              console.log('🚫 No se pudo parsear error como JSON');
            }
          }
        } else {
          console.log('❌ No hay token disponible');
        }
      } catch (error) {
        console.error('❌ Error cargando datos de MongoDB:', error);
        console.error('❌ Stack trace:', error.stack);
      } finally {
        console.log('🏁 Finalizando carga de datos. Loading:', loading);
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  const handleEditToggle = () => {
    setEditMode(!editMode);
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

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      console.log('💾 Iniciando guardado de datos en el backend...');
      
      const token = AuthService.getToken();
      const updateData = {
        name: formData.name,
        email: formData.email,
        especialidad: formData.especialidad,
        experiencia: formData.experiencia
      };

      console.log('📤 Datos a enviar al backend:', updateData);
      console.log('🌐 Enviando a: http://localhost:5000/api/admin/users/' + userInfo.id);

      const response = await fetch(`http://localhost:5000/api/admin/users/${userInfo.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      console.log('📡 Respuesta del servidor (PUT):', response.status);

      const data = await response.json();
      console.log('📦 Respuesta del backend:', data);

      if (data.success) {
        // Actualizar localStorage con los nuevos datos
        const updatedUser = { ...userInfo, ...updateData };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUserInfo(updatedUser);
        setEditMode(false);
        console.log('✅ Perfil actualizado exitosamente en backend y localStorage');
        console.log('🔗 Comunicación bidireccional frontend-backend exitosa');
      } else {
        console.error('❌ Error al actualizar perfil:', data.message);
        console.log('🚫 Detalles del error:', data);
      }
    } catch (error) {
      console.error('❌ Error de conexión con el backend:', error);
      console.log('🔍 Verificando conectividad con el servidor...');
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
            <div className="avatar-image-container">
              <img 
                src={avatar1Image} 
                alt="Avatar Docente" 
                className="avatar-default-image"
              />
            </div>
            <div className="avatar-info">
              <h2>{userInfo?.name || 'Docente'}</h2>
              <span className="role-badge">Docente</span>
            </div>
          </div>

          <div className="perfil-details">
            <div className="detail-group">
              <label>Información Personal</label>
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
                  placeholder="Ej: Matemáticas, Ciencias, etc."
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
                  new Date(userInfo.fechaRegistro).toLocaleDateString('es-ES') : 
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
          </div>
        </div>

        <div className="perfil-stats">
          <h3>Estadísticas</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-number">25</span>
              <span className="stat-label">Estudiantes</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">12</span>
              <span className="stat-label">Actividades</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">89%</span>
              <span className="stat-label">Participación</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocentePerfil;
