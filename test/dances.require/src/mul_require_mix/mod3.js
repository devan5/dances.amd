(function(){
	var
		mod
	;

	mod = {
		name: "mod3"
	};


	if(window.define && define.amd){
		define(function(){
			"3";
			return mod;
		});
	}

})();