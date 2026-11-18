//==========================================================================================
// AUDIO SETUP
//------------------------------------------------------------------------------------------
//
//------------------------------------------------------------------------------------------
// Edit just where you're asked to!
//------------------------------------------------------------------------------------------
//
//==========================================================================================
let dspNode = null;
let dspNodeParams = null;
let jsonParams = null;

// Change here to ("tuono") depending on your wasm file name
const dspName = "rain";
const instance = new FaustWasm2ScriptProcessor(dspName);

// output to window or npm package module
if (typeof module === "undefined") {
    window[dspName] = instance;
} else {
    const exp = {};
    exp[dspName] = instance;
    module.exports = exp;
}

// The name should be the same as the WASM file, so change tuono with brass if you use brass.wasm
rain.createDSP(audioContext, 1024)
    .then(node => {
        dspNode = node;
        dspNode.connect(audioContext.destination);

        const startVolume = 0.15;
        dspNode.setParamValue("/rain/volume", startVolume);
        dspNode.setParamValue("/rain/density", 600);

        console.log('params: ', dspNode.getParams());
        const jsonString = dspNode.getJSON();
        jsonParams = JSON.parse(jsonString)["ui"][0]["items"];
        dspNodeParams = jsonParams
        // const exampleMinMaxParam = findByAddress(dspNodeParams, "/thunder/rumble");
        // // ALWAYS PAY ATTENTION TO MIN AND MAX, ELSE YOU MAY GET REALLY HIGH VOLUMES FROM YOUR SPEAKERS
        // const [exampleMinValue, exampleMaxValue] = getParamMinMax(exampleMinMaxParam);
        // console.log('Min value:', exampleMinValue, 'Max value:', exampleMaxValue);
    });


//==========================================================================================
// INTERACTIONS
//------------------------------------------------------------------------------------------
//
//------------------------------------------------------------------------------------------
// Edit the next functions to create interactions
// Decide which parameters you're using and then use playAudio to play the Audio
//------------------------------------------------------------------------------------------
//
//==========================================================================================

function accelerationChange(accx, accy, accz) {
    // playAudio()
}

function rotationChange(rotx, roty, rotz) {
}


function mousePressed() {
    playAudio();
}

function deviceMoved() {
    movetimer = millis();
    statusLabels[2].style("color", "pink");
}

function deviceTurned() {
    threshVals[1] = turnAxis;
}
function deviceShaken() {
    shaketimer = millis();
    statusLabels[0].style("color", "pink");
    
}

function getMinMaxParam(address) {
    const exampleMinMaxParam = findByAddress(dspNodeParams, address);
    // ALWAYS PAY ATTENTION TO MIN AND MAX, ELSE YOU MAY GET REALLY HIGH VOLUMES FROM YOUR SPEAKERS
    const [exampleMinValue, exampleMaxValue] = getParamMinMax(exampleMinMaxParam);
    console.log('Min value:', exampleMinValue, 'Max value:', exampleMaxValue);
    return [exampleMinValue, exampleMaxValue]
}

//==========================================================================================
// AUDIO INTERACTION
//------------------------------------------------------------------------------------------
//
//------------------------------------------------------------------------------------------
// Edit here to define your audio controls 
//------------------------------------------------------------------------------------------
//
//==========================================================================================





let rainStopTimer = null;
let rainGrowTimer = null;

function playAudio() {
    if (!dspNode) {
        return;
    }

    if (audioContext.state === 'suspended') {
        return;
    }

    // Stop previous timers
    clearInterval(rainGrowTimer);
    clearTimeout(rainStopTimer);

    // Set rain density
    dspNode.setParamValue("/rain/density", 100);

    // Start with no sound
    dspNode.setParamValue("/rain/volume", 0);

    const startTime = performance.now();
    const duration = 2000;
    const maxVolume = 0.6;

    // Gradually increase volume
    rainGrowTimer = setInterval(() => {

        const elapsed = performance.now() - startTime;

        const progress = Math.min(elapsed / duration, 1);

        
        const volume = startVolume + progress * (maxVolume - startVolume);

        dspNode.setParamValue("/rain/volume", volume);

        // Stop increasing after 2 seconds
        if (progress >= 1) {

            clearInterval(rainGrowTimer);

            // Keep the maximum volume briefly
            rainStopTimer = setTimeout(() => {
                if (dspNode) {
                    dspNode.setParamValue("/rain/volume", 0);
                }
            }, 300);
        }

    }, 50);
}

//==========================================================================================
//==========================================================================================
// FREE FALL DETECTION
//==========================================================================================

// Remember when free fall starts
let freeFallStart = null;

// Prevent repeated triggers
let lastFallTrigger = -Infinity;

// Minimum detected free-fall duration (milliseconds)
const minFallDuration = 50;

// Listen to the phone's motion sensor
window.addEventListener("devicemotion", function(event) {

    const acc = event.accelerationIncludingGravity;

    if (!acc ||
        !Number.isFinite(acc.x) ||
        !Number.isFinite(acc.y) ||
        !Number.isFinite(acc.z)) {
        return;
    }

    // Total acceleration from all three axes
    const totalAcceleration = Math.sqrt(
        acc.x * acc.x +
        acc.y * acc.y +
        acc.z * acc.z
    );

    const now = performance.now();

    // Detect when the phone is almost weightless
    if (totalAcceleration < 3) {

        if (freeFallStart === null) {
            freeFallStart = now;
        }

    } else {

        // Free fall has ended
        if (freeFallStart !== null) {

            const fallDuration = now - freeFallStart;

            freeFallStart = null;

            // Trigger rain after a sufficiently long free fall
            if (
                fallDuration >= minFallDuration &&
                now - lastFallTrigger > 3000
            ) {

                lastFallTrigger = now;

                console.log("Free fall detected!");

                playAudio();
            }
        }
    }
});
// END
//==========================================================================================