import { create } from 'zustand';
import { getStage, Stage } from '../utils/stageUtils';

interface SessionState {
  isActive: boolean;
  startedAt: number | null;
  elapsedSeconds: number;
  stage: Stage;
  startSession: () => void;
  stopSession: () => void;
  tick: () => void;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  isActive: false,
  startedAt: null,
  elapsedSeconds: 0,
  stage: 'calm',

  startSession: () => {
    set({
      isActive: true,
      startedAt: Date.now(),
      elapsedSeconds: 0,
      stage: 'calm',
    });
  },

  stopSession: () => {
    set({
      isActive: false,
      startedAt: null,
      elapsedSeconds: 0,
      stage: 'calm',
    });
  },

  tick: () => {
    const { startedAt, isActive } = get();
    if (!isActive || startedAt === null) return;
    const elapsed = Math.floor((Date.now() - startedAt) / 1000);
    set({ elapsedSeconds: elapsed, stage: getStage(elapsed) });
  },
}));
