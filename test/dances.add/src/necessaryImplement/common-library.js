(function($, undefined){
	$.prototype.getTag = function(){
		var el = this[0];
		return el ? el.tagName.toLocaleLowerCase() : "";
	}
})(window.jQuery);