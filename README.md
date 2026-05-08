# liu-PTR

一个基于 React Native + Expo 的差旅费用记录应用，帮助用户管理差旅支出、预算和行程。

## 功能特性

### 📅 日历视图
- 可滑动的月历组件
- 中国法定节假日自动标注
- 每日费用金额显示
- 超支预警标记

### 💰 费用记录
- 支持多种货币：CNY、USD、EUR、JPY、GBP
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

### 💱 汇率转换
- 实时汇率查询
- 多币种统一换算

### 📦 数据管理
- JSON 备份/恢复
- CSV 导出（兼容 Excel）

## 技术栈

- **框架:** Expo SDK 54 + React Native 0.81
- **语言:** TypeScript 5.9
- **存储:** AsyncStorage（防抖 500ms）
- **动画:** Reanimated + Gesture Handler
- **测试:** Jest 30

## 项目结构

```
├── app/                    # 路由页面
│   ├── (tabs)/            # 底部标签页
│   │   ├── index.tsx      # 日历首页
│   │   ├── stats.tsx      # 统计报表
│   │   └── trips.tsx      # 差旅管理
│   └── trip-detail.tsx    # 行程详情
├── components/            # UI 组件
│   ├── app-context.tsx    # 应用上下文
│   ├── calendar.tsx       # 日历组件
│   ├── day-detail-panel.tsx # 日详情面板
│   ├── stats/             # 统计图表组件
│   │   ├── category-breakdown.tsx
│   │   ├── daily-chart.tsx
│   │   ├── monthly-chart.tsx
│   │   ├── month-stats.tsx
│   │   └── year-stats.tsx
│   └── ...
├── hooks/                 # 自定义 Hooks
│   ├── use-expenses.ts    # 费用管理
│   ├── use-trips.ts       # 行程管理
│   ├── use-budget.ts      # 预算管理
│   └── use-exchange-rates.ts # 汇率
├── constants/             # 常量配置
│   ├── currency.ts        # 货币相关
│   ├── holidays.ts        # 节假日
│   └── theme.ts           # 主题颜色
├── types/                 # TypeScript 类型
│   └── expense.ts
└── utils/                 # 工具函数
    └── csv-export.ts
```

## 快速开始

### 环境要求

- Node.js >= 20.19.4
- npm 或 yarn
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

# 运行 iOS 模拟器
npm run ios

# 运行 Android 模拟器
npm run android

# 运行 Web 版本
npm run web
```

### 测试

```bash
# 运行所有测试
npm test

# 运行测试并生成覆盖率报告
npm test -- --coverage
```

### 代码检查

```bash
# 运行 ESLint
npm run lint
```

## 配置说明

### 汇率配置

默认汇率在 `constants/currency.ts` 中配置：

```typescript
export const DEFAULT_RATES: Record<Currency, number> = {
  CNY: 1,
  USD: 0.14,
  EUR: 0.13,
  JPY: 20.5,
  GBP: 0.11,
};
```

### 预算配置

每日预算默认值在 `hooks/use-budget.ts` 中：

```typescript
const DEFAULT_BUDGET: DailyBudget = {
  workday: 200,
  weekend: 300,
  holiday: 500,
};
```

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'feat: Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

### 提交规范

使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

- `feat:` 新功能
- `fix:` 修复 bug
- `docs:` 文档更新
- `style:` 代码格式调整
- `refactor:` 代码重构
- `test:` 测试相关
- `chore:` 构建/工具相关

示例：
```bash
git commit -m "feat: 添加费用搜索功能"
git commit -m "fix: 修复汇率计算错误"
git commit -m "docs: 更新 README 文档"
```

## 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

## 联系方式

- 作者: liujunxiang0076
- GitHub: [@liujunxiang0076](https://github.com/liujunxiang0076)

## 致谢

- [Expo](https://expo.dev/)
- [React Native](https://reactnative.dev/)
- [Reanimated](https://docs.swmansion.com/react-native-reanimated/)
