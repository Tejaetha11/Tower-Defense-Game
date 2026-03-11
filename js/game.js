// ═══════════════════════════════════════════════════════════════
// DEBUG — draws all enemy paths as coloured lines with waypoint dots
// Call _debugDrawPaths(ctx, pathsArray) from the game loop.
// Remove or comment out when done testing.
// ═══════════════════════════════════════════════════════════════
const _DEBUG_PATH_COLORS = [
  '#ff3333', // path 1 — red
  '#33aaff', // path 2 — blue
  '#33ff66', // path 3 — green
  '#ffcc00', // path 4 — yellow
  '#ff66ff', // path 5 — pink
  '#ff8800', // path 6 — orange
];

function _debugDrawPaths(ctx, paths) {
  ctx.save();
  paths.forEach((waypoints, pi) => {
    const color = _DEBUG_PATH_COLORS[pi % _DEBUG_PATH_COLORS.length];

    // — Line —
    ctx.beginPath();
    waypoints.forEach((pt, i) => {
      i === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y);
    });
    ctx.strokeStyle = color;
    ctx.lineWidth   = 12;
    ctx.globalAlpha = 0.45;
    ctx.stroke();

    // — Outline so it shows on any background —
    ctx.beginPath();
    waypoints.forEach((pt, i) => {
      i === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y);
    });
    ctx.strokeStyle = 'rgba(0,0,0,0.5)';
    ctx.lineWidth   = 16;
    ctx.globalAlpha = 0.25;
    ctx.stroke();

    ctx.globalAlpha = 1;

    // — Waypoint dots + index labels —
    waypoints.forEach((pt, i) => {
      // Dot
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 18, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = '#000';
      ctx.lineWidth   = 3;
      ctx.stroke();

      // Index number
      ctx.font         = 'bold 20px Arial';
      ctx.fillStyle    = '#000';
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(i, pt.x, pt.y);
    });

    // — Path label at first visible waypoint —
    const labelPt = waypoints.find(p => p.x >= 0 && p.y >= 0) || waypoints[0];
    ctx.font         = 'bold 36px Arial';
    ctx.fillStyle    = '#000';
    ctx.textAlign    = 'left';
    ctx.textBaseline = 'bottom';
    ctx.fillText('P' + (pi + 1), labelPt.x + 24, labelPt.y - 8);
    ctx.fillStyle = color;
    ctx.fillText('P' + (pi + 1), labelPt.x + 22, labelPt.y - 10);
  });
  ctx.restore();
}
// ═══════════════════════════════════════════════════════════════

const canvas = document.getElementById("game");
const c = canvas.getContext("2d");

const world = { w: 4864, h: 2560 };

const enemies        = [];
const upgradePanel   = new UpgradePanel();
const hud            = new HUD();
const abilityManager      = new AbilityManager();
const abilityEffectManager = new AbilityEffectManager();

let mouseWorld = { x: 0, y: 0 };
let isPaused   = false;

// Blurred background snapshot for EndScreen overlay
function _snapBackground(canvas, dpr) {
  const snap = document.createElement('canvas');
  snap.width  = canvas.width;
  snap.height = canvas.height;
  snap.getContext('2d').drawImage(canvas, 0, 0);
  EndScreen._bgSnapshot = snap;
  EndScreen._bgDpr      = dpr;
}

const dpr      = window.devicePixelRatio || 1;
const mapRatio = world.h / world.w;

// Preload everything while UI is visible
let _mapRenderer_preloaded = null;

window.addEventListener("load", () => {
  const cssW = 1280;
  const cssH = Math.round(cssW * mapRatio);
  canvas.style.width  = cssW + "px";
  canvas.style.height = cssH + "px";
  canvas.width        = cssW * dpr;
  canvas.height       = cssH * dpr;
  const uiLayer = document.getElementById('ui-layer');
  if (uiLayer) uiLayer.style.height = cssH + "px";

  // Preload map silently in background
  fetch("./map.json")
    .then(r => r.json())
    .then(mapData => {
      const mapRenderer = new MapRenderer(mapData, "map1");
      mapRenderer.load("./", () => {
        _mapRenderer_preloaded = mapRenderer;
        console.log("Map preloaded!");
      });
    })
    .catch(err => console.error("Failed to preload map:", err));
});

window._startGame = function(levelNum, onReady) {

  // ── Clear global stale state immediately on new game ──
  // (towerManager & projectileManager are local — recreated fresh below)
  abilityEffectManager.active = [];
  // Clear module-level scorch/rad arrays in abilityEffects.js
  if (typeof _scorchMarks !== 'undefined') _scorchMarks.length = 0;
  if (typeof _radZones    !== 'undefined') _radZones.length    = 0;
  abilityManager.selected     = null;
  ABILITY_DEFS.forEach(a => {
    abilityManager.cooldowns[a.id] = 0;
    abilityManager._shake[a.id]    = 0;
  });
  enemies.length        = 0;
  EndScreen._bgSnapshot = null;

  const cssW = 1280;
  const cssH = Math.round(cssW * mapRatio);

  canvas.style.width  = cssW + "px";
  canvas.style.height = cssH + "px";
  canvas.width        = cssW * dpr;
  canvas.height       = cssH * dpr;

  const uiLayer = document.getElementById('ui-layer');
  if (uiLayer) uiLayer.style.height = cssH + "px";

  const scale   = cssW / world.w;
  const offsetX = 0;
  const offsetY = 0;

  // ── Screen shake ──────────────────────────────────
  let shakeTimer     = 0;
  let shakeDuration  = 0;
  let shakeMagnitude = 0;

  function triggerShake(duration, magnitude) {
    shakeTimer     = duration;
    shakeDuration  = duration;
    shakeMagnitude = magnitude;
  }
  window._triggerScreenShake = triggerShake;

  upgradePanel.canvasCSSW = cssW;
  upgradePanel.canvasCSSH = cssH;

  const towerManager = new TowerManager();
  towerManager.load(() => console.log("Towers loaded!"));

  const projectileManager = new ProjectileManager();
  projectileManager.load(() => console.log("Projectiles loaded!"));

  const towerWheel = new TowerWheel();
  towerWheel.load(() => console.log("Wheel loaded!"));

  // Reset ability state for fresh game (don't re-load images — already loaded)
  abilityManager.selected = null;
  ABILITY_DEFS.forEach(function(a) { abilityManager.cooldowns[a.id] = 0; });
  if (!abilityManager._imagesLoaded) {
    abilityManager.load(() => { abilityManager._imagesLoaded = true; console.log("Abilities loaded!"); });
  }
  if (!abilityEffectManager._imagesLoaded) {
    abilityEffectManager.load(() => { abilityEffectManager._imagesLoaded = true; console.log("Ability effects loaded!"); });
  }

  towerManager.projectileManager = projectileManager;

  // ── Remove old listeners before adding new ones (prevents stacking on restart) ──
  if (canvas._handlers) {
    canvas.removeEventListener('mousemove',  canvas._handlers.mousemove);
    canvas.removeEventListener('click',      canvas._handlers.click);
    canvas.removeEventListener('click',      canvas._handlers.pauseClick);
    canvas.removeEventListener('mousedown',  canvas._handlers.mousedown);
    canvas.removeEventListener('mouseup',    canvas._handlers.mouseup);
    canvas.removeEventListener('mouseleave', canvas._handlers.mouseleave);
  }
  canvas._handlers = {};

  canvas._handlers.mousemove = function(e) {
    const rect       = canvas.getBoundingClientRect();
    const moveScale  = rect.width / world.w;
    mouseWorld.x = (e.clientX - rect.left) / moveScale;
    mouseWorld.y = (e.clientY - rect.top)  / moveScale;
    if (EndScreen.isVisible()) {
      const sx = (e.clientX - rect.left) * (cssW / rect.width);
      const sy = (e.clientY - rect.top)  * (cssH / rect.height);
      canvas.style.cursor = EndScreen.handleMouseMove(sx, sy);
      return;
    }
    towerWheel.updateHoverScreen(mouseWorld.x * moveScale, mouseWorld.y * moveScale, moveScale);
    abilityManager.updateHover(e.clientX - rect.left, e.clientY - rect.top, cssW, cssH);
  };
  canvas.addEventListener('mousemove', canvas._handlers.mousemove);

  canvas._handlers.click = function(e) {
    const rect       = canvas.getBoundingClientRect();
    const clickScale = rect.width / world.w;
    const wx   = (e.clientX - rect.left) / clickScale;
    const wy   = (e.clientY - rect.top)  / clickScale;

    const sClickX   = wx * clickScale;
    const sClickY   = wy * clickScale;
    const cssClickX = e.clientX - rect.left;
    const cssClickY = e.clientY - rect.top;

    // Block game clicks when end/pause screen is visible
    if (EndScreen.isVisible()) return;

    // ── 1. Ability card click (select/deselect card only) ─────
    const cardResult = abilityManager.handleClick(cssClickX, cssClickY, cssW, cssH);
    if (cardResult) return;

    // ── 2. Upgrade panel click ──────────────────────────────────
    if (upgradePanel.visible) {
      const _towerBeforeUpgrade = upgradePanel.selectedTower;
      const _levelBeforeUpgrade = _towerBeforeUpgrade ? _towerBeforeUpgrade.level : -1;
      const _upgradeCost = _towerBeforeUpgrade ? (towerManager.getUpgradeCost(_towerBeforeUpgrade) || 0) : 0;
      const handled = upgradePanel.handleClick(sClickX, sClickY, towerManager, null, scale);
      if (handled) {
        if (_towerBeforeUpgrade && _towerBeforeUpgrade.level > _levelBeforeUpgrade) {
          hud.coins = Math.max(0, hud.coins - _upgradeCost);
        }
        return; // always return after upgrade panel handles click
      }
    }

    // ── 3. Tower wheel selection ────────────────────────────────
    if (towerWheel.visible) {
      upgradePanel.hide();
      const selected = towerWheel.handleClickScreen(sClickX, sClickY, scale);
      if (selected && mapRenderer_ref) {
        const towerDef = WHEEL_TOWERS.find(t => t.type === selected);
        const cost     = towerDef ? towerDef.cost : 0;
        if (hud.coins >= cost) {
          hud.coins -= cost;
          towerManager.place(
            towerWheel.tileCol * mapRenderer_ref.tileSize + mapRenderer_ref.tileSize / 2,
            towerWheel.tileRow * mapRenderer_ref.tileSize + mapRenderer_ref.tileSize / 2,
            mapRenderer_ref,
            selected
          );
        }
      }
      return;
    }

    // ── 4. Click on placeable tile — tower wheel takes priority over ability ──
    if (mapRenderer_ref && mapRenderer_ref.isPlaceable(wx, wy)) {
      const TILE     = mapRenderer_ref.tileSize;
      const col      = Math.floor(wx / TILE);
      const row      = Math.floor(wy / TILE);
      const occupied = towerManager.towers.some(t => t.col === col && t.row === row);
      if (!occupied) {
        // Cancel any selected ability and open tower wheel instead
        abilityManager.cancel();
        upgradePanel.hide();
        towerWheel.show(col, row, TILE);
        return;
      }
    }

    // ── 5. Click tower to open upgrade panel ───────────────────
    if (mapRenderer_ref) {
      const clickedTower = towerManager.getTowerAt(wx, wy);
      if (clickedTower) {
        abilityManager.cancel();
        if (upgradePanel.visible && upgradePanel.selectedTower === clickedTower) {
          upgradePanel.hide();
        } else {
          upgradePanel.show(clickedTower);
        }
        return;
      }
    }

    // ── 6. Ability activation (on non-placeable areas only) ────
    if (abilityManager.selected) {
      const activated = abilityManager.activateAt(wx, wy, hud.coins);
      if (activated) {
        hud.coins -= activated.cost;
        abilityEffectManager.spawn(activated.id, wx, wy, enemies);
      }
      return;
    }
  };
  canvas.addEventListener('click', canvas._handlers.click);

  // ── EndScreen mouse events ──────────────────────────────
  canvas._handlers.mousedown = function(e) {
    const rect = canvas.getBoundingClientRect();
    const sx   = (e.clientX - rect.left) * (cssW / rect.width);
    const sy   = (e.clientY - rect.top)  * (cssH / rect.height);
    EndScreen.handleMouseDown(sx, sy);
  };
  canvas._handlers.mouseup = function(e) {
    const rect = canvas.getBoundingClientRect();
    const sx   = (e.clientX - rect.left) * (cssW / rect.width);
    const sy   = (e.clientY - rect.top)  * (cssH / rect.height);
    EndScreen.handleMouseUp(sx, sy);
  };
  canvas._handlers.mouseleave = function() { EndScreen.handleMouseLeave(); };
  canvas.addEventListener('mousedown',  canvas._handlers.mousedown);
  canvas.addEventListener('mouseup',    canvas._handlers.mouseup);
  canvas.addEventListener('mouseleave', canvas._handlers.mouseleave);

  let mapRenderer_ref = null;

  loadEnemyImages(() => console.log("Enemy images loaded!"));

  // Map config per level
  const LEVEL_CONFIG = {
    1: { mapFile: "./map.json",  mudKey: "map1", paths: [path1Waypoints, path2Waypoints, path3Waypoints] },
    2: { mapFile: "./map2.json", mudKey: "map2", paths: [map2Path1Waypoints, map2Path2Waypoints, map2Path3Waypoints, map2Path4Waypoints, map2Path5Waypoints] },
    3: { mapFile: "./map3.json", mudKey: "map3", paths: [map3Path1Waypoints, map3Path2Waypoints, map3Path3Waypoints, map3Path4Waypoints, map3Path5Waypoints, map3Path6Waypoints] },
  };
  const levelCfg = LEVEL_CONFIG[levelNum] || LEVEL_CONFIG[1];

  // Use preloaded map if ready and it matches this level, otherwise fetch
  if (_mapRenderer_preloaded && levelNum === 1) {
    mapRenderer_ref = _mapRenderer_preloaded;
    mapRenderer_ref._levelNum = levelNum;
    startGame(mapRenderer_ref, onReady);
  } else {
    fetch(levelCfg.mapFile)
      .then(r => r.json())
      .then(mapData => {
        const mapRenderer = new MapRenderer(mapData, levelCfg.mudKey);
        mapRenderer_ref   = mapRenderer;
        mapRenderer._levelNum = levelNum;
        mapRenderer.load("./", () => startGame(mapRenderer, onReady));
      })
      .catch(err => console.error("Failed to load map.json:", err));
  }

  // ── Pause button click (drawn by hud.js) ───────────────
  canvas._handlers.pauseClick = function(e) {
    if (EndScreen.isVisible()) return;
    const rect = canvas.getBoundingClientRect();
    const sx   = (e.clientX - rect.left) * (cssW / rect.width);
    const sy   = (e.clientY - rect.top)  * (cssH / rect.height);
    if (hud.isPauseBtnClick(sx, sy)) {
      if (isPaused) {
        isPaused = false;
        EndScreen.hide();
      } else {
        isPaused = true;
        _snapBackground(canvas, dpr);
        EndScreen.show('menu');
      }
    }
  };
  canvas.addEventListener('click', canvas._handlers.pauseClick);
  // ────────────────────────────────────────────────────────

  function startGame(mapRenderer, onReady) {

    let lastTime = null;
    let _rafId   = null; // track so we can cancel on restart

    // ── Wave manager ───────────────────────────────
    // Reset HUD (calls reset() if available, otherwise manual fallback)
    if (typeof hud.reset === 'function') {
      hud.reset();
    } else {
      hud.lives = 10; hud.coins = 200; hud.score = 0; hud._banner = null;
    }
    // Clear all stale effects/state from previous level
    abilityEffectManager.active   = [];
    abilityManager.selected       = null;
    ABILITY_DEFS.forEach(a => { abilityManager.cooldowns[a.id] = 0; abilityManager._shake[a.id] = 0; });
    projectileManager.projectiles = [];
    towerManager.towers           = [];
    enemies.length                = 0;
    EndScreen._bgSnapshot         = null;
    WaveManager.init(levelNum);
    WaveManager.start({
      onSpawn: function(path, type, hp, speed) {
        const waypoints = levelCfg.paths[path - 1] || levelCfg.paths[0];
        const en        = new Enemy(waypoints, type);
        en.maxHealth    = hp;
        en.health       = hp;
        en.speed        = speed;
        enemies.push(en);
      },
      onWaveStart: function(num) {
        hud.showWaveBanner(num, WaveManager.getTotalWaves());
      },
      onWaveEnd: function(num) {
        hud.showWaveComplete(num);
      },
      onBoss: function() {
        hud.showBoss();
      },
      onAllDone: function() {
        const stars = hud.lives >= 8 ? 3 : hud.lives >= 4 ? 2 : 1;
        if (typeof window.saveStars === 'function') window.saveStars(levelNum, stars);
        EndScreen.show('win', stars, hud.score);
        isPaused = true;
      },
    });

    // ── EndScreen callbacks ───────────────────────────────
    EndScreen.onButton(function(name) {
      if (name === 'close' || name === 'resume') {
        // Animated close — stay on game
        isPaused = false;
        EndScreen.hide();
      } else if (name === 'restart' || name === 'again') {
        // Instant hide — navigating to new game
        isPaused = false;
        EndScreen.hideNow();
        if (_rafId) { cancelAnimationFrame(_rafId); _rafId = null; }
        window._startGame(levelNum);
      } else if (name === 'next') {
        isPaused = false;
        EndScreen.hideNow();
        if (_rafId) { cancelAnimationFrame(_rafId); _rafId = null; }
        const next = levelNum < 3 ? levelNum + 1 : levelNum;
        window.showLoadingScreen(next);
      } else if (name === 'levels' || name === 'quit') {
        isPaused = false;
        EndScreen.hideNow();
        if (_rafId) { cancelAnimationFrame(_rafId); _rafId = null; }
        if (typeof window.returnToMenu === 'function') window.returnToMenu();
      }
    });

    // Cache liveScale — recalculate only on resize not every frame
    let liveScale = canvas.getBoundingClientRect().width / world.w;
    window.addEventListener('resize', () => {
      liveScale = canvas.getBoundingClientRect().width / world.w;
    });

    function gameLoop(timestamp) {
      if (!lastTime) lastTime = timestamp;
      // Cap dt to 50ms (20fps min) — prevents spiral of death on tab switch
      const dt = Math.min((timestamp - lastTime) / 1000, 0.05);
      lastTime  = timestamp;

      // Screen shake
      if (shakeTimer > 0) {
        shakeTimer -= dt;
        if (shakeTimer < 0) shakeTimer = 0;
      }
      const shakeProgress = shakeDuration > 0 ? (shakeTimer / shakeDuration) : 0;
      const shakeAmt      = shakeProgress * shakeMagnitude;
      const shakeX        = shakeAmt > 0 ? (Math.random() - 0.5) * shakeAmt * 2 : 0;
      const shakeY        = shakeAmt > 0 ? (Math.random() - 0.5) * shakeAmt * 2 : 0;
      canvas.style.transform = shakeAmt > 0 ? `translate(${shakeX}px, ${shakeY}px)` : "";

      // ── World transform ─────────────────────────
      c.setTransform(dpr * scale, 0, 0, dpr * scale, dpr * offsetX, dpr * offsetY);
      c.clearRect(0, 0, canvas.width / (dpr * scale), canvas.height / (dpr * scale));

      mapRenderer.draw(c);

      // ── Update all systems ──────────────────────
      if (!isPaused) {
      WaveManager.update(dt, enemies);
      towerManager.update(dt, enemies);
      projectileManager.update(dt);
      towerWheel.update(dt);
      upgradePanel.update(dt);
      hud.update(dt);
      abilityManager.update(dt);
      abilityEffectManager.update(dt, enemies);
      updateEnemyDmgNumbers(dt);
      } // end if(!isPaused)

      EndScreen.update(dt); // always update — needs to run even when paused for entry animation

      // ── Draw world-space ────────────────────────
      towerManager.draw(c);
      projectileManager.draw(c);
      abilityEffectManager.drawScorch(c);

      if (!towerWheel.visible) {
        const hCol = Math.floor(mouseWorld.x / mapRenderer.tileSize);
        const hRow = Math.floor(mouseWorld.y / mapRenderer.tileSize);
        const occupied = towerManager.towers.some(t => t.col === hCol && t.row === hRow);
        if (!occupied) mapRenderer.drawHover(c, mouseWorld.x, mouseWorld.y);
      }

      // ── Enemies ─────────────────────────────────
      for (let i = enemies.length - 1; i >= 0; i--) {
        if (!isPaused) enemies[i].update(dt);
        enemies[i].draw(c);
        const def = ENEMY_DEFS[enemies[i].type];
        if (enemies[i].dying && !enemies[i]._coinAwarded) {
          enemies[i]._coinAwarded = true;
          hud.coins += def.isBoss ? 500 : 50;
          hud.score += def.isBoss ? 500 : 50;
        }
        if (!enemies[i].alive) {
          if (enemies[i].x > world.w) {
            const livesLost = def.isBoss ? 5 : 1;
            hud.lives = Math.max(0, hud.lives - livesLost);
            if (hud.lives <= 0 && !EndScreen.isVisible()) {
              _snapBackground(canvas, dpr);
              EndScreen.show('gameover', 0, hud.score);
              isPaused = true;
            }
          }
          enemies.splice(i, 1);
        }
      }

      abilityEffectManager.drawEffects(c);

      // ── Debug path overlay (level 3 only — remove when done testing) ──


      // ── Screen-space UI ─────────────────────────
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      towerWheel.drawScreen(c, liveScale);
      hud._paused = isPaused;
      hud._hidePauseBtn = true;
      // Pass current coins so UI can show red when can't afford
      towerWheel._coins        = hud.coins;
      upgradePanel._coins      = hud.coins;
      hud._warnCoins           = Math.min(...WHEEL_TOWERS.map(t => t.cost)); // warn if below cheapest tower
      hud.draw(c, cssW, cssH);
      abilityManager.draw(c, cssW, cssH, hud.coins);
      drawEnemyDmgNumbers(c, liveScale);

      // ── End / Pause screen (always on top) ─────
      EndScreen.draw(c, cssW, cssH);

      // ── Pause btn always on top of everything ──
      hud._hidePauseBtn = EndScreen.isVisible() && EndScreen.getScreen() !== 'menu';
      hud._drawPauseBtn(c);

      if (upgradePanel.visible && upgradePanel.selectedTower) {
        upgradePanel.draw(c, upgradePanel.selectedTower, scale, dpr);
      }

      _rafId = requestAnimationFrame(gameLoop);
    }

    // Notify loading screen map is ready — it will fade out now
    if (typeof onReady === 'function') onReady();

    _rafId = requestAnimationFrame(gameLoop);
  }

};