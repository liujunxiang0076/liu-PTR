import {
  getHoliday, getRestDayBadge, getLunarText, isWeekend, getDayInfo,
  isDayWorkday, isDayHoliday, isDayInLieu,
} from '@/constants/holidays';

describe('getHoliday', () => {
  it('固定节假日返回名称', () => {
    // 2026-01-01 元旦
    expect(getHoliday(2026, 0, 1)).toBe('元旦');
  });

  it('春节假期第一天返回名称', () => {
    // 2026年春节假期：只有第一天显示"春节"，其余天显示农历
    // 找到春节假期的第一天
    let found = false;
    for (let d = 14; d <= 22; d++) {
      const h = getHoliday(2026, 1, d);
      if (h === '春节') {
        found = true;
        // 确认第二天不显示"春节"（显示农历）
        expect(getHoliday(2026, 1, d + 1)).not.toBe('春节');
        break;
      }
    }
    expect(found).toBe(true);
  });

  it('普通日期返回null', () => {
    expect(getHoliday(2026, 4, 20)).toBeNull();
  });

  it('节气日期不返回节气名称（节气不是节假日）', () => {
    // 2026-02-04 立春，但节气不是节假日
    expect(getHoliday(2026, 1, 4)).toBeNull();
  });
});

describe('getRestDayBadge', () => {
  it('节假日返回休', () => {
    // 2026-01-01 元旦
    expect(getRestDayBadge(2026, 0, 1)).toBe('休');
  });

  it('普通工作日返回null', () => {
    // 2026-05-08 周五，普通工作日
    expect(getRestDayBadge(2026, 4, 8)).toBeNull();
  });

  it('普通周末返回null', () => {
    // 2026-05-09 周六，普通周末
    expect(getRestDayBadge(2026, 4, 9)).toBeNull();
  });
});

describe('isWeekend', () => {
  it('周六返回true', () => {
    // 2026-05-09 周六
    expect(isWeekend(2026, 4, 9)).toBe(true);
  });

  it('周日返回true', () => {
    // 2026-05-10 周日
    expect(isWeekend(2026, 4, 10)).toBe(true);
  });

  it('工作日返回false', () => {
    // 2026-05-08 周五
    expect(isWeekend(2026, 4, 8)).toBe(false);
  });
});

describe('getLunarText', () => {
  it('节气日返回节气名称', () => {
    // 2026-02-04 立春
    const text = getLunarText(2026, 1, 4);
    expect(text).toBe('立春');
  });

  it('农历节日返回节日名称', () => {
    // 测试春节（农历正月初一）
    const text = getLunarText(2026, 1, 17);
    expect(text).toBeTruthy();
  });

  it('普通日期返回农历日期', () => {
    const text = getLunarText(2026, 4, 20);
    expect(text).toBeTruthy();
  });
});

describe('getDayInfo', () => {
  it('返回完整日期信息', () => {
    const info = getDayInfo(2026, 0, 1);
    expect(info.isHoliday).toBe(true);
    expect(info.holidayName).toBe('元旦');
    expect(info.isWorkday).toBe(false);
    expect(info.lunarDate).toBeTruthy();
  });
});

describe('isDayWorkday', () => {
  it('工作日返回true', () => {
    expect(isDayWorkday(2026, 4, 8)).toBe(true);
  });

  it('节假日返回false', () => {
    expect(isDayWorkday(2026, 0, 1)).toBe(false);
  });
});

describe('isDayHoliday', () => {
  it('节假日返回true', () => {
    expect(isDayHoliday(2026, 0, 1)).toBe(true);
  });

  it('普通日返回false', () => {
    expect(isDayHoliday(2026, 4, 8)).toBe(false);
  });
});

describe('isDayInLieu', () => {
  it('调休日返回true', () => {
    // 2026-01-02 是调休日
    expect(isDayInLieu(2026, 0, 2)).toBe(true);
  });

  it('普通日返回false', () => {
    expect(isDayInLieu(2026, 4, 8)).toBe(false);
  });
});
