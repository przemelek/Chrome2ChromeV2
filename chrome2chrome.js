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
	for (var i=0; i<openedArray.length; i++) {
	   var toDisplay = openedArray[i];
	   if (toDisplay.indexOf("://")!=-1) {
		toDisplay=toDisplay.substring(toDisplay.indexOf("://")+3);
	   }
	   if (toDisplay.length>30) toDisplay=toDisplay.substring(0,14)+"...."+toDisplay.substring(toDisplay.length-15);
	   zaw+="<font size=\"-1\"><a href=\"#\" onclick=\"chrome.tabs.create({url:'"+openedArray[i]+"'})\">"+toDisplay+"</a></font><br />";
	}
	if (zaw.length>0) {
	  zaw="Last open:<br />"+zaw+"<hr width=\"50%\" />";
	}
	$("lastOpened").innerHTML=zaw;
}

try {
	init();
} catch (e) {
   console.log(e);
}