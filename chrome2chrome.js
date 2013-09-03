function $(id) { return document.getElementById(id); }

var oldContent = $("content").innerHTML;

function showConfig() {
  $("manageButton").onclick=function() {
    $("content").innerHTML=oldContent;
    init();
    $("manageButton").innerHTML="Manage";
    $("manageButton").onclick=showConfig;    
  };
  $("manageButton").innerHTML="back.."
  var content = "<h2>Manage computers</h2>Delete machine:<br /><div id='marker2'></div>";
  $("content").innerHTML=content;
  var listOfComputers = localStorage.listOfComputers;
  var elems = listOfComputers.split(",");
  elems.sort();
  var marker = $("marker2");
  for (var i=0; i<elems.length; i++) {
    if (localStorage.computerName==elems[i]) continue;
    if (elems[i]!="" && elems[i]!=null) {
     var newNode = document.createElement("A");
     newNode.setAttribute("computerName",elems[i]);
     newNode.onclick=function(event) {
        var element = event.srcElement;
        var name = element.getAttribute("computerName");
        chrome.storage.sync.get(function(items) {
          var newComputerNames = new Array();
          for (var i=0; i<items.computers.length; i++) {
            if (items.computers[i]!=name) newComputerNames.push(items.computers[i]);
          }
          items.computers=newComputerNames;
          chrome.storage.sync.set(items);
          setTimeout(showConfig,100);          
        });
        
     };
     newNode.innerHTML=elems[i];
     newNode.href="#";
     $("content").insertBefore(newNode,marker)
     $("content").insertBefore(document.createElement("BR"),marker)     
    }
  }
  
}

function send() {
	var targetComputer = $("selector").value;
	$("content").innerHTML="&nbsp;&nbsp;&nbsp;Sending....&nbsp;&nbsp;&nbsp;";
	setTimeout(function() {
		var req = {};
		req.cmd="req";
		req.computerName=targetComputer;
		chrome.storage.sync.get(function(items) {
		   var urls=items[targetComputer];
		   if (!urls) {         
		      urls = new Array();
			    items[targetComputer]=urls;
		   }
		   chrome.tabs.getSelected(null, function(tab) {
		      urls.push(tab.url);
          chrome.storage.sync.set(items);
          $("content").innerHTML="&nbsp;&nbsp;&nbsp;Sent :-)&nbsp;&nbsp;&nbsp;";
		   });		   
		});
	},0);
}

function init() {
	var computerName = localStorage.computerName;	
	
	var zam = "Send to:<select id=\"selector\"><option value=\"\"></option>";

	var s = localStorage.listOfComputers;  
	if (s) {
		var elems = s.split(",");	
		elems.sort();
		for (var i=0; i<elems.length; i++) {
			if (elems[i]!="" && elems[i]!=null) {
				zam+=("<option value='"+elems[i]+"'>"+elems[i]+"</option>");
			}
		}
	}
	zam+="</select>";
	$("sendTo").innerHTML=zam;	
	var opened=localStorage.opened;
	$("selector").onchange=send;
	var openedArray = new Array();
	if (opened) {
		openedArray = opened.split("\n");
	}
	var zaw = "";
  var marker = $("marker");
  var openedMap = new Object();
	for (var i=0; i<openedArray.length; i++) {
     var urlToOpen = openedArray[i];
     if (openedMap[urlToOpen]) continue;
     openedMap[urlToOpen]=true;
	   var toDisplay = openedArray[i];
	   if (toDisplay.indexOf("://")!=-1) {
		   toDisplay=toDisplay.substring(toDisplay.indexOf("://")+3);
	   }
	   if (toDisplay.length>30) toDisplay=toDisplay.substring(0,14)+"...."+toDisplay.substring(toDisplay.length-15).trim().replace("\n"," ").replace("\t"," ");     
     var newNode = document.createElement("A");
     newNode.onclick=function(event) {
        var element = event.srcElement.parentNode;
        chrome.tabs.create({url:element.href2});
     };
     newNode.innerHTML="<font size=\"-1\">"+toDisplay+"</font>";
     newNode.href="#";
     newNode.href2=urlToOpen;
     $("lastOpened").insertBefore(newNode,marker)
     $("lastOpened").insertBefore(document.createElement("BR"),marker)
	}  
}

try {
	init();
  $("manageButton").onclick=showConfig;
} catch (e) {
   console.log(e);
}