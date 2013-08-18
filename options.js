function $(id) { return document.getElementById(id); }
var computerName = localStorage.computerName;
if (computerName!=null) $("computerName").value=computerName;

function saveComputerName() {
if ($("computerName").value!="") {
  $("errorMsg").innerHTML="";
	setTimeout(function() {
		try {
      var currentComputerName = $("computerName").value;
      chrome.storage.sync.get(function (items) {
        var computersList = items["computers"];
        if (!computersList) {
          computersList = new Array();
          items["computers"]=computersList;
        }
        var computersMap = new Object();
        for (var i=0; i<computersList.length; i++) {
          var computer=computersList[i];
          computersMap[computer]=true;
        }
        if (!computersMap[currentComputerName]) {
          localStorage.computerName=currentComputerName;
          computersList.push(localStorage.computerName);
          chrome.storage.sync.set(items);
          $("content").innerHTML="From now your computer should be visible in other Chrome2Chrome as <b>"+localStorage.computerName+"</b>";
        } else {
          $("errorMsg").innerHTML="Sorry, name "+currentComputerName+" was already used... choose different name";
        }
        
			});
		} catch (e) {
      console.log(e);
			alert(e);
		}
	},0);
}
}
$("saveComputerName").onclick=saveComputerName;
$("computerName").focus();