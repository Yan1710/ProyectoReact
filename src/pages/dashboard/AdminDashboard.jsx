import React from 'react';
import { Outlet } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';

const AdminDashboard = () => {
  return (
    <DashboardLayout userRole="admin">
      <Outlet />
    </DashboardLayout>
  );
};

export default AdminDashboard;
