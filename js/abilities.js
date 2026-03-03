// abilities.js

const ABILITY_CFG = {
  cardW    : 58,
  cardH    : 72,
  cardGap  : 10,
  bottomY  : 18,
  iconSize : 36,
  fontSize : 6.5,
  costSize : 8,
};

const ABILITY_DEFS = [
  { id:"lightning", label:"Lightning",  cost:75,  cooldown:14, color:"#ffd060", image:"img/special abilities/lightning.png"    },
  { id:"nuclear",   label:"Nuclear",    cost:150, cooldown:30, color:"#a0ff80", image:"img/special abilities/Nuclear blast.png" },
  { id:"poison",    label:"Poison Gas", cost:90,  cooldown:20, color:"#c0ff90", image:"img/special abilities/poisonous gas.png" },
  { id:"explosion", label:"Explosion",  cost:100, cooldown:18, color:"#ffb060", image:"img/special abilities/explosion.png"     },
];

// Pre-bake card frames (normal, hover, selected) into offscreen canvases
function _bakeCardFrame(state) {
  var W = ABILITY_CFG.cardW, H = ABILITY_CFG.cardH;
  var oc   = document.createElement("canvas");
  oc.width = W; oc.height = H;
  var ctx  = oc.getContext("2d");
  var r    = 3;

  // Parchment body
  var pg = ctx.createLinearGradient(0, 0, W, H);
  if (state === "sel") {
    pg.addColorStop(0, "#f5e8c0"); pg.addColorStop(0.25, "#edd9a3");
    pg.addColorStop(0.5, "#e8cf90"); pg.addColorStop(0.75, "#edd9a3");
    pg.addColorStop(1, "#e0c878");
  } else if (state === "cd") {
    pg.addColorStop(0, "#a89878"); pg.addColorStop(0.5, "#907858");
    pg.addColorStop(1, "#786040");
  } else if (state === "hov") {
    pg.addColorStop(0, "#f0e0b0"); pg.addColorStop(0.5, "#e8d090");
    pg.addColorStop(1, "#dcc070");
  } else {
    pg.addColorStop(0, "#e8d8a8"); pg.addColorStop(0.25, "#d8c888");
    pg.addColorStop(0.5, "#cbb870"); pg.addColorStop(0.75, "#d8c888");
    pg.addColorStop(1, "#c8a850");
  }
  ctx.beginPath(); ctx.roundRect(0, 0, W, H, r);
  ctx.fillStyle = pg; ctx.fill();

  // Grain texture
  for (var gx = 0; gx < W; gx += 3) {
    for (var gy = 0; gy < H; gy += 3) {
      var v = (Math.sin(gx * 7.3 + gy * 13.7) * 0.5 + 0.5) * 0.10;
      ctx.fillStyle = "rgba(0,0,0," + v + ")";
      ctx.fillRect(gx, gy, 2, 2);
    }
  }

  // Vignette
  var vg = ctx.createRadialGradient(W/2, H/2, H*0.2, W/2, H/2, H*0.85);
  vg.addColorStop(0, "rgba(0,0,0,0)");
  vg.addColorStop(1, state === "cd" ? "rgba(0,0,0,0.5)" : "rgba(80,40,0,0.3)");
  ctx.beginPath(); ctx.roundRect(0, 0, W, H, r);
  ctx.fillStyle = vg; ctx.fill();

  // Outer ink border
  ctx.beginPath(); ctx.roundRect(0, 0, W, H, r);
  ctx.strokeStyle = state === "cd" ? "#2a2018" : (state === "sel" ? "#1a0800" : "#2e1e08");
  ctx.lineWidth = 2.5; ctx.stroke();

  // Inner decorative line
  ctx.beginPath(); ctx.roundRect(3, 3, W-6, H-6, 2);
  ctx.strokeStyle = state === "cd" ? "rgba(40,25,10,0.4)" : (state === "sel" ? "rgba(80,40,0,0.8)" : "rgba(60,30,5,0.5)");
  ctx.lineWidth = 1; ctx.stroke();

  // Corner flourishes
  var ci = state === "cd" ? "rgba(40,25,10,0.4)" : (state === "sel" ? "rgba(100,50,0,0.9)" : "rgba(80,40,0,0.6)");
  ctx.strokeStyle = ci; ctx.lineWidth = 1; ctx.fillStyle = ci;
  // top-left
  ctx.beginPath(); ctx.moveTo(3,10); ctx.lineTo(3,3); ctx.lineTo(10,3); ctx.stroke();
  ctx.beginPath(); ctx.arc(6,6,2,0,Math.PI*2); ctx.fill();
  // top-right
  ctx.beginPath(); ctx.moveTo(W-3,10); ctx.lineTo(W-3,3); ctx.lineTo(W-10,3); ctx.stroke();
  ctx.beginPath(); ctx.arc(W-6,6,2,0,Math.PI*2); ctx.fill();
  // bottom-left
  ctx.beginPath(); ctx.moveTo(3,H-10); ctx.lineTo(3,H-3); ctx.lineTo(10,H-3); ctx.stroke();
  ctx.beginPath(); ctx.arc(6,H-6,2,0,Math.PI*2); ctx.fill();
  // bottom-right
  ctx.beginPath(); ctx.moveTo(W-3,H-10); ctx.lineTo(W-3,H-3); ctx.lineTo(W-10,H-3); ctx.stroke();
  ctx.beginPath(); ctx.arc(W-6,H-6,2,0,Math.PI*2); ctx.fill();

  return oc;
}

// Baked card frames — created once
var _cardFrames = null;
function _getCardFrames() {
  if (!_cardFrames) {
    _cardFrames = {
      normal : _bakeCardFrame("normal"),
      hover  : _bakeCardFrame("hov"),
      sel    : _bakeCardFrame("sel"),
      cd     : _bakeCardFrame("cd"),
    };
  }
  return _cardFrames;
}

class AbilityManager {
  constructor() {
    this.images    = {};
    this.ready     = false;
    this.cooldowns = {};
    this.selected  = null;
    this._hoverIdx = -1;
    ABILITY_DEFS.forEach(function(a) { this.cooldowns[a.id] = 0; }.bind(this));
  }

  load(onReady) {
    var total = ABILITY_DEFS.length, done = 0;
    ABILITY_DEFS.forEach(function(a) {
      var img = new Image();
      img.src = a.image;
      img.onload = img.onerror = function() {
        this.images[a.id] = img;
        done++;
        if (done >= total) { this.ready = true; onReady(); }
      }.bind(this);
    }.bind(this));
  }

  update(dt) {
    ABILITY_DEFS.forEach(function(a) {
      if (this.cooldowns[a.id] > 0)
        this.cooldowns[a.id] = Math.max(0, this.cooldowns[a.id] - dt);
    }.bind(this));
  }

  handleClick(sx, sy, cssW, cssH) {
    var positions = this._getPositions(cssW, cssH);
    var W = ABILITY_CFG.cardW, H = ABILITY_CFG.cardH;
    for (var i = 0; i < ABILITY_DEFS.length; i++) {
      var p = positions[i];
      if (sx >= p.x && sx <= p.x + W && sy >= p.y && sy <= p.y + H) {
        var a = ABILITY_DEFS[i];
        if (this.cooldowns[a.id] > 0) return "cooldown";
        this.selected = (this.selected === a.id) ? null : a.id;
        return "card";
      }
    }
    return null;
  }

  activateAt(wx, wy, coins) {
    if (!this.selected) return null;
    var a = null;
    for (var i = 0; i < ABILITY_DEFS.length; i++) {
      if (ABILITY_DEFS[i].id === this.selected) { a = ABILITY_DEFS[i]; break; }
    }
    if (!a || this.cooldowns[a.id] > 0 || coins < a.cost) {
      this.selected = null; return null;
    }
    this.cooldowns[a.id] = a.cooldown;
    this.selected = null;
    return a;
  }

  cancel() { this.selected = null; }

  updateHover(sx, sy, cssW, cssH) {
    var positions = this._getPositions(cssW, cssH);
    this._hoverIdx = -1;
    var W = ABILITY_CFG.cardW, H = ABILITY_CFG.cardH;
    for (var i = 0; i < ABILITY_DEFS.length; i++) {
      var p = positions[i];
      if (sx >= p.x && sx <= p.x + W && sy >= p.y && sy <= p.y + H) {
        this._hoverIdx = i; break;
      }
    }
  }

  _getPositions(cssW, cssH) {
    var cardW = ABILITY_CFG.cardW, cardH = ABILITY_CFG.cardH;
    var cardGap = ABILITY_CFG.cardGap, bottomY = ABILITY_CFG.bottomY;
    var n = ABILITY_DEFS.length;
    var totalW = n * cardW + (n - 1) * cardGap;
    var startX = (cssW - totalW) / 2;
    var y = cssH - cardH - bottomY;
    var result = [];
    for (var i = 0; i < n; i++) {
      result.push({ x: startX + i * (cardW + cardGap), y: y });
    }
    return result;
  }

  _drawCard(ctx, x, y, a, onCD, isSel, isHov) {
    var W = ABILITY_CFG.cardW, H = ABILITY_CFG.cardH;
    var costSize = ABILITY_CFG.costSize;
    var frames   = _getCardFrames();

    ctx.save();

    // Shadow
    ctx.shadowColor = "rgba(0,0,0,0.7)"; ctx.shadowBlur = 10; ctx.shadowOffsetY = 4;
    ctx.beginPath(); ctx.roundRect(x, y, W, H, 3);
    ctx.fillStyle = "#000"; ctx.fill();
    ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;

    // Baked card frame — single drawImage
    var frame = onCD ? frames.cd : (isSel ? frames.sel : (isHov ? frames.hover : frames.normal));
    ctx.drawImage(frame, x, y);

    // Selected glow
    if (isSel) {
      ctx.save();
      ctx.shadowColor = "rgba(255,200,60,0.9)"; ctx.shadowBlur = 16;
      ctx.beginPath(); ctx.roundRect(x, y, W, H, 3);
      ctx.strokeStyle = "rgba(255,180,40,0.8)"; ctx.lineWidth = 2; ctx.stroke();
      ctx.restore();
    }

    // Icon
    var pad   = 6;
    var iconX = x + pad, iconY = y + pad;
    var iconW = W - pad * 2, iconH = H - pad * 2 - 20;
    var img   = this.images[a.id];
    if (img && img.complete && img.naturalWidth > 0) {
      ctx.save();
      ctx.beginPath(); ctx.roundRect(iconX, iconY, iconW, iconH, 2); ctx.clip();
      if (onCD) ctx.globalAlpha = 0.25;
      ctx.drawImage(img, iconX, iconY, iconW, iconH);
      ctx.restore();
    }

    // Cooldown overlay
    if (onCD) {
      var icx = iconX + iconW/2, icy = iconY + iconH/2;
      ctx.save();
      ctx.beginPath(); ctx.roundRect(x, y, W, H, 3);
      ctx.fillStyle = "rgba(0,0,0,0.45)"; ctx.fill();
      ctx.fillStyle = "#fff8e8"; ctx.strokeStyle = "#2e1e08"; ctx.lineWidth = 3;
      ctx.font = "bold " + Math.round(costSize+8) + "px serif";
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.strokeText(Math.ceil(this.cooldowns[a.id]), icx, icy);
      ctx.fillText(Math.ceil(this.cooldowns[a.id]), icx, icy);
      ctx.restore();
    }

    // Label
    ctx.fillStyle = onCD ? "#6a5030" : (isSel ? "#3a1500" : "#3a2005");
    ctx.font = "bold " + Math.round(ABILITY_CFG.fontSize) + "px serif";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.shadowColor = onCD ? "transparent" : "rgba(255,220,140,0.6)"; ctx.shadowBlur = 2;
    ctx.fillText(a.label, x + W/2, y + H - 18);
    ctx.shadowBlur = 0;

    // Cost
    var coinX = x + W/2 - 13, coinY = y + H - 7;
    ctx.beginPath(); ctx.arc(coinX, coinY, 4, 0, Math.PI*2);
    ctx.fillStyle = onCD ? "#5a4020" : "#c8900a"; ctx.fill();
    ctx.strokeStyle = onCD ? "#3a2810" : "#7a5000"; ctx.lineWidth = 1; ctx.stroke();
    if (!onCD) {
      ctx.beginPath(); ctx.arc(coinX-1, coinY-1, 1.5, 0, Math.PI*2);
      ctx.fillStyle = "rgba(255,230,150,0.7)"; ctx.fill();
    }
    ctx.fillStyle = onCD ? "#6a5030" : "#3a1500";
    ctx.font = "bold " + Math.round(costSize) + "px serif";
    ctx.textAlign = "left"; ctx.textBaseline = "middle";
    ctx.fillText(a.cost, x + W/2 - 6, coinY);

    ctx.restore();
  }

  draw(ctx, cssW, cssH) {
    var positions = this._getPositions(cssW, cssH);
    for (var i = 0; i < ABILITY_DEFS.length; i++) {
      var a     = ABILITY_DEFS[i];
      var p     = positions[i];
      var onCD  = this.cooldowns[a.id] > 0;
      var isSel = this.selected === a.id;
      var isHov = this._hoverIdx === i;
      this._drawCard(ctx, p.x, p.y, a, onCD, isSel, isHov);
    }

    // Activation hint
    if (this.selected) {
      var hint = "Click on the map to activate";
      var hintH = 26, hintW = 210;
      var hintX = cssW/2 - hintW/2;
      var hintY = positions[0].y - hintH - 8;
      ctx.save();
      ctx.shadowColor = "rgba(0,0,0,0.6)"; ctx.shadowBlur = 10; ctx.shadowOffsetY = 3;
      ctx.beginPath(); ctx.roundRect(hintX, hintY, hintW, hintH, 3);
      ctx.fillStyle = "#d4c070"; ctx.fill();
      ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
      ctx.beginPath(); ctx.roundRect(hintX, hintY, hintW, hintH, 3);
      ctx.strokeStyle = "#2e1e08"; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = "#2e1e08";
      ctx.font = "bold 11px serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(hint, cssW/2, hintY + hintH/2);
      ctx.restore();
    }
  }
}