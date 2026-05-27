import React, { useState, useEffect } from 'react';
import { ConfirmModal, useConfirmation } from '../../../../components/ui';
import './HomePage.css';

const AdminHomePage = () => {
  const [users, setUsers] = useState([]);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const { isOpen, config, confirm, closeModal } = useConfirmation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'estudiante',
    confirmarPassword: '',
    // Campos específicos para docente
    especialidad: '',
    experiencia: '',
    // Campos específicos para estudiante
    grado: '',
    grupo: '',
    nombreAcudiente: '',
    // Campos específicos para psicoorientador (sin licencia)
  });
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Log para depuración del estado inicial
  useEffect(() => {
    console.log('🚀 AdminHomePage montado');
    console.log('📊 FormData inicial:', formData);
  }, []);

  // Log para depuración de cambios en formData
  useEffect(() => {
    console.log('🔄 FormData actualizado:', formData);
  }, [formData]);

  // Verificar si el token es válido antes de hacer llamadas a la API
  const verifyTokenBeforeCall = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      await confirm({
        title: 'Sesión Requerida',
        message: 'No hay sesión activa. Por favor inicia sesión.',
        confirmText: 'Aceptar',
        type: 'danger'
      });
      return false;
    }

    // Verificar formato del token
    if (token.split('.').length !== 3) {
      await confirm({
        title: 'Error de Sesión',
        message: 'Token inválido. Por favor inicia sesión nuevamente.',
        confirmText: 'Aceptar',
        type: 'danger'
      });
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      return false;
    }

    return true;
  };

  // Cargar usuarios desde el backend
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const isValidToken = await verifyTokenBeforeCall();
      if (!isValidToken) return;

      const token = localStorage.getItem('token');
      console.log('🔍 Cargando usuarios con token:', token ? 'Token encontrado' : 'No hay token');
      
      const response = await fetch('http://localhost:5000/api/admin/all-users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 Respuesta del backend:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('📦 Datos recibidos:', data);
        console.log('👥 Usuarios totales:', data.users?.length || 0);
        
        // Filtrar al administrador para que no aparezca en la tabla
        const filteredUsers = (data.users || []).filter(user => user.role !== 'admin');
        console.log('👥 Usuarios filtrados (sin admin):', filteredUsers.length);
        console.log('📋 Usuarios filtrados:', filteredUsers);
        
        setUsers(filteredUsers);
      } else {
        console.error('❌ Error al cargar usuarios - Status:', response.status);
        // En caso de error, dejar el array vacío
        setUsers([]);
      }
    } catch (error) {
      console.error('❌ Error en la petición de carga de usuarios:', error);
      // En caso de error, dejar el array vacío
      setUsers([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log('🔄 Cambio en formulario:', name, '=', value);
    console.log('📊 FormData ANTES del cambio:', { ...formData });
    
    // Log específico para grado y grupo
    if (name === 'grado') {
      console.log(`🎓 GRADO seleccionado:`, value);
      console.log('📊 FormData actual:', {
        grado: formData.grado,
        grupo: formData.grupo,
        role: formData.role
      });
    }
    
    if (name === 'grupo') {
      console.log(`🎓 GRUPO seleccionado:`, value);
      console.log('📊 FormData actual:', {
        grado: formData.grado,
        grupo: formData.grupo,
        role: formData.role
      });
      console.log('⚠️ VERIFICACIÓN - ¿Está actualizando el grupo?');
    }
    
    setFormData(prevData => {
      const newData = {
        ...prevData,
        [name]: value
      };
      console.log('📊 FormData DESPUÉS del cambio:', { ...newData });
      
      // Verificación específica para grupo
      if (name === 'grupo') {
        console.log('✅ GRUPO actualizado en formData:', newData.grupo);
      }
      
      return newData;
    });
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    console.log('🔄 Cambio en formulario de contraseña:', name, '=', value);
    
    setPasswordData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      // Campos específicos según el rol
      especialidad: user.especialidad || '',
      experiencia: user.experiencia || '',
      grado: user.grado || '',
      grupo: user.grupo || '',
      nombreAcudiente: user.nombreAcudiente || ''
    });
    setShowEditForm(true);
    setShowRegisterForm(false);
  };

  const handleChangePassword = (user) => {
    setEditingUser(user);
    setPasswordData({
      newPassword: '',
      confirmPassword: ''
    });
    setShowPasswordForm(true);
    setShowRegisterForm(false);
    setShowEditForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Validaciones
    if (!formData.name || !formData.email || !formData.password || !formData.role) {
      setError('Todos los campos son obligatorios');
      console.log('❌ Validación fallida - Campos vacíos:', {
        name: !!formData.name,
        email: !!formData.email,
        password: !!formData.password,
        role: !!formData.role
      });
      return;
    }

    // Validar que el rol sea válido
    const validRoles = ['estudiante', 'docente', 'psicoorientador'];
    if (!validRoles.includes(formData.role)) {
      setError('Rol no válido');
      console.log('❌ Rol no válido:', formData.role);
      return;
    }

    // Validar que el email sea de dominio @gmail.com
    if (!formData.email.endsWith('@gmail.com')) {
      setError('El correo electrónico debe ser de dominio @gmail.com');
      return;
    }

    if (formData.password !== formData.confirmarPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (formData.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      console.log('🔍 Token encontrado en localStorage:', token ? 'Sí' : 'No');
      console.log('🔑 Token (primeros 20 chars):', token ? token.substring(0, 20) + '...' : 'N/A');
      
      console.log('🔍 Enviando formulario con datos:', formData);
      console.log('🎯 Rol seleccionado:', formData.role);
      
      // Depuración específica para estudiante
      if (formData.role === 'estudiante') {
        console.log('🎓 Depuración estudiante:');
        console.log('  - name:', formData.name);
        console.log('  - email:', formData.email);
        console.log('  - password:', formData.password ? 'EXISTS' : 'MISSING');
        console.log('  - grado:', formData.grado);
        console.log('  - grupo:', formData.grupo);
        console.log('  - nombreAcudiente:', formData.nombreAcudiente);
        console.log('  - confirmarPassword:', formData.confirmarPassword ? 'EXISTS' : 'MISSING');
      }
      
      const response = await fetch('http://localhost:5000/api/admin/register-user', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          // Enviar campos específicos según el rol
          ...(formData.role === 'docente' && {
            especialidad: formData.especialidad,
            experiencia: formData.experiencia
          }),
          ...(formData.role === 'estudiante' && {
            grado: formData.grado,
            grupo: formData.grupo,
            nombreAcudiente: formData.nombreAcudiente
          }),
          ...(formData.role === 'psicoorientador' && {
            especialidad: formData.especialidad,
            experiencia: formData.experiencia
          })
        }),
      });

      console.log('📡 Respuesta del servidor:', response.status);
      const data = await response.json();
      console.log('📦 Datos recibidos:', data);

      if (data.success) {
        setSuccess(`Usuario ${formData.role} registrado exitosamente en ${data.user.collection}`);
        
        // Limpiar formulario
        setFormData({
          name: '',
          email: '',
          password: '',
          role: 'estudiante',
          confirmarPassword: '',
          // Limpiar campos específicos
          especialidad: '',
          experiencia: '',
          grado: '',
          grupo: '',
          nombreAcudiente: ''
        });

        // Recargar la lista de usuarios
        loadUsers();

        // Cerrar formulario después de 2 segundos
        setTimeout(() => {
          setShowRegisterForm(false);
          setSuccess('');
        }, 2000);
      } else {
        setError(data.message || 'Error al registrar usuario');
      }
    } catch (error) {
      console.error('❌ Error al registrar usuario:', error);
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    const confirmed = await confirm({
      title: 'Eliminar Usuario',
      message: '¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer.',
      confirmText: 'Aceptar',
      cancelText: 'Cancelar',
      type: 'danger'
    });

    if (confirmed) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();

        if (data.success) {
          await confirm({
            title: 'Éxito',
            message: data.message,
            confirmText: 'Aceptar',
            type: 'info'
          });
          // Recargar la lista de usuarios
          loadUsers();
        } else {
          await confirm({
            title: 'Error',
            message: 'Error al eliminar usuario: ' + data.message,
            confirmText: 'Aceptar',
            type: 'danger'
          });
        }
      } catch (error) {
        console.error('Error al eliminar usuario:', error);
        await confirm({
          title: 'Error',
          message: 'Error de conexión con el servidor',
          confirmText: 'Aceptar',
          type: 'danger'
        });
      }
    }
  };

  const toggleUserStatus = async (userId) => {
    try {
      const isValidToken = await verifyTokenBeforeCall();
      if (!isValidToken) return;

      const token = localStorage.getItem('token');
      
      console.log('🔍 Token disponible:', token.substring(0, 20) + '...');
      
      const user = users.find(u => u._id === userId || u.id === userId);
      
      if (!user) return;

      const newStatus = user.status === 'Activo' ? 'Inactivo' : 'Activo';
      
      const confirmed = await confirm({
        title: 'Cambiar Estado',
        message: `¿Estás seguro de que deseas ${newStatus === 'Activo' ? 'activar' : 'desactivar'} a ${user.name}?`,
        confirmText: 'Aceptar',
        cancelText: 'Cancelar',
        type: 'warning'
      });

      if (!confirmed) return;
      
      console.log('🌐 Enviando solicitud a:', `http://localhost:5000/api/admin/users/${userId}/status`);
      console.log('📦 Datos enviados:', { status: newStatus });
      
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      console.log('📡 Respuesta status:', response.status);
      console.log('📡 Respuesta ok:', response.ok);

      const data = await response.json();
      console.log('📦 Datos recibidos:', data);

      if (data.success) {
        await confirm({
          title: 'Éxito',
          message: data.message,
          confirmText: 'Aceptar',
          type: 'info'
        });
        // Recargar la lista de usuarios
        loadUsers();
      } else {
        // Si el error es de token, redirigir al login
        if (data.message && data.message.includes('Token')) {
          await confirm({
            title: 'Sesión Expirada',
            message: 'Tu sesión ha expirado. Por favor inicia sesión nuevamente.',
            confirmText: 'Aceptar',
            type: 'danger'
          });
          // Limpiar localStorage y redirigir
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          return;
        }
        
        await confirm({
          title: 'Error',
          message: 'Error al cambiar estado: ' + data.message,
          confirmText: 'Aceptar',
          type: 'danger'
        });
      }
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      await confirm({
        title: 'Error',
        message: 'Error de conexión con el servidor',
        confirmText: 'Aceptar',
        type: 'danger'
      });
    }
  };

  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Validaciones
    if (!passwordData.newPassword || !passwordData.confirmPassword) {
      setError('Todos los campos de contraseña son obligatorios');
      setLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      setLoading(false);
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:5000/api/admin/users/${editingUser._id || editingUser.id}/reset-password`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newPassword: passwordData.newPassword
        }),
      });

      const data = await response.json();

      if (data.success) {
        await confirm({
          title: 'Éxito',
          message: `Contraseña de ${editingUser.name} actualizada exitosamente`,
          confirmText: 'Aceptar',
          type: 'success'
        });

        setShowPasswordForm(false);
        setEditingUser(null);
        setPasswordData({
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        setError(data.message || 'Error al cambiar contraseña');
      }
    } catch (error) {
      console.error('❌ Error al cambiar contraseña:', error);
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      
      const updateData = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        // Campos específicos según el rol
        ...(formData.role === 'docente' && {
          especialidad: formData.especialidad,
          experiencia: formData.experiencia
        }),
        ...(formData.role === 'estudiante' && {
          grado: formData.grado,
          grupo: formData.grupo,
          nombreAcudiente: formData.nombreAcudiente
        }),
        ...(formData.role === 'psicoorientador' && {
          especialidad: formData.especialidad,
          experiencia: formData.experiencia
        })
      };

      const response = await fetch(`http://localhost:5000/api/admin/users/${editingUser._id || editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (data.success) {
        await confirm({
          title: 'Éxito',
          message: 'Usuario actualizado exitosamente',
          confirmText: 'Aceptar',
          type: 'info'
        });
        
        // Recargar la lista de usuarios
        loadUsers();
        
        // Cerrar formulario y limpiar
        setShowEditForm(false);
        setEditingUser(null);
        setFormData({
          name: '',
          email: '',
          password: '',
          role: 'estudiante',
          confirmarPassword: '',
          especialidad: '',
          experiencia: '',
          grado: '',
          grupo: '',
          nombreAcudiente: ''
        });
      } else {
        setError(data.message || 'Error al actualizar usuario');
      }
    } catch (error) {
      console.error('❌ Error al actualizar usuario:', error);
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeClass = (role) => {
    const roleClasses = {
      admin: 'badge-admin',
      docente: 'badge-docente',
      estudiante: 'badge-estudiante',
      psicoorientador: 'badge-psicoorientador'
    };
    return roleClasses[role] || 'badge-default';
  };

  const getStatusBadgeClass = (status) => {
    return status === 'Activo' ? 'badge-active' : 'badge-inactive';
  };

  return (
    <div className="admin-home">
      <div className="welcome-section">
        <h1>Panel de Administración</h1>
        <p>Gestiona usuarios y roles del sistema LUDA</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <h3>{users.length}</h3>
            <p>Total Usuarios</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">👨‍🏫</div>
          <div className="stat-info">
            <h3>{users.filter(u => u.role === 'docente').length}</h3>
            <p>Docentes</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">🎓</div>
          <div className="stat-info">
            <h3>{users.filter(u => u.role === 'estudiante').length}</h3>
            <p>Estudiantes</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">🧑‍⚕️</div>
          <div className="stat-info">
            <h3>{users.filter(u => u.role === 'psicoorientador').length}</h3>
            <p>Psicoorientadores</p>
          </div>
        </div>
      </div>

      <div className="users-management">
        <div className="section-header">
          <h2>Gestión de Usuarios</h2>
          <button 
            className="btn-primary"
            onClick={() => setShowRegisterForm(!showRegisterForm)}
          >
            {showRegisterForm ? 'Cancelar' : '➕ Nuevo Usuario'}
          </button>
        </div>

        {showRegisterForm && (
          <div className="register-form">
            <h3>Registrar Nuevo Usuario</h3>
            
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}
            
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Nombre Completo</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Ingrese el nombre completo"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Correo Electrónico</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="correo@gmail.com"
                    pattern="^[a-zA-Z0-9._%+-]+@gmail\.com$"
                    title="El correo debe ser de dominio @gmail.com"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Rol</label>
                  <select
                    name="role"
                    value={formData.role || 'estudiante'}
                    onChange={handleChange}
                    required
                  >
                    <option value="estudiante">Estudiante</option>
                    <option value="docente">Docente</option>
                    <option value="psicoorientador">Psicoorientador</option>
                  </select>
                  {console.log('🎨 Select de rol - Valor actual:', formData.role, 'Tipo:', typeof formData.role)}
                </div>

                {/* Campos específicos para Docente */}
                {formData.role === 'docente' && (
                  <>
                    <div className="form-group">
                      <label>Especialidad</label>
                      <input
                        type="text"
                        name="especialidad"
                        value={formData.especialidad || ''}
                        onChange={handleChange}
                        placeholder="Ej: Matemáticas"
                      />
                    </div>
                    <div className="form-group">
                      <label>Experiencia</label>
                      <input
                        type="text"
                        name="experiencia"
                        value={formData.experiencia || ''}
                        onChange={handleChange}
                        placeholder="Ej: 3 años"
                      />
                    </div>
                  </>
                )}

                {/* Campos específicos para Estudiante */}
                {formData.role === 'estudiante' && (
                  <>
                    <div className="form-group">
                      <label>Grado</label>
                      <select
                        name="grado"
                        value={formData.grado || ''}
                        onChange={handleChange}
                      >
                        <option value="">Seleccionar grado...</option>
                        <option value="Décimo">Décimo</option>
                        <option value="Undécimo">Undécimo</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Grupo</label>
                      <select
                        name="grupo"
                        value={formData.grupo || ''}
                        onChange={handleChange}
                      >
                        <option value="">Seleccionar grupo...</option>
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="C">C</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Nombre del Acudiente</label>
                      <input
                        type="text"
                        name="nombreAcudiente"
                        value={formData.nombreAcudiente || ''}
                        onChange={handleChange}
                        placeholder="Nombre del acudiente"
                      />
                    </div>
                  </>
                )}

                {/* Campos específicos para Psicoorientador */}
                {formData.role === 'psicoorientador' && (
                  <>
                    <div className="form-group">
                      <label>Especialidad</label>
                      <input
                        type="text"
                        name="especialidad"
                        value={formData.especialidad || ''}
                        onChange={handleChange}
                        placeholder="Ej: Psicología Educativa"
                      />
                    </div>
                    <div className="form-group">
                      <label>Experiencia</label>
                      <input
                        type="text"
                        name="experiencia"
                        value={formData.experiencia || ''}
                        onChange={handleChange}
                        placeholder="Ej: 5 años"
                      />
                    </div>
                  </>
                )}

                <div className="form-group">
                  <label>Contraseña</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Mínimo 8 caracteres"
                    minLength="8"
                    title="La contraseña debe tener al menos 8 caracteres"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Confirmar Contraseña</label>
                  <input
                    type="password"
                    name="confirmarPassword"
                    value={formData.confirmarPassword}
                    onChange={handleChange}
                    placeholder="Repetir contraseña (mínimo 8 caracteres)"
                    minLength="8"
                    title="La contraseña debe tener al menos 8 caracteres"
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? 'Registrando...' : 'Registrar Usuario'}
              </button>
            </form>
          </div>
        )}

        {showEditForm && (
          <div className="register-form">
            <h3>Editar Usuario</h3>
            
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}
            
            <form onSubmit={handleUpdateUser}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Nombre Completo</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Ingrese el nombre completo"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Correo Electrónico</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="correo@gmail.com"
                    pattern="^[a-zA-Z0-9._%+-]+@gmail\.com$"
                    title="El correo debe ser de dominio @gmail.com"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Rol</label>
                  <select
                    name="role"
                    value={formData.role || 'estudiante'}
                    onChange={handleChange}
                    required
                  >
                    <option value="estudiante">Estudiante</option>
                    <option value="docente">Docente</option>
                    <option value="psicoorientador">Psicoorientador</option>
                  </select>
                </div>

                {/* Campos específicos para Docente */}
                {formData.role === 'docente' && (
                  <>
                    <div className="form-group">
                      <label>Especialidad</label>
                      <input
                        type="text"
                        name="especialidad"
                        value={formData.especialidad || ''}
                        onChange={handleChange}
                        placeholder="Ej: Matemáticas"
                      />
                    </div>
                    <div className="form-group">
                      <label>Experiencia</label>
                      <input
                        type="text"
                        name="experiencia"
                        value={formData.experiencia || ''}
                        onChange={handleChange}
                        placeholder="Ej: 3 años"
                      />
                    </div>
                  </>
                )}

                {/* Campos específicos para Estudiante */}
                {formData.role === 'estudiante' && (
                  <>
                    <div className="form-group">
                      <label>Grado</label>
                      <select
                        name="grado"
                        value={formData.grado || ''}
                        onChange={handleChange}
                      >
                        <option value="">Seleccionar grado...</option>
                        <option value="Décimo">Décimo</option>
                        <option value="Undécimo">Undécimo</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Grupo</label>
                      <select
                        name="grupo"
                        value={formData.grupo || ''}
                        onChange={handleChange}
                      >
                        <option value="">Seleccionar grupo...</option>
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="C">C</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Nombre del Acudiente</label>
                      <input
                        type="text"
                        name="nombreAcudiente"
                        value={formData.nombreAcudiente || ''}
                        onChange={handleChange}
                        placeholder="Nombre del acudiente"
                      />
                    </div>
                  </>
                )}

                {/* Campos específicos para Psicoorientador */}
                {formData.role === 'psicoorientador' && (
                  <>
                    <div className="form-group">
                      <label>Especialidad</label>
                      <input
                        type="text"
                        name="especialidad"
                        value={formData.especialidad || ''}
                        onChange={handleChange}
                        placeholder="Ej: Psicología Educativa"
                      />
                    </div>
                    <div className="form-group">
                      <label>Experiencia</label>
                      <input
                        type="text"
                        name="experiencia"
                        value={formData.experiencia || ''}
                        onChange={handleChange}
                        placeholder="Ej: 5 años"
                      />
                    </div>
                  </>
                )}

                              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn-cancel"
                  onClick={() => {
                    setShowEditForm(false);
                    setEditingUser(null);
                    setError('');
                    setSuccess('');
                  }}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-submit" disabled={loading}>
                  {loading ? 'Actualizando...' : 'Actualizar Usuario'}
                </button>
              </div>
            </form>
          </div>
        )}

        {showPasswordForm && (
          <div className="register-form">
            <h3>Cambiar Contraseña - {editingUser?.name}</h3>
            
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}
            
            <form onSubmit={handleChangePasswordSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Usuario</label>
                  <input
                    type="text"
                    value={editingUser?.name || ''}
                    disabled
                    style={{ backgroundColor: '#f5f5f5' }}
                  />
                </div>

                <div className="form-group">
                  <label>Correo Electrónico</label>
                  <input
                    type="email"
                    value={editingUser?.email || ''}
                    disabled
                    style={{ backgroundColor: '#f5f5f5' }}
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
                    title="La contraseña debe tener al menos 8 caracteres"
                  />
                </div>

                <div className="form-group">
                  <label>Confirmar Nueva Contraseña</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    placeholder="Repetir nueva contraseña"
                    minLength="8"
                    required
                    title="La contraseña debe tener al menos 8 caracteres"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn-cancel"
                  onClick={() => {
                    setShowPasswordForm(false);
                    setEditingUser(null);
                    setPasswordData({
                      newPassword: '',
                      confirmPassword: ''
                    });
                    setError('');
                    setSuccess('');
                  }}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-submit" disabled={loading}>
                  {loading ? 'Cambiando...' : 'Cambiar Contraseña'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="users-table">
          <div className="table-header">
            <h3>Usuarios Registrados</h3>
            <div className="search-box">
              <input
                type="text"
                placeholder="Buscar usuarios..."
                className="search-input"
              />
            </div>
          </div>

          <div className="table-container">
            <table className="users-table-content">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Correo</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th>Fecha Registro</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {console.log('🎨 Renderizando tabla con usuarios:', users.length, users)}
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>
                      <div style={{ color: '#666' }}>
                        <p>📭 No hay usuarios registrados</p>
                        <p style={{ fontSize: '14px', marginTop: '10px' }}>
                          Para registrar usuarios, haz clic en el botón "Registrar Nuevo Usuario"
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  users.map((user, index) => (
                    <tr key={user._id || user.id}>
                      <td>{String(index + 1).padStart(3, '0')}</td>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`badge ${getRoleBadgeClass(user.role)}`}>
                          {user.role}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${getStatusBadgeClass(user.status)}`}>
                          {user.status}
                        </span>
                      </td>
                      <td>{user.fechaRegistro ? new Date(user.fechaRegistro).toLocaleDateString('es-ES') : 'N/A'}</td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="btn-action btn-edit"
                            onClick={() => handleEditUser(user)}
                            title="Editar usuario"
                          >
                            ✏️
                          </button>
                          <button 
                            className="btn-action btn-password"
                            onClick={() => handleChangePassword(user)}
                            title="Cambiar contraseña"
                          >
                            🔐
                          </button>
                          <button 
                            className="btn-action btn-status"
                            onClick={() => toggleUserStatus(user._id || user.id)}
                            title={user.status === 'Activo' ? 'Desactivar usuario' : 'Activar usuario'}
                          >
                            {user.status === 'Activo' ? '⏸️' : '▶️'}
                          </button>
                          <button 
                            className="btn-action btn-delete"
                            onClick={() => handleDeleteUser(user._id || user.id)}
                            title="Eliminar usuario"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal de confirmación personalizado */}
      <ConfirmModal
        isOpen={isOpen}
        onClose={closeModal}
        onConfirm={config.onConfirm}
        title={config.title}
        message={config.message}
        confirmText={config.confirmText}
        cancelText={config.cancelText}
        type={config.type}
      />
    </div>
  );
};

export default AdminHomePage;
