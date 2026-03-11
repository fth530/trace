import { useState, useEffect } from 'react';
import { isNetworkOnline, onNetworkChange } from '../utils/network';

export function useNetwork() {
    const [isOnline, setIsOnline] = useState(isNetworkOnline());

    useEffect(() => {
        const unsubscribe = onNetworkChange((status) => {
            setIsOnline(status);
        });
        return unsubscribe;
    }, []);

    return isOnline;
}
