export enum PlayerState {
  IDLE = 'IDLE',
  RUNNING = 'RUNNING',
  JUMPING = 'JUMPING',
  ATTACKING = 'ATTACKING',
  DEFENDING = 'DEFENDING',
  CROUCHING = 'CROUCHING',
  HURT = 'HURT',
  DEAD = 'DEAD',
  SPECIAL = 'SPECIAL'
}

export enum MapType {
  DOJO = 'DOJO',
  NIGHT_CITY = 'NIGHT_CITY',
  FOREST = 'FOREST',
  VOLCANO = 'VOLCANO'
}

export interface Projectile {
  id: string;
  ownerId: 1 | 2;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  color: string;
  damage: number;
}

export interface Vector2D {
  x: number;
  y: number;
}

export interface PlayerConfig {
  id: 1 | 2;
  color: string;
  x: number;
  y: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

export interface GameState {
  players: Player[];
  roundTime: number;
  roundActive: boolean;
  winner: 1 | 2 | null;
  scores: { 1: number; 2: number };
  particles: Particle[];
  projectiles: Projectile[];
  screenShake: number;
  currentMap: MapType;
}

export class Player {
  id: 1 | 2;
  name: string = '';
  x: number;
  y: number;
  vx: number = 0;
  vy: number = 0;
  width: number = 40;
  height: number = 80;
  color: string;
  hp: number = 100;
  stamina: number = 200;
  state: PlayerState = PlayerState.IDLE;
  direction: number = 1; // 1 for right, -1 for left
  isGrounded: boolean = false;
  
  attackCooldown: number = 0;
  invincibilityFrames: number = 0;
  staminaRegenCooldown: number = 0;
  
  specialCharge: number = 0; // 0 to 100
  specialCooldown: number = 0;
  
  // Hitbox for attack
  attackHitbox: { x: number; y: number; width: number; height: number } | null = null;
  attackFrame: number = 0;
  hasHit: boolean = false;

  constructor(config: PlayerConfig) {
    this.id = config.id;
    this.name = config.id === 1 ? 'Jogador 1' : 'Jogador 2';
    this.x = config.x;
    this.y = config.y;
    this.color = config.color;
    this.direction = this.id === 1 ? 1 : -1;
  }
}
