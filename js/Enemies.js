// enemies.js — Enemy with sprite sheet walk animation

// ── Floating damage numbers ───────────────────────
var _enemyDmgNumbers = [];

function _spawnEnemyDmgNumber(x, y, amount, isPoison) {
  _enemyDmgNumbers.push({
    x      : x + (Math.random() - 0.5) * 20,
    y      : y,
    amount : amount,
    timer  : 0,
    life   : 1.0,
    vy     : -120 - Math.random() * 40,
    poison : !!isPoison,
  });
}

function updateEnemyDmgNumbers(dt) {
  for (var i = _enemyDmgNumbers.length - 1; i >= 0; i--) {
    var d = _enemyDmgNumbers[i];
    d.timer += dt;
    d.y     += d.vy * dt;
    d.vy    *= 0.94;
    if (d.timer >= d.life) _enemyDmgNumbers.splice(i, 1);
  }
}

function drawEnemyDmgNumbers(ctx) {
  for (var i = 0; i < _enemyDmgNumbers.length; i++) {
    var d     = _enemyDmgNumbers[i];
    var alpha = 1 - (d.timer / d.life);
    var size  = Math.round(22 * (1 + (1 - alpha) * 0.3));
    ctx.save();
    ctx.globalAlpha  = alpha;
    ctx.font         = "bold " + size + "px serif";
    ctx.textAlign    = "center";
    ctx.textBaseline = "middle";
    if (d.poison) {
      // Green poison damage numbers
      ctx.strokeStyle = "#c90707";
      ctx.lineWidth   = 3;
      ctx.strokeText("-" + d.amount, d.x, d.y);
      ctx.fillStyle   = "#920c0c";
      ctx.fillText("-" + d.amount, d.x, d.y);
    } else {
      // Red damage numbers
      ctx.strokeStyle = "#000000";
      ctx.lineWidth   = 3;
      ctx.strokeText("-" + d.amount, d.x, d.y);
      ctx.fillStyle   = "#ff2222";
      ctx.fillText("-" + d.amount, d.x, d.y);
    }
    ctx.restore();
  }
}

const ENEMY_DEFS = {
  enemy1: {
    image     : "./enemy1.png",
    frameW    : 309,
    frameH    : 257,
    cols      : 5,
    walkFrames: Array.from({ length: 20 }, (_, i) => ({
      x: (i % 5) * 309,
      y: Math.floor(i / 5) * 257,
      w: 309,
      h: 257,
    })),
    walkFPS   : 23,
    deathFrames: Array.from({ length: 20 }, (_, i) => ({
      x: (i % 5) * 309,
      y: (8 + Math.floor(i / 5)) * 257,
      w: 309,
      h: 257,
    })),
    deathFPS  : 10,
    baseDrawW  : 80,
    baseDrawH  : 66,
    drawOffsetX: 30,
    drawOffsetY: -32,

    // Death smoke effect
    smokeImage : "./enemydeathsmoke.png",
    smokeFrames: [
      { x: 88,  y: 103, w: 45,  h: 38  },
      { x: 235, y: 101, w: 56,  h: 51  },
      { x: 414, y: 86,  w: 89,  h: 82  },
      { x: 596, y: 67,  w: 125, h: 120 },
      { x: 807, y: 39,  w: 180, h: 171 },
      { x: 46,  y: 248, w: 189, h: 189 },
      { x: 310, y: 243, w: 203, h: 204 },
      { x: 567, y: 252, w: 188, h: 187 },
      { x: 810, y: 255, w: 188, h: 187 },
    ],
    smokeFPS   : 12,
    smokeDrawW : 200,
    smokeDrawH : 200,
  }
};

const ENEMY_IMAGES = {};
const SMOKE_IMAGES  = {};

function loadEnemyImages(onReady) {
  const keys = Object.keys(ENEMY_DEFS);
  let done   = 0;
  // Count total loads (enemy + smoke per def)
  const totalKeys = keys.length;
  keys.forEach(key => {
    const def = ENEMY_DEFS[key];
    let loaded = 0;
    const check = () => { loaded++; done++; if (done >= totalKeys * 2) onReady(); };

    const img  = new Image();
    img.src    = def.image;
    img.onload = img.onerror = () => { ENEMY_IMAGES[key] = img; check(); };

    const simg  = new Image();
    simg.src    = def.smokeImage;
    simg.onload = simg.onerror = () => { SMOKE_IMAGES[key] = simg; check(); };
  });
  if (keys.length === 0) onReady();
}

class Enemy {
  constructor(waypoints, type = "enemy1") {
    this.type = type;
    this.x    = waypoints[0].x;
    this.y    = waypoints[0].y;

    this.scale      = 2.3;
    this.baseWidth  = 60;
    this.baseHeight = 35;

    this.speed         = 200;
    this.waypoints     = waypoints;
    this.waypointIndex = 1;
    this.alive         = true;
    this.reachedEnd    = false;
    this.dx            = 0;
    this.dy            = 0;
    this.facingLeft    = false;

    this.frameIndex      = 0;
    this.frameTimer      = 0;
    this.deathFrameIndex = 0;
    this.deathFrameTimer = 0;

    this.maxHealth     = 100;
    this.health        = 100;
    this.flashTimer    = 0;
    this.flashDuration = 0.12;
    this.deathTimer    = 2.0;
    this.deathDuration = 2.0;
    this.knockbackVX   = 0;
    this.knockbackVY   = 0;
    this.knockbackTimer= 0;

    // Poison status
    this.poisoned      = false;
    this.poisonTimer   = 0;
    this.poisonTick    = 0;  // accumulates time for 1-second ticks
    this.poisonSlowMult= 1.0;
    this.dying         = false;

    // Smoke state — plays after death animation finishes
    this.smoking        = false;
    this.smokeFrameIdx  = 0;
    this.smokeFrameTimer= 0;
    this.smokeX         = 0;
    this.smokeY         = 0;
  }

  get width()  { return this.baseWidth  * this.scale; }
  get height() { return this.baseHeight * this.scale; }

  takeDamage(amount, isPoison) {
    if (!this.alive || this.dying || this.smoking) return;
    this.health -= amount;
    // Spawn floating damage number above enemy
    _spawnEnemyDmgNumber(this.x, this.y - 60, amount, isPoison);
    if (this.health <= 0) {
      this.health          = 0;
      this.dying           = true;
      this.deathTimer      = this.deathDuration;
      this.deathFrameIndex = 0;
      this.deathFrameTimer = 0;
    }
  }

  _moveToward(tx, ty, step) {
    const dx   = tx - this.x;
    const dy   = ty - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist === 0) return step;

    this.dx = dx / dist;
    this.dy = dy / dist;

    if (Math.abs(this.dx) > 0.4) {
      this.facingLeft = this.dx < 0;
    }

    if (step >= dist) {
      this.x = tx;
      this.y = ty;
      return step - dist;
    } else {
      this.x += this.dx * step;
      this.y += this.dy * step;
      return 0;
    }
  }

  update(dt) {
    if (!this.alive) return;

    if (this.dying) {
      const def = ENEMY_DEFS[this.type];
      this.deathFrameTimer += dt;
      if (this.deathFrameTimer >= 1 / def.deathFPS) {
        this.deathFrameTimer -= 1 / def.deathFPS;
        this.deathFrameIndex++;
        // When all death frames played — switch to smoke
        if (this.deathFrameIndex >= def.deathFrames.length) {
          this.dying           = false;
          this.smoking         = true;
          this.smokeX          = this.x + (def.drawOffsetX || 0);
          this.smokeY          = this.y + (def.drawOffsetY || 0);
          this.smokeFrameIdx   = 0;
          this.smokeFrameTimer = 0;
        }
      }
      return;
    }

    // Smoke plays after death animation
    if (this.smoking) {
      const def = ENEMY_DEFS[this.type];
      this.smokeFrameTimer += dt;
      if (this.smokeFrameTimer >= 1 / def.smokeFPS) {
        this.smokeFrameTimer -= 1 / def.smokeFPS;
        this.smokeFrameIdx++;
        if (this.smokeFrameIdx >= def.smokeFrames.length) {
          this.alive   = false; // fully done
          this.smoking = false;
        }
      }
      return;
    }

    // Poison — tick damage + slow
    if (this.poisoned) {
      this.poisonTimer -= dt;
      this.poisonTick  += dt;
      if (this.poisonTick >= 1.0) {
        this.poisonTick -= 1.0;
        this.takeDamage(5, true);
      }
      if (this.poisonTimer <= 0) {
        this.poisoned       = false;
        this.poisonSlowMult = 1.0;
        this._poisonParticles = [];
      }

      // Spawn bubble particle
      if (!this._poisonParticles) this._poisonParticles = [];
      if (!this._poisonSpawnTimer) this._poisonSpawnTimer = 0;
      this._poisonSpawnTimer -= dt;
      if (this._poisonSpawnTimer <= 0) {
        this._poisonSpawnTimer = 0.18 + Math.random() * 0.15;
        this._poisonParticles.push({
          x    : this.x + (Math.random() - 0.5) * 30,
          y    : this.y - 20,
          vy   : -(40 + Math.random() * 30),
          vx   : (Math.random() - 0.5) * 15,
          r    : 4 + Math.random() * 4,
          age  : 0,
          life : 0.8 + Math.random() * 0.5,
          inner: Math.random() > 0.5 ? "#88ff44" : "#44dd22",
        });
      }
      // Update particles
      for (var pi = this._poisonParticles.length - 1; pi >= 0; pi--) {
        var p = this._poisonParticles[pi];
        p.age += dt;
        p.x   += p.vx * dt;
        p.y   += p.vy * dt;
        p.vy  *= 0.95;
        if (p.age >= p.life) this._poisonParticles.splice(pi, 1);
      }
    } else if (this._poisonParticles && this._poisonParticles.length > 0) {
      // Drain remaining particles after poison ends
      for (var pi = this._poisonParticles.length - 1; pi >= 0; pi--) {
        var p = this._poisonParticles[pi];
        p.age += dt;
        p.x   += p.vx * dt;
        p.y   += p.vy * dt;
        p.vy  *= 0.95;
        if (p.age >= p.life) this._poisonParticles.splice(pi, 1);
      }
    }

    // Knockback — overrides normal movement briefly
    if (this.knockbackTimer > 0) {
      this.knockbackTimer -= dt;
      this.x += this.knockbackVX * dt;
      this.y += this.knockbackVY * dt;
      return;
    }

    let remaining = this.speed * this.poisonSlowMult * dt;
    while (remaining > 0) {
      if (this.waypointIndex >= this.waypoints.length) {
        this.alive      = false;
        this.reachedEnd = true;
        break;
      }
      const target = this.waypoints[this.waypointIndex];
      remaining = this._moveToward(target.x, target.y, remaining);
      if (remaining > 0) this.waypointIndex++;
    }

    const def = ENEMY_DEFS[this.type];
    this.frameTimer += dt;
    if (this.frameTimer >= 1 / def.walkFPS) {
      this.frameTimer -= 1 / def.walkFPS;
      this.frameIndex  = (this.frameIndex + 1) % def.walkFrames.length;
    }
  }

  draw(c) {
    if (!this.alive) return;

    const def   = ENEMY_DEFS[this.type];
    const img   = ENEMY_IMAGES[this.type];
    const drawW = def.baseDrawW * this.scale;
    const drawH = def.baseDrawH * this.scale;
    const hw    = drawW / 2;
    const hh    = drawH / 2;
    const drawX = this.x + (def.drawOffsetX || 0);
    const drawY = this.y + (def.drawOffsetY || 0);

    // Death animation — plays fully, no fade
    if (this.dying) {
      const frameIdx = Math.min(this.deathFrameIndex, def.deathFrames.length - 1);
      const frame = def.deathFrames[frameIdx];
      c.globalAlpha = 1;
      c.save();
      if (this.facingLeft) {
        c.translate(drawX, drawY);
        c.scale(-1, 1);
        c.drawImage(img, frame.x, frame.y, frame.w, frame.h, -hw, -hh, drawW, drawH);
      } else {
        c.drawImage(img, frame.x, frame.y, frame.w, frame.h, drawX - hw, drawY - hh, drawW, drawH);
      }
      c.restore();
      c.globalAlpha = 1;
      return;
    }

    // Smoke after death
    if (this.smoking) {
      const simg  = SMOKE_IMAGES[this.type];
      const sdef  = ENEMY_DEFS[this.type];
      if (simg && simg.complete && simg.naturalWidth > 0) {
        const sf = sdef.smokeFrames[this.smokeFrameIdx];
        c.drawImage(
          simg,
          sf.x, sf.y, sf.w, sf.h,
          this.smokeX - sdef.smokeDrawW / 2,
          this.smokeY - sdef.smokeDrawH / 2,
          sdef.smokeDrawW, sdef.smokeDrawH
        );
      }
      return;
    }

    if (img && img.complete && img.naturalWidth > 0) {
      const frame = def.walkFrames[this.frameIndex];

      c.save();
      if (this.facingLeft) {
        c.translate(drawX, drawY);
        c.scale(-1, 1);
        c.drawImage(img, frame.x, frame.y, frame.w, frame.h, -hw, -hh, drawW, drawH);
      } else {
        c.drawImage(img, frame.x, frame.y, frame.w, frame.h, drawX - hw, drawY - hh, drawW, drawH);
      }
      c.restore();

      // Poison indicator — rising green bubble particles
      if (this.poisoned) {
        if (!this._poisonParticles) {
          this._poisonParticles = [];
        }
        // Spawn new bubble occasionally
        if (!this._poisonSpawnTimer) this._poisonSpawnTimer = 0;
        // We use poisonTimer as a proxy — just draw existing particles
        c.save();
        for (var pi = 0; pi < this._poisonParticles.length; pi++) {
          var p = this._poisonParticles[pi];
          var palpha = 1 - (p.age / p.life);
          c.globalAlpha = palpha * 0.85;
          c.beginPath();
          c.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          c.fillStyle = p.inner;
          c.fill();
          c.globalAlpha = palpha * 0.5;
          c.strokeStyle = "#00cc33";
          c.lineWidth   = 1;
          c.stroke();
        }
        c.restore();
        c.globalAlpha = 1;
      }

    } else {
      c.fillStyle = "#cc2200";
      c.fillRect(drawX - hw, drawY - hh, drawW, drawH);
    }

    // Health bar
    const barW  = drawW * 1.1;
    const barH  = 18;
    const barX  = this.x - barW / 2;
    const barY  = drawY - hh - 26;
    const pct   = this.health / this.maxHealth;
    const fillW = pct * barW;
    const barR  = barH / 2;

    c.save();
    c.shadowColor   = "rgba(0,0,0,0.6)";
    c.shadowBlur    = 4;
    c.shadowOffsetY = 2;
    c.beginPath();
    c.roundRect(barX - 2, barY - 2, barW + 4, barH + 4, barR + 2);
    c.fillStyle = "#000";
    c.fill();
    c.restore();

    c.beginPath();
    c.roundRect(barX, barY, barW, barH, barR);
    c.fillStyle = "#1a1a1a";
    c.fill();

    let fillColor;
    if (pct > 0.6)      fillColor = ["#22dd22", "#18aa18"];
    else if (pct > 0.3) fillColor = ["#ddcc00", "#aa9900"];
    else                fillColor = ["#dd2200", "#aa1100"];

    if (fillW > 0) {
      const grad = c.createLinearGradient(barX, barY, barX, barY + barH);
      grad.addColorStop(0, fillColor[0]);
      grad.addColorStop(1, fillColor[1]);
      c.beginPath();
      c.roundRect(barX, barY, fillW, barH, barR);
      c.fillStyle = grad;
      c.fill();

      const shine = c.createLinearGradient(barX, barY, barX, barY + barH * 0.5);
      shine.addColorStop(0, "rgba(255,255,255,0.35)");
      shine.addColorStop(1, "rgba(255,255,255,0)");
      c.beginPath();
      c.roundRect(barX + 1, barY + 1, Math.max(0, fillW - 2), barH * 0.5, barR);
      c.fillStyle = shine;
      c.fill();
    }

    c.beginPath();
    c.roundRect(barX, barY, barW, barH, barR);
    c.strokeStyle = "rgba(0,0,0,0.5)";
    c.lineWidth   = 1;
    c.stroke();
  }
}