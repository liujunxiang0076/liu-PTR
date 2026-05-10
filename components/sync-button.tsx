import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSupabaseSync } from '../hooks/use-supabase-sync';
import { useAuth } from '../context/auth-context';
import { DESIGN_TOKENS } from '../styles/design-tokens';

export function SyncButton() {
  const { user } = useAuth();
  const { isSyncing, lastSyncTime, error, sync } = useSupabaseSync();
  const [syncStatus, setSyncStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSync = async () => {
    if (!user) {
      Alert.alert('提示', '请先登录后再同步');
      return;
    }

    setSyncStatus('idle');
    const success = await sync();
    
    if (success) {
      setSyncStatus('success');
      Alert.alert('成功', '数据同步完成！');
    } else {
      setSyncStatus('error');
      Alert.alert('错误', '同步失败：' + (error || '未知错误'));
    }

    // 3秒后重置状态
    setTimeout(() => setSyncStatus('idle'), 3000);
  };

  const formatTime = (date: Date | null) => {
    if (!date) return '从未同步';
    return `上次同步：${date.toLocaleString()}`;
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.button,
          isSyncing && styles.buttonSyncing,
          syncStatus === 'success' && styles.buttonSuccess,
          syncStatus === 'error' && styles.buttonError,
        ]}
        onPress={handleSync}
        disabled={isSyncing}
      >
        {isSyncing ? (
          <View style={styles.content}>
            <ActivityIndicator color="#fff" size="small" />
            <Text style={styles.buttonText}>同步中...</Text>
          </View>
        ) : (
          <View style={styles.content}>
            <Text style={styles.icon}>🔄</Text>
            <Text style={styles.buttonText}>同步数据</Text>
          </View>
        )}
      </TouchableOpacity>

      <Text style={styles.timeText}>
        {formatTime(lastSyncTime)}
      </Text>

      {error && (
        <Text style={styles.errorText}>错误：{error}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 16,
  },
  button: {
    backgroundColor: DESIGN_TOKENS.colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    minWidth: 200,
    alignItems: 'center',
  },
  buttonSyncing: {
    opacity: 0.7,
  },
  buttonSuccess: {
    backgroundColor: '#10B981',
  },
  buttonError: {
    backgroundColor: '#EF4444',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  icon: {
    fontSize: 18,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  timeText: {
    marginTop: 8,
    fontSize: 12,
    color: DESIGN_TOKENS.colors.textSecondary,
  },
  errorText: {
    marginTop: 4,
    fontSize: 12,
    color: '#EF4444',
  },
});
