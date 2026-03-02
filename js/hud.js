// hud.js

// ═══════════════════════════════════
//  EASY TUNE — change these values
// ═══════════════════════════════════
const HUD_CFG = {
  heart: {
    x   : 87,  // distance from RIGHT edge
    y   : 24,  // distance from TOP edge
    size: 27,  // heart size
  },
  livesText: {
    x       : 60,  // distance from RIGHT edge
    y       : 32,  // distance from TOP edge
    fontSize: 29,  // font size
  },
  coin: {
    x   : 220, // distance from RIGHT edge
    y   : 30,  // distance from TOP edge
    size: 37,  // coin size
  },
  coinsText: {
    x       : 192, // distance from RIGHT edge
    y       : 32,  // distance from TOP edge
    fontSize: 29,  // font size
  },
  score: {
    x       : 20,  // distance from LEFT edge
    y       : 32,  // distance from TOP edge
    fontSize: 29,  // font size
  },
};
// ═══════════════════════════════════

class HUD {
  constructor() {
    this.lives = 10;
    this.coins = 200;
    this.score = 0;
  }

  update(dt) {}

  _drawHeart(ctx, cx, cy, size) {
    ctx.save();
    ctx.translate(cx, cy);
    const s = size / 20;
    ctx.scale(s, s);
    ctx.beginPath();
    ctx.moveTo(0, -4);
    ctx.bezierCurveTo(-9, -14, -20, -5, -10, 6);
    ctx.lineTo(0, 16);
    ctx.lineTo(10, 6);
    ctx.bezierCurveTo(20, -5, 9, -14, 0, -4);
    ctx.closePath();
    ctx.fillStyle   = "#e0182d";
    ctx.fill();
    ctx.strokeStyle = "#8a0010";
    ctx.lineWidth   = 2;
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(-4, -5, 3.5, 2, -0.4, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.fill();
    ctx.restore();
  }

  _drawCoin(ctx, cx, cy, size) {
    ctx.save();
    ctx.translate(cx, cy);
    const r = size / 2;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fillStyle = "#b8860b";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.82, 0, Math.PI * 2);
    const cg = ctx.createLinearGradient(-r, -r, r, r);
    cg.addColorStop(0,   "#ffe566");
    cg.addColorStop(0.5, "#f1c40f");
    cg.addColorStop(1,   "#d4a000");
    ctx.fillStyle = cg;
    ctx.fill();
    ctx.font         = `bold ${Math.round(r * 1.1)}px serif`;
    ctx.fillStyle    = "#7a5200";
    ctx.textAlign    = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("$", 0, 1);
    ctx.beginPath();
    ctx.moveTo(-r * 0.45, -r * 0.55);
    ctx.lineTo(-r * 0.05, -r * 0.25);
    ctx.strokeStyle = "rgba(255,255,255,0.55)";
    ctx.lineWidth   = r * 0.18;
    ctx.lineCap     = "round";
    ctx.stroke();
    ctx.restore();
  }

  draw(ctx, canvasW, canvasH) {
    ctx.save();

    const C = HUD_CFG;

    // ── Heart ──────────────────────────────────────────
    this._drawHeart(ctx, canvasW - C.heart.x, C.heart.y, C.heart.size);

    // ── Lives number ───────────────────────────────────
    ctx.font         = `bold ${C.livesText.fontSize}px serif`;
    ctx.textAlign    = "left";
    ctx.textBaseline = "middle";
    ctx.fillStyle    = "#1a0a00";
    ctx.fillText(this.lives, canvasW - C.livesText.x + 1, C.livesText.y + 1);
    ctx.fillStyle    = "#fff8e7";
    ctx.fillText(this.lives, canvasW - C.livesText.x, C.livesText.y);

    // ── Coin ───────────────────────────────────────────
    this._drawCoin(ctx, canvasW - C.coin.x, C.coin.y, C.coin.size);

    // ── Coins number ───────────────────────────────────
    ctx.font         = `bold ${C.coinsText.fontSize}px serif`;
    ctx.textAlign    = "left";
    ctx.textBaseline = "middle";
    ctx.fillStyle    = "#1a0a00";
    ctx.fillText(this.coins.toLocaleString(), canvasW - C.coinsText.x + 1, C.coinsText.y + 1);
    ctx.fillStyle    = "#fff8e7";
    ctx.fillText(this.coins.toLocaleString(), canvasW - C.coinsText.x, C.coinsText.y);

    // ── Score (top left) ───────────────────────────────
    ctx.font         = `bold ${C.score.fontSize}px serif`;
    ctx.textAlign    = "left";
    ctx.textBaseline = "middle";
    ctx.fillStyle    = "#1a0a00";
    ctx.fillText("⭐ " + this.score.toLocaleString(), C.score.x + 1, C.score.y + 1);
    ctx.fillStyle    = "#fff8e7";
    ctx.fillText("⭐ " + this.score.toLocaleString(), C.score.x, C.score.y);

    ctx.restore();
  }
}