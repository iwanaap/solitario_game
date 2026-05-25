import Phaser from 'phaser'

export class UIScene extends Phaser.Scene {
  private hintText?: Phaser.GameObjects.Text

  constructor() {
    super('UIScene')
  }

  create(): void {
    this.hintText = this.add
      .text(350, 36, 'Selecciona una ficha amarilla', {
        fontFamily: 'Trebuchet MS, Arial, sans-serif',
        fontSize: '20px',
        color: '#f8fafc',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)

    this.game.events.on('ui:set-hint', this.updateHint, this)
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.game.events.off('ui:set-hint', this.updateHint, this)
    })
  }

  private updateHint(message: string): void {
    this.hintText?.setText(message)
  }
}
