import { act } from '@testing-library/react-native';
import { useStore } from '../lib/store';

// Mock DB queries so they don't break offline/store tests
jest.mock('../lib/db', () => ({
    initDatabase: jest.fn().mockResolvedValue({}),
    getDatabase: jest.fn().mockReturnValue({}),
}));

jest.mock('../lib/db/queries', () => ({
    getAllSettings: jest.fn().mockResolvedValue({}),
    getExpenseDates: jest.fn().mockResolvedValue([]),
    addExpense: jest.fn().mockResolvedValue(1),
    deleteExpense: jest.fn().mockResolvedValue(true),
}));

jest.mock('../lib/utils/notifications', () => ({
    updateNotificationSchedule: jest.fn(),
}));

describe('S-Class Zustand Store: Optimistic UI Engine', () => {

    beforeEach(() => {
        // Reset state before every test
        useStore.setState({
            todayExpenses: [],
            todayTotal: 0,
            monthTotal: 0,
        });
    });

    it('adds an expense optimistically simulating 0ms update', async () => {
        const expense = {
            amount: 15.25,
            category: 'Yemek' as const,
            description: 'Luch',
        };

        await act(async () => {
            await useStore.getState().addExpense(expense as any);
        });

        const state = useStore.getState();
        expect(state.todayExpenses.length).toBe(1);
        expect(state.todayTotal).toBe(15.25);
        expect(state.monthTotal).toBe(15.25);
    });

    it('deletes an expense and mathematically updates state without querying', async () => {
        // Manually setting initial dummy state
        useStore.setState({
            todayExpenses: [
                { id: 1, amount: 20, category: 'Yemek', description: 'TEST', date: '2024-01-01', created_at: Date.now() },
                { id: 2, amount: 15, category: 'Market', description: 'TEST2', date: '2024-01-01', created_at: Date.now() }
            ],
            todayTotal: 35,
            monthTotal: 100,
        });

        await act(async () => {
            await useStore.getState().deleteExpense(1);
        });

        const state = useStore.getState();
        expect(state.todayExpenses.length).toBe(1);
        expect(state.todayTotal).toBe(15);
        expect(state.monthTotal).toBe(80);
    });
});
