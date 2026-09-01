
import { axiosInstance } from '../api/axiosInstance';

export interface UserProfile {
    id: string;
    fullName: string;
    email: string;
    phoneNumber?: string | null;
    identityNumber?: string | null;
    birthDate?: string | null;
    address?: string | null;
    role: string;
    isEmailConfirmed: boolean;
}

export interface UpdateUserProfilePayload {
    fullName: string;
    phoneNumber?: string | null;
    identityNumber?: string | null;
    birthDate?: string | null;
    address?: string | null;
}

export const getUserProfile = async (): Promise<UserProfile> => {
    const response = await axiosInstance.get<UserProfile>('/Users/profile');
    return response.data;
};

export const updateUserProfile = async (
    payload: UpdateUserProfilePayload
): Promise<UserProfile> => {
    const response = await axiosInstance.put<UserProfile>('/Users/profile', payload);
    return response.data;
};