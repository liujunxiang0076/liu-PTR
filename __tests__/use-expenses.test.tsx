import { renderHook, act } from '@testing-library/react-native';
import { useExpenses } from '@/hooks/use-expenses';
import { type ExpenseCategory } from '@/types/expense';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
}));

function makeItem(overrides: Partial<{
  amount: number; category: ExpenseCategory; notes: string; tripId: string | null;
}> = {}) {
  return {
    amount: 100, category: '交通' as ExpenseCategory,
    notes: '测试', tripId: null, ...overrides,
  };
}

describe('useExpenses', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('初始状态 loaded 为 false，加载后为 true', async () => {
    const { result } = renderHook(() => useExpenses());
    expect(result.current.loaded).toBe(false);
    await act(async () => {});
    expect(result.current.loaded).toBe(true);
  });

  it('getByDate 空日期返回空数组', async () => {
    const { result } = renderHook(() => useExpenses());
    await act(async () => {});
    expect(result.current.getByDate('2026-01-01')).toEqual([]);
  });

  it('add 添加费用并可查询', async () => {
    const { result } = renderHook(() => useExpenses());
    await act(async () => {});
    act(() => {
      result.current.add('2026-01-15', makeItem());
    });
    const list = result.current.getByDate('2026-01-15');
    expect(list).toHaveLength(1);
    expect(list[0].amount).toBe(100);
    expect(list[0].dateKey).toBe('2026-01-15');
    expect(list[0].id).toBeTruthy();
  });

  it('update 修改费用', async () => {
    const { result } = renderHook(() => useExpenses());
    await act(async () => {});
    act(() => {
      result.current.add('2026-01-15', makeItem());
    });
    const id = result.current.getByDate('2026-01-15')[0].id;
    act(() => {
      result.current.update('2026-01-15', id, { amount: 200 });
    });
    expect(result.current.getByDate('2026-01-15')[0].amount).toBe(200);
  });

  it('remove 删除费用', async () => {
    const { result } = renderHook(() => useExpenses());
    await act(async () => {});
    act(() => {
      result.current.add('2026-01-15', makeItem());
    });
    expect(result.current.getByDate('2026-01-15')).toHaveLength(1);
    const id = result.current.getByDate('2026-01-15')[0].id;
    act(() => {
      result.current.remove('2026-01-15', id);
    });
    expect(result.current.getByDate('2026-01-15')).toHaveLength(0);
  });

  it('hasRecords 判断某天是否有记录', async () => {
    const { result } = renderHook(() => useExpenses());
    await act(async () => {});
    expect(result.current.hasRecords('2026-01-15')).toBe(false);
    act(() => {
      result.current.add('2026-01-15', makeItem());
    });
    expect(result.current.hasRecords('2026-01-15')).toBe(true);
  });

  it('getDailyTotal 计算每日总额', async () => {
    const { result } = renderHook(() => useExpenses());
    await act(async () => {});
    act(() => {
      result.current.add('2026-01-15', makeItem({ amount: 100 }));
      result.current.add('2026-01-15', makeItem({ amount: 50 }));
    });
    const total = result.current.getDailyTotal('2026-01-15');
    expect(total).toBe(150);
  });

  it('getByTrip 按行程筛选', async () => {
    const { result } = renderHook(() => useExpenses());
    await act(async () => {});
    act(() => {
      result.current.add('2026-01-15', makeItem({ tripId: 'trip-1' }));
      result.current.add('2026-01-16', makeItem({ tripId: 'trip-2' }));
      result.current.add('2026-01-17', makeItem({ tripId: null }));
    });
    expect(result.current.getByTrip('trip-1')).toHaveLength(1);
    expect(result.current.getByTrip('trip-2')).toHaveLength(1);
    expect(result.current.getByTrip('trip-3')).toHaveLength(0);
  });

  it('getByDateRange 按日期范围筛选', async () => {
    const { result } = renderHook(() => useExpenses());
    await act(async () => {});
    act(() => {
      result.current.add('2026-01-10', makeItem());
      result.current.add('2026-01-15', makeItem());
      result.current.add('2026-01-20', makeItem());
    });
    const range = result.current.getByDateRange('2026-01-12', '2026-01-18');
    expect(range).toHaveLength(1);
    expect(range[0].dateKey).toBe('2026-01-15');
  });

  it('getMonthlyTotal 按月汇总', async () => {
    const { result } = renderHook(() => useExpenses());
    await act(async () => {});
    act(() => {
      result.current.add('2026-01-15', makeItem({ amount: 100 }));
      result.current.add('2026-01-20', makeItem({ amount: 50 }));
      result.current.add('2026-02-10', makeItem({ amount: 200 }));
    });
    const jan = result.current.getMonthlyTotal(2026, 0);
    expect(jan.total).toBe(150);
    expect(jan.count).toBe(2);
  });

  it('search 按备注搜索', async () => {
    const { result } = renderHook(() => useExpenses());
    await act(async () => {});
    act(() => {
      result.current.add('2026-01-15', makeItem({ notes: '出租车费' }));
      result.current.add('2026-01-16', makeItem({ notes: '酒店住宿' }));
      result.current.add('2026-01-17', makeItem({ notes: '出租车报销' }));
    });
    const results = result.current.search('出租车', null);
    expect(results).toHaveLength(2);
  });

  it('search 按分类筛选', async () => {
    const { result } = renderHook(() => useExpenses());
    await act(async () => {});
    act(() => {
      result.current.add('2026-01-15', makeItem({ category: '交通' }));
      result.current.add('2026-01-16', makeItem({ category: '餐饮' }));
    });
    const results = result.current.search('', '交通');
    expect(results).toHaveLength(1);
    expect(results[0].item.category).toBe('交通');
  });

  it('importAll 覆盖全部数据', async () => {
    const { result } = renderHook(() => useExpenses());
    await act(async () => {});
    act(() => {
      result.current.add('2026-01-15', makeItem());
    });
    const importData = {
      '2026-03-01': [{
        id: 'imp-1', amount: 999,
        category: '餐饮' as ExpenseCategory, notes: '导入', tripId: null, createdAt: Date.now(), dateKey: '2026-03-01',
      }],
    };
    act(() => {
      result.current.importAll(importData);
    });
    expect(result.current.getByDate('2026-01-15')).toHaveLength(0);
    expect(result.current.getByDate('2026-03-01')).toHaveLength(1);
    expect(result.current.getByDate('2026-03-01')[0].amount).toBe(999);
  });

  it('removeByTrip 删除指定行程的所有费用', async () => {
    const { result } = renderHook(() => useExpenses());
    await act(async () => {});
    act(() => {
      result.current.add('2026-01-15', makeItem({ tripId: 'trip-1' }));
      result.current.add('2026-01-16', makeItem({ tripId: 'trip-1' }));
      result.current.add('2026-01-17', makeItem({ tripId: 'trip-2' }));
    });
    act(() => {
      result.current.removeByTrip('trip-1');
    });
    expect(result.current.getByTrip('trip-1')).toHaveLength(0);
    expect(result.current.getByTrip('trip-2')).toHaveLength(1);
  });
});
