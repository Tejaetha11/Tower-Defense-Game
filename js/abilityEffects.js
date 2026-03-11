// abilityEffects.js — Animated effect sprites for special abilities

var EFFECT_DEFS = {
  explosion: {
    image      : "img/special abilities/explosion ability.png",
    frameW     : 256,
    frameH     : 256,
    cols       : 5,
    rows       : 2,
    fps        : 14,
    drawW      : 840,
    drawH      : 840,
    drawOffsetX: -10,    
    drawOffsetY: -25,
    radius     : 500,
    damage     : 110,
    knockback  : 180,
  },
  poison: {
    image      : "img/special abilities/poison gas ability.png",
    frameW     : 256,
    frameH     : 256,
    cols       : 4,
    rows       : 3,
    totalFrames: 10,
    fps        : 13,
    drawW      : 750,
    drawH      : 750,
    drawOffsetX: 0,
    drawOffsetY: 0,
    radius     : 400,
    slowMult   : 0.4,
    duration   : 10,
  },
  lightning: {
    image      : "img/special abilities/lightning ability1.png",
    frameW     : 64,
    frameH     : 193,
    cols       : 5,
    rows       : 3,
    totalFrames: 13,
    fps        : 16,
    drawW      : 220,
    drawH      : 660,
    drawOffsetX: 0,
    drawOffsetY: 40,
    impactFrame: 2,
    impactImage : "img/special abilities/lightning ability 2.png",
    impactFrameW: 64,
    impactFrameH: 64,
    impactCols  : 2,
    impactRows  : 2,
    impactTotal : 4,
    impactFps   : 7,
    impactDrawW : 300,
    impactDrawH : 300,
    impactStopAt: 11,    // ← stop showing impact after bolt frame 11
    radius     : 300,
    damage     : 120,
    slowMult   : 0.5,
    slowDur    : 3,
  },
  nuclear: {
    image      : "img/special abilities/nuclear ability.png",
    frameW     : 256,
    frameH     : 256,
    cols       : 5,
    rows       : 2,
    totalFrames: 10,
    fps        : 13,
    drawW      : 1000,
    drawH      : 1000,
    drawOffsetX: 0,
    drawOffsetY: -115,
    radius     : 550,
    innerRadius: 120,
    damage     : 140,
    shakeDur   : 0.5,
    shakeMag   : 18,
    radZoneLife: 12,
    radDamage  : 9,
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

  var cg = octx.createRadialGradient(cx - r*0.06, cy - r*0.04, 0, cx, cy, r*0.52);
  cg.addColorStop(0,    "rgba(8,3,0,0.9)");
  cg.addColorStop(0.35, "rgba(22,8,0,0.78)");
  cg.addColorStop(0.7,  "rgba(35,12,0,0.5)");
  cg.addColorStop(1,    "rgba(0,0,0,0)");
  octx.beginPath();
  octx.ellipse(cx, cy, r*0.52, r*0.3, 0.2, 0, Math.PI*2);
  octx.fillStyle = cg;
  octx.fill();

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

// ── Radiation zones ───────────────────────────────
var _radZones = [];

function _spawnRadZone(wx, wy, radius, life, damagePerSec) {
  var sz  = Math.ceil(radius * 2.4);
  var oc  = document.createElement("canvas");
  oc.width = sz; oc.height = sz;
  var octx = oc.getContext("2d");
  var cx   = sz / 2, cy = sz / 2;
  var r    = radius;

  var og = octx.createRadialGradient(cx, cy, r * 0.45, cx, cy, r);
  og.addColorStop(0,    "rgba(255,30,0,0)");
  og.addColorStop(0.6,  "rgba(255,30,0,0.25)");
  og.addColorStop(0.88, "rgba(220,20,0,0.55)");
  og.addColorStop(1,    "rgba(0,0,0,0)");
  octx.beginPath();
  octx.ellipse(cx, cy, r, r * 0.5, 0, 0, Math.PI * 2);
  octx.fillStyle = og;
  octx.fill();

  octx.beginPath();
  octx.ellipse(cx, cy, r * 0.9, r * 0.45, 0, 0, Math.PI * 2);
  octx.strokeStyle = "rgba(255,50,10,0.75)";
  octx.lineWidth   = 3;
  octx.stroke();

  _radZones.push({
    wx          : wx,
    wy          : wy,
    radius      : radius,
    sz          : sz,
    baked       : oc,
    timer       : 0,
    life        : life,
    damagePerSec: damagePerSec,
    tickTimer   : 0,
    pulseT      : 0,
    particles   : [],
    partTimer   : 0,
  });
}

function _updateRadZones(dt, enemies) {
  for (var i = _radZones.length - 1; i >= 0; i--) {
    var z = _radZones[i];
    z.timer     += dt;
    z.pulseT    += dt;
    z.tickTimer += dt;
    z.partTimer += dt;

    if (z.partTimer >= 0.07) {
      z.partTimer = 0;
      var angle = Math.random() * Math.PI * 2;
      var pdist = Math.random() * z.radius * 0.85;
      z.particles.push({
        x   : z.wx + Math.cos(angle) * pdist,
        y   : z.wy + Math.sin(angle) * pdist * 0.5,
        vy  : -(20 + Math.random() * 25),
        vx  : (Math.random() - 0.5) * 8,
        r   : 3 + Math.random() * 4,
        age : 0,
        life: 0.7 + Math.random() * 0.7,
      });
    }

    for (var p = z.particles.length - 1; p >= 0; p--) {
      var pt = z.particles[p];
      pt.age += dt;
      pt.x   += pt.vx * dt;
      pt.y   += pt.vy * dt;
      pt.vy  *= 0.97;
      if (pt.age >= pt.life) z.particles.splice(p, 1);
    }

    if (z.tickTimer >= 0.5) {
      z.tickTimer -= 0.5;
      if (enemies) {
        for (var j = 0; j < enemies.length; j++) {
          var en = enemies[j];
          if (!en || !en.alive || en.dying || en.smoking) continue;
          var ddx  = en.x - z.wx;
          var ddy  = en.y - z.wy;
          var dd   = Math.sqrt(ddx*ddx + ddy*ddy);
          if (dd <= z.radius) en.takeDamage(Math.round(z.damagePerSec * 0.5));
        }
      }
    }

    if (z.timer >= z.life) _radZones.splice(i, 1);
  }
}

function _drawRadZones(ctx) {
  for (var i = 0; i < _radZones.length; i++) {
    var z         = _radZones[i];
    var t         = z.timer / z.life;
    var fadeAlpha = t < 0.75 ? 1.0 : 1.0 - ((t - 0.75) / 0.25);
    var pulse     = 0.82 + Math.sin(z.pulseT * 3.0) * 0.18;
    var finalA    = fadeAlpha * pulse * 0.85;

    ctx.save();
    ctx.globalAlpha = finalA;
    ctx.drawImage(z.baked, z.wx - z.sz/2, z.wy - z.sz/2);
    ctx.restore();

    for (var p = 0; p < z.particles.length; p++) {
      var pt     = z.particles[p];
      var palpha = (1 - pt.age / pt.life) * fadeAlpha;
      var pr     = pt.r * (1 - pt.age / pt.life * 0.4);
      var heat   = 1 - pt.age / pt.life;
      ctx.save();
      ctx.globalAlpha = palpha;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, Math.max(0.8, pr), 0, Math.PI * 2);
      ctx.fillStyle = "rgb(255," + Math.round(80 * heat) + ",0)";
      ctx.fill();
      ctx.restore();
    }
  }
}

// ── Electric pulses ───────────────────────────────
var _electricPulses = [];

function _spawnElectricPulse(x, y) {
  _electricPulses.push({
    x     : x,
    y     : y,
    timer : 0,
    life  : 1.2,
    arcs  : Array.from({ length: 8 }, function() {
      return {
        angle : Math.random() * Math.PI * 2,
        len   : 20 + Math.random() * 40,
        jags  : Math.floor(3 + Math.random() * 4),
        phase : Math.random() * Math.PI * 2,
      };
    }),
  });
}

function _updateElectricPulses(dt) {
  for (var i = _electricPulses.length - 1; i >= 0; i--) {
    _electricPulses[i].timer += dt;
    if (_electricPulses[i].timer >= _electricPulses[i].life)
      _electricPulses.splice(i, 1);
  }
}

function _drawElectricPulses(ctx) {
  for (var i = 0; i < _electricPulses.length; i++) {
    var ep    = _electricPulses[i];
    var t     = ep.timer / ep.life;
    var alpha = t < 0.3 ? (t / 0.3) : (1 - t);
    ctx.save();
    ctx.globalAlpha = alpha * 0.9;
    for (var a = 0; a < ep.arcs.length; a++) {
      var arc   = ep.arcs[a];
      if (Math.random() < 0.35) continue;
      var angle = arc.angle + Math.sin(ep.timer * 18 + arc.phase) * 0.3;
      var len   = arc.len * (1 - t * 0.5);
      ctx.beginPath();
      ctx.strokeStyle = Math.random() > 0.4 ? "#aaddff" : "#ffffff";
      ctx.lineWidth   = 1.5;
      ctx.shadowColor = "#66bbff";
      ctx.shadowBlur  = 8;
      var sx = ep.x, sy = ep.y;
      var segLen = len / arc.jags;
      for (var j = 0; j < arc.jags; j++) {
        var jAngle = angle + (Math.random() - 0.5) * 1.2;
        var ex = sx + Math.cos(jAngle) * segLen;
        var ey = sy + Math.sin(jAngle) * segLen;
        ctx.moveTo(sx, sy);
        ctx.lineTo(ex, ey);
        sx = ex; sy = ey;
      }
      ctx.stroke();
    }
    ctx.restore();
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
  var keys    = Object.keys(EFFECT_DEFS);
  var self    = this;
  var total   = 0;
  var done    = 0;

  function check() { done++; if (done >= total) onReady(); }

  keys.forEach(function(id) {
    var def = EFFECT_DEFS[id];
    total++;
    var img = new Image();
    img.src = def.image;
    img.onload = img.onerror = function() { self.images[id] = img; check(); };

    if (def.impactImage) {
      total++;
      var img2 = new Image();
      img2.src = def.impactImage;
      img2.onload = img2.onerror = function() { self.images[id + "_impact"] = img2; check(); };
    }
  });
};

AbilityEffectManager.prototype.spawn = function(id, wx, wy, enemies) {
  var def = EFFECT_DEFS[id];
  if (!def) return;

  this.active.push({
    id              : id,
    wx              : wx,
    wy              : wy,
    frame           : 0,
    frameTimer      : 0,
    totalFrames     : def.totalFrames || (def.cols * def.rows),
    loopCount       : 0,
    maxLoops        : 1,
    done            : false,
    scorchSpawned   : false,
    enemies         : (id === "poison" || id === "nuclear" || id === "lightning") ? enemies : null,
    poisonApplied   : false,
    nuclearApplied  : false,
    impactFrame     : 0,
    impactTimer     : 0,
    impactStarted   : false,
    impactDone      : false,
    lightningApplied: false,
  });

  // ── Explosion damage + knockback ──────────────────
  if (id === "explosion" && enemies) {
    var radius  = def.radius    || 300;
    var damage  = def.damage    || 60;
    var kbForce = def.knockback || 180;

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

  // ── Nuclear — immediate damage + screen shake ─────
  if (id === "nuclear" && enemies) {
    var nRadius = def.radius      || 600;
    var nInner  = def.innerRadius || 250;
    var nDamage = def.damage      || 140;
    if (window._triggerScreenShake) {
      window._triggerScreenShake(def.shakeDur || 0.5, def.shakeMag || 18);
    }
    for (var i = 0; i < enemies.length; i++) {
      var e = enemies[i];
      if (!e || !e.alive || e.dying || e.smoking) continue;
      var dx   = e.x - wx;
      var dy   = e.y - wy;
      var dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > nRadius) continue;
      if (dist <= nInner) {
        e.takeDamage(500);
      } else {
        var falloff = 1 - ((dist - nInner) / (nRadius - nInner)) * 0.5;
        e.takeDamage(Math.round(nDamage * falloff));
      }
    }
  }
};

AbilityEffectManager.prototype.update = function(dt, enemies) {
  _updateDmgNumbers(dt);
  _updateScorches(dt);
  _updateRadZones(dt, enemies);
  _updateElectricPulses(dt);

  for (var i = this.active.length - 1; i >= 0; i--) {
    var e   = this.active[i];
    if (e.done) { this.active.splice(i, 1); continue; }
    var def = EFFECT_DEFS[e.id];

    // Lightning impact animation update
    if (e.id === "lightning" && e.impactStarted && !e.impactDone) {
      e.impactTimer += dt;
      if (e.impactTimer >= 1 / def.impactFps) {
        e.impactTimer -= 1 / def.impactFps;
        e.impactFrame++;
        if (e.impactFrame >= def.impactTotal) e.impactDone = true;
      }
    }

    e.frameTimer += dt;
    if (e.frameTimer >= 1 / def.fps) {
      e.frameTimer -= 1 / def.fps;
      e.frame++;

      // Stop impact at impactStopAt frame
      if (e.id === "lightning" && def.impactStopAt && e.frame >= def.impactStopAt) {
        e.impactDone = true;
      }

      if (e.id === "explosion" && !e.scorchSpawned && e.frame >= Math.floor(e.totalFrames * 0.5)) {
        _spawnScorch(e.wx, e.wy, def.radius || 300);
        e.scorchSpawned = true;
      }

      if (e.id === "lightning" && !e.lightningApplied && e.frame >= def.impactFrame) {
        e.lightningApplied = true;
        e.impactStarted    = true;
        if (e.enemies) {
          var radius   = def.radius   || 300;
          var slowMult = def.slowMult || 0.35;
          var slowDur  = def.slowDur  || 4;
          for (var j = 0; j < e.enemies.length; j++) {
            var en = e.enemies[j];
            if (!en || !en.alive || en.dying || en.smoking) continue;
            var ddx  = en.x - e.wx;
            var ddy  = en.y - e.wy;
            var dist = Math.sqrt(ddx*ddx + ddy*ddy);
            if (dist > radius) continue;
            var falloff = 1 - (dist / radius) * 0.4;
            en.takeDamage(Math.round((def.damage || 90) * falloff));
            if (en.alive && !en.dying) {
              en.poisonSlowMult = slowMult;
              en.poisonTimer    = Math.max(en.poisonTimer || 0, slowDur);
              en.poisoned       = false;
              en._electricSlow  = slowDur;
              en._electricTimer = slowDur;
            }
            _spawnElectricPulse(en.x, en.y - 40);
          }
        }
      }

      if (e.frame >= e.totalFrames) {
        e.loopCount++;
        if (e.loopCount >= e.maxLoops) {
          e.done = true;

          if (e.id === "nuclear" && !e.nuclearApplied) {
            e.nuclearApplied = true;
            var nd = EFFECT_DEFS["nuclear"];
            _spawnRadZone(e.wx, e.wy, nd.radius, nd.radZoneLife, nd.radDamage);
          }

          if (e.id === "poison" && !e.poisonApplied && e.enemies) {
            e.poisonApplied = true;
            var def2     = EFFECT_DEFS["poison"];
            var pradius  = def2.radius   || 400;
            var slowMult = def2.slowMult || 0.4;
            var duration = def2.duration || 10;
            for (var j = 0; j < e.enemies.length; j++) {
              var en = e.enemies[j];
              if (!en || !en.alive || en.dying || en.smoking) continue;
              var ddx  = en.x - e.wx;
              var ddy  = en.y - e.wy;
              var dist = Math.sqrt(ddx*ddx + ddy*ddy);
              if (dist > pradius) continue;
              en.poisoned       = true;
              en.poisonTimer    = duration;
              en.poisonTick     = 0;
              en.poisonSlowMult = slowMult;
            }
          }

        } else {
          e.frame = 0;
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
  _drawRadZones(ctx);
};

AbilityEffectManager.prototype.drawEffects = function(ctx) {
  for (var i = 0; i < this.active.length; i++) {
    var e   = this.active[i];
    var def = EFFECT_DEFS[e.id];
    var img = this.images[e.id];
    if (!img || !img.complete || img.naturalWidth === 0) continue;

    var frame = Math.min(e.frame, e.totalFrames - 1);
    var col   = frame % def.cols;
    var row   = Math.floor(frame / def.cols);

    var alpha = 1;
    if (e.id === "poison" && e.maxLoops > 1) {
      alpha = e.loopCount < e.maxLoops - 1 ? 1 : 1 - (e.frame / e.totalFrames);
    }

    ctx.save();
    if (alpha < 1) ctx.globalAlpha = Math.max(0, alpha);
    var spriteY = e.id === "lightning"
      ? e.wy - def.drawH + (def.drawOffsetY || 0)
      : e.wy - def.drawH / 2 + (def.drawOffsetY || 0);
    ctx.drawImage(
      img,
      col * def.frameW, row * def.frameH, def.frameW, def.frameH,
      e.wx - def.drawW / 2 + (def.drawOffsetX || 0),
      spriteY,
      def.drawW, def.drawH
    );
    ctx.restore();

    // Impact sprite — only while not done and before impactStopAt
    if (e.id === "lightning" && e.impactStarted && !e.impactDone) {
      var iimg = this.images["lightning_impact"];
      if (iimg && iimg.complete && iimg.naturalWidth > 0) {
        var iFrame = Math.min(e.impactFrame, def.impactTotal - 1);
        var iCol   = iFrame % def.impactCols;
        var iRow   = Math.floor(iFrame / def.impactCols);
        ctx.save();
        ctx.drawImage(
          iimg,
          iCol * def.impactFrameW, iRow * def.impactFrameH,
          def.impactFrameW, def.impactFrameH,
          e.wx - def.impactDrawW / 2,
          e.wy - def.impactDrawH / 2,
          def.impactDrawW, def.impactDrawH
        );
        ctx.restore();
      }
    }
  }

  _drawDmgNumbers(ctx);
  _drawElectricPulses(ctx);
};