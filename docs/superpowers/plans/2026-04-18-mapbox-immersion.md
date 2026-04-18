# Mapbox 沉浸感升级 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在不改变核心玩法的前提下，为所有用户启用 3D 地球仪投影 + 大气雾效 + 答题飞行动画，并通过每日免费积分 + 卫星线索按钮提升沉浸感。

**Architecture:** MapLibre GL JS v5 原生支持 globe projection 和 fog，无需引入 mapbox-gl 包。积分系统用 localStorage 实现，无需后端。卫星静态图通过 Mapbox Static Images API 前端直接请求（需 NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN）。

**Tech Stack:** react-map-gl/maplibre v8, MapLibre GL JS v5, Mapbox Static Images API, localStorage, Next.js App Router, HeroUI, framer-motion

---

## File Map

| 文件 | 操作 | 职责 |
|------|------|------|
| `src/lib/components/game/Game.tsx` | Modify | 启用 globe 投影、fog、增强飞行动画、卫星图浮层 |
| `src/lib/maps/basemaps.ts` | Modify | 导出 fog 配置常量 |
| `src/lib/utils/credits.ts` | **Create** | 积分读写、每日补充、扣减逻辑 |
| `src/lib/components/CreditBadge.tsx` | **Create** | Navbar 积分显示徽章 |
| `src/lib/components/Navbar.tsx` | Modify | 引入 CreditBadge |
| `src/lib/components/game/GameBar.tsx` | Modify | 新增卫星线索按钮 |

---

## Task 1: 启用 Globe 投影 + 大气雾效

**Files:**
- Modify: `src/lib/components/game/Game.tsx`
- Modify: `src/lib/maps/basemaps.ts`

- [ ] **Step 1: 在 basemaps.ts 导出 fog 配置**

在 `src/lib/maps/basemaps.ts` 末尾添加：

```ts
export const GLOBE_FOG_CONFIG = {
  color: 'rgb(186, 210, 235)',
  'high-color': 'rgb(36, 92, 223)',
  'horizon-blend': 0.02,
  'space-color': 'rgb(11, 11, 25)',
  'star-intensity': 0.6
} as const;
```

- [ ] **Step 2: 在 Game.tsx 引入 GLOBE_FOG_CONFIG**

在 `src/lib/components/game/Game.tsx` 的 import 区域添加：

```ts
import {
  getMapStyleForMode,
  getTerrainBasemapConfig,
  GLOBE_FOG_CONFIG
} from '@/lib/maps/basemaps';
```

- [ ] **Step 3: 在 Game.tsx 的 onLoad 回调中启用 globe + fog**

找到现有的 `onLoad` 回调（约第 581 行），将其替换为：

```tsx
onLoad={() => {
  const map = mapRef.current?.getMap();
  if (map) {
    hideSymbolLayers(map);
    // Enable globe projection (MapLibre GL JS v3+ native support)
    map.setProjection({ type: 'globe' });
    map.setFog(GLOBE_FOG_CONFIG);
  }
  focusGameArea(0);
}}
```

- [ ] **Step 4: 在 onStyleData 回调中保持 globe + fog（样式切换后重新应用）**

找到现有的 `onStyleData` 回调（约第 588 行），替换为：

```tsx
onStyleData={() => {
  const map = mapRef.current?.getMap();
  if (map?.isStyleLoaded()) {
    hideSymbolLayers(map);
    map.setProjection({ type: 'globe' });
    map.setFog(GLOBE_FOG_CONFIG);
  }
}}
```

- [ ] **Step 5: 手动验证**

运行 `pnpm dev`，打开游戏页面，切换到 `play` 模式，确认地图显示球形投影和蓝色大气边缘。地形模式（terrain）保持不变。

- [ ] **Step 6: Commit**

```bash
git add src/lib/maps/basemaps.ts src/lib/components/game/Game.tsx
git commit -m "feat: enable MapLibre globe projection and atmospheric fog"
```

---

## Task 2: 增强答题后飞行动画

**Files:**
- Modify: `src/lib/components/game/Game.tsx`

背景：`props.info` 变为有值时，现有代码已有 `map.fitBounds` / `map.flyTo`（约第 519–571 行）。本任务将其升级为更有戏剧感的飞行动画。

- [ ] **Step 1: 替换现有答题后相机逻辑**

找到 Game.tsx 中约第 519 行的 `useEffect`，完整替换为：

```tsx
// Cinematic camera reveal after submission
useEffect(() => {
  if (!props.info || !mapRef.current) return;

  const { toMark, guess } = props.info;
  const map = mapRef.current.getMap();

  const lngs = [guess.longitude, toMark.longitude];
  const lats = [guess.latitude, toMark.latitude];
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const isSameSpot =
    Math.abs(maxLng - minLng) < 0.01 && Math.abs(maxLat - minLat) < 0.01;

  // Delay 300ms to let ResultLine render first
  const timer = setTimeout(() => {
    if (isSameSpot) {
      map.flyTo({
        center: [toMark.longitude, toMark.latitude],
        zoom: mode === 'world' ? 4.2 : 7,
        speed: 0.8,
        curve: 1.4,
        essential: true
      });
      return;
    }

    map.fitBounds(
      [[minLng, minLat], [maxLng, maxLat]],
      {
        padding: { top: 110, right: 72, bottom: 110, left: 72 },
        maxZoom: mode === 'world' ? 4.6 : 7.2,
        speed: 0.8,
        curve: 1.4,
        essential: true
      }
    );
  }, 300);

  return () => clearTimeout(timer);
}, [props.info, mode]);
```

- [ ] **Step 2: 手动验证**

打开游戏，提交一个答案（无论对错），确认地图在 300ms 后平滑飞行到正确位置，连线完整可见。

- [ ] **Step 3: Commit**

```bash
git add src/lib/components/game/Game.tsx
git commit -m "feat: cinematic flyTo animation on answer reveal (300ms delay, globe-aware)"
```

---

## Task 3: 积分系统工具函数

**Files:**
- Create: `src/lib/utils/credits.ts`

- [ ] **Step 1: 创建 credits.ts**

创建 `src/lib/utils/credits.ts`：

```ts
const STORAGE_KEY = 'ace-map-credits';
const DAILY_FREE_CREDITS = 5;
const INITIAL_CREDITS = 10;

interface CreditState {
  balance: number;
  lastRefillAt: string; // ISO date string (YYYY-MM-DD in UTC+8)
}

const getTodayKey = (): string => {
  // Use UTC+8 date boundary
  const d = new Date(Date.now() + 8 * 60 * 60 * 1000);
  return d.toISOString().slice(0, 10);
};

const readState = (): CreditState => {
  if (typeof window === 'undefined') return { balance: 0, lastRefillAt: '' };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { balance: INITIAL_CREDITS, lastRefillAt: getTodayKey() };
    return JSON.parse(raw) as CreditState;
  } catch {
    return { balance: INITIAL_CREDITS, lastRefillAt: getTodayKey() };
  }
};

const writeState = (state: CreditState): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

/** Call on app load — tops up balance if a new day has started. */
export const maybeRefill = (): number => {
  const state = readState();
  const today = getTodayKey();
  if (state.lastRefillAt !== today) {
    const next: CreditState = {
      balance: state.balance + DAILY_FREE_CREDITS,
      lastRefillAt: today
    };
    writeState(next);
    return next.balance;
  }
  return state.balance;
};

/** Read current balance (after refill check). */
export const getBalance = (): number => {
  return readState().balance;
};

/**
 * Deduct 1 credit. Returns true if successful, false if balance was 0.
 */
export const deductCredit = (): boolean => {
  const state = readState();
  if (state.balance <= 0) return false;
  writeState({ ...state, balance: state.balance - 1 });
  return true;
};
```

- [ ] **Step 2: Verify the module compiles**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected: no errors related to `credits.ts`.

- [ ] **Step 3: Commit**

```bash
git add src/lib/utils/credits.ts
git commit -m "feat: localStorage credit system with daily refill"
```

---

## Task 4: CreditBadge 组件 + Navbar 集成

**Files:**
- Create: `src/lib/components/CreditBadge.tsx`
- Modify: `src/lib/components/Navbar.tsx`

- [ ] **Step 1: 创建 CreditBadge.tsx**

创建 `src/lib/components/CreditBadge.tsx`：

```tsx
'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { maybeRefill, getBalance } from '@/lib/utils/credits';

const CreditBadge = () => {
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    const b = maybeRefill();
    setBalance(b);
  }, []);

  if (balance === null) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={balance}
        initial={{ scale: 1.3, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400"
      >
        🪙 {balance}
      </motion.div>
    </AnimatePresence>
  );
};

export default CreditBadge;
```

- [ ] **Step 2: 在 Navbar.tsx 引入 CreditBadge**

在 `src/lib/components/Navbar.tsx` 中：

1. 顶部添加 import：
```ts
import CreditBadge from '@/lib/components/CreditBadge';
```

2. 在 `<Navbar.NavbarContent justify="end">` 内，`ThemeSwitch` 之前添加：
```tsx
<Navbar.NavbarItem>
  <CreditBadge />
</Navbar.NavbarItem>
```

- [ ] **Step 3: 手动验证**

运行 `pnpm dev`，确认 Navbar 右侧显示 `🪙 10`（首次访问），刷新后不变，次日变为 `🪙 15`。

- [ ] **Step 4: Commit**

```bash
git add src/lib/components/CreditBadge.tsx src/lib/components/Navbar.tsx
git commit -m "feat: CreditBadge in Navbar with daily refill animation"
```

---

## Task 5: 卫星线索按钮 + 地图浮层

**Files:**
- Modify: `src/lib/components/game/GameBar.tsx`
- Modify: `src/lib/components/game/Game.tsx`

### 5a: GameBar — 卫星线索按钮

- [ ] **Step 1: 定义 SatelliteHint props 并引入 credits**

在 `GameBar.tsx` 顶部 import 区域添加：

```ts
import { deductCredit, getBalance } from '@/lib/utils/credits';
import { Satellite } from 'lucide-react';
```

- [ ] **Step 2: 在 GameBar props 中新增 onSatelliteHint 回调**

找到 `const GameBar = (props: InfoState & { gameState: GameState; mapDisplayMode: MapDisplayMode; })` 的 props 类型，修改为：

```tsx
const GameBar = (
  props: InfoState & {
    gameState: GameState;
    mapDisplayMode: MapDisplayMode;
    onSatelliteHint: (lat: number, lng: number, zoom: number) => void;
  }
) => {
```

- [ ] **Step 3: 在 GameBar 内添加积分状态 + 按钮逻辑**

在 `const { gameState, info, mapDisplayMode, setInfo } = props;` 之后添加：

```tsx
const [creditBalance, setCreditBalance] = useState(() => getBalance());
const [hintUsedThisTurn, setHintUsedThisTurn] = useState(false);

// Reset hint flag when question changes
useEffect(() => {
  setHintUsedThisTurn(false);
}, [gameState.toMark]);

const handleSatelliteHint = () => {
  if (!gameState.toMark || hintUsedThisTurn) return;
  const ok = deductCredit();
  if (!ok) {
    addToast({
      color: 'warning',
      title: '今日卫星线索已用完',
      description: '明天自动补充 5 次，或购买积分包'
    });
    return;
  }
  setCreditBalance((b) => b - 1);
  setHintUsedThisTurn(true);

  // Compute zoom from strictness
  const { strictness, mode } = gameState;
  let zoom = 9;
  if (mode === 'world') {
    zoom = strictness <= 300000 ? 7 : 5;
  } else {
    zoom = strictness <= 50000 ? 12 : strictness <= 150000 ? 9 : 6;
  }

  props.onSatelliteHint(
    gameState.toMark.latitude,
    gameState.toMark.longitude,
    zoom
  );
};
```

- [ ] **Step 4: 渲染卫星线索按钮**

在 GameBar 返回的 JSX 中，在 Submit 按钮旁添加（仅当 `gameState.status === 'running'` 时显示）：

```tsx
{gameState.status === 'running' && !gameState.toMark === false && (
  <Button
    size="sm"
    variant="flat"
    color="default"
    isDisabled={hintUsedThisTurn || creditBalance <= 0}
    onPress={handleSatelliteHint}
    startContent={<Satellite className="size-3.5" />}
    className="gap-1 text-xs"
  >
    卫星线索 · 🪙1
  </Button>
)}
```

### 5b: Game.tsx — 卫星图浮层

- [ ] **Step 5: 在 Game.tsx 添加卫星图 URL state**

在 `Game.tsx` 顶部现有的 `useState` 声明区域添加：

```tsx
const [satelliteHintUrl, setSatelliteHintUrl] = useState<string | null>(null);
```

- [ ] **Step 6: 实现 handleSatelliteHint 回调**

在 Game.tsx 中（在 `handleCountryRegionSelection` 之后）添加：

```tsx
const handleSatelliteHint = useCallback(
  (lat: number, lng: number, zoom: number) => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
    if (!token) return;
    const url = `https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/${lng},${lat},${zoom}/400x300@2x?access_token=${token}`;
    setSatelliteHintUrl(url);
  },
  []
);
```

- [ ] **Step 7: 当题目变化时清除卫星图**

在 Game.tsx 中现有的 effect 区域添加：

```tsx
useEffect(() => {
  setSatelliteHintUrl(null);
}, [props.gameState.toMark]);
```

- [ ] **Step 8: 渲染卫星图浮层**

在 Game.tsx 的 return JSX 中，在 `<_Map>` 标签内部末尾（`</Source>` 后，`</_Map>` 前）添加：

```tsx
{satelliteHintUrl && (
  <div className="absolute bottom-16 right-4 z-10 overflow-hidden rounded-xl border border-white/20 shadow-2xl">
    <div className="relative">
      <img
        src={satelliteHintUrl}
        width={200}
        height={150}
        alt="Satellite hint"
        className="block"
      />
      <button
        onClick={() => setSatelliteHintUrl(null)}
        className="absolute right-1.5 top-1.5 flex size-5 items-center justify-center rounded-full bg-black/50 text-[10px] text-white hover:bg-black/70"
      >
        ✕
      </button>
      <div className="absolute bottom-0 left-0 right-0 bg-black/40 px-2 py-1 text-[9px] text-white/70">
        © Mapbox · 卫星线索（无地名）
      </div>
    </div>
  </div>
)}
```

- [ ] **Step 9: 将 onSatelliteHint 和 handleSatelliteHint 传给 GameBar**

在 Game.tsx 中找到 `<GameBar` 的 JSX，添加 prop：

```tsx
<GameBar
  {/* ...existing props... */}
  onSatelliteHint={handleSatelliteHint}
/>
```

- [ ] **Step 10: Type check**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors.

- [ ] **Step 11: 手动验证**

1. 运行 `pnpm dev`
2. 开始一局游戏，确认 GameBar 出现「卫星线索 · 🪙1」按钮
3. 点击按钮，确认地图右下角出现卫星图浮层（需配置 `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN`）
4. 无 token 时按钮应仍显示，点击后静默不显示浮层（`handleSatelliteHint` 内 `if (!token) return`）
5. 题目变化后，浮层自动消失
6. Navbar 积分减少 1

- [ ] **Step 12: Commit**

```bash
git add src/lib/components/game/GameBar.tsx src/lib/components/game/Game.tsx
git commit -m "feat: satellite hint button with credit deduction and map overlay"
```

---

## 自检清单

- [x] **Spec coverage**
  - 3D 地球仪 → Task 1
  - 大气雾效 → Task 1
  - 飞行动画增强 → Task 2
  - 积分系统 → Task 3
  - CreditBadge → Task 4
  - 卫星线索按钮 → Task 5
  - 无 token graceful fallback → Task 5 Step 6（`if (!token) return`）

- [x] **Placeholder scan** — 所有步骤含完整代码，无 TBD

- [x] **Type consistency**
  - `deductCredit(): boolean` — 定义于 Task 3，使用于 Task 5
  - `getBalance(): number` — 定义于 Task 3，使用于 Tasks 4, 5
  - `maybeRefill(): number` — 定义于 Task 3，使用于 Task 4
  - `onSatelliteHint(lat, lng, zoom)` — 定义于 Task 5b Step 6，引用于 Task 5a Step 2

---

## 实施顺序说明

Tasks 1–2 互相独立，可并行。Task 3 必须在 Tasks 4、5 之前完成。Task 4 和 Task 5 依赖 Task 3，但彼此独立。
