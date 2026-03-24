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
  var raPausedAt = 0;
  var raPreservingTimer = false;  // true during rack reset to prevent timer reset
  var raRacksCleared = 0;        // count of racks completed
  var raResettingRack = false;    // true during the rack-reset transition

  window._origStartTimer = window.startTimer;
  window.startTimer = function() {
    if (raPreservingTimer) {
      // Rack reset: keep the current timer running, don't reset raStartTime
      raPreservingTimer = false;
      raTimerStarted = true;
      playState.gameInfo.time = 0;
      return;
    }
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
      // Zero out time/AI bonuses so the game-over panel only shows ball-pot score
      gi.time = 180 * 60; // time bonus = 180 - 180 = 0
      projectInfo.aiRating = 0; // AI bonus = 100 * 0 = 0
      gi.gameOver = true;
      gi.winner = 'p1';
      gi.foulDisplayComplete = true;
    }
  };

  // ── Override checkLevelComplete: Rack Attack needs ALL balls (including 8-ball) cleared ──
  // We overwrite the global function entirely so even _origOnContact calls our version.
  window.checkLevelComplete = function() {
    if (typeof playState === 'undefined' || !playState.gameInfo) return;
    var gi = playState.gameInfo;
    if (gi.numBalls <= 0 && !raGameEnded) {
      // All 15 balls cleared including 8-ball → reset rack, +20 seconds
      raRacksCleared++;
      raPreservingTimer = true;
      raResettingRack = true;
      raStartTime += 20000; // +20 seconds bonus
      raPausedAt = 0;
      projectInfo.levelComplete = true;
      // Suppress any game-over the engine might set during transition
      gi.gameOver = false;
      gi.gameRunning = true;
      gi.foulDisplayComplete = true;
      // Brief delay so pocket animation finishes, then re-rack
      game.time.events.add(1.5 * Phaser.Timer.SECOND, function() {
        game.state.start('play');
      }, this);
    }
  };

  // ── Custom contact handler for Rack Attack ──
  // NOTE: We CANNOT override onContact via global variable because
  // Phaser.Signal.add() in 14setup.js captures the function REFERENCE.
  // Instead we replace the Signal listener in playState.create below.
  var _origOnContact = onContact;

  function rackAttackOnContact(evt) {
    var gi = playState.gameInfo;
    var ball = evt.ball;

    // CUE BALL potted: no scratch, just ball-in-hand
    if (evt.collisionType === 'pocket' && ball.id === 0) {
      ball.active = false;
      ball.velocity = new Vector2D(0, 0);
      var info = new Object();
      info.position = ball.position;
      info.targetPosition = evt.target.position;
      info.velocity = evt.ballVelocity;
      info.collisionType = 'pocket';
      info.screw = ball.screw;
      info.type = 'pocket';
      ball.contactArray.push(info);
      if (!gi.trial) {
        playPocketSound(evt);
        playPocketAnimation(evt);
      }
      gi.cueBallInHand = true;
      return;
    }

    // ANY non-cue ball potted: add +5 seconds to timer
    if (evt.collisionType === 'pocket' && ball.id !== 0 && !raGameEnded && raTimerStarted) {
      raStartTime += 5000;
    }

    // 8-BALL potted: if other balls remain → game over; if last ball → award + rack reset
    if (evt.collisionType === 'pocket' && ball.id === 8) {
      // Check if 8-ball is the LAST ball (numBalls == 1 means only 8-ball was left)
      if (gi.numBalls > 1) {
        // 8-ball potted EARLY — game over!
        ball.active = false;
        ball.velocity = new Vector2D(0, 0);
        var info8e = new Object();
        info8e.position = ball.position;
        info8e.targetPosition = evt.target.position;
        info8e.velocity = evt.ballVelocity;
        info8e.collisionType = 'pocket';
        info8e.screw = ball.screw;
        info8e.type = 'pocket';
        ball.contactArray.push(info8e);
        if (!gi.trial) {
          playPocketSound(evt);
          playPocketAnimation(evt);
        }
        raGameEnded = true;
        gi.time = 180 * 60;
        projectInfo.aiRating = 0;
        gi.gameOver = true;
        gi.winner = 'p1';
        gi.foulDisplayComplete = true;
        return;
      }

      // 8-ball is the LAST ball — award points, decrement balls, THEN call checkLevelComplete
      ball.active = false;
      ball.velocity = new Vector2D(0, 0);
      var info2 = new Object();
      info2.position = ball.position;
      info2.targetPosition = evt.target.position;
      info2.velocity = evt.ballVelocity;
      info2.collisionType = 'pocket';
      info2.screw = ball.screw;
      info2.type = 'pocket';
      ball.contactArray.push(info2);
      if (!gi.trial) {
        playPocketSound(evt);
        playPocketAnimation(evt);
        gi.numBalls--; // Decrement BEFORE calling checkLevelComplete
        gi.pottedBallArray.push(ball.id);
        
        // This will now see numBalls <= 0 and trigger rack reset
        window.checkLevelComplete();
        
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

    // Everything else: use original handler
    _origOnContact.call(this, evt);
  }

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

    if (raPreservingTimer) {
      // Rack reset: keep timer running, only reset game-ended flag
      raGameEnded = false;
      raResettingRack = false;
      raPausedAt = 0;
      // Show remaining time immediately
      if (gi.timerText && raTimerStarted) {
        var elapsed = (Date.now() - raStartTime) / 1000;
        var remaining = Math.max(0, Math.ceil(RA_TIME_LIMIT - elapsed));
        var mins = Math.floor(remaining / 60);
        var secs = remaining % 60;
        gi.timerText.text = mins + ':' + (secs < 10 ? '0' : '') + secs;
      }
      // Ensure cue stick and game are ready for the new rack
      gi.gameRunning = true;
      gi.gameOver = false;
      gi.foulDisplayComplete = true;
    } else {
      // Fresh game: full reset
      raTimerStarted = false;
      raGameEnded = false;
      raResettingRack = false;
      raStartTime = 0;
      raPausedAt = 0;
      raRacksCleared = 0;
    }

    // CRITICAL: Replace the contact event listener on the Phaser.Signal.
    // 14setup.js does: this.contactEvent = new Phaser.Signal;
    //                  this.contactEvent.add(onContact, this);
    // Inside an IIFE, "this" is window, so window.contactEvent is the Signal.
    // billiardPhysics stores it as this.contactEvent = t (first arg).
    // The Signal holds a REFERENCE to the original onContact – overriding
    // the global variable does NOT change what the Signal calls.
    // We must removeAll() and re-add our custom handler.
    var signal = (gi.phys && gi.phys.contactEvent) || window.contactEvent;
    if (signal && signal.removeAll) {
      signal.removeAll();
      signal.add(rackAttackOnContact, this);
    }
  };

  // ── Override playState.update: suppress fouls, lock turn to p1 ──
  var _origPlayUpdate = playState.update;
  playState.update = function() {
    var gi = this.gameInfo;

    // BEFORE original update: clear scratch flag (safety net)
    if (gi) {
      gi.scratched = false;
    }

    // Run the original game update
    _origPlayUpdate.call(this);

    if (!gi) return;

    // ── Handle pause: freeze timer while pause menu is visible ──
    if (gi.popUpPanel && gi.popUpPanel.visible) {
      if (raPausedAt === 0 && raTimerStarted) {
        raPausedAt = Date.now();
      }
      return; // skip Rack Attack fix-up logic while paused
    }
    if (raPausedAt > 0 && raTimerStarted) {
      raStartTime += (Date.now() - raPausedAt);
      raPausedAt = 0;
    }

    // ── AFTER original update: fix up any issues ──

    // Force turn to p1 (the rulings may have switched it to p2)
    if (gi.turn === 'p2') {
      gi.turn = 'p1';
      if (gi.turnArrow1) gi.turnArrow1.frame = 1;
      if (gi.turnArrow2) gi.turnArrow2.frame = 0;
    }

    // If engine set cueBallInHand due to a foul (not a scratch/pocket),
    // clear it so the cue ball stays where it stopped.
    // ballArray[0].active is false only when cue ball was actually pocketed.
    if (gi.cueBallInHand && gi.ballArray[0] && gi.ballArray[0].active && gi.shotNum > 0 && !gi.shotRunning) {
      gi.cueBallInHand = false;
    }

    // If a foul was flagged (miss, cushion rule, etc.),
    // dismiss the foul window AND properly reset the shot state.
    if (gi.fouled && !raGameEnded) {
      gi.fouled = false;
      gi.scratched = false;
      // Don't set cueBallInHand: cue ball stays where it landed on miss.
      // cueBallInHand is only set by rackAttackOnContact when cue ball is pocketed.
      gi.rerack = false;

      if (gi.foulWindow && gi.foulWindow.visible) {
        gi.foulWindow.visible = false;
        gi.foulWindow.alpha = 1;
      }
      gi.foulDisplayComplete = true;
      gi.gameRunning = true;

      // Trigger shot-reset on the NEXT frame via the engine's
      // own code path: 0==a.initVars && (v(), a.initVars=!0)
      gi.shotReset = true;
      gi.initVars = false;
      gi.shotComplete = false;
      gi.shotRunning = false;
      gi.beginStrike = false;
      gi.settingPower = false;
      gi.executeStrike = false;
      gi.cueTweenComplete = false;
    }

    // Safety: unstick foulDisplayComplete
    if (!gi.foulDisplayComplete && gi.foulWindow && !gi.foulWindow.visible && !gi.gameOver) {
      gi.foulDisplayComplete = true;
    }

    // Safety: ensure gameRunning is true when not in game-over and not paused
    if (!gi.gameRunning && !gi.gameOver && !raGameEnded && !raResettingRack && !gi.shotRunning &&
        !(gi.popUpPanel && gi.popUpPanel.visible)) {
      gi.gameRunning = true;
    }

    // During rack-reset transition, aggressively suppress game-over
    if (raResettingRack) {
      gi.gameOver = false;
      gi.winner = undefined;
      gi.foulDisplayComplete = true;
      if (gi.gameOverPanel) gi.gameOverPanel.visible = false;
      // Keep timer running during rack-reset transition
      if (raTimerStarted) {
        updateTimer();
      }
    }

    // Only the 90-s timer or early 8-ball should cause game-over; cancel anything else
    if (gi.gameOver && !raGameEnded && !raResettingRack) {
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

    // Prevent engine from freezing on levelComplete during rack-reset transition
    if (projectInfo.levelComplete && !raGameEnded) {
      // The rack-reset timer is ticking; keep timer updating
      if (raTimerStarted) {
        updateTimer();
      }
    }

    // Safety: ensure cue stick stays visible when game is running (not game-over)
    if (!gi.gameOver && !raGameEnded && !raResettingRack && !gi.shotRunning &&
        !(gi.popUpPanel && gi.popUpPanel.visible)) {
      if (gi.cueBaseCanvas && !gi.cueBaseCanvas.visible) gi.cueBaseCanvas.visible = true;
      if (gi.guideCanvas && !gi.guideCanvas.visible) gi.guideCanvas.visible = true;
    }

    // Safety: if cue ball is inactive after animation done, ensure ball-in-hand
    if (gi.ballArray && gi.ballArray[0] && !gi.ballArray[0].active &&
        gi.ballArray[0].pocketTweenComplete !== false &&
        !gi.cueBallInHand && !gi.shotRunning && !gi.gameOver) {
      gi.cueBallInHand = true;
    }

    // After scratch: place cue ball at break position instead of center (0,0)
    if (gi.cueBallInHand && gi.placedInCenter && gi.ballArray[0] && !gi.shotRunning) {
      var cb = gi.ballArray[0];
      cb.position.x = -15000 * gi.adjustmentScale;
      cb.position.y = 0;
      if (cb.mover) cb.mover.visible = false;
      renderScreen();
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
    
    // In Rack Attack, auto-send game over when time runs out
    if (RACK_ATTACK && gi.gameOver && !gameOverSent) {
      gameOverSent = true;
      try { window.parent.postMessage({ type: 'GAME_OVER', finalScore: projectInfo.score || 0 }, '*'); } catch(e) {}
    }
    
    // When the quit button is shown (or clicked) at game over
    if (gi.gameOver && gi.quitButton2 && gi.quitButton2.visible) {
      gameOverSent = true;
      try { window.parent.postMessage({ type: 'GAME_OVER', finalScore: projectInfo.score || 0 }, '*'); } catch(e) {}
    }
  }, 500);

  // Hook into the quit buttons to send home message
  setInterval(function() {
    if (typeof playState === 'undefined' || !playState.gameInfo) return;
    var gi = playState.gameInfo;
    
    if (!window._homeHooked && gi.quitButton2) {
      window._homeHooked = true;
      var _origQuit2 = gi.quitButton2.events.onInputUp;
      gi.quitButton2.events.onInputUp.removeAll();
      gi.quitButton2.events.onInputUp.add(function() {
        try { window.parent.postMessage({ type: 'GO_HOME', finalScore: projectInfo.score || 0 }, '*'); } catch(e) {}
      }, this);
    }
    
    if (typeof menuState !== 'undefined' && menuState.menuInfo) {
      var t = menuState.menuInfo;
      if (!window._menuHomeHooked && t.quitStatsButton) {
        window._menuHomeHooked = true;
        // Don't need to hook the stats back button, it stays in game iframe
      }
    }
  }, 1000);
})();

console.log('%c BREAKING RACKS 4 CASH ', 'background: #0d0221; color: #00FFF0; font-size: 20px; font-weight: bold; padding: 10px; border: 2px solid #FF2D95; text-shadow: 0 0 10px #00FFF0;');
