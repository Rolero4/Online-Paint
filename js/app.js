const pageButtons = document.querySelectorAll(".page-selector");
const newPageButton = document.getElementById('new-page')
const pages = [];

window.onload = function(){
    pageButtons.forEach(element => {
        element.addEventListener('click', goToCanvas);
    });
    newPageButton.addEventListener('click', newPage);
}


function newPage(){
    const newPageName = prompt ("Enter title od the project", "Page " + pages.length);  
    console.log(newPageName);
}




// test z parametrem url
function goToCanvas(e){
    let index = e.target.dataset.id;
    window.open('canvas.html?index='+index);
}
// test z local storage
// function test(e){
//     let index = e.target.dataset.id;
//     localStorage.setItem('index', index);
//     location.href = "canvas.html";
//     window.open('canvas.html');
// }