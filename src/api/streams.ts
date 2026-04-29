import { MOCK_STREAMS } from '../mocks/data';
import type { Stream } from '../types';

const mock = <T>(data: T) => Promise.resolve({ data });

export const getActiveStreams = () => mock<Stream[]>(MOCK_STREAMS);

export const getStreamToken = (_channelName: string) =>
  mock<{ token: string }>({ token: 'mock-agora-token' });
