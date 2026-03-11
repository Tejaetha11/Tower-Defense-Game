// endScreen.js
// ─────────────────────────────────────────────────────────────────
// Self-contained end/pause screen drawn on the game canvas.
// Usage:
//   EndScreen.show('win', stars, score)
//   EndScreen.show('gameover', 0, score)
//   EndScreen.show('menu')
//   EndScreen.hide()
//   EndScreen.update(dt)           ← call every frame
//   EndScreen.draw(ctx, w, h)      ← call every frame (screen-space)
//   EndScreen.onButton(name => {}) ← 'resume','restart','levels','quit','again','next','close'
// ─────────────────────────────────────────────────────────────────

const EndScreen = (() => {

  // ── Sprite sheets ─────────────────────────────────────────────
  const sheet     = new Image(); sheet.src     = './Win_loose.png';
  const menuSheet = new Image(); menuSheet.src = './Main_menu.png';

  // ── TUNE GAME OVER ────────────────────────────────────────────
  const GO_BG_SCALE    = 5;
  const GO_ICON_SCALE  = 6;
  const GO_ICON_OFFSET = { x: 0, y: -85 };
  const GO_TEXT_SCALE  = 5.5;
  const GO_TEXT_OFFSET = { x: 0, y: 38 };
  const GO_BTN_SCALE   = 4;
  const GO_BTN_OFFSET  = { x: 0, y: 105 };
  const BTN_PRESS_SHIFT = 3;
  // ── TUNE WIN TEXT & BUTTONS ───────────────────────────────────
  const WIN_TEXT_SCALE   = 5.5;
  const WIN_TEXT_OFFSET  = { x: 0,    y: 30  };
  const WIN_AGAIN_SCALE  = 4;
  const WIN_AGAIN_OFFSET = { x: -110, y: 90  };
  const WIN_NEXT_SCALE   = 4;
  const WIN_NEXT_OFFSET  = { x:  110, y: 90  };
  // ── TUNE WIN STARS ────────────────────────────────────────────
  const WIN_STAR_L_SCALE  = 4.7;
  const WIN_STAR_L_OFFSET = { x: -107, y: -60 };
  const WIN_STAR_R_SCALE  = 4.7;
  const WIN_STAR_R_OFFSET = { x:  107, y: -60 };
  const WIN_STAR_C_SCALE  = 5;
  const WIN_STAR_C_OFFSET = { x:    0, y: -83 };
  // ── TUNE STAR ANIMATION ───────────────────────────────────────
  const STAR_DELAY   = 0.35;
  const STAR_POP_DUR = 0.45;
  // ── TUNE CLOSE BUTTON ─────────────────────────────────────────
  const CLOSE_FRAC = { x: 0.871, y: 0.060, w: 0.10, h: 0.13 };
  // ── TUNE MENU ─────────────────────────────────────────────────
  const MENU_TOP_SCALE   = 3.6;
  const MENU_BOT_SCALE   = 3.6;
  const MENU_TOP_OFFSET  = { x: 0, y: -20 };
  const MENU_BOT_OFFSET  = { x: 2, y: 0   };
  const MENU_BTN_SCALE   = 3.6;
  const MENU_BTN_GAP     = 25;
  const MENU_BTNS_OFFSET = { x: 5, y: -150 };
  // ─────────────────────────────────────────────────────────────

  const MENU_BTNS = [
    { name: 'resume',  sx: 188, sy:  17, sw: 57, sh: 15 },
    { name: 'restart', sx: 268, sy:  32, sw: 57, sh: 15 },
    { name: 'levels',  sx: 189, sy:  64, sw: 58, sh: 15 },
    { name: 'quit',    sx: 269, sy: 144, sw: 58, sh: 15 },
  ];

  // ── State ─────────────────────────────────────────────────────
  let _screen        = 'none'; // 'none' | 'win' | 'gameover' | 'menu'
  let _stars         = 0;
  let _score         = 0;
  let _callback      = null;

  let _restartPressed = false;
  let _againPressed   = false;
  let _nextPressed    = false;
  let _closePressed   = false;
  let _menuPressed    = -1;

  let _restartBounds  = null;
  let _againBounds    = null;
  let _nextBounds     = null;
  let _closeBounds    = null;
  let _menuBtnBounds  = [];

  // Entry animation
  const ENTRY_DUR = 0.32; // seconds for pop-in
  let _entryTimer = 0;
  let _entryDone  = false;

  // Exit animation
  const EXIT_DUR  = 0.22;
  let _exiting    = false;
  let _exitTimer  = 0;

  // Star animation
  let _starAnim      = [{p:0,filled:false},{p:0,filled:false},{p:0,filled:false}];
  let _starTimer     = 0;
  let _starAnimating = false;

  // ── Public API ────────────────────────────────────────────────
  function show(type, stars, score) {
    _screen         = type;
    _stars          = stars  || 0;
    _score          = score  || 0;
    _restartPressed = false;
    _againPressed   = false;
    _nextPressed    = false;
    _closePressed   = false;
    _menuPressed    = -1;
    _entryTimer = 0;
    _entryDone  = false;
    _exiting    = false;
    _exitTimer  = 0;
    if (type === 'win') _startStarAnim();
  }

  function hide() {
    if (_screen === 'none' || _exiting) return;
    _exiting   = true;
    _exitTimer = 0;
  }

  function hideNow() {
    _screen    = 'none';
    _exiting   = false;
    _exitTimer = 0;
  }

  function onButton(cb) { _callback = cb; }

  function isVisible() { return _screen !== 'none' || _exiting; }
  function getScreen() { return _screen; }

  // ── Star animation ────────────────────────────────────────────
  function _startStarAnim() {
    _starAnim      = [{p:0,filled:false},{p:0,filled:false},{p:0,filled:false}];
    _starTimer     = 0;
    _starAnimating = true;
  }

  function update(dt) {
    if (_screen === 'none') return;
    if (!_entryDone) {
      _entryTimer += Math.min(dt, 0.05);
      if (_entryTimer >= ENTRY_DUR) _entryDone = true;
    }
    if (_exiting) {
      _exitTimer += Math.min(dt, 0.05);
      if (_exitTimer >= EXIT_DUR) {
        _exiting = false;
        _screen  = 'none';
      }
    }
    if (_screen !== 'win' || !_starAnimating) return;
    _starTimer += Math.min(dt, 0.05);
    const order = [0, 2, 1];
    for (let i = 0; i < 3; i++) {
      const si    = order[i];
      const start = i * STAR_DELAY;
      if (_starTimer >= start && i < _stars) {
        _starAnim[si].p      = Math.min((_starTimer - start) / STAR_POP_DUR, 1);
        _starAnim[si].filled = true;
      }
    }
    const done = _starTimer >= (_stars - 1) * STAR_DELAY + STAR_POP_DUR + 0.1;
    if (done) _starAnimating = false;
  }

  // ── Draw ──────────────────────────────────────────────────────
  function draw(ctx, W, H) {
    if (_screen === 'none') return;
    _restartBounds = null;
    _againBounds   = null;
    _nextBounds    = null;
    _closeBounds   = null;
    _menuBtnBounds = [];

    const sc = _exiting ? _exitScale() : _entryScale();
    const al = _exiting ? _exitAlpha() : _entryAlpha();

    // ── 1. Blurred background (full screen, no scale transform) ──
    if (EndScreen._bgSnapshot) {
      ctx.save();
      ctx.filter = 'blur(8px) brightness(0.55)';
      ctx.globalAlpha = al;
      ctx.drawImage(EndScreen._bgSnapshot, 0, 0, EndScreen._bgSnapshot.width, EndScreen._bgSnapshot.height, 0, 0, W, H);
      ctx.restore();
    } else {
      ctx.save();
      ctx.globalAlpha = al;
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(0, 0, W, H);
      ctx.restore();
    }

    // ── 2. Panel with scale/pop animation ─────────────────────
    ctx.save();
    ctx.globalAlpha = al;
    if (!_entryDone || _exiting) {
      ctx.translate(W / 2, H / 2);
      ctx.scale(sc, sc);
      ctx.translate(-W / 2, -H / 2);
    }
    if (_screen === 'gameover') _drawGameOver(ctx, W, H);
    if (_screen === 'win')      _drawWin(ctx, W, H);
    if (_screen === 'menu')     _drawMenu(ctx, W, H);
    ctx.restore();
  }

  function _easeOutBack(t) {
    const s = 1.70158;
    return 1 + (s+1)*Math.pow(t-1,3) + s*Math.pow(t-1,2);
  }

  // Entry pop — clamp t to [0,1], apply easeOutBack
  function _entryScale() {
    if (_entryDone) return 1;
    const t = Math.min(_entryTimer / ENTRY_DUR, 1);
    // easeOutBack: starts at 0, overshoots slightly, settles at 1
    const s = 1.70158;
    // remap: go from 0.5 → 1 with bounce feel
    return 0.5 + 0.5 * (1 + (s+1)*Math.pow(t-1,3) + s*Math.pow(t-1,2));
  }
  function _entryAlpha() {
    if (_entryDone) return 1;
    return Math.min(_entryTimer / (ENTRY_DUR * 0.6), 1);
  }

  function _exitScale() {
    const t = Math.min(_exitTimer / EXIT_DUR, 1);
    // ease in — shrink from 1 down to 0.5
    return 1 - (t * t) * 0.5;
  }

  function _exitAlpha() {
    const t = Math.min(_exitTimer / EXIT_DUR, 1);
    return 1 - t;
  }

  function _boardBounds(W, H) {
    const bsw = 93, bsh = 77;
    const bdw = bsw * GO_BG_SCALE, bdh = bsh * GO_BG_SCALE;
    return { x: (W-bdw)/2, y: (H-bdh)/2, w: bdw, h: bdh };
  }

  function _setCloseBounds(board) {
    _closeBounds = {
      x: board.x + CLOSE_FRAC.x * board.w,
      y: board.y + CLOSE_FRAC.y * board.h,
      w: CLOSE_FRAC.w * board.w,
      h: CLOSE_FRAC.h * board.h,
    };
  }

  function _drawGameOver(ctx, W, H) {
    ctx.save();
    ctx.imageSmoothingEnabled = false;

    // Board
    const bsx=10,bsy=298,bsw=93,bsh=77;
    const bdw=bsw*GO_BG_SCALE, bdh=bsh*GO_BG_SCALE;
    const bdx=(W-bdw)/2, bdy=(H-bdh)/2;
    ctx.drawImage(sheet, bsx,bsy,bsw,bsh, bdx,bdy,bdw,bdh);

    // Icon
    const isw=37,ish=32, idw=isw*GO_ICON_SCALE, idh=ish*GO_ICON_SCALE;
    ctx.drawImage(sheet, 311,383,isw,ish, (W-idw)/2+GO_ICON_OFFSET.x, (H-idh)/2+GO_ICON_OFFSET.y, idw,idh);

    // Text
    const tsw=62,tsh=12, tdw=tsw*GO_TEXT_SCALE, tdh=tsh*GO_TEXT_SCALE;
    ctx.drawImage(sheet, 251,367,tsw,tsh, (W-tdw)/2+GO_TEXT_OFFSET.x, (H-tdh)/2+GO_TEXT_OFFSET.y, tdw,tdh);

    // Restart button
    const rsw=45,rsh=17, rdw=rsw*GO_BTN_SCALE, rdh=rsh*GO_BTN_SCALE;
    const rdx=(W-rdw)/2+GO_BTN_OFFSET.x;
    const rdy=(H-rdh)/2+GO_BTN_OFFSET.y + (_restartPressed ? BTN_PRESS_SHIFT : 0);
    ctx.drawImage(sheet, 259,300,rsw,rsh, rdx,rdy,rdw,rdh);
    _restartBounds = { x:rdx, y:(H-rdh)/2+GO_BTN_OFFSET.y, w:rdw, h:rdh };

    ctx.restore();
    _setCloseBounds({ x:bdx, y:bdy, w:bdw, h:bdh });
  }

  function _drawWin(ctx, W, H) {
    ctx.save();
    ctx.imageSmoothingEnabled = false;

    // Board
    const bsw=93,bsh=77, bdw=bsw*GO_BG_SCALE, bdh=bsh*GO_BG_SCALE;
    const bdx=(W-bdw)/2, bdy=(H-bdh)/2;
    ctx.drawImage(sheet, 10,298,bsw,bsh, bdx,bdy,bdw,bdh);

    const bcx=W/2, bcy=H/2;

    // Stars
    const starCfg = [
      { idx:0, offset:WIN_STAR_L_OFFSET, scale:WIN_STAR_L_SCALE, big:false },
      { idx:2, offset:WIN_STAR_R_OFFSET, scale:WIN_STAR_R_SCALE, big:false },
      { idx:1, offset:WIN_STAR_C_OFFSET, scale:WIN_STAR_C_SCALE, big:true  },
    ];
    starCfg.forEach(st => {
      const anim = _starAnim[st.idx];
      const ox = bcx+st.offset.x, oy = bcy+st.offset.y;
      const esw=st.big?31:21, esh=st.big?29:23;
      const esx=st.big?240:277, esy=st.big?386:390;
      const fsw=st.big?31:21, fsh=st.big?29:23;
      const fsx=st.big?160:197, fsy=st.big?386:390;
      if (!anim.filled) {
        const w=esw*st.scale, h=esh*st.scale;
        ctx.drawImage(sheet, esx,esy,esw,esh, ox-w/2,oy-h/2,w,h);
      } else {
        const sc=st.scale*_easeOutBack(anim.p);
        const w=fsw*sc, h=fsh*sc;
        ctx.drawImage(sheet, fsx,fsy,fsw,fsh, ox-w/2,oy-h/2,w,h);
      }
    });

    // Win text
    const wtsw=30,wtsh=16, wtdw=wtsw*WIN_TEXT_SCALE, wtdh=wtsh*WIN_TEXT_SCALE;
    ctx.drawImage(sheet, 329,365,wtsw,wtsh, bcx+WIN_TEXT_OFFSET.x-wtdw/2, bcy+WIN_TEXT_OFFSET.y-wtdh/2, wtdw,wtdh);

    // Score
    ctx.save();
    ctx.imageSmoothingEnabled = true;
    ctx.font = '15px "Press Start 2P", monospace';
    ctx.fillStyle = '#5a3a1a';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('SCORE: ' + _score.toLocaleString(), bcx+WIN_TEXT_OFFSET.x, bcy+WIN_TEXT_OFFSET.y+110);
    ctx.restore();
    ctx.imageSmoothingEnabled = false;

    // Again button
    const agdw=32*WIN_AGAIN_SCALE, agdh=16*WIN_AGAIN_SCALE;
    const agdx=bcx+WIN_AGAIN_OFFSET.x-agdw/2;
    const agdy=bcy+WIN_AGAIN_OFFSET.y-agdh/2+(_againPressed?BTN_PRESS_SHIFT:0);
    ctx.drawImage(sheet, 113,299,32,16, agdx,agdy,agdw,agdh);
    _againBounds = { x:agdx, y:bcy+WIN_AGAIN_OFFSET.y-agdh/2, w:agdw, h:agdh };

    // Next button
    const nxdw=31*WIN_NEXT_SCALE, nxdh=16*WIN_NEXT_SCALE;
    const nxdx=bcx+WIN_NEXT_OFFSET.x-nxdw/2;
    const nxdy=bcy+WIN_NEXT_OFFSET.y-nxdh/2+(_nextPressed?BTN_PRESS_SHIFT:0);
    ctx.drawImage(sheet, 209,331,31,16, nxdx,nxdy,nxdw,nxdh);
    _nextBounds = { x:nxdx, y:bcy+WIN_NEXT_OFFSET.y-nxdh/2, w:nxdw, h:nxdh };

    ctx.restore();
    _setCloseBounds({ x:bdx, y:bdy, w:bdw, h:bdh });
  }

  function _drawMenu(ctx, W, H) {
    ctx.save();
    ctx.imageSmoothingEnabled = false;



    // Board top
    const tdw=82*MENU_TOP_SCALE, tdh=88*MENU_TOP_SCALE;
    const bdw=83*MENU_BOT_SCALE, bdh=39*MENU_BOT_SCALE;
    const cx=W/2+MENU_TOP_OFFSET.x, cy=H/2+MENU_TOP_OFFSET.y;
    const totalH=tdh+bdh;
    const tx=cx-tdw/2, ty=cy-totalH/2;
    ctx.drawImage(menuSheet, 95,2,82,88, tx,ty,tdw,tdh);
    ctx.drawImage(menuSheet, 95,134,83,39, cx-bdw/2+MENU_BOT_OFFSET.x, ty+tdh+MENU_BOT_OFFSET.y, bdw,bdh);

    // Buttons
    const btnCx=W/2+MENU_BTNS_OFFSET.x, btnStartY=H/2+MENU_BTNS_OFFSET.y;
    MENU_BTNS.forEach((btn, i) => {
      const dw=btn.sw*MENU_BTN_SCALE, dh=btn.sh*MENU_BTN_SCALE;
      const dx=btnCx-dw/2;
      const shift=_menuPressed===i?BTN_PRESS_SHIFT:0;
      const dy=btnStartY+i*(dh+MENU_BTN_GAP)+shift;
      ctx.drawImage(menuSheet, btn.sx,btn.sy,btn.sw,btn.sh, dx,dy,dw,dh);
      _menuBtnBounds.push({ x:dx, y:btnStartY+i*(dh+MENU_BTN_GAP), w:dw, h:dh });
    });

    ctx.restore();
  }

  // ── Hit detection ─────────────────────────────────────────────
  function _inB(pos, b) {
    return b && pos.x>=b.x && pos.x<=b.x+b.w && pos.y>=b.y && pos.y<=b.y+b.h;
  }

  function _fire(name) { if (_callback) _callback(name); }

  function handleMouseMove(sx, sy) {
    if (_screen === 'none') return 'default';
    const pos = { x:sx, y:sy };
    if (_screen === 'gameover') {
      return (_inB(pos,_restartBounds)||_inB(pos,_closeBounds)) ? 'pointer' : 'default';
    }
    if (_screen === 'win') {
      return (_inB(pos,_againBounds)||_inB(pos,_nextBounds)||_inB(pos,_closeBounds)) ? 'pointer' : 'default';
    }
    if (_screen === 'menu') {
      return _menuBtnBounds.some(b=>_inB(pos,b)) ? 'pointer' : 'default';
    }
    return 'default';
  }

  function handleMouseDown(sx, sy) {
    if (_screen === 'none') return false;
    if (!_entryDone || _exiting) return false; // block clicks during pop-in or pop-out
    const pos = { x:sx, y:sy };
    if (_screen === 'gameover') {
      if (_inB(pos,_restartBounds)) { _restartPressed=true; return true; }
      if (_inB(pos,_closeBounds))   { _closePressed=true;   return true; }
    }
    if (_screen === 'win') {
      if (_inB(pos,_againBounds)) { _againPressed=true; return true; }
      if (_inB(pos,_nextBounds))  { _nextPressed=true;  return true; }
      if (_inB(pos,_closeBounds)) { _closePressed=true; return true; }
    }
    if (_screen === 'menu') {
      for (let i=0;i<_menuBtnBounds.length;i++) {
        if (_inB(pos,_menuBtnBounds[i])) { _menuPressed=i; return true; }
      }
    }
    return false;
  }

  function handleMouseUp(sx, sy) {
    if (_screen === 'none') return false;
    const pos = { x:sx, y:sy };
    let hit = false;
    if (_restartPressed) { _restartPressed=false; if(_inB(pos,_restartBounds)){_fire('restart');hit=true;} }
    if (_againPressed)   { _againPressed=false;   if(_inB(pos,_againBounds))  {_fire('again');  hit=true;} }
    if (_nextPressed)    { _nextPressed=false;     if(_inB(pos,_nextBounds))   {_fire('next');   hit=true;} }
    if (_closePressed)   { _closePressed=false;    if(_inB(pos,_closeBounds))  {_fire('close');  hit=true;} }
    if (_menuPressed>=0) {
      const idx=_menuPressed; _menuPressed=-1;
      if(_inB(pos,_menuBtnBounds[idx])){_fire(MENU_BTNS[idx].name);hit=true;}
    }
    return hit;
  }

  function handleMouseLeave() {
    _restartPressed=false; _againPressed=false;
    _nextPressed=false;    _closePressed=false;
    _menuPressed=-1;
  }

  // ── Public ────────────────────────────────────────────────────
  return { show, hide, hideNow, onButton, isVisible, getScreen, update, draw,
           handleMouseMove, handleMouseDown, handleMouseUp, handleMouseLeave };

})();