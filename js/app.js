//#region global variables
const listOfButtons = document.getElementById('list');
const pages = [];
//#endregion

window.onload = function(){
    getPagesNamesFromPhp();
    window.setInterval(getPagesNamesFromPhp, 1000);
    const newPageButton = document.getElementById('new-page')
    newPageButton.addEventListener('click', newPage);
}

//#region Php communication
function getPagesNamesFromPhp(){
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
      if(xhr.readyState === 4){
        if(xhr.status === 200 || xhr.status === 304){
            try{
                const readyResponse = JSON.parse(this.response)
                pages.length = 0;
                for(let i in readyResponse) { 
                    pages.push(readyResponse[i]); 
                }; 
                createButtons(readyResponse);
            }
            catch(error){
                
            }
        }
      }
    };
    xhr.open("GET", "./php/getPagesNames.php", true); 
    xhr.setRequestHeader('Content-Type', ' application/json')
    xhr.send();
}

function sendNamesToPhp(){
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "./php/sendPagesNames.php", true);
    xhr.setRequestHeader('Content-type', "application/json");
    xhr.onreadystatechange = function () { //Call a function when the state changes.
        if (xhr.readyState == 4 && xhr.status == 200) {

        }
    };
    xhr.send(JSON.stringify(pages));
}

//#endregion

//#region button create center
function newPage(){
    let newPageName = null;
    newPageName = prompt ("Enter title od the project(max 15 characters, no '%' use and duplicates)", "Page " + pages.length);
    if(newPageName == null) return;
    while(newPageName == null || newPageName.length >= 15 || newPageName.includes("%") || pages.includes(newPageName)){
        newPageName = prompt ("Too many characters!(max 15) or '%' use", "Page " + pages.length); 
        if(newPageName == null) return;
    }
    if(newPageName != null){
        newPageName.replace(' ', '%')
        pages.push(newPageName);
        sendNamesToPhp();
        addNewButton(pages.length-1);
        goToNewCanvas();
    }
}

const removeChilds = (parent) => {
    while (parent.lastChild) {
        parent.removeChild(parent.lastChild);
    }
};


function createButtons(){
    removeChilds(listOfButtons);
    for (let index = 0; index < pages.length; index++) {
        addNewButton(index);
    }

    const pageButtons = document.querySelectorAll(".page-selector");
    pageButtons.forEach(element => {
        element.addEventListener('click', goToCanvas);
    });
}

function addNewButton(index){

    const button = document.createElement('button')
    button.innerText = pages[index].replace('%', ' ');
    button.classList = 'btn page-selector';
    button.dataset.id = index;
    listOfButtons.appendChild(button)
}
//#endregion

//#region go to canvas
function goToCanvas(e){
    let index = e.target.dataset.id;
    window.open('canvas.html?index='+index+"&name="+pages[index], '_self');
}

function goToNewCanvas(){
    index = pages.length-1;
    window.open('canvas.html?index='+index+"&name="+pages[index], '_self');
}
//#endregion