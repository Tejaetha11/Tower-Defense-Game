// waveManager.js — Level-aware wave system
// Level 1 : 5 waves · 3 paths · enemies 1-3  · boss1
// Level 2 : 7 waves · 5 paths · enemies 1-6  · boss1
// Level 3 : 9 waves · 6 paths · enemies 1-6  · boss1

var WaveManager = (function () {

  // ─────────────────────────────────────────────────────────────
  // LEVEL 1 — 5 waves, 3 paths
  // Totals: 6 → 12 → 15 → 20 → 25
  // ─────────────────────────────────────────────────────────────
  var WAVE_DEFS_L1 = [

    // Wave 1 — 6 total
    { paths: [
      [ {type:'enemy1', count:2, hp:100, speed:175} ],
      [ {type:'enemy1', count:2, hp:100, speed:175} ],
      [ {type:'enemy1', count:2, hp:100, speed:175} ],
    ]},

    // Wave 2 — 12 total
    { paths: [
      [ {type:'enemy1', count:3, hp:110, speed:178}, {type:'enemy2', count:1, hp:140, speed:190} ],
      [ {type:'enemy1', count:2, hp:110, speed:178}, {type:'enemy2', count:2, hp:140, speed:190} ],
      [ {type:'enemy1', count:3, hp:110, speed:178}, {type:'enemy2', count:1, hp:140, speed:190} ],
    ]},

    // Wave 3 — 15 total
    { paths: [
      [ {type:'enemy1', count:2, hp:125, speed:182}, {type:'enemy2', count:3, hp:155, speed:195} ],
      [ {type:'enemy2', count:3, hp:155, speed:195}, {type:'enemy1', count:2, hp:125, speed:182} ],
      [ {type:'enemy1', count:3, hp:125, speed:182}, {type:'enemy2', count:2, hp:155, speed:195} ],
    ]},

    // Wave 4 — 20 total
    { paths: [
      [ {type:'enemy2', count:3, hp:170, speed:200}, {type:'enemy3', count:4, hp:200, speed:215} ],
      [ {type:'enemy1', count:2, hp:140, speed:185}, {type:'enemy2', count:2, hp:170, speed:200}, {type:'enemy3', count:3, hp:200, speed:215} ],
      [ {type:'enemy2', count:4, hp:170, speed:200}, {type:'enemy3', count:2, hp:200, speed:215} ],
    ]},

    // Wave 5 — 25 total — BOSS
    { paths: [
      [ {type:'enemy1', count:3, hp:140, speed:185}, {type:'enemy2', count:3, hp:185, speed:205}, {type:'enemy3', count:3, hp:220, speed:225} ],
      [ {type:'enemy2', count:4, hp:185, speed:205}, {type:'enemy3', count:4, hp:220, speed:225} ],
      [ {type:'enemy1', count:2, hp:140, speed:185}, {type:'enemy2', count:3, hp:185, speed:205}, {type:'enemy3', count:3, hp:220, speed:225} ],
    ]},

  ];

  // ─────────────────────────────────────────────────────────────
  // LEVEL 2 — 7 waves, 5 paths
  // Totals: 6 → 12 → 15 → 20 → 25 → 30 → 35
  // ─────────────────────────────────────────────────────────────
  var WAVE_DEFS_L2 = [

    // Wave 1 — 6 total
    { paths: [
      [ {type:'enemy1', count:2, hp:120, speed:180} ],
      [ {type:'enemy1', count:1, hp:120, speed:180} ],
      [ {type:'enemy2', count:1, hp:160, speed:195} ],
      [ {type:'enemy1', count:1, hp:120, speed:180} ],
      [ {type:'enemy1', count:1, hp:120, speed:180} ],
    ]},

    // Wave 2 — 12 total
    { paths: [
      [ {type:'enemy1', count:2, hp:130, speed:182}, {type:'enemy2', count:1, hp:165, speed:198} ],
      [ {type:'enemy2', count:2, hp:165, speed:198}, {type:'enemy1', count:1, hp:130, speed:182} ],
      [ {type:'enemy1', count:2, hp:130, speed:182}, {type:'enemy2', count:1, hp:165, speed:198} ],
      [ {type:'enemy2', count:2, hp:165, speed:198}, {type:'enemy1', count:1, hp:130, speed:182} ],
      [ {type:'enemy1', count:2, hp:130, speed:182} ],
    ]},

    // Wave 3 — 15 total
    { paths: [
      [ {type:'enemy1', count:2, hp:135, speed:184}, {type:'enemy2', count:2, hp:168, speed:200} ],
      [ {type:'enemy2', count:3, hp:168, speed:200} ],
      [ {type:'enemy1', count:3, hp:135, speed:184}, {type:'enemy3', count:1, hp:230, speed:218} ],
      [ {type:'enemy2', count:2, hp:168, speed:200}, {type:'enemy1', count:1, hp:135, speed:184} ],
      [ {type:'enemy1', count:1, hp:135, speed:184}, {type:'enemy3', count:1, hp:230, speed:218} ],
    ]},

    // Wave 4 — 20 total
    { paths: [
      [ {type:'enemy2', count:2, hp:175, speed:202}, {type:'enemy3', count:2, hp:235, speed:220} ],
      [ {type:'enemy1', count:2, hp:140, speed:186}, {type:'enemy3', count:2, hp:235, speed:220} ],
      [ {type:'enemy3', count:3, hp:235, speed:220}, {type:'enemy2', count:1, hp:175, speed:202} ],
      [ {type:'enemy2', count:3, hp:175, speed:202}, {type:'enemy3', count:1, hp:235, speed:220} ],
      [ {type:'enemy1', count:2, hp:140, speed:186}, {type:'enemy2', count:2, hp:175, speed:202} ],
    ]},

    // Wave 5 — 25 total
    { paths: [
      [ {type:'enemy2', count:2, hp:180, speed:205}, {type:'enemy3', count:2, hp:240, speed:222}, {type:'enemy4', count:1, hp:300, speed:205} ],
      [ {type:'enemy3', count:3, hp:240, speed:222}, {type:'enemy4', count:2, hp:300, speed:205} ],
      [ {type:'enemy1', count:2, hp:145, speed:188}, {type:'enemy3', count:2, hp:240, speed:222}, {type:'enemy4', count:1, hp:300, speed:205} ],
      [ {type:'enemy2', count:3, hp:180, speed:205}, {type:'enemy3', count:2, hp:240, speed:222} ],
      [ {type:'enemy3', count:2, hp:240, speed:222}, {type:'enemy4', count:2, hp:300, speed:205}, {type:'enemy2', count:1, hp:180, speed:205} ],
    ]},

    // Wave 6 — 30 total
    { paths: [
      [ {type:'enemy3', count:2, hp:248, speed:225}, {type:'enemy4', count:3, hp:310, speed:208}, {type:'enemy5', count:1, hp:380, speed:192} ],
      [ {type:'enemy4', count:3, hp:310, speed:208}, {type:'enemy5', count:2, hp:380, speed:192}, {type:'enemy2', count:1, hp:185, speed:207} ],
      [ {type:'enemy3', count:3, hp:248, speed:225}, {type:'enemy4', count:2, hp:310, speed:208}, {type:'enemy5', count:1, hp:380, speed:192} ],
      [ {type:'enemy2', count:2, hp:185, speed:207}, {type:'enemy4', count:2, hp:310, speed:208}, {type:'enemy5', count:2, hp:380, speed:192} ],
      [ {type:'enemy3', count:2, hp:248, speed:225}, {type:'enemy5', count:2, hp:380, speed:192}, {type:'enemy4', count:2, hp:310, speed:208} ],
    ]},

    // Wave 7 — 35 total — BOSS
    { paths: [
      [ {type:'enemy4', count:3, hp:320, speed:210}, {type:'enemy5', count:2, hp:390, speed:194}, {type:'enemy6', count:2, hp:470, speed:180} ],
      [ {type:'enemy3', count:2, hp:255, speed:228}, {type:'enemy5', count:3, hp:390, speed:194}, {type:'enemy6', count:2, hp:470, speed:180} ],
      [ {type:'enemy4', count:3, hp:320, speed:210}, {type:'enemy6', count:2, hp:470, speed:180}, {type:'enemy5', count:2, hp:390, speed:194} ],
      [ {type:'enemy2', count:3, hp:190, speed:210}, {type:'enemy4', count:2, hp:320, speed:210}, {type:'enemy6', count:2, hp:470, speed:180} ],
      [ {type:'enemy3', count:3, hp:255, speed:228}, {type:'enemy5', count:2, hp:390, speed:194}, {type:'enemy6', count:2, hp:470, speed:180} ],
    ]},

  ];

  // ─────────────────────────────────────────────────────────────
  // LEVEL 3 — 9 waves, 6 paths
  // Totals: 6 → 12 → 15 → 20 → 25 → 30 → 35 → 40 → 45
  // ─────────────────────────────────────────────────────────────
  var WAVE_DEFS_L3 = [

    // Wave 1 — 6 total
    { paths: [
      [ {type:'enemy1', count:2, hp:150, speed:188} ],
      [ {type:'enemy1', count:1, hp:150, speed:188} ],
      [ {type:'enemy2', count:1, hp:185, speed:202} ],
      [ {type:'enemy1', count:1, hp:150, speed:188} ],
      [ {type:'enemy1', count:1, hp:150, speed:188} ],
      [],
    ]},

    // Wave 2 — 12 total
    { paths: [
      [ {type:'enemy1', count:2, hp:155, speed:190}, {type:'enemy2', count:1, hp:190, speed:205} ],
      [ {type:'enemy2', count:2, hp:190, speed:205}, {type:'enemy1', count:1, hp:155, speed:190} ],
      [ {type:'enemy1', count:2, hp:155, speed:190}, {type:'enemy2', count:1, hp:190, speed:205} ],
      [ {type:'enemy2', count:2, hp:190, speed:205} ],
      [ {type:'enemy1', count:1, hp:155, speed:190} ],
      [ {type:'enemy1', count:1, hp:155, speed:190} ],
    ]},

    // Wave 3 — 15 total
    { paths: [
      [ {type:'enemy1', count:2, hp:158, speed:192}, {type:'enemy2', count:2, hp:194, speed:207} ],
      [ {type:'enemy2', count:2, hp:194, speed:207}, {type:'enemy3', count:1, hp:260, speed:228} ],
      [ {type:'enemy1', count:2, hp:158, speed:192}, {type:'enemy3', count:1, hp:260, speed:228} ],
      [ {type:'enemy2', count:2, hp:194, speed:207} ],
      [ {type:'enemy1', count:2, hp:158, speed:192}, {type:'enemy2', count:1, hp:194, speed:207} ],
      [ {type:'enemy3', count:1, hp:260, speed:228} ],
    ]},

    // Wave 4 — 20 total
    { paths: [
      [ {type:'enemy2', count:2, hp:198, speed:210}, {type:'enemy3', count:2, hp:265, speed:230} ],
      [ {type:'enemy1', count:2, hp:160, speed:194}, {type:'enemy3', count:2, hp:265, speed:230} ],
      [ {type:'enemy3', count:2, hp:265, speed:230}, {type:'enemy2', count:2, hp:198, speed:210} ],
      [ {type:'enemy2', count:3, hp:198, speed:210}, {type:'enemy3', count:1, hp:265, speed:230} ],
      [ {type:'enemy1', count:2, hp:160, speed:194}, {type:'enemy2', count:1, hp:198, speed:210} ],
      [ {type:'enemy3', count:2, hp:265, speed:230} ],
    ]},

    // Wave 5 — 25 total
    { paths: [
      [ {type:'enemy2', count:2, hp:202, speed:212}, {type:'enemy3', count:2, hp:270, speed:232}, {type:'enemy4', count:1, hp:360, speed:215} ],
      [ {type:'enemy3', count:3, hp:270, speed:232}, {type:'enemy4', count:1, hp:360, speed:215} ],
      [ {type:'enemy2', count:2, hp:202, speed:212}, {type:'enemy4', count:2, hp:360, speed:215} ],
      [ {type:'enemy3', count:2, hp:270, speed:232}, {type:'enemy4', count:2, hp:360, speed:215} ],
      [ {type:'enemy2', count:3, hp:202, speed:212}, {type:'enemy3', count:2, hp:270, speed:232} ],
      [ {type:'enemy4', count:2, hp:360, speed:215}, {type:'enemy3', count:1, hp:270, speed:232} ],
    ]},

    // Wave 6 — 30 total
    { paths: [
      [ {type:'enemy3', count:2, hp:278, speed:234}, {type:'enemy4', count:2, hp:370, speed:217}, {type:'enemy5', count:1, hp:450, speed:200} ],
      [ {type:'enemy4', count:3, hp:370, speed:217}, {type:'enemy5', count:2, hp:450, speed:200} ],
      [ {type:'enemy3', count:2, hp:278, speed:234}, {type:'enemy5', count:2, hp:450, speed:200}, {type:'enemy4', count:1, hp:370, speed:217} ],
      [ {type:'enemy4', count:2, hp:370, speed:217}, {type:'enemy3', count:3, hp:278, speed:234} ],
      [ {type:'enemy5', count:2, hp:450, speed:200}, {type:'enemy4', count:2, hp:370, speed:217}, {type:'enemy3', count:1, hp:278, speed:234} ],
      [ {type:'enemy3', count:3, hp:278, speed:234}, {type:'enemy5', count:2, hp:450, speed:200} ],
    ]},

    // Wave 7 — 35 total
    { paths: [
      [ {type:'enemy4', count:3, hp:380, speed:220}, {type:'enemy5', count:2, hp:460, speed:202}, {type:'enemy6', count:1, hp:550, speed:188} ],
      [ {type:'enemy5', count:3, hp:460, speed:202}, {type:'enemy6', count:2, hp:550, speed:188} ],
      [ {type:'enemy4', count:2, hp:380, speed:220}, {type:'enemy6', count:2, hp:550, speed:188}, {type:'enemy5', count:2, hp:460, speed:202} ],
      [ {type:'enemy3', count:3, hp:285, speed:236}, {type:'enemy5', count:2, hp:460, speed:202}, {type:'enemy6', count:1, hp:550, speed:188} ],
      [ {type:'enemy4', count:3, hp:380, speed:220}, {type:'enemy5', count:2, hp:460, speed:202}, {type:'enemy6', count:1, hp:550, speed:188} ],
      [ {type:'enemy5', count:2, hp:460, speed:202}, {type:'enemy6', count:2, hp:550, speed:188}, {type:'enemy4', count:1, hp:380, speed:220} ],
    ]},

    // Wave 8 — 40 total
    { paths: [
      [ {type:'enemy4', count:3, hp:392, speed:222}, {type:'enemy5', count:3, hp:472, speed:204}, {type:'enemy6', count:2, hp:565, speed:190} ],
      [ {type:'enemy5', count:4, hp:472, speed:204}, {type:'enemy6', count:3, hp:565, speed:190} ],
      [ {type:'enemy4', count:3, hp:392, speed:222}, {type:'enemy6', count:3, hp:565, speed:190}, {type:'enemy5', count:1, hp:472, speed:204} ],
      [ {type:'enemy3', count:3, hp:292, speed:238}, {type:'enemy5', count:3, hp:472, speed:204}, {type:'enemy6', count:2, hp:565, speed:190} ],
      [ {type:'enemy4', count:3, hp:392, speed:222}, {type:'enemy5', count:2, hp:472, speed:204}, {type:'enemy6', count:3, hp:565, speed:190} ],
      [ {type:'enemy5', count:3, hp:472, speed:204}, {type:'enemy6', count:3, hp:565, speed:190}, {type:'enemy4', count:1, hp:392, speed:222} ],
    ]},

    // Wave 9 — 45 total — BOSS
    { paths: [
      [ {type:'enemy1', count:2, hp:170, speed:198}, {type:'enemy3', count:3, hp:298, speed:240}, {type:'enemy5', count:2, hp:480, speed:206}, {type:'enemy6', count:2, hp:575, speed:192} ],
      [ {type:'enemy2', count:3, hp:210, speed:215}, {type:'enemy4', count:2, hp:398, speed:224}, {type:'enemy6', count:3, hp:575, speed:192} ],
      [ {type:'enemy3', count:2, hp:298, speed:240}, {type:'enemy5', count:3, hp:480, speed:206}, {type:'enemy6', count:3, hp:575, speed:192} ],
      [ {type:'enemy1', count:2, hp:170, speed:198}, {type:'enemy4', count:3, hp:398, speed:224}, {type:'enemy5', count:2, hp:480, speed:206}, {type:'enemy6', count:1, hp:575, speed:192} ],
      [ {type:'enemy2', count:2, hp:210, speed:215}, {type:'enemy3', count:2, hp:298, speed:240}, {type:'enemy4', count:2, hp:398, speed:224}, {type:'enemy6', count:3, hp:575, speed:192} ],
      [ {type:'enemy1', count:2, hp:170, speed:198}, {type:'enemy2', count:2, hp:210, speed:215}, {type:'enemy5', count:3, hp:480, speed:206}, {type:'enemy6', count:2, hp:575, speed:192} ],
    ]},

  ];

  // Active wave defs — set by init()
  var WAVE_DEFS    = WAVE_DEFS_L1;
  var _bossType    = 'boss1';
  var _bossHp      = 3000;
  var _bossSpeed   = 80;

  var PATH_GAP       = 5.0;
  var SPAWN_INTERVAL = 2.0;
  var BETWEEN_WAVES  = 10;

  var waveIndex    = -1;
  var phase        = 'idle';
  var waveTimer    = 0;
  var spawnQueue   = [];
  var waveElapsed  = 0;
  var onSpawn      = null;
  var onWaveStart  = null;
  var onWaveEnd    = null;
  var onAllDone    = null;
  var onBoss       = null;
  var _bossSpawned = false;

  function _buildQueue(def) {
    var q        = [];
    var numPaths = def.paths.length;
    for (var p = 0; p < numPaths; p++) {
      var groups = def.paths[p];
      if (!groups || groups.length === 0) continue;
      var pathStart = p * PATH_GAP;
      var t         = pathStart;
      for (var g = 0; g < groups.length; g++) {
        var grp = groups[g];
        for (var i = 0; i < grp.count; i++) {
          q.push({ time: t, path: p + 1, type: grp.type, hp: grp.hp, speed: grp.speed });
          t += SPAWN_INTERVAL;
        }
        t += SPAWN_INTERVAL * 0.5;
      }
    }
    q.sort(function(a, b) { return a.time - b.time; });
    return q;
  }

  // Call before start() to pick the level
  function init(levelNum) {
    if      (levelNum === 2) { WAVE_DEFS = WAVE_DEFS_L2; _bossType = 'boss2'; _bossHp = 6000;  _bossSpeed = 75; }
    else if (levelNum === 3) { WAVE_DEFS = WAVE_DEFS_L3; _bossType = 'boss3'; _bossHp = 10000; _bossSpeed = 70; }
    else                     { WAVE_DEFS = WAVE_DEFS_L1; _bossType = 'boss1'; _bossHp = 3000;  _bossSpeed = 80; }
  }

  function start(callbacks) {
    onSpawn      = callbacks.onSpawn     || null;
    onWaveStart  = callbacks.onWaveStart || null;
    onWaveEnd    = callbacks.onWaveEnd   || null;
    onAllDone    = callbacks.onAllDone   || null;
    onBoss       = callbacks.onBoss      || null;
    waveIndex    = -1;
    phase        = 'countdown';
    waveTimer    = 3;
    _bossSpawned = false;
  }

  function _nextWave() {
    waveIndex++;
    if (waveIndex >= WAVE_DEFS.length) {
      phase = 'done';
      if (onAllDone) onAllDone();
      return;
    }
    spawnQueue  = _buildQueue(WAVE_DEFS[waveIndex]);
    waveElapsed = 0;
    phase       = 'spawning';
    if (onWaveStart) onWaveStart(waveIndex + 1);
  }

  function update(dt, enemies) {
    if (phase === 'idle' || phase === 'done') return;

    if (phase === 'countdown') {
      waveTimer -= dt;
      if (waveTimer <= 0) _nextWave();
      return;
    }

    if (phase === 'spawning') {
      waveElapsed += dt;
      while (spawnQueue.length > 0 && waveElapsed >= spawnQueue[0].time) {
        var e = spawnQueue.shift();
        if (onSpawn) onSpawn(e.path, e.type, e.hp, e.speed);
      }
      if (spawnQueue.length === 0) phase = 'waiting';
      return;
    }

    if (phase === 'waiting') {
      var alive = 0;
      for (var i = 0; i < enemies.length; i++) {
        if (enemies[i].alive || enemies[i].dying || enemies[i].smoking) alive++;
      }

      // Spawn boss on last wave when <=4 enemies remain
      var isLastWave = waveIndex === WAVE_DEFS.length - 1;
      if (isLastWave && !_bossSpawned && alive <= 4 && alive > 0) {
        _bossSpawned = true;
        if (onBoss)  onBoss();
        if (onSpawn) onSpawn(1, _bossType, _bossHp, _bossSpeed);
      }

      if (alive === 0) {
        if (waveIndex + 1 >= WAVE_DEFS.length) {
          phase = 'done';
          if (onAllDone) onAllDone();
        } else {
          if (onWaveEnd) onWaveEnd(waveIndex + 1);
          phase     = 'countdown';
          waveTimer = BETWEEN_WAVES;
        }
      }
    }
  }

  function getWaveNum()    { return waveIndex + 1; }
  function getTotalWaves() { return WAVE_DEFS.length; }
  function getPhase()      { return phase; }
  function getCountdown()  { return Math.ceil(waveTimer); }
  function isSpawning()    { return phase === 'spawning'; }
  function isDone()        { return phase === 'done'; }

  return { init, start, update, getWaveNum, getTotalWaves, getPhase, getCountdown, isSpawning, isDone };

})();