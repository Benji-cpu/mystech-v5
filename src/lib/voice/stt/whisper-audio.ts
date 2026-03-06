/**
 * Converts an audio Blob (from MediaRecorder) to a Float32Array at the
 * target sample rate, which is what Whisper expects (16 kHz mono).
 */
export async function blobToFloat32Array(
  blob: Blob,
  targetSampleRate = 16000
): Promise<Float32Array> {
  const arrayBuffer = await blob.arrayBuffer();

  // Decode the audio using OfflineAudioContext at the target sample rate.
  // The context length is set to 1 sample as a placeholder — decodeAudioData
  // returns a buffer of the correct length regardless.
  const offlineCtx = new OfflineAudioContext(1, 1, targetSampleRate);
  const audioBuffer = await offlineCtx.decodeAudioData(arrayBuffer);

  // Extract the first (or only) channel as a Float32Array
  const channelData = audioBuffer.getChannelData(0);

  // If the decoded sample rate already matches, return directly
  if (audioBuffer.sampleRate === targetSampleRate) {
    return channelData;
  }

  // Resample using an OfflineAudioContext of the correct length
  const duration = audioBuffer.duration;
  const resampleLength = Math.ceil(duration * targetSampleRate);
  const resampleCtx = new OfflineAudioContext(1, resampleLength, targetSampleRate);
  const source = resampleCtx.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(resampleCtx.destination);
  source.start(0);

  const resampledBuffer = await resampleCtx.startRendering();
  return resampledBuffer.getChannelData(0);
}
