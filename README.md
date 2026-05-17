# liu-PTR

一个基于 React Native + Expo 的差旅费用记录应用，帮助用户管理差旅支出、预算和行程。支持 Supabase 云同步，多端数据互通。

## 功能特性

### 📅 日历视图
- 可滑动的月历组件（支持手势左右切换月份）
- 中国法定节假日自动标注（基于 chinese-days）
- 农历日期、节气、农历节日显示
- 休/班标记（节假日显示「休」，调休显示「班」）
- 假期首日显示节日名，其余假日天显示农历
- 每日费用金额显示
- 超支预警标记（红色感叹号）

### 💰 费用记录
- 默认人民币（¥），支持多币种
- 6 种费用分类：交通、住宿、餐饮、通讯、办公、其他
- 费用搜索与筛选
- 费用编辑与删除

### 🎯 每日预算
- 按工作日/周末/节假日分别设置预算
- 实时预算进度追踪
- 超支预警

### 💼 差旅管理
- 创建行程：名称、目的地、日期范围、预算
- 费用自动关联行程
- 行程预算追踪

### 📊 统计报表
- 月度/年度汇总
- 分类占比图表
- 每日/月度支出柱状图
- CSV 导出

### 🔐 用户认证与云同步
- 用户名+密码注册/登录（Supabase 后端）
- 数据云端同步（行程、费用自动上传/下载）
- 登录后自动同步，退出后重新登录自动恢复
- 同步时间持久化记录

### 📦 数据管理
- JSON 备份/恢复（剪贴板导入导出）
- CSV 导出（兼容 Excel）
- Supabase PostgreSQL 云端存储

## 技术栈

- **框架:** Expo SDK 54 + React Native 0.81
- **语言:** TypeScript 5.9
- **存储:** AsyncStorage（本地）+ Supabase PostgreSQL（云端）
- **动画:** Reanimated + Gesture Handler
- **日历:** 自定义月历组件（react-native-gesture-handler 滑动手势）
- **节假日:** chinese-days（自动更新，跟随国务院发布）
- **测试:** Jest 30（69 个测试用例）

## 项目结构

```
├── app/                        # 路由页面
│   ├── (tabs)/                # 底部标签页
│   │   ├── _layout.tsx        # Tab 布局（日历/差旅/统计/设置）
│   │   ├── index.tsx          # 日历首页
│   │   ├── stats.tsx          # 统计报表
│   │   ├── trips.tsx          # 差旅管理
│   │   └── settings.tsx       # 设置（同步/退出登录）
│   ├── _layout.tsx            # 根布局（AuthProvider）
│   ├── index.tsx              # 入口（登录状态路由）
│   ├── login.tsx              # 登录页
│   └── trip-detail.tsx        # 行程详情
├── components/                # UI 组件
│   ├── calendar.tsx           # 日历组件（自定义月历）
│   ├── day-detail-panel.tsx   # 日详情面板
│   ├── sync-button.tsx        # 云同步按钮
│   ├── backup-modal.tsx       # 数据备份弹窗
│   ├── search-modal.tsx       # 费用搜索弹窗
│   ├── budget-settings-modal.tsx # 预算设置弹窗
│   ├── trip-form-modal.tsx    # 行程表单弹窗
│   ├── stats/                 # 统计图表组件
│   │   ├── category-breakdown.tsx
│   │   ├── daily-chart.tsx
│   │   ├── monthly-chart.tsx
│   │   ├── month-stats.tsx
│   │   └── year-stats.tsx
│   └── ui/                    # 通用 UI 组件
│       ├── card.tsx
│       ├── button.tsx
│       ├── badge.tsx
│       └── icon-symbol.tsx
├── context/                   # React Context
│   └── auth-context.tsx       # 用户认证上下文
├── hooks/                     # 自定义 Hooks
│   ├── use-expenses.ts        # 费用管理
│   ├── use-trips.ts           # 行程管理
│   ├── use-budget.ts          # 预算管理
│   ├── use-supabase-sync.ts   # Supabase 云同步
│   ├── use-exchange-rates.ts  # 汇率
│   └── use-location.ts        # 定位
├── lib/                       # 第三方库配置
│   └── supabase.ts            # Supabase 客户端
├── constants/                 # 常量配置
│   ├── currency.ts            # 货币相关
│   ├── holidays.ts            # 节假日（chinese-days）
│   ├── theme.ts               # 主题颜色
│   └── design-tokens.ts       # 设计系统 tokens
└── supabase/
    └── schema.sql             # 数据库表结构
```

## 快速开始

### 环境要求

- Node.js >= 20.19.4
- npm
- Expo CLI

### 安装

```bash
# 克隆项目
git clone https://github.com/liujunxiang0076/liu-PTR.git
cd liu-PTR

# 安装依赖
npm install
```

### 运行

```bash
# 启动开发服务器
npm start

# 运行 Android 模拟器
npm run android

# 运行 Web 版本
npm run web
```

### 测试

```bash
# 运行所有测试（69 个用例）
npm test
```

## 构建与部署

### Android APK

通过 GitHub Actions 自动构建。打 tag 即可触发：

```bash
git tag v0.0.x-beta.1
git push origin master --tags
```

APK 会自动上传到 GitHub Releases。

### Web 部署

推送到 master 自动部署到 GitHub Pages。

## 配置说明

### Supabase 配置

云同步功能依赖 Supabase 后端。配置文件在 `lib/supabase.ts`。

数据库表结构见 `supabase/schema.sql`，包含：
- `users` — 用户表（用户名 + 密码哈希）
- `trips` — 行程表
- `expenses` — 费用表
- `budgets` — 预算表

### 预算配置

每日预算默认值在 `hooks/use-budget.ts` 中：

```typescript
const DEFAULT_BUDGET: DailyBudget = {
  workday: 200,
  weekend: 300,
  holiday: 500,
};
```

## CI/CD

- **普通 push:** 运行测试 + 部署 Web
- **打 tag:** 运行测试 + 构建 APK + 创建 GitHub Release

## 提交规范

使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

- `feat:` 新功能
- `fix:` 修复 bug
- `docs:` 文档更新
- `refactor:` 代码重构
- `test:` 测试相关

## 许可证

本项目采用 MIT 许可证

## 联系方式

- GitHub: [@liujunxiang0076](https://github.com/liujunxiang0076)
