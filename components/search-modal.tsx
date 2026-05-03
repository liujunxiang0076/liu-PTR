import { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useAppContext } from '@/components/app-context';
import { useAppColors } from '@/hooks/use-app-colors';
import { formatAmount, getCategoryColor } from '@/constants/currency';
import {
  type ExpenseCategory,
  CATEGORIES,
} from '@/types/expense';

type Props = {
  visible: boolean;
  onClose: () => void;
};

export function SearchModal({ visible, onClose }: Props) {
  const { searchExpenses } = useAppContext();

  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<ExpenseCategory | null>(null);

  const { tint, text: textColor, muted: mutedColor, border: borderColor, inputBg, panelBg } = useAppColors();

  const results = useMemo(() => {
    if (!query.trim() && !categoryFilter) return [];
    return searchExpenses(query, categoryFilter);
  }, [query, categoryFilter, searchExpenses]);

  const handleClose = useCallback(() => {
    setQuery('');
    setCategoryFilter(null);
    onClose();
  }, [onClose]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={[styles.container, { backgroundColor: panelBg }]}>
        {/* 搜索栏 */}
        <View style={[styles.searchBar, { borderBottomColor: borderColor }]}>
          <TextInput
            style={[styles.searchInput, { backgroundColor: inputBg, color: textColor }]}
            placeholder="搜索备注..."
            placeholderTextColor={mutedColor}
            value={query}
            onChangeText={setQuery}
            autoFocus
            returnKeyType="search"
          />
          <TouchableOpacity onPress={handleClose} hitSlop={8}>
            <ThemedText style={[styles.cancelBtn, { color: tint }]}>取消</ThemedText>
          </TouchableOpacity>
        </View>

        {/* 分类筛选 */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
          <TouchableOpacity
            style={[
              styles.filterPill,
              categoryFilter === null && [styles.filterPillActive, { backgroundColor: tint }],
            ]}
            onPress={() => setCategoryFilter(null)}>
            <ThemedText style={[
              styles.filterPillText,
              categoryFilter === null && styles.filterPillTextActive,
            ]}>全部</ThemedText>
          </TouchableOpacity>
          {CATEGORIES.map((c) => (
            <TouchableOpacity
              key={c}
              style={[
                styles.filterPill,
                categoryFilter === c && [styles.filterPillActive, { backgroundColor: getCategoryColor(c) }],
              ]}
              onPress={() => setCategoryFilter(c)}>
              <ThemedText style={[
                styles.filterPillText,
                categoryFilter === c && styles.filterPillTextActive,
              ]}>{c}</ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* 结果区域 */}
        <View style={styles.resultArea}>
          {!query.trim() && !categoryFilter ? (
            <ThemedText style={[styles.hintText, { color: mutedColor }]}>
              输入关键词或选择分类开始搜索
            </ThemedText>
          ) : results.length === 0 ? (
            <ThemedText style={[styles.hintText, { color: mutedColor }]}>
              未找到匹配的费用记录
            </ThemedText>
          ) : (
            <FlatList
              data={results}
              keyExtractor={(r) => r.item.id}
              renderItem={({ item: r }) => (
                <TouchableOpacity style={[styles.resultItem, { borderBottomColor: borderColor }]}>
                  <View style={styles.resultLeft}>
                    <View style={[styles.categoryDot, { backgroundColor: getCategoryColor(r.item.category) }]} />
                    <View style={styles.resultInfo}>
                      <ThemedText style={styles.resultCategory}>{r.item.category}</ThemedText>
                      {r.item.notes ? (
                        <ThemedText style={[styles.resultNotes, { color: mutedColor }]} numberOfLines={1}>
                          {r.item.notes}
                        </ThemedText>
                      ) : null}
                    </View>
                  </View>
                  <View style={styles.resultRight}>
                    <ThemedText style={[styles.resultAmount, { color: textColor }]}>
                      {formatAmount(r.item.amount, r.item.currency)}
                    </ThemedText>
                    <ThemedText style={[styles.resultDate, { color: mutedColor }]}>
                      {r.dateKey}
                    </ThemedText>
                  </View>
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 12,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 16,
  },
  cancelBtn: {
    fontSize: 16,
    fontWeight: '500',
  },
  filterRow: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginRight: 8,
  },
  filterPillActive: {},
  filterPillText: {
    fontSize: 13,
    fontWeight: '500',
  },
  filterPillTextActive: {
    color: '#fff',
  },
  resultArea: {
    flex: 1,
    paddingHorizontal: 16,
  },
  hintText: {
    textAlign: 'center',
    marginTop: 60,
    fontSize: 14,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  resultLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  resultInfo: {
    flex: 1,
  },
  resultCategory: {
    fontSize: 15,
    fontWeight: '500',
  },
  resultNotes: {
    fontSize: 12,
    marginTop: 2,
  },
  resultRight: {
    alignItems: 'flex-end',
    gap: 2,
  },
  resultAmount: {
    fontSize: 15,
    fontWeight: '600',
  },
  resultDate: {
    fontSize: 11,
  },
});
