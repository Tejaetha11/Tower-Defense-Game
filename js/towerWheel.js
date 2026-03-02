// towerWheel.js — Kingdom Rush style tower selection wheel

const WHEEL_TOWERS = [
  { type: "tower1", label: "Archer",  cost: 100, image: "./tower1-base.png", frame: { x: 0, y: 19, w: 64, h: 110 } },
  { type: "tower2", label: "Tower 2", cost: 125, image: "./tower2-base.png", frame: { x: 0, y: 0,  w: 64, h: 110 } },
];

const SLOT_ANGLES_LIST = [
  -Math.PI / 2,  // top
   0,            // right
   Math.PI / 2,  // bottom
   Math.PI,      // left
];
const SLOT_OFFSETS = SLOT_ANGLES_LIST.map(a => ({
  ax: Math.cos(a),
  ay: Math.sin(a),
}));

// ── Wheel size config — change these to resize the wheel ──
const WHEEL_ORBIT   = 35;    // distance from hammer to box center
const WHEEL_BTN_W   = 40;    // box width
const WHEEL_BTN_H   = 30;    // box height
const WHEEL_RING_R  = 35;    // keep same as WHEEL_ORBIT
const WHEEL_RANGE   = 800;   // range circle radius in world units

// ── Text config — change these to adjust text ────────────
const WHEEL_NAME_SZ = 7;     // tower name font size
const WHEEL_COST_SZ = 7;     // cost font size
const WHEEL_NAME_Y  = -3;    // name vertical offset (negative = up, positive = down)
const WHEEL_COST_Y  = 8;     // cost vertical offset (negative = up, positive = down)

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

    this.orbitDist  = 280;
    this.btnW       = 220;
    this.btnH       = 160;
    this.ringRadius = 160;
  }

  load(onReady) {
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
  }

  hide() {
    this.visible    = false;
    this.hoveredIdx = -1;
    this.scale      = 0;
  }

  update(dt) {
    if (!this.visible) return;
    if (this.scale < 1) {
      this.scale = Math.min(1, this.scale + dt * 8);
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

  // ── Draw realistic canvas hammer ──────────────────────────
  _drawHammer(ctx, cx, cy, size) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(-Math.PI / 5);
    const s = size / 42;
    ctx.scale(s, s);

    ctx.shadowColor   = "rgba(0,0,0,0.5)";
    ctx.shadowBlur    = 8;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 3;

    // Handle
    const hg = ctx.createLinearGradient(-5, 0, 5, 0);
    hg.addColorStop(0,    "#3d2008");
    hg.addColorStop(0.35, "#7a4820");
    hg.addColorStop(0.65, "#6a3818");
    hg.addColorStop(1,    "#2d1005");
    ctx.beginPath();
    ctx.roundRect(-5, -2, 9, 46, 3);
    ctx.fillStyle = hg;
    ctx.fill();

    [10, 22, 34].forEach(ry => {
      ctx.beginPath();
      ctx.roundRect(-5, ry, 9, 3, 1);
      ctx.fillStyle = "rgba(0,0,0,0.25)";
      ctx.fill();
    });

    ctx.beginPath();
    ctx.roundRect(-2, 0, 3, 44, 2);
    ctx.fillStyle = "rgba(255,180,80,0.15)";
    ctx.fill();

    // Head
    ctx.beginPath();
    ctx.roundRect(-20, -22, 38, 22, 5);
    ctx.fillStyle = "#222";
    ctx.fill();

    const mg = ctx.createLinearGradient(-20, -22, 18, 0);
    mg.addColorStop(0,    "#909090");
    mg.addColorStop(0.15, "#e8e8e8");
    mg.addColorStop(0.4,  "#d0d0d0");
    mg.addColorStop(0.7,  "#b0b0b0");
    mg.addColorStop(1,    "#707070");
    ctx.beginPath();
    ctx.roundRect(-19, -21, 36, 20, 4);
    ctx.fillStyle = mg;
    ctx.fill();

    ctx.beginPath();
    ctx.roundRect(-17, -19, 32, 7, 3);
    ctx.fillStyle = "rgba(255,255,255,0.45)";
    ctx.fill();

    const fg = ctx.createLinearGradient(14, -20, 20, 0);
    fg.addColorStop(0, "#c8c8c8");
    fg.addColorStop(1, "#888");
    ctx.beginPath();
    ctx.roundRect(14, -21, 6, 20, [0, 4, 4, 0]);
    ctx.fillStyle = fg;
    ctx.fill();

    ctx.beginPath();
    ctx.roundRect(-17, -5, 32, 3, 2);
    ctx.fillStyle = "rgba(0,0,0,0.2)";
    ctx.fill();

    ctx.restore();
  }

  draw(ctx) {
    // draw() is unused — we use drawScreen() instead
  }
}

// ── Screen-space draw (always readable size) ──────────────
TowerWheel.prototype.drawScreen = function(ctx, worldScale) {
  if (!this.visible) return;

  const sx = this.cx * worldScale;
  const sy = this.cy * worldScale;

  const orbitDist  = WHEEL_ORBIT;
  const btnW       = WHEEL_BTN_W;
  const btnH       = WHEEL_BTN_H;
  const ringRadius = WHEEL_RING_R;
  const sc         = this.scale;

  const slotOffsets = [
    { ax: Math.cos(-Math.PI/2), ay: Math.sin(-Math.PI/2) }, // top
    { ax: Math.cos(0),          ay: Math.sin(0)          }, // right
    { ax: Math.cos(Math.PI/2),  ay: Math.sin(Math.PI/2)  }, // bottom
    { ax: Math.cos(Math.PI),    ay: Math.sin(Math.PI)    }, // left
  ];

  ctx.save();

  // ── Range circle ──────────────────────────────────────
  ctx.beginPath();
  ctx.arc(sx, sy, WHEEL_RANGE * worldScale * sc, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(255,255,255,0.12)";
  ctx.lineWidth   = 2;
  ctx.setLineDash([8, 6]);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.arc(sx, sy, WHEEL_RANGE * worldScale * sc, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,0.03)";
  ctx.fill();

  // ── Full ring connecting boxes ─────────────────────────
  ctx.beginPath();
  ctx.arc(sx, sy, ringRadius * sc, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(255,180,40,0.2)";
  ctx.lineWidth   = 10 * sc;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(sx, sy, ringRadius * sc, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(160,100,20,0.9)";
  ctx.lineWidth   = 3.5 * sc;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(sx, sy, ringRadius * sc, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(255,220,80,0.25)";
  ctx.lineWidth   = 1.5 * sc;
  ctx.stroke();

  // ── Draw each slot ─────────────────────────────────────
  for (let i = 0; i < WHEEL_TOWERS.length; i++) {
    const tower   = WHEEL_TOWERS[i];
    const off     = slotOffsets[i];
    const px      = sx + off.ax * orbitDist * sc;
    const py      = sy + off.ay * orbitDist * sc;
    const hovered = this.hoveredIdx === i;
    const hoverSc = hovered ? 1.12 : 1.0;
    const w       = btnW * sc * hoverSc;
    const h       = btnH * sc * hoverSc;
    const x       = px - w / 2;
    const y       = py - h / 2;
    const r       = Math.max(0, 8 * sc);

    ctx.save();

    // Outer border
    ctx.beginPath();
    ctx.roundRect(x - 3, y - 3, w + 6, h + 6, Math.max(0, r + 2));
    ctx.fillStyle = "#0d0700";
    ctx.fill();

    // Background
    const bg = ctx.createRadialGradient(px - w*0.1, py - h*0.1, 0, px, py, Math.max(w, h) * 0.7);
    if (hovered) {
      bg.addColorStop(0, "#6a4010");
      bg.addColorStop(1, "#2a1504");
    } else {
      bg.addColorStop(0, "#4a2c08");
      bg.addColorStop(1, "#1a0e02");
    }
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    ctx.fillStyle = bg;
    ctx.fill();

    // Inner highlight border
    ctx.beginPath();
    ctx.roundRect(x + 2, y + 2, w - 4, h - 4, Math.max(0, r - 2));
    ctx.strokeStyle = hovered ? "rgba(255,220,100,0.7)" : "rgba(255,200,80,0.25)";
    ctx.lineWidth   = 2;
    ctx.stroke();

    // Corner rivets
    [[x+6, y+6],[x+w-6, y+6],[x+6, y+h-6],[x+w-6, y+h-6]].forEach(([rx, ry]) => {
      ctx.beginPath();
      ctx.arc(rx, ry, 3, 0, Math.PI * 2);
      ctx.fillStyle = "#2a1500";
      ctx.fill();
      const rg = ctx.createRadialGradient(rx-1, ry-1, 0, rx, ry, 3);
      rg.addColorStop(0, "#9a7040");
      rg.addColorStop(1, "#4a2810");
      ctx.beginPath();
      ctx.arc(rx, ry, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = rg;
      ctx.fill();
    });

    // ── Tower name ────────────────────────────────────────
    ctx.fillStyle    = "#FFFFFF";
    ctx.strokeStyle  = "#000000";
    ctx.lineWidth    = 3;
    ctx.font         = `bold ${Math.round(WHEEL_NAME_SZ * sc * hoverSc)}px Arial`;
    ctx.textAlign    = "center";
    ctx.textBaseline = "middle";
    ctx.strokeText(tower.label, px, py + WHEEL_NAME_Y * sc);
    ctx.fillText(tower.label,   px, py + WHEEL_NAME_Y * sc);

    // ── Cost ──────────────────────────────────────────────
    ctx.fillStyle    = "#FFD700";
    ctx.strokeStyle  = "#000000";
    ctx.lineWidth    = 2;
    ctx.font         = `bold ${Math.round(WHEEL_COST_SZ * sc * hoverSc)}px Arial`;
    ctx.strokeText(`${tower.cost}`, px, py + WHEEL_COST_Y * sc);
    ctx.fillText(`${tower.cost}`,   px, py + WHEEL_COST_Y * sc);

    ctx.restore();
  }

  // ── Hammer ─────────────────────────────────────────────
  this._drawHammer(ctx, sx, sy, 15 * sc);

  ctx.restore();
};

// ── Hover detection in screen space ───────────────────────
TowerWheel.prototype.updateHoverScreen = function(sx, sy, worldScale) {
  if (!this.visible) return;
  this.hoveredIdx = -1;

  const sc  = this.scale;
  const cx  = this.cx * worldScale;
  const cy  = this.cy * worldScale;

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

// ── Click detection in screen space ───────────────────────
TowerWheel.prototype.handleClickScreen = function(sx, sy, worldScale) {
  if (!this.visible) return null;

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