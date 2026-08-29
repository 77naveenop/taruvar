import React, { useEffect, useRef } from 'react';

export default function TreeGrowthHeroBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Tree growth state
    let growthProgress = 0; // 0 (seedling) to 1 (full giant tree)
    let speed = 0.0035; // smooth continuous growth speed
    let foliageOpacity = 0;
    let windAngle = 0;

    // Floating spore / light particles
    const particles = Array.from({ length: 45 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 3 + 1,
      speedX: (Math.random() - 0.5) * 0.6,
      speedY: -Math.random() * 0.8 - 0.2,
      alpha: Math.random() * 0.7 + 0.3
    }));

    function drawBranch(startX, startY, length, angle, branchWidth, depth, maxDepth) {
      if (depth > maxDepth || length < 4) return;

      const effectiveLength = length * Math.min(1, Math.max(0, (growthProgress * maxDepth - depth + 1)));
      if (effectiveLength <= 0) return;

      const sway = Math.sin(windAngle + depth * 0.5) * (0.015 * depth);
      const endX = startX + Math.sin(angle + sway) * effectiveLength;
      const endY = startY - Math.cos(angle + sway) * effectiveLength;

      // Draw Branch Trunk
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);

      // Bark color gradient: deep rich tree wood
      const trunkAlpha = Math.min(1, growthProgress * 2);
      ctx.strokeStyle = depth < 3 ? `rgba(68, 48, 34, ${trunkAlpha})` : `rgba(45, 122, 78, ${trunkAlpha * 0.9})`;
      ctx.lineWidth = Math.max(1, branchWidth * (1 - depth / (maxDepth + 2)));
      ctx.lineCap = 'round';
      ctx.stroke();

      // Foliage / Leaves at outer branches
      if (depth >= 3 && growthProgress > 0.35) {
        const leafProgress = Math.min(1, (growthProgress - 0.35) * 2);
        const leafSize = (14 - depth * 1.2) * leafProgress;
        
        if (leafSize > 1) {
          // Lush green leaf cluster
          ctx.beginPath();
          ctx.arc(endX, endY, leafSize * 1.5, 0, Math.PI * 2);
          const greenGlow = ctx.createRadialGradient(endX, endY, 0, endX, endY, leafSize * 1.5);
          greenGlow.addColorStop(0, `rgba(74, 222, 128, ${0.45 * leafProgress})`);
          greenGlow.addColorStop(0.6, `rgba(45, 122, 78, ${0.35 * leafProgress})`);
          greenGlow.addColorStop(1, 'rgba(45, 122, 78, 0)');
          ctx.fillStyle = greenGlow;
          ctx.fill();

          // Leaf petal details
          ctx.beginPath();
          ctx.ellipse(endX + 3, endY - 2, leafSize * 0.8, leafSize * 0.4, angle + sway, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(134, 239, 172, ${0.75 * leafProgress})`;
          ctx.fill();
        }
      }

      // Recursive Child Branches
      if (depth < maxDepth) {
        const subBranchScale = 0.76;
        const spreadAngle = 0.42 + Math.sin(windAngle * 0.5) * 0.02;

        // Left branch
        drawBranch(
          endX,
          endY,
          length * subBranchScale,
          angle - spreadAngle,
          branchWidth * 0.72,
          depth + 1,
          maxDepth
        );

        // Right branch
        drawBranch(
          endX,
          endY,
          length * subBranchScale,
          angle + spreadAngle,
          branchWidth * 0.72,
          depth + 1,
          maxDepth
        );

        // Center continuation for realistic trunk height
        if (depth < 4) {
          drawBranch(
            endX,
            endY,
            length * 0.68,
            angle + (Math.random() * 0.1 - 0.05),
            branchWidth * 0.65,
            depth + 1,
            maxDepth
          );
        }
      }
    }

    function render() {
      // Clear with smooth trail
      ctx.clearRect(0, 0, width, height);

      windAngle += 0.02;

      // Advance growth progress from 0 (sapling) -> 1 (huge majestic canopy) -> loop gracefully
      growthProgress += speed;
      if (growthProgress > 1.25) {
        // Smooth loop reset after full glory
        growthProgress = 0.05;
      }

      // Draw Floating Spores / Light Particles
      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;
        if (p.y < 0) p.y = height;
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(187, 247, 208, ${p.alpha * 0.6})`;
        ctx.fill();
      });

      // Ground Mound / Soil
      const groundY = height * 0.88;
      const rootX = width * 0.5;

      ctx.beginPath();
      ctx.ellipse(rootX, groundY + 10, width * 0.45, 45, 0, 0, Math.PI * 2);
      const soilGrad = ctx.createRadialGradient(rootX, groundY, 10, rootX, groundY, width * 0.4);
      soilGrad.addColorStop(0, 'rgba(40, 60, 45, 0.8)');
      soilGrad.addColorStop(1, 'rgba(20, 35, 25, 0)');
      ctx.fillStyle = soilGrad;
      ctx.fill();

      // Tree Base Trunk & Dynamic Height Calculation
      const baseTreeHeight = Math.min(height * 0.48, 380);
      const baseTrunkWidth = Math.min(28, width * 0.035);

      // Draw Growing Tree
      drawBranch(rootX, groundY, baseTreeHeight, 0, baseTrunkWidth, 0, 8);

      // Ambient Central Sun Glow behind the growing tree
      const sunGlow = ctx.createRadialGradient(
        rootX,
        groundY - baseTreeHeight * 0.6 * Math.min(1, growthProgress),
        10,
        rootX,
        groundY - baseTreeHeight * 0.6 * Math.min(1, growthProgress),
        280
      );
      sunGlow.addColorStop(0, 'rgba(134, 239, 172, 0.18)');
      sunGlow.addColorStop(0.5, 'rgba(45, 122, 78, 0.08)');
      sunGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = sunGlow;
      ctx.fillRect(0, 0, width, height);

      animationFrameId = requestAnimationFrame(render);
    }

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* High-res cinematic lush forest photographic layer underneath */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 mix-blend-luminosity scale-105"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=2000&q=80')`
        }}
      />

      {/* Real-time Dynamic Organic Tree Growth Animation Canvas */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full object-cover z-0"
      />

      {/* Rich Multi-Layer Gradient Overlays for High Contrast & Text Legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-taruvar-dark via-taruvar-dark/70 to-black/60 z-1" />
    </div>
  );
}
