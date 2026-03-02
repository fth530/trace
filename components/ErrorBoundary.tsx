// Error Boundary Component
// Catches React errors and prevents app crash

import React, { Component, ReactNode } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { logger } from '@/lib/utils/logger';
import { neonColors } from '@/lib/constants/design-tokens';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });

    // Report to Sentry or other error tracking service
    // Sentry.captureException(error, { contexts: { react: { componentStack: errorInfo.componentStack } } });
  }

  handleReset = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View className="flex-1 bg-zinc-950 items-center justify-center px-6">
          <View className="items-center mb-8">
            <View
              className="w-24 h-24 rounded-full bg-red-500/20 items-center justify-center mb-6"
              style={{
                shadowColor: neonColors.rose,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.5,
                shadowRadius: 20,
              }}
            >
              <Ionicons name="warning" size={48} color={neonColors.rose} />
            </View>

            <Text className="text-white text-2xl font-bold mb-2 text-center">
              Bir Şeyler Ters Gitti
            </Text>
            <Text className="text-slate-400 text-center mb-6">
              Uygulama beklenmeyen bir hatayla karşılaştı
            </Text>
          </View>

          {__DEV__ && this.state.error && (
            <ScrollView className="w-full max-h-48 mb-6 bg-slate-900/50 rounded-xl p-4">
              <Text className="text-red-400 text-xs font-mono">
                {this.state.error.toString()}
              </Text>
              {this.state.errorInfo && (
                <Text className="text-slate-500 text-xs font-mono mt-2">
                  {this.state.errorInfo.componentStack}
                </Text>
              )}
            </ScrollView>
          )}

          <Pressable
            onPress={this.handleReset}
            className="bg-slate-800 px-8 py-4 rounded-xl active:bg-slate-700"
          >
            <Text className="text-white font-semibold text-base">
              Tekrar Dene
            </Text>
          </Pressable>
        </View>
      );
    }

    return this.props.children;
  }
}
