//var actualCode = ['document.getElementsByClassName("video_thumb").forEach(function(entry) { link = entry.getAttribute("src").replace(".jpg",".wmv"); entry.parentNode.insertAdjacentHTML("afterend", "<a download href=" + link + ">Download</a>");});'].join('\n');

if (document.location.href.indexOf('https://') > -1) {
	document.location.href = document.location.href.replace('https','http');
}

var readyInterval = setInterval(function() {
	if (document.readyState === "complete" || document.readyState === "interactive") {
		clearInterval(readyInterval);
		init_extension();
	}
}, 100);

var init_extension = function() {
	//check HTTP / HTTPS
	if (document.location.href.indexOf('https://') > -1) {
		document.location.href = document.location.href.replace('https','http');
	}
	
	//CSS
	var style = document.createElement('style');
	style.textContent = extensionCSS;
	(document.head||document.documentElement).appendChild(style);
	
	//JS
	
	//Video Page
	var videoScript = document.querySelector('#video_holder script');
	
	if (videoScript) {
		var btn = document.createElement('button');
		btn.className = 'getLinkBtn';
		btn.innerHTML = 'Get Video Link';
		btn.onclick = function() { window.prompt('Copy to clipboard: Ctrl+C, Enter', videoScript.innerHTML.match(/http.*mp4\/playlist.m3u8/i) );  };
		document.querySelector('#video_holder_footerInner').appendChild(btn);

		var infoToolTip = createInfoToolBox();
		
		document.querySelector('#video_holder_footerInner').appendChild(infoToolTip);
	}

	//Select Video Page
	var items = document.querySelectorAll('.video_item a');
	
	if (items && items.length > 0) { 
		initVideoSelection(items);
	};

	
}

var initVideoSelection = function(items) {
	var call;
	for(i = 0; i < items.length; i++) {
		call = ajaxCreate(items[i]);
		call();
	}; 
	
	addLastCourseBtn()
}

var addLastCourseBtn = function () {
	var categorySelect = document.getElementById('dep_id');
	if (categorySelect) {
		var categorySaveFunction = function(onchangeFunction) { return function() { if (typeof onchangeFunction == 'function') onchangeFunction(); localStorage.setItem('TauVideoLastCategory', categorySelect.value); }};
		categorySelect.onchange = categorySaveFunction(categorySelect.onchange);
	}

	var courseSelect = document.getElementById('course_id');
	if (categorySelect) {
		var courseSaveFunction = function(onchangeFunction) { return function() { if (typeof onchangeFunction == 'function') onchangeFunction(); localStorage.setItem('TauVideoLastCourse', courseSelect.value); }};
		courseSelect.onchange = courseSaveFunction(courseSelect.onchange);
	}
	var searchForm = document.getElementById('adminForm');
	if (categorySelect && localStorage.getItem('TauVideoLastCategory') && courseSelect && localStorage.getItem('TauVideoLastCourse') && searchForm) {
		var btn = document.createElement('button');
		
		btn.type = 'button'; btn.style = 'margin:0px 3px; float:left;';	btn.innerHTML = 'last course';
		btn.onclick = function() { 
			categorySelect.value = localStorage.getItem('TauVideoLastCategory'); 
			
			var courseId = document.createElement('input');
			courseSelect.disabled = true;
			
			courseId.name = courseSelect.name;
			courseId.value = localStorage.getItem('TauVideoLastCourse');
			courseId.type = 'hidden';
			courseSelect.insertAdjacentElement('beforebegin',courseId);
			
			searchForm.submit();
		};
		
		document.getElementById('mycourses').appendChild(btn);
	}
}

var ajaxCreate = function(item) { 
	return function() { 
		var ajaxCall = new XMLHttpRequest(); 
		ajaxCall.onreadystatechange = function () {
			if (ajaxCall.readyState == 4) {
				if (ajaxCall.status == 200) {
					var input = createVideInputField(ajaxCall.responseText.match(/http.*mp4\/playlist.m3u8/i));
					var btn = createCopyButton(input);
					var infoToolTip = createInfoToolBox();
					var copyMessageDiv = createCopyMessageDiv();
					
					item.nextElementSibling.appendChild(btn);
					item.nextElementSibling.appendChild(infoToolTip);
					item.nextElementSibling.appendChild(copyMessageDiv);
					item.nextElementSibling.appendChild(input);
				}
				else {
					
					var div = document.createElement('div');
					div.className = "fail"
					div.innerHTML = "Failed to get video link...<br>"
					div.dir = "LTR";
					item.nextElementSibling.appendChild(div);
					
					var btn = document.createElement('button');
					btn.innerHTML = "Retry";
					btn.style.padding = "3px";
					btn.onclick = function() {
						ajaxCreate(item)(); 
						this.parentElement.remove();
					};
					div.appendChild(btn);
				}
			}
		};
		
		ajaxCall.open('GET', item.getAttribute('href'), true);
		ajaxCall.send();
	};
};

var createCopyButton = function (inputElement) {
	var btn = document.createElement('button');
	btn.className = 'getLinkBtn';
	btn.innerHTML = 'Copy Video Link';
	btn.onclick = function() { 
		var copyMessages = document.getElementsByClassName('copyMessage');
		for (i = 0; i < copyMessages.length; i++) { copyMessages[i].style.visibility = 'hidden';}
		
		if (document.getElementById('lastSeenVideo')) { document.getElementById('lastSeenVideo').id = '' };
		this.parentNode.parentNode.id = 'lastSeenVideo';
	
		this.parentNode.getElementsByClassName('copyMessage')[0].style.visibility = 'visible';	
		inputElement.select(); document.execCommand('copy');
	};
	return btn;
}

var createVideInputField = function(inputValue) {
	var input = document.createElement('input');
	input.className = 'videoInputLink';
	input.type = 'text';
	input.value = inputValue;
	return input;
}

var createInfoToolBox = function() {
	var infoDiv = document.createElement('div');
	infoDiv.dir = 'LTR';
	infoDiv.innerHTML = "this link is NOT for direct download<br>you can use this link to view the video via other media players<br>for e.g. - VLC<br>on VLC - choose 'Media' -> 'Network'<br> and insert the link there<br><br>Note: you can also download the video [Media --> Convert/Save]"; 
	
	var img = document.createElement('div');
	img.className = 'linkInfo';
	img.appendChild(infoDiv);
	return img;
}

var createCopyMessageDiv = function() {
	var copyMessage = document.createElement('div'); 
	copyMessage.className = 'copyMessage'; 
	copyMessage.innerHTML = 'Copied to clipboard successfully';
	return copyMessage;
}



var extensionCSS = "" +
".getLinkBtn {" +
"	vertical-align:top;"+
"}" +

".linkInfo {" +
"	display: inline-block;" +
"	width: 20px;" +
"	height: 20px;" +
"	padding: 0px 5px;" +
"	position: relative;" +
"	background: url(data:image/png;base64,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) no-repeat;" +
"	background-size: contain;" +
"}" +

".linkInfo div {" +
"	display: none;" +
"	position: absolute;" +
"	width: 380px;" +
"   text-align: left;" +
"   background-color: lemonchiffon;" +
"   border: 1px solid #ccc;" +
"   padding: 5px;" +
"	top: 14px;" +
"   right: 24px;" +
"}" +

".linkInfo:hover div {" +
"	display:block;" +
"}" +

".videoInputLink { vertical-align: top; padding: 2px 4px; width: 600px; margin-top: 5px; text-align: left; display: block; }" + 

".video_details {" +
"	height: inherit; padding-bottom: 15px; min-height: 130px; min-height:145px;" +	
"}" +

"#lastSeenVideo { background-color: #bcbcbc; position: relative; }" +
"#lastSeenVideo::before { content: 'Last Viewed Video*'; padding: 5px; font-size:11px; position: absolute; left: 0; padding: 5px; width: 120px;}" +

".copyMessage { text-align: left; width: 190px; border: 1px solid #ccc; padding: 2px 5px; margin-right: 410px; margin-top: -22px; background-color: #9ACC13; visibility: hidden; }"; 
