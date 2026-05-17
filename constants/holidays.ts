/**
 * 中国节假日、调休日、工作日、24节气、农历数据
 * 数据来源：chinese-days（自动更新，跟随国务院发布）
 */
import {
  isHoliday,
  isWorkday,
  getDayDetail,
  getSolarTerms,
  getLunarDate,
  getLunarFestivals,
} from 'chinese-days';
import type { SolarTerm } from 'chinese-days';

/** 日期详情 */
export type DayDetail = {
  /** 是否节假日 */
  isHoliday: boolean;
  /** 是否调休日（补班） */
  isInLieu: boolean;
  /** 是否工作日 */
  isWorkday: boolean;
  /** 节假日/节日名称 */
  holidayName: string | null;
  /** 农历日期 */
  lunarDate: string;
  /** 农历节日 */
  lunarFestival: string | null;
  /** 24节气 */
  solarTerm: string | null;
};

/** 休息日标记类型 */
export type RestDayBadge = '休' | '班' | null;

/**
 * 解析节假日名称
 * 格式：English,中文,天数 或 英文星期几
 * 只有包含逗号的才是真正的节假日
 */
function parseHolidayName(name: string): string | null {
  if (!name) return null;
  const parts = name.split(',');
  // 包含逗号且有中文部分才是节假日
  if (parts.length > 1 && parts[1]) {
    return parts[1];
  }
  // 没有逗号的是普通星期几，返回 null
  return null;
}

/**
 * 获取指定日期的完整信息
 * @param year 年
 * @param month 月（0-based）
 * @param day 日
 */
export function getDayInfo(year: number, month: number, day: number): DayDetail {
  const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  // 获取日期详情（数据来自 chinese-days 内嵌的 holidays/workdays/inLieuDays）
  const detail = getDayDetail(dateStr);

  // 解析节假日名称
  const rawHolidayName = parseHolidayName(detail.name);

  // 所有假期天都显示节日名（不只是第一天），调休工作日除外
  const holidayName = detail.work ? null : rawHolidayName;

  // 判断是否是调休补班日：周末但被标记为工作日
  // chinese-days 的 inLieuDays 含义是"有补班的假期天"，不是"补班日本身"
  const isMakeupWorkday = detail.work && isWeekend(year, month, day);

  // 获取农历信息
  let lunarDate = '';
  let lunarFestival: string | null = null;
  try {
    const lunar = getLunarDate(dateStr);
    lunarDate = lunar.lunarDayCN || '';

    // 获取农历节日
    const festivals = getLunarFestivals(dateStr);
    lunarFestival = festivals.length > 0 ? festivals[0].name[0] : null;
  } catch {
    // 农历获取失败不影响其他功能
  }

  // 获取24节气
  let solarTerm: string | null = null;
  try {
    const terms: SolarTerm[] = getSolarTerms(dateStr);
    if (terms.length > 0) {
      solarTerm = terms[0].name;
    }
  } catch {
    // 节气获取失败不影响其他功能
  }

  return {
    isHoliday: !detail.work && holidayName !== null,
    isInLieu: isMakeupWorkday,
    isWorkday: detail.work,
    holidayName,
    lunarDate,
    lunarFestival,
    solarTerm,
  };
}

/**
 * 获取节假日名称（兼容旧 API）
 * @param year 年
 * @param month 月（0-based）
 * @param day 日
 */
export function getHoliday(year: number, month: number, day: number): string | null {
  const info = getDayInfo(year, month, day);
  return info.holidayName;
}

/**
 * 获取休息日标记（兼容旧 API）
 * 返回 '休' 表示节假日，'班' 表示调休上班，null 表示普通日
 */
export function getRestDayBadge(year: number, month: number, day: number): RestDayBadge {
  const info = getDayInfo(year, month, day);
  if (info.isHoliday) return '休';
  if (info.isInLieu) return '班';
  return null;
}

/**
 * 获取农历显示文本（兼容旧 API）
 */
export function getLunarText(year: number, month: number, day: number): string {
  const info = getDayInfo(year, month, day);

  // 优先显示：节气 > 农历节日 > 农历日期
  if (info.solarTerm) return info.solarTerm;
  if (info.lunarFestival) return info.lunarFestival;
  if (info.lunarDate) return info.lunarDate;

  return '';
}

/**
 * 判断是否是工作日
 */
export function isDayWorkday(year: number, month: number, day: number): boolean {
  const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  return isWorkday(dateStr);
}

/**
 * 判断是否是节假日
 */
export function isDayHoliday(year: number, month: number, day: number): boolean {
  const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  return isHoliday(dateStr);
}

/**
 * 判断是否是调休补班日（周末但被标记为工作日）
 */
export function isDayInLieu(year: number, month: number, day: number): boolean {
  const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const detail = getDayDetail(dateStr);
  return detail.work && isWeekend(year, month, day);
}

/**
 * 判断是否是周末（周六或周日）
 */
export function isWeekend(year: number, month: number, day: number): boolean {
  const date = new Date(year, month, day);
  const dayOfWeek = date.getDay();
  return dayOfWeek === 0 || dayOfWeek === 6;
}

/**
 * 设置 API 节假日数据（兼容旧 API，现在不再需要）
 * 数据已由 chinese-days 自动管理
 */
export function setApiHolidayData(..._args: unknown[]): void {
  // 不再需要手动设置，数据由 chinese-days 自动管理
}
