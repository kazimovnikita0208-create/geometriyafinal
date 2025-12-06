"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface AnimatedGradientBackgroundProps {
  className?: string;
  children?: React.ReactNode;
  intensity?: "subtle" | "medium" | "strong";
}

interface Beam {
  x: number;
  y: number;
  width: number;
  length: number;
  angle: number;
  speed: number;
  opacity: number;
  hue: number;
  pulse: number;
  pulseSpeed: number;
}

function createBeam(width: number, height: number): Beam {
  const angle = -35 + Math.random() * 10;
  return {
    x: Math.random() * width * 1.5 - width * 0.25,
    y: Math.random() * height * 1.5 - height * 0.25,
    width: 120 + Math.random() * 120, // Шире для лучшей видимости
    length: height * 2.5,
    angle: angle,
    speed: 0.5 + Math.random() * 0.8, // Чуть быстрее для заметности
    opacity: 0.6 + Math.random() * 0.4, // УВЕЛИЧЕНА видимость для лучшей заметности
    hue: 270 + Math.random() * 30, // Фиолетовый диапазон (270-300)
    pulse: Math.random() * Math.PI * 2,
    pulseSpeed: 0.02 + Math.random() * 0.03, // Чуть быстрее пульсация
  };
}

export function BeamsBackground({
  className,
  children,
  intensity = "medium",
}: AnimatedGradientBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const beamsRef = useRef<Beam[]>([]);
  const animationFrameRef = useRef<number>(0);
  
  // ОПТИМИЗАЦИЯ: Уменьшено количество лучей для производительности
  const MINIMUM_BEAMS = 8; // Оптимальный баланс

  const opacityMap = {
    subtle: 0.8,
    medium: 1.1,
    strong: 1.4,
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.warn('BeamsBackground: Canvas ref is null');
      return;
    }

    const ctx = canvas.getContext("2d", { 
      alpha: true, // Включаем альфа-канал для правильного отображения
      desynchronized: true // ОПТИМИЗАЦИЯ: Асинхронный рендеринг
    });
    if (!ctx) {
      console.warn('BeamsBackground: Could not get 2d context');
      return;
    }

    // ОПТИМИЗАЦИЯ: Проверка prefersReducedMotion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      console.log('BeamsBackground: Reduced motion preference detected, skipping animation');
      return; // Не запускаем анимацию если пользователь предпочитает меньше движения
    }

    const updateCanvasSize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2); // ОПТИМИЗАЦИЯ: Ограничиваем DPR
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);

      // ОПТИМИЗАЦИЯ: Меньше лучей
      const totalBeams = MINIMUM_BEAMS;
      beamsRef.current = Array.from({ length: totalBeams }, () =>
        createBeam(width * dpr, height * dpr)
      );
      
      console.log('BeamsBackground: Canvas size updated', {
        width: canvas.width,
        height: canvas.height,
        styleWidth: canvas.style.width,
        styleHeight: canvas.style.height,
        dpr
      });
    };

    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);
    
    console.log('BeamsBackground: Canvas initialized', {
      width: canvas.width,
      height: canvas.height,
      styleWidth: canvas.style.width,
      styleHeight: canvas.style.height,
      beams: beamsRef.current.length,
      canvasVisible: canvas.offsetWidth > 0 && canvas.offsetHeight > 0
    });

    function resetBeam(beam: Beam, index: number, totalBeams: number) {
      if (!canvas) return beam;

      const column = index % 3;
      const spacing = canvas.width / 3;

      beam.y = canvas.height + 100;
      beam.x =
        column * spacing +
        spacing / 2 +
        (Math.random() - 0.5) * spacing * 0.5;
      beam.width = 120 + Math.random() * 120;
      beam.speed = 0.5 + Math.random() * 0.8;
      beam.hue = 270 + (index * 30) / totalBeams; // Фиолетовый градиент
      beam.opacity = 0.6 + Math.random() * 0.4; // Увеличена видимость
      return beam;
    }

    function drawBeam(ctx: CanvasRenderingContext2D, beam: Beam) {
      ctx.save();
      ctx.translate(beam.x, beam.y);
      ctx.rotate((beam.angle * Math.PI) / 180);

      // Calculate pulsing opacity
      const pulsingOpacity =
        beam.opacity *
        (0.8 + Math.sin(beam.pulse) * 0.2) *
        opacityMap[intensity];

      const gradient = ctx.createLinearGradient(0, 0, 0, beam.length);

      // Enhanced gradient with multiple color stops - фиолетовые оттенки (увеличена яркость и непрозрачность)
      // Для screen blend mode нужны очень яркие цвета (lightness 90-95%) для видимости на темном фоне
      const baseOpacity = Math.min(pulsingOpacity * 1.5, 1);
      gradient.addColorStop(0, `hsla(${beam.hue}, 90%, 92%, 0)`);
      gradient.addColorStop(
        0.1,
        `hsla(${beam.hue}, 90%, 92%, ${baseOpacity * 0.9})`
      );
      gradient.addColorStop(
        0.4,
        `hsla(${beam.hue}, 90%, 92%, ${baseOpacity})`
      );
      gradient.addColorStop(
        0.6,
        `hsla(${beam.hue}, 90%, 92%, ${baseOpacity})`
      );
      gradient.addColorStop(
        0.9,
        `hsla(${beam.hue}, 90%, 92%, ${baseOpacity * 0.9})`
      );
      gradient.addColorStop(1, `hsla(${beam.hue}, 90%, 92%, 0)`);

      ctx.fillStyle = gradient;
      ctx.fillRect(-beam.width / 2, 0, beam.width, beam.length);
      ctx.restore();
    }

    let lastTime = 0;
    const fps = 30; // ОПТИМИЗАЦИЯ: Ограничиваем FPS до 30 вместо 60
    const fpsInterval = 1000 / fps;

    function animate(currentTime: number) {
      if (!canvas || !ctx) {
        console.warn('BeamsBackground: Canvas or context is null in animate');
        return;
      }

      // ОПТИМИЗАЦИЯ: Throttle анимации до 30 FPS
      const elapsed = currentTime - lastTime;
      if (elapsed < fpsInterval) {
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }
      lastTime = currentTime - (elapsed % fpsInterval);

      // Очищаем canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const totalBeams = beamsRef.current.length;
      if (totalBeams === 0) {
        console.warn('BeamsBackground: No beams to animate');
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }

      let drawnCount = 0;
      beamsRef.current.forEach((beam, index) => {
        beam.y -= beam.speed;
        beam.pulse += beam.pulseSpeed;

        // Reset beam when it goes off screen
        if (beam.y + beam.length < -100) {
          resetBeam(beam, index, totalBeams);
        }

        drawBeam(ctx, beam);
        drawnCount++;
      });
      
      // Логируем каждые 60 кадров (примерно раз в 2 секунды при 30 FPS)
      if (Math.floor(currentTime / 1000) % 2 === 0 && Math.floor(currentTime) % 2000 < 33) {
        console.log('BeamsBackground: Drawing beams', {
          totalBeams: beamsRef.current.length,
          drawnCount,
          canvasWidth: canvas.width,
          canvasHeight: canvas.height,
          firstBeam: beamsRef.current[0] ? {
            x: beamsRef.current[0].x,
            y: beamsRef.current[0].y,
            opacity: beamsRef.current[0].opacity
          } : null
        });
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    }

    console.log('BeamsBackground: Starting animation loop');
    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", updateCanvasSize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [intensity]);

  return (
    <div
      className={cn(
        "relative min-h-screen w-full overflow-hidden",
        className
      )}
    >
      {/* Фиксированный фон, который покрывает весь экран и всегда виден */}
      <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none" style={{ zIndex: -10 }}>
        {/* Статический градиентный фон */}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-purple-950 to-black" />
        
        {/* Canvas с анимированными лучами */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 pointer-events-none"
          style={{ 
            width: '100vw',
            height: '100vh',
            minWidth: '100vw',
            minHeight: '100vh',
            filter: "blur(6px)",
            mixBlendMode: "screen",
            opacity: 1,
            display: 'block'
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
