import { Outlet } from 'react-router-dom';

export const AppLayoutContainer = () => {
  return (
    <main className="app-layout-content">
      <Outlet />
    </main>
  );
};
