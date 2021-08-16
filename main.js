//To Do -----------------------
//record-stop button -> reocroding requires audio stream(),  onStopRecording() => append File() to FileManager() list
//play-pause button -> playSelectedFile(), pauseSlectedFile()
//timer -> display current and total File() time, scroll through time line via scroll bar 
//FileManagaer() responsible for n-File(), selectedFile(), deleteFile(n-File), addFile(1-File), download(n-File), upload(n-File)
//File() has name, timeLength, audioData, hasAudioEvent(), 
//canvas reposible for displaying waveForms
//waveForm - visual display of waveforms total and divided FFT?


class AudioFile {
    //the AudioFile is used to encpasulte an audio file with other useful information
    constructor(name, audioData, date) {
        this.name = name;
        this.audioData = audioData;
        this.createdOn = date;
        this.timeLength = 0;
        this.eventLocation = -1;
    }
    hasEvent(){
        return this.eventLocation ? true : false;
    }
}
class FileView{
    //The FileView is used as view control for adding, removing and manipulation of the html and css
    constructor(){
        this.fileList = document.getElementById('file-list');
    }
    changeSelectedState(fileContainer){
        const selectorClasses = fileContainer.children[0].classList;
        if(selectorClasses.contains('selected')){
            selectorClasses.remove(`selected`)
        }else {
            selectorClasses.add('selected')
       }
    }
    addFile(audioFile){
        const fileTemplate = 
            `<div class="file-details" onclick="selectFile(this.parentNode)">
                <dl>
                    <dd>Name:<br>${audioFile.name}</dd>
                    <br>
                    <dt>created on:<br>${audioFile.createdOn}</dt>
                </dl>
            </div>
            <input type="checkbox">`;
        const li = document.createElement('li');
        li.classList = "file";
        li.innerHTML = fileTemplate;
        this.fileList.appendChild(li);
    }
    deleteFiles(container){
        const fileContainer = container
        container.remove()
        return fileContainer;
    }
}    
class FileManager{
    //the FileManager is used to define the functionality of file usage. 
    constructor(){
        this.fileView = new FileView();
        this.fileList = new Map();
        this.selectedFile = null;
    }
    addFile(file){
        this.fileView.addFile(file);
    }
    selectFile(elem){
        const changeViewState = this.fileView.changeSelectedState;
        if(!this.selectedFile){
            this.selectedFile = elem;
            changeViewState(this.selectedFile);
        }else if(this.selectedFile === elem){
            changeViewState(this.selectedFile)
            this.selectedFile = null;
        }else{
            changeViewState(this.selectedFile)
            this.selectedFile = elem;
            changeViewState(this.selectedFile);
        }
    }
    getFiles(){
    }
    postFiles(){
    }
    deleteFiles(){
    }
}
class AudioController{
    constructor(){
    }
    startRecording(){
    }
    stopRecording(){
    }
    playAudio(){
    }
    pauseAudio(){
    }
    seek(){
    }
}

const files = new FileManager();
const file = new AudioFile('test-file-name', 10111010, Date());
const date = Date.now()
selectFile = (elem) => {files.selectFile(elem); console.log(files.selectedFile)};
deleteFiles = (elem) => files.deleteFiles(elem)
files.addFile(file)



//user interface
/////////////////////////////////////////////////////
//FILE MANAGEMENT//
//selectFile() - select file for playback
//deleteFile() - deletes file
//pushFiles() - pushes file to database if not already added
//pullFiles() - pulls files from database loads into browser
//startRecording() - starts audio recording
//stopRecording() - stops audio recording
//playAudio()
//pauseAudio()
//seekControl() - range bar for scanning through audio file timeframe? 