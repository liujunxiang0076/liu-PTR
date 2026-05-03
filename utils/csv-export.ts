import { type ExpenseItem, type Trip } from '@/types/expense';
import { formatAmount } from '@/constants/currency';

/** 生成 CSV 文本（含 UTF-8 BOM 以兼容 Excel 中文显示） */
export function generateCSV(expenses: ExpenseItem[], trips: Record<string, Trip>): string {
  const BOM = '﻿';
  const header = '日期,金额,币种,类别,备注,差旅';
  const rows = expenses
    .sort((a, b) => a.dateKey.localeCompare(b.dateKey) || a.createdAt - b.createdAt)
    .map((e) => {
      const tripName = e.tripId ? (trips[e.tripId]?.name ?? '') : '';
      return [
        e.dateKey,
        e.amount.toFixed(2),
        e.currency,
        e.category,
        `"${(e.notes || '').replace(/"/g, '""')}"`,
        `"${tripName}"`,
      ].join(',');
    });
  return BOM + [header, ...rows].join('\n');
}
