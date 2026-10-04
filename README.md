# Outside the Sanctuary

静态 HTML/CSS/JavaScript 游戏项目，包含战斗 HUD、自动战斗、升级与属性分配，以及职业 Wiki。

远程仓库：[leapingfish1ee-coder/Outside-the-Sanctuary](https://github.com/leapingfish1ee-coder/Outside-the-Sanctuary)。

## 本地启动

使用 Node.js 24，与现有 GitHub Actions 环境一致。已安装 nvm 时可执行 `nvm install` 和 `nvm use`。

项目没有第三方运行依赖，无需安装框架、数据库或配置密钥。

```sh
npm ci
npm run dev
```

打开 <http://127.0.0.1:5173/>；职业 Wiki 位于 <http://127.0.0.1:5173/wiki.html>。`npm start` 使用同一本地服务。修改页面或游戏脚本后刷新浏览器即可生效。

端口被占用时，可执行 `PORT=5174 npm run dev`。服务仅监听本机回环地址，仅提供页面、游戏脚本与品牌样式；新增资源时同步更新 `scripts/serve.mjs` 中的路由。

## 验证

```sh
npm test
```

现有测试覆盖自动技能、敌人攻击、死亡复活、经验升级和属性点消费。

## 项目结构

| 路径 | 用途 |
| --- | --- |
| `index.html` | 游戏 HUD 与样式 |
| `game.js` | 战斗和角色状态逻辑 |
| `wiki.html` | 职业资料 |
| `game.test.js` | 游戏逻辑测试 |
| `scripts/serve.mjs` | 无第三方依赖的本地 HTTP 服务 |
| `styles/` | 共享品牌变量与 HUD、Wiki 排版 |
| `docs/BrandDesignGuideline.md` | 品牌语言与现行视觉参数 |
| `AGENTS.md` | 仓库协作规则 |
| `docs/GRAPHIC_DESIGN_GUIDELINE.md` | 视觉规范 |
| `.agents/skills/` | 项目设计技能与上游来源 |
| `.github/workflows/deploy-pages.yml` | 测试与 GitHub Pages 部署 |

修改界面前阅读 `AGENTS.md` 和视觉规范，沿用现有静态页面结构、宋体/黑体分工及黑白细线视觉语言。

## 发布

现有工作流在推送至 `main` 或手动触发时先运行测试，再构建并发布 GitHub Pages。仓库的 Pages 来源需要设置为 GitHub Actions。本地服务用于开发；线上页面由 GitHub Pages 直接托管，线上无需运行 Node.js 服务；`npm run build` 将公开页面与样式输出到 `dist/`。
