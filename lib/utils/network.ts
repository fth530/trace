// Network Connectivity Utilities
// TODO: Install @react-native-community/netinfo
// npm install @react-native-community/netinfo

// import NetInfo from '@react-native-community/netinfo';
import { logger } from './logger';

let isOnline = true;
let listeners: Array<(online: boolean) => void> = [];

// Initialize network monitoring
export const initNetworkMonitoring = () => {
  // TODO: Uncomment when netinfo is installed
  // NetInfo.addEventListener((state) => {
  //   const wasOnline = isOnline;
  //   isOnline = state.isConnected ?? false;
  //   if (wasOnline !== isOnline) {
  //     logger.log(`📡 Network status changed: ${isOnline ? 'ONLINE' : 'OFFLINE'}`);
  //     listeners.forEach((listener) => listener(isOnline));
  //   }
  // });
  logger.log('Network monitoring not yet implemented');
};

// Get current network status
export const getNetworkStatus = async (): Promise<boolean> => {
  // TODO: Implement with NetInfo
  // const state = await NetInfo.fetch();
  // return state.isConnected ?? false;
  return true; // Assume online for now
};

// Subscribe to network changes
export const onNetworkChange = (
  callback: (online: boolean) => void,
): (() => void) => {
  listeners.push(callback);

  // Return unsubscribe function
  return () => {
    listeners = listeners.filter((l) => l !== callback);
  };
};

// Check if online
export const isNetworkOnline = (): boolean => {
  return isOnline;
};

// Wait for network to be online
export const waitForNetwork = (timeout = 30000): Promise<boolean> => {
  return new Promise((resolve) => {
    if (isOnline) {
      resolve(true);
      return;
    }

    const timeoutId = setTimeout(() => {
      unsubscribe();
      resolve(false);
    }, timeout);

    const unsubscribe = onNetworkChange((online) => {
      if (online) {
        clearTimeout(timeoutId);
        unsubscribe();
        resolve(true);
      }
    });
  });
};
