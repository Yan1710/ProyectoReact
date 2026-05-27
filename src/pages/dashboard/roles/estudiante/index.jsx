import React from 'react';
import DashboardLayout from './DashboardLayout';

const EstudianteDashboard = () => {
  return (
    <DashboardLayout userRole="estudiante">
      <div className="dashboard-welcome">
        <h1>Bienvenido, Estudiante</h1>
        <p>Accede a tus cursos, actividades y seguimiento académico</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📚</div>
          <div className="stat-info">
            <h3>6 Cursos</h3>
            <p>Matriculados este semestre</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📝</div>
          <div className="stat-info">
            <h3>12 Actividades</h3>
            <p>Pendientes de entregar</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <h3>85%</h3>
            <p>Promedio académico</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🎯</div>
          <div className="stat-info">
            <h3>4</h3>
            <p>Logros desbloqueados</p>
          </div>
        </div>
      </div>

      <div className="content-grid">
        <div className="content-card">
          <h2>Mis Cursos</h2>
          <div className="course-list">
            <div className="course-item">
              <div className="course-info">
                <h4>Psicología Educativa</h4>
                <p>Prof. María González</p>
              </div>
              <div className="course-progress">
                <div className="progress-bar">
                  <div className="progress-fill" style={{width: '75%'}}></div>
                </div>
                <span>75%</span>
              </div>
            </div>
            <div className="course-item">
              <div className="course-info">
                <h4>Desarrollo Humano</h4>
                <p>Prof. Carlos Rodríguez</p>
              </div>
              <div className="course-progress">
                <div className="progress-bar">
                  <div className="progress-fill" style={{width: '60%'}}></div>
                </div>
                <span>60%</span>
              </div>
            </div>
            <div className="course-item">
              <div className="course-info">
                <h4>Orientación Vocacional</h4>
                <p>Prof. Ana Martínez</p>
              </div>
              <div className="course-progress">
                <div className="progress-bar">
                  <div className="progress-fill" style={{width: '90%'}}></div>
                </div>
                <span>90%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="content-card">
          <h2>Actividades Pendientes</h2>
          <div className="activity-list">
            <div className="activity-item">
              <div className="activity-info">
                <h4>Taller: Autoevaluación</h4>
                <p>Psicología Educativa</p>
              </div>
              <div className="activity-deadline">
                <span className="deadline-date">Mañana</span>
                <span className="deadline-urgent">Urgente</span>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-info">
                <h4>Ensayo: Etapas del Desarrollo</h4>
                <p>Desarrollo Humano</p>
              </div>
              <div className="activity-deadline">
                <span className="deadline-date">3 días</span>
                <span className="deadline-normal">Normal</span>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-info">
                <h4>Proyecto: Plan de Vida</h4>
                <p>Orientación Vocacional</p>
              </div>
              <div className="activity-deadline">
                <span className="deadline-date">1 semana</span>
                <span className="deadline-normal">Normal</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .dashboard-welcome {
          margin-bottom: 32px;
        }

        .dashboard-welcome h1 {
          font-size: 28px;
          font-weight: 700;
          color: #1d3557;
          margin-bottom: 8px;
        }

        .dashboard-welcome p {
          font-size: 16px;
          color: #64748b;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 24px;
          margin-bottom: 32px;
        }

        .stat-card {
          background: white;
          padding: 24px;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .stat-icon {
          font-size: 32px;
          width: 60px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f1f5f9;
          border-radius: 12px;
        }

        .stat-info h3 {
          font-size: 24px;
          font-weight: 700;
          color: #1d3557;
          margin-bottom: 4px;
        }

        .stat-info p {
          font-size: 14px;
          color: #64748b;
        }

        .content-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }

        .content-card {
          background: white;
          padding: 24px;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .content-card h2 {
          font-size: 18px;
          font-weight: 600;
          color: #1d3557;
          margin-bottom: 16px;
        }

        .course-list, .activity-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .course-item, .activity-item {
          padding: 16px;
          background: #f8fafc;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
        }

        .course-info h4, .activity-info h4 {
          font-size: 14px;
          font-weight: 600;
          color: #1d3557;
          margin-bottom: 4px;
        }

        .course-info p, .activity-info p {
          font-size: 12px;
          color: #64748b;
        }

        .course-progress {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 12px;
        }

        .progress-bar {
          flex: 1;
          height: 8px;
          background: #e2e8f0;
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: #457b9d;
          border-radius: 4px;
          transition: width 0.3s ease;
        }

        .course-progress span {
          font-size: 12px;
          font-weight: 600;
          color: #1d3557;
          min-width: 40px;
        }

        .activity-deadline {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 8px;
        }

        .deadline-date {
          font-size: 12px;
          color: #64748b;
        }

        .deadline-urgent {
          font-size: 11px;
          padding: 2px 8px;
          background: #fef2f2;
          color: #dc2626;
          border-radius: 12px;
          font-weight: 500;
        }

        .deadline-normal {
          font-size: 11px;
          padding: 2px 8px;
          background: #f0f9ff;
          color: #0369a1;
          border-radius: 12px;
          font-weight: 500;
        }

        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }

          .content-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </DashboardLayout>
  );
};

export default EstudianteDashboard;
