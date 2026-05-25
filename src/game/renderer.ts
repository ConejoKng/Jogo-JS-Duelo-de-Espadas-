import { GameState, Player, PlayerState, MapType } from '../types';

const CANVAS_WIDTH = 1000;
const CANVAS_HEIGHT = 600;
const GROUND_Y = 500;

export class Renderer {
  private ctx: CanvasRenderingContext2D;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  draw(state: GameState) {
    const { ctx } = this;

    ctx.save();
    
    // Screen shake
    if (state.screenShake > 0) {
      const dx = (Math.random() - 0.5) * state.screenShake;
      const dy = (Math.random() - 0.5) * state.screenShake;
      ctx.translate(dx, dy);
    }

    // Background
    this.drawBackground(state.currentMap);

    // Players
    state.players.forEach((player) => {
      this.drawPlayer(player);
    });

    // Projectiles
    this.drawProjectiles(state.projectiles);

    // Particles
    this.drawParticles(state.particles);

    ctx.restore();
  }

  private drawBackground(mapType: MapType) {
    const { ctx } = this;
    
    switch (mapType) {
      case MapType.DOJO:
        this.drawDojo();
        break;
      case MapType.NIGHT_CITY:
        this.drawNightCity();
        break;
      case MapType.FOREST:
        this.drawForest();
        break;
      case MapType.VOLCANO:
        this.drawVolcano();
        break;
      default:
        this.drawDojo();
    }
  }

  private drawDojo() {
    const { ctx } = this;
    // Sky - Warm Dojo Interior
    const skyGradient = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
    skyGradient.addColorStop(0, '#451a03'); // amber-950
    skyGradient.addColorStop(1, '#78350f'); // amber-900
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Shoji Walls (Paper screens)
    ctx.fillStyle = '#fef3c7'; // amber-50
    for (let i = 0; i < 5; i++) {
      const x = i * 200 + 20;
      ctx.fillRect(x, 100, 160, GROUND_Y - 100);
      // Grids
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 2;
      for (let gy = 100; gy < GROUND_Y; gy += 40) {
        ctx.beginPath();
        ctx.moveTo(x, gy);
        ctx.lineTo(x + 160, gy);
        ctx.stroke();
      }
      for (let gx = x; gx <= x + 160; gx += 40) {
        ctx.beginPath();
        ctx.moveTo(gx, 100);
        ctx.lineTo(gx, GROUND_Y);
        ctx.stroke();
      }
    }

    // Ground - Wood Floor
    ctx.fillStyle = '#92400e'; // amber-800
    ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, CANVAS_HEIGHT - GROUND_Y);
    // Wood planks
    ctx.strokeStyle = '#78350f';
    for (let i = 0; i < CANVAS_WIDTH; i += 40) {
      ctx.beginPath();
      ctx.moveTo(i, GROUND_Y);
      ctx.lineTo(i, CANVAS_HEIGHT);
      ctx.stroke();
    }
  }

  private drawNightCity() {
    const { ctx } = this;
    // Sky - Deep Night
    const skyGradient = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
    skyGradient.addColorStop(0, '#020617'); // slate-950
    skyGradient.addColorStop(1, '#0f172a'); // slate-900
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Skyscrapers
    ctx.fillStyle = '#1e293b';
    for (let i = 0; i < 8; i++) {
      // Use deterministic values based on index
      const h = 200 + ((i * 73) % 200);
      const w = 80 + ((i * 37) % 40);
      const x = i * 130;
      ctx.fillRect(x, GROUND_Y - h, w, h);
      // Windows
      for (let wy = GROUND_Y - h + 20; wy < GROUND_Y - 20; wy += 30) {
        for (let wx = x + 10; wx < x + w - 10; wx += 20) {
          const winSeed = (wy * 13 + wx * 7 + i * 3) % 100;
          if (winSeed > 70) {
            ctx.fillStyle = '#fde047';
            ctx.fillRect(wx, wy, 10, 15);
          }
        }
      }
      ctx.fillStyle = '#1e293b';
    }

    // Ground - Asphalt
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, CANVAS_HEIGHT - GROUND_Y);
    // Neon lines
    ctx.strokeStyle = '#ec4899'; // pink-500
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y + 5);
    ctx.lineTo(CANVAS_WIDTH, GROUND_Y + 5);
    ctx.stroke();
  }

  private drawForest() {
    const { ctx } = this;
    // Sky - Bright Day
    const skyGradient = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
    skyGradient.addColorStop(0, '#7dd3fc'); // sky-300
    skyGradient.addColorStop(1, '#bae6fd'); // sky-200
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Trees
    for (let i = 0; i < 6; i++) {
      const x = i * 180 + 50;
      // Trunk
      ctx.fillStyle = '#713f12';
      ctx.fillRect(x, GROUND_Y - 100, 30, 100);
      // Leaves
      ctx.fillStyle = '#166534';
      ctx.beginPath();
      ctx.arc(x + 15, GROUND_Y - 120, 60, 0, Math.PI * 2);
      ctx.fill();
    }

    // Ground - Grass
    ctx.fillStyle = '#15803d'; // green-700
    ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, CANVAS_HEIGHT - GROUND_Y);
    // Grass detail
    ctx.strokeStyle = '#166534';
    for (let i = 0; i < 100; i++) {
      const gx = (i * 123.45) % CANVAS_WIDTH;
      const gy = GROUND_Y + (i * 67.89) % (CANVAS_HEIGHT - GROUND_Y);
      ctx.beginPath();
      ctx.moveTo(gx, gy);
      ctx.lineTo(gx + 2, gy - 5);
      ctx.stroke();
    }
  }

  private drawVolcano() {
    const { ctx } = this;
    // Sky - Fiery
    const skyGradient = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
    skyGradient.addColorStop(0, '#450a0a'); // red-950
    skyGradient.addColorStop(1, '#7f1d1d'); // red-900
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Volcanic Peaks
    ctx.fillStyle = '#171717';
    for (let i = 0; i < 3; i++) {
      const x = i * 350;
      ctx.beginPath();
      ctx.moveTo(x, GROUND_Y);
      ctx.lineTo(x + 200, GROUND_Y - 300);
      ctx.lineTo(x + 400, GROUND_Y);
      ctx.fill();
      // Lava flow on peak
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(x + 200, GROUND_Y - 300);
      ctx.lineTo(x + 220, GROUND_Y - 100);
      ctx.stroke();
    }

    // Ground - Obsidian/Lava
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, CANVAS_HEIGHT - GROUND_Y);
    // Lava cracks
    ctx.strokeStyle = '#f97316'; // orange-500
    ctx.lineWidth = 3;
    for (let i = 0; i < 20; i++) {
      const gx = (i * 234.56) % CANVAS_WIDTH;
      const gy = GROUND_Y + (i * 123.45) % (CANVAS_HEIGHT - GROUND_Y);
      ctx.beginPath();
      ctx.moveTo(gx, gy);
      ctx.lineTo(gx + 50, gy + 10);
      ctx.stroke();
    }
  }

  private drawCloud(x: number, y: number) {
    const { ctx } = this;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)'; // Very subtle clouds for night arena
    ctx.beginPath();
    ctx.arc(x, y, 30, 0, Math.PI * 2);
    ctx.arc(x + 40, y, 40, 0, Math.PI * 2);
    ctx.arc(x + 80, y, 30, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawPlayer(player: Player) {
    const { ctx } = this;
    const { x, y, width, height, color, state, direction } = player;
    const isCrouching = height === 40;

    ctx.save();
    ctx.translate(x + width / 2, y + height / 2);
    if (direction === -1) ctx.scale(-1, 1);

    // Shadow on ground
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(0, height / 2 - 5, 25, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Armor Colors
    const armorColor = '#94a3b8'; // slate-400 (metal)
    const trimColor = color; // Player color for team identification

    // Legs
    ctx.fillStyle = armorColor;
    if (isCrouching) {
      ctx.fillRect(-15, 5, 12, 15);
      ctx.fillRect(3, 5, 12, 15);
    } else if (state === PlayerState.RUNNING) {
      const walkCycle = Math.sin(Date.now() / 100) * 15;
      ctx.fillRect(walkCycle - 6, 10, 12, 25);
      ctx.fillRect(-walkCycle - 6, 10, 12, 25);
    } else {
      ctx.fillRect(-15, 10, 12, 30);
      ctx.fillRect(3, 10, 12, 30);
    }

    // Torso (Breastplate)
    ctx.fillStyle = armorColor;
    ctx.beginPath();
    if (isCrouching) {
      ctx.roundRect(-18, -15, 36, 25, 8);
    } else {
      ctx.roundRect(-18, -25, 36, 40, 8);
    }
    ctx.fill();
    
    // Team Trim on Chest
    ctx.fillStyle = trimColor;
    ctx.beginPath();
    if (isCrouching) {
      ctx.roundRect(-12, -12, 24, 10, 4);
    } else {
      ctx.roundRect(-12, -20, 24, 15, 4);
    }
    ctx.fill();

    // Head (Helmet)
    ctx.fillStyle = armorColor;
    ctx.beginPath();
    const headY = isCrouching ? -20 : -40;
    ctx.arc(0, headY, 15, 0, Math.PI * 2);
    ctx.fill();
    
    // Helmet Visor
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-10, headY - 5, 20, 8);
    
    // Plume/Crest
    ctx.fillStyle = trimColor;
    ctx.beginPath();
    ctx.moveTo(0, headY - 15);
    ctx.lineTo(15, headY - 25);
    ctx.lineTo(-5, headY - 25);
    ctx.fill();

    // Arms & Weapon
    ctx.fillStyle = armorColor;
    if (state === PlayerState.ATTACKING) {
      // Swing animation
      const swingAngle = -Math.PI / 4 + (player.attackFrame / 30) * Math.PI;
      ctx.rotate(swingAngle);
      
      // Arm
      ctx.fillRect(0, -5, 40, 12);
      
      // Sword
      ctx.fillStyle = '#e2e8f0'; // bright metal
      ctx.beginPath();
      ctx.moveTo(40, -8);
      ctx.lineTo(100, -2);
      ctx.lineTo(100, 2);
      ctx.lineTo(40, 8);
      ctx.fill();
      
      // Sword Guard
      ctx.fillStyle = '#fbbf24'; // gold
      ctx.fillRect(35, -15, 8, 30);
      
    } else if (state === PlayerState.DEFENDING) {
      // Arm holding shield
      ctx.fillRect(0, -10, 20, 12);
      
      // Shield
      ctx.fillStyle = armorColor;
      ctx.strokeStyle = trimColor;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(15, -35);
      ctx.lineTo(35, -35);
      ctx.lineTo(35, 15);
      ctx.lineTo(25, 30);
      ctx.lineTo(15, 15);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      
      // Shield Emblem
      ctx.fillStyle = trimColor;
      ctx.beginPath();
      ctx.arc(25, -10, 8, 0, Math.PI * 2);
      ctx.fill();
      
    } else {
      // Idle Arm
      ctx.fillRect(0, -5, 20, 12);
      
      // Sword idle (pointing down)
      ctx.save();
      ctx.translate(15, 5);
      ctx.rotate(Math.PI / 3);
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(0, -3, 50, 6);
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(-5, -10, 5, 20);
      ctx.restore();
    }

    // Hurt state effect
    if (state === PlayerState.HURT) {
      ctx.fillStyle = 'rgba(255, 0, 0, 0.4)';
      ctx.beginPath();
      ctx.arc(0, -10, 40, 0, Math.PI * 2);
      ctx.fill();
    }

    // Invincibility flicker
    if (player.invincibilityFrames > 0 && Math.floor(Date.now() / 50) % 2 === 0) {
      ctx.globalAlpha = 0.3;
    }

    // Special Attack Effect
    if (state === PlayerState.SPECIAL) {
      ctx.strokeStyle = color;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(0, 0, 50, 0, Math.PI * 2);
      ctx.stroke();
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.beginPath();
      ctx.arc(0, 0, 40, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  private drawProjectiles(projectiles: any[]) {
    const { ctx } = this;
    projectiles.forEach(p => {
      ctx.save();
      ctx.translate(p.x + p.width / 2, p.y + p.height / 2);
      
      // Glow
      ctx.shadowBlur = 15;
      ctx.shadowColor = p.color;
      
      // Energy Wave
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.ellipse(0, 0, p.width / 2, p.height / 2, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Inner core
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(0, 0, p.width / 4, p.height / 4, 0, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.restore();
    });
  }

  private drawParticles(particles: any[]) {
    const { ctx } = this;
    particles.forEach(p => {
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, 4, 4);
    });
    ctx.globalAlpha = 1.0;
  }
}
