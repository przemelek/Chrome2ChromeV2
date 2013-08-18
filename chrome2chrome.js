function $(id) { return document.getElementById(id); }

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
} catch (e) {
   console.log(e);
}