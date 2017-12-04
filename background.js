// we need to check if this isn't first time when user starts extension
// in such case we will move user to optiomns.html
// Here magic happens ;-)

try {
    if (localStorage.computerName == null) {
        chrome.tabs.create({url: "options.html"});
    }
} catch (e) {
    console.log(e);
}

function getTimedOpen() {
    var timedOpen = localStorage.timedOpen || "[]";
    timedOpen = JSON.parse(timedOpen);
    return timedOpen;
}

function storeTimedOpen(timedOpen) {
    localStorage.timedOpen = JSON.stringify(timedOpen);
}

function checkForTimedTabs() {
    var timedOpen = getTimedOpen();
    var now = new Date()*1;
    var toKeep = [];
    for (var i=0; i<timedOpen.length; i++) {
        var urlToOpen = timedOpen[i];
        if (urlToOpen.time<now) {
            openTab(urlToOpen.url);
        } else {
            toKeep.push(urlToOpen);
        }
    }
    if (toKeep.length!=timedOpen.length) {
        storeTimedOpen(toKeep);
    }
    setTimeout(checkForTimedTabs,1000*60);
}

function openTab(value) {
    chrome.tabs.create({url: value});
    // and store it as opened page
    var opened = localStorage.opened;
    var elems = [];
    if (opened) {
        elems = opened.split("\n");
    }
    while (elems.length > 9) elems.shift();
    elems.push(value);
    localStorage.opened = elems.join("\n");
}

// we have listener for changes on chrome.storage
// we want to react only to changes on sync
chrome.storage.onChanged.addListener(function (changes, namespace) {
    var currentComputerName = localStorage.computerName;
    // iterate throught all changes
    for (key in changes) {
        var storageChange = changes[key];
        // we are interested only in changes for chrome.storage.sync
        if (namespace == "sync") {
            // what is new value?
            var newValue = storageChange.newValue;
            // in key we have info about key which changed
            // maybe it is current computer name?
            if (key == currentComputerName) {
                // lets check if we have anything to do
                if (newValue != null) {
                    // here we know that is should be an array with urls
                    newValue.forEach(function (value) {
                        // open url
                        if (value.indexOf("|")!=-1) {
                            var url = value.split("|")[0];
                            var time = value.split("|")[1];
                            var timedOpen = getTimedOpen();
                            timedOpen.push({url:url,time:time*1});
                            storeTimedOpen(timedOpen);
                            value = url;
                        } else {
                            openTab(value);
                        }
                    });
                    // at the end we want to keep everything small, so remove data from transfer objects
                    chrome.storage.sync.get(function (items) {
                        items[currentComputerName] = null;
                        chrome.storage.sync.set(items);
                    });
                }
            } else if (key == "computers") {  // OK, list of computers changed
                localStorage.listOfComputers = newValue.join(",");
            }
        }
    }
});

checkForTimedTabs();