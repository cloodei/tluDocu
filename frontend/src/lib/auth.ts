import { apiUrl } from './api';

interface User {
  id: string;
  email: string;
  name: string;
}

interface LoginResponse {
  user: User;
  token: string;
}

export async function loginUser({
  email,
  password,
  login
}: {
  email: string;
  password: string;
  login: (user: User, token: string) => void;
}) {
  // TODO: Replace with actual API call
  // const response = await fetch(`${apiUrl}/auth/login`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ email, password }),
  // });
  // 
  // if (!response.ok) {
  //   throw new Error('Đăng nhập thất bại');
  // }
  // 
  // const data: LoginResponse = await response.json();
  // authActions.login(data.user, data.token);

  await new Promise(resolve => setTimeout(resolve, 800));
  
  const mockUser: User = {
    id: '1',
    email,
    name: email.split('@')[0],
  };
  
  const mockToken = 'mock-jwt-token-' + Date.now();
  
  login(mockUser, mockToken);
}

export function logoutUser(authActions: { logout: () => void }) {
  authActions.logout();
}
