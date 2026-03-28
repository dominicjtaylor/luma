import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
} from 'react-native';
import { useSessionStore } from '../store/sessionStore';
import { LiveActivity } from '../native/LiveActivityModule';
import {
  STAGE_EMOJI,
  STAGE_LABEL,
  STAGE_DESCRIPTION,
  formatElapsed,
  Stage,
} from '../utils/stageUtils';

const UPDATE_INTERVAL_SECONDS = 10;

export function HomeScreen() {
  const { isActive, elapsedSeconds, stage, startSession, stopSession, tick } =
    useSessionStore();

  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastNativeUpdateRef = useRef<number>(0);
  const prevStageRef = useRef<Stage>(stage);

  useEffect(() => {
    if (isActive) {
      tickRef.current = setInterval(() => {
        tick();
      }, 1000);
    } else {
      if (tickRef.current) {
        clearInterval(tickRef.current);
        tickRef.current = null;
      }
    }
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [isActive, tick]);

  // Sync native Live Activity on stage changes or every UPDATE_INTERVAL_SECONDS
  useEffect(() => {
    if (!isActive) return;
    const stageChanged = stage !== prevStageRef.current;
    const intervalElapsed = elapsedSeconds - lastNativeUpdateRef.current >= UPDATE_INTERVAL_SECONDS;
    if (stageChanged || intervalElapsed) {
      LiveActivity.update(elapsedSeconds, stage).catch(() => {});
      lastNativeUpdateRef.current = elapsedSeconds;
      prevStageRef.current = stage;
    }
  }, [isActive, elapsedSeconds, stage]);

  const handleStart = async () => {
    startSession();
    prevStageRef.current = 'calm';
    lastNativeUpdateRef.current = 0;
    try {
      await LiveActivity.start(0, 'calm');
    } catch {
      // Continue without Live Activity if unavailable
    }
  };

  const handleStop = async () => {
    stopSession();
    try {
      await LiveActivity.end();
    } catch {
      // Ignore
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Luma</Text>
        <Text style={styles.subtitle}>Doomscroll Awareness</Text>

        <View style={styles.creatureContainer}>
          <Text style={styles.creatureEmoji}>{STAGE_EMOJI[stage]}</Text>
          <Text style={styles.stageName}>{STAGE_LABEL[stage]}</Text>
          <Text style={styles.stageDescription}>{STAGE_DESCRIPTION[stage]}</Text>
        </View>

        {isActive && (
          <View style={styles.timerContainer}>
            <Text style={styles.timerLabel}>Session time</Text>
            <Text style={styles.timer}>{formatElapsed(elapsedSeconds)}</Text>
          </View>
        )}

        {!isActive ? (
          <TouchableOpacity style={styles.startButton} onPress={handleStart} activeOpacity={0.8}>
            <Text style={styles.startButtonText}>Start Social Mode</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.stopButton} onPress={handleStop} activeOpacity={0.8}>
            <Text style={styles.stopButtonText}>Stop</Text>
          </TouchableOpacity>
        )}

        {isActive && Platform.OS === 'ios' && (
          <Text style={styles.hint}>Your creature lives in the Dynamic Island</Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 24,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: '#f0f0f0',
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: -16,
  },
  creatureContainer: {
    alignItems: 'center',
    gap: 8,
    marginVertical: 16,
  },
  creatureEmoji: {
    fontSize: 80,
  },
  stageName: {
    fontSize: 22,
    fontWeight: '600',
    color: '#d0d0d0',
    letterSpacing: 0.5,
  },
  stageDescription: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
  },
  timerContainer: {
    alignItems: 'center',
    gap: 4,
  },
  timerLabel: {
    fontSize: 12,
    color: '#444',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  timer: {
    fontSize: 48,
    fontWeight: '200',
    color: '#888',
    fontVariant: ['tabular-nums'],
  },
  startButton: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 12,
    marginTop: 8,
  },
  startButtonText: {
    color: '#e0e0e0',
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  stopButton: {
    backgroundColor: '#1a0a0a',
    borderWidth: 1,
    borderColor: '#3a1a1a',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 12,
    marginTop: 8,
  },
  stopButtonText: {
    color: '#c0786a',
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  hint: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
  },
});
