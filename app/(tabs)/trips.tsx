import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { TripFormModal } from '@/components/trip-form-modal';
import { useAppContext } from '@/components/app-context';
import { useThemeColor } from '@/hooks/use-theme-color';
import { sumExpensesInCNY } from '@/constants/currency';

export default function TripsScreen() {
  const { trips, getByTrip, removeTrip, rates } = useAppContext();
  const [formVisible, setFormVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const router = useRouter();

  const tint = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({ light: '#E5E5E5', dark: '#2A2A2A' }, 'icon');
  const mutedColor = useThemeColor({ light: '#9BA1A6', dark: '#687076' }, 'icon');
  const panelBg = useThemeColor({ light: '#FFFFFF', dark: '#151718' }, 'background');
  const dangerColor = useThemeColor({ light: '#E85D5D', dark: '#FF7B7B' }, 'tint');

  const handleCreate = useCallback(() => {
    setEditingId(null);
    setFormVisible(true);
  }, []);

  const handleEdit = useCallback((id: string) => {
    setEditingId(id);
    setFormVisible(true);
  }, []);

  const handleCloseForm = useCallback(() => {
    setFormVisible(false);
    setEditingId(null);
  }, []);

  const handleViewDetail = useCallback(
    (id: string) => {
      router.push({ pathname: '/trip-detail', params: { tripId: id } });
    },
    [router]
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* 标题栏 */}
      <View style={styles.header}>
        <ThemedText type="title" style={styles.headerTitle}>差旅管理</ThemedText>
        <TouchableOpacity style={[styles.createBtn, { backgroundColor: tint }]} onPress={handleCreate}>
          <ThemedText style={styles.createBtnText}>+ 新建</ThemedText>
        </TouchableOpacity>
      </View>

      {/* 行程列表 */}
      <FlatList
        data={trips}
        keyExtractor={(item) => item.id}
        contentContainerStyle={trips.length === 0 && styles.listEmpty}
        ListEmptyComponent={
          <ThemedText style={[styles.emptyText, { color: mutedColor }]}>
            暂无差旅行程，点击上方按钮创建
          </ThemedText>
        }
        renderItem={({ item }) => {
          const expenses = getByTrip(item.id);
          const spent = sumExpensesInCNY(expenses, rates);
          const rawPct = item.budget > 0 ? (spent / item.budget) * 100 : 0;
          const pct = Math.min(rawPct, 100);
          const barColor = rawPct > 100 ? '#E85D5D' : rawPct > 70 ? '#F5A623' : '#7ED321';

          return (
            <TouchableOpacity
              style={[styles.tripCard, { borderColor, backgroundColor: panelBg }]}
              onPress={() => handleViewDetail(item.id)}
              activeOpacity={0.7}>
              <View style={styles.tripHeader}>
                <View style={styles.tripTitleRow}>
                  <ThemedText type="defaultSemiBold" style={styles.tripName}>{item.name}</ThemedText>
                  <ThemedText style={[styles.tripDest, { color: mutedColor }]}>
                    {item.destination}
                  </ThemedText>
                </View>
                <View style={styles.tripActions}>
                  <TouchableOpacity onPress={() => handleEdit(item.id)} hitSlop={8}>
                    <ThemedText style={[styles.actionText, { color: tint }]}>编辑</ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => removeTrip(item.id)} hitSlop={8}>
                    <ThemedText style={[styles.actionText, { color: dangerColor }]}>删除</ThemedText>
                  </TouchableOpacity>
                </View>
              </View>
              <ThemedText style={[styles.tripDates, { color: mutedColor }]}>
                {item.startDate} ~ {item.endDate}
              </ThemedText>
              {item.budget > 0 && (
                <View style={styles.budgetRow}>
                  <View style={styles.budgetBarBg}>
                    <View style={[styles.budgetBarFill, { width: `${pct}%`, backgroundColor: barColor }]} />
                  </View>
                  <ThemedText style={[styles.budgetText, { color: mutedColor }]}>
                    ¥{spent.toFixed(0)} / ¥{item.budget.toFixed(0)} ({rawPct.toFixed(0)}%)
                  </ThemedText>
                </View>
              )}
            </TouchableOpacity>
          );
        }}
      />

      <TripFormModal
        visible={formVisible}
        editingId={editingId}
        onClose={handleCloseForm}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
  },
  createBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  createBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  listEmpty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyText: {
    fontSize: 15,
  },
  tripCard: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    gap: 8,
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  tripTitleRow: {
    flex: 1,
    gap: 2,
  },
  tripName: {
    fontSize: 17,
  },
  tripDest: {
    fontSize: 13,
  },
  tripActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '500',
  },
  tripDates: {
    fontSize: 13,
  },
  budgetRow: {
    gap: 6,
  },
  budgetBarBg: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(0,0,0,0.08)',
    overflow: 'hidden',
  },
  budgetBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  budgetText: {
    fontSize: 12,
  },
});
