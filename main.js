////////AudioCtx
const ctx = new AudioContext({ latencyHint: "interactive", sampleRate: 48000 });
const analyser = ctx.createAnalyser();
analyser.fftSize = 2048;
const bufferLength = analyser.frequencyBinCount;
const dataArray = new Uint8Array(bufferLength);
analyser.getByteTimeDomainData(dataArray);
analyser.connect(ctx.destination);
///////////////////////////////////////////////////////

///////Canvas
const canvas = document.getElementById('display');
const canvasCtx = canvas.getContext('2d');
draw();
///////////////////////////////////////////////////////
const files = new Map();//key: DOMNode, value AudioFile
let stream;
let recorder;
let selectedFile;//Dom File Node, key for files map
const fileView = document.getElementById("file-list");
const playBtn = document.getElementById('playback-btn');

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
            let file = new AudioFile("hello", blob, Date.now())
            addFile(file);
            selectPlaybackFile(file.getTemplate())
        };
    }
}
//create AudioFile instance add file to Map and asscociated container to DOM 
function addFile(file) {
    files.set(file._template, file);
    fileView.appendChild(file.getTemplate());
}
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
    getTemplateLabel(){
        return this._template.children[0];
    }
    changeName(newName){
        this.getTemplateLabel().innerText = `Name:\n${newName}`
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

//Record Event
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
    } else {
        recorder.stop();
        recordBtn.style.backgroundColor = "";
    }
}

//playback file selection event
document.addEventListener("click", onFileSelect);

function onFileSelect(event) {
    let target = event.target;
    if (target.parentNode.className === "file" && target.nodeName === "LABEL") {
        event.preventDefault();
        selectPlaybackFile(target.parentNode);
    }
}

//playback, get selectedFiles data Blob, create buffer from blob, connect to ctx destination
playBtn.addEventListener('click', onPlay);
async function onPlay(){
    if(!selectedFile){
        alert("No File selected for playback");
        return;
    }
    let src = await createBuffer(files.get(selectedFile)._data);
    src.connect(analyser);
    src.start();
}



//draw waveform/bargraph to canvas
function draw(){
    requestAnimationFrame(draw);
    analyser.getByteTimeDomainData(dataArray);

    canvasCtx.fillStyle = "rgb(95,160,160)";
    canvasCtx.fillRect(0,0, canvas.width, canvas.height);
    canvasCtx.lineWidth = 2;
    canvasCtx.strokeStyle = "rgb(0,0,0)";
    canvasCtx.beginPath();
    const sliceWidth = canvas.width * 1.0 / bufferLength;
    let x = 0;
    for(let i = 0; i < bufferLength; i++){
        let v = dataArray[i] /  128.0;
        let y = v * canvas.height / 2;
        if(i === 0){
            canvasCtx.moveTo(x,y);
        } else {
            canvasCtx.lineTo(x,y);
        }
        x += sliceWidth;
    }
    canvasCtx.lineTo(canvas.width, canvas.height / 2);
    canvasCtx.stroke();
}
async function createBuffer(selectedFile){
    let buffer;
    try{
        buffer = await ctx.decodeAudioData(await selectedFile.arrayBuffer());
        let src = ctx.createBufferSource();
        src.buffer = buffer
        return src;
    }catch(e){
        console.log(e)
    }
}

