/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useRef } from 'react';

const MIN_WIDTH = 200;
const MAX_WIDTH = 500;
const DEFAULT_WIDTH = 260;
const SNAP_THRESHOLD = 10;

interface SidebarContextType {
  width: number;
  isCollapsed: boolean;
  isResizing: boolean;
  setWidth: (width: number) => void;
  toggleCollapsed: () => void;
  startResize: () => void;
  endResize: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
  // Initialize width from localStorage
  const [width, setWidthState] = useState<number>(() => {
    const stored = localStorage.getItem('sidebar-width');
    if (stored) {
      const parsed = parseInt(stored, 10);
      if (!isNaN(parsed) && parsed >= MIN_WIDTH && parsed <= MAX_WIDTH) {
        return parsed;
      }
    }
    return DEFAULT_WIDTH;
  });

  // Initialize collapsed state from localStorage, default to false for desktop
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    const stored = localStorage.getItem('sidebar-collapsed');
    if (stored === 'true' || stored === 'false') {
      return stored === 'true';
    }
    // Default to collapsed on mobile
    return window.innerWidth < 768;
  });

  const [isResizing, setIsResizing] = useState<boolean>(false);

  // Debounce timer for localStorage saves
  const saveTimerRef = useRef<number>();

  // Update CSS variable when width changes
  useEffect(() => {
    document.documentElement.style.setProperty('--sidebar-width', `${width}px`);
  }, [width]);

  // Debounced localStorage save for width
  useEffect(() => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }
    saveTimerRef.current = window.setTimeout(() => {
      localStorage.setItem('sidebar-width', width.toString());
    }, 300);

    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, [width]);

  // Save collapsed state to localStorage
  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', isCollapsed.toString());
  }, [isCollapsed]);

  const setWidth = useCallback((newWidth: number) => {
    // Clamp width to constraints
    let clampedWidth = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, newWidth));

    // Snap to default if within threshold
    if (Math.abs(clampedWidth - DEFAULT_WIDTH) <= SNAP_THRESHOLD) {
      clampedWidth = DEFAULT_WIDTH;
    }

    setWidthState(clampedWidth);
  }, []);

  const toggleCollapsed = useCallback(() => {
    setIsCollapsed(prev => !prev);
  }, []);

  const startResize = useCallback(() => {
    setIsResizing(true);
  }, []);

  const endResize = useCallback(() => {
    setIsResizing(false);
  }, []);

  return (
    <SidebarContext.Provider value={{
      width,
      isCollapsed,
      isResizing,
      setWidth,
      toggleCollapsed,
      startResize,
      endResize,
    }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}
