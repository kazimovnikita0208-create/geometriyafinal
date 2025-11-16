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
        width: 60 + Math.random() * 100,  // Увеличил ширину
        length: height * 2.5,
        angle: angle,
        speed: 1.5 + Math.random() * 2.0,  // Увеличил скорость
        opacity: 0.3 + Math.random() * 0.4,  // Увеличил непрозрачность
        // Фиолетовый диапазон для студии "Геометрия"
        hue: 270 + Math.random() * 30,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: 0.05 + Math.random() * 0.05,  // Увеличил скорость пульсации
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
    const MINIMUM_BEAMS = 30;  // Увеличил количество лучей

    const opacityMap = {
        subtle: 0.8,
        medium: 1.2,
        strong: 1.5,
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) {
            console.error('Canvas не найден');
            return;
        }

        const ctx = canvas.getContext("2d");
        if (!ctx) {
            console.error('Context не получен');
            return;
        }

        console.log('✅ Canvas инициализирован, запуск анимации...');

        const updateCanvasSize = () => {
            const dpr = window.devicePixelRatio || 1;
            const rect = canvas.getBoundingClientRect();
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            canvas.style.width = `${rect.width}px`;
            canvas.style.height = `${rect.height}px`;
            ctx.scale(dpr, dpr);

            const totalBeams = Math.floor(MINIMUM_BEAMS * 1.5);
            beamsRef.current = Array.from({ length: totalBeams }, () =>
                createBeam(rect.width, rect.height)
            );
            
            console.log(`✅ Создано ${totalBeams} лучей`);
        };

        updateCanvasSize();
        window.addEventListener("resize", updateCanvasSize);

        function resetBeam(beam: Beam, index: number, totalBeams: number) {
            if (!canvas) return beam;
            
            const rect = canvas.getBoundingClientRect();
            const column = index % 3;
            const spacing = rect.width / 3;

            beam.y = rect.height + 100;
            beam.x =
                column * spacing +
                spacing / 2 +
                (Math.random() - 0.5) * spacing * 0.5;
            beam.width = 100 + Math.random() * 100;
            beam.speed = 0.5 + Math.random() * 0.4;
            beam.hue = 270 + (index * 30) / totalBeams;
            beam.opacity = 0.2 + Math.random() * 0.1;
            return beam;
        }

        function drawBeam(ctx: CanvasRenderingContext2D, beam: Beam) {
            ctx.save();
            ctx.translate(beam.x, beam.y);
            ctx.rotate((beam.angle * Math.PI) / 180);

            const pulsingOpacity =
                beam.opacity *
                (0.8 + Math.sin(beam.pulse) * 0.2) *
                opacityMap[intensity];

            const gradient = ctx.createLinearGradient(0, 0, 0, beam.length);

            gradient.addColorStop(0, `hsla(${beam.hue}, 85%, 65%, 0)`);
            gradient.addColorStop(
                0.1,
                `hsla(${beam.hue}, 85%, 65%, ${pulsingOpacity * 0.5})`
            );
            gradient.addColorStop(
                0.4,
                `hsla(${beam.hue}, 85%, 65%, ${pulsingOpacity})`
            );
            gradient.addColorStop(
                0.6,
                `hsla(${beam.hue}, 85%, 65%, ${pulsingOpacity})`
            );
            gradient.addColorStop(
                0.9,
                `hsla(${beam.hue}, 85%, 65%, ${pulsingOpacity * 0.5})`
            );
            gradient.addColorStop(1, `hsla(${beam.hue}, 85%, 65%, 0)`);

            ctx.fillStyle = gradient;
            ctx.fillRect(-beam.width / 2, 0, beam.width, beam.length);
            ctx.restore();
        }

        let frameCount = 0;
        function animate() {
            if (!canvas || !ctx) return;

            const rect = canvas.getBoundingClientRect();
            ctx.clearRect(0, 0, rect.width, rect.height);
            ctx.filter = "blur(20px)";  // Уменьшил размытие для более четких лучей

            const totalBeams = beamsRef.current.length;
            beamsRef.current.forEach((beam, index) => {
                beam.y -= beam.speed;
                beam.pulse += beam.pulseSpeed;

                if (beam.y + beam.length < -100) {
                    resetBeam(beam, index, totalBeams);
                }

                drawBeam(ctx, beam);
            });

            // Логируем каждые 60 кадров
            frameCount++;
            if (frameCount % 60 === 0) {
                console.log(`🎬 Анимация работает, кадр ${frameCount}`);
            }

            animationFrameRef.current = requestAnimationFrame(animate);
        }

        animate();

        return () => {
            console.log('🛑 Остановка анимации');
            window.removeEventListener("resize", updateCanvasSize);
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [intensity]);

    return (
        <div
            className={cn(
                "relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-purple-950 via-black to-purple-900",
                className
            )}
        >
            <canvas
                ref={canvasRef}
                className="absolute inset-0"
                style={{ 
                    width: '100%',
                    height: '100%',
                    filter: "blur(8px)"
                }}
            />

            <div className="absolute inset-0 bg-black/10" />

            {/* Контент поверх фона */}
            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
}
