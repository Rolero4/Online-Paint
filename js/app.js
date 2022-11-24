const newPageButton = document.getElementById('new-page')
const listOfButtons = document.getElementById('list');
const pages = [];

window.onload = function(){
    getPagesNamesFromPhp();
    newPageButton.addEventListener('click', newPage);
}

function getPagesNamesFromPhp(){
    const xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function() {
      if(xhr.readyState === 4){
        if(xhr.status === 200 || xhr.status === 304){
            const readyResponse = JSON.parse(this.response)
            console.log(readyResponse); 
            createButtons(readyResponse);
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
            console.log("sent");               
        }
    };
    xhr.send(JSON.stringify(Object.assign({}, pages)));
}

function Canvas(id){
	this.id = id;
	this.paintings = [];
}

function sendNewCanvasToPhp(id){
	const xhr = new XMLHttpRequest();
    xhr.open("POST", "./php/addNewCanvas.php", true);
    xhr.setRequestHeader('Content-type', "application/json");
    xhr.onreadystatechange = function () { //Call a function when the state changes.
        if (xhr.readyState == 4 && xhr.status == 200) {
            console.log("sent");               
        }
    };
    xhr.send(JSON.stringify(Object.assign({}, new Canvas(id))));

}


function createButtons(response){
    for(let i in response) { 
        pages.push(response[i]); 
    }; 
    console.log(pages);
    let currentId = 0;
    pages.forEach(element => {
        const button = document.createElement('button')
        button.innerText = element.replace('%', ' ');
        button.classList = 'btn page-selector'
        button.dataset.id = currentId;
        currentId++;
        listOfButtons.appendChild(button)
    });
    const pageButtons = document.querySelectorAll(".page-selector");
    pageButtons.forEach(element => {
        element.addEventListener('click', goToCanvas);
    });
}

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
        addNewButton();
        goToNewCanvas();
        sendNewCanvasToPhp(pages.length -1);
    }

}

function addNewButton(){
    const index = pages.length-1;
    const button = document.createElement('button')
    button.innerText = pages[index].replace('%', ' ');
    button.classList = 'btn page-selector'
    listOfButtons.appendChild(button)
}

// go to canvas with event
function goToCanvas(e){
    let index = e.target.dataset.id;
    window.open('canvas.html?index='+index+"&name="+pages[index]);
}
// go to new canvas
function goToNewCanvas(){
    index = pages.length-1;
    window.open('canvas.html?index='+index+"&name="+pages[index]);
}