/**
 * @name dances.log
 * @author
 * @overview
 */
window.$log = (function(){
	var
		$log,
		logRepo = {}
	;

	$log = Boolean;

	if(window.console && window.console.log){
		$log = console.log;

		try{
			$log("_____" + (new Date).toString() + "_____");

		}catch(e){
			$log = null;
		}

		$log || ($log = function(){ console.log.apply(console, arguments); }) && $log("_____" + (new Date).toString() + "_____");

		window.$$log || (window.$$log = function(msg, method){
			method = method || "log";

			logRepo[method] || (logRepo[method] = console[method] ? console[method] : console.log);

			"function" === typeof console[method] ?
				logRepo[method].call(console, msg) :
				logRepo[method](msg)
			;

		});

	}else{
		window.$$log = function(){return Array.prototype.slice.call(arguments, 0).join(", ")};
	}

	return $log;
})();
