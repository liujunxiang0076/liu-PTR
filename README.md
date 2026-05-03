# liu-PTR — 差旅费用记录

基于 [Expo](https://expo.dev) 的 React Native 差旅费用记录应用，支持日历视图、结构化费用管理、差旅行程管理、预算控制和统计报表。

## 功能

- **日历视图**: 滑动切换月份，中国节假日/调休标注，日期格显示当日费用金额，超支预警标记
- **费用记录**: 金额、分类（交通/住宿/餐饮/通讯/办公/其他）、多币种（CNY/USD/EUR/JPY/GBP）、备注，支持编辑与删除
- **差旅管理**: 创建行程（名称/目的地/日期范围/预算），费用自动关联行程，预算进度追踪
- **每日预算**: 按工作日/周末/节假日分别设置预算上限，实时对比当日支出
- **费用搜索**: 关键词搜索备注、按分类筛选，快速定位费用记录
- **统计报表**: 月度汇总、年度视图、分类占比图、每日/月度支出柱状图
- **CSV 导出**: 一键复制到剪贴板，可粘贴到 Excel 报销
- **数据备份与恢复**: 通过剪贴板导出/导入全部 JSON 数据，防止数据丢失
- **节假日同步**: 自动从 GitHub API 拉取中国法定节假日与调休安排数据
- **深色/浅色主题**: 自动跟随系统主题
- **全局错误边界**: 捕获渲染异常，防止白屏

## 技术栈

- **框架**: Expo SDK 54 + React Native 0.81 + React 19
- **路由**: Expo Router v6（文件系统路由，类型安全）
- **语言**: TypeScript 5.9（strict mode）
- **存储**: AsyncStorage（防抖持久化）
- **动画**: React Native Reanimated + React Native Gesture Handler
- **UI**: React Navigation Bottom Tabs + 深色/浅色主题
- **测试**: Jest 30
- **优化**: React Compiler（实验特性，自动优化渲染）

## 项目结构

```
app/
  _layout.tsx                # 根布局（ErrorBoundary、主题、导航栈）
  trip-detail.tsx            # 行程详情页
  modal.tsx                  # 模态页
  (tabs)/
    _layout.tsx              # 标签栏布局（AppProvider 全局状态）
    index.tsx                # 首页（日历视图、预算设置、备份、搜索）
    trips.tsx                # 差旅管理
    stats.tsx                # 统计报表（月度/年度视图）
components/
  calendar.tsx               # 可滑动月份日历（手势、动画、节假日标注）
  day-detail-panel.tsx       # 费用详情底部弹窗（添加/编辑费用）
  trip-form-modal.tsx        # 行程创建/编辑表单
  budget-settings-modal.tsx  # 每日预算设置
  backup-modal.tsx           # 数据备份/恢复
  search-modal.tsx           # 费用搜索与筛选
  app-context.tsx            # 统一 Context（费用+行程+汇率+预算）
  error-boundary.tsx         # 全局错误边界
  themed-text.tsx            # 主题感知 Text 组件
  themed-view.tsx            # 主题感知 View 组件
  haptic-tab.tsx             # 触觉反馈 Tab 按钮
  ui/
    icon-symbol.tsx          # Android/Web 图标（MaterialIcons）
    icon-symbol.ios.tsx      # iOS 图标（SF Symbols）
types/
  expense.ts                 # 类型定义与常量
constants/
  currency.ts                # 汇率、格式化、分类颜色、工具函数
  holidays.ts                # 中国节假日数据（2025-2027）
  theme.ts                   # 主题色与语义化颜色
hooks/
  use-app-colors.ts          # 统一应用颜色 hook
  use-expenses.ts            # 费用 CRUD（AsyncStorage 持久化）
  use-trips.ts               # 行程 CRUD（AsyncStorage 持久化）
  use-budget.ts              # 预算管理
  use-exchange-rates.ts      # 汇率转换
  use-holiday-sync.ts        # 节假日数据自动同步
  use-color-scheme.ts        # 系统主题检测
  use-theme-color.ts         # 通用主题色 hook
utils/
  csv-export.ts              # CSV 生成工具
__tests__/
  currency.test.ts           # 汇率/格式化/颜色工具测试
  holidays.test.ts           # 节假日判断/标注测试
```

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npx expo start
```

启动后可选择在以下环境中运行：
- Expo Go（扫码体验）
- Android 模拟器
- iOS 模拟器
- Web 浏览器

## 可用脚本

| 命令 | 说明 |
|------|------|
| `npm start` | 启动开发服务器 |
| `npm run android` | 在 Android 模拟器中运行 |
| `npm run ios` | 在 iOS 模拟器中运行 |
| `npm run web` | 在浏览器中运行 |
| `npm run lint` | 运行 ESLint 检查 |
| `npm test` | 运行 Jest 单元测试 |

## 数据存储

所有数据通过 AsyncStorage 本地持久化，使用防抖保存（300ms）减少 I/O 开销：

| Storage Key | 数据 |
|-------------|------|
| `@expenses:v1` | 费用记录（按日期分组） |
| `@trips:v1` | 差旅行程 |
| `@budget:v1` | 每日预算配置 |
| `@holiday:{year}` | 年度节假日 API 缓存 |
