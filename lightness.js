function linearize (channel) {
    return channel <= 0.04045 
        ? channel / 12.92
        : Math.pow(((channel + 0.055) / 1.055), 2.4);
}

function getLuminance (R, G, B) {
    const normalizedChannels = [R / 255, G / 255, B / 255];
    const [linearR, linearG, linearB] = normalizedChannels.map(linearize);
    const luminance = 0.2126 * linearR + 0.7152 * linearG + 0.0722 * linearB;
    return luminance;
}

function getLightness (R, G, B) {
    const luminance = getLuminance(R, G, B);
    return luminance <= 216 / 24389 
        ? luminance * (24389 / 27)  
        : Math.pow(luminance, 1 / 3) * 116 - 16;
}

function getDecayFunctionFromOrder([X, Y, Z]) {
    return (decay) => (max) => ({ 
        [X]: max, 
        [Y]: max * decay,
        [Z]: max * Math.pow(decay, 2)
    }); 
}

function generateColorFromLightness (target, decay, order) {
    const decayFunction  = getDecayFunctionFromOrder(order);
    let state = { max: 0, currentLightness: null, currentRGBValues: null };
    while (state.currentLightness < target) {
        state.max === 255 ? decay += 0.01 : state.max++;
        const { R, G, B } = decayFunction(decay)(state.max);
        state = { 
            ...state,
            currentLightness: getLightness(R, G, B),
            currentRGBValues: [R, G, B].map(Math.round)
        };
    }
    return state;
}

const lightness = getLightness(54, 54, 54);
const decay     = 0.62;
const order     = ['R', 'B', 'G'];

const generatedColor = generateColorFromLightness(lightness, decay, order);

console.log('target lightness:', lightness);
console.log('current result:'  , generatedColor);