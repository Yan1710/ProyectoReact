import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Login.css";
import AuthService from "../../components/auth/AuthService";

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await AuthService.login(formData.email, formData.password);
      
      if (result.success) {
        // Redirigir al dashboard correspondiente
        const roleRoutes = {
          admin: '/dashboard/admin',
          docente: '/dashboard/docente',
          estudiante: '/dashboard/estudiante',
          psicoorientador: '/dashboard/psicoorientador'
        };
        
        const redirectTo = location.state?.from?.pathname || roleRoutes[result.user?.role];
        navigate(redirectTo, { replace: true });
      } else {
        // Mostrar error específico para usuario inactivo
        if (result.isInactive) {
          setError(result.error);
        } else {
          setError(result.error || 'Error al iniciar sesión');
        }
      }
    } catch (err) {
      setError('Ocurrió un error. Por favor intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">

        {/* LADO IZQUIERDO */}
        <div className="login-left">
          <div className="shape shape-one"></div>
          <div className="shape shape-two"></div>
          <h2>Bienestar Mental</h2>
          <p>Educación que cuida tu mente</p>
        </div>

        {/* LADO DERECHO */}
        <div className="login-right">
          <div className="logo">
            <img src="/src/assets/common/logo-luda2.png" alt="LUDA" className="luda-logo" />
          </div>

          <h1>Bienvenido/a</h1>
          <p className="subtitle">
            Un espacio seguro para tu bienestar emocional
          </p>

          <form onSubmit={handleSubmit}>
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <div className="input-group">
              <input 
                type="email" 
                name="email"
                placeholder="Correo electrónico" 
                value={formData.email}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className="input-group">
              <input 
                type="password" 
                name="password"
                placeholder="Contraseña" 
                value={formData.password}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <button type="submit" disabled={loading}>
              {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </button>

            <a href="/forgot-password" className="forgot">
              ¿Olvidaste tu contraseña?
            </a>
            
            <a href="/" className="back-to-home">
              Volver al inicio
            </a>

            {/* Cuentas de prueba para desarrollo (comentado para producción) */}
            {/* 
            <div className="test-accounts">
              <h3>Cuentas de Prueba</h3>
              <div className="account-list">
                <div className="account-item">
                  <strong>Admin:</strong> admin@luda.com / admin123
                </div>
                <div className="account-item">
                  <strong>Docente:</strong> docente@luda.com / docente123
                </div>
                <div className="account-item">
                  <strong>Estudiante:</strong> estudiante@luda.com / estudiante123
                </div>
                <div className="account-item">
                  <strong>Psicoorientador:</strong> psicoorientador@luda.com / psico123
                </div>
              </div>
            </div>
            */}
          </form>
        </div>

      </div>
    </div>
  );
};

export default Login;