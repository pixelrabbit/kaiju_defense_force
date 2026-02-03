import { Assets, Container, Ticker, Graphics } from 'pixi.js';
import { Player } from './player';
import { HUD } from './hud';

export class GameStage extends Container {
  private player!: Player;  //TODO: understand exclamation point
  private hud: HUD;
  private readonly screenWidth: number;
  private readonly screenHeight: number;

  constructor(screenWidth: number, screenHeight: number) {
    super();
    this.screenWidth = screenWidth;
    this.screenHeight = screenHeight;

    this.hud = new HUD();
    this.addChild(this.hud);
  }

  public async setup(): Promise<void> {
    // Load the bunny player
    const texture = await Assets.load('https://pixijs.com/assets/bunny.png');
    this.player = new Player(texture);

    // Setup player properties
    this.player.x = this.screenWidth / 2;
    this.player.y = this.screenHeight / 2;
    this.addChild(this.player);

    this.createObstacles();
  }

  private obstacles: Graphics[] = [];

  private createObstacles(): void {
    const obstacleData = [
      { x: 200, y: 200, w: 100, h: 100 },
      { x: 800, y: 150, w: 50, h: 300 },
      { x: 500, y: 500, w: 200, h: 40 },
      { x: 900, y: 600, w: 120, h: 120 },
    ];

    obstacleData.forEach(data => {
      const obstacle = new Graphics()
        .rect(0, 0, data.w, data.h)
        .stroke({ width: 4, color: 0x000000 })


      obstacle.x = data.x;
      obstacle.y = data.y;

      this.obstacles.push(obstacle);
      this.addChild(obstacle);
    });

  }



  public update(ticker: Ticker): void {
    this.player?.update(ticker, this.screenWidth, this.screenHeight, this.obstacles);
  }
}
