import React, { useEffect, useRef } from 'react';

// Configuration for the particle background effect
const maxPoints = 50;  // Number of nodes in the network
const edgeRange = 160;  // Max distance to draw a line between nodes
const driftSpeed = 0.3; // How fast they move on their own
const pulseFrequency = 55; // Frames between each "data pulse"
const touchRadius = 180; // Distance for mouse attraction
const touchPull = 0.015; // How strongly the mouse pulls nodes

/* brand palette (light / dark) */
const PALETTE = {
  light: {
    nodeA: [59, 130, 246],   // blue-500
    nodeB: [139, 92, 246],   // violet-500
    nodeC: [16, 185, 129],   // emerald-500
    edge:  [99, 102, 241],   // indigo-500
    pulse: [255, 255, 255],
    orbs: [
      { c: [59, 130, 246],  a: 0.07 },
      { c: [139, 92, 246],  a: 0.06 },
      { c: [16, 185, 129],  a: 0.04 },
    ],
  },
  dark: {
    nodeA: [99, 179, 255],   // blue lighter
    nodeB: [192, 132, 252],  // violet lighter
    nodeC: [52, 211, 153],   // emerald lighter
    edge:  [139, 92, 246],
    pulse: [255, 255, 255],
    orbs: [
      { c: [99, 102, 241],  a: 0.12 },
      { c: [139, 92, 246],  a: 0.10 },
      { c: [16, 185, 129],  a: 0.07 },
    ],
  },
};

function getRandom(a, b) { return a + Math.random() * (b - a); }
function lerp(a, b, t) { return a + (b - a) * t; }

// Main canvas component for the background animation
const CanvasBackground = () => {
  const canvasRef  = useRef(null);
  const stateRef   = useRef({});   // mutable runtime state (no re-renders)
  const rafRef     = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext('2d');
    const S      = stateRef.current;

    // Handle window resizing
    function resize() {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    // Keep track of mouse position for interactivity
    // Initialize state
    S.frame = 0;
    S.pulses = [];
    S.mouse = { x: -9999, y: -9999 };
    function onMove(e) {
      const r = canvas.getBoundingClientRect();
      S.mouse.x = e.clientX - r.left;
      S.mouse.y = e.clientY - r.top;
    }
    function onLeave() { S.mouse.x = S.mouse.y = -9999; }
    canvas.parentElement.addEventListener('mousemove', onMove);
    canvas.parentElement.addEventListener('mouseleave', onLeave);

    // Initialize nodes with random positions and velocities
    const nodeColors = ['nodeA', 'nodeB', 'nodeC'];
    S.nodes = Array.from({ length: maxPoints }, (_, i) => ({
      x  : getRandom(0, canvas.width),
      y  : getRandom(0, canvas.height),
      vx : getRandom(-driftSpeed, driftSpeed),
      vy : getRandom(-driftSpeed, driftSpeed),
      r  : getRandom(2.5, 5.5),
      colorKey: nodeColors[i % 3],
      phase: getRandom(0, Math.PI * 2),
    }));

    // Animation loop
    function draw() {
      S.frame++;
      const W   = canvas.width;
      const H   = canvas.height;
      const now = Date.now();
      const t   = now / 1000;
      const dark = document.documentElement.classList.contains('dark');
      const pal  = dark ? PALETTE.dark : PALETTE.light;

      ctx.clearRect(0, 0, W, H);

      // Draw some subtle ambient glows in the background
      const orbDefs = [
        { fx: 0.12, fy: 0.18, rx: 260, ry: 200 },
        { fx: 0.88, fy: 0.80, rx: 300, ry: 230 },
        { fx: 0.50, fy: 0.55, rx: 200, ry: 160 },
      ];
      orbDefs.forEach(({ fx, fy, rx, ry }, i) => {
        const ox = Math.sin(t * 0.35 + i * 1.7) * 40;
        const oy = Math.cos(t * 0.28 + i * 1.1) * 28;
        const cx = W * fx + ox;
        const cy = H * fy + oy;
        const { c, a } = pal.orbs[i];
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rx);
        g.addColorStop(0, `rgba(${c},${a})`);
        g.addColorStop(1, `rgba(${c},0)`);
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
      });

      // Update node positions and handle interactivity
      const nodes = S.nodes;
      nodes.forEach(n => {
        const mdx = S.mouse.x - n.x;
        const mdy = S.mouse.y - n.y;
        const mdist = Math.hypot(mdx, mdy);
        if (mdist < touchRadius && mdist > 1) {
          n.vx += (mdx / mdist) * touchPull;
          n.vy += (mdy / mdist) * touchPull;
        }

        const spd = Math.hypot(n.vx, n.vy);
        if (spd > driftSpeed * 2.5) {
          n.vx = (n.vx / spd) * driftSpeed * 2.5;
          n.vy = (n.vy / spd) * driftSpeed * 2.5;
        }

        n.x += n.vx;
        n.y += n.vy;

        // wrap edges (instead of bounce — feels smoother for AI viz)
        if (n.x < -20)      n.x = W + 20;
        if (n.x > W + 20)   n.x = -20;
        if (n.y < -20)      n.y = H + 20;
        if (n.y > H + 20)   n.y = -20;
      });

      // Rebuild the edge list based on proximity
      S.edges = [];
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx   = nodes[j].x - nodes[i].x;
          const dy   = nodes[j].y - nodes[i].y;
          const dist = Math.hypot(dx, dy);
          if (dist < edgeRange) {
            S.edges.push({ i, j, dist, dx, dy });
          }
        }
      }

      // Trigger new pulses occasionally
      if (S.frame % pulseFrequency === 0 && S.edges.length) {
        const e = S.edges[Math.floor(Math.random() * S.edges.length)];
        const fwd = Math.random() > 0.5;
        S.pulses.push({ from: fwd ? e.i : e.j, to: fwd ? e.j : e.i, t: 0 });
      }

      // Draw lines between nodes
      ctx.lineCap = 'round';
      S.edges.forEach(({ i, j, dist }) => {
        const fade = 1 - dist / edgeRange;
        const edgeA = dark ? fade * 0.28 : fade * 0.18;
        const [er, eg, eb] = pal.edge;
        ctx.beginPath();
        ctx.moveTo(nodes[i].x, nodes[i].y);
        ctx.lineTo(nodes[j].x, nodes[j].y);
        ctx.strokeStyle = `rgba(${er},${eg},${eb},${edgeA})`;
        ctx.lineWidth = 0.9;
        ctx.stroke();
      });

      // Draw and move pulses along the edges
      S.pulses = S.pulses.filter(p => p.t <= 1);
      S.pulses.forEach(p => {
        const nFrom = nodes[p.from];
        const nTo   = nodes[p.to];
        const still = S.edges.some(
          e => (e.i === p.from && e.j === p.to) ||
               (e.i === p.to   && e.j === p.from)
        );
        if (!still) { p.t = 2; return; }

        const px = lerp(nFrom.x, nTo.x, p.t);
        const py = lerp(nFrom.y, nTo.y, p.t);

        const gPulse = ctx.createRadialGradient(px, py, 0, px, py, 8);
        gPulse.addColorStop(0, `rgba(255,255,255,${dark ? 0.95 : 0.85})`);
        gPulse.addColorStop(0.4, `rgba(${pal.edge},0.5)`);
        gPulse.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.beginPath();
        ctx.arc(px, py, 8, 0, Math.PI * 2);
        ctx.fillStyle = gPulse;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(px, py, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${dark ? 1 : 0.95})`;
        ctx.fill();

        p.t += 1.8 / 60 / (Math.hypot(nTo.x - nFrom.x, nTo.y - nFrom.y) / 100);
      });

      // Draw the nodes themselves
      nodes.forEach(n => {
        const pulse = 0.6 + 0.4 * Math.sin(t * 1.8 + n.phase);
        const [r, g, b] = pal[n.colorKey];

        const glowR = n.r * 4.5 * pulse;
        const glow  = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, glowR);
        glow.addColorStop(0, `rgba(${r},${g},${b},${dark ? 0.35 : 0.2})`);
        glow.addColorStop(1, `rgba(${r},${g},${b},0)`);
        ctx.beginPath();
        ctx.arc(n.x, n.y, glowR, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();

        const nodeGrad = ctx.createRadialGradient(
          n.x - n.r * 0.3, n.y - n.r * 0.3, 0,
          n.x, n.y, n.r
        );
        nodeGrad.addColorStop(0, `rgba(255,255,255,${dark ? 0.9 : 0.8})`);
        nodeGrad.addColorStop(1, `rgba(${r},${g},${b},${dark ? 0.95 : 0.85})`);
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r * pulse * 0.85 + n.r * 0.15, 0, Math.PI * 2);
        ctx.fillStyle = nodeGrad;
        ctx.fill();
      });

      rafRef.current = requestAnimationFrame(draw);
    }

    if (canvas && canvas.parentElement) {
      draw();
    }

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      canvas.parentElement?.removeEventListener('mousemove', onMove);
      canvas.parentElement?.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
};

export default CanvasBackground;
