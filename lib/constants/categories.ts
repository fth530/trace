// Category Definitions
// Based on ROADMAP §4 Component Inventory & Antigravity Colors

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
    color: '#38bdf8', // Neon Sky Blue
  },
  Yemek: {
    label: 'Yemek',
    icon: 'restaurant-outline',
    color: '#fbbf24', // Neon Amber
  },
  Market: {
    label: 'Market',
    icon: 'cart-outline',
    color: '#e879f9', // Neon Fuchsia
  },
  Diğer: {
    label: 'Diğer',
    icon: 'ellipsis-horizontal-outline',
    color: '#94a3b8', // Slate
  },
};
