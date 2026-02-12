// Category Definitions
// Based on ROADMAP §2 Database Design

export type Category = 'Yol' | 'Yemek' | 'Market' | 'Diğer';

export const CATEGORIES: Category[] = ['Yol', 'Yemek', 'Market', 'Diğer'];

export const categoryConfig = {
  Yol: {
    label: 'Yol',
    icon: 'car' as const,
  },
  Yemek: {
    label: 'Yemek',
    icon: 'restaurant' as const,
  },
  Market: {
    label: 'Market',
    icon: 'cart' as const,
  },
  Diğer: {
    label: 'Diğer',
    icon: 'ellipsis-horizontal' as const,
  },
} as const;
