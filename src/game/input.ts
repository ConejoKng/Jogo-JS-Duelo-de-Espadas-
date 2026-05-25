class InputManager {
  private keys: Set<string> = new Set();
  private mouseButtons: Set<number> = new Set();

  constructor() {
    window.addEventListener('keydown', (e) => this.keys.add(e.code));
    window.addEventListener('keyup', (e) => this.keys.delete(e.code));
    window.addEventListener('mousedown', (e) => this.mouseButtons.add(e.button));
    window.addEventListener('mouseup', (e) => this.mouseButtons.delete(e.button));
    // Prevent context menu on right click to allow Player 2 to use it
    window.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  isKeyDown(code: string): boolean {
    return this.keys.has(code);
  }

  isMouseDown(button: number): boolean {
    return this.mouseButtons.has(button);
  }

  // Helper to get player inputs
  getPlayerInputs(playerId: 1 | 2) {
    if (playerId === 1) {
      return {
        up: this.isKeyDown('KeyW'),
        left: this.isKeyDown('KeyA'),
        right: this.isKeyDown('KeyD'),
        down: this.isKeyDown('KeyS'),
        attack: this.isKeyDown('KeyE'),
        defend: this.isKeyDown('KeyQ'),
        special: this.isKeyDown('Space'),
      };
    } else {
      return {
        up: this.isKeyDown('ArrowUp'),
        left: this.isKeyDown('ArrowLeft'),
        right: this.isKeyDown('ArrowRight'),
        down: this.isKeyDown('ArrowDown'),
        attack: this.isMouseDown(0), // Left click
        defend: this.isMouseDown(2), // Right click
        special: this.isMouseDown(1), // Middle click
      };
    }
  }
}

export const inputManager = new InputManager();
