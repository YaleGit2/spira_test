import { Outlet } from 'react-router-dom';
import useUserService from './services/user';
import Login from './pages/Login';

const ProtectedRoutes = () => {
  const isAuthenticated = useUserService.isAuthenticated;
  return isAuthenticated ? <Outlet /> : <Login />;
};
export default ProtectedRoutes;
