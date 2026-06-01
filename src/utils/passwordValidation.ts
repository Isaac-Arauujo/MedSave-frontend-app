import { z } from 'zod';

export const STRONG_PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[^a-zA-Z0-9]).{8,}$/;

export const strongPasswordSchema = z
  .string()
  .min(1, 'Senha é obrigatória')
  .regex(
    STRONG_PASSWORD_REGEX,
    'A senha deve ter no mínimo 8 caracteres, 1 maiúscula, 1 número e 1 caractere especial'
  );

export const confirmPasswordField = z.string().min(1, 'Confirmação de senha é obrigatória');
