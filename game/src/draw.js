import { FIELD_H, FIELD_W } from './field.js';

function round(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

function sky(ctx, level) {
  const g = ctx.createLinearGradient(0, 0, 0, FIELD_H);
  g.addColorStop(0, level.skyTop);
  g.addColorStop(0.55, level.skyBot);
  g.addColorStop(1, level.grassDark);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, FIELD_W, FIELD_H);
}

function hills(ctx, level) {
  ctx.fillStyle = level.hill;
  ctx.beginPath();
  ctx.moveTo(0, 250);
  ctx.quadraticCurveTo(180, 150, 380, 230);
  ctx.quadraticCurveTo(560, 300, 760, 190);
  ctx.quadraticCurveTo(980, 90, 1280, 210);
  ctx.lineTo(1280, 320);
  ctx.lineTo(0, 340);
  ctx.fill();
  ctx.globalAlpha = 0.45;
  ctx.beginPath();
  ctx.moveTo(0, 300);
  ctx.quadraticCurveTo(240, 220, 520, 290);
  ctx.quadraticCurveTo(860, 360, 1280, 250);
  ctx.lineTo(1280, 390);
  ctx.lineTo(0, 400);
  ctx.fill();
  ctx.globalAlpha = 1;
}

function ground(ctx, level) {
  ctx.fillStyle = level.grass;
  ctx.fillRect(0, 300, FIELD_W, FIELD_H);
  ctx.fillStyle = level.grassDark;
  for (let i = 0; i < 18; i += 1) {
    const x = 40 + ((i * 97) % 1200);
    const y = 340 + ((i * 53) % 340);
    ctx.fillRect(x, y, 3, 14);
    ctx.fillRect(x + 6, y + 4, 3, 11);
  }
  ctx.fillStyle = level.path;
  ctx.beginPath();
  ctx.moveTo(level.spawn.x - 40, level.spawn.y + 80);
  ctx.quadraticCurveTo(620, level.spawn.y - 40, level.fold.x - 10, level.fold.y + level.fold.h / 2);
  ctx.lineTo(level.fold.x - 10, level.fold.y + level.fold.h / 2 + 70);
  ctx.quadraticCurveTo(640, level.spawn.y + 80, level.spawn.x - 80, level.spawn.y + 140);
  ctx.fill();
}

function drawRocks(ctx, rocks) {
  for (const rock of rocks) {
    ctx.fillStyle = '#6e675e';
    ctx.beginPath();
    ctx.ellipse(rock.x, rock.y + 8, rock.r, rock.r * 0.72, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#a39a8e';
    ctx.beginPath();
    ctx.ellipse(rock.x - rock.r * 0.1, rock.y, rock.r * 0.92, rock.r * 0.62, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    ctx.beginPath();
    ctx.ellipse(rock.x - rock.r * 0.25, rock.y - rock.r * 0.15, rock.r * 0.28, rock.r * 0.16, -0.4, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawFold(ctx, run) {
  const fold = run.fold;
  ctx.fillStyle = '#5c5348';
  round(ctx, fold.x, fold.y, fold.w, fold.h, 8);
  ctx.fill();
  const glow = ctx.createRadialGradient(fold.x + 70, fold.y + fold.h / 2, 10, fold.x + 70, fold.y + fold.h / 2, 120);
  glow.addColorStop(0, 'rgba(255, 214, 140, 0.9)');
  glow.addColorStop(1, 'rgba(255, 214, 140, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(fold.x - 30, fold.y, fold.w + 40, fold.h);
  ctx.fillStyle = '#8a6240';
  ctx.fillRect(fold.x + 18, fold.y + 16, fold.w - 30, fold.h - 32);
  ctx.strokeStyle = '#3a3128';
  ctx.lineWidth = 6;
  ctx.strokeRect(fold.x + 6, fold.y + 8, 10, fold.h - 16);
  ctx.strokeRect(fold.x + fold.w - 16, fold.y + 8, 10, fold.h - 16);
  ctx.strokeRect(fold.x + 6, fold.y + 8, fold.w - 12, 10);
  ctx.strokeRect(fold.x + 6, fold.y + fold.h - 18, fold.w - 12, 10);
  ctx.fillStyle = '#1c140f';
  ctx.font = '700 22px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('FOLD', fold.x + fold.w / 2, fold.y + 46);
  const shown = Math.min(run.saved, 12);
  for (let i = 0; i < shown; i += 1) {
    const col = i % 3;
    const row = Math.floor(i / 3);
    drawSheep(ctx, fold.x + 36 + col * 32, fold.y + 78 + row * 28, 0.2, 0);
  }
}

function drawSheep(ctx, x, y, vx, fear) {
  const face = Math.atan2(vx || 0.2, 0.2);
  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  ctx.beginPath();
  ctx.ellipse(x, y + 12, 16, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = fear > 0.2 ? '#f2d2cc' : '#f7f1e6';
  ctx.beginPath();
  ctx.ellipse(x, y, 16, 11, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#2c2416';
  ctx.beginPath();
  ctx.arc(x + 10, y - 1, 5.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#e7b3b8';
  ctx.beginPath();
  ctx.ellipse(x + 8, y - 7, 3, 4, 0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#2c2416';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x - 8, y + 8);
  ctx.lineTo(x - 8, y + 15);
  ctx.moveTo(x + 2, y + 8);
  ctx.lineTo(x + 2, y + 15);
  ctx.stroke();
  void face;
}

function drawWolf(ctx, wolf) {
  if (wolf.delay > 0) return;
  ctx.fillStyle = '#3a342e';
  ctx.beginPath();
  ctx.ellipse(wolf.x, wolf.y, 26, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(wolf.x + 18, wolf.y - 6, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#e2b15a';
  ctx.beginPath();
  ctx.arc(wolf.x + 22, wolf.y - 7, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#2a241e';
  ctx.beginPath();
  ctx.moveTo(wolf.x + 14, wolf.y - 14);
  ctx.lineTo(wolf.x + 18, wolf.y - 6);
  ctx.lineTo(wolf.x + 10, wolf.y - 8);
  ctx.fill();
}

function drawShepherd(ctx, run) {
  const { x, y } = run.shepherd;
  ctx.fillStyle = '#8d2f2a';
  ctx.beginPath();
  ctx.moveTo(x, y - 26);
  ctx.lineTo(x + 16, y + 16);
  ctx.lineTo(x - 16, y + 16);
  ctx.fill();
  ctx.fillStyle = '#f0d2b0';
  ctx.beginPath();
  ctx.arc(x, y - 18, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#5a3a22';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x + 12, y - 8);
  ctx.lineTo(x + 12, y - 34);
  ctx.arc(x + 4, y - 34, 8, 0, Math.PI, true);
  ctx.stroke();
  if (run.cooldown > 0) {
    ctx.strokeStyle = '#e2a84a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, y, 20, -Math.PI / 2, -Math.PI / 2 + (1 - run.cooldown / 0.42) * Math.PI * 2);
    ctx.stroke();
  }
}

function drawBells(ctx, run) {
  for (const bell of run.bells) {
    const t = bell.age / bell.life;
    ctx.strokeStyle = `rgba(226, 168, 74, ${1 - t})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(bell.x, bell.y, 18 + t * bell.reach * 0.55, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(bell.x, bell.y, 8 + t * 40, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#e2a84a';
    ctx.beginPath();
    ctx.arc(bell.x, bell.y, 6, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = 'rgba(243, 230, 207, 0.7)';
  for (const puff of run.puffs) ctx.fillRect(puff.x, puff.y, 3, 3);
}

export function drawHud(ctx, run) {
  ctx.fillStyle = 'rgba(28, 20, 15, 0.88)';
  ctx.fillRect(0, 0, FIELD_W, 74);
  ctx.fillStyle = '#f3e6cf';
  ctx.textAlign = 'left';
  ctx.font = '700 28px Georgia, serif';
  ctx.fillText(run.level.name, 24, 46);
  ctx.textAlign = 'right';
  ctx.font = '700 28px Georgia, serif';
  ctx.fillText(`HOME ${run.saved}/${run.level.quota}`, FIELD_W - 24, 46);
  ctx.textAlign = 'center';
  ctx.font = '16px Georgia, serif';
  ctx.fillStyle = '#e7d3b0';
  ctx.fillText(`lost ${run.lost}   ·   stars ${run.stars}`, FIELD_W / 2, 64);
  const frac = Math.max(0, run.dusk / run.level.dusk);
  ctx.fillStyle = '#3a3128';
  round(ctx, 430, 22, 420, 16, 8);
  ctx.fill();
  ctx.fillStyle = frac > 0.3 ? '#e2a84a' : '#c4503a';
  round(ctx, 430, 22, 420 * frac, 16, 8);
  ctx.fill();
  ctx.fillStyle = '#f3e6cf';
  ctx.font = '700 14px Georgia, serif';
  ctx.fillText('DUSK', 640, 18);
}

function card(ctx, y, h) {
  ctx.fillStyle = 'rgba(28, 20, 15, 0.35)';
  ctx.fillRect(0, 0, FIELD_W, FIELD_H);
  ctx.fillStyle = '#f6edd8';
  ctx.strokeStyle = '#1c140f';
  ctx.lineWidth = 8;
  round(ctx, 240, y, 800, h, 18);
  ctx.fill();
  ctx.stroke();
}

export function drawTitle(ctx, run) {
  card(ctx, 120, 470);
  ctx.fillStyle = '#1c140f';
  ctx.textAlign = 'center';
  ctx.font = '700 92px Georgia, serif';
  ctx.fillText('BELLWETHER', 640, 250);
  ctx.font = '28px Georgia, serif';
  ctx.fillText('Ring the flock home before dusk.', 640, 310);
  ctx.fillStyle = '#8d2f2a';
  round(ctx, 390, 360, 500, 78, 12);
  ctx.fill();
  ctx.fillStyle = '#f6edd8';
  ctx.font = '700 36px Georgia, serif';
  ctx.fillText('START THE DRIVE', 640, 410);
  ctx.fillStyle = '#1c140f';
  ctx.font = '22px Georgia, serif';
  ctx.fillText('WASD moves. Click or Space rings. Stand on a wolf to turn it.', 640, 490);
  ctx.fillText(`Esc pauses    ·    best ${bestOf(run)} stars`, 640, 530);
}

export function drawResults(ctx, run) {
  const won = run.mode === 'victory';
  card(ctx, 130, 460);
  ctx.fillStyle = '#1c140f';
  ctx.textAlign = 'center';
  ctx.font = '700 64px Georgia, serif';
  ctx.fillText(won ? 'THE FOLD IS FULL' : 'DUSK TOOK THE HILL', 640, 250);
  ctx.font = '28px Georgia, serif';
  ctx.fillText(`Sheep home ${run.finishedSaved}    ·    lost ${run.finishedLost}    ·    bells ${run.bellsRung}`, 640, 320);
  ctx.font = '700 36px Georgia, serif';
  ctx.fillText(`${run.stars} STARS`, 640, 390);
  ctx.fillStyle = '#8d2f2a';
  round(ctx, 390, 440, 500, 78, 12);
  ctx.fill();
  ctx.fillStyle = '#f6edd8';
  ctx.font = '700 36px Georgia, serif';
  ctx.fillText(won ? 'PLAY AGAIN' : 'TRY THE DRIVE AGAIN', 640, 490);
}

export function drawPause(ctx) {
  ctx.fillStyle = 'rgba(28, 20, 15, 0.45)';
  ctx.fillRect(0, 0, FIELD_W, FIELD_H);
  ctx.fillStyle = '#f6edd8';
  ctx.textAlign = 'center';
  ctx.font = '700 72px Georgia, serif';
  ctx.fillText('PAUSED', 640, 340);
  ctx.font = '28px Georgia, serif';
  ctx.fillStyle = '#1c140f';
  ctx.fillText('Esc to resume', 640, 400);
}

export function drawWorld(ctx, run) {
  const { level } = run;
  sky(ctx, level);
  hills(ctx, level);
  ground(ctx, level);
  if (level.bridge) {
    ctx.fillStyle = '#8d6240';
    ctx.fillRect(500, 330, 280, 70);
    ctx.strokeStyle = '#3a3128';
    ctx.lineWidth = 4;
    for (let x = 510; x < 770; x += 28) {
      ctx.beginPath();
      ctx.moveTo(x, 334);
      ctx.lineTo(x, 396);
      ctx.stroke();
    }
  }
  drawRocks(ctx, run.rocks);
  drawFold(ctx, run);
  drawBells(ctx, run);
  for (const sheep of run.sheep) {
    if (sheep.gone) continue;
    drawSheep(ctx, sheep.x, sheep.y, sheep.vx, sheep.fear);
  }
  for (const wolf of run.wolves) drawWolf(ctx, wolf);
  drawShepherd(ctx, run);
  if (level.rain) {
    ctx.strokeStyle = 'rgba(230, 236, 242, 0.45)';
    ctx.lineWidth = 2;
    for (const drop of run.rain) {
      ctx.beginPath();
      ctx.moveTo(drop.x, drop.y);
      ctx.lineTo(drop.x + 6, drop.y + 16);
      ctx.stroke();
    }
  }
  if (run.mode === 'play' && run.bannerT > 0) {
    ctx.fillStyle = 'rgba(246, 237, 216, 0.92)';
    round(ctx, 330, 100, 620, 54, 10);
    ctx.fill();
    ctx.fillStyle = '#1c140f';
    ctx.textAlign = 'center';
    ctx.font = '700 26px Georgia, serif';
    ctx.fillText(run.banner, 640, 136);
  }
}

function bestOf(run) {
  return run.best ?? 0;
}

export function paint(ctx, run) {
  drawWorld(ctx, run);
  if (run.mode !== 'title') drawHud(ctx, run);
  if (run.mode === 'title') drawTitle(ctx, run);
  if (run.mode === 'victory' || run.mode === 'defeat') drawResults(ctx, run);
  if (run.mode === 'pause') drawPause(ctx);
}
