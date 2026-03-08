'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';

interface Page {
  id: number;
  title: string;
  content: string;
  image?: string;
}

interface BookViewerProps {
  pages: Page[];
  onClose?: () => void;
}

interface TouchState {
  startX: number;
  startY: number;
  currentX: number;
  isDragging: boolean;
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

const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] => {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  words.forEach((word) => {
    const testLine = currentLine + (currentLine ? ' ' : '') + word;
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  });
  if (currentLine) lines.push(currentLine);
  return lines;
};

const drawPageContent = (ctx: CanvasRenderingContext2D, page: Page, x: number, y: number, w: number, h: number) => {
  ctx.save();
  
  ctx.fillStyle = '#2d3748';
  ctx.font = `bold ${Math.max(14, w * 0.08)}px "Luckiest Guy", cursive`;
  ctx.textAlign = 'center';
  ctx.fillText(page.title, x + w / 2, y + 35);

  ctx.strokeStyle = 'rgba(99, 102, 124, 0.3)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x + 20, y + 50);
  ctx.lineTo(x + w - 20, y + 50);
  ctx.stroke();

  ctx.fillStyle = '#4a5568';
  ctx.font = `${Math.max(10, w * 0.045)}px "Noto Sans", sans-serif`;
  ctx.textAlign = 'left';
  
  const lines = wrapText(ctx, page.content, w - 24);
  const lineHeight = Math.max(16, w * 0.055);
  const maxLines = Math.floor((h - 70) / lineHeight);
  
  lines.slice(0, maxLines).forEach((line, i) => {
    ctx.fillText(line, x + 12, y + 75 + i * lineHeight);
  });

  ctx.restore();
};

const drawFoldShadow = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, isRight: boolean) => {
  const shadowWidth = 30;
  const gradient = ctx.createLinearGradient(
    isRight ? x - shadowWidth : x,
    y,
    isRight ? x : x + shadowWidth,
    y
  );
  gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
  gradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.08)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(isRight ? x - shadowWidth : x, y, shadowWidth, h);
};

const drawStaticPage = (ctx: CanvasRenderingContext2D, page: Page, x: number, y: number, w: number, h: number) => {
  const gradient = ctx.createLinearGradient(x, y, x, y + h);
  gradient.addColorStop(0, '#faf8f5');
  gradient.addColorStop(0.5, '#f5f0e8');
  gradient.addColorStop(1, '#e8e3d8');
  ctx.fillStyle = gradient;
  
  ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
  ctx.shadowBlur = 20;
  ctx.shadowOffsetX = 4;
  ctx.shadowOffsetY = 4;
  roundRect(ctx, x, y, w, h, 8);
  ctx.fill();
  ctx.shadowColor = 'transparent';

  ctx.strokeStyle = 'rgba(180, 170, 150, 0.3)';
  ctx.lineWidth = 1;
  roundRect(ctx, x, y, w, h, 8);
  ctx.stroke();

  drawPageContent(ctx, page, x + 16, y + 20, w - 32, h - 40);
};

const BookViewer: React.FC<BookViewerProps> = ({ pages, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [flipProgress, setFlipProgress] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right'>('right');
  const [canvasSize, setCanvasSize] = useState({ width: 320, height: 440 });
  
  const touchState = useRef<TouchState>({
    startX: 0,
    startY: 0,
    currentX: 0,
    isDragging: false,
  });

  const updateCanvasSize = useCallback(() => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.clientWidth;
      const width = Math.min(containerWidth - 32, 360);
      const height = width * 1.375;
      setCanvasSize({ width, height });
    }
  }, []);

  useEffect(() => {
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, [updateCanvasSize]);

  const drawPage = useCallback((ctx: CanvasRenderingContext2D, pageIndex: number, progress: number, pageDirection: 'left' | 'right') => {
    const { width, height } = canvasSize;
    const pageWidth = width * 0.9;
    const pageHeight = height * 0.92;
    const pageX = (width - pageWidth) / 2;
    const pageY = (height - pageHeight) / 2;
    
    ctx.clearRect(0, 0, width, height);

    if (progress === 0 || pageIndex < 0 || pageIndex >= pages.length) {
      if (pageIndex >= 0 && pageIndex < pages.length) {
        drawStaticPage(ctx, pages[pageIndex], pageX, pageY, pageWidth, pageHeight);
      }
      return;
    }

    const clampProgress = Math.max(0, Math.min(1, progress));
    const foldWidth = pageWidth * 0.6;
    const foldPosition = pageWidth * clampProgress;

    if (pageDirection === 'right') {
      const currentX = pageX + pageWidth - foldPosition;
      
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(pageX, pageY);
      ctx.lineTo(pageX + pageWidth - foldPosition, pageY);
      ctx.lineTo(pageX + pageWidth - foldPosition, pageY + pageHeight);
      ctx.lineTo(pageX, pageY + pageHeight);
      ctx.closePath();
      ctx.clip();
      
      const gradient = ctx.createLinearGradient(pageX, pageY, pageX + pageWidth - foldPosition, pageY);
      gradient.addColorStop(0, '#f5f0e8');
      gradient.addColorStop(0.5, '#faf8f5');
      gradient.addColorStop(1, '#ebe6dd');
      ctx.fillStyle = gradient;
      ctx.fillRect(pageX, pageY, pageWidth - foldPosition, pageHeight);
      
      drawPageContent(ctx, pages[pageIndex], pageX, pageY, pageWidth - foldPosition, pageHeight);
      ctx.restore();

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(pageX + pageWidth - foldPosition, pageY);
      ctx.lineTo(pageX + pageWidth, pageY);
      ctx.lineTo(pageX + pageWidth, pageY + pageHeight);
      ctx.lineTo(pageX + pageWidth - foldPosition, pageY + pageHeight);
      ctx.closePath();
      ctx.clip();
      
      const gradient2 = ctx.createLinearGradient(pageX + pageWidth - foldPosition, pageY, pageX + pageWidth, pageY);
      gradient2.addColorStop(0, '#e8e3d8');
      gradient2.addColorStop(0.3, '#f0ebe0');
      gradient2.addColorStop(1, '#dcd7cb');
      ctx.fillStyle = gradient2;
      ctx.fillRect(pageX + pageWidth - foldPosition, pageY, foldPosition, pageHeight);
      
      if (pageIndex + 1 < pages.length) {
        drawPageContent(ctx, pages[pageIndex + 1], pageX + pageWidth - foldPosition, pageY, foldPosition, pageHeight);
      }
      ctx.restore();

      drawFoldShadow(ctx, currentX, pageY, foldWidth, pageHeight, true);
    } else {
      const currentX = pageX + foldPosition;
      
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(pageX + foldPosition, pageY);
      ctx.lineTo(pageX + pageWidth, pageY);
      ctx.lineTo(pageX + pageWidth, pageY + pageHeight);
      ctx.lineTo(pageX + foldPosition, pageY + pageHeight);
      ctx.closePath();
      ctx.clip();
      
      const gradient = ctx.createLinearGradient(pageX + foldPosition, pageY, pageX + pageWidth, pageY);
      gradient.addColorStop(0, '#e8e3d8');
      gradient.addColorStop(0.7, '#f0ebe0');
      gradient.addColorStop(1, '#f5f0e8');
      ctx.fillStyle = gradient;
      ctx.fillRect(pageX + foldPosition, pageY, pageWidth - foldPosition, pageHeight);
      
      if (pageIndex + 1 < pages.length) {
        drawPageContent(ctx, pages[pageIndex + 1], pageX + foldPosition, pageY, pageWidth - foldPosition, pageHeight);
      }
      ctx.restore();

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(pageX, pageY);
      ctx.lineTo(pageX + foldPosition, pageY);
      ctx.lineTo(pageX + foldPosition, pageY + pageHeight);
      ctx.lineTo(pageX, pageY + pageHeight);
      ctx.closePath();
      ctx.clip();
      
      const gradient2 = ctx.createLinearGradient(pageX, pageY, pageX + foldPosition, pageY);
      gradient2.addColorStop(0, '#faf8f5');
      gradient2.addColorStop(0.5, '#f5f0e8');
      gradient2.addColorStop(1, '#ebe6dd');
      ctx.fillStyle = gradient2;
      ctx.fillRect(pageX, pageY, foldPosition, pageHeight);
      
      drawPageContent(ctx, pages[pageIndex], pageX, pageY, foldPosition, pageHeight);
      ctx.restore();

      drawFoldShadow(ctx, currentX, pageY, foldWidth, pageHeight, false);
    }
  }, [canvasSize, pages]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    
    const render = () => {
      drawPage(ctx, currentPage, flipProgress, direction);
      animationId = requestAnimationFrame(render);
    };
    
    render();
    return () => cancelAnimationFrame(animationId);
  }, [currentPage, flipProgress, direction, drawPage]);

  const animateFlip = useCallback((targetDirection: 'left' | 'right') => {
    if (isAnimating) return;
    
    const targetPage = targetDirection === 'right' ? currentPage + 1 : currentPage - 1;
    if (targetPage < 0 || targetPage >= pages.length) return;
    
    setIsAnimating(true);
    setDirection(targetDirection);
    
    const startTime = performance.now();
    const duration = 800;
    
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const eased = 1 - Math.pow(1 - progress, 3);
      
      setFlipProgress(eased);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCurrentPage(targetPage);
        setFlipProgress(0);
        setIsAnimating(false);
      }
    };
    
    requestAnimationFrame(animate);
  }, [isAnimating, currentPage, pages.length]);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchState.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      currentX: touch.clientX,
      isDragging: true,
    };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchState.current.isDragging || isAnimating) return;
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - touchState.current.startX;
    const deltaY = touch.clientY - touchState.current.startY;
    
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 30) {
      e.preventDefault();
      
      const progress = Math.min(Math.abs(deltaX) / 150, 1);
      setFlipProgress(progress * 0.3);
      setDirection(deltaX > 0 ? 'left' : 'right');
    }
  };

  const handleTouchEnd = () => {
    if (!touchState.current.isDragging || isAnimating) {
      touchState.current.isDragging = false;
      return;
    }
    
    const deltaX = touchState.current.currentX - touchState.current.startX;
    
    if (Math.abs(deltaX) > 80) {
      animateFlip(deltaX > 0 ? 'left' : 'right');
    } else {
      setFlipProgress(0);
    }
    
    touchState.current.isDragging = false;
  };

  const goToNextPage = () => animateFlip('right');
  const goToPrevPage = () => animateFlip('left');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        background: 'linear-gradient(135deg, rgba(129, 166, 198, 0.9) 0%, rgba(170, 205, 220, 0.85) 50%, rgba(196, 181, 160, 0.9) 100%)',
        backdropFilter: 'blur(20px)',
      }}
    >
      <div 
        ref={containerRef}
        className="relative w-full max-w-md"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onClose}
          className="absolute -top-12 right-0 w-10 h-10 rounded-full glass flex items-center justify-center text-white text-xl font-bold z-10"
        >
          ×
        </motion.button>

        <div className="glass-card p-2">
          <canvas
            ref={canvasRef}
            width={canvasSize.width}
            height={canvasSize.height}
            className="w-full h-auto touch-none cursor-grab active:cursor-grabbing"
          />
        </div>

        <div className="flex justify-center items-center gap-6 mt-6">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={goToPrevPage}
            disabled={currentPage === 0 || isAnimating}
            className="glass-button w-12 h-12 rounded-full flex items-center justify-center text-white text-xl disabled:opacity-30"
          >
            ‹
          </motion.button>
          
          <div className="glass-panel px-4 py-2">
            <span className="text-white text-sm font-medium">
              {currentPage + 1} / {pages.length}
            </span>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={goToNextPage}
            disabled={currentPage === pages.length - 1 || isAnimating}
            className="glass-button w-12 h-12 rounded-full flex items-center justify-center text-white text-xl disabled:opacity-30"
          >
            ›
          </motion.button>
        </div>

        <div className="flex justify-center mt-4 gap-2">
          {pages.map((_, idx) => (
            <motion.div
              key={idx}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                idx === currentPage ? 'bg-white w-8' : 'bg-white/30 w-2'
              }`}
              onClick={() => {
                if (!isAnimating && idx !== currentPage) {
                  animateFlip(idx > currentPage ? 'right' : 'left');
                }
              }}
            />
          ))}
        </div>

        <p className="text-center text-white/60 text-xs mt-4">
          Swipe or use buttons to turn pages
        </p>
      </div>
    </motion.div>
  );
};

export default BookViewer;
