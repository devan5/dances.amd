NS = {};

NS.methodA = function(str){
	return "NS.methodA invoked." + (str ? " " + str : "");
};

(function(){
	if('function' !== typeof $.prototype.getTag){
		throw "expect  common-library.js implement jQuery.fn";
	}
})();
