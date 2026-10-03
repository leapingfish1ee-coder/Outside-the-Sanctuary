---
name: outside-sanctuary-design
description: Design, implement, or review Outside the Sanctuary UI, HUD, Wiki, graphic assets, interaction, motion, and responsive behavior while preserving the project's minimal black-white Songti visual system.
---

# Outside the Sanctuary Design Skill

## Trigger

当任务涉及以下任一内容时使用本 Skill：
- index.html 游戏 HUD。
- wiki.html Wiki。
- 新页面、信息面板、技能栏、敌人状态、属性、角色信息。
- 平面视觉、图标、配色、排版、响应式。
- UI Review、动效、交互反馈、移动端适配。
- 多方案视觉探索。

## Source of Truth

开始前必须读取：
1. AGENTS.md。
2. docs/GRAPHIC_DESIGN_GUIDELINE.md。
3. 受影响页面的完整 HTML/CSS。

本 Skill 的方法参考 emilkowalski/skills，但项目视觉事实以本仓库 Guideline 为最高设计依据。

## Operating Posture

把界面视为“印刷式游戏信息系统”，而不是通用 Web 产品；每一个新增元素都必须能解释其信息角色、视觉轴、层级和交互目的。

优先减少，而不是增加装饰；优先通过空白、对齐、字体、灰度、细线建立层级；颜色只承担属性、血量和状态语义。

## Workflow

### 1. Recon

先回答：
- 元素属于左侧角色轴、中间战斗轴还是右侧系统轴。
- 它与现有哪个组件同组。
- 它使用宋体还是黑体。
- 它需要主黑、次灰还是六属性语义色。
- 它是否真的需要背景框、阴影、圆角或动画。

无法解释的装饰默认不加。

### 2. Composition

桌面默认保持：
- 左：标题、角色身份、属性。
- 中上：敌人。
- 中下：技能。
- 右上：系统入口。
- 中央主体区域尽量留白。

新增 UI 不得破坏这四个锚点的可读性。

### 3. Visual Construction

默认规则：
- 背景 #fff。
- 主文本/主线 #111。
- 次信息 #777–#999。
- 结构线 1px。
- 圆角默认 0。
- 宋体用于核心世界观信息。
- 黑体用于标签和元数据。
- 六属性色只做局部语义。
- 阴影只在需要从白场中分离可操作控件组时轻量使用。

### 4. Interaction

任何可点击控件至少具备：
- 可见 focus-visible。
- active 反馈。
- 触摸可操作。
- hover 不是唯一反馈。

高频操作不加过度动画。

### 5. Motion Gate

加入动画前依次判断：
1. 用户会多频繁看到它。
2. 动画目的是否是反馈、状态、空间连续性或防止突变。
3. 是否可用 CSS transition 完成。
4. 是否能只动画 transform / opacity。
5. 是否在 300ms 内。
6. 是否已处理 reduced motion。

禁止：
- transition: all。
- ease-in 式迟缓进入。
- scale(0) 入场。
- 为“更酷”而动画 HUD 高频行为。
- 无 reduced-motion 的明显位移动画。

### 6. Stress Test

至少推演：
- 320px。
- 200% 缩放。
- 20+ 字角色名/职业名。
- 五位以上属性值。
- 空数据。
- 1 个项目。
- 超出当前数量的敌人/技能。
- 中文、拉丁字符、emoji。

若布局在真实极端数据下会断裂，先报告再决定截断、换行或重排。

### 7. Prototype

用户要求多个方向时：
- 默认 3 个。
- 每个必须在布局、密度、互动或性格上真正不同。
- 放到独立 prototype 页面，不直接覆盖生产 UI。
- 选定后再合入并清理原型。

## Review Format

视觉 Review 必须使用：

| Before | After | Why |
| --- | --- | --- |
| 当前状态 | 建议状态 | 与项目 Guideline 或交互原则的关系 |

按影响排序，不为凑数量制造问题。

## Completion

完成 UI 任务前确认：
- 视觉轴不乱。
- 字体角色正确。
- 没有无必要卡片化。
- 没有第三方游戏资产复刻。
- 桌面与移动布局可达。
- 长文本和大数值可承受。
- 动画性能和 reduced motion 合格。
- 部署状态正常。
