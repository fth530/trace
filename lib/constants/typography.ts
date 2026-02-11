// Design Tokens: Typography Scale
// Based on ROADMAP §5 Design System

export const typography = {
  hero: {
    fontSize: 56,
    fontWeight: '700' as const,
    lineHeight: 64,
  },
  title: {
    fontSize: 28,
    fontWeight: '600' as const,
    lineHeight: 32,
  },
  headline: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  caption: {
    fontSize: 13,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
  footnote: {
    fontSize: 11,
    fontWeight: '400' as const,
    lineHeight: 13,
  },
} as const;

export type TypographyVariant = keyof typeof typography;
