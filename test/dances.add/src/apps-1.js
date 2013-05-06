MX.alertCurrentColor = (function(){
	var htmlEl = document.documentElement
	;
	return function(){
		alert(htmlEl.style.backgroundColor || "default");
	}
})();