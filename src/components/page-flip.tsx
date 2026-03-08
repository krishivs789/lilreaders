'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';

interface PageFlipProps {
  children: React.ReactNode;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  direction: 'left' | 'right';
  isAnimating: boolean;
}

const roundRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
};

const PageFlip: React.FC<PageFlipProps> = ({
  children,
  currentPage,
  totalPages,
  onPageChange,
  direction,
  isAnimating
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [flipProgress, setFlipProgress] = useState(0);
  const [canvasSize, setCanvasSize] = useState({ width: 380, height: 520 });
  
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const w = Math.min(containerRef.current.clientWidth - 32, 420);
        setCanvasSize({ width: w, height: w * 1.35 });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const drawPage = useCallback((ctx: CanvasRenderingContext2D, progress: number) => {
    const { width, height } = canvasSize;
    const pageWidth = width * 0.92;
    const pageHeight = height * 0.94;
    const pageX = (width - pageWidth) / 2;
    const pageY = (height - pageHeight) / 2;
    
    ctx.clearRect(0, 0, width, height);
    
    const gradient = ctx.createLinearGradient(pageX, pageY, pageX, pageY + pageHeight);
    gradient.addColorStop(0, '#fefefe');
    gradient.addColorStop(0.5, '#f8f8f8');
    gradient.addColorStop(1, '#e8e8e8');
    
    ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
    ctx.shadowBlur = 25;
    ctx.shadowOffsetX = 8;
    ctx.shadowOffsetY = 8;
    
    roundRect(ctx, pageX, pageY, pageWidth, pageHeight, 12);
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.shadowColor = 'transparent';
    
    ctx.strokeStyle = 'rgba(180, 170, 150, 0.4)';
    ctx.lineWidth = 2;
    roundRect(ctx, pageX, pageY, pageWidth, pageHeight, 12);
    ctx.stroke();

    if (progress > 0) {
      const foldWidth = pageWidth * 0.5;
      const foldPosition = pageWidth * progress;
      
      if (direction === 'right') {
        const foldX = pageX + pageWidth - foldPosition;
        
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(foldX, pageY);
        ctx.lineTo(pageX + pageWidth, pageY);
        ctx.lineTo(pageX + pageWidth, pageY + pageHeight);
        ctx.lineTo(foldX, pageY + pageHeight);
        ctx.closePath();
        ctx.clip();
        
        const grad2 = ctx.createLinearGradient(foldX, pageY, pageX + pageWidth, pageY);
        grad2.addColorStop(0, '#d0d0d0');
        grad2.addColorStop(0.5, '#e8e8e8');
        grad2.addColorStop(1, '#f8f8f8');
        ctx.fillStyle = grad2;
        ctx.fillRect(foldX, pageY, foldPosition, pageHeight);
        ctx.restore();

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(pageX, pageY);
        ctx.lineTo(foldX, pageY);
        ctx.lineTo(foldX, pageY + pageHeight);
        ctx.lineTo(pageX, pageY + pageHeight);
        ctx.closePath();
        ctx.clip();
        
        const grad1 = ctx.createLinearGradient(pageX, pageY, foldX, pageY);
        grad1.addColorStop(0, '#f8f8f8');
        grad1.addColorStop(0.5, '#f0f0f0');
        grad1.addColorStop(1, '#e0e0e0');
        ctx.fillStyle = grad1;
        ctx.fillRect(pageX, pageY, foldPosition, pageHeight);
        ctx.restore();

        const shadowWidth = 25;
        const shadowGrad = ctx.createLinearGradient(foldX - shadowWidth, pageY, foldX, pageY);
        shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
        shadowGrad.addColorStop(0.5, 'rgba(0, 0, 0, 0.1)');
        shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = shadowGrad;
        ctx.fillRect(foldX - shadowWidth, pageY, shadowWidth, pageHeight);
      } else {
        const foldX = pageX + foldPosition;
        
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(pageX, pageY);
        ctx.lineTo(foldX, pageY);
        ctx.lineTo(foldX, pageY + pageHeight);
        ctx.lineTo(pageX, pageY + pageHeight);
        ctx.closePath();
        ctx.clip();
        
        const grad1 = ctx.createLinearGradient(pageX, pageY, foldX, pageY);
        grad1.addColorStop(0, '#f8f8f8');
        grad1.addColorStop(0.5, '#e8e8e8');
        grad1.addColorStop(1, '#d8d8d8');
        ctx.fillStyle = grad1;
        ctx.fillRect(pageX, pageY, foldPosition, pageHeight);
        ctx.restore();

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(foldX, pageY);
        ctx.lineTo(pageX + pageWidth, pageY);
        ctx.lineTo(pageX + pageWidth, pageY + pageHeight);
        ctx.lineTo(foldX, pageY + pageHeight);
        ctx.closePath();
        ctx.clip();
        
        const grad2 = ctx.createLinearGradient(foldX, pageY, pageX + pageWidth, pageY);
        grad2.addColorStop(0, '#d8d8d8');
        grad2.addColorStop(0.5, '#e8e8e8');
        grad2.addColorStop(1, '#f8f8f8');
        ctx.fillStyle = grad2;
        ctx.fillRect(foldX, pageY, pageWidth - foldPosition, pageHeight);
        ctx.restore();

        const shadowWidth = 25;
        const shadowGrad = ctx.createLinearGradient(foldX, pageY, foldX + shadowWidth, pageY);
        shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
        shadowGrad.addColorStop(0.5, 'rgba(0, 0, 0, 0.1)');
        shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = shadowGrad;
        ctx.fillRect(foldX, pageY, shadowWidth, pageHeight);
      }
    }
  }, [canvasSize, direction]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    
    const render = () => {
      drawPage(ctx, flipProgress);
      animationId = requestAnimationFrame(render);
    };
    
    render();
    return () => cancelAnimationFrame(animationId);
  }, [drawPage, flipProgress]);

  useEffect(() => {
    if (isAnimating) {
      let startTime: number;
      const duration = 700;
      
      const animate = (currentTime: number) => {
        if (!startTime) startTime = currentTime;
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const eased = 1 - Math.pow(1 - progress, 3);
        setFlipProgress(eased);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setFlipProgress(0);
        }
      };
      
      requestAnimationFrame(animate);
    }
  }, [currentPage, isAnimating]);

  return (
    <div ref={containerRef} className="relative w-full max-w-md mx-auto">
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        className="w-full h-auto"
      />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[88%] h-[90%] overflow-y-auto p-4 sm:p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default PageFlip;
