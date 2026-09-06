import React, { useEffect, useRef, useState, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Prize } from '../../types';

interface SpinWheelCanvasProps {
  prizes: Prize[];
  isSpinning: boolean;
  onSpinRequest: () => void;
  targetSegmentIndex: number | null;
  onSpinComplete: () => void;
  disabled?: boolean;
}

// Neon vibrant segment colors
const SLICE_COLORS = [
  '#ec4899', // Pink
  '#8b5cf6', // Violet
  '#06b6d4', // Cyan
  '#f59e0b', // Amber
  '#10b981', // Emerald
  '#6366f1', // Indigo
  '#f43f5e', // Rose
  '#14b8a6', // Teal
];

export const SpinWheelCanvas: React.FC<SpinWheelCanvasProps> = ({
  prizes,
  isSpinning,
  onSpinRequest,
  targetSegmentIndex,
  onSpinComplete,
  disabled = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [currentRotation, setCurrentRotation] = useState<number>(0);
  const animFrameId = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Play short synthesized tick click sound on segment boundary crossing
  const playTickSound = useCallback(() => {
    try {
      if (!audioContextRef.current) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) audioContextRef.current = new AudioCtx();
      }
      if (audioContextRef.current && audioContextRef.current.state === 'running') {
        const osc = audioContextRef.current.createOscillator();
        const gain = audioContextRef.current.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(480, audioContextRef.current.currentTime);
        gain.gain.setValueAtTime(0.08, audioContextRef.current.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioContextRef.current.currentTime + 0.04);
        osc.connect(gain);
        gain.connect(audioContextRef.current.destination);
        osc.start();
        osc.stop(audioContextRef.current.currentTime + 0.04);
      }
    } catch {
      // Audio context might be restricted before interaction
    }
  }, []);

  // Draw the entire wheel on canvas
  const drawWheel = useCallback(
    (rotationAngleDeg: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(centerX, centerY) - 22;

      ctx.clearRect(0, 0, width, height);

      if (!prizes || prizes.length === 0) {
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#94a3b8';
        ctx.font = 'bold 16px Outfit, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Loading Prizes...', centerX, centerY);
        return;
      }

      const totalSlices = prizes.length;
      const sliceAngleRad = (2 * Math.PI) / totalSlices;
      const currentRotRad = (rotationAngleDeg * Math.PI) / 180;

      // 1. Draw outer metallic bezel glow & ring
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius + 14, 0, Math.PI * 2);
      ctx.fillStyle = '#0f172a';
      ctx.shadowColor = 'rgba(217, 70, 239, 0.45)';
      ctx.shadowBlur = 24;
      ctx.fill();

      // Outer golden rim
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius + 8, 0, Math.PI * 2);
      ctx.lineWidth = 10;
      ctx.strokeStyle = '#38bdf8';
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 15;
      ctx.stroke();

      // Decorative outer light bulbs
      const numLights = totalSlices * 3;
      for (let i = 0; i < numLights; i++) {
        const lightAngle = (i * 2 * Math.PI) / numLights;
        const lx = centerX + (radius + 12) * Math.cos(lightAngle);
        const ly = centerY + (radius + 12) * Math.sin(lightAngle);
        ctx.beginPath();
        ctx.arc(lx, ly, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = i % 2 === 0 ? '#fde047' : '#ffffff';
        ctx.shadowColor = '#fde047';
        ctx.shadowBlur = 8;
        ctx.fill();
      }
      ctx.restore();

      // 2. Draw Wheel Slices
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(currentRotRad);

      for (let i = 0; i < totalSlices; i++) {
        const startAngle = i * sliceAngleRad;
        const endAngle = startAngle + sliceAngleRad;
        const prize = prizes[i];

        // Slice wedge
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, radius, startAngle, endAngle);
        ctx.closePath();

        // Alternating neon colors
        const color = SLICE_COLORS[i % SLICE_COLORS.length];
        ctx.fillStyle = color;
        ctx.fill();

        // Slice separator line
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.stroke();

        // Inner shadow / gradient overlay on slice edge
        ctx.save();
        ctx.clip();
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.lineWidth = 14;
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.stroke();
        ctx.restore();

        // 3. Slice Labels (Text)
        ctx.save();
        const midAngle = startAngle + sliceAngleRad / 2;
        ctx.rotate(midAngle);
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px "Plus Jakarta Sans", sans-serif';
        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur = 4;

        // Truncate name cleanly if long
        let label = prize.name;
        if (label.length > 22) {
          label = label.substring(0, 20) + '...';
        }

        ctx.fillText(label, radius - 20, 0);
        ctx.restore();
      }

      ctx.restore();

      // 4. Central Metallic Cap
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, 38, 0, Math.PI * 2);
      ctx.fillStyle = '#090d16';
      ctx.shadowColor = '#000';
      ctx.shadowBlur = 10;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(centerX, centerY, 32, 0, Math.PI * 2);
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#f43f5e';
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(centerX, centerY, 28, 0, Math.PI * 2);
      ctx.fillStyle = '#1e293b';
      ctx.fill();

      // Center Hub Icon/Text
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 11px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(244, 63, 94, 0.8)';
      ctx.shadowBlur = 8;
      ctx.fillText('MOBILE', centerX, centerY - 5);
      ctx.fillText('HUB', centerX, centerY + 7);
      ctx.restore();

      // 5. Top Pointer Indicator (Fixed arrow at 12 o'clock pointing downward)
      ctx.save();
      const pointerY = centerY - radius - 8;
      ctx.beginPath();
      ctx.moveTo(centerX - 16, pointerY - 14);
      ctx.lineTo(centerX + 16, pointerY - 14);
      ctx.lineTo(centerX, pointerY + 16);
      ctx.closePath();

      ctx.fillStyle = '#fde047';
      ctx.shadowColor = 'rgba(253, 224, 71, 0.8)';
      ctx.shadowBlur = 16;
      ctx.fill();

      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#78350f';
      ctx.stroke();

      // Little pivot circle at top of pointer
      ctx.beginPath();
      ctx.arc(centerX, pointerY - 14, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#ef4444';
      ctx.fill();
      ctx.restore();
    },
    [prizes]
  );

  // Redraw on canvas resize or rotation change
  useEffect(() => {
    drawWheel(currentRotation);
  }, [currentRotation, drawWheel]);

  // Handle Animated Spin when targetSegmentIndex is received
  useEffect(() => {
    if (!isSpinning || targetSegmentIndex === null || prizes.length === 0) return;

    // Activate audio context if possible
    if (!audioContextRef.current) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) audioContextRef.current = new AudioCtx();
    }
    if (audioContextRef.current?.state === 'suspended') {
      audioContextRef.current.resume().catch(() => {});
    }

    const totalSlices = prizes.length;
    const sliceAngleDeg = 360 / totalSlices;

    // Center angle of target segment relative to 0deg start
    const sliceCenterAngle = (targetSegmentIndex + 0.5) * sliceAngleDeg;

    // Pointer is at the top (270 degrees in canvas coordinates)
    // When wheel rotates by R, (sliceCenterAngle + R) % 360 = 270
    // So target stop angle mod 360 = (270 - sliceCenterAngle) mod 360
    const normalizedTargetStop = (((270 - sliceCenterAngle) % 360) + 360) % 360;

    // Add 6 to 8 full 360-degree rotations for a realistic dramatic build-up
    const fullSpins = 6;
    const startAngle = currentRotation % 360;
    const totalDelta = (360 * fullSpins) + ((normalizedTargetStop - startAngle + 360) % 360);
    const finalAngle = currentRotation + totalDelta;

    const duration = 5200; // 5.2 seconds for realistic spin feel
    const startTime = performance.now();
    let lastTickSlice = -1;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Custom ease-out quintic for realistic deceleration
      const easeOut = 1 - Math.pow(1 - progress, 4.5);
      const newAngle = currentRotation + totalDelta * easeOut;

      // Check slice boundary for audio tick
      const currentNormalized = (270 - (newAngle % 360) + 360) % 360;
      const currentSlice = Math.floor(currentNormalized / sliceAngleDeg);
      if (currentSlice !== lastTickSlice) {
        lastTickSlice = currentSlice;
        playTickSound();
      }

      drawWheel(newAngle);

      if (progress < 1) {
        animFrameId.current = requestAnimationFrame(animate);
      } else {
        setCurrentRotation(finalAngle);
        drawWheel(finalAngle);

        // Burst celebration confetti!
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#ec4899', '#8b5cf6', '#06b6d4', '#f59e0b', '#10b981'],
        });

        // Trigger onComplete callback after a brief celebratory pause
        setTimeout(() => {
          onSpinComplete();
        }, 800);
      }
    };

    animFrameId.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [isSpinning, targetSegmentIndex, prizes, drawWheel, playTickSound, onSpinComplete]);

  return (
    <div className="relative flex flex-col items-center justify-center p-4">
      {/* Canvas container with neon responsive bounds */}
      <div className="relative w-[340px] h-[340px] sm:w-[440px] sm:h-[440px] md:w-[480px] md:h-[480px] max-w-full aspect-square flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={500}
          height={500}
          className="w-full h-full object-contain filter drop-shadow-2xl"
        />

        {/* Central interactive Spin Button */}
        <button
          onClick={onSpinRequest}
          disabled={disabled || isSpinning}
          className="absolute z-20 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-amber-400 via-rose-500 to-fuchsia-600 text-white font-black text-xs sm:text-sm tracking-wider uppercase shadow-xl shadow-rose-600/50 hover:scale-105 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center border-2 border-white/40"
        >
          {isSpinning ? (
            <span className="text-[10px] animate-pulse">SPINNING</span>
          ) : (
            <span>SPIN!</span>
          )}
        </button>
      </div>
    </div>
  );
};
