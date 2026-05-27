import React from "react";
import "./Login.css";

const ForgotPassword = () => {
  return (
    <div className="login-page">
      <div className="login-card">

        {/* LADO IZQUIERDO */}
        <div className="login-left">
          <div className="shape shape-one"></div>
          <div className="shape shape-two"></div>
          <div className="shape shape-three"></div>
          <h2>Recupera tu Acceso</h2>
          <p>Te ayudaremos a restablecer tu contraseña</p>
        </div>

        {/* LADO DERECHO */}
        <div className="login-right">
          <div className="logo">
            <img src="/src/assets/common/logo-luda2.png" alt="LUDA" className="luda-logo" />
          </div>

          <h1>¿Olvidaste tu contraseña?</h1>
          <p className="subtitle">
            Ingresa tu correo electrónico y te enviaremos las instrucciones para restablecer tu contraseña
          </p>

          <form>
            <div className="input-group">
              <input type="email" placeholder="Correo electrónico" required />
            </div>

            <button type="submit">Enviar instrucciones</button>

            <a href="/login" className="forgot">
              Volver al inicio de sesión
            </a>
            
            <a href="/" className="back-to-home">
              Volver al inicio
            </a>
          </form>
        </div>

      </div>
    </div>
  );
};

export default ForgotPassword;
