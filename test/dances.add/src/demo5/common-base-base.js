var bg2Change = (function(){
	var htmlEl = document.documentElement
	;
	return function(data){
		htmlEl.style.backgroundColor = data || "black";

	};
})();
