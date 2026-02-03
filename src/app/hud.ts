import { Container, Graphics, Text, TextStyle } from 'pixi.js';

export class HUD extends Container {
  constructor() {
    super();

    const background = new Graphics().rect(16, 16, 240, 80).fill({ color: 0x111111 });;
    this.addChild(background);

    // Add "bunny" text
    const style = new TextStyle({
      fill: '#ffffff',
      fontSize: 18,
      fontWeight: 'bold',
    });
    const name = new Text({ text: 'wabbit', style });
    name.x = 0;
    name.y = 0;
    name.origin.set(0);
    background.addChild(name);

    // Add 4 red squares in a row
    const squareSize = 16;
    const spacing = 8;
    const startX = 0;

    for (let i = 0; i < 4; i++) {
      const square = new Graphics().rect(startX + (squareSize + spacing) * i, 24, squareSize, squareSize).fill({ color: 0xff0000 });
      background.addChild(square);
    }
  }
}
