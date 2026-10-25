/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import { GameState } from '../types/game';

interface GallowsCanvasProps {
  gameState: GameState;
  mistakes: number;
  maxMistakes: number;
  lastGuessCorrect: boolean | null;
  lastActionTimestamp: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
  rotation: number;
  vRot: number;
  type: 'dust' | 'spark' | 'splinter' | 'confetti';
}

export const GallowsCanvas: React.FC<GallowsCanvasProps> = ({
  gameState,
  mistakes,
  maxMistakes,
  lastGuessCorrect,
  lastActionTimestamp,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Store game props in refs so the 60fps animation loop runs isolated without restarting
  const stateRef = useRef({
    gameState,
    mistakes,
    maxMistakes,
    lastGuessCorrect,
    lastActionTimestamp,
  });

  // Keep stateRef up to date
  useEffect(() => {
    stateRef.current = {
      gameState,
      mistakes,
      maxMistakes,
      lastGuessCorrect,
      lastActionTimestamp,
    };
  }, [gameState, mistakes, maxMistakes, lastGuessCorrect, lastActionTimestamp]);

  // Main 60fps simulation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let animId: number;
    let lastTime = performance.now();

    // Simulation variables
    let hitstopRemaining = 0; // seconds
    let shake = 0;
    let ropeAngle = 0;
    let ropeVel = 0;
    let lanternAngle = 0;
    let lanternVel = 0.005;
    let trapdoorAngle = 0; // for game over
    let puppetYOffset = 0; // for victory jump
    let victoryTimer = 0;

    // Track previous mistake count and action timestamp to trigger hitstop/particles
    let prevMistakes = stateRef.current.mistakes;
    let prevTimestamp = stateRef.current.lastActionTimestamp;

    // Particle pool
    const particles: Particle[] = [];
    const MAX_PARTICLES = 160;

    function spawnParticles(
      x: number,
      y: number,
      count: number,
      type: 'dust' | 'spark' | 'splinter' | 'confetti'
    ) {
      for (let i = 0; i < count; i++) {
        if (particles.length >= MAX_PARTICLES) {
          particles.shift();
        }

        let vx = (Math.random() - 0.5) * 4;
        let vy = (Math.random() - 0.5) * 4;
        let size = Math.random() * 3 + 2;
        let decay = Math.random() * 0.02 + 0.015;
        let color = '#d4af37';

        if (type === 'splinter') {
          vx = (Math.random() - 0.5) * 7;
          vy = -Math.random() * 5 - 2;
          size = Math.random() * 4 + 3;
          decay = Math.random() * 0.03 + 0.02;
          color = Math.random() > 0.5 ? '#8B5A2B' : '#5C3A21';
        } else if (type === 'spark') {
          vx = (Math.random() - 0.5) * 6;
          vy = -Math.random() * 6 - 2;
          size = Math.random() * 3 + 1.5;
          decay = Math.random() * 0.04 + 0.025;
          color = Math.random() > 0.4 ? '#FDE047' : '#F59E0B';
        } else if (type === 'confetti') {
          vx = (Math.random() - 0.5) * 9;
          vy = -Math.random() * 9 - 4;
          size = Math.random() * 6 + 3;
          decay = Math.random() * 0.015 + 0.008;
          const palette = ['#F59E0B', '#10B981', '#3B82F6', '#EC4899', '#8B5CF6', '#FBBF24'];
          color = palette[Math.floor(Math.random() * palette.length)];
        } else {
          // Ambient dust motes
          vx = (Math.random() - 0.5) * 0.4;
          vy = -Math.random() * 0.5 - 0.1;
          size = Math.random() * 2 + 1;
          decay = 0.005;
          color = 'rgba(212, 175, 55, 0.4)';
        }

        particles.push({
          x,
          y,
          vx,
          vy,
          size,
          color,
          alpha: 1.0,
          decay,
          rotation: Math.random() * Math.PI * 2,
          vRot: (Math.random() - 0.5) * 0.15,
          type,
        });
      }
    }

    // Spawn ambient background motes continuously
    const ambientInterval = setInterval(() => {
      if (document.hidden) return;
      if (particles.length < 50 && canvas) {
        spawnParticles(
          Math.random() * canvas.width,
          canvas.height - Math.random() * 200,
          2,
          'dust'
        );
      }
    }, 400);

    const resize = () => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
    };

    window.addEventListener('resize', resize);
    resize();

    // The simulation frame
    const render = (now: number) => {
      animId = requestAnimationFrame(render);

      const rawDt = (now - lastTime) / 1000;
      lastTime = now;
      const dt = Math.min(rawDt, 0.05); // clamped dt for 60fps stability

      const { gameState: currentGS, mistakes: curMistakes, maxMistakes: curMaxMistakes, lastGuessCorrect: isCorrect, lastActionTimestamp: curTS } =
        stateRef.current;

      // Detect state/action changes
      if (curTS !== prevTimestamp) {
        prevTimestamp = curTS;
        if (isCorrect === false) {
          // Heavy impact hitstop 60ms
          hitstopRemaining = 0.06;
          shake = 12;
          ropeVel += (Math.random() > 0.5 ? 1 : -1) * 0.25;
          // Spawn splinters near gallows beam
          if (canvas) {
            spawnParticles(canvas.width * 0.55, canvas.height * 0.28, 16, 'splinter');
          }
        } else if (isCorrect === true) {
          // Gentle sway + golden sparkles
          ropeVel += 0.06;
          if (canvas) {
            spawnParticles(canvas.width * 0.55, canvas.height * 0.45, 20, 'spark');
          }
        }
      }

      if (curMistakes !== prevMistakes) {
        prevMistakes = curMistakes;
      }

      // Handle hitstop freeze frame
      if (hitstopRemaining > 0) {
        hitstopRemaining -= dt;
        return; // freeze simulation momentarily for punchy game feel!
      }

      // Physics integration
      // 1. Lantern pendulum
      lanternAngle += lanternVel;
      if (Math.abs(lanternAngle) > 0.12) {
        lanternVel = -lanternVel;
      }
      lanternAngle *= 0.998;

      // 2. Rope harmonic pendulum
      const gravity = 9.8;
      const ropeLength = 1.2;
      const ropeAccel = (-gravity / ropeLength) * Math.sin(ropeAngle) - 1.5 * ropeVel;
      ropeVel += ropeAccel * dt;
      ropeAngle += ropeVel * dt;
      ropeAngle *= 0.985; // air friction damping

      // 3. Screen shake decay
      shake *= 0.88;
      if (shake < 0.2) shake = 0;

      // 4. Trapdoor physics (Game Over)
      if (currentGS === 'GAME_OVER') {
        trapdoorAngle = Math.min(Math.PI / 2.2, trapdoorAngle + dt * 6);
        ropeAngle = Math.sin(now * 0.008) * 0.05;
      } else {
        trapdoorAngle = 0;
      }

      // 5. Victory celebration
      if (currentGS === 'VICTORY') {
        victoryTimer += dt;
        puppetYOffset = Math.sin(victoryTimer * 6) * 12;
        if (victoryTimer < 3 && Math.random() < 0.3 && canvas) {
          spawnParticles(canvas.width * 0.55, canvas.height * 0.4, 4, 'confetti');
        }
      } else {
        victoryTimer = 0;
        puppetYOffset = 0;
      }

      // Canvas dimensions
      const w = canvas.width;
      const h = canvas.height;

      // Clear with deep moody tavern parchment / wood tint
      ctx.fillStyle = '#0c0d12';
      ctx.fillRect(0, 0, w, h);

      // Camera shake transform
      ctx.save();
      if (shake > 0) {
        const shakeX = (Math.random() - 0.5) * shake * 2;
        const shakeY = (Math.random() - 0.5) * shake * 2;
        ctx.translate(shakeX, shakeY);
      }

      // Atmospheric background gradient / moonlight rim
      const bgGrad = ctx.createRadialGradient(
        w * 0.5,
        h * 0.35,
        20,
        w * 0.5,
        h * 0.5,
        w * 0.65
      );
      bgGrad.addColorStop(0, '#1c1f2b');
      bgGrad.addColorStop(0.6, '#0f1118');
      bgGrad.addColorStop(1, '#08090d');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Draw faint architectural stone arches / timber silhouettes in distance
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 2;
      for (let i = 0; i < 4; i++) {
        const archX = w * (0.2 + i * 0.2);
        ctx.beginPath();
        ctx.arc(archX, h * 0.5, 90, Math.PI, 0);
        ctx.stroke();
      }

      // Coordinate scaling for responsive gallows stage
      const scale = Math.min(w / 800, h / 650);
      const stageCenterX = w * 0.5;
      const stageFloorY = h * 0.76;

      // ----------------- DRAW GALLOWS STRUCTURE -----------------
      const gallowsBaseX = stageCenterX - 110 * scale;
      const gallowsPoleX = stageCenterX - 110 * scale;
      const gallowsBeamY = stageFloorY - 320 * scale;
      const gallowsArmX = stageCenterX + 70 * scale;

      // Scaffold wooden platform
      ctx.fillStyle = '#1e140d';
      ctx.fillRect(stageCenterX - 220 * scale, stageFloorY, 440 * scale, 30 * scale);

      // Wood plank seams & nails
      ctx.strokeStyle = '#382315';
      ctx.lineWidth = 2 * scale;
      ctx.beginPath();
      ctx.moveTo(stageCenterX - 220 * scale, stageFloorY);
      ctx.lineTo(stageCenterX + 220 * scale, stageFloorY);
      ctx.stroke();

      // Platform support stilts
      ctx.fillStyle = '#140d08';
      ctx.fillRect(stageCenterX - 200 * scale, stageFloorY + 30 * scale, 24 * scale, 90 * scale);
      ctx.fillRect(stageCenterX + 176 * scale, stageFloorY + 30 * scale, 24 * scale, 90 * scale);
      ctx.fillRect(stageCenterX - 12 * scale, stageFloorY + 30 * scale, 24 * scale, 90 * scale);

      // Trapdoor flap under puppet
      const trapdoorX = stageCenterX + 20 * scale;
      const trapdoorWidth = 100 * scale;
      ctx.save();
      ctx.translate(trapdoorX, stageFloorY);
      ctx.rotate(trapdoorAngle);
      ctx.fillStyle = '#2d1a0f';
      ctx.fillRect(0, 0, trapdoorWidth, 14 * scale);
      // Iron hinge
      ctx.fillStyle = '#64748b';
      ctx.beginPath();
      ctx.arc(0, 7 * scale, 6 * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Upright Main Timber Mast
      ctx.fillStyle = '#3a2312';
      ctx.fillRect(gallowsPoleX, gallowsBeamY, 28 * scale, 320 * scale);
      // Wood grain highlights
      ctx.strokeStyle = '#53331b';
      ctx.lineWidth = 1.5 * scale;
      ctx.beginPath();
      ctx.moveTo(gallowsPoleX + 8 * scale, gallowsBeamY + 20 * scale);
      ctx.lineTo(gallowsPoleX + 8 * scale, stageFloorY - 10 * scale);
      ctx.moveTo(gallowsPoleX + 18 * scale, gallowsBeamY + 40 * scale);
      ctx.lineTo(gallowsPoleX + 18 * scale, stageFloorY - 5 * scale);
      ctx.stroke();

      // Top Crossbeam
      ctx.fillStyle = '#3a2312';
      ctx.fillRect(gallowsPoleX - 20 * scale, gallowsBeamY - 24 * scale, 220 * scale, 24 * scale);

      // Diagonal strut support
      ctx.lineWidth = 14 * scale;
      ctx.strokeStyle = '#2b190d';
      ctx.beginPath();
      ctx.moveTo(gallowsPoleX + 28 * scale, gallowsBeamY + 70 * scale);
      ctx.lineTo(gallowsPoleX + 90 * scale, gallowsBeamY);
      ctx.stroke();

      // Iron forged corner braces
      ctx.fillStyle = '#475569';
      ctx.fillRect(gallowsPoleX - 2 * scale, gallowsBeamY - 2 * scale, 32 * scale, 8 * scale);
      ctx.fillRect(gallowsPoleX + 175 * scale, gallowsBeamY - 24 * scale, 10 * scale, 28 * scale);

      // Swinging Lantern on gallows arm
      const lanternX = gallowsPoleX - 10 * scale;
      const lanternY = gallowsBeamY + 10 * scale;
      ctx.save();
      ctx.translate(lanternX, lanternY);
      ctx.rotate(lanternAngle);

      // Lantern chain
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1.5 * scale;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, 35 * scale);
      ctx.stroke();

      // Lantern body
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-10 * scale, 35 * scale, 20 * scale, 26 * scale);

      // Lantern warm flame core & ambient glow
      const flameGrad = ctx.createRadialGradient(0, 48 * scale, 2, 0, 48 * scale, 55 * scale);
      flameGrad.addColorStop(0, 'rgba(253, 224, 71, 0.9)');
      flameGrad.addColorStop(0.3, 'rgba(245, 158, 11, 0.4)');
      flameGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
      ctx.fillStyle = flameGrad;
      ctx.beginPath();
      ctx.arc(0, 48 * scale, 55 * scale, 0, Math.PI * 2);
      ctx.fill();

      // Lantern glass pane
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(-6 * scale, 40 * scale, 12 * scale, 16 * scale);
      ctx.restore();

      // ----------------- DRAW ROPE & NOOSE -----------------
      const ropeOriginX = gallowsArmX;
      const ropeOriginY = gallowsBeamY;
      const ropeLengthPixels = 70 * scale;

      ctx.save();
      ctx.translate(ropeOriginX, ropeOriginY);
      ctx.rotate(ropeAngle);

      // Rope texture (braided hemp style)
      ctx.strokeStyle = '#b4976a';
      ctx.lineWidth = 4 * scale;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, ropeLengthPixels);
      ctx.stroke();

      // Small rope knot
      ctx.fillStyle = '#8b6938';
      ctx.beginPath();
      ctx.ellipse(0, ropeLengthPixels, 6 * scale, 8 * scale, 0, 0, Math.PI * 2);
      ctx.fill();

      // ----------------- DRAW HANGMAN PUPPET -----------------
      // Render steps based on mistake ratio
      const mistakeRatio = curMistakes / Math.max(1, curMaxMistakes);

      // Thresholds for body parts
      const showHead = mistakeRatio >= 1 / curMaxMistakes;
      const showTorso = mistakeRatio >= 2 / curMaxMistakes;
      const showLeftArm = mistakeRatio >= 3 / curMaxMistakes;
      const showRightArm = mistakeRatio >= 4 / curMaxMistakes;
      const showLeftLeg = mistakeRatio >= 5 / curMaxMistakes;
      const showRightLeg = mistakeRatio >= 6 / curMaxMistakes;
      const showHatOrScarf = mistakeRatio >= 7 / curMaxMistakes || curMistakes > 0;

      // Puppet origin attached to rope knot
      const puppetX = 0;
      let puppetY = ropeLengthPixels + 4 * scale;

      if (currentGS === 'VICTORY') {
        // Puppet drops safely to the floor and cheers!
        puppetY = stageFloorY - gallowsBeamY - 100 * scale + puppetYOffset;
      }

      ctx.save();
      ctx.translate(puppetX, puppetY);

      // 1. HEAD
      if (showHead) {
        ctx.fillStyle = '#fde68a'; // stylized parchment puppet complexion
        ctx.strokeStyle = '#b45309';
        ctx.lineWidth = 2.5 * scale;
        ctx.beginPath();
        ctx.arc(0, 18 * scale, 18 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Expressive eyes
        ctx.fillStyle = '#451a03';
        if (currentGS === 'VICTORY') {
          // Cheerful blinking happy curves ^ ^
          ctx.beginPath();
          ctx.arc(-7 * scale, 17 * scale, 5 * scale, Math.PI, 0);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(7 * scale, 17 * scale, 5 * scale, Math.PI, 0);
          ctx.stroke();

          // Big happy smile!
          ctx.beginPath();
          ctx.arc(0, 21 * scale, 7 * scale, 0, Math.PI);
          ctx.stroke();
        } else if (currentGS === 'GAME_OVER') {
          // X X dizzy / defeated eyes
          ctx.lineWidth = 2 * scale;
          // Left X
          ctx.beginPath();
          ctx.moveTo(-10 * scale, 13 * scale);
          ctx.lineTo(-4 * scale, 19 * scale);
          ctx.moveTo(-4 * scale, 13 * scale);
          ctx.lineTo(-10 * scale, 19 * scale);
          // Right X
          ctx.moveTo(4 * scale, 13 * scale);
          ctx.lineTo(10 * scale, 19 * scale);
          ctx.moveTo(10 * scale, 13 * scale);
          ctx.lineTo(4 * scale, 19 * scale);
          ctx.stroke();
          // O mouth
          ctx.beginPath();
          ctx.arc(0, 26 * scale, 4 * scale, 0, Math.PI * 2);
          ctx.stroke();
        } else {
          // Suspenseful eyes looking around
          const eyeLook = Math.sin(now * 0.003) * 1.5;
          ctx.beginPath();
          ctx.arc(-6 * scale + eyeLook, 16 * scale, 2.5 * scale, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(6 * scale + eyeLook, 16 * scale, 2.5 * scale, 0, Math.PI * 2);
          ctx.fill();

          // Nervous mouth line
          ctx.beginPath();
          ctx.moveTo(-5 * scale, 26 * scale);
          ctx.lineTo(5 * scale, 26 * scale);
          ctx.stroke();
        }

        // Scholar cap or bandana feather
        if (showHatOrScarf) {
          ctx.fillStyle = '#b91c1c';
          ctx.beginPath();
          ctx.ellipse(0, 3 * scale, 22 * scale, 6 * scale, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillRect(-12 * scale, -10 * scale, 24 * scale, 14 * scale);
        }
      }

      // 2. TORSO
      if (showTorso) {
        ctx.fillStyle = '#2563eb'; // blue tunic/vest
        ctx.strokeStyle = '#1e3a8a';
        ctx.lineWidth = 2 * scale;
        ctx.beginPath();
        ctx.roundRect(-14 * scale, 36 * scale, 28 * scale, 48 * scale, 6 * scale);
        ctx.fill();
        ctx.stroke();

        // Tunic buttons
        ctx.fillStyle = '#fbbf24';
        for (let b = 0; b < 3; b++) {
          ctx.beginPath();
          ctx.arc(0, (46 + b * 12) * scale, 2 * scale, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 3. LEFT ARM
      if (showLeftArm) {
        ctx.strokeStyle = '#1e40af';
        ctx.lineWidth = 6 * scale;
        ctx.lineCap = 'round';
        ctx.beginPath();
        if (currentGS === 'VICTORY') {
          // Cheering raised arm
          ctx.moveTo(-12 * scale, 44 * scale);
          ctx.lineTo(-28 * scale, 18 * scale);
        } else {
          // Hanging / grasping arm
          ctx.moveTo(-12 * scale, 44 * scale);
          ctx.lineTo(-30 * scale, 68 * scale);
        }
        ctx.stroke();

        // Puppet hand
        ctx.fillStyle = '#fde68a';
        ctx.beginPath();
        const handY = currentGS === 'VICTORY' ? 18 * scale : 68 * scale;
        ctx.arc(-28 * scale, handY, 4 * scale, 0, Math.PI * 2);
        ctx.fill();
      }

      // 4. RIGHT ARM
      if (showRightArm) {
        ctx.strokeStyle = '#1e40af';
        ctx.lineWidth = 6 * scale;
        ctx.lineCap = 'round';
        ctx.beginPath();
        if (currentGS === 'VICTORY') {
          // Cheering raised arm
          ctx.moveTo(12 * scale, 44 * scale);
          ctx.lineTo(28 * scale, 18 * scale);
        } else {
          ctx.moveTo(12 * scale, 44 * scale);
          ctx.lineTo(30 * scale, 68 * scale);
        }
        ctx.stroke();

        // Hand
        ctx.fillStyle = '#fde68a';
        ctx.beginPath();
        const handY = currentGS === 'VICTORY' ? 18 * scale : 68 * scale;
        ctx.arc(28 * scale, handY, 4 * scale, 0, Math.PI * 2);
        ctx.fill();
      }

      // 5. LEFT LEG
      if (showLeftLeg) {
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 7 * scale;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(-7 * scale, 84 * scale);
        ctx.lineTo(-14 * scale, 126 * scale);
        ctx.stroke();

        // Boot
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-18 * scale, 124 * scale, 12 * scale, 7 * scale);
      }

      // 6. RIGHT LEG
      if (showRightLeg) {
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 7 * scale;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(7 * scale, 84 * scale);
        ctx.lineTo(14 * scale, 126 * scale);
        ctx.stroke();

        // Boot
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(8 * scale, 124 * scale, 12 * scale, 7 * scale);
      }

      ctx.restore(); // end puppet
      ctx.restore(); // end rope

      // ----------------- DRAW PARTICLE SYSTEM -----------------
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.08; // mild gravity
        p.alpha -= p.decay;
        p.rotation += p.vRot;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;

        if (p.type === 'confetti') {
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        } else if (p.type === 'splinter') {
          ctx.fillRect(-p.size / 2, -1, p.size, 2.5);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      ctx.restore(); // end camera shake
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      clearInterval(ambientInterval);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden select-none pointer-events-none">
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
};
