window.App.SequencerFunc = (() => {
    
    const createInitialState = () => {
        console.log("SequencerFunc: createInitialState() building default settings object.");
        return {
            isPlaying: false,
            currentStep: 0,
            bpm: 110,
            intervalId: null,
            voices: [
                { text: "C4 E4 G4 C5", mute: false, volume: 0.6, waveform: "flute" },
                { text: "E4 G4 G4 B4", mute: false, volume: 0.3, waveform: "vibraphone" },
                { text: "G3 B3 C4 G3", mute: false, volume: 0.4, waveform: "cello" },
                { text: "C3 G3 C4 G3", mute: false, volume: 0.3, waveform: "trumpet" }
            ]
        };
    };

    const processClockTick = (state) => {
        console.log("SequencerFunc: processClockTick() processing Step Index:", state.currentStep);
        const stepDuration = 60 / state.bpm;

        state.voices.forEach((voice, index) => {
            if (voice.mute) {
                console.log(`SequencerFunc: Voice ${index + 1} is muted. Skipping step allocation.`);
                return;
            }

            const structuredSteps = App.GrammarParser.tokenizeVoiceSequence(voice.text);
            if (structuredSteps.length === 0) return;

            const activeIndex = state.currentStep % structuredSteps.length;
            const currentStepString = structuredSteps[activeIndex];
            console.log(`SequencerFunc: Voice ${index + 1} at loop index ${activeIndex} is rendering note data: "${currentStepString}"`);

            const frequencies = App.GrammarParser.parseStringToFrequencies(currentStepString);

            App.AudioEngine.playToneGroup(frequencies, voice, stepDuration);
        });

        return {
            ...state,
            currentStep: state.currentStep + 1
        };
    };

    const toggleEngine = (state) => {
        console.log("SequencerFunc: toggleEngine() setting system playback status. Active engine state:", state.isPlaying);
        if (state.isPlaying) {
            if (state.intervalId) clearInterval(state.intervalId);
            console.log("SequencerFunc: Playback stopped. Clear active interval window.");
            return { ...state, isPlaying: false, currentStep: 0, intervalId: null };
        } else {
            const stepMs = (60 / state.bpm) * 1000;
            
            const runLoop = () => {
                console.log("SequencerFunc: Repeating interval heartbeat running.");
                window.App.sequencerRuntimeState = processClockTick(window.App.sequencerRuntimeState);
            };

            window.App.sequencerRuntimeState = { ...state, isPlaying: true };
            
            // Trigger the initial beat instance manually before interval spacing loops
            runLoop(); 
            
            const id = setInterval(runLoop, stepMs);
            window.App.sequencerRuntimeState.intervalId = id;
            console.log("SequencerFunc: Playback loop started with interval timer ID:", id);
            
            return window.App.sequencerRuntimeState;
        }
    };

    return {
        createInitialState,
        toggleEngine,
        processClockTick
    };
})();
logEnd = () => { console.log("SCRIPT SUCCESS: sequencer.functionality.js loaded successfully."); }; logEnd();