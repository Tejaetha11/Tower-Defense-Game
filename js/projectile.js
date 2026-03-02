// projectile.js
// Handles projectile flying animation and hit explosion

const PROJECTILE_DEFS = {
  tower1: {
    flyFrames  : [
      "./img/projectiles/tower1 projectile f1.png",
      "./img/projectiles/tower1 projectile f2.png",
      "./img/projectiles/tower1 projectile f3.png",
    ],
    flyDrawW   : 22,
    flyDrawH   : 65,
    flyFPS     : 12,
    speed      : 800,
    damage     : 25,
    hitImage   : "./explosion.png",
    hitFrames  : [
      { x: 15,  y: 13, w: 37, h: 38 },
      { x: 77,  y: 13, w: 37, h: 38 },
      { x: 141, y: 13, w: 37, h: 38 },
      { x: 205, y: 13, w: 37, h: 38 },
      { x: 268, y: 13, w: 37, h: 38 },
    ],
    hitDrawW   : 160,
    hitDrawH   : 160,
    hitFPS     : 12,
  },

  tower1_lv2: {
    flyFrames  : [
      "./img/projectiles/tower1 lvl2 projectile f1.png",
      "./img/projectiles/tower1 lvl2 projectile f2.png",
      "./img/projectiles/tower1 lvl2 projectile f3.png",
      "./img/projectiles/tower1 lvl2 projectile f4.png",
    ],
    flyDrawW   : 28,
    flyDrawH   : 75,
    flyFPS     : 12,
    speed      : 900,
    damage     : 40,
    hitImage   : "./explosion.png",
    hitFrames  : [
      { x: 15,  y: 13, w: 37, h: 38 },
      { x: 77,  y: 13, w: 37, h: 38 },
      { x: 141, y: 13, w: 37, h: 38 },
      { x: 205, y: 13, w: 37, h: 38 },
      { x: 268, y: 13, w: 37, h: 38 },
    ],
    hitDrawW   : 180,
    hitDrawH   : 180,
    hitFPS     : 12,
  },

  tower1_lv3: {
    flyFrames  : [
      "./img/projectiles/tower1 lvl3 projectile f1.png",
      "./img/projectiles/tower1 lvl3 projectile f2.png",
      "./img/projectiles/tower1 lvl3 projectile f3.png",
      "./img/projectiles/tower1 lvl3 projectile f4.png",
    ],
    flyDrawW   : 34,
    flyDrawH   : 85,
    flyFPS     : 12,
    speed      : 1000,
    damage     : 60,
    hitImage   : "./explosion.png",
    hitFrames  : [
      { x: 15,  y: 13, w: 37, h: 38 },
      { x: 77,  y: 13, w: 37, h: 38 },
      { x: 141, y: 13, w: 37, h: 38 },
      { x: 205, y: 13, w: 37, h: 38 },
      { x: 268, y: 13, w: 37, h: 38 },
    ],
    hitDrawW   : 200,
    hitDrawH   : 200,
    hitFPS     : 12,
  },

  // tower2 lv1 — spritesheet fly, default explosion
  tower2: {
    flySheet        : "./img/projectiles/tower 2 lvl1 projectile.png",
    flySheetFrames  : [
      { x: 0,  y: 0, w: 10, h: 10 },
      { x: 0,  y: 0, w: 10, h: 10 },
      { x: 10, y: 0, w: 10, h: 10 },
      { x: 20, y: 0, w: 10, h: 10 },
      { x: 30, y: 0, w: 10, h: 10 },
      { x: 40, y: 0, w: 10, h: 10 },
      { x: 50, y: 0, w: 10, h: 10 },
    ],
    flyDrawW   : 40,
    flyDrawH   : 40,
    flyFPS     : 12,
    speed      : 800,
    damage     : 25,
    hitImage   : "./explosion.png",
    hitFrames  : [
      { x: 15,  y: 13, w: 37, h: 38 },
      { x: 77,  y: 13, w: 37, h: 38 },
      { x: 141, y: 13, w: 37, h: 38 },
      { x: 205, y: 13, w: 37, h: 38 },
      { x: 268, y: 13, w: 37, h: 38 },
    ],
    hitDrawW   : 160,
    hitDrawH   : 160,
    hitFPS     : 12,
  },

  // tower2 lv2 — spritesheet fly, custom impact spritesheet
  tower2_lv2: {
    flySheet        : "./img/projectiles/tower 2 lvl2 projectile.png",
    flySheetFrames  : [
      { x: 0,  y: 0, w: 10, h: 10 },
      { x: 0,  y: 0, w: 10, h: 10 },
      { x: 10, y: 0, w: 10, h: 10 },
      { x: 20, y: 0, w: 10, h: 10 },
      { x: 30, y: 0, w: 10, h: 10 },
      { x: 40, y: 0, w: 10, h: 10 },
      { x: 50, y: 0, w: 10, h: 10 },
    ],
    flyDrawW   : 40,
    flyDrawH   : 40,
    flyFPS     : 12,
    speed      : 900,
    damage     : 40,
    hitImage   : "./tower2 level2 impact.png",
    hitFrames  : [
      { x: 8,   y: 7, w: 49, h: 49 },
      { x: 72,  y: 9, w: 49, h: 49 },
      { x: 133, y: 7, w: 49, h: 49 },
      { x: 202, y: 7, w: 49, h: 49 },
      { x: 265, y: 5, w: 49, h: 49 },
      { x: 326, y: 5, w: 49, h: 49 },
    ],
    hitDrawW   : 180,
    hitDrawH   : 180,
    hitFPS     : 12,
  },

  // tower2 lv3 — spritesheet fly, custom impact spritesheet
  tower2_lv3: {
    flySheet        : "./img/projectiles/tower 2 lvl3 projectile.png",
    flySheetFrames  : [
      { x: 0,  y: 0, w: 10, h: 10 },
      { x: 0,  y: 0, w: 10, h: 10 },
      { x: 10, y: 0, w: 10, h: 10 },
      { x: 20, y: 0, w: 10, h: 10 },
      { x: 30, y: 0, w: 10, h: 10 },
      { x: 40, y: 0, w: 10, h: 10 },
      { x: 50, y: 0, w: 10, h: 10 },
    ],
    flyDrawW   : 40,
    flyDrawH   : 40,
    flyFPS     : 12,
    speed      : 1000,
    damage     : 60,
    hitImage   : "./tower2 level3  impact.png",
    hitFrames  : [
      { x: 9,   y: 8, w: 45, h: 45 },
      { x: 73,  y: 8, w: 45, h: 45 },
      { x: 136, y: 9, w: 45, h: 45 },
      { x: 202, y: 9, w: 45, h: 45 },
      { x: 266, y: 9, w: 45, h: 45 },
      { x: 324, y: 9, w: 45, h: 45 },
    ],
    hitDrawW   : 200,
    hitDrawH   : 200,
    hitFPS     : 12,
  },
};

class ProjectileManager {
  constructor() {
    this.projectiles = [];
    this.hits        = [];
    this.images      = {};
    this.ready       = false;
  }

  load(onReady) {
    const toLoad = [];

    Object.keys(PROJECTILE_DEFS).forEach(key => {
      const def = PROJECTILE_DEFS[key];

      if (def.flySheet) {
        // Spritesheet-based — load single image
        toLoad.push({ key, type: "fly_sheet", src: def.flySheet });
      } else {
        // Individual-file-based — load each frame image
        def.flyFrames.forEach((src, i) => {
          toLoad.push({ key, type: `fly_${i}`, src });
        });
      }

      toLoad.push({ key, type: "hit", src: def.hitImage });
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
        if (done >= total) {
          this.ready = true;
          onReady();
        }
      };
    });
  }

  // type = tower type (e.g. "tower1"), level = tower level (0/1/2)
  spawn(towerType, fromX, fromY, targetEnemy, towerLevel = 0) {
    let projType = towerType;
    if (towerLevel === 1) projType = `${towerType}_lv2`;
    if (towerLevel === 2) projType = `${towerType}_lv3`;

    if (!PROJECTILE_DEFS[projType]) projType = towerType;
    if (!PROJECTILE_DEFS[projType]) return;

    this.projectiles.push({
      type       : projType,
      x          : fromX,
      y          : fromY,
      target     : targetEnemy,
      targetX    : targetEnemy.x,
      targetY    : targetEnemy.y,
      frameIndex : 0,
      frameTimer : 0,
      angle      : Math.atan2(targetEnemy.y - fromY, targetEnemy.x - fromX),
    });
  }

  _spawnHit(type, x, y) {
    this.hits.push({ type, x, y, frameIndex: 0, frameTimer: 0 });
  }

  update(dt) {
    // ── Update projectiles ──────────────────────────────
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p   = this.projectiles[i];
      const def = PROJECTILE_DEFS[p.type];

      if (p.target && (p.target.dying || p.target.smoking || !p.target.alive)) {
        this.projectiles.splice(i, 1);
        continue;
      }

      p.frameTimer += dt;
      if (p.frameTimer >= 1 / def.flyFPS) {
        p.frameTimer -= 1 / def.flyFPS;
        const frameCount = def.flySheet ? def.flySheetFrames.length : def.flyFrames.length;
        p.frameIndex = (p.frameIndex + 1) % frameCount;
      }

      if (p.target && p.target.alive && !p.target.dying && !p.target.smoking) {
        p.targetX = p.target.x;
        p.targetY = p.target.y;
      }

      const dx   = p.targetX - p.x;
      const dy   = p.targetY - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const step = def.speed * dt;

      if (dist > 0) p.angle = Math.atan2(dy, dx);

      if (step >= dist || dist < 20) {
        if (p.target && p.target.alive && !p.target.dying && !p.target.smoking) {
          p.target.takeDamage(def.damage || 10);
        }
        this._spawnHit(p.type, p.targetX, p.targetY);
        this.projectiles.splice(i, 1);
      } else {
        p.x += (dx / dist) * step;
        p.y += (dy / dist) * step;
      }
    }

    // ── Update hit explosions ───────────────────────────
    for (let i = this.hits.length - 1; i >= 0; i--) {
      const h   = this.hits[i];
      const def = PROJECTILE_DEFS[h.type];
      h.frameTimer += dt;
      if (h.frameTimer >= 1 / def.hitFPS) {
        h.frameTimer -= 1 / def.hitFPS;
        h.frameIndex++;
        if (h.frameIndex >= def.hitFrames.length) {
          this.hits.splice(i, 1);
        }
      }
    }
  }

  draw(ctx) {
    if (!this.ready) return;

    // ── Draw projectiles ────────────────────────────────
    this.projectiles.forEach(p => {
      const def = PROJECTILE_DEFS[p.type];

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle + Math.PI / 2);

      if (def.flySheet) {
        const img = this.images[p.type]["fly_sheet"];
        if (!img || !img.complete || img.naturalWidth === 0) { ctx.restore(); return; }
        const f = def.flySheetFrames[p.frameIndex];
        ctx.drawImage(
          img,
          f.x, f.y, f.w, f.h,
          -def.flyDrawW / 2, -def.flyDrawH / 2,
          def.flyDrawW, def.flyDrawH
        );
      } else {
        const img = this.images[p.type][`fly_${p.frameIndex}`];
        if (!img || !img.complete || img.naturalWidth === 0) { ctx.restore(); return; }
        ctx.drawImage(img, -def.flyDrawW / 2, -def.flyDrawH / 2, def.flyDrawW, def.flyDrawH);
      }

      ctx.restore();
    });

    // ── Draw hit explosions ─────────────────────────────
    this.hits.forEach(h => {
      const def = PROJECTILE_DEFS[h.type];
      const img = this.images[h.type]["hit"];
      if (!img || !img.complete || img.naturalWidth === 0) return;
      const f = def.hitFrames[h.frameIndex];
      ctx.drawImage(img, f.x, f.y, f.w, f.h,
        h.x - def.hitDrawW / 2,
        h.y - def.hitDrawH / 2,
        def.hitDrawW, def.hitDrawH);
    });
  }
}