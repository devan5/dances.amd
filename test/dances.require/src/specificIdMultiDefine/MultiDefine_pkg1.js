define("person", function(){
	return {
		read: function(book){
			return "read this " + book;
		}
	}
});

define("feder", function(r, ex, mo){
	mo.exports = {
		build: function(app){
			return "build this " + app;
		}
	}
});

define("designer", function(r, exports){
	exports.design = function(app){
		return "design this " + app;
	};
});