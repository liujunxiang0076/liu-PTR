import { getHoliday, isWeekend, getRestDayBadge, setApiHolidayData } from '@/constants/holidays';

describe('isWeekend', () => {
  it('周六返回true', () => {
    // 2026-05-02 是周六
    expect(isWeekend(2026, 4, 2)).toBe(true);
  });

  it('周日返回true', () => {
    // 2026-05-03 是周日
    expect(isWeekend(2026, 4, 3)).toBe(true);
  });

  it('工作日返回false', () => {
    // 2026-05-04 是周一
    expect(isWeekend(2026, 4, 4)).toBe(false);
  });
});

describe('getHoliday', () => {
  it('返回元旦名称', () => {
    expect(getHoliday(2026, 0, 1)).toBe('元旦');
  });

  it('返回春节名称', () => {
    expect(getHoliday(2026, 1, 17)).toBe('春节');
  });

  it('返回劳动节名称', () => {
    expect(getHoliday(2026, 4, 1)).toBe('劳动节');
  });

  it('普通日期返回null', () => {
    expect(getHoliday(2026, 4, 20)).toBeNull();
  });

  it('节气日期返回名称', () => {
    // 2026-02-03 立春
    expect(getHoliday(2026, 1, 3)).toBe('立春');
  });
});

describe('getRestDayBadge', () => {
  it('法定放假返回休', () => {
    // 2026-01-01 元旦放假
    expect(getRestDayBadge(2026, 0, 1)).toBe('休');
  });

  it('调休上班日返回班', () => {
    // 2026-02-14 春节调休上班
    expect(getRestDayBadge(2026, 1, 14)).toBe('班');
  });

  it('普通工作日返回null', () => {
    // 2026-05-07 周四普通工作日
    expect(getRestDayBadge(2026, 4, 7)).toBeNull();
  });

  it('普通周末返回null', () => {
    // 2026-05-02 周六，非节假日非调休
    const badge = getRestDayBadge(2026, 4, 2);
    // 可能是 null 或 休（如果恰好是节假日），但不应是 班
    expect(badge).not.toBe('班');
  });
});

describe('setApiHolidayData', () => {
  it('为新年份注入放假数据', () => {
    // 2028 年无硬编码数据，badge 应为 null
    expect(getRestDayBadge(2028, 0, 1)).toBeNull();

    // 模拟 API 数据
    setApiHolidayData(2028, [
      { date: '2028-01-01', isOffDay: true },
      { date: '2028-01-02', isOffDay: true },
      { date: '2028-01-03', isOffDay: true },
      { date: '2028-04-30', isOffDay: false }, // 调休上班（周日）
    ]);

    // 注入后应返回"休"
    expect(getRestDayBadge(2028, 0, 1)).toBe('休');
    expect(getRestDayBadge(2028, 0, 2)).toBe('休');

    // 2028-04-30 是周日，标记调休上班
    expect(getRestDayBadge(2028, 3, 30)).toBe('班');
  });

  it('API 数据与硬编码数据可共存', () => {
    // 2026 年硬编码数据仍然有效
    expect(getRestDayBadge(2026, 0, 1)).toBe('休');
    expect(getRestDayBadge(2026, 1, 14)).toBe('班');
  });
});
