import { renderHook, act } from '@testing-library/react-native';
import { useBudget } from '@/hooks/use-budget';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
}));

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          maybeSingle: jest.fn().mockReturnValue(
            Promise.resolve({ data: null })
          ),
        }),
      }),
      upsert: jest.fn().mockReturnValue(Promise.resolve({ error: null })),
    }),
  },
  TABLES: { TRIPS: 'trips', EXPENSES: 'expenses', BUDGETS: 'budgets' },
}));

describe('useBudget', () => {
  it('返回默认预算配置', async () => {
    const { result } = renderHook(() => useBudget());
    await act(async () => {});
    expect(result.current.budget).toEqual({ workday: 200, weekend: 300, holiday: 500 });
    expect(result.current.loaded).toBe(true);
  });

  it('update 更新预算字段', async () => {
    const { result } = renderHook(() => useBudget());
    await act(async () => {});
    act(() => {
      result.current.update({ workday: 500 });
    });
    expect(result.current.budget.workday).toBe(500);
    expect(result.current.budget.weekend).toBe(300);
  });

  it('getDayBudget 返回工作日预算（普通工作日）', async () => {
    const { result } = renderHook(() => useBudget());
    await act(async () => {});
    // 2026-03-02 是周一（普通工作日，非假期）
    const dayBudget = result.current.getDayBudget(2026, 2, 2);
    expect(dayBudget.type).toBe('workday');
    expect(dayBudget.amount).toBe(200);
  });

  it('getDayBudget 返回周末预算', async () => {
    const { result } = renderHook(() => useBudget());
    await act(async () => {});
    // 2026-03-07 是周六（非假期）
    const dayBudget = result.current.getDayBudget(2026, 2, 7);
    expect(dayBudget.type).toBe('weekend');
    expect(dayBudget.amount).toBe(300);
  });

  it('getDayBudget 返回法定假日预算', async () => {
    const { result } = renderHook(() => useBudget());
    await act(async () => {});
    // 2026-01-01 是元旦（法定假日）
    const dayBudget = result.current.getDayBudget(2026, 0, 1);
    expect(dayBudget.type).toBe('holiday');
    expect(dayBudget.amount).toBe(500);
  });

  it('update 后 getDayBudget 反映新预算', async () => {
    const { result } = renderHook(() => useBudget());
    await act(async () => {});
    act(() => {
      result.current.update({ holiday: 1000 });
    });
    const dayBudget = result.current.getDayBudget(2026, 0, 1);
    expect(dayBudget.amount).toBe(1000);
  });
});
