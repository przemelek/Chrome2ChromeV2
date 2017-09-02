function $(id) {
    return document.getElementById(id);
}

var oldContent = $("content").innerHTML;

function showConfig() {
    var manageButton = $("manageButton");
    var contentNode = $("content");
    manageButton.onclick = function () {
        contentNode.innerHTML = oldContent;
        init();
        manageButton.innerHTML = "Manage";
        manageButton.onclick = showConfig;
    };
    manageButton.innerHTML = "back..";
    var content = "<h2>Manage computers</h2>Delete machine:<br /><div id='marker2'></div>";
    contentNode.innerHTML = content;
    var listOfComputers = localStorage.listOfComputers;
    var elems = listOfComputers.split(",");
    elems.sort();
    var marker = $("marker2");
    for (var i = 0; i < elems.length; i++) {
        if (localStorage.computerName == elems[i]) continue;
        if (elems[i] != "" && elems[i] != null) {
            var newNode = document.createElement("A");
            newNode.setAttribute("computerName", elems[i]);
            newNode.onclick = function (event) {
                var element = event.srcElement;
                var name = element.getAttribute("computerName");
                chrome.storage.sync.get(function (items) {
                    var newComputerNames = [];
                    for (var i = 0; i < items.computers.length; i++) {
                        if (items.computers[i] != name) newComputerNames.push(items.computers[i]);
                    }
                    items.computers = newComputerNames;
                    chrome.storage.sync.set(items);
                    setTimeout(showConfig, 100);
                });

            };
            newNode.innerHTML = elems[i];
            newNode.href = "#";
            contentNode.insertBefore(newNode, marker);
            contentNode.insertBefore(document.createElement("BR"), marker)
        }
    }
}

function send() {
    var targetComputer = $("selector").value;
    $("content").innerHTML = "&nbsp;&nbsp;&nbsp;Sending....&nbsp;&nbsp;&nbsp;";
    setTimeout(function () {
        var req = {};
        req.cmd = "req";
        req.computerName = targetComputer;
        chrome.storage.sync.get(function (items) {
            var urls = items[targetComputer];
            if (!urls) {
                urls = [];
                items[targetComputer] = urls;
            }
            chrome.tabs.getSelected(null, function (tab) {
                var url = tab.url;
                urls.push(tab.url);
                var sent = localStorage.sent;
                var elems = [];
                if (sent == "" || sent) {
                    elems = sent.split("\n");
                }
                elems.push(url);
                while (elems.length > 9) elems.shift();
                localStorage.sent = elems.join("\n");
                chrome.storage.sync.set(items);
                $("content").innerHTML = "&nbsp;&nbsp;&nbsp;Sent :-)&nbsp;&nbsp;&nbsp;";
            });
        });
    }, 0);
}

function displayListOfLinks(array, whereToPut, marker, title) {
    var openedMap = {};
    if (array.length > 0) {
        var newNode = document.createElement("SPAN");
        newNode.innerHTML = "<font size='-1'><b>" + title + "</b></font>";
        $(whereToPut).insertBefore(newNode, marker);
        $(whereToPut).insertBefore(document.createElement("BR"), marker)
    }
    for (var i = 0; i < array.length; i++) {
        var urlToOpen = array[i];
        if (openedMap[urlToOpen]) continue;
        openedMap[urlToOpen] = true;
        var toDisplay = array[i];
        if (toDisplay.indexOf("://") != -1) {
            toDisplay = toDisplay.substring(toDisplay.indexOf("://") + 3);
        }
        if (toDisplay.length > 30) toDisplay = toDisplay.substring(0, 14) + "...." + toDisplay.substring(toDisplay.length - 15).trim().replace("\n", " ").replace("\t", " ");
        var newNode = document.createElement("A");
        newNode.onclick = function (event) {
            var element = event.srcElement.parentNode;
            chrome.tabs.create({url: element.href2});
        };
        newNode.innerHTML = "<font size=\"-1\">" + toDisplay + "</font>";
        newNode.href = "#";
        newNode.href2 = urlToOpen;
        $(whereToPut).insertBefore(newNode, marker);
        $(whereToPut).insertBefore(document.createElement("BR"), marker)
    }

}

function init() {
    var computerName = localStorage.computerName;

    var zam = "Send to:<select id=\"selector\"><option value=\"\"></option>";

    var s = localStorage.listOfComputers;
    if (s) {
        var elems = s.split(",");
        elems.sort();
        for (var i = 0; i < elems.length; i++) {
            if (elems[i] != "" && elems[i] != null) {
                zam += ("<option value='" + elems[i] + "'>" + elems[i] + "</option>");
            }
        }
    }
    zam += "</select>";
    $("sendTo").innerHTML = zam;
    var opened = localStorage.opened;
    var sent = localStorage.sent;
    $("selector").onchange = send;
    var openedArray = [];
    var sentArray = [];
    if (opened) {
        openedArray = opened.split("\n");
    }
    if (sent) {
        sentArray = sent.split("\n");
    }
    var zaw = "";

    displayListOfLinks(openedArray, "lastOpened", $("marker"), "Received");
    if (sent) {
        displayListOfLinks(sentArray, "lastSent", $("sentMarker"), "Sent")
    }
}

try {
    $("year").innerHTML=new Date().getFullYear();
    init();
    $("manageButton").onclick = showConfig;
} catch (e) {
    console.log(e);
}
