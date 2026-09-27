"use client";

import { useEffect, useRef } from "react";

export default function Background() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    let animationFrame: number;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    resize();

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);

    const N = 48;

    const nodes = Array.from({ length: N }, () => ({
      x: Math.random(),
      y: Math.random(),

      vx: (Math.random() - 0.5) * 0.0003,
      vy: (Math.random() - 0.5) * 0.0003,

      p: Math.random() * Math.PI * 2,
    }));

    const draw = () => {
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      nodes.forEach((node) => {
        node.x += node.vx;
        node.y += node.vy;
        node.p += 0.018;

        if (node.x < 0 || node.x > 1) {
          node.vx *= -1;
        }

        if (node.y < 0 || node.y > 1) {
          node.vy *= -1;
        }
      });

      for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
          const dx = (nodes[i].x - nodes[j].x) * width;
          const dy = (nodes[i].y - nodes[j].y) * height;

          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 160) {
            const opacity = (1 - distance / 160) * 0.42;

            ctx.beginPath();

            ctx.moveTo(
              nodes[i].x * width,
              nodes[i].y * height
            );

            ctx.lineTo(
              nodes[j].x * width,
              nodes[j].y * height
            );

            ctx.strokeStyle = `rgba(0,140,255,${opacity})`;

            ctx.lineWidth = 0.8;

            ctx.stroke();
          }
        }
      }

      nodes.forEach((node) => {
        const glow = Math.sin(node.p) * 0.4 + 0.6;

        const x = node.x * width;
        const y = node.y * height;

        const gradient = ctx.createRadialGradient(
          x,
          y,
          0,
          x,
          y,
          12
        );

        gradient.addColorStop(
          0,
          `rgba(47,183,255,${0.12 * glow})`
        );

        gradient.addColorStop(
          1,
          "rgba(47,183,255,0)"
        );

        ctx.fillStyle = gradient;

        ctx.beginPath();

        ctx.arc(
          x,
          y,
          12,
          0,
          Math.PI * 2
        );

        ctx.fill();

        ctx.beginPath();

        ctx.arc(
          x,
          y,
          1.5 + glow * 0.8,
          0,
          Math.PI * 2
        );

        ctx.fillStyle = `rgba(105,209,255,${0.58 * glow})`;

        ctx.fill();
      });

      animationFrame = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <>
      <div
        className="
          pointer-events-none
          absolute
          inset-0
          z-0
        "
        style={{
          // background: "#040812",
        }}
      />

      <canvas
        ref={canvasRef}
        className="
          pointer-events-none
          absolute
          inset-0
          z-[1]
          h-full
          w-full
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          z-[2]
        "
        style={{
          backgroundImage: `
            linear-gradient(
              rgba(0,140,255,.025) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(0,140,255,.025) 1px,
              transparent 1px
            )
          `,
          backgroundSize: "52px 52px",
        }}
      />

      <div
        className="
          pointer-events-none
          absolute
          z-[2]
        "
        style={{
          width: 720,
          height: 720,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(0,140,255,.11) 0%, transparent 70%)",
          top: "5%",
          left: "15%",
        }}
      />

      <div
        className="
          pointer-events-none
          absolute
          z-[2]
        "
        style={{
          width: 480,
          height: 480,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(47,183,255,.055) 0%, transparent 70%)",
          bottom: "5%",
          right: "8%",
        }}
      />
    </>
  );
}