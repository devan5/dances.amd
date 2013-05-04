(function(){
	var
		apps = {}
	;

	apps.reflect = function(msg){
		return msg;
	};

	window.define && define(function(re, ex, inst){
		if("number" !== typeof inst.__TEST_CALL_THE_SAME){
			inst.__TEST_CALL_THE_SAME = 1;
		}else{
			inst.__TEST_CALL_THE_SAME++;
		}

		return apps;
	});

})();