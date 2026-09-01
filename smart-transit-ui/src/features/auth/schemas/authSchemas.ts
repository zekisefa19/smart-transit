import { z } from 'zod';

export const loginSchema = z.object({
    email: z.string().email('Geçerli bir e-posta adresi giriniz.'),
    password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır.'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
    fullName: z.string().min(2, 'Ad soyad en az 2 karakter olmalıdır.'),
    email: z.string().email('Geçerli bir e-posta adresi giriniz.'),
    password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır.'),
    role: z.enum(['Passenger', 'Operator', 'Admin']).optional(),
});

export type RegisterFormData = z.infer<typeof registerSchema>;