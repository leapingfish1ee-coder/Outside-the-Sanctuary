(function () {
  "use strict";

  const CONFIG = {
    playerMaxHp: 180,
    enemyAttackInterval: 2200,
    respawnDelay: 10000,
    nextWaveDelay: 1800,
    xpBase: 60
  };

  const skillTemplates = [
    { name: "斩击", damage: 24, cooldown: 1800 },
    { name: "穿刺", damage: 38, cooldown: 4200 },
    { name: "星火", damage: 58, cooldown: 7200 }
  ];
  const enemyNames = ["荒原饿狼", "失乡盗匪", "腐化树灵", "雾中信徒", "遗迹守卫"];
  const statNames = ["力量", "敏捷", "智力", "意志", "灵知", "信仰"];
  const state = {
    player: { hp: CONFIG.playerMaxHp, maxHp: CONFIG.playerMaxHp, level: 1, xp: 0, xpNext: CONFIG.xpBase, points: 0, alive: true },
    stats: Object.fromEntries(statNames.map(name => [name, 1])),
    enemies: [], wave: 1, skills: skillTemplates.map(skill => ({ ...skill, readyAt: 0 })),
    respawnAt: 0, nextWaveAt: 0, lastEnemyAttack: 0
  };

  const $ = id => document.getElementById(id);
  const clampPercent = (value, max) => `${Math.max(0, Math.min(100, value / max * 100))}%`;

  function createWave() {
    const count = Math.min(3 + Math.floor((state.wave - 1) / 3), 5);
    state.enemies = Array.from({ length: count }, (_, index) => {
      const maxHp = 72 + state.wave * 12 + index * 9;
      return { id: `${state.wave}-${index}`, name: enemyNames[(state.wave + index - 1) % enemyNames.length], hp: maxHp, maxHp, damage: 7 + state.wave * 2 + index, xp: 18 + state.wave * 3, alive: true };
    });
    state.nextWaveAt = 0;
    addLog(`第 ${state.wave} 波敌人进入战场。`);
    renderEnemies();
  }

  function randomLivingEnemy() {
    const living = state.enemies.filter(enemy => enemy.alive);
    return living.length ? living[Math.floor(Math.random() * living.length)] : null;
  }

  function useSkill(skill, now) {
    const target = randomLivingEnemy();
    if (!target || now < skill.readyAt || !state.player.alive) return;
    target.hp = Math.max(0, target.hp - skill.damage);
    skill.readyAt = now + skill.cooldown;
    addLog(`${skill.name}命中${target.name}，造成 ${skill.damage} 点伤害。`);
    if (target.hp === 0) killEnemy(target);
  }

  function killEnemy(enemy) {
    enemy.alive = false;
    addLog(`${enemy.name}倒下，获得 ${enemy.xp} 经验。`, "good");
    grantExperience(enemy.xp);
    if (!state.enemies.some(item => item.alive)) {
      state.nextWaveAt = performance.now() + CONFIG.nextWaveDelay;
      addLog("战场已肃清，正在寻找下一批敌人。", "good");
    }
  }

  function grantExperience(amount) {
    state.player.xp += amount;
    while (state.player.xp >= state.player.xpNext) {
      state.player.xp -= state.player.xpNext;
      state.player.level += 1;
      state.player.points += 1;
      state.player.xpNext = Math.round(CONFIG.xpBase * Math.pow(1.28, state.player.level - 1));
      addLog(`升至 ${state.player.level} 级，获得 1 点自由属性。`, "good");
    }
  }

  function enemiesAttack(now) {
    if (!state.player.alive || now - state.lastEnemyAttack < CONFIG.enemyAttackInterval) return;
    state.lastEnemyAttack = now;
    state.enemies.filter(enemy => enemy.alive).forEach(enemy => {
      if (!state.player.alive) return;
      state.player.hp = Math.max(0, state.player.hp - enemy.damage);
      addLog(`${enemy.name}攻击你，造成 ${enemy.damage} 点伤害。`, "bad");
      if (state.player.hp === 0) playerDies(now);
    });
  }

  function playerDies(now) {
    state.player.alive = false;
    state.respawnAt = now + CONFIG.respawnDelay;
    addLog("你已倒下，10 秒后将在新的战场苏醒。", "bad");
  }

  function respawn() {
    state.player.alive = true;
    state.player.hp = state.player.maxHp;
    state.respawnAt = 0;
    state.wave += 1;
    state.skills.forEach(skill => { skill.readyAt = 0; });
    state.lastEnemyAttack = performance.now();
    createWave();
    addLog("你已复活，战场已刷新。", "good");
  }

  function spendPoint(name) {
    if (state.player.points < 1) return;
    state.player.points -= 1;
    state.stats[name] += 1;
    renderStats();
    renderPlayer(performance.now());
  }

  function addLog(message, type = "") {
    const node = document.createElement("div");
    node.className = `entry ${type}`;
    const time = new Date().toLocaleTimeString("zh-CN", { hour12: false });
    node.innerHTML = `<time>${time}</time>${message}`;
    $("log").prepend(node);
    while ($("log").children.length > 12) $("log").lastElementChild.remove();
  }

  function renderEnemies() {
    $("enemies").innerHTML = state.enemies.map(enemy => `
      <article class="enemy ${enemy.alive ? "" : "dead"}" data-enemy-id="${enemy.id}">
        <div class="enemy-meta"><span class="enemy-name">${enemy.name}</span><span class="enemy-status">${enemy.alive ? `${enemy.hp} / ${enemy.maxHp}` : "已击败"}</span></div>
        <div class="bar"><div class="fill hp-fill" style="width:${clampPercent(enemy.hp, enemy.maxHp)}"></div></div>
        <div class="enemy-hit">攻击力 ${enemy.damage} · 击败经验 ${enemy.xp}</div>
      </article>`).join("");
  }

  function renderPlayer(now) {
    $("level").textContent = state.player.level;
    $("points").textContent = state.player.points;
    $("player-hp-fill").style.width = clampPercent(state.player.hp, state.player.maxHp);
    $("player-hp-text").textContent = `${state.player.hp} / ${state.player.maxHp}`;
    $("xp-fill").style.width = clampPercent(state.player.xp, state.player.xpNext);
    $("xp-text").textContent = `${state.player.xp} / ${state.player.xpNext}`;
    $("wave").textContent = state.wave;
    const status = $("player-state");
    status.classList.toggle("dead", !state.player.alive);
    status.textContent = state.player.alive ? "自动战斗中" : `${Math.max(0, Math.ceil((state.respawnAt - now) / 1000))} 秒后复活`;
    document.querySelectorAll(".add").forEach(button => { button.disabled = state.player.points < 1; });
  }

  function renderStats() {
    $("stats-list").innerHTML = statNames.map(name => `<div class="stat"><span>${name}</span><b class="stat-value">${state.stats[name]}</b><button class="add" data-stat="${name}" aria-label="增加${name}" ${state.player.points ? "" : "disabled"}>+</button></div>`).join("");
  }

  function renderSkills(now) {
    $("skills").innerHTML = state.skills.map(skill => {
      const remaining = Math.max(0, skill.readyAt - now);
      const ratio = remaining / skill.cooldown * 100;
      return `<div class="skill"><div class="cooldown" style="height:${ratio}%"></div><span class="skill-name">${skill.name}</span><div class="skill-detail">伤害 ${skill.damage} · ${(skill.cooldown / 1000).toFixed(1)} 秒</div><span class="cd-text">${remaining ? (remaining / 1000).toFixed(1) : "就绪"}</span></div>`;
    }).join("");
  }

  function tick(now) {
    if (state.player.alive) {
      state.skills.forEach(skill => useSkill(skill, now));
      enemiesAttack(now);
      if (state.nextWaveAt && now >= state.nextWaveAt) { state.wave += 1; createWave(); }
    } else if (now >= state.respawnAt) respawn();
    renderPlayer(now);
    renderEnemies();
    renderSkills(now);
    requestAnimationFrame(tick);
  }

  $("stats-list").addEventListener("click", event => {
    const button = event.target.closest("[data-stat]");
    if (button) spendPoint(button.dataset.stat);
  });
  renderStats();
  createWave();
  state.lastEnemyAttack = performance.now();
  requestAnimationFrame(tick);
  window.__gameState = state;
}());
