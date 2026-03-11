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
    x       : 75,  // distance from LEFT edge
    y       : 32,  // distance from TOP edge
    fontSize: 27,  // font size
  },
  wave: {
    gap     : 35,  // gap between score and wave counter
    fontSize: 25,  // font size (smaller than score)
    yOffset : 1,   // vertical offset relative to score y (0 = same line)
  },
  pauseBtn: {
    x: 16,  // distance from LEFT edge
    y: 15,  // distance from TOP edge
    w: 36,  // width
    h: 34,  // height
    r: 6,   // corner radius
  },
};
// ═══════════════════════════════════

class HUD {
  constructor() {
    this.lives = 10;
    this.coins = 200;
    this.score = 0;

    // Wave banner
    this._banner      = null; // { text, timer, life, type }
  }

  reset() {
    this.lives       = 10;
    this.coins       = 200;
    this.score       = 0;
    this._banner     = null;
    this._bannerBg   = null;
    this._bannerLine = null;
    this._bannerBgW  = null;
  }

  showWaveBanner(num, total) {
    this._banner = { text: 'WAVE ' + num + ' / ' + total, sub: 'Prepare your defenses!', timer: 0, life: 2.8, type: 'wave' };
  }
  showWaveComplete(num) {
    this._banner = { text: 'WAVE ' + num + ' CLEARED', sub: 'Next wave incoming...', timer: 0, life: 2.5, type: 'clear' };
  }
  showBoss() {
    this._banner = { text: '⚠ BOSS INCOMING ⚠', sub: 'Destroy it before it reaches the end!', timer: 0, life: 3.5, type: 'boss' };
  }
  showVictory() {
    this._banner = { text: 'VICTORY', sub: 'All waves defeated!', timer: 0, life: 99, type: 'victory' };
  }

  update(dt) {
    if (this._banner) {
      this._banner.timer += dt;
      if (this._banner.type !== 'victory' && this._banner.timer >= this._banner.life) {
        this._banner = null;
      }
    }
  }

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

  _drawCoin(ctx, cx, cy, size, red) {
    ctx.save();
    ctx.translate(cx, cy);
    const r = size / 2;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fillStyle = red ? "#8b0000" : "#b8860b";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.82, 0, Math.PI * 2);
    const cg = ctx.createLinearGradient(-r, -r, r, r);
    if (red) {
      cg.addColorStop(0,   "#ff6666");
      cg.addColorStop(0.5, "#ee2222");
      cg.addColorStop(1,   "#aa0000");
    } else {
      cg.addColorStop(0,   "#ffe566");
      cg.addColorStop(0.5, "#f1c40f");
      cg.addColorStop(1,   "#d4a000");
    }
    ctx.fillStyle = cg;
    ctx.fill();
    ctx.font         = `bold ${Math.round(r * 1.1)}px serif`;
    ctx.fillStyle    = red ? "#ffcccc" : "#7a5200";
    ctx.textAlign    = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("$", 0, 1);
    ctx.beginPath();
    ctx.moveTo(-r * 0.45, -r * 0.55);
    ctx.lineTo(-r * 0.05, -r * 0.25);
    ctx.strokeStyle = red ? "rgba(255,200,200,0.55)" : "rgba(255,255,255,0.55)";
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
    // Red when coins are below the cheapest affordable action
    const _coinColor = (this._warnCoins && this.coins < this._warnCoins) ? "#ff4444" : "#fff8e7";
    ctx.fillStyle    = "#1a0a00";
    ctx.fillText(this.coins.toLocaleString(), canvasW - C.coinsText.x + 1, C.coinsText.y + 1);
    ctx.fillStyle    = _coinColor;
    ctx.fillText(this.coins.toLocaleString(), canvasW - C.coinsText.x, C.coinsText.y);

    // ── Score + Wave (top left, inline) ───────────────
    const scoreStr = "⭐ " + this.score.toLocaleString();
    ctx.font         = `bold ${C.score.fontSize}px serif`;
    ctx.textAlign    = "left";
    ctx.textBaseline = "middle";
    ctx.fillStyle    = "#1a0a00";
    ctx.fillText(scoreStr, C.score.x + 1, C.score.y + 1);
    ctx.fillStyle    = "#fff8e7";
    ctx.fillText(scoreStr, C.score.x, C.score.y);

    // Wave counter right after score
    const waveNum   = WaveManager.getWaveNum();
    const waveTotal = WaveManager.getTotalWaves();
    const wavePhase = WaveManager.getPhase();
    if (wavePhase !== 'idle') {
      const scoreW = ctx.measureText(scoreStr).width;
      const waveX  = C.score.x + scoreW + C.wave.gap;
      const waveY  = C.score.y + C.wave.yOffset;

      let label, color;
      if (wavePhase === 'countdown') {
        const cd   = WaveManager.getCountdown();
        const next = waveNum + 1;
        label = next <= waveTotal
          ? '⚔ Wave ' + next + ' in ' + cd + 's'
          : '⚔ All waves done!';
        color = '#c9a84c';
      } else {
        label = '⚔ Wave ' + waveNum + ' / ' + waveTotal;
        color = '#fff8e7';
      }

      ctx.font         = `bold ${C.wave.fontSize}px serif`;
      ctx.textAlign    = "left";
      ctx.textBaseline = "middle";
      ctx.fillStyle    = "#1a0a00";
      ctx.fillText(label, waveX + 1, waveY + 1);
      ctx.fillStyle    = color;
      ctx.fillText(label, waveX, waveY);
    }

    // ── Wave banner (center screen) ───────────────────
    if (this._banner) {
      const b = this._banner;
      const p = b.timer / b.life;
      let alpha = 1;
      if (p < 0.12)       alpha = p / 0.12;
      else if (p > 0.75)  alpha = b.type === 'victory' ? 1 : (1 - p) / 0.25;

      const cy = canvasH * 0.38;
      const bw = canvasW * 0.6, bh = 72;
      const bx = (canvasW - bw) / 2;

      ctx.save();
      ctx.globalAlpha = alpha;

      // Background strip — only create gradient if canvas size changed
      if (!this._bannerBg || this._bannerBgW !== canvasW) {
        this._bannerBgW = canvasW;
        this._bannerBg  = ctx.createLinearGradient(bx, 0, bx + bw, 0);
        this._bannerBg.addColorStop(0,   'rgba(0,0,0,0)');
        this._bannerBg.addColorStop(0.15,'rgba(10,5,2,0.88)');
        this._bannerBg.addColorStop(0.85,'rgba(10,5,2,0.88)');
        this._bannerBg.addColorStop(1,   'rgba(0,0,0,0)');
        this._bannerLine = ctx.createLinearGradient(bx, 0, bx + bw, 0);
        this._bannerLine.addColorStop(0,   'rgba(201,168,76,0)');
        this._bannerLine.addColorStop(0.15,'rgba(201,168,76,0.7)');
        this._bannerLine.addColorStop(0.85,'rgba(201,168,76,0.7)');
        this._bannerLine.addColorStop(1,   'rgba(201,168,76,0)');
      }

      ctx.fillStyle = this._bannerBg;
      ctx.fillRect(bx, cy - bh/2, bw, bh);
      ctx.fillStyle = this._bannerLine;
      ctx.fillRect(bx, cy - bh/2, bw, 1);
      ctx.fillRect(bx, cy + bh/2 - 1, bw, 1);

      // Main text
      const color = b.type === 'wave'    ? '#f0e6d0'
                  : b.type === 'clear'   ? '#c9a84c'
                  : b.type === 'boss'    ? '#ff4444'
                  : '#ffd700';
      ctx.font         = `900 ${Math.round(canvasW * 0.026)}px Cinzel, serif`;
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor  = b.type === 'victory' ? 'rgba(255,215,0,0.6)' : 'rgba(201,168,76,0.4)';
      ctx.shadowBlur   = 18;
      ctx.fillStyle    = '#000';
      ctx.fillText(b.text, canvasW/2 + 1, cy - 8 + 1);
      ctx.fillStyle    = color;
      ctx.fillText(b.text, canvasW/2, cy - 8);

      // Sub text
      ctx.shadowBlur   = 0;
      ctx.font         = `italic 300 ${Math.round(canvasW * 0.011)}px Crimson Pro, serif`;
      ctx.fillStyle    = 'rgba(154,138,112,0.9)';
      ctx.fillText(b.sub, canvasW/2, cy + 18);

      ctx.restore();
    }

    ctx.restore();
  }

  _drawPauseBtn(ctx) {
    if (this._hidePauseBtn) return;
    const b = HUD_CFG.pauseBtn;
    ctx.save();
    ctx.fillStyle   = 'rgba(20,12,4,0.75)';
    ctx.strokeStyle = 'rgba(201,168,76,0.45)';
    ctx.lineWidth   = 1.5;
    ctx.beginPath();
    ctx.roundRect(b.x, b.y, b.w, b.h, b.r);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#c9a84c';
    const cx = b.x + b.w / 2;
    const cy = b.y + b.h / 2;
    if (this._paused) {
      const ts = 10;
      ctx.beginPath();
      ctx.moveTo(cx - ts * 0.6, cy - ts);
      ctx.lineTo(cx + ts,       cy);
      ctx.lineTo(cx - ts * 0.6, cy + ts);
      ctx.closePath();
      ctx.fill();
    } else {
      const barW = 6, barH = 18;
      const bar1X = cx - barW - 3;
      const bar2X = cx + 3;
      const barY  = cy - barH / 2;
      ctx.beginPath(); ctx.roundRect(bar1X, barY, barW, barH, 2); ctx.fill();
      ctx.beginPath(); ctx.roundRect(bar2X, barY, barW, barH, 2); ctx.fill();
    }
    ctx.restore();
    this._pauseBtnBounds = b;
  }

  isPauseBtnClick(sx, sy) {
    const b = this._pauseBtnBounds;
    if (!b) return false;
    return sx >= b.x && sx <= b.x + b.w && sy >= b.y && sy <= b.y + b.h;
  }
}