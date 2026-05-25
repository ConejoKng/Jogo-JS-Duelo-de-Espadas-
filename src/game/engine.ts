import { Player, PlayerState, GameState, Particle, Projectile, MapType } from '../types';
import { inputManager } from './input';
import { audioManager } from './audio';

const GRAVITY = 0.6;
const WALK_SPEED = 5;
const JUMP_FORCE = -15;
const FRICTION = 0.8;
const GROUND_Y = 500;
const CANVAS_WIDTH = 1000;
const CANVAS_HEIGHT = 600;

export class GameEngine {
  state: GameState;
  private lastTime: number = 0;

  constructor() {
    this.state = this.initNewRound();
  }

  initNewRound(scores = { 1: 0, 2: 0 }, currentMap: MapType = MapType.DOJO): GameState {
    return {
      players: [
        new Player({ id: 1, color: '#3b82f6', x: 200, y: GROUND_Y - 80 }),
        new Player({ id: 2, color: '#ef4444', x: 800, y: GROUND_Y - 80 }),
      ],
      roundTime: 180,
      roundActive: true,
      winner: null,
      scores,
      particles: [],
      projectiles: [],
      screenShake: 0,
      currentMap,
    };
  }

  update(time: number) {
    const dt = (time - this.lastTime) / 16.67; // Normalize to 60fps
    this.lastTime = time;

    if (!this.state.roundActive) return;

    // Update timer
    this.state.roundTime -= 1 / 60;
    if (this.state.roundTime <= 0) {
      this.endRound();
    }

    // Update screen shake
    if (this.state.screenShake > 0) {
      this.state.screenShake *= 0.9;
      if (this.state.screenShake < 0.1) this.state.screenShake = 0;
    }

    this.state.players.forEach((player) => {
      this.updatePlayer(player, dt);
    });

    this.handleCollisions();
    this.updateProjectiles(dt);
    this.updateParticles(dt);

    // Check for death
    this.state.players.forEach(p => {
      if (p.hp <= 0) {
        p.state = PlayerState.DEAD;
        this.endRound();
      }
    });
  }

  private updatePlayer(player: Player, dt: number) {
    const inputs = inputManager.getPlayerInputs(player.id);

    // Invincibility
    if (player.invincibilityFrames > 0) player.invincibilityFrames--;

    // Stamina Regen
    if (player.staminaRegenCooldown > 0) {
      player.staminaRegenCooldown--;
    } else if (player.stamina < 200) {
      player.stamina += 0.5;
    }

    // Special Charge (20 seconds to full = 100 / (20 * 60) per frame)
    if (player.specialCooldown > 0) {
      player.specialCooldown--;
      // If we were in SPECIAL state, return to IDLE after some frames
      if (player.state === PlayerState.SPECIAL && player.specialCooldown < 30) {
        player.state = PlayerState.IDLE;
      }
    } else if (player.specialCharge < 100) {
      player.specialCharge += 100 / (20 * 60);
    }

    // Movement logic
    if (player.state !== PlayerState.DEAD && player.state !== PlayerState.HURT) {
      // Horizontal movement
      if (inputs.left) {
        player.vx = -WALK_SPEED;
        player.direction = -1;
        if (player.isGrounded && player.state !== PlayerState.SPECIAL) player.state = PlayerState.RUNNING;
      } else if (inputs.right) {
        player.vx = WALK_SPEED;
        player.direction = 1;
        if (player.isGrounded && player.state !== PlayerState.SPECIAL) player.state = PlayerState.RUNNING;
      } else {
        player.vx *= FRICTION;
        if (player.isGrounded && player.state !== PlayerState.SPECIAL) player.state = PlayerState.IDLE;
      }

      // Crouching
      if (inputs.down && player.isGrounded && player.state !== PlayerState.SPECIAL) {
        if (player.state !== PlayerState.CROUCHING) {
          player.y += (player.height - 40);
        }
        player.state = PlayerState.CROUCHING;
        player.vx = 0;
        player.height = 40; // Ducking height
      } else {
        if (player.state === PlayerState.CROUCHING) {
          player.y -= (80 - player.height);
          player.state = PlayerState.IDLE;
        }
        player.height = 80; // Normal height
      }

      // Jumping
      if (inputs.up && player.isGrounded && player.state !== PlayerState.CROUCHING && player.state !== PlayerState.SPECIAL) {
        player.vy = JUMP_FORCE;
        player.isGrounded = false;
        player.state = PlayerState.JUMPING;
      }

      // Attacking
      if (inputs.attack && player.attackCooldown <= 0 && player.stamina >= 20 && player.state !== PlayerState.SPECIAL) {
        player.state = PlayerState.ATTACKING;
        player.attackCooldown = 30;
        player.attackFrame = 0;
        player.hasHit = false;
        player.stamina -= 20;
        player.staminaRegenCooldown = 60;
        audioManager.playSwing();
      }

      // Defending
      if (inputs.defend && player.stamina > 0 && player.state !== PlayerState.SPECIAL) {
        player.state = PlayerState.DEFENDING;
        player.vx *= 0.5;
        player.stamina -= 0.2;
        player.staminaRegenCooldown = 30;
      }

      // Special Attack
      if (inputs.special && player.specialCharge >= 100) {
        player.state = PlayerState.SPECIAL;
        player.specialCharge = 0;
        player.specialCooldown = 60; // 1 second total cooldown
        
        // Create projectile
        const projectile: Projectile = {
          id: Math.random().toString(36).substr(2, 9),
          ownerId: player.id,
          x: player.direction === 1 ? player.x + player.width : player.x - 40,
          y: player.y + player.height / 2 - 10,
          vx: player.direction * 12,
          vy: 0,
          width: 40,
          height: 20,
          color: player.color,
          damage: 30
        };
        this.state.projectiles.push(projectile);
        audioManager.playSwing(); // Reuse swing sound for now
        this.state.screenShake = 5;
      }
    }

    // Gravity and Physics
    player.vy += GRAVITY;
    player.x += player.vx * dt;
    player.y += player.vy * dt;

    // Ground collision
    if (player.y + player.height > GROUND_Y) {
      player.y = GROUND_Y - player.height;
      player.vy = 0;
      player.isGrounded = true;
    }

    // Wall collision
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > CANVAS_WIDTH) player.x = CANVAS_WIDTH - player.width;

    // Cooldowns
    if (player.attackCooldown > 0) {
      player.attackCooldown--;
      player.attackFrame++;
      
      // Define attack hitbox during specific frames
      if (player.attackFrame > 5 && player.attackFrame < 15 && !player.hasHit) {
        // Adjust attack height if crouching
        const attackYOffset = player.state === PlayerState.CROUCHING ? 20 : 5;
        player.attackHitbox = {
          x: player.direction === 1 ? player.x + player.width : player.x - 60,
          y: player.y + attackYOffset,
          width: 60,
          height: 40
        };
      } else {
        player.attackHitbox = null;
      }
    } else {
      player.attackHitbox = null;
    }
  }

  private handleCollisions() {
    const p1 = this.state.players[0];
    const p2 = this.state.players[1];

    // Check P1 attacking P2
    if (p1.attackHitbox && this.checkCollision(p1.attackHitbox, p2)) {
      this.applyHit(p1, p2);
    }

    // Check P2 attacking P1
    if (p2.attackHitbox && this.checkCollision(p2.attackHitbox, p1)) {
      this.applyHit(p2, p1);
    }

    // Projectile collisions
    this.state.projectiles.forEach(proj => {
      const victim = this.state.players.find(p => p.id !== proj.ownerId);
      if (victim && this.checkCollision(proj, victim)) {
        this.applyProjectileHit(proj, victim);
      }
    });
  }

  private applyProjectileHit(proj: Projectile, victim: Player) {
    if (victim.invincibilityFrames > 0 || victim.state === PlayerState.DEAD) return;

    // Projectiles can be blocked but still deal some chip damage or knockback
    if (victim.state === PlayerState.DEFENDING) {
      victim.stamina -= 20;
      victim.vx = Math.sign(proj.vx) * 5;
      audioManager.playBlock();
    } else {
      victim.hp -= proj.damage;
      victim.state = PlayerState.HURT;
      victim.invincibilityFrames = 30;
      victim.vx = Math.sign(proj.vx) * 8;
      victim.vy = -3;
      this.state.screenShake = 15;
      audioManager.playHit();
      this.createParticles(victim.x + victim.width/2, victim.y + victim.height/2, proj.color, 20);
      
      setTimeout(() => {
        if (victim.hp > 0) victim.state = PlayerState.IDLE;
      }, 300);
    }

    // Remove projectile after hit
    this.state.projectiles = this.state.projectiles.filter(p => p.id !== proj.id);
  }

  private updateProjectiles(dt: number) {
    this.state.projectiles = this.state.projectiles.filter(p => {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      
      // Remove if off screen
      return p.x > -100 && p.x < CANVAS_WIDTH + 100;
    });
  }

  private checkCollision(rect: any, player: Player) {
    return rect.x < player.x + player.width &&
           rect.x + rect.width > player.x &&
           rect.y < player.y + player.height &&
           rect.y + rect.height > player.y;
  }

  private applyHit(attacker: Player, victim: Player) {
    if (victim.invincibilityFrames > 0 || victim.state === PlayerState.DEAD || attacker.hasHit) return;

    // Special rule: Crouching players only take damage if the attacker is also crouching
    if (victim.state === PlayerState.CROUCHING && attacker.state !== PlayerState.CROUCHING) {
      return;
    }

    // Check if victim is facing the attacker (optional but good for realism)
    // For now, let's just make sure defense works as intended
    if (victim.state === PlayerState.DEFENDING) {
      // Blocked!
      victim.stamina -= 15; // Increased stamina cost for blocking
      victim.vx = attacker.direction * 4; // Knockback
      audioManager.playBlock();
      this.createParticles(victim.x + victim.width/2, victim.y + victim.height/2, '#ffffff', 5);
      attacker.hasHit = true; // Mark as hit even if blocked
    } else {
      // Hit!
      victim.hp -= 15;
      victim.state = PlayerState.HURT;
      victim.invincibilityFrames = 30;
      victim.vx = attacker.direction * 10;
      victim.vy = -5;
      this.state.screenShake = 10;
      audioManager.playHit();
      this.createParticles(victim.x + victim.width/2, victim.y + victim.height/2, victim.color, 15);
      attacker.hasHit = true;
      
      setTimeout(() => {
        if (victim.hp > 0) victim.state = PlayerState.IDLE;
      }, 300);
    }
    
    // Clear hitbox to prevent multiple hits in same frame
    attacker.attackHitbox = null;
  }

  private createParticles(x: number, y: number, color: string, count: number) {
    for (let i = 0; i < count; i++) {
      this.state.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10,
        life: 1.0,
        color
      });
    }
  }

  private updateParticles(dt: number) {
    this.state.particles = this.state.particles.filter(p => {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= 0.02 * dt;
      return p.life > 0;
    });
  }

  private endRound() {
    if (!this.state.roundActive) return;
    this.state.roundActive = false;
    
    const p1 = this.state.players[0];
    const p2 = this.state.players[1];

    if (p1.hp > p2.hp) {
      this.state.scores[1]++;
      this.state.winner = 1;
    } else if (p2.hp > p1.hp) {
      this.state.scores[2]++;
      this.state.winner = 2;
    } else {
      // Tie?
      this.state.winner = null;
    }
  }
}
