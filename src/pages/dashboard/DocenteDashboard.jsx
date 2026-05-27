import React from 'react';
import { Outlet } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';

const DocenteDashboard = () => {
  return (
    <DashboardLayout userRole="docente">
      <Outlet />
    </DashboardLayout>
  );
};

export default DocenteDashboard;
