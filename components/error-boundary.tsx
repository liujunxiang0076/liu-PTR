import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';

type Props = {
  children: React.ReactNode;
};

type State = {
  hasError: boolean;
  error: Error | null;
};

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <SafeAreaView style={styles.container}>
          <View style={styles.content}>
            <ThemedText style={styles.emoji}>⚠</ThemedText>
            <ThemedText type="title" style={styles.title}>出了点问题</ThemedText>
            <ThemedText style={styles.message}>
              应用遇到了意外错误，请尝试重新加载
            </ThemedText>
            {this.state.error && (
              <ThemedText style={styles.errorDetail}>
                {this.state.error.message}
              </ThemedText>
            )}
            <TouchableOpacity style={styles.btn} onPress={this.handleReset}>
              <ThemedText style={styles.btnText}>重新加载</ThemedText>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  content: {
    alignItems: 'center',
    gap: 12,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
  },
  message: {
    fontSize: 14,
    opacity: 0.6,
    textAlign: 'center',
  },
  errorDetail: {
    fontSize: 12,
    opacity: 0.4,
    textAlign: 'center',
    marginTop: 8,
  },
  btn: {
    marginTop: 16,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#4A90D9',
  },
  btnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
