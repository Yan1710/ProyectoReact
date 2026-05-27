// Servicio de autenticación conectado al backend real

const API_BASE_URL = 'http://localhost:5000/api';

class AuthService {
  constructor() {
    // Limpiar datos corruptos al iniciar
    this.clearCorruptedData();
    this.currentUser = this.getCurrentUser();
    // Generar ID único para esta pestaña/ventana
    this.tabId = this.getOrCreateTabId();
  }

  // Generar o obtener ID único para esta pestaña
  getOrCreateTabId() {
    let tabId = sessionStorage.getItem('tabId');
    if (!tabId) {
      tabId = 'tab_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('tabId', tabId);
      console.log('🆔 Nuevo tabId generado:', tabId);
    }
    return tabId;
  }

  // Iniciar sesión
  async login(email, password) {
    try {
      console.log('🔐 Iniciando sesión para:', email, 'en pestaña:', this.tabId);
      
      // Limpiar solo la sesión actual de esta pestaña
      this.clearCurrentTabSession();
      
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log('Server response data:', data); // Add this line for debugging

      if (data.success) {
        // Verificar que data.user exista y sea válido
        if (!data.user || typeof data.user !== 'object') {
          console.error('❌ Error: Respuesta del servidor no contiene datos de usuario válidos');
          return {
            success: false,
            error: 'Error en la respuesta del servidor'
          };
        }
        
        // Guardar sesión específica para esta pestaña
        this.setTabSession(data.user, data.token);
        
        console.log('✅ Sesión iniciada correctamente en pestaña:', this.tabId, { 
          name: data.user.name, 
          email: data.user.email, 
          role: data.user.role,
          status: data.user.status
        });
        
        return {
          success: true,
          user: data.user,
          token: data.token
        };
      } else {
        // Manejar específicamente el caso de usuario inactivo
        if (data.message && data.message.includes('inactivo')) {
          return {
            success: false,
            error: 'Tu cuenta está inactiva. Por favor contacta al administrador.',
            isInactive: true
          };
        }
        
        return {
          success: false,
          error: data.message || 'Error al iniciar sesión'
        };
      }
    } catch (error) {
      console.error('Error de login:', error);
      return {
        success: false,
        error: 'Error de conexión con el servidor'
      };
    }
  }

  // Establecer sesión para la pestaña actual
  setTabSession(user, token) {
    // Verificar que user existe y tiene los datos necesarios
    if (!user || typeof user !== 'object') {
      console.error('❌ Error: Datos de usuario inválidos en setTabSession');
      return;
    }
    
    // Guardar SOLO en sessionStorage específico de esta pestaña
    sessionStorage.setItem(`user_${this.tabId}`, JSON.stringify(user));
    sessionStorage.setItem(`token_${this.tabId}`, token);
    sessionStorage.setItem(`active_${this.tabId}`, 'true');
    
    // También guardar en localStorage como respaldo global
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('activeSession', `user_${this.tabId}`);
    localStorage.setItem('lastActiveTab', this.tabId);
    
    this.currentUser = user;
    
    console.log('✅ Sesión establecida para pestaña:', this.tabId, {
      name: user.name || 'N/A',
      email: user.email || 'N/A',
      role: user.role || 'N/A',
      status: user.status || 'N/A'
    });
  }

  // Limpiar sesión de la pestaña actual
  clearCurrentTabSession() {
    console.log('🧹 Limpiando sesión de pestaña actual:', this.tabId);
    
    // Limpiar sessionStorage de esta pestaña
    sessionStorage.removeItem(`user_${this.tabId}`);
    sessionStorage.removeItem(`token_${this.tabId}`);
    sessionStorage.removeItem(`active_${this.tabId}`);
    
    // Resetear instancia actual
    this.currentUser = null;
    
    console.log('✅ Sesión de pestaña limpiada completamente');
  }

  // Obtener usuario actual desde sessionStorage (método principal)
  getCurrentUser() {
    // SOLO intentar obtener desde sessionStorage de esta pestaña
    const tabUser = sessionStorage.getItem(`user_${this.tabId}`);
    const tabToken = sessionStorage.getItem(`token_${this.tabId}`);
    const tabActive = sessionStorage.getItem(`active_${this.tabId}`);
    
    if (tabUser && tabToken && tabActive === 'true') {
      try {
        const user = JSON.parse(tabUser);
        
        // Verificación básica de integridad de datos
        if (!user || typeof user !== 'object') {
          console.warn('⚠️ Datos de usuario inválidos en sessionStorage');
          this.clearCurrentSession();
          return null;
        }
        
        if (!user.id || !user.email || !user.role) {
          console.warn('⚠️ Faltan campos requeridos en datos de usuario');
          this.clearCurrentSession();
          return null;
        }
        
        // Verificar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(user.email)) {
          console.warn('⚠️ Email con formato inválido:', user.email);
          this.clearCurrentSession();
          return null;
        }
        
        // Sincronizar con localStorage para compatibilidad con API calls
        localStorage.setItem('token', tabToken);
        localStorage.setItem('user', tabUser);
        localStorage.setItem('lastActiveTab', this.tabId);
        
        this.currentUser = user;
        
        console.log('👤 Usuario actual obtenido desde sessionStorage (pestaña:', this.tabId, ')', { 
          name: user.name, 
          email: user.email, 
          role: user.role,
          status: user.status
        });
        
        return user;
      } catch (error) {
        console.error('❌ Error parsing user from sessionStorage:', error);
        this.clearCurrentSession();
        return null;
      }
    }
    
    // Si no hay en sessionStorage, intentar como respaldo desde localStorage
    const userStr = localStorage.getItem('user');
    if (userStr && userStr !== 'undefined') {
      try {
        const user = JSON.parse(userStr);
        
        // Verificación básica de integridad de datos
        if (!user || typeof user !== 'object') {
          console.warn('⚠️ Datos de usuario inválidos en localStorage');
          this.clearCurrentSession();
          return null;
        }
        
        // Verificar campos mínimos requeridos
        if (!user.id || !user.email || !user.role) {
          console.warn('⚠️ Faltan campos requeridos en datos de usuario');
          this.clearCurrentSession();
          return null;
        }
        
        // Verificar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(user.email)) {
          console.warn('⚠️ Email con formato inválido:', user.email);
          this.clearCurrentSession();
          return null;
        }
        
        console.log('👤 Usuario actual obtenido desde localStorage (respaldo):', { 
          name: user.name, 
          email: user.email, 
          role: user.role,
          status: user.status
        });
        
        return user;
      } catch (error) {
        console.error('❌ Error parsing user from localStorage:', error);
        this.clearCurrentSession();
        return null;
      }
    }
    
    console.log('⚠️ No hay sesión activa en esta pestaña:', this.tabId);
    return null;
  }

  // Cerrar sesión
  logout() {
    console.log('🔒 Cerrando sesión manualmente en pestaña:', this.tabId);
    
    // Limpiar sesión de la pestaña actual
    this.clearCurrentTabSession();
    
    // Forzar redirección inmediata
    window.location.href = '/login';
    
    return { success: true };
  }

  // Establecer sesión activa
  setActiveSession(sessionKey) {
    const allSessions = this.getAllSessions();
    const session = allSessions[sessionKey];
    
    if (session) {
      // Actualizar última actividad
      session.lastActive = new Date().toISOString();
      allSessions[sessionKey] = session;
      
      // Guardar sesiones actualizadas
      this.saveAllSessions(allSessions);
      
      // Establecer como sesión activa actual
      localStorage.setItem('activeSession', sessionKey);
      localStorage.setItem('token', session.token);
      localStorage.setItem('user', JSON.stringify(session.user));
      this.currentUser = session.user;
      
      console.log('🔄 Sesión activa cambiada:', { 
        sessionKey: sessionKey,
        user: session.user.name,
        email: session.user.email,
        role: session.user.role
      });
      
      return true;
    }
    
    return false;
  }

  // Cambiar a sesión específica (método público)
  switchToSession(sessionKey) {
    const allSessions = this.getAllSessions();
    const session = allSessions[sessionKey];
    
    if (session) {
      console.log('🔄 Cambiando a sesión:', sessionKey);
      return this.setActiveSession(sessionKey);
    }
    
    console.warn('⚠️ Sesión no encontrada:', sessionKey);
    return false;
  }

  // Obtener lista de todas las sesiones activas (para UI)
  getActiveSessionsList() {
    const allSessions = this.getAllSessions();
    const sessionsList = [];
    
    Object.keys(allSessions).forEach(sessionKey => {
      const session = allSessions[sessionKey];
      sessionsList.push({
        sessionKey: sessionKey,
        user: session.user,
        loginTime: session.loginTime,
        lastActive: session.lastActive,
        isActive: this.getActiveSession() === sessionKey
      });
    });
    
    // Ordenar por última actividad
    sessionsList.sort((a, b) => new Date(b.lastActive) - new Date(a.lastActive));
    
    return sessionsList;
  }

  // Verificar si hay sesión activa para un email específico
  hasActiveSession(email) {
    const allSessions = this.getAllSessions();
    const activeSessionKey = this.getActiveSession();
    
    if (activeSessionKey && allSessions[activeSessionKey]) {
      return allSessions[activeSessionKey].user.email === email;
    }
    
    return false;
  }

  // Obtener sesión activa actual
  getActiveSession() {
    const activeSessionKey = localStorage.getItem('activeSession');
    return activeSessionKey;
  }

  // Obtener todas las sesiones activas del usuario actual
  getUserSessions(email) {
    const allSessions = this.getAllSessions();
    const userSessions = {};
    
    Object.keys(allSessions).forEach(sessionKey => {
      if (sessionKey.startsWith(email)) {
        userSessions[sessionKey] = allSessions[sessionKey];
      }
    });
    
    return userSessions;
  }

  // Cerrar sesión específica
  logoutSession(sessionKey) {
    const allSessions = this.getAllSessions();
    
    if (allSessions[sessionKey]) {
      delete allSessions[sessionKey];
      this.saveAllSessions(allSessions);
      
      // Si era la sesión activa de esta pestaña, limpiar datos actuales
      if (this.getTabActiveSession() === sessionKey) {
        sessionStorage.removeItem('tabActiveSession');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.currentUser = null;
      }
      
      console.log('🔒 Sesión cerrada:', sessionKey);
      return true;
    }
    
    return false;
  }

  // Cerrar sesión actual de esta pestaña
  logout() {
    const tabActiveSessionKey = this.getTabActiveSession();
    
    if (tabActiveSessionKey) {
      console.log('🔒 Cerrando sesión de pestaña actual:', tabActiveSessionKey);
      return this.logoutSession(tabActiveSessionKey);
    } else {
      // Si no hay sesión de pestaña, limpiar datos antiguos
      console.log('🔒 Cerrando sesión manualmente (sin sesión de pestaña)');
      sessionStorage.removeItem('tabActiveSession');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      this.currentUser = null;
      return { success: true };
    }
  }

  // Forzar cierre de sesión (para casos específicos)
  forceLogout() {
    console.log('🔄 Forzando cierre de sesión');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUser = null;
    return { success: true };
  }

  // Limpiar datos corruptos o inconsistentes
  clearCorruptedData() {
    console.warn('🧹 Limpiando datos corruptos o inconsistentes');
    
    // Limpiar si el valor es 'undefined' o está corrupto
    const userStr = localStorage.getItem('user');
    if (userStr === 'undefined' || userStr === null) {
      localStorage.removeItem('user');
    }
    
    const token = localStorage.getItem('token');
    if (token === 'undefined' || token === null) {
      localStorage.removeItem('token');
    }
    
    this.currentUser = null;
  }

  // Verificar si está autenticado
  isAuthenticated() {
    return this.currentUser !== null;
  }

  // Obtener rol del usuario actual
  getUserRole() {
    return this.currentUser ? this.currentUser.role : null;
  }

  // Verificar rol específico
  hasRole(role) {
    return this.currentUser && this.currentUser.role === role;
  }

  // Obtener información del usuario
  getUserInfo() {
    return this.currentUser;
  }

  // Obtener sesión activa de la pestaña actual
  getTabActiveSession() {
    return sessionStorage.getItem('tabActiveSession');
  }

  // Obtener todas las sesiones activas
  getAllSessions() {
    const sessions = localStorage.getItem('allSessions');
    return sessions ? JSON.parse(sessions) : {};
  }

  // Guardar todas las sesiones activas
  saveAllSessions(sessions) {
    localStorage.setItem('allSessions', JSON.stringify(sessions));
  }

  // Limpiar sesión actual (método unificado)
  clearCurrentSession() {
    console.log('🧹 Limpiando sesión actual');
    
    // Limpiar sessionStorage de esta pestaña
    sessionStorage.removeItem(`user_${this.tabId}`);
    sessionStorage.removeItem(`token_${this.tabId}`);
    sessionStorage.removeItem(`active_${this.tabId}`);
    
    // Limpiar localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('activeSession');
    localStorage.removeItem('lastActiveTab');
    
    // Resetear instancia actual
    this.currentUser = null;
    
    console.log('✅ Sesión actual limpiada completamente');
  }

  // Obtener token
  getToken() {
    return localStorage.getItem('token');
  }

  // Verificar si el token es válido (solo validez del token, no estado del usuario)
  async verifyToken() {
    const token = this.getToken();
    if (!token) return false;

    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          // Actualizar datos del usuario en localStorage y en memoria
          // pero NO verificar el estado aquí (eso se hace solo al login)
          localStorage.setItem('user', JSON.stringify(data.user));
          this.currentUser = data.user;
          
          console.log('✅ Token verificado y usuario actualizado:', { 
            name: data.user.name, 
            email: data.user.email, 
            role: data.user.role,
            status: data.user.status 
          });
          
          return true;
        } else {
          console.warn('⚠️ Respuesta inválida del servidor');
          this.logout();
          return false;
        }
      } else {
        console.warn('⚠️ Token no válido o expirado');
        this.logout();
        return false;
      }
    } catch (error) {
      console.error('❌ Error verifying token:', error);
      this.logout();
      return false;
    }
  }

  // Verificar estado del usuario (para casos específicos como reactivación)
  async verifyUserStatus() {
    const token = this.getToken();
    if (!token) return { valid: false, message: 'No hay token' };

    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          // Actualizar datos del usuario
          localStorage.setItem('user', JSON.stringify(data.user));
          this.currentUser = data.user;
          
          // Verificar específicamente el estado
          const isActive = data.user.status === 'Activo' || data.user.role === 'admin';
          
          console.log('🔍 Estado de usuario verificado:', { 
            name: data.user.name, 
            status: data.user.status,
            isActive: isActive
          });
          
          return { 
            valid: isActive, 
            user: data.user,
            message: isActive ? 'Usuario activo' : 'Usuario inactivo'
          };
        } else {
          return { valid: false, message: 'Respuesta inválida del servidor' };
        }
      } else {
        return { valid: false, message: 'Token no válido o expirado' };
      }
    } catch (error) {
      console.error('❌ Error verificando estado:', error);
      return { valid: false, message: 'Error de conexión' };
    }
  }

  // Simular recuperación de contraseña
  async forgotPassword(email) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      
      return {
        success: data.success,
        message: data.message || 'Se ha enviado un correo de recuperación'
      };
    } catch (error) {
      console.error('Error en forgot password:', error);
      return {
        success: false,
        error: 'Error de conexión con el servidor'
      };
    }
  }
}

export default new AuthService();
