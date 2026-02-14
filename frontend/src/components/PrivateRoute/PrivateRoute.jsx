import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../../services/AuthService';

export default function PrivateRoute({ children }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!AuthService.isAuthenticated()) {
      navigate('/login');
    }
  }, [navigate]);

  return AuthService.isAuthenticated() ? children : null;
}