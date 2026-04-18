# Mapbox 沉浸感升级设计

**日期：** 2026-04-18  
**方向：** 视觉沉浸感（3D 地球仪 + 飞行动画 + 卫星线索积分）  
**商业模式：** 每日免费积分 + 积分包购买

---

## 背景

ace-map 当前使用 MapLibre + CartoDB 免费底图，游戏机制为点击地图 Pin 位置后比较距离。视觉层较平，缺乏答题揭晓时的戏剧感。

Mapbox 提供的 3D 地球仪投影、摄像机飞行动画、卫星静态图 API 可在不改变核心玩法的前提下大幅提升沉浸感。项目已有 `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` 配置，Mapbox 卫星地形模式已部分接入。

---

## 目标

1. 所有用户免费享受 3D 地球仪视觉 + 答题后摄像机飞行动画
2. 每日免费 5 次卫星线索（Mapbox Static Images API），用完可购买积分包
3. 无 token 时 graceful fallback，不影响现有功能

---

## 功能设计

### 1. Mapbox 3D 地球仪投影（免费）

**改动范围：** `src/lib/maps/basemaps.ts`、`src/lib/components/game/Game.tsx`

- 将 `play` / `pulse` / `activity` 模式下的地图切换为 `react-map-gl`（Mapbox 版本）
- 启用 `projection: 'globe'`，开启球形投影
- 添加大气层雾效（`fog`）：蓝色大气边缘
- 启用 Mapbox DEM 3D 地形层（山脉/高原有实际起伏）
- 无 `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` 时，自动 fallback 为现有 MapLibre 平面投影

**样式参数：**
```ts
fog: {
  color: 'rgb(186, 210, 235)',
  'high-color': 'rgb(36, 92, 223)',
  'horizon-blend': 0.02,
  'space-color': 'rgb(11, 11, 25)',
  'star-intensity': 0.6
}
```

---

### 2. 答题后摄像机飞行动画（免费）

**改动范围：** `src/lib/components/game/Game.tsx`

- 当 `props.info`（SubmitInfo）从 null 变为有值时，触发 `mapRef.current.flyTo()`
- 延迟 300ms 等 ResultLine 渲染完成后起飞
- 落点 zoom 根据题目类型：
  - 世界模式（国家级）：zoom 4
  - 国家模式（城市级）：zoom 7
  - 印度模式（城市级）：zoom 7

**飞行参数：**
```ts
mapRef.current.flyTo({
  center: [toMark.longitude, toMark.latitude],
  zoom: targetZoom,
  speed: 0.8,
  curve: 1.4,
  essential: true
});
```

---

### 3. 卫星线索按钮（消耗积分）

**改动范围：** `src/lib/components/game/GameBar.tsx`、新增 `src/lib/utils/credits.ts`

每道题 GameBar 新增「🛰 卫星线索」按钮：
1. 检查积分余额 > 0
2. 扣 1 积分
3. 请求 Mapbox Static Images API（前端直接请求，无服务器中转）
4. 在地图右下角显示半透明卫星图浮层（400×300，不遮挡点击区域）
5. 图片不标注地名，只显示地物特征

**API 格式：**
```
GET https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/
    {lon},{lat},{zoom}/400x300@2x?access_token={token}
```

**zoom 与 strictness 对应：**
| Strictness | zoom |
|-----------|------|
| High (50km) | 12 |
| Medium (150km) | 9 |
| Low (400km) | 6 |
| World High (300km) | 7 |
| World Medium (800km) | 5 |

---

### 4. 积分系统（Credits）

**改动范围：** 新增 `src/lib/utils/credits.ts`、`src/lib/components/CreditBadge.tsx`

**存储：** localStorage（初期无需后端）

```ts
interface CreditState {
  balance: number;
  lastRefillAt: string; // ISO date string
}

const DAILY_FREE_CREDITS = 5;
const INITIAL_CREDITS = 10;
```

**规则：**
- 首次访问赠送 10 积分
- 每自然日（UTC+8 00:00）自动补充 5 积分（页面加载时检查）
- 每次点击卫星线索扣 1 积分
- 余额为 0 时按钮禁用，toast 提示明日可用或购买积分包

**积分包（后期接 Stripe）：**
| 积分包 | 价格 |
|--------|------|
| 20 积分 | ¥6 |
| 100 积分 | ¥25 |

**UI：**
- Navbar 右侧显示 `🪙 8`（CreditBadge 组件）
- 积分变动时有 +/- 动画

---

## 技术架构

```
用户点击「🛰 卫星线索」
  → credits.ts: checkAndDeduct()
    → 有积分：扣减 → 写 localStorage
      → 前端 fetch Mapbox Static Images API
        → 显示卫星图浮层（Game.tsx）
    → 无积分：toast 提示
```

```
页面加载
  → credits.ts: maybeRefill()
    → 检查 lastRefillAt 与今日日期差
    → 差 >= 1 天：balance += 5，更新 lastRefillAt
```

---

## Mapbox 免费配额预估

| API | 免费额度 | 预估用量（1000 DAU × 5次）| 结论 |
|-----|---------|--------------------------|------|
| Map Loads | 50,000/月 | ~30,000/月 | 安全 |
| Static Images | 50,000/月 | ~5,000/月 | 充裕 |

超过 50k DAU 时，积分包收入可覆盖 Mapbox 超额费用（约 $0.05/1000 次）。

---

## 实施顺序

1. 接入 Mapbox GL JS（react-map-gl Mapbox 版），启用 globe + fog
2. 实现飞行动画（Game.tsx）
3. 实现 `credits.ts` 积分工具
4. GameBar 新增卫星线索按钮 + 浮层
5. Navbar 新增 CreditBadge
6. （后期）Stripe 积分包购买流程

---

## 不在本期范围内

- 多人对战
- 积分服务端同步（初期 localStorage 足够）
- Mapbox Boundaries API（付费，暂不引入）
- Stripe 支付（单独排期）
