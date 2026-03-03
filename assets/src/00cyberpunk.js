/*
 * CYBERPUNK THEME - Color Override & Post-Processing
 * Applies neon cyberpunk aesthetic to the entire game
 */

// Cyberpunk color palette
var CYBER = {
  NEON_CYAN:    0x00FFF0,   // Primary accent - guide lines, highlights
  HOT_PINK:     0xFF2D95,   // Secondary accent - power, energy
  ELECTRIC_PURPLE: 0xB026FF, // Tertiary accent
  NEON_GREEN:   0x39FF14,   // Success, loader
  DARK_BG:      0x0A0014,   // Deep dark purple-black  
  MID_BG:       0x0D0221,   // Dark purple
  STAGE_BG:     '#0d0221',  // Stage background string
  TABLE_TINT:   0x2A1050,   // Purple tint for table
  CLOTH_TINT:   0x0B1628,   // Dark blue-teal for cloth
  GOLD_ACCENT:  0xFFD700,   // Replace warm accents
};

// After game loads, apply cyberpunk tints to sprites
var _origPlayCreate = playState.create;
playState.create = function() {
  _origPlayCreate.call(this);
  
  var e = this.gameInfo;
  
  // Cloth and tableTop: no tint, show original images
  if (e.cloth) {
    e.cloth.tint = 0xFFFFFF; // No filter - show original image
  }
  if (e.tableTop) {
    e.tableTop.tint = 0xFFFFFF; // No filter - show original image
  }
  if (e.pockets) {
    e.pockets.tint = 0x150825; // Darker pockets
  }
  
  // Tint the cue with a slight neon hue
  if (e.cue) {
    e.cue.tint = 0xCCDDFF; // Cool blue-white cue
  }
  if (e.cueShadow) {
    e.cueShadow.tint = 0x4400AA; // Purple shadow
  }
  
  // Tint GUI panels with cyberpunk colors
  if (e.guiPanel1) e.guiPanel1.tint = 0x1A0A40;
  if (e.guiPanel2) e.guiPanel2.tint = 0x1A0A40;
  if (e.guiPanel3) e.guiPanel3.tint = 0x1A0A40;
  
  // Tint ball shadows with purple
  for (var i = 0; i < e.ballArray.length; i++) {
    if (e.ballArray[i].shadow) {
      e.ballArray[i].shadow.tint = 0x3300AA;
    }
  }
  
  // Tint turn arrows with neon cyan
  if (e.turnArrow1) e.turnArrow1.tint = 0x00FFF0;
  if (e.turnArrow2) e.turnArrow2.tint = 0xFF2D95;
  
  // Tint icons
  if (e.humanIcon) e.humanIcon.tint = 0x00FFF0;
  if (e.aiIcon) e.aiIcon.tint = 0xFF2D95;
  
  // Game over panel tints
  if (e.gameOverPanelBG) e.gameOverPanelBG.tint = 0x120830;
  if (e.popUpPanelBG) e.popUpPanelBG.tint = 0x120830;
  
  // Spin setter tints
  if (e.spinSetter) e.spinSetter.tint = 0x00FFF0;
  if (e.spinSetterZoom) e.spinSetterZoom.tint = 0x00FFF0;
  
  // Foul display tint
  if (e.foulWindow && e.foulWindow.background) {
    e.foulWindow.background.tint = 0x1A0830;
  }
  
  // Power bar tints
  if (e.powerBarBG) e.powerBarBG.tint = 0x0D0221;
  if (e.powerBarBase) e.powerBarBase.tint = 0xFF2D95;
  if (e.powerBarTop) e.powerBarTop.tint = 0x00FFF0;
  
  // Rack BG tints
  if (e.rackBGSolids) e.rackBGSolids.tint = 0x1A0A40;
  if (e.rackBGStripes) e.rackBGStripes.tint = 0x1A0A40;
  
  // Menu button tint
  if (e.menuButton) e.menuButton.tint = 0x00FFF0;
  
  // Set stage background for gameplay
  game.stage.backgroundColor = CYBER.STAGE_BG;
};

// Override menu create to apply cyberpunk tints there too
var _origMenuCreate = menuState.create;
menuState.create = function() {
  _origMenuCreate.call(this);
  
  var t = this.menuInfo;
  
  // Set cyberpunk stage background
  game.stage.backgroundColor = CYBER.STAGE_BG;
  
  // Title and rack: show original images, no tint
  if (t.title) {
    t.title.tint = 0xFFFFFF;
    // Scale gametitle.png (832x635) to match original title.png (683x295)
    t.title.scale.x = 683 / 832;
    t.title.scale.y = 295 / 635;
  }
  
  // Rack decoration: show original image
  if (t.rack) {
    t.rack.tint = 0xFFFFFF;
    // Scale main.png (2720x1568) to match original rack.png (669x388)
    t.rack.scale.x = 669 / 2720;
    t.rack.scale.y = 388 / 1568;
  }
  
  // Tint buttons with cyberpunk colors
  if (t.playButton) t.playButton.tint = 0x00FFF0;
  if (t.statsButton) t.statsButton.tint = 0xB026FF;
  if (t.helpButton) t.helpButton.tint = 0xB026FF;
  if (t.settingsButton) t.settingsButton.tint = 0xFF2D95;
  // PvP button hidden (logic kept)
  if (t.pVpButton) t.pVpButton.visible = false;
  if (t.pVAIButton) t.pVAIButton.tint = 0xFF2D95;
  
  // Tint settings panel
  if (t.settingsWindow) t.settingsWindow.tint = 0x1A0A40;
  
  // Stats window backgrounds
  if (t.quitStatsButton) t.quitStatsButton.tint = 0xFF2D95;
  if (t.quitSettingsButton) t.quitSettingsButton.tint = 0xFF2D95;
  
  // Copyright removed
  if (t.copyright) t.copyright.visible = false;
};

// Apply cyberpunk scanline effect to the canvas via CSS filter animation
(function() {
  var style = document.createElement('style');
  style.textContent = [
    '@keyframes cyberGlow {',
    '  0%, 100% { filter: brightness(1.0) saturate(1.2); }',
    '  50% { filter: brightness(1.02) saturate(1.3); }',
    '}',
    '#mygame canvas {',
    '  animation: cyberGlow 4s ease-in-out infinite;',
    '  image-rendering: auto;',
    '}',
    /* Neon edge glow pulse */
    '@keyframes neonPulse {',
    '  0%, 100% {',
    '    box-shadow: 0 0 10px rgba(0,255,240,0.2), 0 0 30px rgba(176,38,255,0.1);',
    '  }',
    '  50% {',
    '    box-shadow: 0 0 20px rgba(0,255,240,0.35), 0 0 50px rgba(176,38,255,0.2), 0 0 80px rgba(255,45,149,0.1);',
    '  }',
    '}',
    '#mygame canvas {',
    '  animation: cyberGlow 4s ease-in-out infinite, neonPulse 3s ease-in-out infinite;',
    '  border: 1px solid rgba(0, 255, 240, 0.2) !important;',
    '}',
  ].join('\n');
  document.head.appendChild(style);
})();

// Scale title and rack on the loading screen too
var _origLoadInit = loadState.init;
loadState.init = function() {
  _origLoadInit.call(this);
  var e = this.loaderInfo;
  // Scale gametitle.png (832x635) to match original title.png (683x295)
  if (e.title) {
    e.title.scale.x = 683 / 832;
    e.title.scale.y = 295 / 635;
  }
  // Scale main.png (2720x1568) to match original rack.png (669x388)
  if (e.rack) {
    e.rack.scale.x = 669 / 2720;
    e.rack.scale.y = 388 / 1568;
  }
};

// ─── Rack Attack Mode Detection ───
var RACK_ATTACK = (function() {
  try {
    var params = new URLSearchParams(window.location.search);
    return params.get('mode') === 'rackattack';
  } catch(e) { return false; }
})();

if (RACK_ATTACK) {

  // ── Skip menu: auto-start game ──
  var _origMenuCreate2 = menuState.create;
  menuState.create = function() {
    _origMenuCreate2.call(this);
    projectInfo.mode = 1;
    projectInfo.levelName = 'rackattack';
    projectInfo.tutorial = false;
    projectInfo.lastBreaker = 'none';
    game.state.start('play');
  };

  // ── 90-second countdown timer ──
  var RA_TIME_LIMIT = 90;
  var raStartTime = 0;
  var raTimerStarted = false;
  var raGameEnded = false;

  window._origStartTimer = window.startTimer;
  window.startTimer = function() {
    raStartTime = Date.now();
    raTimerStarted = true;
    playState.gameInfo.time = 0;
  };

  window._origUpdateTimer = window.updateTimer;
  window.updateTimer = function() {
    if (!raTimerStarted || raGameEnded) return;
    var gi = playState.gameInfo;
    var elapsed = (Date.now() - raStartTime) / 1000;
    var remaining = Math.max(0, Math.ceil(RA_TIME_LIMIT - elapsed));
    var mins = Math.floor(remaining / 60);
    var secs = remaining % 60;
    gi.timerText.text = mins + ':' + (secs < 10 ? '0' : '') + secs;
    gi.time = Math.floor(elapsed * 60);
    if (remaining <= 0 && !raGameEnded) {
      raGameEnded = true;
      gi.gameOver = true;
      gi.winner = 'p1';
      gi.foulDisplayComplete = true;
    }
  };

  // ── Override contact listener ──
  // Prevent cue-ball scratch from setting fouled/scratched
  // Prevent 8-ball pot from triggering immediate game-over
  var _origOnContact = onContact;
  onContact = function(evt) {
    var gi = playState.gameInfo;
    var ball = evt.ball;

    // CUE BALL potted: no scratch, just ball-in-hand
    if (evt.collisionType === 'pocket' && ball.id === 0) {
      ball.active = false;
      ball.velocity = new Vector2D(0, 0);
      ball.contactArray.push({
        position: ball.position,
        targetPosition: evt.target.position,
        velocity: evt.ballVelocity,
        collisionType: 'pocket',
        type: 'pocket'
      });
      if (!gi.trial) {
        playPocketSound(evt);
        playPocketAnimation(evt);
      }
      gi.cueBallInHand = true;
      // Do NOT set o.scratched or call awardBonuses (which sets fouled)
      return;
    }

    // 8-BALL potted: treat as a normal ball (award points, no game-over)
    if (evt.collisionType === 'pocket' && ball.id === 8) {
      ball.active = false;
      ball.velocity = new Vector2D(0, 0);
      ball.contactArray.push({
        position: ball.position,
        targetPosition: evt.target.position,
        velocity: evt.ballVelocity,
        collisionType: 'pocket',
        type: 'pocket'
      });
      if (!gi.trial) {
        playPocketSound(evt);
        playPocketAnimation(evt);
        // Award bonus manually (skipping the 8-ball game-over check in awardBonuses)
        gi.numBalls--;
        gi.pottedBallArray.push(ball.id);
        checkLevelComplete();
        gi.ballPotted = true;
        if (projectInfo.mode === 1 && gi.turn === 'p1') {
          var dp = evt.target.dropPosition;
          createBonusText(0, String(10 * gi.multiplier), 'font6',
            dp.x * gi.physScale, dp.y * gi.physScale, 56, false);
          game.time.events.add(1.5 * Phaser.Timer.SECOND, function() {
            projectInfo.score += 10 * gi.multiplier;
            gi.multiplier++;
            gi.multiplierText.text = 'x' + gi.multiplier;
          }, this);
        }
      }
      gi.ballsRemaining--;
      return;
    }

    // Everything else: normal handling
    _origOnContact(evt);
  };

  // ── Override playState.create: Rack Attack setup ──
  var _origPlayCreate2 = playState.create;
  playState.create = function() {
    _origPlayCreate2.call(this);
    var gi = this.gameInfo;
    gi.turn = 'p1';
    gi.p1TargetType = 'ANY';
    gi.p2TargetType = 'ANY';
    if (gi.aiIcon) gi.aiIcon.visible = false;
    if (gi.turnArrow2) gi.turnArrow2.visible = false;
    if (gi.timerText) { gi.timerText.visible = true; gi.timerText.text = '1:30'; }
    raTimerStarted = false;
    raGameEnded = false;
    raStartTime = 0;
  };

  // ── Override playState.update: suppress all fouls, lock turn to p1 ──
  var _origPlayUpdate = playState.update;
  playState.update = function() {
    var gi = this.gameInfo;

    // BEFORE original update: clear any scratch that might have slipped through
    if (gi) {
      gi.scratched = false;
    }

    // Run the original game update
    _origPlayUpdate.call(this);

    if (!gi) return;

    // ── AFTER original update: fix up any issues ──

    // Force turn to p1 (the rulings may have switched it to p2)
    if (gi.turn === 'p2') {
      gi.turn = 'p1';
      if (gi.turnArrow1) gi.turnArrow1.frame = 1;
      if (gi.turnArrow2) gi.turnArrow2.frame = 0;
    }

    // If a non-scratch foul was flagged (miss, cushion rule, etc.),
    // dismiss the foul window AND properly reset the shot state.
    // The original code schedules p() on a 5-second delay after the foul
    // window hides; since we hide it immediately we must trigger the
    // shot-reset ourselves by setting initVars=false so v() re-runs.
    if (gi.fouled && !raGameEnded) {
      gi.fouled = false;
      gi.scratched = false;
      gi.cueBallInHand = true;
      gi.rerack = false;

      if (gi.foulWindow && gi.foulWindow.visible) {
        gi.foulWindow.visible = false;
        gi.foulWindow.alpha = 1;
      }
      gi.foulDisplayComplete = true;
      gi.gameRunning = true;

      // Trigger a clean shot-reset on the NEXT frame:
      // initVars=false causes the engine's own v() to run internally
      gi.shotReset = true;
      gi.initVars = false;
      gi.shotComplete = false;
      gi.shotRunning = false;
      gi.beginStrike = false;
      gi.settingPower = false;
      gi.executeStrike = false;
      gi.cueTweenComplete = false;
    }

    // Safety: if foulDisplayComplete got stuck false, unstick it
    if (!gi.foulDisplayComplete && gi.foulWindow && !gi.foulWindow.visible && !gi.gameOver) {
      gi.foulDisplayComplete = true;
    }

    // Only the 90-s timer should cause game-over; cancel anything else
    if (gi.gameOver && !raGameEnded) {
      gi.gameOver = false;
      gi.winner = undefined;
      gi.gameRunning = true;
      gi.foulDisplayComplete = true;
      if (gi.gameOverPanel) gi.gameOverPanel.visible = false;
      if (gi.cueBaseCanvas) gi.cueBaseCanvas.visible = true;
      if (gi.guideCanvas) gi.guideCanvas.visible = true;
      gi.shotReset = true;
      gi.initVars = false;
      gi.shotComplete = false;
    }
  };
}

// ─── Score communication with parent platform ───
(function() {
  var lastScore = 0;
  setInterval(function() {
    if (typeof projectInfo !== 'undefined' && projectInfo.score !== lastScore) {
      lastScore = projectInfo.score;
      try { window.parent.postMessage({ type: 'GAME_SCORE_UPDATE', score: lastScore }, '*'); } catch(e) {}
    }
  }, 1000);

  var gameOverSent = false;
  setInterval(function() {
    if (gameOverSent) return;
    if (typeof playState === 'undefined' || !playState.gameInfo) return;
    var gi = playState.gameInfo;
    if (RACK_ATTACK && gi.gameOver && !gameOverSent) {
      gameOverSent = true;
      try { window.parent.postMessage({ type: 'GAME_OVER', finalScore: projectInfo.score || 0 }, '*'); } catch(e) {}
      return;
    }
    if (gi.gameOver && gi.quitButton2 && gi.quitButton2.visible) {
      gameOverSent = true;
      try { window.parent.postMessage({ type: 'GAME_OVER', finalScore: projectInfo.score || 0 }, '*'); } catch(e) {}
    }
  }, 500);
})();

console.log('%c BREAKING RACKS 4 CASH ', 'background: #0d0221; color: #00FFF0; font-size: 20px; font-weight: bold; padding: 10px; border: 2px solid #FF2D95; text-shadow: 0 0 10px #00FFF0;');
