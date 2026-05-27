import React from 'react';
import { Outlet } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';

const EstudianteDashboard = () => {
  return (
    <DashboardLayout userRole="estudiante">
      <Outlet />
    </DashboardLayout>
  );
};

export default EstudianteDashboard;
