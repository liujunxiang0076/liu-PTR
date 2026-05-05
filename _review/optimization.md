# 优化建议

## 🔴 高优先级

### 1. Context 拆分 — 避免不必要的重渲染

**文件**: `components/app-context.tsx`

当前 AppProvider 把 expenses、trips、rates、budget 全部放在一个 Context。
任何一个数据变化，所有消费 Context 的组件都会重渲染。

**建议方案**:
- 拆成 ExpensesContext / TripsContext / BudgetContext
- 或者引入 Zustand / Jotai 等轻量状态管理

### 2. 费用查询缓存

**文件**: `hooks/use-expenses.ts`

`getByTrip`、`getByDateRange`、`getMonthlyTotal`、`search` 每次都全量遍历 Object.entries。

**建议方案**:
- 维护按月/按 trip 的索引 Map
- 用 `useMemo` 缓存计算结果
- 或者用二分查找优化日期范围查询

### 3. 日历 grid 缓存

**文件**: `components/calendar.tsx`

`buildGrid` 每次渲染都重新计算 42 个 cell。

**建议方案**:
```tsx
const grid = useMemo(() => buildGrid(year, month, today), [year, month]);
```

## 🟡 中优先级

### 4. AsyncStorage 数据版本迁移

**文件**: `hooks/use-expenses.ts`, `hooks/use-trips.ts`

缺少数据版本号和 migration 机制。结构变更后旧数据会解析失败。

### 5. 保存 debounce 时间

`SAVE_DELAY = 300` 偏短，快速连续编辑可能触发多次写入。建议 500-1000ms。

### 6. removeByTrip 优化

用 Object.entries 遍历再 filter，不如直接 delete 对应 key。

## 🟢 低优先级

### 7. 汇率实时获取

当前汇率硬编码，应接入真实 API 并缓存。

### 8. 测试覆盖

核心 hooks 缺少测试，建议补充。

### 9. CSV 导出优化

大数据量时应异步处理，避免卡 UI。
