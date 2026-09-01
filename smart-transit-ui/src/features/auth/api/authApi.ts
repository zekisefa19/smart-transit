import { axiosInstance } from '../../../api/axiosInstance';
import type { LoginRequest, RegisterRequest, AuthResponse } from '../../../types/auth';

export const loginApi = async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>('/auth/login', data);
    return response.data;
};

export const registerApi = async (data: RegisterRequest): Promise<void> => {
    await axiosInstance.post('/auth/register', data);
};