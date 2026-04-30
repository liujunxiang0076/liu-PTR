# liu-PTR — 差旅费用记录

基于 [Expo](https://expo.dev) 的 React Native 差旅费用记录应用，支持日历视图、结构化费用管理、差旅行程管理和统计报表。

## 功能

- **日历视图**: 滑动切换月份，中国节假日标注，日期格显示当日费用金额
- **费用记录**: 金额、分类（交通/住宿/餐饮/通讯/办公/其他）、多币种（CNY/USD/EUR/JPY/GBP）、备注
- **差旅管理**: 创建行程（名称/目的地/日期范围/预算），费用自动关联行程，预算进度追踪
- **统计报表**: 月度汇总、分类占比图、每日支出柱状图
- **CSV 导出**: 一键复制到剪贴板，可粘贴到 Excel 报销
- **数据持久化**: AsyncStorage 本地存储，关闭应用不丢失
- **深色/浅色主题**: 自动跟随系统主题

## 技术栈

- **框架**: Expo SDK 54 + React Native 0.81 + React 19
- **路由**: Expo Router（文件系统路由）
- **语言**: TypeScript 5.9
- **存储**: AsyncStorage
- **动画**: React Native Reanimated + React Native Gesture Handler
- **UI**: React Navigation + 深色/浅色主题

## 项目结构

```
app/
  _layout.tsx              # 根布局（主题、导航栈）
  trip-detail.tsx          # 行程详情页
  modal.tsx                # 模态页
  (tabs)/
    _layout.tsx            # 标签栏布局（日历/差旅/统计）
    index.tsx              # 首页（日历视图）
    trips.tsx              # 差旅管理
    stats.tsx              # 统计报表
components/
  calendar.tsx             # 可滑动月份日历
  day-detail-panel.tsx     # 费用详情底部弹窗
  trip-form-modal.tsx      # 行程创建/编辑表单
  app-context.tsx          # 统一 Context（费用+行程+汇率）
types/
  expense.ts               # 类型定义与常量
constants/
  currency.ts              # 汇率、格式化、分类颜色
  holidays.ts              # 中国节假日数据
  theme.ts                 # 主题配置
hooks/
  use-expenses.ts          # 费用 CRUD（AsyncStorage 持久化）
  use-trips.ts             # 行程 CRUD（AsyncStorage 持久化）
  use-exchange-rates.ts    # 汇率管理
utils/
  csv-export.ts            # CSV 生成工具
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
