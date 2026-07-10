window.App.AudioEngine = (() => {
    let audioCtx = null;
    let masterGain = null;

    const init = () => {
        console.log("AudioEngine: init() executed.");
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            masterGain = audioCtx.createGain();
            masterGain.gain.setValueAtTime(window.App.currentMasterVolumeSetting, audioCtx.currentTime);
            masterGain.connect(audioCtx.destination);
            console.log("AudioEngine: Web Audio Context created. Restored volume to:", window.App.currentMasterVolumeSetting);
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
            console.log("AudioEngine: Suspended audio context resumed.");
        }
    };

    const playToneGroup = (frequencies, voiceConfiguration, duration) => {
        console.log("AudioEngine: playToneGroup() called.", { frequencies, voiceConfiguration, duration });
        init();
        const now = audioCtx.currentTime;
        
        // Safety checks to prevent non-finite time calculation failures
        const soundDuration = (typeof duration === 'number' && duration > 0) ? duration : 0.5;
        const targetWaveform = voiceConfiguration && voiceConfiguration.waveform ? voiceConfiguration.waveform : "sine";
        const relativeVolume = (voiceConfiguration && typeof voiceConfiguration.volume === 'number') ? voiceConfiguration.volume : 0.5;

        frequencies.forEach(freq => {
            if (!freq || freq <= 0) return;

            // Standard wave configurations
            if (["sine", "triangle", "sawtooth", "square"].includes(targetWaveform)) {
                const osc = audioCtx.createOscillator();
                const voiceGain = audioCtx.createGain();

                osc.type = targetWaveform; 
                osc.frequency.setValueAtTime(freq, now);

                voiceGain.gain.setValueAtTime(relativeVolume, now);
                voiceGain.gain.exponentialRampToValueAtTime(0.0001, now + soundDuration - 0.005);

                osc.connect(voiceGain);
                voiceGain.connect(masterGain);
                osc.start(now);
                osc.stop(now + soundDuration);
            } 
            // Complex Synthesizer Models
            else if (targetWaveform === "flute") {
                const mainOsc = audioCtx.createOscillator();
                const mainGain = audioCtx.createGain();
                mainOsc.type = "sine";
                mainOsc.frequency.setValueAtTime(freq, now);
                mainGain.gain.setValueAtTime(relativeVolume * 0.8, now);
                mainGain.gain.exponentialRampToValueAtTime(0.0001, now + soundDuration - 0.005);
                mainOsc.connect(mainGain);
                mainGain.connect(masterGain);

                const overtoneOsc = audioCtx.createOscillator();
                const overtoneGain = audioCtx.createGain();
                overtoneOsc.type = "triangle";
                overtoneOsc.frequency.setValueAtTime(freq * 2, now);
                overtoneGain.gain.setValueAtTime(relativeVolume * 0.2, now);
                overtoneGain.gain.exponentialRampToValueAtTime(0.0001, now + soundDuration - 0.005);
                overtoneOsc.connect(overtoneGain);
                overtoneGain.connect(masterGain);

                mainOsc.start(now); mainOsc.stop(now + soundDuration);
                overtoneOsc.start(now); overtoneOsc.stop(now + soundDuration);
            } 
            else if (targetWaveform === "cello") {
                const osc = audioCtx.createOscillator();
                const voiceGain = audioCtx.createGain();
                osc.type = "sawtooth";
                osc.frequency.setValueAtTime(freq, now);

                voiceGain.gain.setValueAtTime(0, now);
                voiceGain.gain.linearRampToValueAtTime(relativeVolume, now + 0.04);
                voiceGain.gain.exponentialRampToValueAtTime(0.0001, now + soundDuration - 0.005);

                osc.connect(voiceGain);
                voiceGain.connect(masterGain);
                osc.start(now);
                osc.stop(now + soundDuration);
            } 
            else if (targetWaveform === "trumpet") {
                const osc1 = audioCtx.createOscillator();
                const gain1 = audioCtx.createGain();
                osc1.type = "sawtooth";
                osc1.frequency.setValueAtTime(freq - 1.5, now); 
                gain1.gain.setValueAtTime(relativeVolume * 0.5, now);
                gain1.gain.exponentialRampToValueAtTime(0.0001, now + soundDuration - 0.005);
                osc1.connect(gain1);
                gain1.connect(masterGain);

                const osc2 = audioCtx.createOscillator();
                const gain2 = audioCtx.createGain();
                osc2.type = "sawtooth";
                osc2.frequency.setValueAtTime(freq + 1.5, now); 
                gain2.gain.setValueAtTime(relativeVolume * 0.5, now);
                gain2.gain.exponentialRampToValueAtTime(0.0001, now + soundDuration - 0.005);
                osc2.connect(gain2);
                gain2.connect(masterGain);

                osc1.start(now); osc1.stop(now + soundDuration);
                osc2.start(now); osc2.stop(now + soundDuration);
            } 
            else if (targetWaveform === "vibraphone") {
                const osc = audioCtx.createOscillator();
                const voiceGain = audioCtx.createGain();
                osc.type = "sine";
                osc.frequency.setValueAtTime(freq, now);

                voiceGain.gain.setValueAtTime(relativeVolume, now);
                voiceGain.gain.exponentialRampToValueAtTime(relativeVolume * 0.3, now + 0.1);
                voiceGain.gain.exponentialRampToValueAtTime(0.0001, now + soundDuration - 0.005);

                const lfo = audioCtx.createOscillator();
                const lfoGain = audioCtx.createGain();
                lfo.frequency.setValueAtTime(6, now); 
                lfoGain.gain.setValueAtTime(relativeVolume * 0.15, now);
                
                lfo.connect(lfoGain);
                lfoGain.connect(voiceGain.gain); 

                osc.connect(voiceGain);
                voiceGain.connect(masterGain);

                osc.start(now); osc.stop(now + soundDuration);
                lfo.start(now); lfo.stop(now + soundDuration);
            }
        });
    };

    const setMasterVolume = (volume) => {
        console.log("AudioEngine: setMasterVolume() changed to:", volume);
        window.App.currentMasterVolumeSetting = parseFloat(volume); 
        init();
        if (masterGain) {
            masterGain.gain.setValueAtTime(window.App.currentMasterVolumeSetting, audioCtx.currentTime);
        }
    };

    return {
        playToneGroup,
        setMasterVolume
    };
})();
console.log("SCRIPT SUCCESS: audio.engine.js loaded successfully.");
