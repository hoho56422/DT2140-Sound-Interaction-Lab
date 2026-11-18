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
    const tilt = roty;

    if (tilt < -30) {
        selectedFrequency = 261.63; // C4
    } else if (tilt < -10) {
        selectedFrequency = 293.66; // D4
    } else if (tilt < 10) {
        selectedFrequency = 329.63; // E4
    } else if (tilt < 30) {
        selectedFrequency = 392.00; // G4
    } else {
        selectedFrequency = 440.00; // A4
    }
}

function deviceShaken() {
    shaketimer = millis();
    statusLabels[0].style("color", "pink");

    // Avoid multiple triggers from one shake
    if (millis() - lastPluckTime > 400) {
        playAudio();
        lastPluckTime = millis();
    }
}
function mousePressed() {
    playAudio(mouseX/windowWidth)
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

function playAudio() {
    if (!dspNode || audioContext.state !== "running") {
        return;
    }

    // Select pitch
    dspNode.setParamValue("/freq", selectedFrequency);

    // Set plucking strength
    dspNode.setParamValue("/gain", 0.5);

    // Pluck string
    dspNode.setParamValue("/gate", 1);

    setTimeout(() => {
        dspNode.setParamValue("/gate", 0);
    }, 100);
}

//==========================================================================================
// END
//==========================================================================================