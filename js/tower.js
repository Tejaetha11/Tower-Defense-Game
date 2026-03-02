const TOWER_DEFS = {
  tower1: {
    baseImage      : "./tower1-base.png",
    baseFrame      : { x: 0, y: 19, w: 64, h: 110 },
    baseDrawW      : 230,
    baseDrawH      : 350,
    baseOffsetX    : -130,
    baseOffsetY    : -210,

    weaponAnchorX  : -20,
    weaponAnchorY  : -112,

    weaponImage    : "./tower 1 weapon.png",
    weaponFrames   : [
      { x: 13,  y: 0, w: 39, h: 60, ox: 0, oy: 0 },
      { x: 76,  y: 0, w: 39, h: 60, ox: 0, oy: 0 },
      { x: 141, y: 0, w: 39, h: 60, ox: 0, oy: 0 },
      { x: 205, y: 0, w: 39, h: 60, ox: 0, oy: 0 },
      { x: 267, y: 0, w: 39, h: 60, ox: 0, oy: 0 },
      { x: 332, y: 0, w: 39, h: 60, ox: 0, oy: 0 },
    ],
    weaponDrawW    : 170,
    weaponDrawH    : 220,
    weaponScale    : 1.0,
    weaponFPS      : 7,
    spawnOnFrame   : 2,
    fireRate       : 0.2,
    range          : 800,
    rotateSpeed    : 4,

    upgrades       : [
      {
        cost: 150, label: "Upgrade Lv2", damage: 40, fireRate: 0.16, range: 950,
        baseFrame    : { x: 63, y: 14, w: 66, h: 115 },
        weaponImage  : "./tower 1 weapon2.png",
        weaponDrawW  : 170,
        weaponDrawH  : 180,
        weaponAnchorX: -5,
        weaponAnchorY: -114,
        weaponFrames : [
          { x: 19,  y: 17, w: 57, h: 52, ox: 0, oy: 0 },
          { x: 116, y: 0,  w: 57, h: 77, ox: 0, oy: 0 },
          { x: 213, y: 15, w: 57, h: 61, ox: 0, oy: 0 },
          { x: 309, y: 15, w: 57, h: 61, ox: 0, oy: 0 },
          { x: 404, y: 13, w: 57, h: 61, ox: 0, oy: 0 },
          { x: 499, y: 14, w: 57, h: 61, ox: 0, oy: 0 },
        ],
      },
      {
        cost: 300, label: "Upgrade Lv3", damage: 60, fireRate: 0.12, range: 1100,
        baseFrame    : { x: 127, y: 5, w: 66, h: 123 },
        weaponImage  : "./tower 1 weapon3.png",
        weaponDrawW  : 150,
        weaponDrawH  : 180,
        weaponAnchorX: -5,
        weaponAnchorY: -114,
        weaponFrames : [
          { x: 17,  y: 13, w: 60, h: 57, ox: 0, oy: 0 },
          { x: 115, y: 0,  w: 57, h: 68, ox: 0, oy: 0 },
          { x: 210, y: 16, w: 60, h: 56, ox: 0, oy: 0 },
          { x: 305, y: 16, w: 60, h: 56, ox: 0, oy: 0 },
          { x: 402, y: 16, w: 60, h: 56, ox: 0, oy: 0 },
          { x: 497, y: 16, w: 60, h: 56, ox: 0, oy: 0 },
        ],
      },
    ],

    buildImage     : "./Tower Construction.png",
    buildFrames    : [
      { x: 57,   y: 86, w: 79, h: 115 },
      { x: 249,  y: 86, w: 79, h: 115 },
      { x: 441,  y: 86, w: 79, h: 115 },
      { x: 633,  y: 86, w: 79, h: 115 },
      { x: 825,  y: 86, w: 79, h: 115 },
      { x: 1017, y: 86, w: 79, h: 115 },
    ],
    buildDrawW     : 270,
    buildDrawH     : 400,
    buildOffsetX   : 0,
    buildOffsetY   : -15,
    buildFPS       : 10,
    buildRepeat    : 3,

    smokeFrames    : [
      { x: 47,  y: 1334, w: 99,  h: 153 },
      { x: 238, y: 1333, w: 99,  h: 153 },
      { x: 429, y: 1333, w: 105, h: 154 },
      { x: 621, y: 1333, w: 105, h: 154 },
      { x: 813, y: 1333, w: 105, h: 154 },
    ],
    smokeDrawW     : 480,
    smokeDrawH     : 580,
    smokeFPS       : 8,
    towerAppearAt  : 2,
  },

  tower2: {
    baseImage      : "./tower2-base.png",
    baseFrame      : { x: 0, y: 23, w: 65, h: 106 },
    baseDrawW      : 230,
    baseDrawH      : 350,
    baseOffsetX    : -130,
    baseOffsetY    : -210,

    weaponAnchorX  : -20,
    weaponAnchorY  : -90,

    weaponImage    : "./tower 2 weapon.png",
    weaponFrames   : [
      { x: 0,   y: 36, w: 96, h: 60, ox: 0, oy: 0 },
      { x: 96,  y: 36, w: 96, h: 60, ox: 0, oy: 0 },
      { x: 192, y: 36, w: 96, h: 60, ox: 0, oy: 0 },
      { x: 288, y: 36, w: 96, h: 60, ox: 0, oy: 0 },
      { x: 384, y: 36, w: 96, h: 60, ox: 0, oy: 0 },
      { x: 480, y: 36, w: 96, h: 60, ox: 0, oy: 0 },
      { x: 576, y: 36, w: 96, h: 60, ox: 0, oy: 0 },
      { x: 672, y: 36, w: 96, h: 60, ox: 0, oy: 0 },
    ],
    weaponDrawW    : 170,
    weaponDrawH    : 106,
    weaponScale    : 1.35,
    weaponFPS      : 7,
    spawnOnFrame   : 5,
    fireRate       : 0.2,
    range          : 800,
    rotateSpeed    : 4,

    upgrades       : [
      {
        cost         : 150, label: "Upgrade Lv2", damage: 40, fireRate: 0.16, range: 950,
        baseFrame    : { x: 63, y: 10, w: 66, h: 119 },
        weaponImage  : "./tower 2 weapon 2.png",
        weaponDrawW  : 170,
        weaponDrawH  : 106,
        weaponScale  : 1.35,
        weaponAnchorX: -20,
        weaponAnchorY: -90,
        weaponCellW  : 0,
        weaponCellH  : 0,
        weaponFrames : [
          { x: 0,   y: 36, w: 96, h: 60, ox: 0, oy: 0 },
          { x: 96,  y: 36, w: 96, h: 60, ox: 0, oy: 0 },
          { x: 192, y: 36, w: 96, h: 60, ox: 0, oy: 0 },
          { x: 288, y: 36, w: 96, h: 60, ox: 0, oy: 0 },
          { x: 384, y: 36, w: 96, h: 60, ox: 0, oy: 0 },
          { x: 480, y: 36, w: 96, h: 60, ox: 0, oy: 0 },
          { x: 576, y: 36, w: 96, h: 60, ox: 0, oy: 0 },
          { x: 672, y: 36, w: 96, h: 60, ox: 0, oy: 0 },
        ],
      },
      // ── Lv3 placeholder — fill in when assets are ready ──
      {
        cost         : 300, label: "Upgrade Lv3", damage: 60, fireRate: 0.12, range: 1100,
        baseFrame    : { x: 128, y: 2, w: 64, h: 126 },
        weaponImage  : "./tower 2 weapon 3.png",
        weaponDrawW  : 140,
        weaponDrawH  : 106,
        weaponScale  : 0.80,
        weaponAnchorX: -10,
        weaponAnchorY: -110,
        weaponCellW  : 0,
        weaponCellH  : 0,
        weaponFrames : [
          { x: 25,  y: 36, w: 47, h: 39, ox: 0, oy: 0 },
          { x: 121, y: 36, w: 47, h: 39, ox: 0, oy: 0 },
          { x: 217, y: 36, w: 47, h: 39, ox: 0, oy: 0 },
          { x: 313, y: 36, w: 47, h: 39, ox: 0, oy: 0 },
          { x: 409, y: 36, w: 47, h: 39, ox: 0, oy: 0 },
          { x: 504, y: 36, w: 47, h: 39, ox: 0, oy: 0 },
          { x: 600, y: 36, w: 47, h: 39, ox: 0, oy: 0 },
          { x: 697, y: 36, w: 47, h: 39, ox: 0, oy: 0 },
        ],
      },
    ],

    buildImage     : "./Tower Construction.png",
    buildFrames    : [
      { x: 57,   y: 86, w: 79, h: 115 },
      { x: 249,  y: 86, w: 79, h: 115 },
      { x: 441,  y: 86, w: 79, h: 115 },
      { x: 633,  y: 86, w: 79, h: 115 },
      { x: 825,  y: 86, w: 79, h: 115 },
      { x: 1017, y: 86, w: 79, h: 115 },
    ],
    buildDrawW     : 270,
    buildDrawH     : 400,
    buildOffsetX   : 0,
    buildOffsetY   : -15,
    buildFPS       : 10,
    buildRepeat    : 3,

    smokeFrames    : [
      { x: 47,  y: 1334, w: 99,  h: 153 },
      { x: 238, y: 1333, w: 99,  h: 153 },
      { x: 429, y: 1333, w: 105, h: 154 },
      { x: 621, y: 1333, w: 105, h: 154 },
      { x: 813, y: 1333, w: 105, h: 154 },
    ],
    smokeDrawW     : 480,
    smokeDrawH     : 580,
    smokeFPS       : 8,
    towerAppearAt  : 2,
  }
};

const STATE = {
  BUILDING  : "building",
  UPGRADING : "upgrading",
  UP_SMOKE  : "up_smoke",
  SMOKE     : "smoke",
  READY     : "ready",
};

class TowerManager {
  constructor() {
    this.towers = [];
    this.images = {};
    this.ready  = false;
  }

  load(onReady) {
    const toLoad = [];
    Object.keys(TOWER_DEFS).forEach(key => {
      const def = TOWER_DEFS[key];
      toLoad.push({ key, type: "base",   src: def.baseImage   });
      toLoad.push({ key, type: "weapon", src: def.weaponImage });
      toLoad.push({ key, type: "build",  src: def.buildImage  });
      (def.upgrades || []).forEach((up, i) => {
        if (up.weaponImage) {
          toLoad.push({ key, type: `weapon_lv${i + 2}`, src: up.weaponImage });
        }
      });
    });

    let total = toLoad.length;
    let done  = 0;
    toLoad.forEach(({ key, type, src }) => {
      const img  = new Image();
      img.src    = src;
      img.onload = img.onerror = () => {
        if (!this.images[key]) this.images[key] = {};
        this.images[key][type] = img;
        done++;
        if (done >= total) { this.ready = true; onReady(); }
      };
    });
  }

  place(wx, wy, mapRenderer, type = "tower1") {
    if (!mapRenderer || !mapRenderer.isPlaceable(wx, wy)) return false;

    const TILE = mapRenderer.tileSize;
    const col  = Math.floor(wx / TILE);
    const row  = Math.floor(wy / TILE);

    const occupied = this.towers.some(t => t.col === col && t.row === row);
    if (occupied) return false;

    const cx = col * TILE + TILE / 2;
    const cy = row * TILE + TILE / 2;

    this.towers.push({
      type,
      col, row, cx, cy,
      state          : STATE.BUILDING,
      frameIndex     : 0,
      frameTimer     : 0,
      buildLoopCount : 0,
      angle          : -Math.PI / 2,
      weaponFrame    : 0,
      weaponTimer    : 0,
      cooldownTimer  : 0,
      isFiring       : false,
      lockedTarget   : null,
      level          : 0,
      damage         : null,
      fireRate       : null,
      range          : null,
      _prevLevel     : 0,
    });

    return true;
  }

  getTowerAt(wx, wy) {
    return this.towers.find(t => {
      const dx = t.cx - wx;
      const dy = t.cy - wy;
      return Math.sqrt(dx*dx + dy*dy) < 100 && t.state === STATE.READY;
    }) || null;
  }

  getUpgradeCost(tower) {
    const def = TOWER_DEFS[tower.type];
    if (!def.upgrades || tower.level >= def.upgrades.length) return null;
    return def.upgrades[tower.level].cost;
  }

  upgradeTower(tower) {
    const def = TOWER_DEFS[tower.type];
    if (!def.upgrades || tower.level >= def.upgrades.length) return false;

    const up = def.upgrades[tower.level];

    tower._prevLevel     = tower.level;
    tower.level         += 1;
    tower.damage         = up.damage;
    tower.fireRate       = up.fireRate;
    tower.range          = up.range;
    tower.isFiring       = false;
    tower.weaponFrame    = 0;
    tower.weaponTimer    = 0;
    tower.cooldownTimer  = 0;
    tower.lockedTarget   = null;

    tower.state          = STATE.UPGRADING;
    tower.frameIndex     = 0;
    tower.frameTimer     = 0;
    tower.buildLoopCount = 0;

    return true;
  }

  _isTargetValid(tower, target) {
    if (!target || !target.alive || target.dying || target.smoking) return false;
    const def   = TOWER_DEFS[tower.type];
    const range = tower.range || def.range;
    const dx    = target.x - tower.cx;
    const dy    = target.y - tower.cy;
    return Math.sqrt(dx*dx + dy*dy) <= range;
  }

  _findNewTarget(tower, enemies) {
    const def   = TOWER_DEFS[tower.type];
    const range = tower.range || def.range;
    let nearest = null;
    let minDist = Infinity;

    for (let i = 0; i < enemies.length; i++) {
      const enemy = enemies[i];
      if (!enemy || !enemy.alive || enemy.dying || enemy.smoking) continue;
      const dx   = enemy.x - tower.cx;
      const dy   = enemy.y - tower.cy;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist <= range && dist < minDist) {
        minDist = dist;
        nearest = enemy;
      }
    }
    return nearest;
  }

  _rotateToward(current, target, speed, dt) {
    let diff = target - current;
    while (diff >  Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    const maxStep = speed * dt;
    if (Math.abs(diff) <= maxStep) return target;
    return current + Math.sign(diff) * maxStep;
  }

  update(dt, enemies) {
    try {
      this.towers.forEach(tower => {
        const def = TOWER_DEFS[tower.type];

        // ── UPGRADING ─────────────────────────────────────
        if (tower.state === STATE.UPGRADING) {
          tower.frameTimer += dt;
          if (tower.frameTimer >= 1 / def.buildFPS) {
            tower.frameTimer -= 1 / def.buildFPS;
            tower.frameIndex++;
            if (tower.frameIndex >= def.buildFrames.length) {
              tower.buildLoopCount++;
              if (tower.buildLoopCount >= def.buildRepeat) {
                tower.state      = STATE.UP_SMOKE;
                tower.frameIndex = 0;
                tower.frameTimer = 0;
              } else {
                tower.frameIndex = 0;
              }
            }
          }
          return;
        }

        // ── UP_SMOKE ──────────────────────────────────────
        if (tower.state === STATE.UP_SMOKE) {
          tower.frameTimer += dt;
          if (tower.frameTimer >= 1 / def.smokeFPS) {
            tower.frameTimer -= 1 / def.smokeFPS;
            tower.frameIndex++;
            if (tower.frameIndex >= def.smokeFrames.length) {
              tower.state      = STATE.READY;
              tower.frameIndex = 0;
              tower.frameTimer = 0;
            }
          }
          return;
        }

        // ── BUILDING ──────────────────────────────────────
        if (tower.state === STATE.BUILDING) {
          tower.frameTimer += dt;
          if (tower.frameTimer >= 1 / def.buildFPS) {
            tower.frameTimer -= 1 / def.buildFPS;
            tower.frameIndex++;
            if (tower.frameIndex >= def.buildFrames.length) {
              tower.buildLoopCount++;
              if (tower.buildLoopCount >= def.buildRepeat) {
                tower.state      = STATE.SMOKE;
                tower.frameIndex = 0;
                tower.frameTimer = 0;
              } else {
                tower.frameIndex = 0;
              }
            }
          }
          return;
        }

        // ── SMOKE ─────────────────────────────────────────
        if (tower.state === STATE.SMOKE) {
          tower.frameTimer += dt;
          if (tower.frameTimer >= 1 / def.smokeFPS) {
            tower.frameTimer -= 1 / def.smokeFPS;
            tower.frameIndex++;
            if (tower.frameIndex >= def.smokeFrames.length) {
              tower.state      = STATE.READY;
              tower.frameIndex = 0;
              tower.frameTimer = 0;
            }
          }
          return;
        }

        // ── READY ─────────────────────────────────────────
        if (!this._isTargetValid(tower, tower.lockedTarget)) {
          tower.isFiring      = false;
          tower.weaponFrame   = 0;
          tower.weaponTimer   = 0;
          tower.cooldownTimer = 0;
          tower.lockedTarget  = this._findNewTarget(tower, enemies);
        }

        const target = tower.lockedTarget;

        if (target) {
          const up      = tower.level > 0 ? def.upgrades[tower.level - 1] : null;
          const anchorX = tower.cx + (up && up.weaponAnchorX !== undefined ? up.weaponAnchorX : def.weaponAnchorX);
          const anchorY = tower.cy + (up && up.weaponAnchorY !== undefined ? up.weaponAnchorY : def.weaponAnchorY);

          const targetAngle = Math.atan2(
            target.y - anchorY,
            target.x - anchorX
          ) + Math.PI / 2;

          tower.angle = this._rotateToward(tower.angle, targetAngle, def.rotateSpeed, dt);

          const frames = up && up.weaponFrames ? up.weaponFrames : def.weaponFrames;

          if (tower.isFiring) {
            tower.weaponTimer += dt;
            if (tower.weaponTimer >= 1 / def.weaponFPS) {
              tower.weaponTimer -= 1 / def.weaponFPS;
              tower.weaponFrame++;

              if (tower.weaponFrame === def.spawnOnFrame && tower.lockedTarget && this.projectileManager) {
                const upDrawH = up ? (up.weaponDrawH || def.weaponDrawH) : def.weaponDrawH;
                const tipDist = upDrawH / 2;
                const tipX    = anchorX + Math.sin(tower.angle) * tipDist;
                const tipY    = anchorY - Math.cos(tower.angle) * tipDist;
                this.projectileManager.spawn(tower.type, tipX, tipY, tower.lockedTarget, tower.level);
              }

              if (tower.weaponFrame >= frames.length) {
                tower.weaponFrame   = 0;
                tower.isFiring      = false;
                tower.cooldownTimer = 0;
              }
            }
          } else {
            tower.cooldownTimer += dt;
            if (tower.cooldownTimer >= (tower.fireRate || def.fireRate)) {
              tower.isFiring      = true;
              tower.weaponFrame   = 0;
              tower.weaponTimer   = 0;
              tower.cooldownTimer = 0;
            }
          }

        } else {
          tower.isFiring      = false;
          tower.weaponFrame   = 0;
          tower.weaponTimer   = 0;
          tower.cooldownTimer = 0;
        }
      });
    } catch (e) {
      console.error("TowerManager.update error:", e);
    }
  }

  _drawWeapon(ctx, tower, def, imgs, frameIndex, levelOverride) {
    const lvl = levelOverride !== undefined ? levelOverride : tower.level;

    let weaponImg    = imgs.weapon;
    let weaponFrames = def.weaponFrames;
    let weaponDrawW  = def.weaponDrawW;
    let weaponDrawH  = def.weaponDrawH;
    let anchorX      = tower.cx + def.weaponAnchorX;
    let anchorY      = tower.cy + def.weaponAnchorY;

    if (lvl > 0 && def.upgrades && def.upgrades[lvl - 1]) {
      const up = def.upgrades[lvl - 1];
      if (up.weaponImage && imgs[`weapon_lv${lvl + 1}`]) {
        weaponImg    = imgs[`weapon_lv${lvl + 1}`];
        weaponFrames = up.weaponFrames;
        weaponDrawW  = up.weaponDrawW  || def.weaponDrawW;
        weaponDrawH  = up.weaponDrawH  || def.weaponDrawH;
        anchorX      = tower.cx + (up.weaponAnchorX !== undefined ? up.weaponAnchorX : def.weaponAnchorX);
        anchorY      = tower.cy + (up.weaponAnchorY !== undefined ? up.weaponAnchorY : def.weaponAnchorY);
      }
    }

    if (!weaponImg || !weaponImg.complete || weaponImg.naturalWidth === 0) return;
    if (!weaponFrames || frameIndex >= weaponFrames.length) return;

    const activeUp = (lvl > 0 && def.upgrades && def.upgrades[lvl - 1]) ? def.upgrades[lvl - 1] : null;
    const scale    = (activeUp && activeUp.weaponScale !== undefined) ? activeUp.weaponScale : (def.weaponScale || 1.0);
    const wf       = weaponFrames[frameIndex];

    // Use weaponCellW/H if defined (fixes position drift from inconsistent frame sizes)
    const srcW = (activeUp && activeUp.weaponCellW) ? activeUp.weaponCellW : wf.w;
    const srcH = (activeUp && activeUp.weaponCellH) ? activeUp.weaponCellH : wf.h;

    ctx.save();
    ctx.translate(anchorX, anchorY);
    ctx.rotate(tower.angle);
    ctx.drawImage(
      weaponImg,
      wf.x, wf.y, srcW, srcH,
      -(weaponDrawW * scale) / 2 + (wf.ox || 0),
      -(weaponDrawH * scale) / 2 + (wf.oy || 0),
      weaponDrawW * scale, weaponDrawH * scale
    );
    ctx.restore();
  }

  draw(ctx) {
    if (!this.ready) return;

    this.towers.forEach(tower => {
      const def  = TOWER_DEFS[tower.type];
      const imgs = this.images[tower.type];
      if (!imgs) return;

      // ── UPGRADING ─────────────────────────────────────
      if (tower.state === STATE.UPGRADING) {
        const img = imgs.build;
        if (img && img.complete && img.naturalWidth > 0) {
          const f = def.buildFrames[tower.frameIndex];
          ctx.drawImage(img, f.x, f.y, f.w, f.h,
            tower.cx - def.buildDrawW / 2 + def.buildOffsetX,
            tower.cy - def.buildDrawH / 2 + def.buildOffsetY,
            def.buildDrawW, def.buildDrawH);
        }
        return;
      }

      // ── UP_SMOKE ───────────────────────────────────────
      if (tower.state === STATE.UP_SMOKE) {
        const up = def.upgrades[tower.level - 1];
        if (tower.frameIndex >= def.towerAppearAt) {
          const baseImg = imgs.base;
          if (baseImg) {
            const bf = up.baseFrame || def.baseFrame;
            ctx.drawImage(baseImg, bf.x, bf.y, bf.w, bf.h,
              tower.cx + def.baseOffsetX,
              tower.cy + def.baseOffsetY,
              def.baseDrawW, def.baseDrawH);
          }
          this._drawWeapon(ctx, tower, def, imgs, 0);
        }
        const smokeImg = imgs.build;
        if (smokeImg && smokeImg.complete && smokeImg.naturalWidth > 0) {
          const f = def.smokeFrames[tower.frameIndex];
          ctx.drawImage(smokeImg, f.x, f.y, f.w, f.h,
            tower.cx - def.smokeDrawW / 2,
            tower.cy - def.smokeDrawH / 2,
            def.smokeDrawW, def.smokeDrawH);
        }
        return;
      }

      // ── BUILDING ──────────────────────────────────────
      if (tower.state === STATE.BUILDING) {
        const img = imgs.build;
        if (img && img.complete && img.naturalWidth > 0) {
          const f = def.buildFrames[tower.frameIndex];
          ctx.drawImage(img, f.x, f.y, f.w, f.h,
            tower.cx - def.buildDrawW / 2 + def.buildOffsetX,
            tower.cy - def.buildDrawH / 2 + def.buildOffsetY,
            def.buildDrawW, def.buildDrawH);
        }
        return;
      }

      // ── SMOKE ─────────────────────────────────────────
      if (tower.state === STATE.SMOKE) {
        if (tower.frameIndex >= def.towerAppearAt) {
          const baseImg = imgs.base;
          if (baseImg) {
            const bf = tower.level > 0
              ? def.upgrades[tower.level - 1].baseFrame
              : def.baseFrame;
            ctx.drawImage(baseImg, bf.x, bf.y, bf.w, bf.h,
              tower.cx + def.baseOffsetX,
              tower.cy + def.baseOffsetY,
              def.baseDrawW, def.baseDrawH);
          }
          this._drawWeapon(ctx, tower, def, imgs, 0);
        }
        const smokeImg = imgs.build;
        if (smokeImg && smokeImg.complete && smokeImg.naturalWidth > 0) {
          const f = def.smokeFrames[tower.frameIndex];
          ctx.drawImage(smokeImg, f.x, f.y, f.w, f.h,
            tower.cx - def.smokeDrawW / 2,
            tower.cy - def.smokeDrawH / 2,
            def.smokeDrawW, def.smokeDrawH);
        }
        return;
      }

      // ── READY ─────────────────────────────────────────
      const baseImg = imgs.base;
      if (baseImg) {
        const bf = tower.level > 0
          ? def.upgrades[tower.level - 1].baseFrame
          : def.baseFrame;
        ctx.drawImage(baseImg, bf.x, bf.y, bf.w, bf.h,
          tower.cx + def.baseOffsetX,
          tower.cy + def.baseOffsetY,
          def.baseDrawW, def.baseDrawH);
      }
      this._drawWeapon(ctx, tower, def, imgs, tower.weaponFrame);
    });
  }
}