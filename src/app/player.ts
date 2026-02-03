import { Container, Graphics, Sprite, Texture, Ticker } from 'pixi.js';
import { Bullet } from './bullet';
import { player } from './variables';

export class Player extends Container {
  private speed = 3;
  private keys: Record<string, boolean> = {};
  private reticle: Graphics;
  private mousePos = { x: 0, y: 0 };
  private readonly RETICLE_RADIUS = 300;
  private bullets: Bullet[] = [];
  private lastFired = 0;
  private fireRate = 150; // milliseconds
  private fireInterval: ReturnType<typeof setInterval> | null = null;
  private playerSprite: Sprite;


  constructor(texture: Texture) {
    super();

    const hitbox = new Graphics();
    hitbox.rect(-texture.width / 2, -texture.height / 2, texture.width, texture.height).stroke({ width: 4, color: player.hitbox });
    this.addChild(hitbox);

    this.playerSprite = new Sprite(texture);
    this.playerSprite.anchor.set(0.5);
    this.addChild(this.playerSprite);

    // Create reticle
    this.reticle = new Graphics().circle(0, 0, 12).fill({ color: player.reticle, alpha: 0.7 }).circle(0, 0, 10).cut();
    this.addChild(this.reticle);
    window.addEventListener('keydown', (e) => { this.keys[e.code] = true; });
    window.addEventListener('keyup', (e) => { this.keys[e.code] = false; });
    window.addEventListener('mousemove', (e) => {
      this.mousePos.x = e.clientX;
      this.mousePos.y = e.clientY;
    });
    window.addEventListener('mousedown', (e) => {
      if (e.button === 0) {
        this.fireInterval = setInterval(() => {
          this.fire();
        }, this.fireRate);
      }
    });
    window.addEventListener('mouseup', (e) => {
      if (e.button === 0) {
        if (this.fireInterval) {
          clearInterval(this.fireInterval);
          this.fireInterval = null;
        }
      }
    });

  }

  private fire() {
    const now = Date.now();
    if (now - this.lastFired < this.fireRate) return;

    const dx = this.mousePos.x - this.x;
    const dy = this.mousePos.y - this.y;
    const angle = Math.atan2(dy, dx);

    const bullet = new Bullet(this.x, this.y, angle);
    this.lastFired = now;
    this.bullets.push(bullet);
    this.parent?.addChild(bullet);
  }

  private updateReticle() {
    const dx = this.mousePos.x - this.x;
    const dy = this.mousePos.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    const angle = Math.atan2(dy, dx);
    const constrainedDist = Math.min(distance, this.RETICLE_RADIUS);

    this.reticle.x = Math.cos(angle) * constrainedDist;
    this.reticle.y = Math.sin(angle) * constrainedDist;
  }

  private isColliding(obstacles: Graphics[]): boolean {
    const playerBounds = this.playerSprite.getBounds();
    for (const obstacle of obstacles) {
      const obstacleBounds = obstacle.getBounds();

      if (playerBounds.x < obstacleBounds.x + obstacleBounds.width &&
        playerBounds.x + playerBounds.width > obstacleBounds.x &&
        playerBounds.y < obstacleBounds.y + obstacleBounds.height &&
        playerBounds.y + playerBounds.height > obstacleBounds.y) {
        return true;
      }
    }
    return false;
  }

  public update(ticker: Ticker, screenWidth: number, screenHeight: number, obstacles: Graphics[]) {
    const dt = ticker.deltaTime;
    const oldX = this.x;
    const oldY = this.y;

    if (this.keys['ArrowLeft'] || this.keys['KeyA']) this.x -= this.speed * dt;
    if (this.keys['ArrowRight'] || this.keys['KeyD']) this.x += this.speed * dt;

    if (this.isColliding(obstacles)) {
      this.x = oldX;
    }

    if (this.keys['ArrowUp'] || this.keys['KeyW']) this.y -= this.speed * dt;
    if (this.keys['ArrowDown'] || this.keys['KeyS']) this.y += this.speed * dt;

    if (this.isColliding(obstacles)) {
      this.y = oldY;
    }

    // Keep player within bounds
    const playerWidth = this.playerSprite.width;
    const playerHeight = this.playerSprite.height;

    this.x = Math.max(playerWidth / 2, Math.min(screenWidth - playerWidth / 2, this.x));
    this.y = Math.max(playerHeight / 2, Math.min(screenHeight - playerHeight / 2, this.y));

    this.updateReticle();

    // Update bullets
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const bullet = this.bullets[i];
      bullet.update(dt);
      if (bullet.isOutOfBounds(screenWidth, screenHeight) || bullet.isColliding(obstacles)) {
        this.parent?.removeChild(bullet);
        this.bullets.splice(i, 1);
      }
    }
  }
}
