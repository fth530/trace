import {
    formatDateISO,
    getPastDateISO
} from '../lib/utils/date';
import { subDays } from 'date-fns';

describe('S-Class Date Tracking Algorithm Tests', () => {

    it('calculates past dates accurately relative to today', () => {
        const today = new Date();
        const isoString = getPastDateISO(30);
        const expected = formatDateISO(subDays(today, 30));

        expect(isoString).toBe(expected);
    });
});
