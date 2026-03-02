// Animated Expense List
// Based on ROADMAP §4 Component Inventory & Antigravity Final Protocol

import React from 'react';
import { RefreshControlProps } from 'react-native';
import { EmptyState } from '@/components/ui/EmptyState';
import { ExpenseItem } from './ExpenseItem';
import type { Expense } from '@/lib/store/types';
import Animated, { LinearTransition } from 'react-native-reanimated';
import { i18n } from '@/lib/translations/i18n';

interface ExpenseListProps {
  expenses: Expense[];
  onDelete?: (id: number) => void;
  emptyMessage?: string;
  ListHeaderComponent?: React.ReactElement;
  refreshControl?: React.ReactElement<RefreshControlProps>;
}

export const ExpenseList: React.FC<ExpenseListProps> = ({
  expenses,
  onDelete,
  emptyMessage = i18n.t('empty.no_expenses'),
  ListHeaderComponent,
  refreshControl,
}) => {
  return (
    <Animated.FlatList
      data={expenses}
      keyExtractor={(item) => item.id.toString()}
      itemLayoutAnimation={LinearTransition.springify().damping(14)}
      ListHeaderComponent={ListHeaderComponent}
      refreshControl={refreshControl}
      ListEmptyComponent={
        <EmptyState
          message={i18n.t('empty.title')}
          subMessage={emptyMessage}
          icon="planet-outline"
        />
      }
      renderItem={({ item, index }) => (
        <ExpenseItem
          expense={item}
          onDelete={onDelete}
          showDate={false}
          index={index}
        />
      )}
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingBottom: 120, // Leave space for FAB
      }}
      showsVerticalScrollIndicator={false}
    />
  );
};
