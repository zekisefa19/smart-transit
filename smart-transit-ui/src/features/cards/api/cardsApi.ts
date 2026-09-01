import { axiosInstance } from '../../../api/axiosInstance';
import type { CardDto, CardTransactionDto, PagedResult } from '../../../types/cards';

export const getUserCardsApi = async (): Promise<CardDto[]> => {
    const response = await axiosInstance.get<CardDto[]>('/cards');
    return response.data;
};

export const createCardApi = async (cardNumber: string): Promise<string> => {
    const response = await axiosInstance.post<string>('/cards', { cardNumber });
    return response.data;
};

export const blockCardApi = async (cardId: string): Promise<void> => {
    await axiosInstance.put(`/cards/${cardId}/block`);
};

export const unblockCardApi = async (cardId: string): Promise<void> => {
    await axiosInstance.put(`/cards/${cardId}/unblock`);
};

export const topUpBalanceApi = async (cardId: string, amount: number): Promise<void> => {
    const idempotencyKey = crypto.randomUUID();
    await axiosInstance.post(
        `/cards/${cardId}/topup`,
        { amount },
        { headers: { 'Idempotency-Key': idempotencyKey } }
    );
};

export const getCardTransactionsApi = async (
    cardId: string,
    pageNumber = 1,
    pageSize = 5
): Promise<PagedResult<CardTransactionDto>> => {
    const response = await axiosInstance.get<PagedResult<CardTransactionDto>>(`/cards/${cardId}/transactions`, {
        params: { pageNumber, pageSize },
    });
    return response.data;
};