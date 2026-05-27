import React from 'react';
import DashboardLayout from './DashboardLayout';

const PsicoorientadorDashboard = () => {
  return (
    <DashboardLayout userRole="psicoorientador">
      <div className="dashboard-welcome">
        <h1>Bienvenido, Psicoorientador</h1>
        <p>Gestiona sesiones, evaluaciones y acompañamiento estudiantil</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <h3>120 Estudiantes</h3>
            <p>Bajo seguimiento</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🗓️</div>
          <div className="stat-info">
            <h3>8 Sesiones</h3>
            <p>Programadas hoy</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-info">
            <h3>15 Evaluaciones</h3>
            <p>Pendientes de revisión</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <h3>94%</h3>
            <p>Tasa de asistencia</p>
          </div>
        </div>
      </div>

      <div className="content-grid">
        <div className="content-card">
          <h2>Sesiones de Hoy</h2>
          <div className="session-list">
            <div className="session-item">
              <div className="session-time">
                <span className="time">08:00 AM</span>
                <span className="duration">45 min</span>
              </div>
              <div className="session-info">
                <h4>Juan Pérez - 10° A</h4>
                <p>Seguimiento académico</p>
              </div>
              <div className="session-status">
                <span className="status-pending">Pendiente</span>
              </div>
            </div>
            <div className="session-item">
              <div className="session-time">
                <span className="time">09:00 AM</span>
                <span className="duration">1 hora</span>
              </div>
              <div className="session-info">
                <h4>María García - 11° B</h4>
                <p>Orientación vocacional</p>
              </div>
              <div className="session-status">
                <span className="status-confirmed">Confirmada</span>
              </div>
            </div>
            <div className="session-item">
              <div className="session-time">
                <span className="time">10:30 AM</span>
                <span className="duration">30 min</span>
              </div>
              <div className="session-info">
                <h4>Carlos López - 9° C</h4>
                <p>Apoyo emocional</p>
              </div>
              <div className="session-status">
                <span className="status-confirmed">Confirmada</span>
              </div>
            </div>
          </div>
        </div>

        <div className="content-card">
          <h2>Casos Prioritarios</h2>
          <div className="case-list">
            <div className="case-item urgent">
              <div className="case-header">
                <h4>Ana Martínez - 8° A</h4>
                <span className="priority-badge urgent">Alta</span>
              </div>
              <p className="case-description">Dificultades de adaptación y ansiedad social</p>
              <div className="case-actions">
                <button className="action-btn primary">Ver detalles</button>
                <button className="action-btn secondary">Agendar sesión</button>
              </div>
            </div>
            <div className="case-item medium">
              <div className="case-header">
                <h4>Luis Rodríguez - 10° B</h4>
                <span className="priority-badge medium">Media</span>
              </div>
              <p className="case-description">Problemas de concentración académica</p>
              <div className="case-actions">
                <button className="action-btn primary">Ver detalles</button>
                <button className="action-btn secondary">Seguimiento</button>
              </div>
            </div>
            <div className="case-item low">
              <div className="case-header">
                <h4>Sofía Hernández - 11° A</h4>
                <span className="priority-badge low">Baja</span>
              </div>
              <p className="case-description">Orientación sobre elección de carrera</p>
              <div className="case-actions">
                <button className="action-btn primary">Ver detalles</button>
                <button className="action-btn secondary">Recordatorio</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="content-card full-width">
        <h2>Actividad Reciente</h2>
        <div className="activity-timeline">
          <div className="timeline-item">
            <div className="timeline-dot completed"></div>
            <div className="timeline-content">
              <h4>Sesión completada</h4>
              <p>Diego Torres - Seguimiento académico</p>
              <span className="timeline-time">Hace 1 hora</span>
            </div>
          </div>
          <div className="timeline-item">
            <div className="timeline-dot evaluation"></div>
            <div className="timeline-content">
              <h4>Evaluación aplicada</h4>
              <p>Test de ansiedad - Grupo 10°</p>
              <span className="timeline-time">Hace 3 horas</span>
            </div>
          </div>
          <div className="timeline-item">
            <div className="timeline-dot report"></div>
            <div className="timeline-content">
              <h4>Reporte generado</h4>
              <p>Informe mensual de seguimiento</p>
              <span className="timeline-time">Ayer</span>
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
          margin-bottom: 24px;
        }

        .content-card {
          background: white;
          padding: 24px;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .content-card.full-width {
          grid-column: 1 / -1;
        }

        .content-card h2 {
          font-size: 18px;
          font-weight: 600;
          color: #1d3557;
          margin-bottom: 16px;
        }

        .session-list, .case-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .session-item, .case-item {
          padding: 16px;
          background: #f8fafc;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
        }

        .session-time {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .time {
          font-size: 14px;
          font-weight: 600;
          color: #1d3557;
        }

        .duration {
          font-size: 12px;
          color: #64748b;
        }

        .session-info {
          flex: 1;
          margin: 0 16px;
        }

        .session-info h4, .case-header h4 {
          font-size: 14px;
          font-weight: 600;
          color: #1d3557;
          margin-bottom: 4px;
        }

        .session-info p, .case-description {
          font-size: 12px;
          color: #64748b;
        }

        .session-status span, .priority-badge {
          font-size: 11px;
          padding: 4px 8px;
          border-radius: 12px;
          font-weight: 500;
        }

        .status-pending {
          background: #fef3c7;
          color: #d97706;
        }

        .status-confirmed {
          background: #d1fae5;
          color: #059669;
        }

        .priority-badge.urgent {
          background: #fef2f2;
          color: #dc2626;
        }

        .priority-badge.medium {
          background: #fef3c7;
          color: #d97706;
        }

        .priority-badge.low {
          background: #f0f9ff;
          color: #0369a1;
        }

        .case-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .case-actions {
          display: flex;
          gap: 8px;
          margin-top: 12px;
        }

        .action-btn {
          padding: 6px 12px;
          border: none;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .action-btn.primary {
          background: #457b9d;
          color: white;
        }

        .action-btn.primary:hover {
          background: #1d3557;
        }

        .action-btn.secondary {
          background: #f1f5f9;
          color: #475569;
        }

        .action-btn.secondary:hover {
          background: #e2e8f0;
        }

        .activity-timeline {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .timeline-item {
          display: flex;
          gap: 16px;
          align-items: flex-start;
        }

        .timeline-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          margin-top: 4px;
          flex-shrink: 0;
        }

        .timeline-dot.completed {
          background: #059669;
        }

        .timeline-dot.evaluation {
          background: #457b9d;
        }

        .timeline-dot.report {
          background: #d97706;
        }

        .timeline-content {
          flex: 1;
        }

        .timeline-content h4 {
          font-size: 14px;
          font-weight: 600;
          color: #1d3557;
          margin-bottom: 4px;
        }

        .timeline-content p {
          font-size: 13px;
          color: #64748b;
          margin-bottom: 4px;
        }

        .timeline-time {
          font-size: 12px;
          color: #94a3b8;
        }

        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }

          .content-grid {
            grid-template-columns: 1fr;
          }

          .session-item {
            flex-direction: column;
            gap: 12px;
          }

          .session-info {
            margin: 0;
          }

          .case-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </DashboardLayout>
  );
};

export default PsicoorientadorDashboard;
