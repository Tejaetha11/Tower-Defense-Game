// abilityEffects.js — Animated effect sprites for special abilities

var EFFECT_DEFS = {
  explosion: {
    image    : "img/special abilities/explosion ability.png",
    frameW   : 256,
    frameH   : 256,
    cols     : 5,
    rows     : 2,
    fps      : 14,
    drawW    : 1000,
    drawH    : 1000,
    radius   : 500,
    damage   : 110,
    knockback: 180,
  },
};

// ── Scorch marks ──────────────────────────────────
var _scorchMarks = [];

function _spawnScorch(wx, wy, radius) {
  _scorchMarks.push({
    wx    : wx,
    wy    : wy,
    r     : radius * 0.45,
    timer : 0,
    life  : 8.0,   // ← seconds before fully faded
  });
}

function _updateScorches(dt) {
  for (var i = _scorchMarks.length - 1; i >= 0; i--) {
    _scorchMarks[i].timer += dt;
    if (_scorchMarks[i].timer >= _scorchMarks[i].life)
      _scorchMarks.splice(i, 1);
  }
}

// ── Damage numbers ────────────────────────────────
var _dmgNumbers = [];

function _spawnDmgNumber(x, y, amount) {
  _dmgNumbers.push({
    x     : x,
    y     : y,
    amount: amount,
    timer : 0,
    life  : 1.2,
    vy    : -180,
  });
}

function _updateDmgNumbers(dt) {
  for (var i = _dmgNumbers.length - 1; i >= 0; i--) {
    var d = _dmgNumbers[i];
    d.timer += dt;
    d.y     += d.vy * dt;
    d.vy    *= 0.92;
    if (d.timer >= d.life) _dmgNumbers.splice(i, 1);
  }
}

function _drawDmgNumbers(ctx) {
  for (var i = 0; i < _dmgNumbers.length; i++) {
    var d     = _dmgNumbers[i];
    var alpha = 1 - (d.timer / d.life);
    var size  = Math.round(22 * (1 + (1 - alpha) * 0.4));
    ctx.save();
    ctx.globalAlpha  = alpha;
    ctx.font         = "bold " + size + "px serif";
    ctx.textAlign    = "center";
    ctx.textBaseline = "middle";
    ctx.strokeStyle  = "#3a0000";
    ctx.lineWidth    = 4;
    ctx.strokeText("-" + d.amount, d.x, d.y);
    ctx.fillStyle = d.amount > 80 ? "#ff4400" : "#ff8800";
    ctx.fillText("-" + d.amount, d.x, d.y);
    ctx.restore();
  }
}

// ── AbilityEffectManager ──────────────────────────
function AbilityEffectManager() {
  this.images = {};
  this.active = [];
}

AbilityEffectManager.prototype.load = function(onReady) {
  var keys  = Object.keys(EFFECT_DEFS);
  var total = keys.length, done = 0;
  var self  = this;
  keys.forEach(function(id) {
    var def = EFFECT_DEFS[id];
    var img = new Image();
    img.src = def.image;
    img.onload = img.onerror = function() {
      self.images[id] = img;
      done++;
      if (done >= total) onReady();
    };
  });
};

AbilityEffectManager.prototype.spawn = function(id, wx, wy, enemies) {
  var def = EFFECT_DEFS[id];
  if (!def) return;

  this.active.push({
    id         : id,
    wx         : wx,
    wy         : wy,
    frame      : 0,
    frameTimer : 0,
    totalFrames: def.cols * def.rows,
    done       : false,
    scorchSpawned: false,
  });

  // ── Explosion damage + knockback ──────────────────
  if (id === "explosion" && enemies) {
    var radius  = def.radius   || 300;
    var damage  = def.damage   || 60;
    var kbForce = def.knockback|| 180;

    for (var i = 0; i < enemies.length; i++) {
      var e = enemies[i];
      if (!e || !e.alive || e.dying || e.smoking) continue;

      var dx   = e.x - wx;
      var dy   = e.y - wy;
      var dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > radius) continue;

      var falloff = 1 - (dist / radius) * 0.5;
      var dmg     = Math.round(damage * falloff);
      e.takeDamage(dmg);
      _spawnDmgNumber(e.x, e.y - 60, dmg);

      if (!e.dying && e.alive) {
        var kbDist = kbForce * falloff;
        var nx     = dist > 0 ? dx / dist : 0;
        var ny     = dist > 0 ? dy / dist : 0;
        var kbDur  = 0.25;
        e.knockbackVX    = nx * (kbDist / kbDur);
        e.knockbackVY    = ny * (kbDist / kbDur);
        e.knockbackTimer = kbDur;
      }
    }
  }
};

AbilityEffectManager.prototype.update = function(dt) {
  _updateDmgNumbers(dt);
  _updateScorches(dt);

  for (var i = this.active.length - 1; i >= 0; i--) {
    var e   = this.active[i];
    if (e.done) { this.active.splice(i, 1); continue; }
    var def = EFFECT_DEFS[e.id];

    e.frameTimer += dt;
    if (e.frameTimer >= 1 / def.fps) {
      e.frameTimer -= 1 / def.fps;
      e.frame++;

      // Spawn scorch when explosion reaches midpoint
      if (e.id === "explosion" && !e.scorchSpawned && e.frame >= Math.floor(e.totalFrames * 0.5)) {
        _spawnScorch(e.wx, e.wy, def.radius || 300);
        e.scorchSpawned = true;
      }

      if (e.frame >= e.totalFrames) e.done = true;
    }
  }
};

function _drawScorches(ctx) {
  for (var i = 0; i < _scorchMarks.length; i++) {
    var s     = _scorchMarks[i];
    var alpha = 1 - (s.timer / s.life);
    alpha     = alpha * alpha;

    ctx.save();

    // Irregular outer burn — use multiple overlapping ellipses at slight offsets/rotations
    var angles  = [0, 0.4, 0.9, 1.5, 2.1, 2.7];
    var scales  = [1.0, 0.92, 0.88, 0.95, 0.85, 0.9];
    for (var a = 0; a < angles.length; a++) {
      var og = ctx.createRadialGradient(
        s.wx + Math.cos(angles[a]) * s.r * 0.08,
        s.wy + Math.sin(angles[a]) * s.r * 0.05,
        s.r * 0.3 * scales[a],
        s.wx, s.wy,
        s.r * scales[a]
      );
      og.addColorStop(0,    "rgba(0,0,0,0)");
      og.addColorStop(0.55, "rgba(15,6,0," + (alpha * 0.3) + ")");
      og.addColorStop(0.82, "rgba(35,12,0," + (alpha * 0.55) + ")");
      og.addColorStop(1,    "rgba(0,0,0,0)");
      ctx.beginPath();
      ctx.ellipse(
        s.wx + Math.cos(angles[a]) * 6,
        s.wy + Math.sin(angles[a]) * 4,
        s.r * scales[a],
        s.r * scales[a] * 0.52,
        angles[a] * 0.3,
        0, Math.PI * 2
      );
      ctx.fillStyle = og;
      ctx.fill();
    }

    // Center char patch — darkest, slightly offset for natural feel
    var cg = ctx.createRadialGradient(
      s.wx - s.r * 0.06, s.wy - s.r * 0.04, 0,
      s.wx, s.wy, s.r * 0.52
    );
    cg.addColorStop(0,    "rgba(8,3,0,"   + (alpha * 0.9) + ")");
    cg.addColorStop(0.35, "rgba(22,8,0,"  + (alpha * 0.78) + ")");
    cg.addColorStop(0.7,  "rgba(35,12,0," + (alpha * 0.5) + ")");
    cg.addColorStop(1,    "rgba(0,0,0,0)");
    ctx.beginPath();
    ctx.ellipse(s.wx, s.wy, s.r * 0.52, s.r * 0.3, 0.2, 0, Math.PI * 2);
    ctx.fillStyle = cg;
    ctx.fill();

    // Cracks — varied lengths and slight curves
    ctx.globalAlpha = alpha * 0.38;
    ctx.strokeStyle = "#1a0800";
    var crackAngles = [0.1, 0.95, 1.8, 2.65, 3.5, 4.35, 5.15];
    var crackLens   = [0.6, 0.45, 0.7, 0.38, 0.55, 0.65, 0.42];
    for (var c = 0; c < crackAngles.length; c++) {
      var ca  = crackAngles[c];
      var len = s.r * crackLens[c];
      ctx.lineWidth = c % 2 === 0 ? 2 : 1;
      ctx.beginPath();
      ctx.moveTo(
        s.wx + Math.cos(ca) * s.r * 0.06,
        s.wy + Math.sin(ca) * s.r * 0.06 * 0.55
      );
      // Mid point with slight curve
      var mx = s.wx + Math.cos(ca + 0.15) * len * 0.5;
      var my = s.wy + Math.sin(ca + 0.15) * len * 0.5 * 0.55;
      var ex = s.wx + Math.cos(ca) * len;
      var ey = s.wy + Math.sin(ca) * len * 0.55;
      ctx.quadraticCurveTo(mx, my, ex, ey);
      ctx.stroke();

      // Small branch on longer cracks
      if (crackLens[c] > 0.5) {
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(mx, my);
        ctx.lineTo(
          mx + Math.cos(ca + 0.6) * len * 0.22,
          my + Math.sin(ca + 0.6) * len * 0.22 * 0.55
        );
        ctx.stroke();
      }
    }

    ctx.restore();
  }
}

AbilityEffectManager.prototype.drawScorch = function(ctx) {
  _drawScorches(ctx);
};

AbilityEffectManager.prototype.drawEffects = function(ctx) {
  // Explosion sprites
  for (var i = 0; i < this.active.length; i++) {
    var e   = this.active[i];
    var def = EFFECT_DEFS[e.id];
    var img = this.images[e.id];
    if (!img || !img.complete || img.naturalWidth === 0) continue;

    var col = e.frame % def.cols;
    var row = Math.floor(e.frame / def.cols);

    ctx.save();
    ctx.drawImage(
      img,
      col * def.frameW, row * def.frameH, def.frameW, def.frameH,
      e.wx - def.drawW / 2,
      e.wy - def.drawH / 2,
      def.drawW, def.drawH
    );
    ctx.restore();
  }

  // Damage numbers on top
  _drawDmgNumbers(ctx);
};