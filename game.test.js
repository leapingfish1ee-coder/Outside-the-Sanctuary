const { readFileSync } = require("node:fs");
const { test } = require("node:test");
const assert = require("node:assert/strict");
const vm = require("node:vm");

class FakeElement {
  constructor() {
    this.children = [];
    this.className = "";
    this.innerHTML = "";
    this.style = {};
    this.textContent = "";
    this.dataset = {};
    this.hidden = false;
    this.disabled = false;
    this.listeners = {};
    this.classList = { toggle() {} };
  }

  addEventListener(type, listener) {
    this.listeners[type] = listener;
  }

  prepend(child) {
    this.children.unshift(child);
  }

  get lastElementChild() {
    const children = this.children;
    const child = children.at(-1);
    if (child) child.remove = () => children.pop();
    return child;
  }
}

function loadGame() {
  const elements = new Map();
  const pointButtons = [1, 5, 10, 50, 100].map(amount => {
    const button = new FakeElement();
    button.dataset = { stat: "力量", amount: String(amount) };
    return button;
  });
  const document = {
    createElement: () => new FakeElement(),
    getElementById(id) {
      if (!elements.has(id)) elements.set(id, new FakeElement());
      return elements.get(id);
    },
    querySelectorAll: selector => selector === "[data-stat][data-amount]" ? pointButtons : []
  };
  let nextFrame;
  const context = {
    console,
    Date,
    Intl,
    document,
    performance: { now: () => 0 },
    requestAnimationFrame(callback) { nextFrame = callback; },
    window: {},
    Math: Object.create(Math)
  };
  context.Math.random = () => 0;
  vm.runInNewContext(readFileSync("game.js", "utf8"), context);

  return {
    state: context.window.__gameState,
    pointButtons,
    clickPoint(amount) {
      const button = pointButtons.find(item => Number(item.dataset.amount) === amount);
      elements.get("attributes").listeners.click({ target: { closest: () => button } });
    },
    frame(now) {
      const callback = nextFrame;
      nextFrame = undefined;
      callback(now);
      assert.equal(typeof nextFrame, "function", "游戏循环应继续请求下一帧");
    }
  };
}

test("技能会自动攻击随机存活目标并分别进入冷却", () => {
  const game = loadGame();
  game.frame(1);

  assert.equal(game.state.enemies[0].alive, false);
  assert.deepEqual(
    Array.from(game.state.skills, skill => skill.readyAt),
    [1801, 4201, 7201]
  );
  assert.equal(game.state.player.xp, 21);
});

test("存活敌人会按固定间隔攻击玩家", () => {
  const game = loadGame();
  game.frame(1);
  const hpBeforeAttack = game.state.player.hp;

  game.frame(2200);

  const expectedDamage = game.state.enemies
    .filter(enemy => enemy.alive)
    .reduce((total, enemy) => total + enemy.damage, 0);
  assert.equal(game.state.player.hp, hpBeforeAttack - expectedDamage);
});

test("玩家死亡十秒后满血复活并刷新战场", () => {
  const game = loadGame();
  game.state.skills.forEach(skill => { skill.readyAt = Number.POSITIVE_INFINITY; });
  game.state.player.hp = 1;
  const originalWave = game.state.wave;

  game.frame(2200);
  assert.equal(game.state.player.alive, false);
  assert.equal(game.state.respawnAt, 12200);

  game.frame(12199);
  assert.equal(game.state.player.alive, false);

  game.frame(12200);
  assert.equal(game.state.player.alive, true);
  assert.equal(game.state.player.hp, game.state.player.maxHp);
  assert.equal(game.state.wave, originalWave + 1);
  assert.ok(game.state.enemies.every(enemy => enemy.alive));
});

test("经验达到需求时升级并获得一个自由属性点", () => {
  const game = loadGame();
  game.state.enemies[0].hp = 1;
  game.state.enemies[0].xp = game.state.player.xpNext;
  game.state.skills.slice(1).forEach(skill => { skill.readyAt = Number.POSITIVE_INFINITY; });

  game.frame(1);

  assert.equal(game.state.player.level, 2);
  assert.equal(game.state.player.points, 1);
  assert.equal(game.state.player.xp, 0);
});

test("加点按钮按自由点数阈值出现并按面额消费", () => {
  const game = loadGame();

  assert.ok(game.pointButtons.every(button => button.hidden));

  game.state.player.points = 4;
  game.state.enemies[0].hp = 1;
  game.state.enemies[0].xp = game.state.player.xpNext;
  game.state.skills.slice(1).forEach(skill => { skill.readyAt = Number.POSITIVE_INFINITY; });
  game.frame(1);

  assert.equal(game.state.player.points, 5);
  assert.deepEqual(
    game.pointButtons.filter(button => !button.hidden).map(button => Number(button.dataset.amount)),
    [1, 5]
  );

  game.clickPoint(5);

  assert.equal(game.state.player.points, 0);
  assert.equal(game.state.stats["力量"], 6);
  assert.ok(game.pointButtons.every(button => button.hidden));
});
