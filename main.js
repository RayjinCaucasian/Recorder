class Media {
    constructor() {
        this._ctx = new AudioContext({
            sampleRate: 48000,
            latencyHint: "interactive",
        });

        this._stream;
        this._recorder;
        this._micNode;
        this._fileSrc;
        this._files = [];
    }
    async getStream() {
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
    async initRecorder() {
        let chunks = [];
        if (!this._recorder) {
            try {
                this._recorder = new MediaRecorder(await this.getStream());
                this._recorder.ondataavailable = (e) => chunks.push(e.data);
                this._recorder.onstop = () => {
                    const blob = new Blob(chunks);
                    this._files.push(blob);
                    chunks = [];
                };
            } catch (e) {
                throw e;
            }
        }
    }
    async record() {
        if (!this._recorder) {
            try {
                await this.initRecorder();
            } catch (e) {
                alert(`Access to microphone failed: ${e.message}`);
                console.log(e)
                return;
            }
        }
        if (this._recorder.state === "inactive") {
            this._recorder.start();
        } else {
            this._recorder.stop();
        }
    }
}

//MEDIA
const media = new Media();
const recordBtn = document
    .getElementById("record-btn")
    .addEventListener("click", onRecord);

function onRecord() {
    media.record();
    console.log(media);
}

//file selection
const fileList = document.getElementById("file-list");
document.addEventListener("click", onFileSelect);

function onFileSelect(event) {
    let target = event.target;
    if (target.parentNode.className === "file" && target.nodeName === "LABEL") {
        event.preventDefault();
        target.classList.toggle("selected");
    }
    console.log();
}
