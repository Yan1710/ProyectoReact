import React from 'react';
import { Outlet } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';

const PsicoorientadorDashboard = () => {
  return (
    <DashboardLayout userRole="psicoorientador">
      <Outlet />
    </DashboardLayout>
  );
};

export default PsicoorientadorDashboard;
