(function(){
	var
		mod
	;

	mod = {
		name: "mod1"
	};


	if(window.define && define.amd){
		define(function(){
			"1";
			return mod;
		});
	}

})();