/**
 * NEON SPACE SHOOTER
 * Phaser 3 Retro Cyberpunk Arcade Game
 * Dynamic Audio Synthesis & Advanced Sprites
 */

// ==========================================
// 1. DYNAMIC RETRO SOUND SYNTHESIZER
// ==========================================
class SoundSynth {
    constructor() {
        this.ctx = null;
    }

    init() {
        if (this.ctx) return;
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }

    playLaser() {
        this.init();
        if (!this.ctx) return;
        
        let osc = this.ctx.createOscillator();
        let gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(900, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.12);
        
        gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.12);
        
        osc.start();
        osc.stop(this.ctx.currentTime + 0.12);
    }

    playExplosion() {
        this.init();
        if (!this.ctx) return;

        // Generate synthetic explosion noise buffer
        let bufferSize = this.ctx.sampleRate * 0.35; // 0.35s duration
        let buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        let data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        let noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        let filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(500, this.ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(20, this.ctx.currentTime + 0.35);

        let gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.22, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.005, this.ctx.currentTime + 0.35);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        noise.start();
        noise.stop(this.ctx.currentTime + 0.35);
    }

    playPowerup() {
        this.init();
        if (!this.ctx) return;
        
        let now = this.ctx.currentTime;
        let notes = [261.63, 329.63, 392.00, 523.25, 659.25]; // C4 -> E4 -> G4 -> C5 -> E5 arpeggio
        notes.forEach((freq, idx) => {
            let osc = this.ctx.createOscillator();
            let gain = this.ctx.createGain();
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + idx * 0.05);
            
            gain.gain.setValueAtTime(0.12, now + idx * 0.05);
            gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.05 + 0.12);
            
            osc.start(now + idx * 0.05);
            osc.stop(now + idx * 0.05 + 0.12);
        });
    }

    playShieldHit() {
        this.init();
        if (!this.ctx) return;
        
        let osc = this.ctx.createOscillator();
        let gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1400, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(700, this.ctx.currentTime + 0.15);
        
        gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);
        
        osc.start();
        osc.stop(this.ctx.currentTime + 0.15);
    }

    playLevelUp() {
        this.init();
        if (!this.ctx) return;
        
        let now = this.ctx.currentTime;
        let chord = [293.66, 369.99, 440.00, 587.33]; // D4, F#4, A4, D5 (D Major chord, happy synth sound)
        chord.forEach((freq) => {
            let osc = this.ctx.createOscillator();
            let gain = this.ctx.createGain();
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(freq, now);
            osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + 0.4);
            
            gain.gain.setValueAtTime(0.07, now);
            gain.gain.exponentialRampToValueAtTime(0.005, now + 0.4);
            
            osc.start(now);
            osc.stop(now + 0.4);
        });
    }

    playHit() {
        this.init();
        if (!this.ctx) return;
        
        let osc = this.ctx.createOscillator();
        let gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(220, this.ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(50, this.ctx.currentTime + 0.18);
        
        gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.18);
        
        osc.start();
        osc.stop(this.ctx.currentTime + 0.18);
    }
}
const synth = new SoundSynth();

// ==========================================
// 2. TEXTURE CHROMA-KEY TRANSPARENCY FILTER
// ==========================================
function makeTextureTransparent(scene, sourceKey, destKey, threshold = 35) {
    let sourceTexture = scene.textures.get(sourceKey);
    let sourceImage = sourceTexture.getSourceImage();
    
    let canvas = scene.textures.createCanvas(destKey, sourceImage.width, sourceImage.height);
    let ctx = canvas.getContext();
    
    // Draw original asset
    ctx.drawImage(sourceImage, 0, 0);
    
    // Process image data
    let imgData = ctx.getImageData(0, 0, sourceImage.width, sourceImage.height);
    let data = imgData.data;
    
    for (let i = 0; i < data.length; i += 4) {
        let r = data[i];
        let g = data[i + 1];
        let b = data[i + 2];
        
        // Remove pixels close to black (RGB < threshold)
        if (r < threshold && g < threshold && b < threshold) {
            data[i + 3] = 0; // Set transparency alpha channel to 0
        }
    }
    
    ctx.putImageData(imgData, 0, 0);
    canvas.refresh();
}

// ==========================================
// 3. SCENE 1: BOOT & PRELOAD
// ==========================================
class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        // Futuristic progress bar UI
        let progress = this.add.graphics();
        let border = this.add.graphics();
        border.lineStyle(2, 0x00f0ff, 0.5);
        border.strokeRect(330, 290, 300, 20);

        let titleText = this.add.text(480, 250, 'CYBERNETIC INTERFACE LOADING...', {
            fontFamily: 'Orbitron',
            fontSize: '16px',
            fill: '#00f0ff',
            fontWeight: '900',
            letterSpacing: 2
        }).setOrigin(0.5);

        this.load.on('progress', (value) => {
            progress.clear();
            progress.fillStyle(0xff007f, 0.8);
            progress.fillRect(332, 292, 296 * value, 16);
            titleText.setText('LOADING PROTOCOLS: ' + Math.round(value * 100) + '%');
        });

        // Load asset files with solid background textures
        this.load.image('spaceship_raw', 'assets/spaceship.png');
        this.load.image('alien_raw', 'assets/alien.png');
        this.load.image('powerup_raw', 'assets/powerup.png');
    }

    create() {
        // Apply pixel shader filters to make sprites transparent
        makeTextureTransparent(this, 'spaceship_raw', 'spaceship', 38);
        makeTextureTransparent(this, 'alien_raw', 'alien', 38);
        makeTextureTransparent(this, 'powerup_raw', 'powerup', 38);

        // Generate procedural textures to keep assets standalone
        // neon dot for laser debris particles
        let dotGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        dotGraphics.fillStyle(0xffffff);
        dotGraphics.fillCircle(8, 8, 8);
        dotGraphics.generateTexture('particle_dot', 16, 16);

        // Neon laser rectangles
        let laserGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        laserGraphics.fillStyle(0xffffff);
        laserGraphics.fillRect(0, 0, 4, 16);
        laserGraphics.generateTexture('laser_bullet', 4, 16);

        // Proceed to main menu
        this.scene.start('MenuScene');
    }
}

// ==========================================
// 4. SCENE 2: MAIN MENU SCENE
// ==========================================
class MenuScene extends Phaser.Scene {
    constructor() {
        super('MenuScene');
    }

    create() {
        // Setup retro-synthwave starfield
        this.stars = [];
        for (let i = 0; i < 60; i++) {
            this.stars.push({
                x: Phaser.Math.Between(0, 960),
                y: Phaser.Math.Between(0, 540),
                speed: Phaser.Math.FloatBetween(0.2, 1.5),
                size: Phaser.Math.FloatBetween(0.5, 2),
                alpha: Phaser.Math.FloatBetween(0.2, 0.8)
            });
        }
        this.starGraphics = this.add.graphics();
        
        // Scrolling grid variables
        this.gridGraphics = this.add.graphics();
        this.gridOffsetY = 0;

        // Visual logo titles
        this.add.text(480, 180, 'SPACE WAR : SHOOTING', {
            fontFamily: 'Orbitron',
            fontSize: '56px',
            fontWeight: '900',
            fill: '#ffffff',
            letterSpacing: 6
        }).setOrigin(0.5).setShadow(0, 0, 15, '#00f0ff', true);

        this.add.text(480, 240, 'SPACE DEFENDER CORE', {
            fontFamily: 'Rajdhani',
            fontSize: '20px',
            fontWeight: '700',
            fill: '#ff007f',
            letterSpacing: 4
        }).setOrigin(0.5).setShadow(0, 0, 8, '#ff007f', true);

        // Floating start prompt
        let promptText = this.add.text(480, 335, 'TEKAN SPASI ATAU KLIK UNTUK MEMULAI', {
            fontFamily: 'Orbitron',
            fontSize: '18px',
            fontWeight: '800',
            fill: '#00f0ff'
        }).setOrigin(0.5);

        // Pulsing start prompt animation
        this.tweens.add({
            targets: promptText,
            alpha: 0.3,
            duration: 1000,
            yoyo: true,
            repeat: -1
        });

        // Display High Score from local storage
        let highScore = localStorage.getItem('triangleShooterHighScore') || 0;
        this.add.text(480, 440, `REKOR TERTINGGI: ${highScore}`, {
            fontFamily: 'Orbitron',
            fontSize: '16px',
            fontWeight: '600',
            fill: '#ffaa00'
        }).setOrigin(0.5);

        // Input triggers
        this.input.keyboard.on('keydown-SPACE', () => this.startGame());
        this.input.on('pointerdown', () => this.startGame());
        
        // Update DOM buttons states
        updateDOMButtonStates(false, false);
    }

    update() {
        // Redraw drifting starfields
        this.starGraphics.clear();
        this.stars.forEach(star => {
            star.y += star.speed;
            if (star.y > 540) {
                star.y = 0;
                star.x = Phaser.Math.Between(0, 960);
            }
            this.starGraphics.fillStyle(0xffffff, star.alpha);
            this.starGraphics.fillCircle(star.x, star.y, star.size);
        });

        // Redraw scrolling cyber-grids
        this.gridGraphics.clear();
        this.gridGraphics.lineStyle(1, 0x00f0ff, 0.08);
        for (let x = 0; x < 960; x += 50) {
            this.gridGraphics.lineBetween(x, 0, x, 540);
        }
        this.gridOffsetY = (this.gridOffsetY + 1) % 50;
        for (let y = this.gridOffsetY - 50; y < 540; y += 50) {
            this.gridGraphics.lineBetween(0, y, 960, y);
        }
    }

    startGame() {
        synth.init(); // Initialize audio context on player gesture
        this.scene.start('GameScene');
    }
}

// ==========================================
// 5. SCENE 3: MAIN GAME SCENE
// ==========================================
class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    create() {
        this.gameActive = true;
        this.score = 0;
        this.lives = 5; // Start with 5 lives for easier difficulty
        this.level = 1;
        
        // Starfield & Grid layout
        this.stars = [];
        for (let i = 0; i < 80; i++) {
            this.stars.push({
                x: Phaser.Math.Between(0, 960),
                y: Phaser.Math.Between(0, 540),
                speed: Phaser.Math.FloatBetween(0.4, 2.5),
                size: Phaser.Math.FloatBetween(0.5, 2.5),
                alpha: Phaser.Math.FloatBetween(0.3, 0.9)
            });
        }
        this.starGraphics = this.add.graphics();
        this.gridGraphics = this.add.graphics();
        this.gridOffsetY = 0;

        // Player core variables
        this.isInvulnerable = false;
        this.shootCooldown = 180; // ms (Faster shooting rate)
        this.lastShotTime = 0;
        
        // Powerups states
        this.powerupSpread = false;
        this.powerupSpreadTimer = null;
        this.shieldActive = false;
        this.shieldHits = 0;
        this.shieldGraphics = this.add.graphics();

        // Bomb shockwave shockwave variables
        this.bombActive = false;
        this.bombRadius = 0;
        this.bombX = 0;
        this.bombY = 0;
        this.bombGraphics = this.add.graphics();

        // Instantiate player spaceship physics sprite (Shrunk player size even more)
        this.player = this.physics.add.sprite(480, 460, 'spaceship');
        this.player.setScale(0.06); // Shrunk from 0.08
        this.player.setCollideWorldBounds(true);
        this.player.setBodySize(this.player.width * 0.65, this.player.height * 0.65); // Tighter hitboxes
        
        // Spaceship neon cyan jet thruster trail particles
        this.thrusterParticles = this.add.particles(0, 0, 'particle_dot', {
            speedY: { min: 80, max: 180 },
            speedX: { min: -15, max: 15 },
            scale: { start: 0.3, end: 0 },
            alpha: { start: 0.8, end: 0 },
            tint: 0x00f0ff,
            lifespan: 250,
            frequency: 12,
            blendMode: 'ADD'
        });
        this.thrusterParticles.startFollow(this.player, 0, 15);

        // Object groups
        this.lasers = this.physics.add.group();
        this.enemies = this.physics.add.group();
        this.powerups = this.physics.add.group();

        // Colliders setup
        this.physics.add.overlap(this.lasers, this.enemies, this.hitEnemy, null, this);
        this.physics.add.overlap(this.player, this.enemies, this.hitPlayer, null, this);
        this.physics.add.overlap(this.player, this.powerups, this.collectPowerup, null, this);

        // Desktop keyboard inputs
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys('W,A,S,D');
        this.space = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.pKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);

        // Spawning timer handler (Easier initial spawn delay)
        this.spawnDelay = 1600; // Starting delay 1.6s
        this.spawnTimerEvent = this.time.addEvent({
            delay: this.spawnDelay,
            callback: this.spawnEnemy,
            callbackScope: this,
            loop: true
        });

        // Initialize HUD stats in HTML
        this.updateUI();
        updateDOMButtonStates(true, false);
    }

    update(time, delta) {
        if (!this.gameActive) return;

        // Check pause input key triggers
        if (Phaser.Input.Keyboard.JustDown(this.pKey)) {
            this.pauseGame();
            return;
        }

        // Draw drifting starfields (Widescreen bounds)
        this.starGraphics.clear();
        this.stars.forEach(star => {
            star.y += star.speed;
            if (star.y > 540) {
                star.y = 0;
                star.x = Phaser.Math.Between(0, 960);
            }
            this.starGraphics.fillStyle(0xffffff, star.alpha);
            this.starGraphics.fillCircle(star.x, star.y, star.size);
        });

        // Draw scrolling grid (Widescreen bounds)
        this.gridGraphics.clear();
        this.gridGraphics.lineStyle(1, 0x00f0ff, 0.08);
        for (let x = 0; x < 960; x += 50) {
            this.gridGraphics.lineBetween(x, 0, x, 540);
        }
        this.gridOffsetY = (this.gridOffsetY + 1.5) % 50;
        for (let y = this.gridOffsetY - 50; y < 540; y += 50) {
            this.gridGraphics.lineBetween(0, y, 960, y);
        }

        // Spaceship movement inputs processing (WASD + Arrows + Mobile joystick)
        let vx = 0;
        let vy = 0;
        let speed = 300; // Slightly faster to cross larger canvas

        if (this.cursors.left.isDown || this.wasd.A.isDown || window.mobileControls.left) {
            vx = -speed;
        } else if (this.cursors.right.isDown || this.wasd.D.isDown || window.mobileControls.right) {
            vx = speed;
        }

        if (this.cursors.up.isDown || this.wasd.W.isDown || window.mobileControls.up) {
            vy = -speed;
        } else if (this.cursors.down.isDown || this.wasd.S.isDown || window.mobileControls.down) {
            vy = speed;
        }

        this.player.setVelocity(vx, vy);

        // Futuristic Ship Tilting Aesthetics
        if (vx < 0) {
            this.player.setRotation(Phaser.Math.Linear(this.player.rotation, -0.22, 0.15));
        } else if (vx > 0) {
            this.player.setRotation(Phaser.Math.Linear(this.player.rotation, 0.22, 0.15));
        } else {
            this.player.setRotation(Phaser.Math.Linear(this.player.rotation, 0, 0.15));
        }

        // Active shooting trigger handler (Space key or click-drag screen or mobile action)
        let isShooting = this.space.isDown || this.input.activePointer.isDown || window.mobileControls.shoot;
        // Ignore clicks if they fall on floating UI buttons container (dashboard handles this layout)
        if (this.input.activePointer.isDown && this.input.activePointer.y > 510 && this.input.activePointer.x > 660) {
            isShooting = false;
        }

        if (isShooting && time - this.lastShotTime > this.shootCooldown) {
            this.shootLaser(time);
        }

        // Garbage collection: clear off-screen lasers
        this.lasers.getChildren().forEach(laser => {
            if (laser.y < -30) {
                laser.destroy();
            }
        });

        // Detect passing alien escape penalties (Lower bounds 570)
        this.enemies.getChildren().forEach(enemy => {
            if (enemy.y > 570) {
                enemy.destroy();
                this.lives--;
                this.updateUI();
                synth.playHit();
                this.cameras.main.shake(80, 0.005); // Reduced screen shake

                // Glow flash on escape
                let redPulse = this.add.particles(enemy.x, 530, 'particle_dot', {
                    speed: { min: 20, max: 120 },
                    scale: { start: 0.4, end: 0 },
                    alpha: { start: 0.8, end: 0 },
                    tint: 0xff0055,
                    lifespan: 300,
                    blendMode: 'ADD'
                });
                redPulse.explode(10);
                this.time.delayedCall(300, () => redPulse.destroy());

                if (this.lives <= 0) {
                    this.endGame();
                }
            }
        });

        // Draw energy shield bubble overlay
        this.shieldGraphics.clear();
        if (this.shieldActive) {
            this.shieldGraphics.lineStyle(2, 0x00f0ff, 0.7);
            this.shieldGraphics.strokeCircle(this.player.x, this.player.y, 28); // Shrunk shield radius to match player
            
            let pulseRad = 24 + Math.sin(time / 80) * 3;
            this.shieldGraphics.lineStyle(1, 0x00f0ff, 0.35);
            this.shieldGraphics.strokeCircle(this.player.x, this.player.y, pulseRad);
        }

        // Draw growing bomb shockwave circles
        this.bombGraphics.clear();
        if (this.bombActive) {
            this.bombRadius += 18 * (delta / 16.66); // scale with delta times
            let alpha = 1 - (this.bombRadius / 1000);
            this.bombGraphics.lineStyle(6, 0xff007f, alpha);
            this.bombGraphics.strokeCircle(this.bombX, this.bombY, this.bombRadius);

            // Destroy enemies inside the shockwave radius
            this.enemies.getChildren().forEach(enemy => {
                let dist = Phaser.Math.Distance.Between(this.bombX, this.bombY, enemy.x, enemy.y);
                if (dist <= this.bombRadius && !enemy.isHitByBomb) {
                    enemy.isHitByBomb = true; // Flag to prevent multiple hits
                    this.damageEnemy(enemy, 99); // Instantly vaporize
                }
            });

            if (this.bombRadius >= 1000) {
                this.bombActive = false;
                this.bombGraphics.clear();
            }
        }
    }

    shootLaser(time) {
        this.lastShotTime = time;
        synth.playLaser();

        let bulletSpeed = -650;
        let scale = 1.0;

        if (this.powerupSpread) {
            // Triple spread shot configurations
            let laserCenter = this.lasers.create(this.player.x, this.player.y - 25, 'laser_bullet');
            laserCenter.setVelocity(0, bulletSpeed).setTint(0x00f0ff).setScale(1.2);

            let laserLeft = this.lasers.create(this.player.x - 12, this.player.y - 20, 'laser_bullet');
            laserLeft.setVelocity(-180, bulletSpeed * 0.95).setRotation(-0.25).setTint(0xff007f).setScale(1.2);

            let laserRight = this.lasers.create(this.player.x + 12, this.player.y - 20, 'laser_bullet');
            laserRight.setVelocity(180, bulletSpeed * 0.95).setRotation(0.25).setTint(0xff007f).setScale(1.2);
        } else {
            // Single normal laser
            let laser = this.lasers.create(this.player.x, this.player.y - 25, 'laser_bullet');
            laser.setVelocity(0, bulletSpeed).setTint(0xffaa00);
        }

        // Shoot sparks effects at nozzles
        let sparks = this.add.particles(this.player.x, this.player.y - 25, 'particle_dot', {
            speed: { min: 20, max: 100 },
            angle: { min: 240, max: 300 },
            scale: { start: 0.3, end: 0 },
            alpha: { start: 0.9, end: 0 },
            tint: 0xffaa00,
            lifespan: 150,
            blendMode: 'ADD'
        });
        sparks.explode(5);
        this.time.delayedCall(150, () => sparks.destroy());
    }

    spawnEnemy() {
        if (!this.gameActive) return;

        let spawnX = Phaser.Math.Between(30, 930); // Widescreen coordinates
        let spawnY = -40;
        let enemy = this.enemies.create(spawnX, spawnY, 'alien');
        enemy.setOrigin(0.5);

        // Generate dynamic difficulty variables based on level
        let randVal = Phaser.Math.Between(1, 100);
        let scoutProb = Math.min(10 + this.level * 4, 30); // max 30%
        let bossProb = Math.min(this.level * 2, 15);      // max 15% (lower boss rate)
        
        let type = 'fighter';
        if (randVal <= scoutProb) {
            type = 'scout';
        } else if (randVal > (100 - bossProb)) {
            type = 'cruiser';
        }

        // Assign sprite attributes dynamically - SHRUNK SIZES MORE
        if (type === 'scout') {
            // Scout details: very small, moves moderately fast
            enemy.setScale(0.035); // Shrunk further from 0.045
            enemy.setTint(0xff0055);
            enemy.setVelocityY(150 + this.level * 10);
            enemy.setAngularVelocity(Phaser.Math.Between(-140, 140));
            enemy.hp = 1;
            enemy.points = 150;
            enemy.enemyType = 'scout';
        } else if (type === 'cruiser') {
            // Cruiser details: medium-large, purple, 2 HP
            enemy.setScale(0.095); // Shrunk further from 0.13
            enemy.setTint(0xbd00ff);
            enemy.setVelocityY(45 + this.level * 4);
            enemy.setAngularVelocity(Phaser.Math.Between(-30, 30));
            enemy.hp = 2;
            enemy.points = 400;
            enemy.enemyType = 'cruiser';
        } else {
            // Normal fighter: standard size, green, normal speed
            enemy.setScale(0.055); // Shrunk further from 0.075
            enemy.setTint(0x39ff14);
            enemy.setVelocityY(90 + this.level * 8);
            enemy.setAngularVelocity(Phaser.Math.Between(-70, 70));
            enemy.hp = 1;
            enemy.points = 100;
            enemy.enemyType = 'fighter';
        }

        // Tighter physics bodies
        enemy.setBodySize(enemy.width * 0.7, enemy.height * 0.7);
    }

    hitEnemy(laser, enemy) {
        laser.destroy();
        
        // Spawn small sparks on laser impact point
        let sparkColor = enemy.tintTopLeft; // match sparks color with enemy alien tint
        let impactSparks = this.add.particles(laser.x, laser.y, 'particle_dot', {
            speed: { min: 40, max: 120 },
            scale: { start: 0.4, end: 0 },
            alpha: { start: 0.9, end: 0 },
            tint: sparkColor,
            lifespan: 200,
            blendMode: 'ADD'
        });
        impactSparks.explode(6);
        this.time.delayedCall(200, () => impactSparks.destroy());

        // Process enemy damage health
        this.damageEnemy(enemy, 1);
    }

    damageEnemy(enemy, amount) {
        enemy.hp -= amount;

        // Score flash white shader feedback
        this.tweens.add({
            targets: enemy,
            alpha: 0.5,
            duration: 50,
            yoyo: true,
            repeat: 1
        });

        if (enemy.hp <= 0) {
            this.killEnemy(enemy);
        }
    }

    killEnemy(enemy) {
        let spawnX = enemy.x;
        let spawnY = enemy.y;
        let points = enemy.points * this.level;
        let tint = enemy.tintTopLeft;
        let type = enemy.enemyType;

        enemy.destroy();
        this.score += points;
        this.updateUI();

        synth.playExplosion();
        this.cameras.main.shake(40, 0.003); // Reduced screen shake

        // Neon organic debris blast particles
        let boom = this.add.particles(spawnX, spawnY, 'particle_dot', {
            speed: { min: 50, max: 180 },
            scale: { start: 0.5, end: 0 },
            alpha: { start: 0.9, end: 0 },
            tint: tint,
            lifespan: 300,
            blendMode: 'ADD'
        });
        boom.explode(12);
        this.time.delayedCall(300, () => boom.destroy());

        // Floating score popup texts
        this.spawnFloatingText(spawnX, spawnY, `+${points}`, '#39ff14');

        // Cruiser division: split large cruiser into 2 diagonal flying scouts (Shrunk scouts)
        if (type === 'cruiser') {
            this.time.delayedCall(100, () => {
                for (let i = -1; i <= 1; i += 2) {
                    let scout = this.enemies.create(spawnX + (i * 25), spawnY, 'alien');
                    scout.setScale(0.035); // Shrunk scale further
                    scout.setTint(0xff0055);
                    scout.setVelocity(i * 80, 150 + this.level * 10);
                    scout.setAngularVelocity(Phaser.Math.Between(-140, 140));
                    scout.hp = 1;
                    scout.points = 150;
                    scout.enemyType = 'scout';
                    scout.setBodySize(scout.width * 0.7, scout.height * 0.7);
                }
            });
        }

        // Random roll powerup drop mechanics (10% standard, 25% from cruisers)
        let roll = Phaser.Math.Between(1, 100);
        let chance = (type === 'cruiser') ? 28 : 10;
        if (roll <= chance) {
            this.spawnPowerup(spawnX, spawnY);
        }

        // Check level thresholds
        this.checkLevelProgression();
    }

    spawnPowerup(x, y) {
        let powerup = this.powerups.create(x, y, 'powerup');
        powerup.setScale(0.12);
        powerup.setVelocityY(110);
        
        // Random assign powerup behaviors
        let types = ['spread', 'shield', 'bomb'];
        powerup.powerupType = types[Phaser.Math.Between(0, 2)];
        
        // Color-code powerups glows
        if (powerup.powerupType === 'spread') powerup.setTint(0x00f0ff);
        else if (powerup.powerupType === 'shield') powerup.setTint(0xffaa00);
        else if (powerup.powerupType === 'bomb') powerup.setTint(0xff007f);
        
        // Floating path wobble logic
        this.tweens.add({
            targets: powerup,
            x: x + 40,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    collectPowerup(player, powerup) {
        let type = powerup.powerupType;
        powerup.destroy();

        synth.playPowerup();
        
        // Neon splash effect on collection
        let splashColor = powerup.tintTopLeft;
        let splash = this.add.particles(this.player.x, this.player.y, 'particle_dot', {
            speed: { min: 80, max: 200 },
            scale: { start: 0.6, end: 0 },
            alpha: { start: 1, end: 0 },
            tint: splashColor,
            lifespan: 300,
            blendMode: 'ADD'
        });
        splash.explode(15);
        this.time.delayedCall(300, () => splash.destroy());

        if (type === 'spread') {
            this.powerupSpread = true;
            this.shootCooldown = 110; // rapid fire rate
            this.spawnFloatingText(this.player.x, this.player.y - 40, 'LASER PENYEBARAN!', '#00f0ff');
            document.getElementById('fireRateInfo').textContent = 'Laser: SPREAD (RAPID)';
            document.getElementById('fireRateInfo').style.color = '#00f0ff';
            
            // Clear previous spread timers
            if (this.powerupSpreadTimer) this.powerupSpreadTimer.destroy();
            this.powerupSpreadTimer = this.time.delayedCall(9000, () => { // Increased duration from 7s to 9s
                this.powerupSpread = false;
                this.shootCooldown = 180; // Reset to easier 180ms cooldown
                document.getElementById('fireRateInfo').textContent = 'Laser: Normal';
                document.getElementById('fireRateInfo').style.color = '#ffaa00';
            });
        } else if (type === 'shield') {
            this.shieldActive = true;
            this.shieldHits = 2; // absorb 2 hits for easier difficulty
            this.spawnFloatingText(this.player.x, this.player.y - 40, 'PERISAI LAYERS AKTIF!', '#ffaa00');
        } else if (type === 'bomb') {
            // Trigger screen clearing shockwave explosion
            this.bombActive = true;
            this.bombRadius = 0;
            this.bombX = this.player.x;
            this.bombY = this.player.y;
            this.spawnFloatingText(this.player.x, this.player.y - 40, 'BOM SHOCKWAVE!', '#ff007f');
            this.cameras.main.flash(400, 255, 0, 127);
            synth.playExplosion();
        }
    }

    hitPlayer(player, enemy) {
        if (this.isInvulnerable || !this.gameActive) return;

        let enemyType = enemy.enemyType;
        enemy.destroy();

        if (this.shieldActive) {
            this.shieldHits--;
            synth.playShieldHit();
            if (this.shieldHits <= 0) {
                this.shieldActive = false;
                this.spawnFloatingText(this.player.x, this.player.y - 40, 'PERISAI HANCUR!', '#ffaa00');
            } else {
                this.spawnFloatingText(this.player.x, this.player.y - 40, 'PERISAI RETAK!', '#ffaa00');
            }
            this.triggerInvulnerability(1200); // Brief immunity frame on shield hit
            return;
        }

        // Lose 1 live
        this.lives--;
        this.updateUI();
        synth.playHit();
        this.cameras.main.shake(150, 0.008); // Reduced screen shake

        // Red explosion sparks
        let blood = this.add.particles(this.player.x, this.player.y, 'particle_dot', {
            speed: { min: 80, max: 200 },
            scale: { start: 0.5, end: 0 },
            alpha: { start: 1, end: 0 },
            tint: 0xff0000,
            lifespan: 350,
            blendMode: 'ADD'
        });
        blood.explode(15);
        this.time.delayedCall(350, () => blood.destroy());

        if (this.lives <= 0) {
            this.endGame();
        } else {
            // Shield flash invul frames (longer recovery time)
            this.triggerInvulnerability(2500); // 2.5 seconds invulnerability
        }
    }

    triggerInvulnerability(duration) {
        this.isInvulnerable = true;
        this.tweens.add({
            targets: this.player,
            alpha: 0.15,
            duration: 100,
            yoyo: true,
            repeat: Math.floor(duration / 100) - 1,
            onComplete: () => {
                this.player.alpha = 1.0;
                this.isInvulnerable = false;
            }
        });
    }

    checkLevelProgression() {
        let newLevel = Math.floor(this.score / 1500) + 1; // Level up every 1500 points
        if (newLevel > this.level) {
            this.level = newLevel;
            this.updateUI();

            synth.playLevelUp();
            this.cameras.main.flash(300, 0, 240, 255);
            this.spawnFloatingText(480, 270, `LEVEL UP: ${this.level}!`, '#00f0ff', 32);

            // Spawn neon ring bursts
            let ring = this.add.particles(480, 270, 'particle_dot', {
                speed: { min: 100, max: 300 },
                scale: { start: 0.8, end: 0 },
                alpha: { start: 1, end: 0 },
                tint: 0x00f0ff,
                lifespan: 500,
                blendMode: 'ADD'
            });
            ring.explode(35);
            this.time.delayedCall(500, () => ring.destroy());

            // Escalate Spawning difficulty
            this.spawnDelay = Math.max(450, 1600 - (this.level - 1) * 75); // Slower scaling rate
            this.spawnTimerEvent.reset({
                delay: this.spawnDelay,
                callback: this.spawnEnemy,
                callbackScope: this,
                loop: true
            });
        }
    }

    spawnFloatingText(x, y, text, color, fontSize = 16) {
        let floating = this.add.text(x, y, text, {
            fontFamily: 'Orbitron',
            fontSize: `${fontSize}px`,
            fontWeight: '900',
            fill: color
        }).setOrigin(0.5).setShadow(0, 0, 8, color, true);

        this.tweens.add({
            targets: floating,
            y: y - 60,
            alpha: 0,
            duration: 900,
            ease: 'Cubic.easeOut',
            onComplete: () => floating.destroy()
        });
    }

    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('lives').textContent = this.lives;
        document.getElementById('level').textContent = this.level;
    }

    pauseGame() {
        if (!this.gameActive) return;
        this.scene.pause('GameScene');
        this.scene.run('PauseScene');
    }

    resumeGame() {
        this.scene.resume('GameScene');
        this.scene.stop('PauseScene');
        updateDOMButtonStates(true, false);
    }

    resetGame() {
        // Destroy active timers
        if (this.spawnTimerEvent) this.spawnTimerEvent.destroy();
        if (this.powerupSpreadTimer) this.powerupSpreadTimer.destroy();
        
        this.scene.restart();
    }

    endGame() {
        this.gameActive = false;
        this.player.setVelocity(0, 0);
        this.player.setVisible(false);
        this.thrusterParticles.stop();
        
        if (this.spawnTimerEvent) this.spawnTimerEvent.destroy();
        if (this.powerupSpreadTimer) this.powerupSpreadTimer.destroy();

        // Write High Score checks
        let highScore = localStorage.getItem('triangleShooterHighScore') || 0;
        let newRecord = false;
        if (this.score > highScore) {
            localStorage.setItem('triangleShooterHighScore', this.score);
            newRecord = true;
        }

        // Pause physics and run gameover scene overlay
        this.physics.pause();
        this.time.delayedCall(800, () => {
            this.scene.stop('GameScene');
            this.scene.run('GameOverScene', { score: this.score, isNewRecord: newRecord });
        });
    }
}

// ==========================================
// 6. SCENE 4: PAUSE OVERLAY SCENE
// ==========================================
class PauseScene extends Phaser.Scene {
    constructor() {
        super('PauseScene');
    }

    create() {
        // Semitransparent glass backdrop overlay (960x540 bounds)
        this.add.rectangle(480, 270, 960, 540, 0x000000, 0.65);

        this.add.text(480, 230, 'JEDA GAME', {
            fontFamily: 'Orbitron',
            fontSize: '36px',
            fontWeight: '900',
            fill: '#ffaa00',
            letterSpacing: 4
        }).setOrigin(0.5).setShadow(0, 0, 10, '#ffaa00', true);

        this.add.text(480, 290, 'TEKAN P ATAU KLIK TOMBOL "LANJUTKAN" UNTUK KEMBALI BERMAIN', {
            fontFamily: 'Rajdhani',
            fontSize: '18px',
            fontWeight: '700',
            fill: '#ffffff'
        }).setOrigin(0.5);

        // Resume triggers
        this.pKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);
        updateDOMButtonStates(true, true);
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.pKey)) {
            let gameScene = this.scene.get('GameScene');
            gameScene.resumeGame();
        }
    }
}

// ==========================================
// 7. SCENE 5: GAME OVER OVERLAY SCENE
// ==========================================
class GameOverScene extends Phaser.Scene {
    constructor() {
        super('GameOverScene');
    }

    create(data) {
        // Deep background fade overlay (960x540 bounds)
        this.add.rectangle(480, 270, 960, 540, 0x000000, 0.85);

        this.add.text(480, 160, 'GAME OVER', {
            fontFamily: 'Orbitron',
            fontSize: '52px',
            fontWeight: '900',
            fill: '#ff0055',
            letterSpacing: 4
        }).setOrigin(0.5).setShadow(0, 0, 15, '#ff0055', true);

        this.add.text(480, 235, `SKOR ANDA: ${data.score}`, {
            fontFamily: 'Orbitron',
            fontSize: '24px',
            fontWeight: '800',
            fill: '#39ff14'
        }).setOrigin(0.5).setShadow(0, 0, 8, '#39ff14', true);

        if (data.isNewRecord) {
            let recordText = this.add.text(480, 285, 'REKOR BARU TERCIPTA!', {
                fontFamily: 'Orbitron',
                fontSize: '18px',
                fontWeight: '900',
                fill: '#ffaa00'
            }).setOrigin(0.5);

            this.tweens.add({
                targets: recordText,
                scale: 1.2,
                duration: 600,
                yoyo: true,
                repeat: -1
            });
        } else {
            let highScore = localStorage.getItem('triangleShooterHighScore') || 0;
            this.add.text(480, 285, `REKOR TERTINGGI: ${highScore}`, {
                fontFamily: 'Orbitron',
                fontSize: '16px',
                fontWeight: '700',
                fill: '#8a9ab0'
            }).setOrigin(0.5);
        }

        let restartPrompt = this.add.text(480, 370, 'TEKAN SPASI ATAU KLIK TOMBOL "ULANGI" UNTUK BERMAIN KEMBALI', {
            fontFamily: 'Rajdhani',
            fontSize: '18px',
            fontWeight: '700',
            fill: '#00f0ff'
        }).setOrigin(0.5);

        this.tweens.add({
            targets: restartPrompt,
            alpha: 0.4,
            duration: 800,
            yoyo: true,
            repeat: -1
        });

        this.input.keyboard.on('keydown-SPACE', () => this.restartGame());
        
        updateDOMButtonStates(false, false);
    }

    restartGame() {
        this.scene.start('GameScene');
    }
}

// ==========================================
// 8. BRIDGING PHASER GAME CONTEXT TO DOM UI
// ==========================================
const config = {
    type: Phaser.AUTO,
    width: 960,
    height: 540,
    parent: 'game-parent',
    backgroundColor: '#03030f',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [BootScene, MenuScene, GameScene, PauseScene, GameOverScene]
};

// Initialize Phaser Engine instance
const game = new Phaser.Game(config);

// UI DOM Button State Controller
function updateDOMButtonStates(isRunning, isPaused) {
    let startBtn = document.getElementById('startButton');
    let pauseBtn = document.getElementById('pauseButton');
    
    if (!isRunning) {
        startBtn.innerHTML = '<i class="fas fa-play"></i> Mulai Game';
        pauseBtn.disabled = true;
    } else {
        if (isPaused) {
            startBtn.innerHTML = '<i class="fas fa-play"></i> Lanjutkan';
            pauseBtn.innerHTML = '<i class="fas fa-play"></i> Lanjutkan';
        } else {
            startBtn.innerHTML = '<i class="fas fa-play"></i> Sedang Bermain';
            pauseBtn.innerHTML = '<i class="fas fa-pause"></i> Jeda';
            pauseBtn.disabled = false;
        }
    }
}

// Bind HTML Click Events to Phaser Actions
document.getElementById('startButton').addEventListener('click', () => {
    let menuScene = game.scene.getScene('MenuScene');
    let gameScene = game.scene.getScene('GameScene');
    let pauseScene = game.scene.getScene('PauseScene');
    let gameOverScene = game.scene.getScene('GameOverScene');

    if (menuScene.scene.isActive()) {
        menuScene.startGame();
    } else if (pauseScene.scene.isActive()) {
        gameScene.resumeGame();
    } else if (gameOverScene.scene.isActive()) {
        gameOverScene.restartGame();
    }
});

document.getElementById('pauseButton').addEventListener('click', () => {
    let gameScene = game.scene.getScene('GameScene');
    let pauseScene = game.scene.getScene('PauseScene');

    if (gameScene.scene.isActive()) {
        gameScene.pauseGame();
    } else if (pauseScene.scene.isActive()) {
        gameScene.resumeGame();
    }
});

document.getElementById('resetButton').addEventListener('click', () => {
    let gameScene = game.scene.getScene('GameScene');
    let menuScene = game.scene.getScene('MenuScene');
    let pauseScene = game.scene.getScene('PauseScene');
    let gameOverScene = game.scene.getScene('GameOverScene');

    if (gameScene.scene.isActive()) {
        gameScene.resetGame();
    } else if (pauseScene.scene.isActive()) {
        gameScene.resumeGame();
        gameScene.resetGame();
    } else if (gameOverScene.scene.isActive()) {
        gameOverScene.restartGame();
    } else if (menuScene.scene.isActive()) {
        menuScene.startGame();
    }
});

// ==========================================
// 9. MOBILE TOUCH CONTROL PANEL BINDINGS
// ==========================================
window.mobileControls = { up: false, left: false, right: false, down: false, shoot: false };

function bindMobileButton(btnId, controlKey) {
    let btn = document.getElementById(btnId);
    if (!btn) return;
    
    const setControl = (val) => {
        window.mobileControls[controlKey] = val;
    };
    
    btn.addEventListener('mousedown', () => setControl(true));
    btn.addEventListener('mouseup', () => setControl(false));
    btn.addEventListener('mouseleave', () => setControl(false));
    
    btn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        setControl(true);
        synth.init(); // Initialize audio context on first mobile screen interactions
    }, { passive: false });
    
    btn.addEventListener('touchend', (e) => {
        e.preventDefault();
        setControl(false);
    }, { passive: false });
}

bindMobileButton('upBtn', 'up');
bindMobileButton('leftBtn', 'left');
bindMobileButton('rightBtn', 'right');
bindMobileButton('downBtn', 'down');
bindMobileButton('shootBtn', 'shoot');
