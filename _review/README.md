# liu-PTR 代码审查 & 优化笔记

## 项目概览

基于 Expo SDK 54 + React Native 0.81 的个人记账/差旅管理应用。

## 目录结构

```
liu-PTR/
├── app/                    # Expo Router 页面
│   ├── (tabs)/             # Tab 页面（首页、差旅、统计）
│   ├── _layout.tsx         # 根布局
│   ├── trip-detail.tsx     # 行程详情
│   └── modal.tsx           # 模态页
├── components/             # 组件
│   ├── app-context.tsx     # 全局 Context（⚠️ 建议拆分）
│   ├── calendar.tsx        # 日历（⚠️ 性能优化点）
│   └── ...
├── hooks/                  # 自定义 hooks
│   ├── use-expenses.ts     # 费用 CRUD（⚠️ 查询效率）
│   ├── use-trips.ts        # 行程 CRUD
│   └── ...
├── constants/              # 常量
├── types/                  # 类型定义
├── utils/                  # 工具函数
├── __tests__/              # 测试
└── _review/                # 👈 代码审查笔记（我们放这里）
    ├── README.md           # 本文件
    ├── optimization.md     # 优化建议详情
    └── issues.md           # 已知问题跟踪
```

## 快速定位

- 优化建议 → `_review/optimization.md`
- 问题跟踪 → `_review/issues.md`
