// abilityEffects.js — Animated effect sprites for special abilities

var EFFECT_DEFS = {
  explosion: {
    image    : "img/special abilities/explosion ability.png",
    frameW   : 256,
    frameH   : 256,
    cols     : 5,
    rows     : 2,
    fps      : 14,
    drawW    : 840,
    drawH    : 840,
    radius   : 500,
    damage   : 110,
    knockback: 180,
  },
  poison: {
    image    : "img/special abilities/poison gas ability.png",
    frameW   : 256,
    frameH   : 256,
    cols     : 5,
    rows     : 2,
    totalFrames: 10,   // only 10 frames (last row has 2)
    fps      : 19,
    drawW    : 750,
    drawH    : 750,
    radius   : 350,
    slowMult : 0.3,
    duration : 10,     // ← 10 seconds
  },
};

// ── Scorch marks ──────────────────────────────────
var _scorchMarks = [];

function _spawnScorch(wx, wy, radius) {
  var r   = radius * 0.45;
  var sz  = Math.ceil(r * 2.2);
  var oc  = document.createElement("canvas");
  oc.width = sz; oc.height = sz;
  var octx = oc.getContext("2d");
  var cx   = sz / 2, cy = sz / 2;

  // Irregular outer burn
  var angles = [0, 0.4, 0.9, 1.5, 2.1, 2.7];
  var scales = [1.0, 0.92, 0.88, 0.95, 0.85, 0.9];
  for (var a = 0; a < angles.length; a++) {
    var og = octx.createRadialGradient(
      cx + Math.cos(angles[a]) * r * 0.08,
      cy + Math.sin(angles[a]) * r * 0.05,
      r * 0.3 * scales[a],
      cx, cy, r * scales[a]
    );
    og.addColorStop(0,    "rgba(0,0,0,0)");
    og.addColorStop(0.55, "rgba(15,6,0,0.3)");
    og.addColorStop(0.82, "rgba(35,12,0,0.55)");
    og.addColorStop(1,    "rgba(0,0,0,0)");
    octx.beginPath();
    octx.ellipse(
      cx + Math.cos(angles[a]) * 6,
      cy + Math.sin(angles[a]) * 4,
      r * scales[a], r * scales[a] * 0.52,
      angles[a] * 0.3, 0, Math.PI * 2
    );
    octx.fillStyle = og;
    octx.fill();
  }

  // Center char
  var cg = octx.createRadialGradient(cx - r*0.06, cy - r*0.04, 0, cx, cy, r*0.52);
  cg.addColorStop(0,    "rgba(8,3,0,0.9)");
  cg.addColorStop(0.35, "rgba(22,8,0,0.78)");
  cg.addColorStop(0.7,  "rgba(35,12,0,0.5)");
  cg.addColorStop(1,    "rgba(0,0,0,0)");
  octx.beginPath();
  octx.ellipse(cx, cy, r*0.52, r*0.3, 0.2, 0, Math.PI*2);
  octx.fillStyle = cg;
  octx.fill();

  // Cracks
  octx.globalAlpha = 0.38;
  octx.strokeStyle = "#1a0800";
  var crackAngles = [0.1, 0.95, 1.8, 2.65, 3.5, 4.35, 5.15];
  var crackLens   = [0.6, 0.45, 0.7, 0.38, 0.55, 0.65, 0.42];
  for (var c2 = 0; c2 < crackAngles.length; c2++) {
    var ca  = crackAngles[c2];
    var len = r * crackLens[c2];
    octx.lineWidth = c2 % 2 === 0 ? 2 : 1;
    octx.beginPath();
    octx.moveTo(cx + Math.cos(ca)*r*0.06, cy + Math.sin(ca)*r*0.06*0.55);
    var mx = cx + Math.cos(ca+0.15)*len*0.5;
    var my = cy + Math.sin(ca+0.15)*len*0.5*0.55;
    octx.quadraticCurveTo(mx, my,
      cx + Math.cos(ca)*len,
      cy + Math.sin(ca)*len*0.55
    );
    octx.stroke();
    if (crackLens[c2] > 0.5) {
      octx.lineWidth = 1;
      octx.beginPath();
      octx.moveTo(mx, my);
      octx.lineTo(mx + Math.cos(ca+0.6)*len*0.22, my + Math.sin(ca+0.6)*len*0.22*0.55);
      octx.stroke();
    }
  }

  _scorchMarks.push({
    wx   : wx,
    wy   : wy,
    r    : r,
    sz   : sz,
    baked: oc,
    timer: 0,
    life : 8.0,
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
    totalFrames: def.totalFrames || (def.cols * def.rows),
    loopCount  : 0,
    maxLoops   : 1,
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

  // ── Poison — apply status to enemies in radius ────
  if (id === "poison" && enemies) {
    var pradius   = def.radius   || 400;
    var slowMult  = def.slowMult || 0.4;
    var duration  = def.duration || 15;

    for (var i = 0; i < enemies.length; i++) {
      var e = enemies[i];
      if (!e || !e.alive || e.dying || e.smoking) continue;

      var dx   = e.x - wx;
      var dy   = e.y - wy;
      var dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > pradius) continue;

      e.poisoned       = true;
      e.poisonTimer    = duration;
      e.poisonTick     = 0;
      e.poisonSlowMult = slowMult;
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

      if (e.frame >= e.totalFrames) {
        e.loopCount++;
        if (e.loopCount >= e.maxLoops) {
          e.done = true;
        } else {
          e.frame = 0; // only reset if looping again
        }
      }
    }
  }
};

function _drawScorches(ctx) {
  for (var i = 0; i < _scorchMarks.length; i++) {
    var s     = _scorchMarks[i];
    var alpha = 1 - (s.timer / s.life);
    alpha     = alpha * alpha;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.drawImage(s.baked, s.wx - s.sz/2, s.wy - s.sz/2);
    ctx.restore();
  }
}

AbilityEffectManager.prototype.drawScorch = function(ctx) {
  _drawScorches(ctx);
};

AbilityEffectManager.prototype.drawEffects = function(ctx) {
  // Explosion/poison sprites
  for (var i = 0; i < this.active.length; i++) {
    var e   = this.active[i];
    var def = EFFECT_DEFS[e.id];
    var img = this.images[e.id];
    if (!img || !img.complete || img.naturalWidth === 0) continue;

    var frame = Math.min(e.frame, e.totalFrames - 1);
    var col = frame % def.cols;
    var row = Math.floor(frame / def.cols);

    // Poison fades out on last loop
    var alpha = 1;
    if (e.id === "poison" && e.maxLoops > 1) {
      alpha = e.loopCount < e.maxLoops - 1 ? 1 : 1 - (e.frame / e.totalFrames);
    }

    ctx.save();
    if (alpha < 1) ctx.globalAlpha = Math.max(0, alpha);
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