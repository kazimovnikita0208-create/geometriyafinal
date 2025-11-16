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
    width: 100 + Math.random() * 100, // Еще шире
    length: height * 2.5,
    angle: angle,
    speed: 0.5 + Math.random() * 0.8, // Чуть быстрее для заметности
    opacity: 0.25 + Math.random() * 0.2, // УВЕЛИЧЕНА видимость
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
    subtle: 0.6,
    medium: 0.9,
    strong: 1.2,
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { 
      alpha: false, // ОПТИМИЗАЦИЯ: Отключаем альфа-канал
      desynchronized: true // ОПТИМИЗАЦИЯ: Асинхронный рендеринг
    });
    if (!ctx) return;

    // ОПТИМИЗАЦИЯ: Проверка prefersReducedMotion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      return; // Не запускаем анимацию если пользователь предпочитает меньше движения
    }

    const updateCanvasSize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2); // ОПТИМИЗАЦИЯ: Ограничиваем DPR
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);

      // ОПТИМИЗАЦИЯ: Меньше лучей
      const totalBeams = MINIMUM_BEAMS;
      beamsRef.current = Array.from({ length: totalBeams }, () =>
        createBeam(canvas.width, canvas.height)
      );
    };

    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);
    
    console.log('BeamsBackground: Animation started with', beamsRef.current.length, 'beams');

    function resetBeam(beam: Beam, index: number, totalBeams: number) {
      if (!canvas) return beam;

      const column = index % 3;
      const spacing = canvas.width / 3;

      beam.y = canvas.height + 100;
      beam.x =
        column * spacing +
        spacing / 2 +
        (Math.random() - 0.5) * spacing * 0.5;
      beam.width = 100 + Math.random() * 100;
      beam.speed = 0.5 + Math.random() * 0.8;
      beam.hue = 270 + (index * 30) / totalBeams; // Фиолетовый градиент
      beam.opacity = 0.25 + Math.random() * 0.2;
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

      // Enhanced gradient with multiple color stops - фиолетовые оттенки
      gradient.addColorStop(0, `hsla(${beam.hue}, 75%, 60%, 0)`);
      gradient.addColorStop(
        0.1,
        `hsla(${beam.hue}, 75%, 60%, ${pulsingOpacity * 0.5})`
      );
      gradient.addColorStop(
        0.4,
        `hsla(${beam.hue}, 75%, 60%, ${pulsingOpacity})`
      );
      gradient.addColorStop(
        0.6,
        `hsla(${beam.hue}, 75%, 60%, ${pulsingOpacity})`
      );
      gradient.addColorStop(
        0.9,
        `hsla(${beam.hue}, 75%, 60%, ${pulsingOpacity * 0.5})`
      );
      gradient.addColorStop(1, `hsla(${beam.hue}, 75%, 60%, 0)`);

      ctx.fillStyle = gradient;
      ctx.fillRect(-beam.width / 2, 0, beam.width, beam.length);
      ctx.restore();
    }

    let lastTime = 0;
    const fps = 30; // ОПТИМИЗАЦИЯ: Ограничиваем FPS до 30 вместо 60
    const fpsInterval = 1000 / fps;

    function animate(currentTime: number) {
      if (!canvas || !ctx) return;

      // ОПТИМИЗАЦИЯ: Throttle анимации до 30 FPS
      const elapsed = currentTime - lastTime;
      if (elapsed < fpsInterval) {
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }
      lastTime = currentTime - (elapsed % fpsInterval);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.filter = "blur(15px)"; // Уменьшен blur для лучшей видимости

      const totalBeams = beamsRef.current.length;
      beamsRef.current.forEach((beam, index) => {
        beam.y -= beam.speed;
        beam.pulse += beam.pulseSpeed;

        // Reset beam when it goes off screen
        if (beam.y + beam.length < -100) {
          resetBeam(beam, index, totalBeams);
        }

        drawBeam(ctx, beam);
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    }

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
      {/* Статический градиентный фон */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-purple-950 to-black" />
      
      {/* Canvas с лучами */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ 
          filter: "blur(5px)", // Уменьшен для четкости
          mixBlendMode: "screen", // Режим наложения для красивого эффекта
          opacity: 0.85 // УВЕЛИЧЕНА видимость
        }}
      />

      {/* ОПТИМИЗАЦИЯ: Убран motion.div с backdrop-blur - слишком тяжелый */}
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
