// Category Definitions
// Based on ROADMAP §4 Component Inventory

import type { ComponentProps } from 'react';
import type { Ionicons } from '@expo/vector-icons';

type IoniconsName = ComponentProps<typeof Ionicons>['name'];

export type Category = 'Yol' | 'Yemek' | 'Market' | 'Diğer';

export const CATEGORIES: Category[] = ['Yol', 'Yemek', 'Market', 'Diğer'];

export const categoryConfig: Record<
  Category,
  { label: string; icon: IoniconsName }
> = {
  Yol: {
    label: 'Ulaşım',
    icon: 'car-outline',
  },
  Yemek: {
    label: 'Yemek',
    icon: 'restaurant-outline',
  },
  Market: {
    label: 'Market',
    icon: 'cart-outline',
  },
  Diğer: {
    label: 'Diğer',
    icon: 'ellipsis-horizontal-outline',
  },
};
