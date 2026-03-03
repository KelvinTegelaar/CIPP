import { useContext } from 'react';
import { AuthContext } from '../contexts/auth/jwt-context';

export const useAuth = () => useContext(AuthContext);
