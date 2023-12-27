/*
        ████  ████
      ██████████████
      ██████████████
        ██████████            ver 0.1 alpha
          ██████
            ██

    ██████  ██  ██      ██  ██████  ██      ██████         ████
    ████    ██  ████  ████  ██  ██  ██      ██             ██████''██
        ██  ██  ██  ██  ██  ██████  ██      ████           ████     |
    ██████  ██  ██      ██  ██      ██████  ██████         ██████__██ 

    ██████  ██████  ██████  ██████  ██████      ██████  ██████  ██████  ██████
    ████      ██    ██  ██  ██  ██    ██        ██  ██  ██  ██  ██      ██
        ██    ██    ██████  ████      ██        ██████  ██████  ██  ██  ████
    ████      ██    ██  ██  ██  ██    ██        ██      ██  ██  ██████  ██████
*/
//----------settings object-------------
let i_accentcolor = document.getElementById('i_accentcolor');
let i_borderradius = document.getElementById('i_borderradius');
let i_bg = document.getElementById('i_bg');
let i_searchprovider = document.getElementById('i_searchprovider');
var background = document.getElementById("bg");

function settings(key, value, save) {
    switch(key) {
        case 'accentcolor' : 
            document.body.style.setProperty('--accent-color', value);
            (save)?localStorage.setItem(key, value):i_accentcolor.value = value;
            break;
        case 'borderradius' : 
            document.body.style.setProperty('--border-radius', value+"px");
            (save)?localStorage.setItem(key, value):i_borderradius.value = value;
        break;
        case 'background' : 
            if(typeof(value) == 'object'){
                var freader = new FileReader();
                freader.onloadend = ()=>{
                    background.src = freader.result;
                    localStorage.setItem(key, freader.result);
                };
                freader.readAsDataURL(value[0]);
            }
            else{
                background.src = value;
            }
        break;
        case 'searchprovider' : 
            (save)?localStorage.setItem(key, value):i_searchprovider.value = value;
        break;
    }
}

//----------------event listeners-----------------
//inputs
i_accentcolor.addEventListener('input', (e)=>{
    settings('accentcolor', e.target.value, true);
})
i_borderradius.addEventListener('input', (e)=>{
    settings('borderradius', e.target.value, true);
})
i_bg.addEventListener('change', (e)=>{
    settings('background', e.target.files, true);
})
i_searchprovider.addEventListener('input', (e)=>{
    settings('searchprovider', e.target.value, true);
})
document.getElementById("f_search").addEventListener('submit', (e)=>{
    let receivedText = textToUrl(e.target.children[0].value);
    if(receivedText.isUrl){
        window.location.href = receivedText.text;
    }
    else {
        window.location.href = localStorage.searchprovider+receivedText.text;
    }
    e.preventDefault(); 

})
//buttons
document.getElementById("b_addbookmark").addEventListener('click',()=>{
    showDialog('addbookmark');
})
document.getElementById("b_settings").addEventListener('click',()=>{
    showDialog('settings');
})
document.getElementById("b_showwellcome").addEventListener('click',()=>{
    showDialog('wellcome');
})
//add bookmark form
let i_bname = document.getElementById("i_bname");
let i_burl = document.getElementById("i_burl");
let f_addb = document.getElementById("f_addb");
f_addb.addEventListener('submit', (e)=>{
    addBookmarkToHTML(i_bname.value, i_burl.value);
})
f_addb.addEventListener('input', (e)=>{
    document.getElementById('b_addfav').disabled = (i_bname.value !== '' && i_burl.value !== '') ? false : true;
})

//--------------------init------------------------
//check if exist settings saved in localstorage, if not, load defaults.
switch (undefined) {
    case localStorage.accentcolor : localStorage.setItem('accentcolor', '360');
    case localStorage.background : localStorage.setItem('background', '');
    case localStorage.borderradius : localStorage.setItem('borderradius', '24');
    case localStorage.searchprovider : localStorage.setItem('searchprovider', 'https://duckduckgo.com/?q=');
    case localStorage.wellcome : localStorage.setItem('wellcome', "true"); showDialog('wellcome');
    case localStorage.blur : localStorage.setItem('blur', "true");
}
//apply the settings
settings('accentcolor',localStorage.accentcolor);
settings('borderradius',localStorage.borderradius);
settings('searchprovider',localStorage.searchprovider);
settings('background',localStorage.background);
settings('blur',localStorage.blur);
//bookmarks management
let bookmarksFolder;
chrome.bookmarks.search("SSP New Tab", (result)=>{
    if(result.length != 0 ){//if the folder exits, load it
        bookmarksFolder = result[0];
        console.log("SSP New Tab folder found! Read data");
        chrome.bookmarks.getChildren(bookmarksFolder.id, (bookmarksList)=>{
            bookmarksList.forEach(bookmark => { 
                addBookmarkToHTML(bookmark.title, bookmark.url, bookmark.id);
            });
        })
    }
    else {//if the folder doesnt exits ("SSP New Tab" not found in chrome bookmarks list), create it
        chrome.bookmarks.create({title:"SSP New Tab"}, (createdFolder)=>{
            bookmarksFolder = createdFolder;
            console.log("SSP New Tab folder not found! New folder created!")
        })
    }
})
//-----------------stylling and behavior--------------
//Close buttons: for each dialog in html, in each .close button, add a comand to close this dialog
Array.from(document.querySelectorAll("dialog")).forEach((item)=>{ 
    item.querySelector('.close') ? item.querySelector(".close").addEventListener("click", ()=>{item.close();}) : undefined;
});
//RangeBar styiling: fix bar size in all range bars
function fixBarSize(rangeNode){
    rangeNode.style.backgroundSize = (rangeNode.value - rangeNode.min) * 100 / (rangeNode.max - rangeNode.min) + '% 100%';
}
Array.from(document.querySelectorAll("input[type='range']")).forEach((item)=>{
    fixBarSize(item);
    item.addEventListener("input", (e)=>{
        fixBarSize(e.target)
    })
});
function showDialog(id) {/*shorthand for opening dialogs*/
    document.getElementById(id).showModal();
}
//--------------main clock--------------
function updateClock() {
    var time = new Date();
    var hh = time.getHours();
    var mm = time.getMinutes();
    var ss = time.getSeconds();
    if (hh < 10){hh = "0"+hh;}
    if (mm < 10){mm = "0"+mm;}
    if (ss < 10){ss = "0"+ss;}
    document.getElementById("clock").innerText = hh+":"+mm+":"+ss;
}
updateClock();//show the clock on opening the page
setInterval(updateClock,1000);//updates the clock every second

/*------------------functions------------------------*/
function addBookmarkToHTML(name, url, id) {//add bookmarks to html
    url = textToUrl(url).text;     
    //get the favicon using chrome api
    const faviconUrl = new URL(chrome.runtime.getURL('/_favicon/'));
    faviconUrl.searchParams.set('pageUrl', url);
    faviconUrl.searchParams.set('size', '64');
    //create the button for the bookmark
    let bookmarkBtn = document.createElement("a");
    bookmarkBtn.classList = 'bookmark';
    bookmarkBtn.href = textToUrl(url).text;
    bookmarkBtn.innerHTML = `<img src='${faviconUrl.toString()}'><a>${name}</a>`;
    //create the delete button
    bookmarkDel = document.createElement("span");
    bookmarkDel.classList = 'delete';
    bookmarkDel.innerText = "X";
    bookmarkDel.addEventListener('click', (e)=>{remove(e.target.parentNode.id); e.preventDefault()});
    //put delete button into bookmark button and put it in bookmarks container
    bookmarkBtn.appendChild(bookmarkDel);
    document.getElementById("bookmarks").appendChild(bookmarkBtn);
    document.getElementById("bookmarks").appendChild(document.getElementById("b_addbookmark"));
    if(id >= 0 ) {//if the id has specified, use it
        bookmarkBtn.id = id;
    }
    else {//if not, create the bookmark and get the id
        chrome.bookmarks.create({title:name, url:url, parentId:bookmarksFolder.id}, (e)=>{
            bookmarkBtn.id = e.id;
            console.log(e);
        })
    }
}
function remove(id) {//delete bookmark function for delete buttons
    chrome.bookmarks.remove(id, ()=>{//remove from chrome bookmarks list, then, remove from html
        document.getElementById(id).remove();
    });
}
function saveChanges(settingObj){//save settings to localstorage
    localStorage.setItem(settingObj.key, settingObj.value);
}
function textToUrl(text) {
    text = text.trim();
    let isUrl = false; // initially, its not an url
    //conditions to be a url
    if(text.search(' ') <= 0){ //verify if it has spaces
        if(text.search("://") >= 0){//if it has a specifield protocol (ftp://10.0.0.1, https://goo.gl)
            isUrl = true; //it is an url
        }
        else {//if a protocol hasnt specifield
            if(text.search(/([^ ][a-zA-Z][0-9]?)+\.\S+/g) >= 0){//search for format that matches abcdef.abc
                text = 'http://'+text; //add a protocol to the text
                isUrl = true; //it is an url
            }
        }
    }
    /* FIRST: it has spaces?
    yes: see if it has a protocol, if not, see if have dots (abc.com.br), if not, the variable isUrl will not change to true! (it will be false)
    no: no changes will be made, so the isUrl variable will continue to be FALSE
    */
    return {text:text, isUrl:isUrl};

}
