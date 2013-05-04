define(function(require){
	return {
		c1: function(){
			return "created by c1.js";
		},
		
		c2: require("./src/mul_require/c2")
	}
});