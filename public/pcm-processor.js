class PCMProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
  }
  process(inputs) {
    const input = inputs[0][0];
    if (input) {
      // Convert Float32Array [-1,1] to Int16 PCM
      const pcm = new Int16Array(input.length);
      for (let i = 0; i < input.length; i++) {
        let s = Math.max(-1, Math.min(1, input[i]));
        pcm[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
      }
      this.port.postMessage(new Uint8Array(pcm.buffer));
    }
    return true;
  }
}
registerProcessor('pcm-processor', PCMProcessor); 