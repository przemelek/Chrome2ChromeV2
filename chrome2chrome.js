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

    var h = $("h").value;
    var mi = $("mi").value;
    var y = $("y").value;
    var m = $("m").value;
    var d = $("d").value;
    var time=Date.parse(y+"-"+m+"-"+d+" "+h+":"+mi);
    var useTime=$("hid").present;

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
                if (useTime) {
                    url+="|"+time;
                }
                urls.push(url);
                if (!useTime) {
                    var sent = localStorage.sent;
                    var elems = [];
                    if (sent == "" || sent) {
                        elems = sent.split("\n");
                    }
                    elems.push(url);
                    while (elems.length > 9) elems.shift();
                    localStorage.sent = elems.join("\n");
                }
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

    var zam = "Send to: <select id=\"selector\"><option value=\"\"></option>";

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

    function e(id,val) {
        val=""+(val||(val==0?0:""));
        var len = val.length;
        if (len<2) len=2
        return "<input id='"+id+"' size='1' style='max-width: "+len+"em;' value='"+val+"'/>"
    }

    var date = new Date(Math.floor((new Date()*1/1000/60/60)+1)*60*60*1000);

    var y = date.getFullYear();
    var m = date.getMonth()+1;
    var d = date.getDate();
    var h = date.getHours();
    var mi = date.getMinutes();

    var dateTime="<div id='hid' style='display:none;'><font size='-1'>put time to open tab:<br/>"+e("y",y)+"/"+e("m",m)+"/"+e("d",d)+" "+e("h",h)+":"+e("mi",mi)+"</font></div>";
    dateTime+="<div id='showbutton' style='display:block;'><font size='-1'><a href='#' id='showTime'>set time &gt;&gt;&gt;</a></font></div>"

    zam+="<br />"+dateTime;

    function showSetTime() {
        $("showbutton").style.display="none";
        $("hid").style.display="block";
        $("hid")["present"]=true;
    }

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

    $("showTime").onclick=showSetTime;
}

try {
    $("year").innerHTML=new Date().getFullYear();
    init();
    $("manageButton").onclick = showConfig;
} catch (e) {
    console.log(e);
}
