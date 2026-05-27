import React, { useState, useEffect } from 'react';
import SimpleLoading from '../../../../components/ui/SimpleLoading';
import './Perfil.css';
import AuthService from '../../../../components/auth/AuthService';
import avatarImage from '../../../../assets/common/avatar.jpg';

const EstudiantePerfil = () => {
  console.log('🚀 EstudiantePerfil - Componente montado');
  
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    grado: '',          // Sin valor por defecto - debe seleccionarse
    grupo: '',          // Sin valor por defecto - debe seleccionarse
    nombreAcudiente: 'Sin especificar', // Valor por defecto del modelo
    avatar: '',
    status: 'Activo',
    fechaRegistro: '',
    ultimoLogin: '',
    actividadesCompletadas: 0,
    nivelActual: 'Principiante',
    puntos: 0,
    cursosInscritos: [],
    insignias: []
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    console.log('🔄 Estado actual:', { editMode, formData });
    console.log('📝 ¿Puedo editar?', editMode);
    console.log('📝 Datos del formulario:', formData);
  }, [editMode, formData]);

  // Efecto para actualizar formData cuando userInfo cambia
  useEffect(() => {
    if (userInfo) {
      console.log('🔄 Actualizando formData por cambio en userInfo:', userInfo);
      setFormData(prev => ({
        ...prev,
        name: userInfo.name || '',
        email: userInfo.email || '',
        grado: userInfo.grado || '',          // Mantener vacío si no hay valor
        grupo: userInfo.grupo || '',          // Mantener vacío si no hay valor
        nombreAcudiente: userInfo.nombreAcudiente || 'Sin especificar',
        avatar: userInfo.avatar || '',
        status: userInfo.status || 'Activo',
        fechaRegistro: userInfo.fechaRegistro || '',
        ultimoLogin: userInfo.ultimoLogin || '',
        actividadesCompletadas: userInfo.progreso?.actividadesCompletadas || 0,
        nivelActual: userInfo.progreso?.nivelActual || 'Principiante',
        puntos: userInfo.progreso?.puntos || 0,
        cursosInscritos: userInfo.cursosInscritos || [],
        insignias: userInfo.progreso?.insignias || []
      }));
    }
  }, [userInfo]);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        console.log('🚀 Iniciando carga de datos del perfil (estudiante)...');
        
        const user = AuthService.getUserInfo();
        console.log('👤 Usuario desde localStorage:', user);
        console.log('🔑 Token disponible:', !!AuthService.getToken());
        
        if (AuthService.getToken()) {
          // Obtener datos completos del usuario autenticado desde el backend
          const token = AuthService.getToken();
          const url = `http://localhost:5000/api/auth/me`;
          
          console.log('🌐 URL de la petición:', url);
          console.log('📤 Enviando petición GET a /api/auth/me...');
          console.log('🔑 Token a usar:', token.substring(0, 20) + '...');
          
          const response = await fetch(url, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          console.log('📡 Respuesta del servidor - Status:', response.status);
          console.log('📡 Respuesta del servidor - OK:', response.ok);
          console.log('📡 Headers de respuesta:', response.headers);

          if (response.ok) {
            const data = await response.json();
            console.log('✅ Datos recibidos del backend:', data);
            console.log('📦 Estructura de respuesta:', {
              success: data.success,
              hasData: !!data.data,
              dataType: typeof data.data,
              dataKeys: data.data ? Object.keys(data.data) : null
            });
            
            if (data.success) {
              console.log('👤 Estableciendo userInfo:', data.data);
              console.log('🔍 Datos recibidos del backend:', {
                grado: data.data.grado,
                grupo: data.data.grupo,
                nombreAcudiente: data.data.nombreAcudiente,
                tieneGrado: !!data.data.grado,
                tieneGrupo: !!data.data.grupo,
                tipoGrado: typeof data.data.grado,
                tipoGrupo: typeof data.data.grupo
              });
              
              setUserInfo(data.data);
              setFormData({
                name: data.data.name || '',
                email: data.data.email || '',
                grado: data.data.grado || '',          // Mantener vacío si no hay valor
                grupo: data.data.grupo || '',          // Mantener vacío si no hay valor
                nombreAcudiente: data.data.nombreAcudiente || 'Sin especificar',  // Respetar valor guardado
                avatar: data.data.avatar || '',
                status: data.data.status || 'Activo',
                fechaRegistro: data.data.fechaRegistro || '',
                ultimoLogin: data.data.ultimoLogin || '',
                actividadesCompletadas: data.data.progreso?.actividadesCompletadas || 0,
                nivelActual: data.data.progreso?.nivelActual || 'Principiante',
                puntos: data.data.progreso?.puntos || 0,
                cursosInscritos: data.data.cursosInscritos || [],
                insignias: data.data.progreso?.insignias || []
              });
              console.log('✅ Perfil cargado exitosamente');
              console.log('📋 FormData establecido:', {
                name: data.data.name || '',
                email: data.data.email || '',
                grado: data.data.grado === '' ? 'Décimo' : data.data.grado || 'Décimo',
                grupo: data.data.grupo === '' ? 'A' : data.data.grupo || 'A',
                nombreAcudiente: data.data.nombreAcudiente === '' ? 'Sin especificar' : data.data.nombreAcudiente || 'Sin especificar',
                avatar: data.data.avatar || '',
                status: data.data.status || 'Activo',
                fechaRegistro: data.data.fechaRegistro || '',
                ultimoLogin: data.data.ultimoLogin || '',
                actividadesCompletadas: data.data.progreso?.actividadesCompletadas || 0,
                nivelActual: data.data.progreso?.nivelActual || 'Principiante',
                puntos: data.data.progreso?.puntos || 0,
                cursosInscritos: data.data.cursosInscritos || [],
                insignias: data.data.progreso?.insignias || []
              });
            } else {
              console.error('❌ Error en respuesta:', data.message);
              setError(data.message || 'Error al cargar el perfil');
            }
          } else {
            console.log('🚫 Respuesta no OK, intentando leer error...');
            const errorData = await response.json();
            console.error('❌ Error en la petición:', errorData);
            setError(errorData.message || 'Error de conexión');
          }
        } else {
          console.warn('⚠️ No hay token disponible');
          // Si no hay token, usar datos básicos de localStorage
          const user = AuthService.getUserInfo();
          console.log('🔄 Usando datos de localStorage como fallback:', user);
          if (user) {
            console.log('🔍 Valores de grado y grupo desde localStorage:', {
              grado: user.grado,
              grupo: user.grupo,
              tipoGrado: typeof user.grado,
              tipoGrupo: typeof user.grupo
            });
            setUserInfo(user);
            setFormData({
              name: user.name || '',
              email: user.email || '',
              grado: user.grado || '',          // Mantener vacío si no hay valor
              grupo: user.grupo || '',          // Mantener vacío si no hay valor
              nombreAcudiente: user.nombreAcudiente || 'Sin especificar',  // Respetar valor guardado
              avatar: user.avatar || '',
              status: user.status || 'Activo',
              fechaRegistro: user.fechaRegistro || '',
              ultimoLogin: user.ultimoLogin || '',
              actividadesCompletadas: user.progreso?.actividadesCompletadas || 0,
              nivelActual: user.progreso?.nivelActual || 'Principiante',
              puntos: user.progreso?.puntos || 0,
              cursosInscritos: user.cursosInscritos || [],
              insignias: user.progreso?.insignias || []
            });
            console.log('✅ Datos de localStorage cargados');
          }
        }
      } catch (error) {
        console.error('❌ Error al cargar datos del perfil:', error);
        console.log('🔍 Detalles del error:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
        setError('Error de conexión al cargar el perfil');
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log('🔄 handleInputChange:', { name, value, editMode });
    console.log('🔄 ¿Estoy en modo edición?', editMode);
    console.log('🔄 ¿El input está deshabilitado?', e.target.disabled);
    
    if (!editMode) {
      console.warn('⚠️ Intentando cambiar input pero no estoy en modo edición');
      return;
    }
    
    console.log('🔄 Actualizando formData - antes:', { [name]: formData[name] });
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    console.log('✅ FormData actualizado:', { name, value });
    console.log('🔄 Nuevo formData completo:', formData);
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditToggle = () => {
    console.log('🔄 handleEditToggle - editMode actual:', editMode);
    console.log('🔄 handleEditToggle - ¿Estoy en modo edición?', editMode);
    console.log('🔄 handleEditToggle - Cambiando a:', !editMode);
    
    setEditMode(!editMode);
    setError('');
    setSuccess('');
    
    console.log('🔄 handleEditToggle - nuevo editMode:', !editMode);
    console.log('🔄 handleEditToggle - ¿Ahora puedo editar?', !editMode);
  };

  const handleSave = async () => {
    try {
      setError('');
      setSuccess('');
      
      const token = AuthService.getToken();
      
      console.log('📤 Enviando datos al backend:', {
        avatar: formData.avatar,
        name: formData.name,
        email: formData.email,
        grado: formData.grado,
        grupo: formData.grupo,
        nombreAcudiente: formData.nombreAcudiente
      });
      
      const response = await fetch('http://localhost:5000/api/estudiante/perfil', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      if (data.success) {
        console.log('✅ Avatar guardado correctamente:', {
          avatarEnviado: formData.avatar,
          avatarGuardado: data.data.avatar,
          avatarCoinciden: formData.avatar === data.data.avatar
        });
        
        // Actualizar userInfo con los datos guardados
        setUserInfo(data.data);
        
        // También actualizar formData para que coincida con los datos guardados
        setFormData({
          name: data.data.name || '',
          email: data.data.email || '',
          grado: data.data.grado || '',          // Mantener vacío si no hay valor
          grupo: data.data.grupo || '',          // Mantener vacío si no hay valor
          nombreAcudiente: data.data.nombreAcudiente || 'Sin especificar',  // Respetar valor guardado
          avatar: data.data.avatar || formData.avatar,  // ✅ Guardar el avatar seleccionado
          status: data.data.status || 'Activo',
          fechaRegistro: data.data.fechaRegistro || '',
          ultimoLogin: data.data.ultimoLogin || '',
          actividadesCompletadas: data.data.progreso?.actividadesCompletadas || 0,
          nivelActual: data.data.progreso?.nivelActual || 'Principiante',
          puntos: data.data.progreso?.puntos || 0,
          cursosInscritos: data.data.cursosInscritos || [],
          insignias: data.data.progreso?.insignias || []
        });
        
        setEditMode(false);
        setSuccess('Perfil actualizado exitosamente');
        console.log('✅ Perfil actualizado:', data.data);
        console.log('✅ FormData actualizado con:', {
          grado: data.data.grado,
          grupo: data.data.grupo,
          nombreAcudiente: data.data.nombreAcudiente
        });
      } else {
        setError(data.message || 'Error al actualizar el perfil');
      }
    } catch (error) {
      console.error('❌ Error al actualizar perfil:', error);
      setError('Error de conexión al actualizar el perfil');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Las contraseñas nuevas no coinciden');
      return;
    }

    try {
      setError('');
      setSuccess('');
      
      const token = AuthService.getToken();
      const response = await fetch('http://localhost:5000/api/estudiante/change-password', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setSuccess('Contraseña cambiada exitosamente');
        setShowPasswordForm(false);
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        console.log('✅ Contraseña cambiada exitosamente');
      } else {
        setError(data.message || 'Error al cambiar la contraseña');
      }
    } catch (error) {
      console.error('❌ Error al cambiar contraseña:', error);
      setError('Error de conexión al cambiar la contraseña');
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

      {error && (
        <div className="error-message">
          <span>⚠️ {error}</span>
        </div>
      )}

      {success && (
        <div className="success-message">
          <span>✅ {success}</span>
        </div>
      )}

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
                src={avatarImage} 
                alt="Avatar Estudiante" 
                className="avatar-default-image"
              />
            </div>
            <div className="avatar-info">
              <h2>{userInfo?.name || 'Estudiante'}</h2>
              <span className="role-badge">Estudiante</span>
            </div>
          </div>

          <div className="perfil-details">
            <div className="detail-group">
              <label>Información Personal</label>
              {editMode ? (
                <input
                  key="name-input"
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
                  key="email-input"
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
              <label>Grado</label>
              {editMode ? (
                <select
                  key="grado-input"
                  name="grado"
                  value={formData.grado}
                  onChange={handleInputChange}
                  className="detail-input"
                >
                  <option value="">Seleccionar grado...</option>
                  <option value="Décimo">Décimo</option>
                  <option value="Undécimo">Undécimo</option>
                </select>
              ) : (
                <>
                  {console.log('🎯 Render Grado - userInfo:', userInfo?.grado, 'formData:', formData.grado)}
                  {console.log('🔍 Tipo de userInfo.grado:', typeof userInfo?.grado, 'Valor exacto:', `"${userInfo?.grado}"`)}
                  {console.log('🔍 Tipo de formData.grado:', typeof formData.grado, 'Valor exacto:', `"${formData.grado}"`)}
                  <p className="detail-value">
                    {userInfo?.grado || 'No especificado - Puedes agregarlo editando tu perfil'}
                  </p>
                </>
              )}
            </div>

            <div className="detail-group">
              <label>Grupo</label>
              {editMode ? (
                <select
                  key="grupo-input"
                  name="grupo"
                  value={formData.grupo}
                  onChange={handleInputChange}
                  className="detail-input"
                >
                  <option value="">Seleccionar grupo...</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                </select>
              ) : (
                <>
                  {console.log('🎯 Render Grupo - userInfo:', userInfo?.grupo, 'formData:', formData.grupo)}
                  {console.log('🔍 Tipo de userInfo.grupo:', typeof userInfo?.grupo, 'Valor exacto:', `"${userInfo?.grupo}"`)}
                  {console.log('🔍 Tipo de formData.grupo:', typeof formData.grupo, 'Valor exacto:', `"${formData.grupo}"`)}
                  <p className="detail-value">
                    {userInfo?.grupo || 'No especificado - Puedes agregarlo editando tu perfil'}
                  </p>
                </>
              )}
            </div>

            <div className="detail-group">
              <label>Nombre del Acudiente</label>
              {editMode ? (
                <input
                  key="nombreAcudiente-input"
                  type="text"
                  name="nombreAcudiente"
                  value={formData.nombreAcudiente}
                  onChange={handleInputChange}
                  className="detail-input"
                  placeholder="Nombre completo del acudiente"
                />
              ) : (
                <p className="detail-value">
                  {userInfo?.nombreAcudiente || 'No especificado - Puedes agregarlo editando tu perfil'}
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
      </div>
    </div>
  );
};

export default EstudiantePerfil;
