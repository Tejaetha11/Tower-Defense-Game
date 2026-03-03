// mapRenderer.js
// Loads Tiled JSON and draws all layers onto the canvas

const FLIP_H    = 0x80000000;
const FLIP_V    = 0x40000000;
const FLIP_D    = 0x20000000;
const FLIP_MASK = ~(FLIP_H | FLIP_V | FLIP_D);

class MapRenderer {
  constructor(mapData, mudKey) {
    this.mapData        = mapData;
    this.mapW           = mapData.width;
    this.mapH           = mapData.height;
    this.tileSize       = mapData.tilewidth;
    this.tileImages     = {};
    this.loaded         = false;
    this.placementLayer = null;
    this.offscreen      = null;

    this.mudPoints      = mudShapes[mudKey] || [];
    this.mudAnchor      = MUD_ANCHOR_OFFSET;

    // Cached hover glow — built once after load
    this._hoverGlow     = null;   // offscreen canvas
    this._hoverGlowW    = 0;
    this._hoverGlowH    = 0;
  }

  load(basePath, onReady) {
    const tileset  = this.mapData.tilesets[0];
    const firstgid = tileset.firstgid;

    let total = tileset.tiles.length;
    let done  = 0;

    const checkDone = () => {
      done++;
      if (done >= total) {
        this._buildPlacementGrid();
        this._preRender();
        this._preRenderHoverGlow();   // ← bake glow once
        this.loaded = true;
        onReady();
      }
    };

    tileset.tiles.forEach(tile => {
      const gid   = tile.id + firstgid;
      const img   = new Image();
      img.src     = basePath + tile.image;
      img.onload  = checkDone;
      img.onerror = checkDone;
      this.tileImages[gid] = img;
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

    const layersToDraw = [
      "Background",
      "path",
      "volcano river",
      "other decoratives 1",
      "other decorative 2",
      "placement tiles"
    ];

    layersToDraw.forEach(name => {
      const layer = this.mapData.layers.find(l => l.name === name);
      if (!layer || !layer.visible) return;
      this._drawLayerToCtx(octx, layer);
    });
  }

  // ── Bake the mud-polygon hover glow into an offscreen canvas ──
  // shadowBlur is very expensive in Chrome — doing it once and
  // caching it as an image makes drawHover a single cheap drawImage.
  _preRenderHoverGlow() {
    if (!this.mudPoints.length) return;

    const ts  = this.tileSize;
    const pad = 80;   // extra padding so the blur isn't clipped

    // Size of a single tile + padding on all sides
    const w = ts + pad * 2;
    const h = ts + pad * 2;

    const oc   = document.createElement("canvas");
    oc.width   = w;
    oc.height  = h;
    const octx = oc.getContext("2d");

    const ax = this.mudAnchor.x + pad;
    const ay = this.mudAnchor.y + pad;

    // Build polygon path at (0,0) tile origin + padding offset
    const buildPath = () => {
      octx.beginPath();
      this.mudPoints.forEach((pt, i) => {
        const px = ax + pt.x;
        const py = ay + pt.y;
        if (i === 0) octx.moveTo(px, py);
        else         octx.lineTo(px, py);
      });
      octx.closePath();
    };

    // Soft outer glow
    buildPath();
    octx.shadowColor   = "rgba(224, 87, 29, 0.42)";
    octx.shadowBlur    = 30;
    octx.strokeStyle   = "rgba(224, 87, 29, 0.32)";
    octx.lineWidth     = 1;
    octx.stroke();

    // Bright inner stroke
    buildPath();
    octx.shadowColor   = "rgba(224, 88, 29, 0.9)";
    octx.shadowBlur    = 60;
    octx.strokeStyle   = "rgba(224, 88, 29, 1)";
    octx.lineWidth     = 8;
    octx.stroke();

    this._hoverGlow  = oc;
    this._hoverGlowW = w;
    this._hoverGlowH = h;
  }

  _drawLayerToCtx(ctx, layer) {
    const ts = this.tileSize;

    for (let row = 0; row < this.mapH; row++) {
      for (let col = 0; col < this.mapW; col++) {
        const rawGid = layer.data[row * this.mapW + col];
        if (!rawGid) continue;

        const flipH = !!(rawGid & FLIP_H);
        const flipV = !!(rawGid & FLIP_V);
        const gid   = rawGid & FLIP_MASK;

        const img = this.tileImages[gid];
        if (!img || !img.complete || img.naturalWidth === 0) continue;

        const dx = col * ts;
        const dy = row * ts;

        if (flipH || flipV) {
          ctx.save();
          ctx.translate(dx + ts / 2, dy + ts / 2);
          ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
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

  // Draw hover glow using the pre-baked canvas — single cheap drawImage
  drawHover(ctx, wx, wy) {
    if (!this.isPlaceable(wx, wy)) return;
    if (!this._hoverGlow) return;

    const col   = Math.floor(wx / this.tileSize);
    const row   = Math.floor(wy / this.tileSize);
    const tileX = col * this.tileSize;
    const tileY = row * this.tileSize;
    const pad   = 80;

    // Offset back by pad so the baked image aligns with the tile
    ctx.drawImage(this._hoverGlow, tileX - pad, tileY - pad);
  }
}