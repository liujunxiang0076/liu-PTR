import { renderHook, act } from '@testing-library/react-native';
import { useTrips } from '@/hooks/use-trips';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
}));

function makeTrip(overrides: Partial<{
  name: string; destination: string; startDate: string; endDate: string; budget: number;
}> = {}) {
  return {
    name: '测试差旅', destination: '北京', startDate: '2026-01-10', endDate: '2026-01-15',
    budget: 5000, ...overrides,
  };
}

describe('useTrips', () => {
  it('初始 loaded 为 false，加载后为 true', async () => {
    const { result } = renderHook(() => useTrips());
    expect(result.current.loaded).toBe(false);
    await act(async () => {});
    expect(result.current.loaded).toBe(true);
  });

  it('add 添加行程并返回 id', async () => {
    const { result } = renderHook(() => useTrips());
    await act(async () => {});
    let tripId = '';
    act(() => {
      tripId = result.current.add(makeTrip());
    });
    expect(tripId).toBeTruthy();
    expect(result.current.getById(tripId)).not.toBeNull();
    expect(result.current.getById(tripId)!.name).toBe('测试差旅');
  });

  it('getAll 返回所有行程', async () => {
    const { result } = renderHook(() => useTrips());
    await act(async () => {});
    act(() => {
      result.current.add(makeTrip({ name: '第一个' }));
      result.current.add(makeTrip({ name: '第二个' }));
    });
    const all = result.current.getAll();
    expect(all).toHaveLength(2);
    const names = all.map((t) => t.name).sort();
    expect(names).toEqual(['第一个', '第二个']);
  });

  it('update 修改行程', async () => {
    const { result } = renderHook(() => useTrips());
    await act(async () => {});
    let tripId = '';
    act(() => {
      tripId = result.current.add(makeTrip());
    });
    act(() => {
      result.current.update(tripId, { destination: '上海' });
    });
    expect(result.current.getById(tripId)!.destination).toBe('上海');
  });

  it('remove 删除行程', async () => {
    const { result } = renderHook(() => useTrips());
    await act(async () => {});
    let tripId = '';
    act(() => {
      tripId = result.current.add(makeTrip());
    });
    act(() => {
      result.current.remove(tripId);
    });
    expect(result.current.getById(tripId)).toBeNull();
  });

  it('getActiveTrip 返回日期范围内的行程', async () => {
    const { result } = renderHook(() => useTrips());
    await act(async () => {});
    act(() => {
      result.current.add(makeTrip({ startDate: '2026-01-10', endDate: '2026-01-15' }));
      result.current.add(makeTrip({ startDate: '2026-02-01', endDate: '2026-02-05' }));
    });
    const active = result.current.getActiveTrip('2026-01-12');
    expect(active).not.toBeNull();
    expect(active!.startDate).toBe('2026-01-10');
  });

  it('getActiveTrip 无匹配返回 null', async () => {
    const { result } = renderHook(() => useTrips());
    await act(async () => {});
    act(() => {
      result.current.add(makeTrip({ startDate: '2026-01-10', endDate: '2026-01-15' }));
    });
    expect(result.current.getActiveTrip('2026-02-01')).toBeNull();
  });

  it('getTripsInMonth 返回当月行程', async () => {
    const { result } = renderHook(() => useTrips());
    await act(async () => {});
    act(() => {
      result.current.add(makeTrip({ startDate: '2026-01-28', endDate: '2026-02-03' }));
      result.current.add(makeTrip({ startDate: '2026-02-15', endDate: '2026-02-20' }));
    });
    const janTrips = result.current.getTripsInMonth(2026, 0);
    expect(janTrips).toHaveLength(1);
    const febTrips = result.current.getTripsInMonth(2026, 1);
    expect(febTrips).toHaveLength(2);
  });

  it('importAll 覆盖数据', async () => {
    const { result } = renderHook(() => useTrips());
    await act(async () => {});
    act(() => {
      result.current.add(makeTrip());
    });
    const importData = {
      'imp-1': {
        id: 'imp-1', name: '导入行程', destination: '深圳',
        startDate: '2026-03-01', endDate: '2026-03-05', budget: 3000, createdAt: Date.now(),
      },
    };
    act(() => {
      result.current.importAll(importData);
    });
    expect(result.current.getAll()).toHaveLength(1);
    expect(result.current.getById('imp-1')!.name).toBe('导入行程');
  });
});
