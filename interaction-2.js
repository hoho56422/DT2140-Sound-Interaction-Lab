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

// The name should be the same as the WASM file, so change tuono with rain if you use brass.wasm
rain.createDSP(audioContext, 1024)
    .then(node => {
        dspNode = node;
        dspNode.connect(audioContext.destination);
        dspNode.setParamValue("/rain/volume", 0);
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

let fallStart = null;
let fallTriggered = false;

let lastMagnitude = null;
let lastTime = null;

const GRAVITY = 9.81;
const FREEFALL_THRESHOLD = 4.0;
const FALL_DURATION = 100;

function accelerationChange(accx, accy, accz) {
    const now = performance.now();

    const magnitude = Math.sqrt(
        accx * accx +
        accy * accy +
        accz * accz
    );

    // Check if phone was approximately stationary
    // before entering free fall.
    const wasStationary =
        lastMagnitude !== null &&
        Math.abs(lastMagnitude - GRAVITY) < 1.5 &&
        lastTime !== null &&
        now - lastTime < 100;

    const isFreeFall = magnitude < FREEFALL_THRESHOLD;

    if (isFreeFall) {

        if (fallStart === null && wasStationary) {
            fallStart = now;
            fallTriggered = false;
        }

        if (fallStart !== null) {
            const fallDuration = now - fallStart;

            if (
                fallDuration >= FALL_DURATION &&
                !fallTriggered
            ) {
                playAudio();
                fallTriggered = true;
            }
        }

    } else {
        fallStart = null;
        fallTriggered = false;
    }

    lastMagnitude = magnitude;
    lastTime = now;
}

function rotationChange(rotx, roty, rotz) {
}

function mousePressed() {
    // playAudio()
    // Use this for debugging from the desktop!
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
    // playAudio();
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

let rainTimer = null;

function playAudio() {
    if (!dspNode || audioContext.state === "suspended") {
        return;
    }

    dspNode.setParamValue("/rain/density", 500);
    dspNode.setParamValue("/rain/volume", 0.5);

    if (rainTimer !== null) {
        clearTimeout(rainTimer);
    }

    rainTimer = setTimeout(() => {
        dspNode.setParamValue("/rain/volume", 0);
        rainTimer = null;
    }, 3000);
}

//==========================================================================================
// END
//==========================================================================================