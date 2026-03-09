// Category Definitions

import type { ComponentProps } from 'react';
import type { Ionicons } from '@expo/vector-icons';

type IoniconsName = ComponentProps<typeof Ionicons>['name'];

export type Category = 'Yol' | 'Yemek' | 'Market' | 'Diğer';

export const CATEGORIES: Category[] = ['Yol', 'Yemek', 'Market', 'Diğer'];

export const categoryConfig: Record<
  Category,
  { label: string; icon: IoniconsName; color: string }
> = {
  Yol: {
    label: 'Ulaşım',
    icon: 'car-outline',
    color: '#007AFF',
  },
  Yemek: {
    label: 'Yemek',
    icon: 'restaurant-outline',
    color: '#FF9500',
  },
  Market: {
    label: 'Market',
    icon: 'cart-outline',
    color: '#AF52DE',
  },
  Diğer: {
    label: 'Diğer',
    icon: 'ellipsis-horizontal-outline',
    color: '#8E8E93',
  },
};
