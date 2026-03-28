import { NativeModules, Platform } from 'react-native';

const { LiveActivityModule } = NativeModules;

// On Android or in dev environments without the native module, provide no-op stubs.
const stub = {
  startActivity: async (_elapsed: number, _stage: string): Promise<string | null> => null,
  updateActivity: async (_elapsed: number, _stage: string): Promise<void> => {},
  endActivity: async (): Promise<void> => {},
};

const module =
  Platform.OS === 'ios' && LiveActivityModule ? LiveActivityModule : stub;

export const LiveActivity = {
  start(elapsedSeconds: number, stage: string): Promise<string | null> {
    return module.startActivity(elapsedSeconds, stage);
  },
  update(elapsedSeconds: number, stage: string): Promise<void> {
    return module.updateActivity(elapsedSeconds, stage);
  },
  end(): Promise<void> {
    return module.endActivity();
  },
};
