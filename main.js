////////AudioCtx

//init Audio Context
const audioCtx = new AudioContext({
    latencyHint: "interactive",
    sampleRate: 48000,
});

//setup analyser node
const analyser = audioCtx.createAnalyser();
analyser.fftSize = 2048;
analyser.connect(audioCtx.destination);
///////////////////////////////////////////////////////

//////Media
const files = new Map(); //key: DOMNode, value: AudioFile
let stream = undefined;
let recorder = undefined;
let selectedFile = undefined; //Dom File Node, key for files map
const fileView = document.getElementById("file-list");

//init MediaStream
async function initStream() {
    if (!stream) {
        try {
            stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
            });
        } catch (e) {
            throw e;
        }
    }
    return stream;
}
//init MediaRecorder with MediaStream with initStream() if not set. set recorder event handlers
async function initRecorder() {
    let blob = {};
    if (!recorder) {
        try {
            recorder = new MediaRecorder(await initStream());
        } catch (e) {
            throw e;
        }
        //Recorder Events
        recorder.ondataavailable = (e) => {
            blob = e.data;
        };
        recorder.onstop = () => {
            let file = new AudioFile("hello", blob, Date.now());
            addFile(file);
            selectPlaybackFile(file.getTemplate());
        };
    }
}
//Add file to Map and asscociated container to DOM
function addFile(file) {
    files.set(file._template, file);
    fileView.appendChild(file.getTemplate());
}
//AudioFile contains Audio data and metadata
class AudioFile {
    constructor(name, data, createdOn) {
        this._template = generateFileTemplate(name);
        this._name = name;
        this._data = data;
        this._createdOn = createdOn;
    }
    getTemplate() {
        return this._template;
    }
    getTemplateLabel() {
        return this._template.children[0];
    }
    changeName(newName) {
        this.getTemplateLabel().innerText = `Name:\n${newName}`;
    }
}
//generate Audio File DOM element
function generateFileTemplate(fileName) {
    let file = document.createElement("li");
    file.className = "file";
    file.innerHTML = `<label for="${fileName}">Name:<br />${fileName}</label>
          <input id="${fileName}" type="checkbox" />`;
    return file;
}
//select file element for playback
function selectPlaybackFile(fileContainer) {
    if (!selectedFile) {
        selectedFile = fileContainer;
        fileContainer.children[0].classList.add("selected");
    } else if (selectedFile !== fileContainer) {
        selectedFile.children[0].classList.remove("selected");
        fileContainer.children[0].classList.add("selected");
        selectedFile = fileContainer;
    } else {
        selectedFile.children[0].classList.remove("selected");
        selectedFile = undefined;
    }
}

//create audio buffer
async function createBuffer(selectedFile) {
    let src;
    try {
        const buffer = await audioCtx.decodeAudioData(
            await selectedFile.arrayBuffer()
        );
        src = audioCtx.createBufferSource();
        src.buffer = buffer;
    } catch (e) {
        console.log(e);
    }
    return src;
}
///////Interface Events

//Record Event
const recordBtn = document.getElementById("record-btn");
recordBtn.addEventListener("click", onRecord);

async function onRecord() {
    if (!recorder) {
        try {
            await initRecorder();
        } catch (e) {
            alert(`Access to microphone stopped: ${e.message}`);
            return;
        }
    }
    if (recorder.state === "inactive") {
        recorder.start();
        recordBtn.style.backgroundColor = "red";
    } else {
        recorder.stop();
        recordBtn.style.backgroundColor = "";
    }
}

//file selection event
document.addEventListener("click", onFileSelect);

function onFileSelect(event) {
    let target = event.target;
    if (target.parentNode.className === "file" && target.nodeName === "LABEL") {
        event.preventDefault();
        selectPlaybackFile(target.parentNode);
    }
}

//playback, get selectedFiles data Blob, create buffer from blob, connect to audioCtx destination
const playBtn = document.getElementById("playback-btn");
playBtn.addEventListener("click", onPlay);

async function onPlay() {
    if (!selectedFile) {
        alert("No File selected for playback");
        return;
    }
    let src = await createBuffer(files.get(selectedFile)._data);
    src.connect(analyser);
    src.start();
}

//delete event
const deleteBtn = document.getElementById("delete-btn");
deleteBtn.addEventListener("click", onDelete);

function onDelete() {
    let filesList = [...fileView.children];
    for (let file of filesList) {
        if (file.children[1].checked) {
            if (selectedFile === file) {
                selectedFile = undefined;
            }
            files.delete(file);
            file.remove();
        }
    }
    selectAllBtn.dataset.selectAll = false;
}

//select all event
const selectAllBtn = document.getElementById("check-all-btn");
selectAllBtn.addEventListener("click", onSelectAll);

function onSelectAll() {
    let select = selectAllBtn.dataset.selectAll == "false" ? true : false;
    for (let file of fileView.children) {
        file.children[1].checked = select;
    }
    selectAllBtn.dataset.selectAll = select;
}

//Get Event
const getBtn = document.getElementById("get-btn");
getBtn.addEventListener("click", onGet);

async function onGet() {
    console.log("get-btn pressed");
}

//Post event
const postBtn = document.getElementById("post-btn");
postBtn.addEventListener("click", onPost);

async function onPost() {
    console.log("post-btn pressed");
}
//////////////////////////////////////////////

///////Canvas
//get Canvas
const canvas = document.getElementById("display");
const canvasCtx = canvas.getContext("2d");

//create buffer
const bufferLength = analyser.frequencyBinCount;
const dataArray = new Uint8Array(bufferLength);

//draw waveform to canvas
function drawWave() {
    requestAnimationFrame(drawWave);
    analyser.getByteTimeDomainData(dataArray);
    canvasCtx.fillStyle = "rgb(0,0,0)";
    canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
    canvasCtx.lineWidth = 2;
    canvasCtx.strokeStyle = "rgb(255,255,255)";
    canvasCtx.beginPath();
    const sliceWidth = (canvas.width * 1.0) / bufferLength;
    let x = 0;
    for (let i = 0; i < bufferLength; i++) {
        let v = dataArray[i] / 128;
        let y = (v * canvas.height) / 2;
        if (i === 0) {
            canvasCtx.moveTo(x, y);
        } else {
            canvasCtx.lineTo(x, y);
        }
        x += sliceWidth;
    }
    canvasCtx.stroke();
}

//call functions
drawWave();
initRecorder();
