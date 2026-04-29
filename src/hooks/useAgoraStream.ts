import { useRef, useCallback } from 'react';
import AgoraRTC, { type IAgoraRTCClient } from 'agora-rtc-sdk-ng';
import { getStreamToken } from '../api/streams';

AgoraRTC.setLogLevel(4); // suppress verbose Agora logs in console

export function useAgoraStream() {
  const clientRef = useRef<IAgoraRTCClient | null>(null);

  const join = useCallback(async (channelName: string, containerId: string) => {
    // Clean up any existing session
    if (clientRef.current) {
      await clientRef.current.leave();
      clientRef.current = null;
    }

    const { data } = await getStreamToken(channelName);

    const client = AgoraRTC.createClient({ mode: 'live', codec: 'vp8' });
    clientRef.current = client;

    await client.setClientRole('audience');

    await client.join(
      import.meta.env.VITE_AGORA_APP_ID,
      channelName,
      data.token,
      null,
    );

    client.on('user-published', async (user, mediaType) => {
      await client.subscribe(user, mediaType);
      if (mediaType === 'video') {
        user.videoTrack?.play(containerId);
      }
      if (mediaType === 'audio') {
        user.audioTrack?.play();
      }
    });

    client.on('user-unpublished', async (user, mediaType) => {
      await client.unsubscribe(user, mediaType);
    });

    return client;
  }, []);

  const leave = useCallback(async () => {
    if (clientRef.current) {
      await clientRef.current.leave();
      clientRef.current = null;
    }
  }, []);

  return { join, leave };
}
