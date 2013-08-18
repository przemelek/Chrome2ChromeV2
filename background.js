var currentComputerName = "";

try {
    if (localStorage.computerName==null) {
		chrome.tabs.create({url:"options.html"});
	}
} catch (e) {
    console.log(e);
}


chrome.storage.onChanged.addListener(function (changes, namespace) {
  currentComputerName = localStorage.computerName;
  for (key in changes) {
    var storageChange = changes[key];
    if (namespace=="sync") {
	  var newValue = storageChange.newValue;
    if (key==currentComputerName) {
		  if (newValue!=null) {
                for (var i=0; i<newValue.length; i++) {
                  chrome.tabs.create({url:newValue[i]});
                }
                chrome.storage.sync.get(function(items) {
                   items[currentComputerName]=null;
                   chrome.storage.sync.set(items);
                });
		  }
    } else if (key=="computers") {
	     var s = "";
		   for (var i=0; i<newValue.length; i++) {
		     s+=newValue[i]+",";
		   }
		   localStorage.listOfComputers=s;		
	  }
   }
  }
});