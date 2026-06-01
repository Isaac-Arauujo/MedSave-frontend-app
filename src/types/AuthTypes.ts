export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  cpf: string;
  phone?: string;
}

/** Payload enviado ao POST /auth/register (CadastroRequestDTO). */
export interface RegisterCustomerRequest {
  nome: string;
  email: string;
  password: string;
  confirmPassword: string;
  cpf: string;
}

export interface AuthResponse {
  token: string;
  type: string;
  expiresIn: number;
  role: string;
  userId: number;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface MessageResponse {
  message: string;
  hint?: string;
}
