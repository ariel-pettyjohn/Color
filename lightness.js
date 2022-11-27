/*
 * Send this function a luminance value between 0.0 and 1.0,
 * and it returns L* which is "perceptual lightness"
 */
function getLightness (R, G, B) {
    function luminance (R, G, B) {
        /* 
         * Send this function a decimal sRGB gamma encoded color value
         * between 0.0 and 1.0, and it returns a linearized value.
         */
        function linearize (channel) {
            return channel <= 0.04045 
                ? channel / 12.92
                : Math.pow(((channel + 0.055) / 1.055), 2.4);
        }
    
        const normalizedChannels = [R / 255, G / 255, B / 255];
        const [linearR, linearG, linearB] = normalizedChannels.map(linearize);
        const luminance = 0.2126 * linearR + 0.7152 * linearG + 0.0722 * linearB;
        return luminance;
    }

    const _luminance = luminance(R, G, B);

    /* 
     * The CIE standard states 0.008856 but 216/24389 
     * is the intent for 0.008856451679036
     */
    return  _luminance <= 216 / 24389 
        /* 
         * The CIE standard states 903.3, but 24389/27 
         * is the intent, making 903.296296296296296
         */
        ? _luminance * (24389 / 27)  
        : Math.pow(_luminance, 1 / 3) * 116 - 16;
}

function generateColorFromLightness (targetLightness, decay) {
    const EPSILON = 0.1;
    let   R       = 0;
    let   result  = {
        currentLightness: null,
        currentRGBValues: null,
        currentError    : Infinity
    };
    while (result.currentError > EPSILON) {
        if (R === 255) return result;
        R++;
        const B = R * decay;
        const G = B * decay;
        const currentLightness = getLightness(R, G, B);
        result = { 
            currentLightness: currentLightness,
            currentRGBValues: [R, G, B].map(Math.round),
            currentError    : Math.abs(targetLightness - currentLightness)
        };
    }
    return result;
}

const lightness = getLightness(54, 54, 54);

console.log('target lightness:', lightness);
console.log('current result:'  , generateColorFromLightness(lightness, 0.62));