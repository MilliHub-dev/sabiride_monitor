import { create } from 'zustand';
import type { Stream } from '../types';

interface StreamState {
  streams: Stream[];
  setStreams: (streams: Stream[]) => void;
  addStream: (stream: Stream) => void;
  removeStream: (channelName: string) => void;
  updateViewerCount: (channelName: string, count: number) => void;
}

export const useStreamStore = create<StreamState>((set) => ({
  streams: [],
  setStreams: (streams) => set({ streams }),
  addStream: (stream) =>
    set((state) => ({ streams: [...state.streams, stream] })),
  removeStream: (channelName) =>
    set((state) => ({
      streams: state.streams.filter((s) => s.channelName !== channelName),
    })),
  updateViewerCount: (channelName, count) =>
    set((state) => ({
      streams: state.streams.map((s) =>
        s.channelName === channelName ? { ...s, viewerCount: count } : s,
      ),
    })),
}));
