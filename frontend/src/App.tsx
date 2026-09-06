import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { CustomerProvider } from './context/CustomerContext';
import { AdminProvider } from './context/AdminContext';
import { AppRouter } from './router/AppRouter';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AdminProvider>
        <CustomerProvider>
          <AppRouter />
        </CustomerProvider>
      </AdminProvider>
    </BrowserRouter>
  );
};

export default App;
