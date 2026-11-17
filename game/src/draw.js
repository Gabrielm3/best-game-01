import { BANK_L, BANK_R, FIELD_H, FIELD_W } from './field.js';
import { REACHES } from './reaches.js';
import { themeOf } from './themes.js';

function round(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

function sky(ctx, level) {
  const theme = themeOf(level);
  const g = ctx.createLinearGradient(0, 0, 0, FIELD_H);
  g.addColorStop(0, theme.skyTop);
  g.addColorStop(0.45, theme.skyBot);
  g.addColorStop(1, theme.waterDeep);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, FIELD_W, FIELD_H);
}

function banks(ctx, level) {
  const theme = themeOf(level);
  ctx.fillStyle = theme.far;
  ctx.fillRect(0, 0, BANK_L, FIELD_H);
  ctx.fillRect(BANK_R, 0, FIELD_W - BANK_R, FIELD_H);
  ctx.fillStyle = theme.bank;
  ctx.fillRect(BANK_L - 28, 0, 28, FIELD_H);
  ctx.fillRect(BANK_R, 0, 28, FIELD_H);
  ctx.fillStyle = theme.water;
  ctx.fillRect(BANK_L, 0, BANK_R - BANK_L, FIELD_H);
  ctx.fillStyle = theme.waterDeep;
  for (let y = 40; y < FIELD_H; y += 36) {
    ctx.globalAlpha = 0.35;
    ctx.fillRect(BANK_L + 20, y, BANK_R - BANK_L - 40, 8);
    ctx.globalAlpha = 1;
  }
}

function scenery(ctx, level) {
  const theme = themeOf(level);
  ctx.strokeStyle = theme.night ? '#1e3a28' : '#2f6a32';
  ctx.lineWidth = 3;
  for (let i = 0; i < 14; i += 1) {
    const y = 90 + i * 42;
    ctx.beginPath();
    ctx.moveTo(BANK_L + 8, y);
    ctx.quadraticCurveTo(BANK_L + 24, y - 16, BANK_L + 18, y - 28);
    ctx.moveTo(BANK_R - 8, y + 12);
    ctx.quadraticCurveTo(BANK_R - 26, y - 6, BANK_R - 16, y - 22);
    ctx.stroke();
  }
  if (!level.rain && !level.night) {
    ctx.fillStyle = '#8d6240';
    ctx.beginPath();
    ctx.arc(120, 280, 46, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#3a3128';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(80, 280);
    ctx.lineTo(160, 280);
    ctx.moveTo(120, 240);
    ctx.lineTo(120, 320);
    ctx.stroke();
  }
  if (level.rain) {
    ctx.fillStyle = '#4a463f';
    ctx.fillRect(BANK_L - 18, 300, 36, 80);
    ctx.fillRect(BANK_R - 18, 300, 36, 80);
    ctx.fillStyle = '#6a6458';
    ctx.fillRect(BANK_L - 8, 250, 16, 50);
    ctx.fillRect(BANK_R - 8, 250, 16, 50);
  }
  if (level.night) {
    ctx.fillStyle = '#c4a46a';
    ctx.fillRect(70, 160, 28, 70);
    ctx.fillStyle = 'rgba(226, 184, 74, 0.35)';
    ctx.beginPath();
    ctx.arc(84, 150, 36, 0, Math.PI * 2);
    ctx.fill();
  }
}

function wharf(ctx, level) {
  const theme = themeOf(level);
  ctx.fillStyle = theme.night ? '#c4a46a' : '#e7d7b0';
  ctx.fillRect(500, 600, 280, 90);
  ctx.strokeStyle = '#3a3128';
  ctx.lineWidth = 4;
  for (let x = 512; x < 770; x += 28) {
    ctx.beginPath();
    ctx.moveTo(x, 608);
    ctx.lineTo(x, 682);
    ctx.stroke();
  }
  ctx.fillStyle = theme.night ? '#f3e6cf' : '#1c140f';
  ctx.font = '700 18px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('WHARF', 640, 652);
}

function drawPosts(ctx, run) {
  for (const post of run.level.bollards) {
    ctx.fillStyle = '#5c4632';
    ctx.fillRect(post.x - 7, post.y - 18, 14, 36);
    ctx.fillStyle = '#e2b84a';
    ctx.beginPath();
    ctx.arc(post.x, post.y - 18, 8, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawCable(ctx, run) {
  if (!run.cable) return;
  ctx.strokeStyle = run.snag ? '#c4503a' : '#e2b84a';
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(run.boat.x, run.boat.y);
  ctx.lineTo(run.cable.x, run.cable.y);
  ctx.stroke();
}

function drawLogs(ctx, run) {
  for (const log of run.logs) {
    if (log.gone) continue;
    ctx.save();
    ctx.translate(log.x, log.y);
    ctx.rotate(log.spin);
    ctx.fillStyle = '#6b4228';
    ctx.fillRect(-22, -8, 44, 16);
    ctx.fillStyle = '#8d6240';
    ctx.fillRect(-16, -4, 10, 8);
    ctx.restore();
  }
  if (run.snag) {
    ctx.strokeStyle = '#c4503a';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(run.snag.log.x, run.snag.log.y, 22, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function drawBoat(ctx, run) {
  const { boat, crates, level } = run;
  ctx.fillStyle = 'rgba(232, 244, 246, 0.35)';
  ctx.beginPath();
  ctx.ellipse(boat.x, boat.y + 18, 34, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#5c3a22';
  ctx.beginPath();
  ctx.moveTo(boat.x - 36, boat.y);
  ctx.lineTo(boat.x - 22, boat.y + 20);
  ctx.lineTo(boat.x + 22, boat.y + 20);
  ctx.lineTo(boat.x + 36, boat.y);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#8d6240';
  ctx.fillRect(boat.x - 20, boat.y - 8, 40, 12);
  ctx.fillStyle = '#f4e6c4';
  const shown = Math.min(crates, 4);
  for (let i = 0; i < shown; i += 1) {
    ctx.fillRect(boat.x - 16 + (i % 2) * 16, boat.y - 18 - Math.floor(i / 2) * 12, 14, 10);
  }
  ctx.fillStyle = '#1c140f';
  ctx.fillRect(boat.x - 2, boat.y - 34, 4, 26);
  ctx.fillStyle = level.night ? '#e2b84a' : '#c4503a';
  ctx.beginPath();
  ctx.moveTo(boat.x + 2, boat.y - 32);
  ctx.lineTo(boat.x + 18, boat.y - 22);
  ctx.lineTo(boat.x + 2, boat.y - 16);
  ctx.fill();
  if (level.night) {
    ctx.fillStyle = 'rgba(226, 184, 74, 0.28)';
    ctx.beginPath();
    ctx.arc(boat.x, boat.y, 70, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawSplashes(ctx, run) {
  ctx.fillStyle = 'rgba(232, 244, 246, 0.85)';
  for (const drop of run.splashes) ctx.fillRect(drop.x, drop.y, 3, 3);
}

export function drawHud(ctx, run) {
  ctx.fillStyle = 'rgba(20, 16, 14, 0.9)';
  ctx.fillRect(0, 0, FIELD_W, 74);
  ctx.fillStyle = '#f3e6cf';
  ctx.textAlign = 'left';
  ctx.font = '700 28px Georgia, serif';
  ctx.fillText(run.level.name, 24, 46);
  ctx.textAlign = 'right';
  ctx.fillText(`WHARF ${run.delivered}/${run.level.quota}`, FIELD_W - 24, 46);
  ctx.textAlign = 'center';
  ctx.font = '16px Georgia, serif';
  ctx.fillStyle = '#e7d3b0';
  ctx.fillText(`day ${run.reach + 1}/${REACHES.length}   ·   crates ${run.crates}   ·   cut ${run.cuts}   ·   lost ${run.lost}`, 640, 64);
  const frac = Math.max(0, run.fog / run.level.fog);
  ctx.fillStyle = '#3a3128';
  round(ctx, 430, 18, 420, 16, 8);
  ctx.fill();
  ctx.fillStyle = frac > 0.3 ? '#7eb0c4' : '#c4503a';
  round(ctx, 430, 18, 420 * frac, 16, 8);
  ctx.fill();
  ctx.fillStyle = '#f3e6cf';
  ctx.font = '700 13px Georgia, serif';
  ctx.fillText('FOG', 640, 16);
}

function card(ctx, y, h) {
  ctx.fillStyle = 'rgba(16, 18, 20, 0.4)';
  ctx.fillRect(0, 0, FIELD_W, FIELD_H);
  ctx.fillStyle = '#f6edd8';
  ctx.strokeStyle = '#1c140f';
  ctx.lineWidth = 8;
  round(ctx, 220, y, 840, h, 18);
  ctx.fill();
  ctx.stroke();
}

function roadOf(run) {
  if (run.record && run.record.reaches) return run.record.reaches;
  return REACHES.map((_, index) => ({ stars: 0, open: index === 0 }));
}

export function drawTitle(ctx, run) {
  card(ctx, 28, 664);
  ctx.fillStyle = '#1c140f';
  ctx.textAlign = 'center';
  ctx.font = '700 46px Georgia, serif';
  ctx.fillText('CUTWATER', 640, 86);
  ctx.font = '20px Georgia, serif';
  ctx.fillText('Eight days. Later water stays shut until the wharf is made.', 640, 122);
  roadOf(run).forEach((row, index) => {
    const y = 142 + index * 64;
    ctx.fillStyle = row.open ? '#1f4d55' : '#c8bba6';
    round(ctx, 250, y, 780, 56, 8);
    ctx.fill();
    ctx.fillStyle = row.open ? '#f6edd8' : '#5c5148';
    ctx.font = '700 24px Georgia, serif';
    ctx.textAlign = 'left';
    ctx.fillText(`Day ${index + 1}  ${REACHES[index].name}`, 272, y + 36);
    ctx.textAlign = 'right';
    const mark = row.stars > 0 ? `${row.stars} stars` : row.open ? 'open' : 'LOCKED';
    ctx.fillText(mark, 1004, y + 36);
  });
  ctx.textAlign = 'center';
  ctx.fillStyle = '#1c140f';
  ctx.font = '18px Georgia, serif';
  ctx.fillText('Click a post to hook. Space cuts a snag. WASD steers.', 640, 668);
}

export function drawResults(ctx, run) {
  const won = run.mode === 'victory';
  card(ctx, 70, 580);
  ctx.fillStyle = '#1c140f';
  ctx.textAlign = 'center';
  ctx.font = '700 48px Georgia, serif';
  ctx.fillText(won ? 'THE WHARF IS MADE' : 'THE FOG CLOSED', 640, 150);
  ctx.font = '28px Georgia, serif';
  ctx.textAlign = 'left';
  const lines = [
    `Crates landed ${run.finishedDelivered}`,
    `Lost overboard ${run.finishedLost}`,
    `Snags cut ${run.cuts}`,
    `Cables hooked ${run.hooks}`,
    `Days ${REACHES.length} of ${REACHES.length}`,
    `Stars ${run.stars} of ${REACHES.length * 3}`,
    `Best ${run.best || 0}`,
  ];
  lines.forEach((line, index) => ctx.fillText(line, 400, 210 + index * 40));
  ctx.fillStyle = '#1f4d55';
  round(ctx, 390, 520, 500, 70, 12);
  ctx.fill();
  ctx.fillStyle = '#f6edd8';
  ctx.textAlign = 'center';
  ctx.font = '700 32px Georgia, serif';
  ctx.fillText(won ? 'RUN THE RIVER AGAIN' : 'TRY THE REACH AGAIN', 640, 566);
}

export function drawPause(ctx) {
  ctx.fillStyle = 'rgba(12, 16, 20, 0.5)';
  ctx.fillRect(0, 0, FIELD_W, FIELD_H);
  ctx.fillStyle = '#f6edd8';
  ctx.textAlign = 'center';
  ctx.font = '700 72px Georgia, serif';
  ctx.fillText('PAUSED', 640, 360);
}

export function drawWorld(ctx, run) {
  sky(ctx, run.level);
  banks(ctx, run.level);
  scenery(ctx, run.level);
  wharf(ctx, run.level);
  drawPosts(ctx, run);
  drawCable(ctx, run);
  drawLogs(ctx, run);
  drawBoat(ctx, run);
  drawSplashes(ctx, run);
  const mist = 1 - Math.max(0, run.fog / run.level.fog);
  if (mist > 0.02) {
    ctx.fillStyle = `rgba(232, 236, 240, ${Math.min(0.45, mist)})`;
    ctx.fillRect(BANK_L, 74, BANK_R - BANK_L, 80 + mist * 180);
  }
  if (run.snag) {
    ctx.fillStyle = '#c4503a';
    ctx.font = '700 22px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('CUT', run.snag.log.x, run.snag.log.y - 28);
  }
  if (run.level.rain) {
    ctx.strokeStyle = 'rgba(230, 236, 242, 0.45)';
    ctx.lineWidth = 2;
    for (const drop of run.rain) {
      ctx.beginPath();
      ctx.moveTo(drop.x, drop.y);
      ctx.lineTo(drop.x + 8, drop.y + 18);
      ctx.stroke();
    }
  }
  if (run.mode === 'play' && run.bannerT > 0) {
    ctx.fillStyle = 'rgba(246, 237, 216, 0.92)';
    round(ctx, 330, 96, 620, 50, 10);
    ctx.fill();
    ctx.fillStyle = '#1c140f';
    ctx.textAlign = 'center';
    ctx.font = '700 24px Georgia, serif';
    ctx.fillText(run.banner, 640, 128);
  }
}

export function paint(ctx, run) {
  drawWorld(ctx, run);
  if (run.mode !== 'title') drawHud(ctx, run);
  if (run.mode === 'title') drawTitle(ctx, run);
  if (run.mode === 'victory' || run.mode === 'defeat') drawResults(ctx, run);
  if (run.mode === 'pause') drawPause(ctx);
}
