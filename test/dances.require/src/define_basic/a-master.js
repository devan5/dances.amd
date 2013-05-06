define(function(require, exports, module){
	var 
		a1,
		a2
	;
	
	a1 = require("./src/define_basic/a1");
	a2 = require("./src/define_basic/a2");

	exports.a1 = a1;
	exports.a2 = a2;
});