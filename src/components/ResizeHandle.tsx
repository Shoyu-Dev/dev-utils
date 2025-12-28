import { useCallback, useRef, useEffect } from 'react';
import { useSidebar } from '../context/SidebarContext';

const MIN_WIDTH = 200;
const MAX_WIDTH = 500;

export function ResizeHandle() {
  const { width, setWidth, startResize, endResize, isCollapsed } = useSidebar();
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);
  const isResizingRef = useRef(false);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizingRef.current) return;

    const delta = e.clientX - startXRef.current;
    const newWidth = startWidthRef.current + delta;
    const clampedWidth = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, newWidth));

    setWidth(clampedWidth);
  }, [setWidth]);

  const handleMouseUp = useCallback(() => {
    if (!isResizingRef.current) return;

    isResizingRef.current = false;
    endResize();
    document.body.style.cursor = '';

    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  }, [endResize, handleMouseMove]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();

    isResizingRef.current = true;
    startXRef.current = e.clientX;
    startWidthRef.current = width;
    startResize();
    document.body.style.cursor = 'col-resize';

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [width, startResize, handleMouseMove, handleMouseUp]);

  // Touch support for Tauri
  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isResizingRef.current || !e.touches[0]) return;

    const delta = e.touches[0].clientX - startXRef.current;
    const newWidth = startWidthRef.current + delta;
    const clampedWidth = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, newWidth));

    setWidth(clampedWidth);
  }, [setWidth]);

  const handleTouchEnd = useCallback(() => {
    if (!isResizingRef.current) return;

    isResizingRef.current = false;
    endResize();

    document.removeEventListener('touchmove', handleTouchMove);
    document.removeEventListener('touchend', handleTouchEnd);
  }, [endResize, handleTouchMove]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!e.touches[0]) return;

    isResizingRef.current = true;
    startXRef.current = e.touches[0].clientX;
    startWidthRef.current = width;
    startResize();

    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);
  }, [width, startResize, handleTouchMove, handleTouchEnd]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  // Don't render if sidebar is collapsed
  if (isCollapsed) {
    return null;
  }

  return (
    <div
      className="resize-handle"
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      role="separator"
      aria-orientation="vertical"
      aria-label="Resize sidebar"
      aria-valuenow={width}
      aria-valuemin={MIN_WIDTH}
      aria-valuemax={MAX_WIDTH}
    />
  );
}
