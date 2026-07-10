window.App.AudioEngine = (() => {
    let audioCtx = null;
    let masterGain = null;

    const init = () => {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            masterGain = audioCtx.createGain();
            masterGain.gain.setValueAtTime(0.7, audioCtx.currentTime);
            masterGain.connect(audioCtx.destination);
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
    };

    // Low-level processing: receives an array of absolute frequencies to synthesize immediately
    const playToneGroup = (frequencies, waveform, relativeVolume, duration) => {
        init();
        const now = audioCtx.currentTime;

        frequencies.forEach(freq => {
            if (!freq || freq <= 0) return;

            const osc = audioCtx.createOscillator();
            const voiceGain = audioCtx.createGain();

            osc.type = waveform; // e.g. "sine", "triangle"
            osc.frequency.setValueAtTime(freq, now);

            // Set gain levels explicitly
            voiceGain.gain.setValueAtTime(relativeVolume, now);
            voiceGain.gain.exponentialRampToValueAtTime(0.0001, now + duration - 0.01);

            osc.connect(voiceGain);
            voiceGain.connect(masterGain);

            osc.start(now);
            osc.stop(now + duration);
        });
    };

    const setMasterVolume = (volume) => {
        init();
        masterGain.gain.setValueAtTime(parseFloat(volume), audioCtx.currentTime);
    };

    // Export pure interface objects
    return {
        playToneGroup,
        setMasterVolume
    };
})();
