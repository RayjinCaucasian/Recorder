//To Do -----------------------
//record-stop button -> reocroding requires audio stream(),  onStopRecording() => append File() to FileManager() list
//play-pause button -> playSelectedFile(), pauseSlectedFile()
//timer -> display current and total File() time, scroll through time line via scroll bar 
//FileManagaer() responsible for n-File(), selectedFile(), deleteFile(n-File), addFile(1-File), download(n-File), upload(n-File)
//File() has name, timeLength, audioData, hasAudioEvent(), 
//canvas reposible for displaying waveForms
//waveForm - visual display of waveforms total and divided FFT?


class AudioFile {
    constructor(name, audioData, date,) {
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
    constructor(){
        this.filetemplate = ``;
    }
    changeSelectedState(fileContainer){
        const selectorClasses = fileContainer.children[0].classList;
        if(selectorClasses.contains('selected')){
            selectorClasses.remove(`selected`)
        }else {
            selectorClasses.add('selected')
       }
    }
    addFile(){
        return 0;
    }
    removeFile(container){
        const fileContainer = container
        container.remove()
        return fileContainer;
    }
}    
    
        
class FileManager{
    constructor(){
        this.fileView = new FileView();
        this.fileList = new Map();
        this.selectedFile = null;
    }
    addFile(file){
        console.log(`inside addFile() ${file}`);
    }
    removeFile(elem){
        if(this.selectedFile === elem){
            this.selectedFile = null;
        }
        this.fileView.removeFile(elem);
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
    uploadFile(){
    }
    downloadFiles(){
    }
}



const files = new FileManager();

selectFile = (elem) => {files.selectFile(elem); console.log(files.selectedFile)};
removeFile = (elem) => files.removeFile(elem)
