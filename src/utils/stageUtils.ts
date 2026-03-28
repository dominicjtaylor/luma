export type Stage = 'calm' | 'restless' | 'agitated' | 'exhausted';

export function getStage(elapsedSeconds: number): Stage {
  if (elapsedSeconds < 300) return 'calm';
  if (elapsedSeconds < 600) return 'restless';
  if (elapsedSeconds < 900) return 'agitated';
  return 'exhausted';
}

export function formatElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export const STAGE_EMOJI: Record<Stage, string> = {
  calm: '🐛',
  restless: '🦎',
  agitated: '🦂',
  exhausted: '💀',
};

export const STAGE_LABEL: Record<Stage, string> = {
  calm: 'Calm',
  restless: 'Restless',
  agitated: 'Agitated',
  exhausted: 'Exhausted',
};

export const STAGE_DESCRIPTION: Record<Stage, string> = {
  calm: 'Your creature is at peace.',
  restless: 'Your creature is starting to stir.',
  agitated: 'Your creature is unsettled.',
  exhausted: 'Your creature is spent.',
};
