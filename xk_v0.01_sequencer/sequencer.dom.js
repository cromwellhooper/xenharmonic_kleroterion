window.App.SequencerDOM = (() => {

    const build = (state, callbacks) => {
        console.log("SequencerDOM: build() rendering complete visual engine interface UI frame.");
        const container = document.createElement("div");
        container.className = "workspace-view";

        const header = document.createElement("div");
        header.className = "controls";
        
        const playBtn = document.createElement("button");
        playBtn.textContent = state.isPlaying ? "Stop Loop" : "Start Sequence";
        playBtn.style.padding = "6px 12px";
        playBtn.addEventListener("click", () => {
            console.log("SequencerDOM UI Event: Play/Stop button clicked.");
            callbacks.onPlayToggle();
        });

        const masterVolLabel = document.createElement("label");
        masterVolLabel.innerHTML = `Master Vol: <input type="range" min="0" max="1" step="0.05" value="${window.App.currentMasterVolumeSetting}">`;
        masterVolLabel.querySelector("input").addEventListener("input", (e) => {
            console.log("SequencerDOM UI Event: Master Volume Slider dragged to:", e.target.value);
            App.AudioEngine.setMasterVolume(e.target.value);
        });

        const bpmContainer = document.createElement("div");
        bpmContainer.style.display = "inline-flex";
        bpmContainer.style.alignItems = "center";
        bpmContainer.style.gap = "8px";
        bpmContainer.innerHTML = `
            <label>Tempo (BPM): 
                <input type="range" id="bpm-slider" min="40" max="240" step="1" value="${state.bpm}">
            </label>
            <span id="bpm-readout" style="font-weight:bold; width:30px; display:inline-block;">${state.bpm}</span>
        `;
        
        const sliderInput = bpmContainer.querySelector("#bpm-slider");
        const readoutSpan = bpmContainer.querySelector("#bpm-readout");

        sliderInput.addEventListener("input", (e) => {
            const nextBpm = parseInt(e.target.value) || 120;
            console.log("SequencerDOM UI Event: Tempo Slider dragged to:", nextBpm);
            readoutSpan.textContent = nextBpm;
            callbacks.onStateChange({ ...state, bpm: nextBpm });
            
            if (state.isPlaying && window.App.sequencerRuntimeState) {
                window.App.sequencerRuntimeState.bpm = nextBpm;
                clearInterval(window.App.sequencerRuntimeState.intervalId);
                const stepMs = (60 / nextBpm) * 1000;
                window.App.sequencerRuntimeState.intervalId = setInterval(() => {
                    window.App.sequencerRuntimeState = App.SequencerFunc.processClockTick(window.App.sequencerRuntimeState);
                }, stepMs);
            }
        });

        header.appendChild(playBtn);
        header.appendChild(masterVolLabel);
        header.appendChild(bpmContainer);
        container.appendChild(header);

        state.voices.forEach((voice, index) => {
            const row = document.createElement("div");
            row.className = "voice-row";

            const label = document.createElement("strong");
            label.textContent = `V${index + 1}:`;

            const input = document.createElement("input");
            input.type = "text";
            input.value = voice.text;
            input.addEventListener("input", (e) => {
                console.log(`SequencerDOM UI Event: Voice ${index + 1} text sequence input typed to:`, e.target.value);
                const updatedVoices = [...state.voices];
                updatedVoices[index] = { ...updatedVoices[index], text: e.target.value };
                callbacks.onStateChange({ ...state, voices: updatedVoices });
            });

            const muteLabel = document.createElement("label");
            muteLabel.innerHTML = `<input type="checkbox" ${voice.mute ? "checked" : ""}> Mute`;
            muteLabel.querySelector("input").addEventListener("change", (e) => {
                console.log(`SequencerDOM UI Event: Voice ${index + 1} Mute toggle switched to:`, e.target.checked);
                const updatedVoices = [...state.voices];
                updatedVoices[index] = { ...updatedVoices[index], mute: e.target.checked };
                callbacks.onStateChange({ ...state, voices: updatedVoices });
            });

            const volLabel = document.createElement("label");
            volLabel.innerHTML = `Vol: <input type="range" min="0" max="1" step="0.05" value="${voice.volume}">`;
            volLabel.querySelector("input").addEventListener("input", (e) => {
                console.log(`SequencerDOM UI Event: Voice ${index + 1} individual mixer track volume adjusted to:`, e.target.value);
                const updatedVoices = [...state.voices];
                updatedVoices[index] = { ...updatedVoices[index], volume: parseFloat(e.target.value) };
                callbacks.onStateChange({ ...state, voices: updatedVoices });
            });

            const waveSelect = document.createElement("select");
            const voicesList = ["sine", "triangle", "sawtooth", "square", "flute", "cello", "trumpet", "vibraphone"];
            voicesList.forEach(type => {
                const opt = document.createElement("option");
                opt.value = type;
                opt.textContent = type.charAt(0).toUpperCase() + type.slice(1);
                if (voice.waveform === type) opt.selected = true;
                waveSelect.appendChild(opt);
            });
            waveSelect.addEventListener("change", (e) => {
                console.log(`SequencerDOM UI Event: Voice ${index + 1} oscillator waveform set to:`, e.target.value);
                const updatedVoices = [...state.voices];
                updatedVoices[index] = { ...updatedVoices[index], waveform: e.target.value };
                callbacks.onStateChange({ ...state, voices: updatedVoices });
            });

            row.appendChild(label);
            row.appendChild(input);
            row.appendChild(muteLabel);
            row.appendChild(volLabel);
            row.appendChild(waveSelect);
            container.appendChild(row);
        });

        return container; 
    };

    return { build };
})();
console.log("SCRIPT SUCCESS: sequencer.dom.js loaded successfully.");