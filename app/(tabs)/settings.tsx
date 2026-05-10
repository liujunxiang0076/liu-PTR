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
import { Spacing, BorderRadius, FontSize, FontWeight } from '@/constants/design-tokens';
import { Colors } from '@/constants/theme';

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
    backgroundColor: '#F8F9FA',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  title: {
    fontSize: FontSize.display,
    fontWeight: FontWeight.bold,
    color: '#1F2937',
  },
  section: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.xxl,
  },
  sectionTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: '#6B7280',
    marginBottom: Spacing.lg,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
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
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  label: {
    fontSize: FontSize.lg,
    color: '#6B7280',
  },
  value: {
    fontSize: FontSize.lg,
    color: '#1F2937',
    fontWeight: FontWeight.medium,
    maxWidth: '60%',
  },
  syncDescription: {
    fontSize: FontSize.md,
    color: '#6B7280',
    marginBottom: Spacing.lg,
    lineHeight: 20,
  },
  signOutButton: {
    backgroundColor: '#FEF2F2',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  signOutText: {
    color: '#EF4444',
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  },
  footerText: {
    fontSize: FontSize.sm,
    color: '#9CA3AF',
  },
});
