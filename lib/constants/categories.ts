// Category Definitions
// Based on ROADMAP §2 Database Design

import { colors } from './colors';

export type Category = 'Yol' | 'Yemek' | 'Market' | 'Diğer';

export const CATEGORIES: Category[] = ['Yol', 'Yemek', 'Market', 'Diğer'];

export const categoryConfig = {
  Yol: {
    label: 'Yol',
    color: colors.category.Yol,
    icon: 'car' as const,
  },
  Yemek: {
    label: 'Yemek',
    color: colors.category.Yemek,
    icon: 'restaurant' as const,
  },
  Market: {
    label: 'Market',
    color: colors.category.Market,
    icon: 'cart' as const,
  },
  Diğer: {
    label: 'Diğer',
    color: colors.category.Diğer,
    icon: 'ellipsis-horizontal' as const,
  },
} as const;
