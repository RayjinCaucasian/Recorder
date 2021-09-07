const ctx = new AudioContext({ latencyHint: "interactive", sampleRate: 48000 });
let stream;
let recorder;
const files = [];

//init MediaStream
async function initStream() {
    if (!this._stream) {
        try {
            this._stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
            });
        } catch (e) {
            throw e;
        }
    }
    return this._stream;
}
//init MediaRecorder with Stream dependecy if needed
async function initRecorder() {
    let blob = {};
    if (!this._recorder) {
        try {
            recorder = new MediaRecorder(await this.initStream());
        } catch (e) {
            throw e;
        }
        //Recorder Events
        recorder.ondataavailable = (e) => {
            blob = e.data;
        };
        recorder.onstop = () => {
            files.push(new AudioFile("hello", blob, Date.now()));
            blob = {};
        };
    }
}

class AudioFile {
    constructor(name, data, createdOn) {
        this._name = name;
        this._data = data;
        this._createdOn = createdOn;
    }
}

//Record
const recordBtn = document.getElementById("record-btn");
recordBtn.addEventListener("click", onRecord);

async function onRecord() {
    if (!recorder) {
        try {
            await initRecorder();
        } catch (e) {
            alert(`Access to microphone stopped: ${e.message}`);
        }
    }
    if (recorder.state === "inactive") {
        recorder.start();
        recordBtn.style.backgroundColor = "red";
    }else{
        recorder.stop();
        recordBtn.style.backgroundColor = "";
    }
}

//file selection
document.addEventListener("click", onFileSelect);

function onFileSelect(event) {
    let target = event.target;
    if (target.parentNode.className === "file" && target.nodeName === "LABEL") {
        event.preventDefault();
    }
}
