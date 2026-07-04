import React, { useEffect, useState, useRef } from 'react';
import { PhoneCharmOption } from '../types';

interface CharmPhysicsProps {
  charmOption: PhoneCharmOption | null;
}

interface PhysicsNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  shape: 'circle' | 'heart' | 'star' | 'charm';
}

export const CharmPhysics: React.FC<CharmPhysicsProps> = ({ charmOption }) => {
  const [nodes, setNodes] = useState<PhysicsNode[]>([]);
  const requestRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const lastMousePos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const mouseVelocity = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Get configuration of beads/charms based on style
  const getCharmNodes = (style: string, color: string): PhysicsNode[] => {
    const baseNodes: PhysicsNode[] = [];
    const colorPalette = [
      color, // main selected color
      '#fda4af', // pink
      '#cbd5e1', // silver/slate
      '#a7f3d0', // mint
      '#fef08a', // yellow
      '#c084fc', // purple
    ];

    switch (style) {
      case 'stars':
        return [
          { x: 0, y: 15, vx: 0, vy: 0, radius: 6, color: colorPalette[1], shape: 'circle' },
          { x: 0, y: 35, vx: 0, vy: 0, radius: 8, color: colorPalette[4], shape: 'star' },
          { x: 0, y: 55, vx: 0, vy: 0, radius: 6, color: colorPalette[2], shape: 'circle' },
          { x: 0, y: 75, vx: 0, vy: 0, radius: 8, color: colorPalette[5], shape: 'star' },
          { x: 0, y: 100, vx: 0, vy: 0, radius: 14, color: color, shape: 'charm' }, // Star Charm
        ];
      case 'hearts':
        return [
          { x: 0, y: 15, vx: 0, vy: 0, radius: 7, color: colorPalette[1], shape: 'heart' },
          { x: 0, y: 35, vx: 0, vy: 0, radius: 6, color: colorPalette[2], shape: 'circle' },
          { x: 0, y: 55, vx: 0, vy: 0, radius: 8, color: colorPalette[3], shape: 'heart' },
          { x: 0, y: 75, vx: 0, vy: 0, radius: 6, color: colorPalette[5], shape: 'circle' },
          { x: 0, y: 100, vx: 0, vy: 0, radius: 14, color: color, shape: 'charm' }, // Heart Charm
        ];
      case 'rainbow':
        return [
          { x: 0, y: 15, vx: 0, vy: 0, radius: 6, color: '#f43f5e', shape: 'circle' },
          { x: 0, y: 30, vx: 0, vy: 0, radius: 6, color: '#fb923c', shape: 'circle' },
          { x: 0, y: 45, vx: 0, vy: 0, radius: 6, color: '#facc15', shape: 'circle' },
          { x: 0, y: 60, vx: 0, vy: 0, radius: 6, color: '#4ade80', shape: 'circle' },
          { x: 0, y: 75, vx: 0, vy: 0, radius: 6, color: '#60a5fa', shape: 'circle' },
          { x: 0, y: 100, vx: 0, vy: 0, radius: 14, color: color, shape: 'charm' }, // Rainbow Charm
        ];
      case 'gamer':
        return [
          { x: 0, y: 15, vx: 0, vy: 0, radius: 8, color: '#3b82f6', shape: 'star' },
          { x: 0, y: 35, vx: 0, vy: 0, radius: 6, color: '#a7f3d0', shape: 'circle' },
          { x: 0, y: 55, vx: 0, vy: 0, radius: 8, color: '#10b981', shape: 'circle' },
          { x: 0, y: 75, vx: 0, vy: 0, radius: 6, color: '#f43f5e', shape: 'circle' },
          { x: 0, y: 100, vx: 0, vy: 0, radius: 15, color: color, shape: 'charm' }, // Gamepad Charm
        ];
      case 'beads':
      default:
        return [
          { x: 0, y: 15, vx: 0, vy: 0, radius: 7, color: colorPalette[0], shape: 'circle' },
          { x: 0, y: 35, vx: 0, vy: 0, radius: 7, color: colorPalette[1], shape: 'circle' },
          { x: 0, y: 55, vx: 0, vy: 0, radius: 7, color: colorPalette[4], shape: 'circle' },
          { x: 0, y: 75, vx: 0, vy: 0, radius: 7, color: colorPalette[3], shape: 'circle' },
          { x: 0, y: 100, vx: 0, vy: 0, radius: 13, color: color, shape: 'charm' }, // Teddy bear/fluffy Charm
        ];
    }
  };

  // Initialize nodes when style changes
  useEffect(() => {
    if (charmOption) {
      const initialNodes = getCharmNodes(charmOption.style, charmOption.color);
      setNodes(initialNodes);
    } else {
      setNodes([]);
    }
  }, [charmOption]);

  // Handle Mouse movement to sway the charm
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - lastMousePos.current.x;
      const dy = e.clientY - lastMousePos.current.y;
      
      // Calculate velocity with dampening
      mouseVelocity.current = {
        x: dx * 0.15,
        y: dy * 0.15,
      };

      lastMousePos.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Simulation loop using spring forces & Verlet-ish constraints
  useEffect(() => {
    if (!charmOption || nodes.length === 0) return;

    let localNodes = [...nodes];
    let lastTime = performance.now();

    const updatePhysics = (timestamp: number) => {
      const dt = Math.min((timestamp - lastTime) / 1000, 0.03); // clamp dt
      lastTime = timestamp;

      // Attachment point is anchored at (0, 0)
      const originX = 0;
      const originY = 0;

      // Gravity and Wind forces
      const gravity = 400; // pixels/s^2
      const windFrequency = 1.5; // s
      const windStrength = 40 * Math.sin(timestamp * 0.001 * windFrequency);

      // Mouse displacement force injected into the bottom nodes
      const mouseInfluenceX = mouseVelocity.current.x * 200;
      const mouseInfluenceY = mouseVelocity.current.y * 200;
      
      // Decay mouse velocity
      mouseVelocity.current.x *= 0.9;
      mouseVelocity.current.y *= 0.9;

      // 1. Apply forces (Gravity + Mouse)
      for (let i = 0; i < localNodes.length; i++) {
        const node = localNodes[i];
        
        // Accumulate forces
        let fx = windStrength;
        let fy = gravity;

        // Mouse force affects bottom nodes more due to inertia/pendulum
        const forceRatio = (i + 1) / localNodes.length;
        fx += mouseInfluenceX * forceRatio;
        fy += mouseInfluenceY * forceRatio;

        // Update velocity
        node.vx += fx * dt;
        node.vy += fy * dt;

        // Apply friction/air-resistance dampening
        node.vx *= 0.94;
        node.vy *= 0.94;

        // Update position temporarily
        node.x += node.vx * dt;
        node.y += node.vy * dt;
      }

      // 2. Solve rope constraints (rigid spacing between joints)
      // Each segment has a desired length
      const segmentLengths = [20, 20, 20, 20, 25, 25];

      for (let iteration = 0; iteration < 8; iteration++) {
        // Anchor segment 0 to origin
        let prevX = originX;
        let prevY = originY;

        for (let i = 0; i < localNodes.length; i++) {
          const node = localNodes[i];
          const targetLength = segmentLengths[i] || 20;

          const dx = node.x - prevX;
          const dy = node.y - prevY;
          const distance = Math.sqrt(dx * dx + dy * dy) || 0.001;
          
          const difference = targetLength - distance;
          const percent = (difference / distance) * 0.55; // relaxation factor

          const offsetX = dx * percent;
          const offsetY = dy * percent;

          // Origin is unmovable, so node takes full correction if it's the first
          if (i === 0) {
            node.x += offsetX * 2;
            node.y += offsetY * 2;
          } else {
            // Distribute corrections between current node and previous node
            const prevNode = localNodes[i - 1];
            node.x += offsetX;
            node.y += offsetY;
            prevNode.x -= offsetX;
            prevNode.y -= offsetY;
          }

          prevX = node.x;
          prevY = node.y;
        }
      }

      // 3. Recalculate velocities from position changes to maintain physics stability
      for (let i = 0; i < localNodes.length; i++) {
        const node = localNodes[i];
        const prevX = i === 0 ? originX : localNodes[i - 1].x;
        const prevY = i === 0 ? originY : localNodes[i - 1].y;

        // Limit maximum angles to prevent overlapping the phone body (colliding leftwards)
        // Since charm is on the right side of the phone, it shouldn't swing left past the body (x < -10)
        if (node.x < -10) {
          node.x = -10;
          node.vx = Math.abs(node.vx) * 0.5; // bounce back
        }
      }

      setNodes([...localNodes]);
      requestRef.current = requestAnimationFrame(updatePhysics);
    };

    requestRef.current = requestAnimationFrame(updatePhysics);

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [charmOption, nodes.length]);

  if (!charmOption || nodes.length === 0) return null;

  // Render decorative SVGs for star & heart beads, and the big charm at the bottom
  const renderBead = (node: PhysicsNode, idx: number) => {
    switch (node.shape) {
      case 'star':
        return (
          <polygon
            key={idx}
            points={`
              ${node.x},${node.y - node.radius} 
              ${node.x + node.radius * 0.3},${node.y - node.radius * 0.3} 
              ${node.x + node.radius},${node.y - node.radius * 0.2} 
              ${node.x + node.radius * 0.4},${node.y + node.radius * 0.2} 
              ${node.x + node.radius * 0.6},${node.y + node.radius * 0.8} 
              ${node.x},${node.y + node.radius * 0.4} 
              ${node.x - node.radius * 0.6},${node.y + node.radius * 0.8} 
              ${node.x - node.radius * 0.4},${node.y + node.radius * 0.2} 
              ${node.x - node.radius},${node.y - node.radius * 0.2} 
              ${node.x - node.radius * 0.3},${node.y - node.radius * 0.3}
            `}
            fill={node.color}
            stroke="#ffffff"
            strokeWidth="1.5"
            className="drop-shadow-sm filter"
          />
        );

      case 'heart':
        return (
          <path
            key={idx}
            d={`
              M ${node.x} ${node.y - node.radius * 0.3}
              C ${node.x - node.radius} ${node.y - node.radius} ${node.x - node.radius * 1.5} ${node.y + node.radius * 0.2} ${node.x} ${node.y + node.radius}
              C ${node.x + node.radius * 1.5} ${node.y + node.radius * 0.2} ${node.x + node.radius} ${node.y - node.radius} ${node.x} ${node.y - node.radius * 0.3}
              Z
            `}
            fill={node.color}
            stroke="#ffffff"
            strokeWidth="1.5"
            className="drop-shadow-sm filter"
          />
        );

      case 'charm':
        // Big main hanging charm at the end of the chain
        return renderMainCharm(node, charmOption.style, idx);

      case 'circle':
      default:
        return (
          <circle
            key={idx}
            cx={node.x}
            cy={node.y}
            r={node.radius}
            fill={node.color}
            stroke="#ffffff"
            strokeWidth="1.5"
            className="drop-shadow-sm filter"
          />
        );
    }
  };

  const renderMainCharm = (node: PhysicsNode, style: string, idx: number) => {
    // Large stylized custom charm SVG
    switch (style) {
      case 'stars':
        return (
          <g key={idx} transform={`translate(${node.x}, ${node.y})`} className="drop-shadow-md filter">
            <path
              d="M0 -15 L4 -4 L15 -4 L7 3 L10 14 L0 7 L-10 14 L-7 3 L-15 -4 L-4 -4 Z"
              fill={node.color}
              stroke="#ffffff"
              strokeWidth="2"
            />
            {/* Cute face on the charm */}
            <circle cx="-3" cy="-1" r="1.5" fill="#1e293b" />
            <circle cx="3" cy="-1" r="1.5" fill="#1e293b" />
            <path d="M-2,3 Q0,5 2,3" fill="none" stroke="#1e293b" strokeWidth="1.5" strokeLinecap="round" />
          </g>
        );

      case 'hearts':
        return (
          <g key={idx} transform={`translate(${node.x}, ${node.y})`} className="drop-shadow-md filter">
            <path
              d="M 0 -5 C -12 -15 -20 0 0 15 C 20 0 12 -15 0 -5 Z"
              fill={node.color}
              stroke="#ffffff"
              strokeWidth="2"
            />
            {/* Cute blushing cheeks */}
            <circle cx="-6" cy="1" r="1.5" fill="#f43f5e" opacity="0.6" />
            <circle cx="6" cy="1" r="1.5" fill="#f43f5e" opacity="0.6" />
            <circle cx="-4" cy="-2" r="1.5" fill="#1e293b" />
            <circle cx="4" cy="-2" r="1.5" fill="#1e293b" />
            <path d="M-2,2 Q0,4 2,2" fill="none" stroke="#1e293b" strokeWidth="1.5" strokeLinecap="round" />
          </g>
        );

      case 'rainbow':
        return (
          <g key={idx} transform={`translate(${node.x}, ${node.y})`} className="drop-shadow-md filter">
            {/* Rainbow half-circle */}
            <path d="M -15 5 A 15 15 0 0 1 15 5" fill="none" stroke="#f43f5e" strokeWidth="4" />
            <path d="M -11 5 A 11 11 0 0 1 11 5" fill="none" stroke="#fb923c" strokeWidth="4" />
            <path d="M -7 5 A 7 7 0 0 1 7 5" fill="none" stroke="#facc15" strokeWidth="4" />
            {/* Hanging cloud */}
            <ellipse cx="-12" cy="5" rx="6" ry="4" fill="#ffffff" />
            <ellipse cx="12" cy="5" rx="6" ry="4" fill="#ffffff" />
            <circle cx="0" cy="5" r="7" fill="#ffffff" />
          </g>
        );

      case 'gamer':
        return (
          <g key={idx} transform={`translate(${node.x}, ${node.y})`} className="drop-shadow-md filter">
            {/* Cute game controller shape */}
            <rect x="-16" y="-10" width="32" height="20" rx="8" fill={node.color} stroke="#ffffff" strokeWidth="2" />
            {/* D-Pad */}
            <line x1="-10" y1="0" x2="-6" y2="0" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
            <line x1="-8" y1="-2" x2="-8" y2="2" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
            {/* Buttons */}
            <circle cx="8" cy="-2" r="2" fill="#ef4444" stroke="#ffffff" strokeWidth="0.5" />
            <circle cx="11" cy="2" r="2" fill="#3b82f6" stroke="#ffffff" strokeWidth="0.5" />
          </g>
        );

      case 'beads':
      default:
        // Teddy Bear head charm
        return (
          <g key={idx} transform={`translate(${node.x}, ${node.y})`} className="drop-shadow-md filter">
            {/* Ears */}
            <circle cx="-10" cy="-9" r="6" fill={node.color} stroke="#ffffff" strokeWidth="2" />
            <circle cx="-10" cy="-9" r="3" fill="#fda4af" />
            <circle cx="10" cy="-9" r="6" fill={node.color} stroke="#ffffff" strokeWidth="2" />
            <circle cx="10" cy="-9" r="3" fill="#fda4af" />
            {/* Head */}
            <circle cx="0" cy="0" r="14" fill={node.color} stroke="#ffffff" strokeWidth="2" />
            {/* Snout */}
            <ellipse cx="0" cy="4" rx="5" ry="4" fill="#ffffff" />
            <polygon points="-2,3 2,3 0,5" fill="#1e293b" />
            {/* Eyes */}
            <circle cx="-5" cy="-2" r="1.8" fill="#1e293b" />
            <circle cx="5" cy="-2" r="1.8" fill="#1e293b" />
          </g>
        );
    }
  };

  return (
    <div
      ref={containerRef}
      className="absolute top-[120px] right-[-24px] w-[140px] h-[300px] pointer-events-none select-none z-40"
    >
      <svg className="w-full h-full overflow-visible">
        {/* Elastic Attachment Thread */}
        <path
          d={`M 0,0 L ${nodes[0].x},${nodes[0].y}`}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="2.5"
          strokeDasharray="2,2"
        />

        {/* Dynamic strings between beads */}
        {nodes.map((node, idx) => {
          if (idx === 0) return null;
          return (
            <line
              key={`line-${idx}`}
              x1={nodes[idx - 1].x}
              y1={nodes[idx - 1].y}
              x2={node.x}
              y2={node.y}
              stroke="#e2e8f0"
              strokeWidth="2"
            />
          );
        })}

        {/* Render individual beads and main charm */}
        {nodes.map((node, idx) => renderBead(node, idx))}
      </svg>
    </div>
  );
};
