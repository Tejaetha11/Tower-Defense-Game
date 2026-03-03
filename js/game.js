const canvas = document.getElementById("game");
const c = canvas.getContext("2d");

const world = { w: 4864, h: 2560 };

const enemies        = [];
const upgradePanel   = new UpgradePanel();
const hud            = new HUD();
const abilityManager      = new AbilityManager();
const abilityEffectManager = new AbilityEffectManager();

let mouseWorld = { x: 0, y: 0 };

const dpr      = window.devicePixelRatio || 1;
const mapRatio = world.h / world.w;

window.addEventListener("load", () => {

  const cssW = canvas.offsetWidth;
  const cssH = cssW * mapRatio;

  canvas.style.height = cssH + "px";
  canvas.width        = cssW * dpr;
  canvas.height       = cssH * dpr;

  const scale   = cssW / world.w;
  const offsetX = 0;
  const offsetY = 0;

  upgradePanel.canvasCSSW = cssW;
  upgradePanel.canvasCSSH = cssH;

  const towerManager = new TowerManager();
  towerManager.load(() => console.log("Towers loaded!"));

  const projectileManager = new ProjectileManager();
  projectileManager.load(() => console.log("Projectiles loaded!"));

  const towerWheel = new TowerWheel();
  towerWheel.load(() => console.log("Wheel loaded!"));

  abilityManager.load(() => console.log("Abilities loaded!"));
  abilityEffectManager.load(() => console.log("Ability effects loaded!"));

  towerManager.projectileManager = projectileManager;

  canvas.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseWorld.x = (e.clientX - rect.left) / scale;
    mouseWorld.y = (e.clientY - rect.top)  / scale;
    towerWheel.updateHoverScreen(mouseWorld.x * scale, mouseWorld.y * scale, scale);
    abilityManager.updateHover(e.clientX - rect.left, e.clientY - rect.top, cssW, cssH);
  });

  canvas.addEventListener("click", (e) => {
    const rect = canvas.getBoundingClientRect();
    const wx   = (e.clientX - rect.left) / scale;
    const wy   = (e.clientY - rect.top)  / scale;

    const sClickX = wx * scale;
    const sClickY = wy * scale;
    const cssClickX = e.clientX - rect.left;
    const cssClickY = e.clientY - rect.top;

    // ── Ability card click ──────────────────────────
    const cardResult = abilityManager.handleClick(cssClickX, cssClickY, cssW, cssH);
    if (cardResult) return; // clicked a card (selected or deselected)

    // ── Ability map activation ──────────────────────
    if (abilityManager.selected) {
      const activated = abilityManager.activateAt(wx, wy, hud.coins);
      if (activated) {
        hud.coins -= activated.cost;
        abilityEffectManager.spawn(activated.id, wx, wy, enemies);
      }
      return;
    }

    if (upgradePanel.visible) {
      const handled = upgradePanel.handleClick(sClickX, sClickY, towerManager, null, scale);
      if (handled) return;
    }

    if (!towerWheel.visible && mapRenderer_ref) {
      const clickedTower = towerManager.getTowerAt(wx, wy);
      if (clickedTower) {
        if (upgradePanel.visible && upgradePanel.selectedTower === clickedTower) {
          upgradePanel.hide();
        } else {
          upgradePanel.show(clickedTower);
        }
        return;
      }
    }

    if (towerWheel.visible) {
      upgradePanel.hide();
      const selected = towerWheel.handleClickScreen(sClickX, sClickY, scale);
      if (selected && mapRenderer_ref) {
        towerManager.place(
          towerWheel.tileCol * mapRenderer_ref.tileSize + mapRenderer_ref.tileSize / 2,
          towerWheel.tileRow * mapRenderer_ref.tileSize + mapRenderer_ref.tileSize / 2,
          mapRenderer_ref,
          selected
        );
      }
    } else {
      if (mapRenderer_ref && mapRenderer_ref.isPlaceable(wx, wy)) {
        const TILE     = mapRenderer_ref.tileSize;
        const col      = Math.floor(wx / TILE);
        const row      = Math.floor(wy / TILE);
        const occupied = towerManager.towers.some(t => t.col === col && t.row === row);
        if (!occupied) {
          upgradePanel.hide();
          towerWheel.show(col, row, TILE);
        }
      }
    }
  });

  let mapRenderer_ref = null;

  loadEnemyImages(() => console.log("Enemy images loaded!"));

  fetch("./map.json")
    .then(r => r.json())
    .then(mapData => {
      const mapRenderer = new MapRenderer(mapData, "map1");
      mapRenderer_ref   = mapRenderer;
      mapRenderer.load("./", () => startGame(mapRenderer));
    })
    .catch(err => console.error("Failed to load map.json:", err));

  function startGame(mapRenderer) {

    const maxPerPath = 3;
    const spawnDelay = 2.0;
    const pathOffset = 0.7;
    let spawnQ = [];
    for (let i = 0; i < maxPerPath; i++) {
      spawnQ.push({ time: i * spawnDelay + pathOffset * 0, path: 1 });
      spawnQ.push({ time: i * spawnDelay + pathOffset * 1, path: 2 });
      spawnQ.push({ time: i * spawnDelay + pathOffset * 2, path: 3 });
    }
    let elapsed  = 0;
    let lastTime = null;

    function drawDebugWaypoints(waypoints, color) {
      c.beginPath();
      c.moveTo(waypoints[0].x, waypoints[0].y);
      for (let i = 1; i < waypoints.length; i++) c.lineTo(waypoints[i].x, waypoints[i].y);
      c.strokeStyle = color;
      c.lineWidth   = 10;
      c.stroke();

      waypoints.forEach((wp, i) => {
        c.beginPath();
        c.arc(wp.x, wp.y, 40, 0, Math.PI * 2);
        c.fillStyle = color; c.fill();
        c.strokeStyle = "black"; c.lineWidth = 6; c.stroke();
        c.fillStyle = "black";
        c.font = "bold 60px Arial";
        c.textAlign = "center"; c.textBaseline = "middle";
        c.fillText(i, wp.x, wp.y);
      });
    }

    function gameLoop(timestamp) {
      if (!lastTime) lastTime = timestamp;
      const dt = (timestamp - lastTime) / 1000;
      lastTime  = timestamp;

      c.setTransform(1, 0, 0, 1, 0, 0);
      c.clearRect(0, 0, canvas.width, canvas.height);

      c.setTransform(dpr * scale, 0, 0, dpr * scale, dpr * offsetX, dpr * offsetY);

      mapRenderer.draw(c);

      towerManager.update(dt, enemies);
      projectileManager.update(dt);
      towerWheel.update(dt);
      upgradePanel.update(dt);
      hud.update(dt);
      abilityManager.update(dt);
      abilityEffectManager.update(dt);
      updateEnemyDmgNumbers(dt);

      towerManager.draw(c);
      projectileManager.draw(c);
      abilityEffectManager.drawScorch(c);  // scorch under enemies

      if (!towerWheel.visible) {
        mapRenderer.drawHover(c, mouseWorld.x, mouseWorld.y);
      }

      // // ── Debug waypoints ───────────────────────────────
      // drawDebugWaypoints(path1Waypoints, "rgba(255,255,0,0.8)");
      // drawDebugWaypoints(path2Waypoints, "rgba(0,255,255,0.8)");
      // drawDebugWaypoints(path3Waypoints, "rgba(255,0,255,0.8)");

      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      towerWheel.drawScreen(c, scale);
      hud.draw(c, cssW, cssH);
      abilityManager.draw(c, cssW, cssH);

      if (upgradePanel.visible && upgradePanel.selectedTower) {
        upgradePanel.draw(c, upgradePanel.selectedTower, scale, dpr);
      }

      c.setTransform(dpr * scale, 0, 0, dpr * scale, dpr * offsetX, dpr * offsetY);

      elapsed += dt;
      while (spawnQ.length > 0 && elapsed >= spawnQ[0].time) {
        const s = spawnQ.shift();
        if (s.path === 1) enemies.push(new Enemy(path1Waypoints));
        if (s.path === 2) enemies.push(new Enemy(path2Waypoints));
        if (s.path === 3) enemies.push(new Enemy(path3Waypoints));
      }

      for (let i = enemies.length - 1; i >= 0; i--) {
        enemies[i].update(dt);
        enemies[i].draw(c);

        // Award coins and score as soon as enemy starts dying
        if (enemies[i].dying && !enemies[i]._coinAwarded) {
          enemies[i]._coinAwarded = true;
          hud.coins += 50;
          hud.score += 50;
        }

        if (!enemies[i].alive) {
          if (enemies[i].x > world.w) {
            hud.lives = Math.max(0, hud.lives - 1);
          }
          enemies.splice(i, 1);
        }
      }

      abilityEffectManager.drawEffects(c); // explosion + damage numbers on top
      drawEnemyDmgNumbers(c);              // arrow hits + poison ticks

      requestAnimationFrame(gameLoop);
    }

    requestAnimationFrame(gameLoop);
  }

});