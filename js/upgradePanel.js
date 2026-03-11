// upgradePanel.js — Fantasy/Medieval floating upgrade panel

// ═══════════════════════════════════════════════
//  UPGRADE PANEL CONFIG — tweak everything here
// ═══════════════════════════════════════════════
const UPGRADE_CONFIG = {
  // Position offset from tower center (CSS px)
  offsetX       : -50,
  offsetY       : -80,

  // Bob animation
  bobAmplitude  : 4,
  bobSpeed      : 2.5,

  // Card
  cardW         : 130,
  cardPadX      : 8,
  cardPadY      : 6,
  cardRadius    : 7,

  // Button
  btnHeight     : 18,
  btnRadius     : 4,

  // Fonts
  fontTitle     : "bold 10px serif",
  fontStat      : "9px serif",
  fontBtn       : "bold 10px serif",

  // Colors
  cardBgTop     : "#2a1a0a",
  cardBgBot     : "#1a0e05",
  cardBorder    : "#c8a84b",
  cardBorder2   : "#7a5a1a",
  cardGlow      : "rgba(200,168,75,0.25)",
  titleColor    : "#f5d87a",
  titleShadow   : "#7a4a00",
  statLabelColor: "#b89a5a",
  statValueColor: "#ffffff",
  dividerColor  : "#5a3e10",
  btnBgTop      : "#7a5000",
  btnBgBot      : "#4a2e00",
  btnBorder     : "#f0c040",
  btnTextColor  : "#fff8dc",
  btnGlow       : "rgba(240,192,64,0.4)",
  btnBgTopMax   : "#3a3a1a",
  btnBgBotMax   : "#1a1a0a",
  btnBorderMax  : "#888844",
  btnTextMax    : "#cccc88",
  gemColor      : "#e8c060",

  edgeMargin    : 10,
};
// ═══════════════════════════════════════════════

class UpgradePanel {
  constructor() {
    this.visible       = false;
    this.selectedTower = null;
    this._btnX         = 0;
    this._btnY         = 0;
    this._btnW         = 0;
    this._btnH         = 0;
    this._floatTimer   = 0;
    this._floatY       = 0;

    // Set from game.js after canvas sized:
    //   upgradePanel.canvasCSSW = cssW;
    //   upgradePanel.canvasCSSH = cssH;
    this.canvasCSSW    = 0;
    this.canvasCSSH    = 0;
  }

  show(tower) {
    this.visible       = true;
    this.selectedTower = tower;
    this._floatTimer   = 0;
  }

  hide() {
    this.visible       = false;
    this.selectedTower = null;
  }

  update(dt) {
    if (!this.visible) return;
    this._floatTimer += dt;
    this._floatY = Math.sin(this._floatTimer * UPGRADE_CONFIG.bobSpeed)
                   * UPGRADE_CONFIG.bobAmplitude;
  }

  handleClick(sx, sy, towerManager, goldManager, scale) {
    if (!this.visible) return false;
    if (sx >= this._btnX && sx <= this._btnX + this._btnW &&
        sy >= this._btnY && sy <= this._btnY + this._btnH) {
      const t = this.selectedTower;
      // Block if already upgrading or building
      const busy = t && (t.state === 'upgrading' || t.state === 'building' || t.state === 'up_smoke' || t.state === 'smoke');
      if (!busy && towerManager.getUpgradeCost(t) !== null) {
        towerManager.upgradeTower(t);
        this.show(t);
      }
      return true;
    }
    this.hide();
    return false;
  }

  // ── Helpers ───────────────────────────────────────────────

  _roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y,      x + w, y + r,     r);
    ctx.lineTo(x + w, y + h - r);
    ctx.arcTo(x + w, y + h,  x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h);
    ctx.arcTo(x,     y + h,  x,     y + h - r, r);
    ctx.lineTo(x,    y + r);
    ctx.arcTo(x,     y,      x + r, y,          r);
    ctx.closePath();
  }

  _drawDiamond(ctx, cx, cy, size, color) {
    ctx.beginPath();
    ctx.moveTo(cx,        cy - size);
    ctx.lineTo(cx + size, cy);
    ctx.lineTo(cx,        cy + size);
    ctx.lineTo(cx - size, cy);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  }

  _gradientV(ctx, x, y, h, topColor, botColor) {
    const g = ctx.createLinearGradient(x, y, x, y + h);
    g.addColorStop(0, topColor);
    g.addColorStop(1, botColor);
    return g;
  }

  // ── Smart position — flips on ALL four edges ──────────────
  _resolvePos(tcx, tcy, cardW, cardH) {
    const cfg = UPGRADE_CONFIG;
    const m   = cfg.edgeMargin;
    const cw  = this.canvasCSSW > 0 ? this.canvasCSSW : window.innerWidth;
    const ch  = this.canvasCSSH > 0 ? this.canvasCSSH : window.innerHeight;

    // ── Vertical ──────────────────────────────────────────
    // Default: card ABOVE tower
    let cy = tcy + cfg.offsetY - cardH + this._floatY;
    // Flip BELOW if card clips top edge
    if (cy < m) {
      cy = tcy + Math.abs(cfg.offsetY) + this._floatY;
    }
    // Hard clamp top and bottom
    cy = Math.max(cy, m);
    cy = Math.min(cy, ch - cardH - m);

    // ── Horizontal ────────────────────────────────────────
    // Default: card left edge at tcx + offsetX
    let cx = tcx + cfg.offsetX;

    // Would card overflow RIGHT edge? → flip card to LEFT side of tower
    if (cx + cardW + m > cw) {
      cx = tcx - Math.abs(cfg.offsetX) - cardW;
    }

    // Would card overflow LEFT edge? → push it right to margin
    if (cx < m) {
      cx = m;
    }

    return { cx, cy };
  }

  // ── Main draw ─────────────────────────────────────────────
  draw(ctx, tower, scale, dpr) {
    if (!this.visible || !tower) return;

    const cfg    = UPGRADE_CONFIG;
    const def    = TOWER_DEFS[tower.type];
    const ups    = def.upgrades || [];
    const isMax  = tower.level >= ups.length;
    const nextUp = isMax ? null : ups[tower.level];

    const curDmg   = tower.damage   || (ups[0] ? ups[0].damage   : "—");
    const curRange = tower.range    || def.range;
    const curRate  = tower.fireRate || def.fireRate;

    const isBusy    = tower.state === 'upgrading' || tower.state === 'building' || tower.state === 'up_smoke' || tower.state === 'smoke';
    const canAfford = (this._coins === undefined || this._coins >= (nextUp ? nextUp.cost : 0));
    const btnLabel  = isMax ? "✦ MAX LEVEL ✦" : isBusy ? "⏳ Upgrading..." : `⬆ Upgrade  ${nextUp.cost} 🪙`;
    const towerName = (tower.type || "Tower").replace("tower", "Tower ");

    // Layout
    const cardW  = cfg.cardW;
    const lineH  = 14;
    const titleH = 16;
    const statsH = lineH * 3 + 2;
    const btnH   = cfg.btnHeight;
    const cardH  = cfg.cardPadY * 2 + titleH + 4 + 6 + statsH + 6 + btnH;

    // Tower center in CSS px
    const tcx = tower.cx * scale;
    const tcy = tower.cy * scale;

    const { cx, cy } = this._resolvePos(tcx, tcy, cardW, cardH);

    // Hit area = button row at bottom of card
    this._btnX = cx;
    this._btnY = cy + cardH - btnH - cfg.cardPadY;
    this._btnW = cardW;
    this._btnH = btnH + cfg.cardPadY;

    ctx.save();

    // ── Card glow ─────────────────────────────────────────
    ctx.shadowColor = cfg.cardGlow;
    ctx.shadowBlur  = 14;

    // ── Card background ───────────────────────────────────
    this._roundRect(ctx, cx, cy, cardW, cardH, cfg.cardRadius);
    ctx.fillStyle = this._gradientV(ctx, cx, cy, cardH, cfg.cardBgTop, cfg.cardBgBot);
    ctx.fill();
    ctx.shadowColor = "transparent";

    // ── Gold outer border ─────────────────────────────────
    this._roundRect(ctx, cx, cy, cardW, cardH, cfg.cardRadius);
    ctx.strokeStyle = cfg.cardBorder;
    ctx.lineWidth   = 1.5;
    ctx.stroke();

    // ── Inner engraved border ─────────────────────────────
    this._roundRect(ctx, cx + 3, cy + 3, cardW - 6, cardH - 6, cfg.cardRadius - 2);
    ctx.strokeStyle = cfg.cardBorder2;
    ctx.lineWidth   = 1;
    ctx.stroke();

    // ── Corner diamonds ───────────────────────────────────
    const gs = 3, gp = 3;
    this._drawDiamond(ctx, cx + gp + gs,         cy + gp + gs,         gs, cfg.gemColor);
    this._drawDiamond(ctx, cx + cardW - gp - gs, cy + gp + gs,         gs, cfg.gemColor);
    this._drawDiamond(ctx, cx + gp + gs,         cy + cardH - gp - gs, gs, cfg.gemColor);
    this._drawDiamond(ctx, cx + cardW - gp - gs, cy + cardH - gp - gs, gs, cfg.gemColor);

    // ── Title ─────────────────────────────────────────────
    let drawY = cy + cfg.cardPadY;
    ctx.textAlign    = "center";
    ctx.textBaseline = "top";
    ctx.font         = cfg.fontTitle;
    ctx.fillStyle    = cfg.titleShadow;
    ctx.fillText(towerName, cx + cardW / 2 + 1, drawY + 1);
    ctx.fillStyle = cfg.titleColor;
    ctx.fillText(towerName, cx + cardW / 2, drawY);
    drawY += titleH;

    // Stars
    const totalLevels = ups.length + 1;
    const starStr = "⭐".repeat(tower.level + 1) + "☆".repeat(Math.max(0, totalLevels - tower.level - 1));
    ctx.font      = "8px serif";
    ctx.fillStyle = "#e8c060";
    ctx.fillText(starStr, cx + cardW / 2, drawY - 1);
    drawY += 6;

    // ── Divider ───────────────────────────────────────────
    ctx.beginPath();
    ctx.moveTo(cx + 10,         drawY);
    ctx.lineTo(cx + cardW - 10, drawY);
    ctx.strokeStyle = cfg.dividerColor;
    ctx.lineWidth   = 1;
    ctx.stroke();
    this._drawDiamond(ctx, cx + cardW / 2, drawY, 3, cfg.gemColor);
    drawY += 7;

    // ── Stats ─────────────────────────────────────────────
    const stats = [
      { icon: "⚔", label: "DMG", value: curDmg },
      { icon: "🎯", label: "RNG", value: Math.round(curRange) },
      { icon: "⚡", label: "SPD", value: `${(1 / curRate).toFixed(1)}/s` },
    ];

    stats.forEach(stat => {
      ctx.font      = "9px serif";
      ctx.fillStyle = cfg.gemColor;
      ctx.textAlign = "left";
      ctx.fillText(stat.icon, cx + cfg.cardPadX, drawY);

      ctx.font      = cfg.fontStat;
      ctx.fillStyle = cfg.statLabelColor;
      ctx.fillText(stat.label, cx + cfg.cardPadX + 13, drawY);

      ctx.font      = "bold 9px serif";
      ctx.fillStyle = cfg.statValueColor;
      ctx.textAlign = "right";
      ctx.fillText(stat.value, cx + cardW - cfg.cardPadX, drawY);

      drawY += lineH;
    });

    drawY += 4;

    // ── Upgrade button ────────────────────────────────────
    const btnX = cx + cfg.cardPadX;
    const btnW = cardW - cfg.cardPadX * 2;
    const btnY = drawY;

    if (!isMax && !isBusy) {
      ctx.shadowColor = cfg.btnGlow;
      ctx.shadowBlur  = 8;
    }

    this._roundRect(ctx, btnX, btnY, btnW, btnH, cfg.btnRadius);
    ctx.fillStyle = this._gradientV(
      ctx, btnX, btnY, btnH,
      isMax || isBusy ? cfg.btnBgTopMax : cfg.btnBgTop,
      isMax || isBusy ? cfg.btnBgBotMax : cfg.btnBgBot
    );
    ctx.fill();
    ctx.shadowColor = "transparent";

    this._roundRect(ctx, btnX, btnY, btnW, btnH, cfg.btnRadius);
    ctx.strokeStyle = isMax || isBusy ? cfg.btnBorderMax : cfg.btnBorder;
    ctx.lineWidth   = 1.5;
    ctx.stroke();

    if (!isMax && !isBusy) {
      const shimmer = ctx.createLinearGradient(btnX, btnY, btnX + btnW, btnY);
      shimmer.addColorStop(0,   "rgba(255,255,200,0)");
      shimmer.addColorStop(0.5, "rgba(255,255,200,0.15)");
      shimmer.addColorStop(1,   "rgba(255,255,200,0)");
      ctx.fillStyle = shimmer;
      this._roundRect(ctx, btnX, btnY, btnW, btnH / 2, cfg.btnRadius);
      ctx.fill();
    }

    ctx.font         = cfg.fontBtn;
    ctx.fillStyle    = isMax || isBusy ? cfg.btnTextMax : !canAfford ? "#ff6666" : cfg.btnTextColor;
    ctx.textAlign    = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(btnLabel, btnX + btnW / 2, btnY + btnH / 2);

    // ── Connector line to tower ───────────────────────────
    ctx.beginPath();
    ctx.moveTo(cx + cardW / 2, cy + cardH);
    ctx.lineTo(tcx,            tcy);
    ctx.strokeStyle = "rgba(200,168,75,0.3)";
    ctx.lineWidth   = 1;
    ctx.setLineDash([3, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.beginPath();
    ctx.arc(tcx, tcy, 3, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(200,168,75,0.6)";
    ctx.fill();

    ctx.restore();
  }
}