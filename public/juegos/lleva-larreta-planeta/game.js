/**
 * Lleva a Larreta a su planeta — minijuego arcade (canvas + vanilla JS).
 *
 * Sprite principal: intenta cargar assets/larreta.png (reemplazá ese archivo con tu PNG).
 * Pantalla de inicio: assets/inicio.png (arte de bienvenida / controles).
 * Proyectiles: imagen assets/balfoza.jpg (baldoza). Si falla la carga, dibujo procedural.
 */

;(function () {
  'use strict'

  // --- Constantes de diseño ---
  var CANVAS_W = 480
  var CANVAS_H = 640
  var TARGET_SCORE = 2000
  var START_LIVES = 3
  var POINTS_UFO = 100
  var POINTS_ASTEROID = 50
  var INVULN_MS = 1000
  var PLAYER_SPEED = 240
  var BULLET_SPEED = 480
  /** Ancho visual del jugador (el alto se escala según aspect ratio del PNG). */
  var PLAYER_DRAW_W = 52

  // --- DOM ---
  var canvas = document.getElementById('game-canvas')
  var ctx = canvas.getContext('2d')
  var startScreen = document.getElementById('start-screen')
  var gamePanel = document.getElementById('game-panel')
  var hud = document.getElementById('hud')
  var hudScore = document.getElementById('hud-score')
  var hudLives = document.getElementById('hud-lives')
  var hudGoal = document.getElementById('hud-goal')
  var hudBaldosas = document.getElementById('hud-baldosas')

  // --- Estado global del juego ---
  var gameState = 'start' // 'start' | 'playing' | 'gameover' | 'victory'
  var loopStarted = false
  var lastTs = 0
  var score = 0
  var lives = START_LIVES
  /** Total de baldozas disparadas en la partida actual. */
  var baldozasLanzadas = 0
  var keys = Object.create(null)
  var invulnT = 0
  var spawnAcc = 0
  var shakeT = 0
  var difficultyT = 0

  /** @type {HTMLImageElement|null} */
  var larretaImg = null
  var larretaLoaded = false

  /** @type {HTMLImageElement|null} */
  var baldosaImg = null
  var baldosaLoaded = false

  /** @type {Bullet[]} */
  var bullets = []
  /** @type {Enemy[]} */
  var enemies = []
  /** @type {Particle[]} */
  var particles = []
  /** @type {Star[]} */
  var stars = []

  // Victoria: fases de cutscene
  var victoryTime = 0
  var planet = { cx: CANVAS_W / 2, cy: 110, r: 0, targetR: 95 }

  // --- Web Audio (opcional, se habilita con primer input) ---
  var audioCtx = null
  var audioReady = false

  function ensureAudio() {
    if (audioReady) return
    try {
      var AC = window.AudioContext || window.webkitAudioContext
      if (!AC) return
      audioCtx = new AC()
      audioReady = true
    } catch (e) {
      /* silencio */
    }
  }

  function beep(freq, dur, type, vol) {
    if (!audioCtx) return
    vol = vol == null ? 0.08 : vol
    var t0 = audioCtx.currentTime
    var osc = audioCtx.createOscillator()
    var g = audioCtx.createGain()
    osc.type = type || 'square'
    osc.frequency.setValueAtTime(freq, t0)
    g.gain.setValueAtTime(vol, t0)
    g.gain.exponentialRampToValueAtTime(0.001, t0 + dur)
    osc.connect(g)
    g.connect(audioCtx.destination)
    osc.start(t0)
    osc.stop(t0 + dur + 0.02)
  }

  function noiseBurst(dur, vol) {
    if (!audioCtx) return
    var t0 = audioCtx.currentTime
    var len = Math.floor(audioCtx.sampleRate * dur)
    var buf = audioCtx.createBuffer(1, len, audioCtx.sampleRate)
    var data = buf.getChannelData(0)
    for (var i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * 0.6
    var src = audioCtx.createBufferSource()
    src.buffer = buf
    var g = audioCtx.createGain()
    g.gain.setValueAtTime(vol || 0.12, t0)
    g.gain.exponentialRampToValueAtTime(0.001, t0 + dur)
    src.connect(g)
    g.connect(audioCtx.destination)
    src.start(t0)
  }

  function sfxShoot() {
    beep(380, 0.035, 'square', 0.055)
    beep(220, 0.04, 'triangle', 0.04)
  }
  function sfxExplode() {
    noiseBurst(0.12, 0.1)
    beep(120, 0.08, 'sawtooth', 0.05)
  }
  function sfxHit() {
    beep(90, 0.15, 'triangle', 0.12)
    beep(55, 0.2, 'sawtooth', 0.08)
  }
  function sfxWin() {
    beep(440, 0.12, 'square', 0.07)
    beep(554, 0.12, 'square', 0.07)
    beep(659, 0.2, 'square', 0.08)
  }

  // --- Tipos (JSDoc para claridad en editores) ---
  /**
   * @typedef {{ x:number, y:number, w:number, h:number, vy:number, rot:number, rotSp:number, hue:number }} Bullet
   * @typedef {{ type:'ufo'|'asteroid', x:number, y:number, w:number, h:number, vy:number, vx:number, rot:number, rotSp:number, hue:number, zigPhase:number, zigAmp:number }} Enemy
   * @typedef {{ x:number, y:number, vx:number, vy:number, life:number, col:string, sz:number }} Particle
   * @typedef {{ x:number, y:number, sp:number, sz:number, tw:number }} Star
   */

  var player = {
    x: CANVAS_W / 2,
    y: CANVAS_H - 90,
    /** mitad del ancho del hitbox circular */
    hitR: 18,
    drawW: PLAYER_DRAW_W,
    drawH: PLAYER_DRAW_W,
  }

  function difficultyFactor() {
    return 1.45 + Math.min(2.5, score / 380)
  }

  function spawnInterval() {
    var base = 0.68
    var d = difficultyFactor()
    return Math.max(0.2, base / d)
  }

  function enemySpeedMul() {
    return 1.1 + Math.min(1.75, score / 400) * 0.62
  }

  function asteroidChance() {
    return Math.min(0.7, 0.42 + score / 2400)
  }

  function initStars() {
    stars.length = 0
    var i
    for (i = 0; i < 70; i++) {
      stars.push({
        x: Math.random() * CANVAS_W,
        y: Math.random() * CANVAS_H,
        sp: 20 + Math.random() * 100,
        sz: Math.random() < 0.08 ? 2.2 : 1,
        tw: Math.random() * Math.PI * 2,
      })
    }
    for (i = 0; i < 35; i++) {
      stars.push({
        x: Math.random() * CANVAS_W,
        y: Math.random() * CANVAS_H,
        sp: 110 + Math.random() * 180,
        sz: 1.2 + Math.random(),
        tw: Math.random() * Math.PI * 2,
      })
    }
  }

  function resetGame() {
    score = 0
    lives = START_LIVES
    baldozasLanzadas = 0
    bullets.length = 0
    enemies.length = 0
    particles.length = 0
    invulnT = 0
    spawnAcc = 0
    shakeT = 0
    difficultyT = 0
    victoryTime = 0
    planet.r = 0
    player.x = CANVAS_W / 2
    player.y = CANVAS_H - 90
    initStars()
    updateHud()
  }

  function updateHud() {
    if (!hudScore) return
    hudScore.textContent = 'Puntos: ' + score + ' / ' + TARGET_SCORE
    hudLives.textContent = 'Vidas: ' + lives
    hudGoal.textContent = 'Objetivo: ' + TARGET_SCORE + ' pts'
    if (hudBaldosas) {
      hudBaldosas.textContent = 'Cantidad de baldozas lanzadas: ' + baldozasLanzadas
    }
  }

  function tryLoadLarreta() {
    var img = new Image()
    img.onload = function () {
      larretaImg = img
      larretaLoaded = true
      var ar = img.naturalHeight / img.naturalWidth
      player.drawW = PLAYER_DRAW_W
      player.drawH = Math.max(40, Math.min(72, PLAYER_DRAW_W * ar))
    }
    img.onerror = function () {
      larretaImg = null
      larretaLoaded = false
      player.drawW = PLAYER_DRAW_W
      player.drawH = PLAYER_DRAW_W
    }
    // Reemplazá assets/larreta.png con tu sprite (misma ruta).
    img.src = 'assets/larreta.png'
  }

  function tryLoadBaldosa() {
    var img = new Image()
    img.onload = function () {
      baldosaImg = img
      baldosaLoaded = true
    }
    img.onerror = function () {
      baldosaImg = null
      baldosaLoaded = false
    }
    img.src = 'assets/balfoza.jpg'
  }

  function spawnEnemy() {
    var roll = Math.random()
    var astRoll = asteroidChance()
    var type = roll < astRoll ? 'asteroid' : 'ufo'
    var w, h, vy, vx, rotSp, zigPhase, zigAmp, hue

    if (type === 'ufo') {
      w = 38 + Math.random() * 8
      h = 26 + Math.random() * 6
      vy = (68 + Math.random() * 62) * enemySpeedMul()
      vx = 0
      zigPhase = Math.random() * Math.PI * 2
      zigAmp = Math.random() < 0.58 ? 40 + Math.random() * 36 : 0
      hue = Math.random() < 0.5 ? 145 : 270
      rotSp = 0
    } else {
      w = 30 + Math.random() * 26
      h = w * (0.85 + Math.random() * 0.25)
      vy = (52 + Math.random() * 78) * enemySpeedMul()
      vx = (Math.random() - 0.5) * 42
      rotSp = (Math.random() - 0.5) * 4.5
      zigPhase = 0
      zigAmp = 0
      hue = 30
    }

    enemies.push({
      type: type,
      x: 20 + Math.random() * (CANVAS_W - 40 - w),
      y: -h - 4,
      w: w,
      h: h,
      vy: vy,
      vx: vx,
      rot: Math.random() * Math.PI * 2,
      rotSp: rotSp,
      hue: hue,
      zigPhase: zigPhase,
      zigAmp: zigAmp,
    })
  }

  function addExplosion(x, y, col, n) {
    n = n || 10
    var i
    for (i = 0; i < n; i++) {
      var ang = Math.random() * Math.PI * 2
      var sp = 40 + Math.random() * 160
      particles.push({
        x: x,
        y: y,
        vx: Math.cos(ang) * sp,
        vy: Math.sin(ang) * sp,
        life: 0.35 + Math.random() * 0.35,
        col: col || '#ff5555',
        sz: 2 + Math.random() * 3,
      })
    }
  }

  function shoot() {
    if (gameState !== 'playing') return
    var bw = 22
    var bh = 18
    bullets.push({
      x: player.x - bw / 2,
      y: player.y - player.drawH / 2 - bh - 2,
      w: bw,
      h: bh,
      vy: -BULLET_SPEED,
      rot: (Math.random() - 0.5) * 0.45,
      rotSp: (Math.random() - 0.5) * 6,
      hue: 8 + Math.random() * 28,
    })
    baldozasLanzadas++
    updateHud()
    sfxShoot()
  }

  function circleRectOverlap(cx, cy, r, rx, ry, rw, rh) {
    var nx = Math.max(rx, Math.min(cx, rx + rw))
    var ny = Math.max(ry, Math.min(cy, ry + rh))
    var dx = cx - nx
    var dy = cy - ny
    return dx * dx + dy * dy <= r * r
  }

  /** Hitbox enemigo un poco más chica que el dibujo (más justo). */
  function enemyHitInset(e) {
    return e.type === 'asteroid' ? 0.12 : 0.1
  }

  function enemyCenter(e) {
    return { x: e.x + e.w / 2, y: e.y + e.h / 2 }
  }

  function bulletHitsEnemy(b, e) {
    var inset = enemyHitInset(e)
    var ew = e.w * (1 - inset * 2)
    var eh = e.h * (1 - inset * 2)
    var ex = e.x + e.w * inset
    var ey = e.y + e.h * inset
    var cx = b.x + b.w / 2
    var cy = b.y + b.h / 2
    return cx >= ex && cx <= ex + ew && cy >= ey && cy <= ey + eh
  }

  function playerHitEnemy(e) {
    var inset = enemyHitInset(e)
    var ew = e.w * (1 - inset * 2)
    var eh = e.h * (1 - inset * 2)
    var ex = e.x + e.w * inset
    var ey = e.y + e.h * inset
    var pcx = player.x
    var pcy = player.y
    var pr = player.hitR
    return circleRectOverlap(pcx, pcy, pr, ex, ey, ew, eh)
  }

  function damagePlayer() {
    if (invulnT > 0) return
    lives -= 1
    invulnT = INVULN_MS / 1000
    shakeT = 0.35
    sfxHit()
    if (lives <= 0) {
      gameState = 'gameover'
    }
    updateHud()
  }

  function updatePlaying(dt) {
    difficultyT += dt
    invulnT = Math.max(0, invulnT - dt)
    shakeT = Math.max(0, shakeT - dt)

    var sp = PLAYER_SPEED * dt
    if (keys.ArrowUp) player.y -= sp
    if (keys.ArrowDown) player.y += sp
    if (keys.ArrowLeft) player.x -= sp
    if (keys.ArrowRight) player.x += sp

    var halfW = player.drawW / 2 + 4
    var halfH = player.drawH / 2 + 4
    player.x = Math.max(halfW, Math.min(CANVAS_W - halfW, player.x))
    player.y = Math.max(halfH + 10, Math.min(CANVAS_H - halfH - 6, player.y))

    // Estrellas (parallax)
    var si, st
    for (si = 0; si < stars.length; si++) {
      st = stars[si]
      st.y += st.sp * dt
      st.tw += dt * 2
      if (st.y > CANVAS_H + 4) {
        st.y = -4
        st.x = Math.random() * CANVAS_W
      }
    }

    // Baldosas
    var bi
    for (bi = bullets.length - 1; bi >= 0; bi--) {
      var b = bullets[bi]
      b.y += b.vy * dt
      b.rot += b.rotSp * dt
      if (b.y + b.h < -20) bullets.splice(bi, 1)
    }

    // Spawn enemigos
    spawnAcc += dt
    var interval = spawnInterval()
    var spawnsThisFrame = 0
    while (spawnAcc >= interval && spawnsThisFrame < 4) {
      spawnAcc -= interval
      spawnsThisFrame++
      spawnEnemy()
      if (difficultyFactor() > 1.22 && spawnsThisFrame < 4) {
        spawnEnemy()
        spawnsThisFrame++
      }
    }

    // Enemigos
    var ei, ej, bj
    for (ei = enemies.length - 1; ei >= 0; ei--) {
      var e = enemies[ei]
      e.y += e.vy * dt
      e.x += (e.vx + Math.sin(difficultyT * 2.2 + e.zigPhase) * e.zigAmp) * dt
      e.rot += e.rotSp * dt
      if (e.x < -60) e.x = CANVAS_W + 20
      if (e.x > CANVAS_W + 60) e.x = -20

      if (e.y > CANVAS_H + 40) {
        enemies.splice(ei, 1)
        continue
      }

      if (invulnT <= 0 && playerHitEnemy(e)) {
        var ec = enemyCenter(e)
        addExplosion(ec.x, ec.y, '#ffaa00', 14)
        enemies.splice(ei, 1)
        damagePlayer()
        continue
      }

      var destroyedByShot = false
      for (bj = bullets.length - 1; bj >= 0; bj--) {
        var bb = bullets[bj]
        if (bulletHitsEnemy(bb, e)) {
          bullets.splice(bj, 1)
          var pts = e.type === 'ufo' ? POINTS_UFO : POINTS_ASTEROID
          score += pts
          var c = e.type === 'ufo' ? '#66ff99' : '#ccaa88'
          var ecx = enemyCenter(e).x
          var ecy = enemyCenter(e).y
          addExplosion(ecx, ecy, c, 16)
          addExplosion(ecx, ecy, '#cfa07a', 9)
          addExplosion(ecx, ecy, '#dde0e8', 5)
          enemies.splice(ei, 1)
          sfxExplode()
          updateHud()
          destroyedByShot = true
          if (score >= TARGET_SCORE) {
            gameState = 'victory'
            victoryTime = 0
            planet.r = 0
            bullets.length = 0
            enemies.length = 0
            sfxWin()
            return
          }
          break
        }
      }
      if (destroyedByShot) continue
    }

    // Partículas
    for (ej = particles.length - 1; ej >= 0; ej--) {
      var p = particles[ej]
      p.life -= dt
      p.x += p.vx * dt
      p.y += p.vy * dt
      p.vy += 20 * dt
      if (p.life <= 0) particles.splice(ej, 1)
    }
  }

  function updateVictory(dt) {
    victoryTime += dt
    var si, st
    for (si = 0; si < stars.length; si++) {
      st = stars[si]
      st.y += st.sp * 0.35 * dt
      if (st.y > CANVAS_H + 4) {
        st.y = -4
        st.x = Math.random() * CANVAS_W
      }
    }

    if (victoryTime < 2.2) {
      planet.r += dt * 55
      if (planet.r > planet.targetR) planet.r = planet.targetR
    } else if (victoryTime < 4.4) {
      var tcx = planet.cx
      var tcy = planet.cy + planet.r * 0.35
      player.x += (tcx - player.x) * Math.min(1, dt * 2.4)
      player.y += (tcy - player.y) * Math.min(1, dt * 2.4)
    }

    var pj
    for (pj = particles.length - 1; pj >= 0; pj--) {
      var p2 = particles[pj]
      p2.life -= dt
      p2.x += p2.vx * dt
      p2.y += p2.vy * dt
      if (p2.life <= 0) particles.splice(pj, 1)
    }
  }

  function updateParticlesGeneric(dt) {
    var pj
    for (pj = particles.length - 1; pj >= 0; pj--) {
      var p3 = particles[pj]
      p3.life -= dt
      p3.x += p3.vx * dt
      p3.y += p3.vy * dt
      p3.vy += 15 * dt
      if (p3.life <= 0) particles.splice(pj, 1)
    }
  }

  function drawStars() {
    var i, s, alpha
    for (i = 0; i < stars.length; i++) {
      s = stars[i]
      alpha = 0.35 + Math.sin(s.tw) * 0.25
      if (s.sp > 100) alpha = Math.min(1, alpha + 0.25)
      ctx.fillStyle = 'rgba(255,255,255,' + alpha + ')'
      ctx.fillRect(Math.floor(s.x), Math.floor(s.y), s.sz, s.sz)
    }
  }

  function drawPlayer() {
    var blink = invulnT > 0 && Math.floor(invulnT * 12) % 2 === 0
    if (blink) return

    var px = player.x - player.drawW / 2
    var py = player.y - player.drawH / 2

    ctx.save()
    ctx.strokeStyle = 'rgba(120, 200, 255, 0.45)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(player.x, player.y, player.drawW / 2 + 6, 0, Math.PI * 2)
    ctx.stroke()

    if (larretaLoaded && larretaImg) {
      ctx.imageSmoothingEnabled = false
      ctx.drawImage(larretaImg, px, py, player.drawW, player.drawH)
      ctx.imageSmoothingEnabled = true
    } else {
      // Placeholder si no hay assets/larreta.png
      ctx.fillStyle = '#3355aa'
      ctx.beginPath()
      ctx.arc(player.x, player.y - 4, player.drawW / 2 - 2, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#ffcc99'
      ctx.beginPath()
      ctx.arc(player.x - 8, player.y - 8, 5, 0, Math.PI * 2)
      ctx.arc(player.x + 8, player.y - 8, 5, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#222'
      ctx.fillRect(player.x - 10, player.y - 2, 6, 4)
      ctx.fillRect(player.x + 4, player.y - 2, 6, 4)
      ctx.fillStyle = '#884422'
      ctx.beginPath()
      ctx.arc(player.x, player.y + 10, 10, 0.1, Math.PI - 0.1)
      ctx.fill()
    }
    ctx.restore()
  }

  function drawUfo(e) {
    ctx.save()
    ctx.translate(e.x + e.w / 2, e.y + e.h / 2)
    var g = ctx.createRadialGradient(0, 0, 2, 0, 0, e.w)
    if (e.hue < 200) {
      g.addColorStop(0, '#ccffcc')
      g.addColorStop(1, '#228822')
    } else {
      g.addColorStop(0, '#eeccff')
      g.addColorStop(1, '#6622aa')
    }
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.ellipse(0, 0, e.w / 2, e.h / 2, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = 'rgba(0,0,0,0.35)'
    ctx.beginPath()
    ctx.ellipse(0, -e.h * 0.08, e.w * 0.35, e.h * 0.22, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = '#004422'
    ctx.lineWidth = 2
    ctx.stroke()
    ctx.restore()
  }

  function drawAsteroid(e) {
    ctx.save()
    ctx.translate(e.x + e.w / 2, e.y + e.h / 2)
    ctx.rotate(e.rot)
    ctx.fillStyle = '#6a5a4a'
    ctx.strokeStyle = '#3a3028'
    ctx.lineWidth = 2
    ctx.beginPath()
    var pts = 9
    var k
    for (k = 0; k < pts; k++) {
      var ang = (k / pts) * Math.PI * 2
      var rad = e.w * 0.45 * (0.75 + (Math.sin(k * 2.1 + e.hue) * 0.5 + 0.5) * 0.35)
      var ax = Math.cos(ang) * rad
      var ay = Math.sin(ang) * rad * 0.85
      if (k === 0) ctx.moveTo(ax, ay)
      else ctx.lineTo(ax, ay)
    }
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
    ctx.restore()
  }

  function drawEnemies() {
    var i, e
    for (i = 0; i < enemies.length; i++) {
      e = enemies[i]
      if (e.type === 'ufo') drawUfo(e)
      else drawAsteroid(e)
    }
  }

  function drawBaldosas() {
    var i, b, cx, cy, hue
    for (i = 0; i < bullets.length; i++) {
      b = bullets[i]
      cx = b.x + b.w / 2
      cy = b.y + b.h / 2
      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate(b.rot)
      if (baldosaLoaded && baldosaImg) {
        ctx.imageSmoothingEnabled = false
        ctx.drawImage(baldosaImg, -b.w / 2, -b.h / 2, b.w, b.h)
        ctx.imageSmoothingEnabled = true
      } else {
        hue = typeof b.hue === 'number' ? b.hue : 18
        ctx.fillStyle = 'hsl(' + hue + ',52%,50%)'
        ctx.fillRect(-b.w / 2, -b.h / 2, b.w, b.h)
        ctx.fillStyle = 'hsl(' + hue + ',45%,38%)'
        ctx.fillRect(-b.w / 2, -b.h / 2 + b.h * 0.55, b.w, b.h * 0.45)
        ctx.strokeStyle = 'rgba(55,55,70,0.5)'
        ctx.lineWidth = 2
        ctx.strokeRect(-b.w / 2 + 1, -b.h / 2 + 1, b.w - 2, b.h - 2)
        ctx.strokeStyle = '#aab4c4'
        ctx.lineWidth = 1.5
        ctx.strokeRect(-b.w / 2, -b.h / 2, b.w, b.h)
        ctx.fillStyle = 'rgba(255,255,255,0.14)'
        ctx.fillRect(-b.w / 2 + 3, -b.h / 2 + 2, b.w * 0.42, b.h * 0.32)
        ctx.strokeStyle = 'rgba(0,0,0,0.25)'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(0, -b.h / 2)
        ctx.lineTo(0, b.h / 2)
        ctx.stroke()
      }
      ctx.restore()
    }
  }

  function drawParticles() {
    var i, p
    for (i = 0; i < particles.length; i++) {
      p = particles[i]
      ctx.globalAlpha = Math.max(0, Math.min(1, p.life * 3))
      ctx.fillStyle = p.col
      ctx.fillRect(p.x - p.sz / 2, p.y - p.sz / 2, p.sz, p.sz)
    }
    ctx.globalAlpha = 1
  }

  function drawPlanet() {
    if (planet.r <= 0) return
    var grd = ctx.createRadialGradient(planet.cx, planet.cy, 4, planet.cx, planet.cy, planet.r)
    grd.addColorStop(0, '#8fd8ff')
    grd.addColorStop(0.35, '#3a8c55')
    grd.addColorStop(0.7, '#2a5a40')
    grd.addColorStop(1, '#1a3040')
    ctx.fillStyle = grd
    ctx.beginPath()
    ctx.arc(planet.cx, planet.cy, planet.r, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = 'rgba(255,255,255,0.25)'
    ctx.lineWidth = 3
    ctx.stroke()
  }

  function drawVictoryOverlay() {
    if (victoryTime < 4.4) return
    ctx.fillStyle = 'rgba(0,8,20,0.82)'
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)
    ctx.fillStyle = '#7cfc9a'
    ctx.font = 'bold 22px ui-monospace, Consolas, monospace'
    ctx.textAlign = 'center'
    ctx.fillText('¡FELICIDADES!', CANVAS_W / 2, CANVAS_H / 2 - 36)
    ctx.fillText('DEJASTE AL ALIEN EN SU PLANETA', CANVAS_W / 2, CANVAS_H / 2 - 6)
    ctx.fillStyle = '#ffeb3b'
    ctx.font = '14px ui-monospace, Consolas, monospace'
    ctx.fillText('Presioná ENTER para jugar de nuevo', CANVAS_W / 2, CANVAS_H / 2 + 44)
    ctx.textAlign = 'left'
  }

  function drawGameOverOverlay() {
    ctx.fillStyle = 'rgba(0,0,0,0.78)'
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)
    ctx.fillStyle = '#ff5555'
    ctx.font = 'bold 34px ui-monospace, Consolas, monospace'
    ctx.textAlign = 'center'
    ctx.fillText('GAME OVER', CANVAS_W / 2, CANVAS_H / 2 - 52)
    ctx.fillStyle = '#dde8ff'
    ctx.font = '15px ui-monospace, Consolas, monospace'
    ctx.fillText('Larreta no llegó a su planeta', CANVAS_W / 2, CANVAS_H / 2 - 12)
    ctx.fillText('Puntaje final: ' + score, CANVAS_W / 2, CANVAS_H / 2 + 18)
    ctx.fillStyle = '#ffeb3b'
    ctx.font = '14px ui-monospace, Consolas, monospace'
    ctx.fillText('Presioná ENTER para intentar de nuevo', CANVAS_W / 2, CANVAS_H / 2 + 54)
    ctx.textAlign = 'left'
  }

  function render() {
    ctx.save()
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    if (shakeT > 0) {
      var mag = shakeT * 6
      ctx.translate((Math.random() - 0.5) * mag, (Math.random() - 0.5) * mag)
    }
    ctx.fillStyle = '#030510'
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)
    drawStars()

    if (gameState === 'victory') {
      drawPlanet()
      if (victoryTime < 3.95) drawPlayer()
      drawParticles()
      drawVictoryOverlay()
    } else if (gameState === 'gameover') {
      drawStars()
      drawParticles()
      drawGameOverOverlay()
    } else if (gameState === 'playing') {
      drawEnemies()
      drawBaldosas()
      drawParticles()
      drawPlayer()
    }

    ctx.restore()
  }

  function frame(ts) {
    if (!lastTs) {
      lastTs = ts
      requestAnimationFrame(frame)
      return
    }
    var dt = Math.min(0.055, (ts - lastTs) / 1000)
    lastTs = ts

    if (gameState === 'playing') updatePlaying(dt)
    else if (gameState === 'victory') updateVictory(dt)
    else if (gameState === 'gameover') updateParticlesGeneric(dt)

    render()
    requestAnimationFrame(frame)
  }

  function startLoop() {
    if (loopStarted) return
    loopStarted = true
    lastTs = 0
    requestAnimationFrame(frame)
  }

  function beginFromStartScreen() {
    ensureAudio()
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume()
    startScreen.classList.add('is-hidden')
    gamePanel.classList.remove('is-hidden')
    hud.classList.remove('is-hidden')
    resetGame()
    gameState = 'playing'
    startLoop()
  }

  function restartFromEnd() {
    ensureAudio()
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume()
    resetGame()
    gameState = 'playing'
    updateHud()
  }

  function onKeyDown(ev) {
    if (ev.code === 'Enter' || ev.key === 'Enter') {
      if (gameState === 'start') {
        ev.preventDefault()
        beginFromStartScreen()
        return
      }
      if (gameState === 'gameover' || gameState === 'victory') {
        ev.preventDefault()
        restartFromEnd()
        return
      }
    }

    if (ev.code === 'Space' || ev.key === ' ') {
      if (gameState === 'playing' || gameState === 'start') ev.preventDefault()
      if (gameState === 'playing' && !ev.repeat) {
        shoot()
      }
    }

    if (
      ev.code === 'ArrowUp' ||
      ev.code === 'ArrowDown' ||
      ev.code === 'ArrowLeft' ||
      ev.code === 'ArrowRight' ||
      ev.code === 'Space'
    ) {
      keys[ev.code] = true
      if (ev.key === ' ') keys[' '] = true
    }
  }

  function onKeyUp(ev) {
    if (
      ev.code === 'ArrowUp' ||
      ev.code === 'ArrowDown' ||
      ev.code === 'ArrowLeft' ||
      ev.code === 'ArrowRight' ||
      ev.code === 'Space'
    ) {
      keys[ev.code] = false
      if (ev.key === ' ') keys[' '] = false
    }
  }

  window.addEventListener('keydown', onKeyDown, { passive: false })
  window.addEventListener('keyup', onKeyUp)

  initStars()
  tryLoadLarreta()
  tryLoadBaldosa()

  // Foco para teclas (algunos navegadores)
  window.focus()
})()
