(function(){
	var
		mod
	;

	mod = {
		name: "mod2"
	};


	if(window.define && define.amd){
		define(function(){
			return mod;
		});
	}

})();