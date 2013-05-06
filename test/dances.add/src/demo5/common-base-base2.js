var bgRecover = (function(){
	var htmlEl = document.documentElement
	;
	return function(){
		htmlEl.style.backgroundColor = "";
	}
})();