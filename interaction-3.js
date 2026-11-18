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
const dspName = "karplus";
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
karplus.createDSP(audioContext, 1024)
    .then(node => {
        dspNode = node;
        dspNode.connect(audioContext.destination);
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

let selectedFrequency = 329.63; // E4
let lastPluckTime = 0;

function rotationChange(rotx, roty, rotz) {
   
}


function mousePressed() {
    playAudio(mouseX/windowWidth)
    // Use this for debugging from the desktop!
}

let lastPlayTime = 0;

function deviceMoved() {
    movetimer = millis();
    statusLabels[2].style("color", "pink");

    // Trigger at most once every 500 ms
    if (millis() - lastPlayTime > 500) {
        playAudio();
        lastPlayTime = millis();
    }
}

function deviceTurned() {
    threshVals[1] = turnAxis;
}
function deviceShaken() {
    // shaketimer = millis();
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

let gateTimer = null;

function playAudio() {
    if (!dspNode || audioContext.state !== "running") {
        return;
    }

    // Select note E4
    dspNode.setParamValue("/karplus/params/freq", 329.63);

    // Plucking strength
    dspNode.setParamValue("/karplus/params/gain", 0.5);

    // Trigger the string
    dspNode.setParamValue("/karplus/gate", 0);

    if (gateTimer !== null) {
        clearTimeout(gateTimer);
    }

    gateTimer = setTimeout(() => {
        dspNode.setParamValue("/karplus/gate", 1);

        gateTimer = setTimeout(() => {
            dspNode.setParamValue("/karplus/gate", 0);
            gateTimer = null;
        }, 150);
    }, 20);
}
//==========================================================================================
// END
//==========================================================================================