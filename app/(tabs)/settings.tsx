import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { useAuth } from '@/context/auth-context';
import { SyncButton } from '@/components/sync-button';
import { DESIGN_TOKENS } from '@/styles/design-tokens';

export default function SettingsScreen() {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    Alert.alert(
      '确认退出',
      '确定要退出登录吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '退出',
          style: 'destructive',
          onPress: async () => {
            await signOut();
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>设置</Text>
      </View>

      {/* 用户信息 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>账号信息</Text>
        <View style={styles.card}>
          <View style={styles.infoRow}>
            <Text style={styles.label}>邮箱</Text>
            <Text style={styles.value}>{user?.email || '未登录'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>用户ID</Text>
            <Text style={styles.value} numberOfLines={1}>
              {user?.id?.substring(0, 8) || '-'}
            </Text>
          </View>
        </View>
      </View>

      {/* 数据同步 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>数据同步</Text>
        <View style={styles.card}>
          <Text style={styles.syncDescription}>
            同步本地数据到云端，实现多设备数据共享
          </Text>
          <SyncButton />
        </View>
      </View>

      {/* 退出登录 */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutText}>退出登录</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>liu-PTR v1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DESIGN_TOKENS.colors.background,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: DESIGN_TOKENS.colors.text,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: DESIGN_TOKENS.colors.textSecondary,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: DESIGN_TOKENS.colors.surface,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: DESIGN_TOKENS.colors.border,
  },
  label: {
    fontSize: 15,
    color: DESIGN_TOKENS.colors.textSecondary,
  },
  value: {
    fontSize: 15,
    color: DESIGN_TOKENS.colors.text,
    fontWeight: '500',
    maxWidth: '60%',
  },
  syncDescription: {
    fontSize: 14,
    color: DESIGN_TOKENS.colors.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  signOutButton: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  signOutText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  footerText: {
    fontSize: 12,
    color: DESIGN_TOKENS.colors.textSecondary,
  },
});
