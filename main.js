const test = document.querySelectorAll('#file-manager li');
console.log(test)

for(let list of test){
    list.onclick = onClick;
}


function onClick(){
    console.log("hello")
}