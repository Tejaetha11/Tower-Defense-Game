// towerWheel.js — Kingdom Rush style tower selection wheel

const WHEEL_TOWERS = [
  { type: "tower1", label: "Archer",  cost: 100, image: "./tower1-base.png", frame: { x: 0, y: 19, w: 64, h: 110 } },
  { type: "tower2", label: "Tower 2", cost: 125, image: "./tower2-base.png", frame: { x: 0, y: 0,  w: 64, h: 110 } },
];

const SLOT_ANGLES_LIST = [
  -Math.PI / 2,
   0,
   Math.PI / 2,
   Math.PI,
];
const SLOT_OFFSETS = SLOT_ANGLES_LIST.map(a => ({
  ax: Math.cos(a),
  ay: Math.sin(a),
}));

const WHEEL_ORBIT   = 35;
const WHEEL_BTN_W   = 40;
const WHEEL_BTN_H   = 30;
const WHEEL_RING_R  = 35;
const WHEEL_RANGE   = 800;

const WHEEL_NAME_SZ = 7;
const WHEEL_COST_SZ = 7;
const WHEEL_NAME_Y  = -3;
const WHEEL_COST_Y  = 8;

// ── Pre-bake hammer once ───────────────────────────────────
function _bakeHammer() {
  const SZ = 80;
  const oc = document.createElement("canvas");
  oc.width = SZ; oc.height = SZ;
  const c2 = oc.getContext("2d");
  c2.translate(SZ/2, SZ/2);
  c2.rotate(-Math.PI / 5);

  c2.shadowColor = "rgba(0,0,0,0.5)";
  c2.shadowBlur  = 8; c2.shadowOffsetX = 2; c2.shadowOffsetY = 3;

  const hg = c2.createLinearGradient(-5, 0, 5, 0);
  hg.addColorStop(0, "#3d2008"); hg.addColorStop(0.35, "#7a4820");
  hg.addColorStop(0.65, "#6a3818"); hg.addColorStop(1, "#2d1005");
  c2.beginPath(); c2.roundRect(-5, -2, 9, 46, 3);
  c2.fillStyle = hg; c2.fill();

  [10, 22, 34].forEach(ry => {
    c2.beginPath(); c2.roundRect(-5, ry, 9, 3, 1);
    c2.fillStyle = "rgba(0,0,0,0.25)"; c2.fill();
  });

  c2.beginPath(); c2.roundRect(-2, 0, 3, 44, 2);
  c2.fillStyle = "rgba(255,180,80,0.15)"; c2.fill();

  c2.shadowBlur = 0;
  c2.beginPath(); c2.roundRect(-20, -22, 38, 22, 5);
  c2.fillStyle = "#222"; c2.fill();

  const mg = c2.createLinearGradient(-20, -22, 18, 0);
  mg.addColorStop(0, "#909090"); mg.addColorStop(0.15, "#e8e8e8");
  mg.addColorStop(0.4, "#d0d0d0"); mg.addColorStop(0.7, "#b0b0b0");
  mg.addColorStop(1, "#707070");
  c2.beginPath(); c2.roundRect(-19, -21, 36, 20, 4);
  c2.fillStyle = mg; c2.fill();

  c2.beginPath(); c2.roundRect(-17, -19, 32, 7, 3);
  c2.fillStyle = "rgba(255,255,255,0.45)"; c2.fill();

  const fg = c2.createLinearGradient(14, -20, 20, 0);
  fg.addColorStop(0, "#c8c8c8"); fg.addColorStop(1, "#888");
  c2.beginPath(); c2.roundRect(14, -21, 6, 20, [0, 4, 4, 0]);
  c2.fillStyle = fg; c2.fill();

  c2.beginPath(); c2.roundRect(-17, -5, 32, 3, 2);
  c2.fillStyle = "rgba(0,0,0,0.2)"; c2.fill();

  return oc;
}

// ── Pre-bake slot button ───────────────────────────────────
function _bakeSlot(hovered) {
  const W = WHEEL_BTN_W, H = WHEEL_BTN_H, r = 8;
  const P = 4;
  const oc = document.createElement("canvas");
  oc.width = W + P*2; oc.height = H + P*2;
  const c2 = oc.getContext("2d");
  const ox = P, oy = P;

  c2.beginPath(); c2.roundRect(ox-3, oy-3, W+6, H+6, r+2);
  c2.fillStyle = "#0d0700"; c2.fill();

  const bg = c2.createRadialGradient(ox+W*0.4, oy+H*0.4, 0, ox+W/2, oy+H/2, Math.max(W,H)*0.7);
  if (hovered) { bg.addColorStop(0, "#6a4010"); bg.addColorStop(1, "#2a1504"); }
  else         { bg.addColorStop(0, "#4a2c08"); bg.addColorStop(1, "#1a0e02"); }
  c2.beginPath(); c2.roundRect(ox, oy, W, H, r);
  c2.fillStyle = bg; c2.fill();

  c2.beginPath(); c2.roundRect(ox+2, oy+2, W-4, H-4, r-2);
  c2.strokeStyle = hovered ? "rgba(255,220,100,0.7)" : "rgba(255,200,80,0.25)";
  c2.lineWidth = 2; c2.stroke();

  [[ox+6,oy+6],[ox+W-6,oy+6],[ox+6,oy+H-6],[ox+W-6,oy+H-6]].forEach(([rx,ry]) => {
    c2.beginPath(); c2.arc(rx, ry, 3, 0, Math.PI*2);
    c2.fillStyle = "#2a1500"; c2.fill();
    const rg = c2.createRadialGradient(rx-1, ry-1, 0, rx, ry, 3);
    rg.addColorStop(0, "#9a7040"); rg.addColorStop(1, "#4a2810");
    c2.beginPath(); c2.arc(rx, ry, 2.5, 0, Math.PI*2);
    c2.fillStyle = rg; c2.fill();
  });

  return { canvas: oc, pad: P };
}

let _hammerBaked = null;
let _slotNormal  = null;
let _slotHover   = null;

function _initBaked() {
  if (_hammerBaked) return;
  _hammerBaked = _bakeHammer();
  _slotNormal  = _bakeSlot(false);
  _slotHover   = _bakeSlot(true);
}

class TowerWheel {
  constructor() {
    this.visible    = false;
    this.tileCol    = 0;
    this.tileRow    = 0;
    this.cx         = 0;
    this.cy         = 0;
    this.hoveredIdx = -1;
    this.images     = {};
    this.ready      = false;
    this.scale      = 0;
    this.animating  = false;
    this.closing    = false;
    this.orbitDist  = 280;
    this.btnW       = 220;
    this.btnH       = 160;
    this.ringRadius = 160;
  }

  load(onReady) {
    _initBaked();
    let total = WHEEL_TOWERS.length;
    let done  = 0;
    if (total === 0) { this.ready = true; onReady(); return; }
    WHEEL_TOWERS.forEach(t => {
      const img  = new Image();
      img.src    = t.image;
      img.onload = img.onerror = () => {
        this.images[t.type] = img;
        done++;
        if (done >= total) { this.ready = true; onReady(); }
      };
    });
  }

  show(col, row, tileSize) {
    this.visible    = true;
    this.tileCol    = col;
    this.tileRow    = row;
    this.cx         = col * tileSize + tileSize / 2;
    this.cy         = row * tileSize + tileSize / 2;
    this.hoveredIdx = -1;
    this.scale      = 0;
    this.animating  = true;
    this._t         = 0;
  }

  hide() {
    if (!this.visible) return;
    this.closing    = true;
    this.animating  = false;
    this.hoveredIdx = -1;
    this._ct        = 0;
  }

  _forceHide() {
    this.visible   = false;
    this.closing   = false;
    this.scale     = 0;
    this.animating = false;
    this._t        = 0;
    this._ct       = 0;
  }

  update(dt) {
    if (this.closing) {
      this._ct   = Math.min(1, (this._ct || 0) + dt * 9);
      this.scale = Math.max(0, 1 - Math.pow(this._ct, 3));
      if (this._ct >= 1) this._forceHide();
      return;
    }
    if (!this.visible) return;
    if (this._t < 1) {
      this._t    = Math.min(1, (this._t || 0) + dt * 7);
      this.scale = 1 - Math.pow(1 - this._t, 4);
      if (this._t >= 1) this.animating = false;
    }
  }

  _slotPos(i) {
    const s  = SLOT_OFFSETS[i];
    const sc = this.scale;
    return {
      x: this.cx + s.ax * this.orbitDist * sc,
      y: this.cy + s.ay * this.orbitDist * sc,
    };
  }

  draw(ctx) {}
}

// ── Screen-space draw ──────────────────────────────────────
TowerWheel.prototype.drawScreen = function(ctx, worldScale) {
  if (!this.visible && !this.closing) return;

  const sx = this.cx * worldScale;
  const sy = this.cy * worldScale;
  const sc = this.scale;

  const slotOffsets = [
    { ax: Math.cos(-Math.PI/2), ay: Math.sin(-Math.PI/2) },
    { ax: Math.cos(0),          ay: Math.sin(0)          },
    { ax: Math.cos(Math.PI/2),  ay: Math.sin(Math.PI/2)  },
    { ax: Math.cos(Math.PI),    ay: Math.sin(Math.PI)    },
  ];

  ctx.save();

  // ── Range circle — stroke only, no fill ───────────────
  ctx.beginPath();
  ctx.arc(sx, sy, WHEEL_RANGE * worldScale, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(255,255,255,0.12)";
  ctx.lineWidth   = 2;
  ctx.setLineDash([8, 6]);
  ctx.stroke();
  ctx.setLineDash([]);

  // ── Ring — single stroke ───────────────────────────────
  ctx.beginPath();
  ctx.arc(sx, sy, WHEEL_RING_R * sc, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(160,100,20,0.9)";
  ctx.lineWidth   = 10 * sc;
  ctx.stroke();

  // ── Slots ──────────────────────────────────────────────
  for (let i = 0; i < WHEEL_TOWERS.length; i++) {
    const tower   = WHEEL_TOWERS[i];
    const off     = slotOffsets[i];
    const px      = sx + off.ax * WHEEL_ORBIT * sc;
    const py      = sy + off.ay * WHEEL_ORBIT * sc;
    const hovered = this.hoveredIdx === i;
    const hoverSc = hovered ? 1.12 : 1.0;
    const drawSc  = sc * hoverSc;
    const baked   = hovered ? _slotHover : _slotNormal;
    const P       = baked.pad;

    ctx.save();
    ctx.translate(px, py);
    ctx.scale(drawSc, drawSc);
    ctx.drawImage(baked.canvas, -WHEEL_BTN_W/2 - P, -WHEEL_BTN_H/2 - P);
    ctx.scale(1/drawSc, 1/drawSc);
    ctx.translate(-px, -py);

    ctx.fillStyle    = "#FFFFFF";
    ctx.strokeStyle  = "#000000";
    ctx.lineWidth    = 3;
    ctx.font         = `bold ${Math.round(WHEEL_NAME_SZ * sc * hoverSc)}px Arial`;
    ctx.textAlign    = "center";
    ctx.textBaseline = "middle";
    ctx.strokeText(tower.label, px, py + WHEEL_NAME_Y * sc);
    ctx.fillText(tower.label,   px, py + WHEEL_NAME_Y * sc);

    ctx.fillStyle    = "#FFD700";
    ctx.strokeStyle  = "#000000";
    ctx.lineWidth    = 2;
    ctx.font         = `bold ${Math.round(WHEEL_COST_SZ * sc * hoverSc)}px Arial`;
    ctx.strokeText(`${tower.cost}`, px, py + WHEEL_COST_Y * sc);
    ctx.fillText(`${tower.cost}`,   px, py + WHEEL_COST_Y * sc);

    ctx.restore();
  }

  // ── Hammer ─────────────────────────────────────────────
  const HZ  = 80;
  const hsc = (15 * sc) / 42;
  ctx.save();
  ctx.translate(sx, sy);
  ctx.scale(hsc, hsc);
  ctx.drawImage(_hammerBaked, -HZ/2, -HZ/2);
  ctx.restore();

  ctx.restore();
};

// ── Hover detection ────────────────────────────────────────
TowerWheel.prototype.updateHoverScreen = function(sx, sy, worldScale) {
  if (!this.visible && !this.closing) return;
  this.hoveredIdx = -1;
  const sc = this.scale;
  const cx = this.cx * worldScale;
  const cy = this.cy * worldScale;

  const slotOffsets = [
    { ax: Math.cos(-Math.PI/2), ay: Math.sin(-Math.PI/2) },
    { ax: Math.cos(0),          ay: Math.sin(0)          },
    { ax: Math.cos(Math.PI/2),  ay: Math.sin(Math.PI/2)  },
    { ax: Math.cos(Math.PI),    ay: Math.sin(Math.PI)    },
  ];

  for (let i = 0; i < WHEEL_TOWERS.length; i++) {
    const off = slotOffsets[i];
    const px  = cx + off.ax * WHEEL_ORBIT * sc;
    const py  = cy + off.ay * WHEEL_ORBIT * sc;
    const hw  = (WHEEL_BTN_W / 2) * sc * 1.12;
    const hh  = (WHEEL_BTN_H / 2) * sc * 1.12;
    if (sx >= px - hw && sx <= px + hw && sy >= py - hh && sy <= py + hh) {
      this.hoveredIdx = i;
      return;
    }
  }
};

// ── Click detection ────────────────────────────────────────
TowerWheel.prototype.handleClickScreen = function(sx, sy, worldScale) {
  if (!this.visible && !this.closing) return null;
  const sc = this.scale;
  const cx = this.cx * worldScale;
  const cy = this.cy * worldScale;

  const slotOffsets = [
    { ax: Math.cos(-Math.PI/2), ay: Math.sin(-Math.PI/2) },
    { ax: Math.cos(0),          ay: Math.sin(0)          },
    { ax: Math.cos(Math.PI/2),  ay: Math.sin(Math.PI/2)  },
    { ax: Math.cos(Math.PI),    ay: Math.sin(Math.PI)    },
  ];

  for (let i = 0; i < WHEEL_TOWERS.length; i++) {
    const off = slotOffsets[i];
    const px  = cx + off.ax * WHEEL_ORBIT * sc;
    const py  = cy + off.ay * WHEEL_ORBIT * sc;
    const hw  = (WHEEL_BTN_W / 2) * sc;
    const hh  = (WHEEL_BTN_H / 2) * sc;
    if (sx >= px - hw && sx <= px + hw && sy >= py - hh && sy <= py + hh) {
      const selected = WHEEL_TOWERS[i].type;
      this.hide();
      return selected;
    }
  }

  this.hide();
  return null;
};