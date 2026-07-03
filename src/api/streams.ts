import { MOCK_STREAMS } from '../mocks/data';
import client from './client';
import type { Stream } from '../types';

const USE_MOCK = import.meta.env.VITE_USE_MOCK_DATA === 'true';

const mock = <T>(data: T) => Promise.resolve({ data });

export const getActiveStreams = () => {
  if (USE_MOCK) return mock<Stream[]>(MOCK_STREAMS);
  return client.get<Stream[]>('/streams/active');
};

export const getStreamToken = (channelName: string) => {
  if (USE_MOCK) return mock<{ token: string }>({ token: 'mock-agora-token' });
  return client.get<{ token: string }>(`/streams/${channelName}/token`);
};
