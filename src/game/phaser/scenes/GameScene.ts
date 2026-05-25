import Phaser from 'phaser'
import { createInitialGameState, playMove } from '../../core/gameState'
import { getValidMovesForPiece } from '../../core/moves'
import { getMoveScore, getScoreLabel, isPerfectResult } from '../../core/scoring'
import type { Board, GameProgress, GameResult, Move, Position } from '../../types/game.types'

interface SceneCallbacks {
  onStateChange: (progress: GameProgress) => void
  onGameOver: (result: GameResult) => void
}

interface CellView {
  slotShadow: Phaser.GameObjects.Ellipse
  slotRim: Phaser.GameObjects.Arc
  slotCore: Phaser.GameObjects.Arc
  pieceShadow: Phaser.GameObjects.Ellipse
  pieceBase: Phaser.GameObjects.Arc
  pieceInner: Phaser.GameObjects.Arc
  pieceShine: Phaser.GameObjects.Arc
  highlight: Phaser.GameObjects.Arc
  zone: Phaser.GameObjects.Zone
}

const CELL_SIZE = 78
const BOARD_OFFSET_X = 116
const BOARD_OFFSET_Y = 116

export class GameScene extends Phaser.Scene {
  private readonly callbacks: SceneCallbacks

  private state = createInitialGameState()
  private selectedPosition: Position | null = null
  private selectedMoves: Move[] = []
  private cellViews = new Map<string, CellView>()
  private isAnimating = false
  private audioContext: AudioContext | null = null

  constructor(callbacks: SceneCallbacks) {
    super('GameScene')
    this.callbacks = callbacks
  }

  create(): void {
    this.state = createInitialGameState()
    this.selectedPosition = null
    this.selectedMoves = []
    this.cellViews.clear()
    this.isAnimating = false

    this.drawBackground()
    this.createBoardObjects(this.state.board)
    this.syncBoardVisuals()
    this.emitState()
    this.game.events.emit('ui:set-hint', 'Selecciona una ficha amarilla')
  }

  private drawBackground(): void {
    this.cameras.main.setBackgroundColor('#09111f')

    const glow = this.add.graphics()
    glow.fillStyle(0x60a5fa, 0.08)
    glow.fillCircle(350, 350, 300)

    const board = this.add.graphics()
    board.fillStyle(0x2563eb, 1)
    board.lineStyle(10, 0xbfe4ff, 0.38)
    board.fillRoundedRect(52, 52, 596, 596, 42)
    board.strokeRoundedRect(52, 52, 596, 596, 42)

    board.fillStyle(0x1d4ed8, 1)
    board.fillRoundedRect(72, 72, 556, 556, 34)

    board.lineStyle(4, 0x93c5fd, 0.22)
    board.strokeRoundedRect(84, 84, 532, 532, 28)

    board.fillStyle(0xffffff, 0.07)
    board.fillRoundedRect(82, 82, 536, 96, 28)

    this.add.ellipse(350, 610, 420, 38, 0x020617, 0.26)

    this.createBoardScrews()
  }

  private createBoardScrews(): void {
    const positions = [
      [92, 92],
      [608, 92],
      [92, 608],
      [608, 608],
    ] as const

    positions.forEach(([x, y]) => {
      this.add.circle(x, y, 8, 0xcbd5e1, 0.9).setStrokeStyle(2, 0xf8fafc, 0.5)
      this.add.rectangle(x, y, 10, 2, 0x64748b, 0.8)
      this.add.rectangle(x, y, 2, 10, 0x64748b, 0.8)
    })
  }

  private createBoardObjects(board: Board): void {
    board.flat().forEach((cell) => {
      if (!cell.valid) {
        return
      }

      const x = BOARD_OFFSET_X + cell.col * CELL_SIZE
      const y = BOARD_OFFSET_Y + cell.row * CELL_SIZE
      const key = this.getCellKey(cell)

      const slotShadow = this.add.ellipse(x, y + 4, 58, 54, 0x020617, 0.34)
      const slotRim = this.add.circle(x, y, 29, 0x60a5fa, 0.3)
      slotRim.setStrokeStyle(3, 0xcffafe, 0.22)

      const slotCore = this.add.circle(x, y + 1, 24, 0x082f6b, 1)
      slotCore.setStrokeStyle(4, 0x0f3c90, 1)

      const highlight = this.add.circle(x, y, 31, 0x4ade80, 0.18)
      highlight.setStrokeStyle(5, 0xbbf7d0, 0.96)
      highlight.setVisible(false)

      const pieceShadow = this.add.ellipse(x, y + 8, 44, 18, 0x713f12, 0.24)
      const pieceBase = this.add.circle(x, y, 24, 0xeab308, 1)
      pieceBase.setStrokeStyle(4, 0xfef08a, 0.95)

      const pieceInner = this.add.circle(x, y - 1, 18, 0xfacc15, 1)
      pieceInner.setStrokeStyle(2, 0xfde68a, 0.6)

      const pieceShine = this.add.circle(x - 8, y - 10, 6, 0xfffbeb, 0.55)

      const zone = this.add.zone(x, y, 60, 60).setInteractive({ useHandCursor: true })
      zone.on('pointerdown', () => {
        this.handleCellClick({ row: cell.row, col: cell.col })
      })

      this.cellViews.set(key, {
        slotShadow,
        slotRim,
        slotCore,
        pieceShadow,
        pieceBase,
        pieceInner,
        pieceShine,
        highlight,
        zone,
      })
    })
  }

  private handleCellClick(position: Position): void {
    if (this.isAnimating) {
      return
    }

    const matchingMove = this.selectedMoves.find(
      (move) => move.to.row === position.row && move.to.col === position.col,
    )

    if (matchingMove) {
      this.animateMove(matchingMove)
      return
    }

    const moves = getValidMovesForPiece(this.state.board, position)

    if (moves.length === 0) {
      this.selectedPosition = null
      this.selectedMoves = []
      this.syncBoardVisuals()
      this.playRetroTone(180, 0.06, 'sine', 0.018)
      this.game.events.emit('ui:set-hint', 'Esa ficha no tiene movimientos válidos')
      return
    }

    this.selectedPosition = position
    this.selectedMoves = moves
    this.syncBoardVisuals()
    this.playRetroTone(420, 0.07, 'triangle', 0.02)
    this.vibrate([10])
    this.game.events.emit('ui:set-hint', 'Toca un círculo verde para saltar')
  }

  private syncBoardVisuals(): void {
    this.state.board.flat().forEach((cell) => {
      if (!cell.valid) {
        return
      }

      const view = this.cellViews.get(this.getCellKey(cell))

      if (!view) {
        return
      }

      this.resetPiecePosition(view)
      this.setPieceAlpha(view, 1)

      const isSelected =
        this.selectedPosition?.row === cell.row && this.selectedPosition.col === cell.col
      const isTarget = this.selectedMoves.some(
        (move) => move.to.row === cell.row && move.to.col === cell.col,
      )

      view.highlight.setVisible(isTarget)
      view.slotRim.setFillStyle(isTarget ? 0x4ade80 : 0x60a5fa, isTarget ? 0.4 : 0.3)
      view.slotCore.setFillStyle(isSelected ? 0x0f4ab8 : 0x082f6b, 1)
      view.slotCore.setStrokeStyle(4, isSelected ? 0x93c5fd : 0x0f3c90, 1)

      view.pieceShadow.setVisible(cell.hasPiece)
      view.pieceBase.setVisible(cell.hasPiece)
      view.pieceInner.setVisible(cell.hasPiece)
      view.pieceShine.setVisible(cell.hasPiece)

      if (cell.hasPiece) {
        view.pieceBase.setScale(isSelected ? 1.1 : 1)
        view.pieceInner.setScale(isSelected ? 1.1 : 1)
        view.pieceShine.setScale(isSelected ? 1.1 : 1)
        view.pieceShadow.setScale(isSelected ? 1.08 : 1)
        view.pieceBase.setFillStyle(isSelected ? 0xf59e0b : 0xeab308, 1)
        view.pieceInner.setFillStyle(isSelected ? 0xfcd34d : 0xfacc15, 1)
      }
    })
  }

  private animateMove(move: Move): void {
    const playedAt = Date.now()
    const elapsedMs = this.state.lastMoveAt === null ? null : playedAt - this.state.lastMoveAt
    const nextStreak = elapsedMs !== null && elapsedMs <= 5000 ? this.state.streak + 1 : 1
    const awardedPoints = getMoveScore(this.state.remainingPieces - 1, elapsedMs, nextStreak)
    const fromView = this.cellViews.get(this.getCellKey(move.from))
    const overView = this.cellViews.get(this.getCellKey(move.over))
    const toView = this.cellViews.get(this.getCellKey(move.to))

    if (!fromView || !overView || !toView) {
      this.finishMove(move, playedAt)
      return
    }

    this.isAnimating = true
    this.selectedPosition = null
    this.selectedMoves = []
    this.syncBoardVisuals()
    this.playMoveSound()
    this.vibrate([18, 32, 18])
    this.showMoveCelebration(move, awardedPoints, nextStreak)

    const startX = fromView.pieceBase.x
    const startY = fromView.pieceBase.y
    const endX = toView.slotCore.x
    const endY = toView.slotCore.y

    this.tweens.addCounter({
      from: 0,
      to: 1,
      duration: 240,
      ease: 'Sine.easeInOut',
      onUpdate: (tween) => {
        const progress = tween.getValue() ?? 0
        const x = Phaser.Math.Linear(startX, endX, progress)
        const y = Phaser.Math.Linear(startY, endY, progress) - Math.sin(Math.PI * progress) * 26

        fromView.pieceBase.setPosition(x, y)
        fromView.pieceInner.setPosition(x, y - 1)
        fromView.pieceShine.setPosition(x - 8, y - 10)
        fromView.pieceShadow.setPosition(x, Phaser.Math.Linear(startY + 8, endY + 8, progress))
        fromView.pieceShadow.setScale(1 - progress * 0.15, 1 - progress * 0.25)
      },
      onComplete: () => {
        this.finishMove(move, playedAt)
      },
    })

    this.time.delayedCall(95, () => {
      this.setPieceAlpha(overView, 0.18)
      this.playRetroTone(220, 0.05, 'square', 0.016)
    })
  }

  private finishMove(move: Move, playedAt: number): void {
    this.state = playMove(this.state, move, playedAt)
    this.isAnimating = false
    this.syncBoardVisuals()
    this.emitState()

    if (this.state.isGameOver) {
      const result: GameResult = {
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        remainingPieces: this.state.remainingPieces,
        moves: this.state.moveCount,
        score: this.state.score,
        evaluation: getScoreLabel(this.state.remainingPieces),
        perfect: isPerfectResult(this.state.board),
      }

      this.game.events.emit('ui:set-hint', 'Partida terminada')
      this.playGameOverSound(result.perfect)
      this.vibrate(result.perfect ? [60, 40, 80] : [35, 30, 35])
      this.callbacks.onGameOver(result)
      return
    }

    this.game.events.emit('ui:set-hint', 'Buen salto. Elige otra ficha')
  }

  private resetPiecePosition(view: CellView): void {
    const x = view.slotCore.x
    const y = view.slotCore.y - 1

    view.pieceBase.setPosition(view.slotCore.x, view.slotCore.y)
    view.pieceInner.setPosition(x, y)
    view.pieceShine.setPosition(view.slotCore.x - 8, view.slotCore.y - 10)
    view.pieceShadow.setPosition(view.slotCore.x, view.slotCore.y + 8)
    view.pieceShadow.setScale(1)
  }

  private setPieceAlpha(view: CellView, alpha: number): void {
    view.pieceShadow.setAlpha(alpha)
    view.pieceBase.setAlpha(alpha)
    view.pieceInner.setAlpha(alpha)
    view.pieceShine.setAlpha(alpha)
  }

  private playMoveSound(): void {
    this.playRetroTone(392, 0.05, 'triangle', 0.022)
    this.time.delayedCall(65, () => this.playRetroTone(523.25, 0.07, 'triangle', 0.02))
  }

  private playGameOverSound(perfect: boolean): void {
    if (perfect) {
      this.playRetroTone(523.25, 0.08, 'triangle', 0.026)
      this.time.delayedCall(90, () => this.playRetroTone(659.25, 0.08, 'triangle', 0.024))
      this.time.delayedCall(180, () => this.playRetroTone(783.99, 0.12, 'triangle', 0.028))
      return
    }

    this.playRetroTone(329.63, 0.08, 'triangle', 0.024)
    this.time.delayedCall(100, () => this.playRetroTone(392, 0.1, 'triangle', 0.024))
  }

  private showMoveCelebration(move: Move, points: number, streak: number): void {
    const messages = ['¡Wow!', '🔥', '✨', '👏', '💥', '😮']
    const x = BOARD_OFFSET_X + move.to.col * CELL_SIZE
    const y = BOARD_OFFSET_Y + move.to.row * CELL_SIZE - 34
    const message = messages[Math.floor(Math.random() * messages.length)]

    const suffix = streak > 1 ? ` · Racha x${streak}` : ''

    const text = this.add
      .text(x, y, `${message} +${points}${suffix}`, {
        fontFamily: 'Trebuchet MS, Arial, sans-serif',
        fontSize: '22px',
        fontStyle: 'bold',
        color: '#fef08a',
        stroke: '#713f12',
        strokeThickness: 5,
      })
      .setOrigin(0.5)

    this.tweens.add({
      targets: text,
      y: y - 54,
      alpha: 0,
      scale: 1.18,
      duration: 620,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        text.destroy()
      },
    })
  }

  private playRetroTone(
    frequency: number,
    duration: number,
    type: OscillatorType,
    volume: number,
  ): void {
    const AudioContextCtor = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext

    if (!AudioContextCtor) {
      return
    }

    this.audioContext ??= new AudioContextCtor()

    if (this.audioContext.state === 'suspended') {
      void this.audioContext.resume()
    }

    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()
    const now = this.audioContext.currentTime

    oscillator.type = type
    oscillator.frequency.setValueAtTime(frequency, now)
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(80, frequency * 0.92), now + duration)

    gainNode.gain.setValueAtTime(0.0001, now)
    gainNode.gain.exponentialRampToValueAtTime(volume, now + 0.01)
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration)

    oscillator.connect(gainNode)
    gainNode.connect(this.audioContext.destination)

    oscillator.start(now)
    oscillator.stop(now + duration)
  }

  private vibrate(pattern: number | number[]): void {
    try {
      if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
        navigator.vibrate(pattern)
      }
    } catch {
      // Algunos navegadores o webviews fallan con vibrate; lo ignoramos.
    }
  }

  private emitState(): void {
    this.callbacks.onStateChange({
      board: this.state.board,
      moveCount: this.state.moveCount,
      remainingPieces: this.state.remainingPieces,
      score: this.state.score,
      streak: this.state.streak,
      lastMoveScore: this.state.lastMoveScore,
    })
  }

  private getCellKey(position: Position): string {
    return `${position.row}-${position.col}`
  }
}
