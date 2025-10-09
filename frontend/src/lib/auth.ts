import { apiUrl } from "./api";
import { type User } from "./types";

interface LoginResponse {
  token: string;
  role: 'admin' | 'head' | 'teacher';
  teacherId: string;
  email: string;
  teacherName?: string | null;
  departmentId: number | null;
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
  const response = await fetch(`${apiUrl}/api/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  });

  if (response.status === 401)
    throw new Error("Tài khoản không tồn tại");
  if (response.status === 403)
    throw new Error("Mật khẩu không chính xác");

  const data: LoginResponse = await response.json();

  const user: User = {
    id: data.teacherId,
    email,
    name: data.teacherName ?? email.split('@')[0],
    role: data.role,
    departmentId: data.departmentId
  };

  login(user, data.token);
}

export function logoutUser(authActions: { logout: () => void }) {
  authActions.logout();
}
