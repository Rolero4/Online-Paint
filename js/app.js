const newPageButton = document.getElementById('new-page')
const listOfButtons = document.getElementById('list');
const pages = [
    "Strona%1",
    "Strona%Smieszka",
    "Chrzest",
    "Test"
];

window.onload = function(){
    createButtons();
    const pageButtons = document.querySelectorAll(".page-selector");
    pageButtons.forEach(element => {
        element.addEventListener('click', goToCanvas);
    });
    newPageButton.addEventListener('click', newPage);
    pages
}

function getButtonsNamesFromPhp(){
    // wysyla zapytanie do php i uzupeia pages;
    // jak get bedzie zrealiozwane wczy funkcje createButtons
}

function createButtons(){
    pages.forEach(element => {
        const button = document.createElement('button')
        button.innerText = element.replace('%', ' ');
        button.classList = 'btn page-selector'
        listOfButtons.appendChild(button)
    });
}

function newPage(){
    let newPageName = undefined;
    newPageName = prompt ("Enter title od the project(max 15 characters, no '%' use and duplicates)", "Page " + pages.length); 
    if(newPageName != undefined){
        while(newPageName.length >= 15 || newPageName.includes("%") || pages.includes(newPageName)){
            newPageName = prompt ("Too many characters!(max 15) or '%' use", "Page " + pages.length); 
        }
        newPageName.replace(' ', '%')
        pages.push(newPageName);
        addNewButton();
        goToCanvas();
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
function goToCanvas(){
    index = pages.length-1;
    window.open('canvas.html?index='+index+"&name="+pages[index]);
}

// test z local storage
// function test(e){
//     let index = e.target.dataset.id;
//     localStorage.setItem('index', index);
//     location.href = "canvas.html";
//     window.open('canvas.html');
// }