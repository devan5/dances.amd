/*_______
with dances.plugins

	called: eToggle

	version: 1.3

	firstDate: 2012.06.17

	lastDate: 2013.04.11

	require: [
		"jQuery",
		"dances.stab",
		"dances.type"
	],

	effect:[
		+.	通过事件驱动 切换元素的ClassName,
		+.	{effects}
	];

	log:{
		"v1.0": [
			+. 移植自 Ds.jQ.evtToggleClass_v1.1.js,
			+. 依旧使用 .bind() 方法绑定事件
			+. {logs}
		],

		"v1.1": [
			+. 参数名变化
			+. 使用事件委托
			+. 提供委托元素参数
		],

		"v1.2":[
			+. 增加 oneOf 模式的 bClearOn bClearOff 处理
		],

		"v1.3":[
			+.	支持 AMD
			+.	提供jQuery 门槛
		]
	}

~_______*/

/*_______
	syntax:
		dances.eToggle(selectors[, classNameIn][, classNameOut][, opts]);

		selectors:
			字符类型 className

		classNameIn:
		classNameOut:
			指定 事件 className

		opts :
			{
				// className 默认值 "active"
				sClass: "active",

				// addClass,延迟指定时间加入UI队列 默认值 100
				nTimeOn : 100,

				// removeClass,延迟指定时间加入UI队列 默认值 100
				nTimeOff : 100,

				// 延迟显示(默认: true)
				// 鼠标移进再移出 并且 开始状态没有被激活时,清除"开始定时器"函数
				bClearOn     : true,

				// 延迟消失(默认: true)
				// 鼠标移出,后100+毫秒,再移进 并且 激活状态没有消失时,清除"恢复定时器"函数
				bClearOff : true,

				// (可选)接受事件委托的元素,默认为 document
				rootEl : document
			};

_______*/

/*_______
	demo:
		eToggle 支持 4 种事件模型:
			+. 群组唯一同名
			+. 单体同名
			+. 普通 事件
			+. hover 事件

		群组唯一同名:
			// 一组实例, 当其中任一元素触发事件, 其余元素将会被重置, 触发元素为 active 状态
			// 如何触发: 指定 bKeepOne 为 true, 并指定 sEvtOn || sEvtOff 其中一个
			dances.eToggle("selectors",{

				bKeepOne: true,	// 触发条件
				sEvtOn || sEvtOff: "event"
			});

		单体同名
			// 后一个事件触发的是前一个状态的反转
			// 如何触发: 仅指定 sEvtOn 或 sEvtOff 其中一个
			dances.eToggle("selectors",{
				sEvtOn: "event",
				sEvtOff: null
			});
			or
			dances.eToggle("selectors",{
				sEvtOn: null,
				sEvtOff: "event"
			});

		普通 事件
			// 如何触发: 同时指定 sEvtOn sEvtOff
			dances.eToggle("selectors",{
				sEvtOn: "event1",
				sEvtOff: "event2"
			});

		hover事件
			// 特殊的普通事件
			// 如何触发: 仅传一个参数
			dances.eToggle("selectors",{
				sEvtOn: null || "",
				sEvtOff: null || ""
			});
_______*/

// 命名扩展
if ("function" !== typeof window.dances &&  "object" !== typeof window.dances){
	window.dances = {};

	dances.$eval = function(){
		return eval.apply(null, arguments);
	};

	// $log
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

		}

		return $log;
	})();
}

(function(exports, name, undefined){
	"use strict";

	var
		toggle,
		Toggle,

		$ = window.jQuery,

		conf,

		create = Object.create || (function(){

			var Foo = function(){ };

			return function(){

				if(arguments.length > 1){
					throw new Error('Object.create implementation only accepts the first parameter.');
				}

				var proto = arguments[0],
					type = typeof proto
					;

				if(!proto || ("object" !== type && "function" !== type)){
					throw new TypeError('TypeError: ' + proto + ' is not an object or null');
				}

				Foo.prototype = proto;

				return new Foo();
			}
		})(),

		// unCurrying
		uc = function(fn){
			return function(){
				return Function.prototype.call.apply(fn, arguments);
			}
		},

		fToString = Object.prototype.toString,

		// native softy Extend
		slice = uc(Array.prototype.slice),

		bAutoLoadOn = true

	;

	conf = function(conf){
		conf = conf || {};

		"function" === typeof conf.jquery && conf.jquery().jquery && ($ = conf.jquery);

		"boolean" === typeof conf.bAutoInit && (bAutoLoadOn = conf.bAutoInit);

		return  toggle;
	};


	Toggle = {

		init: function(sSelector, opts){

			opts = exports.stab(opts, {
				sClass   : "active",
				sClass2  : "",
				nTimeOn  : 150,
				nTimeOff : 150,
				bClearOn : true,// 鼠标移进再移出 并且 开始状态没有被激活时,清除"开始定时器"函数
				bClearOff: true,// 鼠标移出,后100+毫秒,再移进 并且 激活状态没有消失时,清除"恢复定时器"函数
				sEvtOn   : "",
				sEvtOff  : "",
				sEvtNS   : "eToggle",
				bOneOf   : false        // 唯一同名

				// ltIE:9,
				// onCallBack:,
				// offCallBack:
			});

			this.opts = opts;
			this.sSelector = sSelector;

			this.bOn = false;

			// jQuery 对象
			// 配置 事件委托对象
			switch(exports.type(opts.rootEl)){
				case "element":
					this.$delegateEl = $(opts.rootEl);
					break;

				case "window":
					this.$delegateEl = $(opts.rootEl);
					break;

				case "document":
					this.$delegateEl = $(opts.rootEl);
					break;

				default :
					this.$delegateEl = $(document);
			}

			return this;

		},

		// 装载事件
		load : function(){
			var
				fnOn,
				fnOff,

				eMain,
				eMainSub,

				opts = this.opts,
				oneEvt,

				_this = this
			;

			oneEvt = opts.sEvtOn || opts.sEvtOff;

			path:{
				// bOneOf 群组唯一同名事件
				if (opts.bOneOf && oneEvt){

					eMain = function(){
						// remove 所有选择器的元素
						$(_this.sSelector, opts.rootEl)
							.removeClass(opts.sClass)
							.filter(this).addClass(opts.sClass)
						;
					};

					fnOn = function(){
						if(!this.bOn){
							if($().on){
								this.$delegateEl.on(oneEvt, this.sSelector, eMain);
							}else{
								this.$delegateEl.delegate(this.sSelector, oneEvt, eMain);
							}
							this.bOn = true;
						}
						return this;
					};

					fnOff = function(){
						if(this.bOn){
							if($().off){
								this.$delegateEl.off(oneEvt, this.sSelector, eMain);
							}else{
								this.$delegateEl.undelegate(this.sSelector, oneEvt, eMain);
							}
							this.bOn = false;
						}
						return this;
					};
					break path;
				}

				// 执行常规事件函数
				if(opts.sEvtOff !== opts.sEvtOn && opts.sEvtOn && opts.sEvtOff){

					eMain = function(){
						_this.onAction(this);
					};

					eMainSub = function(){
						_this.offAction(this);
					};

					fnOn = function(){
						if(!this.bOn){
							if($().on){
								this.$delegateEl.on(opts.sEvtOn, this.sSelector, eMain);
								this.$delegateEl.on(opts.sEvtOff, this.sSelector, eMainSub);
							}else{
								this.$delegateEl.delegate(this.sSelector, opts.sEvtOn, eMain);
								this.$delegateEl.delegate(this.sSelector, opts.sEvtOff, eMainSub);
							}
							this.bOn = true;
						}
						return this;
					};

					fnOff = function(){
						if(this.bOn){
							if($().off){
								this.$delegateEl.off(opts.sEvtOn, this.sSelector, eMain);
								this.$delegateEl.off(opts.sEvtOff, this.sSelector, eMainSub);
							}else{
								this.$delegateEl.undelegate(this.sSelector, opts.sEvtOn, eMain);
								this.$delegateEl.undelegate(this.sSelector, opts.sEvtOff, eMainSub);
							}
							this.bOn = false;
						}
						return this;
					};
					break path;
				}

				// 事件相同 或 resume事件为空
				if (oneEvt) {
					// 执行同名事件
					eMain = function(){
						_this.dualEvent(this, opts);
					};

					fnOn = function(){
						if(!this.bOn){
							if($().on){
								this.$delegateEl.on(oneEvt, this.sSelector, eMain);
							}else{
								this.$delegateEl.delegate(this.sSelector, oneEvt, eMain);
							}
							this.bOn = true;
						}
						return this;
					};

					fnOff = function(){
						if(this.bOn){
							if($().off){
								this.$delegateEl.off(oneEvt, this.sSelector, eMain);
							}else{
								this.$delegateEl.undelegate(this.sSelector, oneEvt, eMain);
							}
							this.bOn = false;
						}
						return this;
					};

				} else {
					// 缺省 (hover)事件
					eMain = function(){
						_this.onAction(this)
					};

					eMainSub = function(){
						_this.offAction(this);
					};

					fnOn = function(){
						if(!this.bOn){
							if($().on){
								this.$delegateEl
									.on("mouseenter", this.sSelector, eMain)
									.on("mouseleave", this.sSelector, eMainSub);
							}else{
								this.$delegateEl
									.delegate(this.sSelector, "mouseenter", eMain)
									.delegate(this.sSelector, "mouseleave", eMainSub);
							}
							this.bOn = true;
						}
						return this;
					};

					fnOff = function(){
						if(this.bOn){
							if($().off){
								this.$delegateEl
									.off("mouseenter", this.sSelector, eMain)
									.off("mouseleave", this.sSelector, eMainSub);
							}else{
								this.$delegateEl
									.undelegate(this.sSelector, "mouseenter", eMain)
									.undelegate(this.sSelector, "mouseleave", eMainSub);
							}
							this.bOn = false;
						}
						return this;
					};

				}
			}

			// 覆盖原型方法
			this.load = function(){
				return this;
			};

			this.fnOn = fnOn;
			this.fnOff = fnOff;
			bAutoLoadOn &&  this.on();
			return this;
		},

		on: function(){
			this.fnOn();
			return this;
		},

		off: function(){
			this.fnOff();
			return this;
		},

		// 增加 className 框架函数
		onAction: function(dom){
			var _this = this,
				opts = _this.opts
			;

			// 当 bClearOff 为true
			if(opts.bClearOff){
				clearTimeout(dom.offAction);
				dom.offAction = null;

				// 若已有 sClass 不必执行 onAction 后续代码
				if(dom.hascn){
					return false;
				}
			}

			// 根据 opts.nTimeOn 执行对应函数
			if(opts.nTimeOn > 0){
				dom.onAction = setTimeout(function(){
					_this.inClass(dom);
				},opts.nTimeOn);
			}else{
				_this.inClass(dom);
			}

			return this;
		},

		// 删除 className 框架函数
		offAction: function(dom){
			var _this = this,
				opts = _this.opts
			;

			// 当 bClearOn 为true
			if(opts.bClearOn){
				clearTimeout(dom.onAction);
				dom.onAction = false;

				// 若已无 sClass 不必执行 offAction 后续代码
				if(!dom.hascn){
					return false;
				}
			}

			// opts.nTimeOff 大于0 毫秒
			if (opts.nTimeOff > 0) {
				dom.offAction = setTimeout(function () {
					_this.outClass(dom);

				}, opts.nTimeOff);

			} else {
				_this.outClass(dom);
			}

			return _this;
		},

		// 增加 className 单元函数
		inClass: function(dom){
			var opts = this.opts;

			dom.onAction = null;

			$(dom).addClass(opts.sClass);

			opts.sClass2 && $(dom).removeClass(opts.sClass2);

			dom.hascn = true;

			"function" === typeof opts.onCallBack && opts.onCallBack(dom);
			return this;
		},

		// // 删除 className 单元函数
		outClass: function(dom){
			var opts = this.opts;

			dom.offAction = null;

			$(dom).removeClass(opts.sClass);

			opts.sClass2 && $(dom).addClass(opts.sClass2);

			dom.hascn = false;

			"function" === typeof opts.offCallBack && opts.offCallBack(dom);

			return this;

		},

		// 同名事件
		dualEvent: function(dom){
			if(dom.dualFag){
				this.inClass(dom);
				dom.dualFag = false;

			}else{
				this.outClass(dom);
				dom.dualFag = true;
			}

			return this;
		},

		remove: function(){

			this.off();

			for(var prop in this){
				if(this.hasOwnProperty(prop)){
					delete this[prop];
				}
			}

		}
	};

	toggle = function(sSelector){

		var
			args = slice(arguments),
			opts = args.pop(),
			ver,
			inst
		;

		// ie 关卡
		if("[object Object]" === fToString.call(opts)){
			ver = parseInt(opts && opts.ltIE);
			if(!isNaN(ver) && (!exports.uAgent.msie || exports.uAgent.msie > ver)){
				return "break";
			}
		}

		inst = create(Toggle);

		return inst.init.apply(inst, arguments).load();

	};

	exports && (exports[name || "eToggle"] = toggle);

	toggle.conf = conf;

	if(window.define && "function" === typeof define && define.amd){
		define(function(){
			return toggle;
		});
	}

})(window.dances);