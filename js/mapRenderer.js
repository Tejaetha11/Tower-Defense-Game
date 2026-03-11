// mapRenderer.js
// Loads Tiled JSON and draws all layers onto the canvas

const FLIP_H    = 0x80000000;
const FLIP_V    = 0x40000000;
const FLIP_D    = 0x20000000;
const FLIP_MASK = ~(FLIP_H | FLIP_V | FLIP_D);

class MapRenderer {
  constructor(mapData, mudKey) {
    this.mapData        = mapData;
    this.mapW           = mapData.width;      // 19 tiles
    this.mapH           = mapData.height;     // 10 tiles
    this.tileSize       = mapData.tilewidth;  // 256px
    this.tileImages     = {};
    this.loaded         = false;
    this.placementLayer = null;
    this.offscreen      = null;

    // Mud polygon points for this map — relative to anchor offset
    this.mudPoints      = mudShapes[mudKey] || [];
    this.mudAnchor      = MUD_ANCHOR_OFFSETS[mudKey] || MUD_ANCHOR_OFFSETS.map1;
  }

  load(basePath, onReady) {
    const inlineTilesets = this.mapData.tilesets.filter(ts => ts.tiles && ts.tiles.length > 0);

    let total = inlineTilesets.reduce((sum, ts) => sum + ts.tiles.length, 0);
    let done  = 0;

    const checkDone = () => {
      done++;
      if (done >= total) {
        this._buildPlacementGrid();
        this._preRender();
        this._preRenderHoverGlow();
        this.loaded = true;
        onReady();
      }
    };

    if (total === 0) {
      this._buildPlacementGrid();
      this._preRender();
      this._preRenderHoverGlow();
      this.loaded = true;
      onReady();
      return;
    }

    inlineTilesets.forEach(tileset => {
      const firstgid = tileset.firstgid;
      tileset.tiles.forEach(tile => {
        const gid   = tile.id + firstgid;
        const img   = new Image();
        img.src     = basePath + tile.image;
        img.onload  = checkDone;
        img.onerror = checkDone;
        this.tileImages[gid] = img;
      });
    });
  }

  _buildPlacementGrid() {
    const layer = this.mapData.layers.find(l => l.name === "placement tiles");
    if (!layer) return;

    this.placementLayer = [];
    for (let row = 0; row < this.mapH; row++) {
      this.placementLayer[row] = [];
      for (let col = 0; col < this.mapW; col++) {
        const rawGid = layer.data[row * this.mapW + col];
        this.placementLayer[row][col] = rawGid & FLIP_MASK;
      }
    }
  }

  _preRender() {
    const ts    = this.tileSize;
    const fullW = this.mapW * ts;
    const fullH = this.mapH * ts;

    this.offscreen        = document.createElement("canvas");
    this.offscreen.width  = fullW;
    this.offscreen.height = fullH;

    const octx = this.offscreen.getContext("2d");
    octx.imageSmoothingEnabled = false;

    this.mapData.layers.forEach(layer => {
      if (layer.type !== "tilelayer" || !layer.visible) return;
      this._drawLayerToCtx(octx, layer);
    });
  }

  _drawLayerToCtx(ctx, layer) {
    const ts = this.tileSize;

    for (let row = 0; row < this.mapH; row++) {
      for (let col = 0; col < this.mapW; col++) {
        const rawGid = layer.data[row * this.mapW + col];
        if (!rawGid) continue;

        const flipH = !!(rawGid & FLIP_H);
        const flipV = !!(rawGid & FLIP_V);
        const flipD = !!(rawGid & FLIP_D);
        const gid   = rawGid & FLIP_MASK;

        const img = this.tileImages[gid];
        if (!img || !img.complete || img.naturalWidth === 0) continue;

        const dx = col * ts;
        const dy = row * ts;

        if (flipH || flipV || flipD) {
          ctx.save();
          ctx.translate(dx + ts / 2, dy + ts / 2);

          if (flipD) {
            if (!flipH && !flipV) {
              ctx.rotate(-Math.PI / 2);
              ctx.scale(-1, 1);
            } else if (flipH && !flipV) {
              ctx.rotate(Math.PI / 2);
            } else if (!flipH && flipV) {
              ctx.rotate(-Math.PI / 2);
            } else {
              ctx.rotate(Math.PI / 2);
              ctx.scale(-1, 1);
            }
          } else {
            ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
          }

          ctx.drawImage(img, -ts / 2, -ts / 2, ts, ts);
          ctx.restore();
        } else {
          ctx.drawImage(img, dx, dy, ts, ts);
        }
      }
    }
  }

  draw(ctx) {
    if (!this.loaded || !this.offscreen) return;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(this.offscreen, 0, 0);
  }

  isPlaceable(wx, wy) {
    if (!this.placementLayer) return false;
    const col = Math.floor(wx / this.tileSize);
    const row = Math.floor(wy / this.tileSize);
    if (row < 0 || row >= this.mapH || col < 0 || col >= this.mapW) return false;
    return this.placementLayer[row][col] !== 0;
  }

  _preRenderHoverGlow() {}

  drawHover(ctx, wx, wy) {
    if (!this.isPlaceable(wx, wy)) return;
    if (!this.mudPoints.length) return;

    const col   = Math.floor(wx / this.tileSize);
    const row   = Math.floor(wy / this.tileSize);
    const tileX = col * this.tileSize;
    const tileY = row * this.tileSize;
    const ax    = this.mudAnchor.x;
    const ay    = this.mudAnchor.y;

    ctx.save();

    ctx.beginPath();
    this.mudPoints.forEach((pt, i) => {
      const px = tileX + ax + pt.x;
      const py = tileY + ay + pt.y;
      if (i === 0) ctx.moveTo(px, py);
      else         ctx.lineTo(px, py);
    });
    ctx.closePath();

    // Theme glow colours per level
    const THEME_GLOW = {
      1: { solid: 'rgba(255, 120,  30, 1)',  mid: 'rgba(255, 120,  30, 0.4)', fill: 'rgba(255, 100,  20, 0.08)' }, // Volcano — molten orange
      2: { solid: 'rgba(180, 130,  60, 1)',  mid: 'rgba(180, 130,  60, 0.4)', fill: 'rgba(160, 110,  40, 0.08)' }, // Mining  — dusty gold
      3: { solid: 'rgba( 80, 200, 255, 1)',  mid: 'rgba( 80, 200, 255, 0.4)', fill: 'rgba( 60, 180, 255, 0.08)' }, // Snow    — icy blue
    };
    const theme = THEME_GLOW[this._levelNum] || THEME_GLOW[1];

    ctx.shadowColor   = theme.solid;
    ctx.shadowBlur    = 30;
    ctx.strokeStyle   = theme.solid;
    ctx.lineWidth     = 4;
    ctx.stroke();

    ctx.shadowBlur    = 60;
    ctx.strokeStyle   = theme.mid;
    ctx.lineWidth     = 8;
    ctx.stroke();

    ctx.shadowBlur    = 0;
    ctx.fillStyle     = theme.fill;
    ctx.fill();

    ctx.restore();
  }
}