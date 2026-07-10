window.App.GrammarParser = (() => {
    const baseTuningMap = {
        "C3": 130.81, "D3": 146.83, "E3": 164.81, "F3": 174.61, "G3": 196.00, "A3": 220.00, "B3": 246.94,
        "C4": 261.63, "D4": 293.66, "E4": 329.63, "F4": 349.23, "G4": 392.00, "A4": 440.00, "B4": 493.88,
        "C5": 523.25, "D5": 587.33, "E5": 659.25, "F5": 698.46, "G5": 783.99, "A5": 880.00, "B5": 987.77,
        "C6": 1046.50
    };

    const parseStringToFrequencies = (stepString) => {
        console.log("GrammarParser: parseStringToFrequencies() incoming raw step string:", stepString);
        if (!stepString) return [];
        
        const tokens = stepString.replace(/[\[\]]/g, "").trim().split(/\s+/);
        console.log("GrammarParser: Cleaned tokens array:", tokens);
        
        const outputFrequencies = tokens
            .map(token => token.toUpperCase())
            .map(note => baseTuningMap[note] || 0) 
            .filter(freq => freq > 0);

        console.log("GrammarParser: Output frequencies calculated:", outputFrequencies);
        return outputFrequencies;
    };

    const tokenizeVoiceSequence = (fullString) => {
        console.log("GrammarParser: tokenizeVoiceSequence() processing raw loop timeline string:", fullString);
        if (!fullString) return [];
        
        const steps = [];
        const regex = /\[([^\]]+)\]|([^\s\[\]]+)/g;
        let match;

        while ((match = regex.exec(fullString)) !== null) {
            // Read match group 1 (chord tokens inside brackets) or group 2 (isolated text)
            const tokenValue = match[1] ? match[1] : match[2];
            if (tokenValue) {
                steps.push(tokenValue.trim());
            }
        }
        console.log("GrammarParser: Tokenized steps list created:", steps);
        return steps;
    };

    return {
        parseStringToFrequencies,
        tokenizeVoiceSequence
    };
})();
console.log("SCRIPT SUCCESS: sequencer.grammar.parser.js loaded successfully.");