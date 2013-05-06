/*~~~~~~~~
with dances

	called: amd

	version: 2.0

	firstDate: 2013.04.09

	lastDate: 2013.04.09

	require: [
	],

	log: {
		"v2.0": [
			+.	现5大dances之一 dances.amd, dances.add 与 dances.require 合并
			+.	版本号从 2.0 开始, 预防冲突
			+.	{logs}
		]

	}

~~~~~~~~*/

/*_______
	dances.add syntax:

		I:
			dances
				.add(src[, src1][, srcN][, callback])
			;

		II:
			dances
				.add(src, callback)
			;

		III:
			dances
				.add(src)
				.add(callback)
			;

		IV:
			dances
				.add(src)
				.add(callback)
				.add(src2)
				.add(src3)
			;

		V:
			dances
				.add(src)
				.add(src2)
				.add(src3, src4, src)
				.add(callback)
			;

		VI:
			// 有效解决 模板与子页的依赖
			dances
				.add(require1, require2, require3)
				.add(function(){
					// do with code
				})
			;

			dances
				// notice "require3" !
				.add(require3)
				.add(require4)
				.add(require5)
			;

_______*/

/*_______
	dances.require syntax:
		define([id, ][dependencies, ]factory);
			id:
				定义模块名称,
				如果模块名被省略不写,则是一个匿名模块, 模块引用与 它文件路径和文件名有关
				// The AMD loader will give the module an ID based on how it is referenced by other scripts

			dependencies:
				是个定义中模块所依赖模块的数组.
				依赖模块必须根据模块的工厂方法优先级执行, 并且执行的结果应该按照依赖数组中的位置顺序以参数的形式传入（定义中模块的）工厂方法中

				依赖参数是可选的，如果忽略此参数，它应该默认为["require", "exports", "module"]:
					define(function(require, exports, module){
						// factory
					});

				注意: 工厂函数,并没有定义形参, 则不会传入 ["require", "exports", "module"] 作为参数:
					define(function(){
						// factory
						arguments.length === 0;	// true
					});

				然而，如果工厂方法的长度属性小于3，加载器会选择以函数的长度属性指定的参数个数调用工厂方法:
					define(function(require){
						// factory
					});

					define(function(require, exports){
						// factory
					});

			factory:

	demo:
	// 完整_______Start
	define("newModule", [module1, module2, moduleN], function(module1, module2, moduleN){
		// factory
	});

	// 省略 id_______Start
	define([module1, module2, moduleN], function(module1, module2, moduleN){
		// factory
	});

	// 省略 dependencies_______Start
	define("newModule", function([require, ][exports, ][module]){
		// factory
	});


	// rule1: 根据 [依赖数组]的关键字 "require" | "module" | "exports" 传入factory作为 形参
	// rule2: 如果省略[依赖数组], factory 形参以 ["require", "exports", "module"] 为默认, 形参长度以 factory.length 为准

	define(["moduleA", "require"], function(moduleA, require){
		// factory
	});
	define(["moduleA", "require"], function(moduleA, require){
		// factory
	});
	define(["exports"], function(exports){
		// factory
	});

	// 简易 define
	define("newModule",{});

	// 简写
	define(function([require, ][exports, ][module]){
		// factory
	});


_______*/

/*_______
	dances.require syntax:
		require([module1, module2, module3], function(module1, module2, module3){
			// callback
		});

		require.config = {

			// 可选配置 各个模块的加载路径
			path: {
				jQuery1_4: "/lib/jQuery_1.4.4",
				jQuery1_7: "/lib/jQuery_1.7.2",
				MooTools: "/lib/jMooTools_1.4.5"
			}
		};

		require.config = {

			// 改变基目录
			baseUrl: "/lib",

			// 可选配置 各个模块的加载路径
			path: {
				jQuery1_4: "jQuery_1.4.4",
				jQuery1_7: "jQuery_1.7.2",
				MooTools: "jMooTools_1.4.5"
			}
		};


		// demo
		require(["jQuery_1_4", "jQuery_1_7"], function($17, $14){

		});

		require(function(){
			var $17 = require("jQuery_1_4");
			var $14 = require("jQuery_1_4");
		});


_______*/

/*_______
	dances.require syntax:
		//
		require.conf({
			confName: confValue,
			confNameN: confValueN
		});

		// 配置基路径
		require.conf("baseUrl": "");

		// 配置模块路径
		require.conf("paths": {
			moduleName: "moduleSrc"
		});

		// timeout
		require.conf("timeout": millisecond);

		// 垫片
		require.conf("shim": {
			moduleName: {
				deps: [],
				exports: "string" || function(){},
				path: ""
			}
		});

_______*/

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

(function(dances){
	"use strict";

	var
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

		// native softy Extend
		slice = uc(Array.prototype.slice)

	;

	// dances.add
	(function(exprots, name, undefined){

		var
			Add,
			add,
			fnBindReady,

			AddingEngine,
			AddFactory,

			// 缓存 Add 的实例
			addRepo = {},

			// 存放 window 和 cacheJS 关联
			cacheAll = [
				[window, addRepo]
			],

			rootHeadEl,
			rootDoc,
			root = window
		;

		// fnBindReady
		fnBindReady = undefined === document.createElement("script").onload ?
			function(elem, fn){
				var prevFn = "function" === typeof elem.onreadystatechange ? elem.onreadystatechange : false;

				elem.onreadystatechange = function(){
					if("loaded" === elem.readyState || "complete" === elem.readyState){
						if(prevFn){
							prevFn.call(root);

							// gc
							prevFn = null;
						}
						fn.call(root);

						//gc
						elem.onreadystatechange = null;
						elem = fn = null;
					}
				};
			} :

			function(elem, fn){
				var prevFn = "function" === typeof elem.onload ? elem.onload : false;
				elem.onload = function(){
					if(prevFn){
						prevFn.call(root);

						//gc
						prevFn = null;
					}
					fn.call(root);

					// gc
					elem.onload = null;
					elem = fn = null;
				};
			}
		;

		// step 1: 由 src 寻找 cacheJs 实例, 若无则进入 step 2
		// step 2: 根据 src 创建新实例
		AddFactory = (function(){
			var
				regSuffix = /\.([^\/\\\.]+)$/,
				fAppend,
				headEl = document.getElementsByTagName("head")[0],
				oAss
				;

			oAss = {
				css: {
					tagName: "link",
					srcProp: "href",
					attr   : [
						["type", "text/css"],
						["rel", "stylesheet"]
					]
				},
				js : {
					tagName: "script",
					srcProp: "src",
					attr   : [
						["type", "text/javascript"]
					]
				}
			};

			fAppend = function(){
				this.El.setAttribute(this.srcProp, this.src);
				(rootHeadEl || headEl).appendChild(this.El);
				this.isAppend = true;
			};

			return function(src){
				var
					inst,
					el,
					fileType,
					factors,
					_src,

					base,
					len,
					item
					;

				if(!addRepo.hasOwnProperty(src)){

					_src = src;
					fileType = regSuffix.exec(src);
					fileType = fileType && fileType[1].toLowerCase();
					if(!fileType || !oAss.hasOwnProperty(fileType)){
						fileType = "js";
						_src += ".js"
					}

					factors = oAss[fileType];

					el = (rootDoc || document).createElement(factors.tagName);

					base = factors.attr;
					len = base.length;
					while(len--){
						item = base[len];
						el.setAttribute(item[0], item[1]);
					}

					inst = {
						El  : el,
						type: fileType,

						srcProp: factors.srcProp,
						src    : _src,

						isAppend: false,
						isReady : false,

						append: fAppend
					};

					//		inst.El.async = true;
					//		inst.El.setAttribute("async", true);
					/*
					 不能在 创建新实例中 为script添加 src
					 会造成 ie8 及更早版本 readyState 为 loaded
					 因为 它们想预先加载的原因吗
					 */
					//		inst.El.setAttribute("src", src);
					addRepo[src] = inst;

				}else{
					inst = addRepo[src];
				}

				// gc
				el = null;

				return inst;
			}

		})();

		// src 和 callback 皆为 prevInst 的回调
		// callback 先于 src 执行
		AddingEngine = function(prevInst, src, callback){
			var
				nextInst
				;

			if(!prevInst) throw "AddingEngine expect correct ADD instance.";

			src && (nextInst = AddFactory(src));

			// switch 1: prevInst 已经装载完成
			// 无法挽回
			if(prevInst.isReady){
				"function" === typeof callback && callback.call(root, prevInst);

				if(nextInst && !nextInst.isAppend){

					fnBindReady(nextInst.El, function(){
						nextInst.isReady = true;

						prevInst =
						nextInst = null
						;
					});

					nextInst.append();
				}

				// switch 2: prevInst 并没有添加至文档
			}else if(!prevInst.isAppend){

				// 清除定时器
				prevInst.time && clearTimeout(prevInst.time) && (prevInst.time = null);

				if(nextInst && !nextInst.isAppend){
					fnBindReady(nextInst.El, function(){
						nextInst.isReady = true;

						nextInst = null;
					});
				}

				fnBindReady(prevInst.El, function(){
					prevInst.isReady = true;

					"function" === typeof callback && callback.call(root, prevInst);

					if(nextInst && !nextInst.isAppend){
						nextInst.append();
					}

					prevInst =
					callback = null
					;
				});

				nextInst || (nextInst = prevInst);

				// 每个实例 保留一份初始化 的实例
				if(prevInst.iInst){
					nextInst.iInst = prevInst.iInst;

				}else{
					prevInst.iInst = true;
					nextInst.iInst = prevInst;
				}

				// handle initialINST
				nextInst.time = setTimeout(function(){
					var
						inst = nextInst.iInst
						;

					if(nextInst && !nextInst.isAppend){
						inst.append();
					}

					inst = null;

				}, 0);

				//  prevInst 添加至文档 但仍没有加载完毕
				// 时机要掌握~~
			}else{

				if(nextInst && !nextInst.isAppend){

					fnBindReady(nextInst.El, function(){
						nextInst.isReady = true;

						nextInst = null;
					});

					fnBindReady(prevInst.El, function(){
						"function" === typeof callback && callback.call(root, prevInst);

						prevInst.isReady = true;
						nextInst.append();

						prevInst =
						callback = null
						;
					});
				}

			}

			return nextInst || prevInst;
		};

		Add = {
			add: function(){
				var
					_this = this
					;

				this.time && clearTimeout(this.time);

				this.stack = this.stack.concat(slice(arguments, 0));

				this.time = setTimeout(function(){
					_this.handleArgs();
				}, 0);

				return this;
			},

			handleArgs: function(){
				var
					stack,

					inst,

					src,
					fn,

					sType,
					len,
					i,
					next
					;

				stack = this.stack;

				// step 1: 嗅探第一位 url ,并初始化
				while(!src){
					inst = undefined;
					src = stack.shift();

					sType = typeof src;

					if("string" === sType){
						inst = AddFactory(src);

					}else if("function" === sType){
						src.call(root);
						src = null;

					}else{
						src = null;
					}

					if(!inst && 0 === stack.length){
						return this;
					}
				}

				len = stack.length;

				// step 2: 检测 首位实例 是否单身 - -!!
				inst && len < 1 && AddingEngine(inst);

				// step 3: 遍历绑定
				for(i = 0; i < len; i++){

					fn = undefined;
					src = stack[i];

					sType = typeof src;

					if("string" === sType){

					}else if("function" === sType){
						fn = src;
						src = undefined;

						next = stack[i + 1];

						if("string" === typeof next){
							src = next;
							i++;
						}

					}else{
						continue;
					}

					inst = AddingEngine(inst, src, fn);
				}

				this.stack = [];

				return this;
			}
		};

		add = function(){
			var
				bridge
				;

			bridge = create(Add);
			bridge.stack = slice(arguments, 0);
			bridge.stack.length && bridge.add();

			return bridge;
		};

		add.mark = function(src, elem){
			var markJs;

			// 如果已经被缓存 什么也不做
			if(addRepo.hasOwnProperty(src)){
				markJs = addRepo[src];

			}else{
				markJs = {
					src     : src,
					isAppend: true,
					isReady : true
				};

				addRepo[src] = markJs;

				// 根据 src 视图寻找 scriptElem
				if(!elem || 1 !== elem.nodeType){
					(function(src){
						var
							jsEls = document.getElementsByTagName("script"),
							len = jsEls.length,
							item,

							itemSRC,
							regSRC = new RegExp(src + "(\\.js)?$")
							;

						while(len--){

							item = jsEls[len];

							if(!item) continue;

							itemSRC = item.getAttribute("src");
							if(regSRC.test(itemSRC)){
								elem = item;
								break;
							}
						}

						// gc
						regSRC =
						item = null
						;

					})(src);
				}

				markJs.elem = (elem && 1 === elem.nodeType ? elem : "");
			}

			return markJs;
		};

		add.__view = function(){
			return addRepo;
		};

		add.switchWindow = function(w){
			var
				len,
				item,
				bCached
				;

			if(w !== window && top === w.top){

				len = cacheAll.length;
				while(len--){
					item = cacheAll[len];
					if(w === item[0]){
						addRepo = item[1];
						bCached = true;
						break;
					}
				}

				if(!bCached){
					addRepo = {};
					cacheAll.push([w, addRepo]);
				}

				root = w;
				rootDoc = root.document;
				rootHeadEl = rootDoc.getElementsByTagName("head")[0];
			}

			return this;
		};

		exprots[name || "add"] = add;

		add.version = "2.0";

	})(dances);

	// dances.require
	(function(exports, name, undefined){

		var
			define,
			require,
			Require,

			requireCount = 0,
			arrDefine = [],
			getExistExports,

			requireRepo = dances.add.__view(),

			oREG,

			confVar,
			conf,
			confV,

			id2path,

			trim = String.prototype.trim ?
				uc(String.prototype.trim) :
				function(msg){
					return msg.replace(/^\s*|\s*$/, "");
				}
			,

			forEach = "function" === typeof Array.forEach ?
				Array.forEach :
				function(arr, fn){
					var len,
						i,
						fHas
					;

					fHas = Object.prototype.hasOwnProperty;

					for(i = 0, len = arr.length; i < len; i++){
						fHas.call(arr, i) && fn(arr[i], i, arr);
					}

				}

		;

		oREG = {
			requireAtom  : /^function\s*\(\s*([$\d\w]+)/i,
			commentBlock : /\/\*[\s\S]+\*\//gm,
			commentSingle: /\/\/.+/g,
			factoryParam : /dances\.key\.(exports|module)\$\$/
		};

		window.arrDefine = arrDefine;

		id2path = function(id){

			// step 1: 嗅探是否有假名(模块id), 假名对应路径
			id = confVar.paths[id] || id;

			// step 2: 是否触发 baseUrl 开关
			id = /\.js$/.test(id) || /^\//.test(id) || /(http|https|ftp):/.test(id) ?
				id :
				confVar.baseUrl + id
			;

			return id;
		};

		getExistExports = function(id){
			var url;

			url = id2path(id);

			// requireRepo 只储存[路径]作为键名
			if(requireRepo.hasOwnProperty(url)){
				return requireRepo[url].exports;

			}else{
				throw "require doesn't load [" + id + "] module;";
			}
		};

		Require = {

			init: function(reqChain){
				var
					args = slice(reqChain, 0),

					callback
				;

				callback = args.pop();

				// do nothings
				if("function" !== typeof callback){
					throw "require() expect a function at least";
				}

				this.requireExports = [];
				this.requireCallback = callback;

				this.dependencies = args.pop();
				if("[object Array]" !== Object.prototype.toString.call(this.dependencies)){
					this.dependencies = [];
				}

				this.add = dances.add();

				this.require();

				return this;
			},

			require: function(){
				var
					id,
					url,
					dep = this.dependencies,
					self = this
				;

				if(dep.length){
					id = dep.shift();

					requireCount++;
					this.requireAtom(trim(id), function(inst){
						requireCount--;

						if(arrDefine.length){
							arrDefine.shift()(self, inst);

						}else if((url = id2path(id)) && "function" === typeof requireRepo[url].callAgain){
							requireRepo[url].callAgain(self);

						}else{
							throw "The [" + id + "] is not support AMD, use require.shim to shim it.";
						}
					});

				}else{
					this.requireCallback.apply(null, this.requireExports);

					// gc
					delete this.add;
					delete this.requireCallback;

					this.requireExports.length = 0;
					delete this.requireExports;

					this.dependencies.length = 0;
					delete this.dependencies;
				}

				return this;
			},

			// 封装 dances.add
			// 如果已经被加载后, 同步得到 模块exports
			requireAtom: function(id, callback){
				var
					_id = id.toLowerCase(),
					url,

					__time,

					instShim,
					fShim
				;

				// switch 1: 寻找关键字
				switch(_id){
					case "require":
							this.requireExports.push(getExistExports);
							this.require();
						break;

					case "module":
					case "exports":
							this.requireExports.push("dances.key." + _id + "$$");
							this.require();
						break;

					default :

						/*
						>
							if a module ID has one of the following characterstics,
							the ID will not be passed through the "baseUrl + paths" configuration,
							and just be treated like a regular URL that is relative to the document:

								Ends in ".js".
								Starts with a "/".
								Contains an URL protocol, like "http:" or "https:".

						*/

						url = id2path(id);

						// switch 2: 寻找是否已经加载
						if(requireRepo.hasOwnProperty(url)){
							this.requireExports.push(requireRepo[url].exports);

							// 继续 require 依赖队列
							this.require();

						}else{

							// switch 3: 调用 dances.add() 加载

							// 超时管理
							if(confVar.timeout){
								__time = setTimeout(function(){
									$$log("load [" + url + "] has failed", "error");
								}, confVar.timeout);
							}

							// shim
							(instShim = confVar.shim[id]) && (fShim = function(){
								define(instShim.deps || [], function(){
									return dances.$eval(instShim.exports);
								});
							});

							this.add.add(url, function(inst){

								__time && clearTimeout(__time);

								fShim && fShim();

								callback(inst);

								instShim = null;
							});
						}
				}
				return this;
			},

			loadExports: function(_factory, _factoryArgs){
				var
					module = this.transferModule,
					exports,
					aParam,

					linkKey
				;

				// step 1: 执行工厂函数
				exports = module.exports = {};

				if(_factoryArgs && _factoryArgs.length){
					_factoryArgs = slice(_factoryArgs, 0);

					linkKey = {
						module : module,
						exports: exports
					};

					forEach(_factoryArgs, function(v, i){
						var
							item
						;

						if(item = oREG.factoryParam.exec(v)){
							_factoryArgs.splice(i, 1, linkKey[item[1]]);
						}

					});
				}

				aParam = _factoryArgs || [getExistExports, exports, module];
				aParam.length = _factory.length;

				exports = _factory.apply(this, aParam) || module.exports;
				module.exports = exports;

				module._factoryArgs = aParam;

				// step 2:
				this.requireExports.push(exports);

				// step 3: 继续 require 依赖队列
				this.require();

				return this;
			}

		};

		define = function(/*[id, ][dependencies, ]factory*/){
			var
				args = slice(arguments, 0),

				id,
				dependencies,
				_factoryParam,
				_factory,

				factoryPlain,
				regRequire,

				requireInner
			;

			if(requireCount === arrDefine.length){
				return ;
			}

			// do nothings
			if(0 === args.length) {throw "define() expect a function/object as factory at least";}

			// step 1.1: 找到工厂方法
			_factory = args.pop();
			if("function" === typeof _factory){

				// step 2.1: 过滤出 id dependencies
				if(args.length){

					dependencies = args.pop();

					if("string" === typeof dependencies){
						id = dependencies;
						dependencies = undefined;

					}else if("[object Array]" !== Object.prototype.toString.call(dependencies)){
						dependencies = undefined;

					}else{
						_factoryParam = true;
						id = "string" === typeof (id = args.pop()) ? id : undefined;
					}
				}

				// step 3.1: 寻找 define工厂方法中的依赖
				if(!dependencies && _factory.length){
					dependencies = [];

					factoryPlain = _factory.toString();

					regRequire = oREG.requireAtom.exec(factoryPlain)[1];

					regRequire = regRequire.replace("$", "\\$");

					regRequire = new RegExp(regRequire + "\\s*\\(\\s*([\"\'])([^\\s\'\"]+)\\1\\s*\\)", "g");

					// 清除注释
					factoryPlain = factoryPlain.replace(oREG.commentSingle, "").replace(oREG.commentBlock, "");

					// detect require in define scope
					while(requireInner = regRequire.exec(factoryPlain)){
						dependencies.push(requireInner[2]);
					}
				}

			}else{

				// step 2.2: 组装简易 exports
				_factory = (function(exprots){
					return function(){
						return exprots;
					}
				})(_factory);

				id = "string" === typeof (id = args.pop()) ? id : undefined;

			}

			arrDefine.push(function(instRequire, instAdd){
				var
					_dependencies
				;

				if(dependencies && dependencies.length){
					_dependencies = [];
					forEach(dependencies, function(item){
						_dependencies.push(item);
					});
				}

				// handle mock id
				id && confV.paths(id, instAdd.src);

				// 保留激活链
				instAdd.callAgain = function(instRequire, deps){
					// 拷贝依赖
					if(!deps && _dependencies && _dependencies.length){
						deps = [];
						forEach(_dependencies, function(item){
							deps.push(item);
						});
					}

					instRequire.transferModule = instAdd;
					instRequire.transferModule.__define = _factory;

					if(deps && deps.length){

						// 开启 define中 dependence 队列
						require(deps, function(){
							instRequire.loadExports(_factory, _factoryParam && arguments);
						});

					}else{
						instRequire.loadExports(_factory, "");
					}
				};

				instAdd.callAgain(instRequire, dependencies);

			});

		};

		require = function(/*[id ,][dependence ,]callback*/){
			var
				v5 = arguments[arguments.length - 1],
				sType = typeof  v5
			;

			if("function" === sType){
				if(arguments.length > 1){
					create(Require).init(arguments);

				}else{
					v5();
				}

			}else if("string" === sType && 1 === arguments.length){
				dances.add(v5);
			}
		};

		confVar= {
			baseUrl: "",

			paths: {},

			timeout: 0,

			shim: {
				demo5: {
					deps   : [],
					exports: "_5"
				}
			}
		};

		confV = {
			baseUrl: function(url){
				confVar.baseUrl = url;

				return this;
			},

			// path 就有可能受到 baseUrl 影响
			// 但是有3点 可回避 baseUrl 影响
			paths: function(){
				var
					args = slice(arguments, 0),
					k = args.shift()
				;

				if("string" === typeof k){
					confVar.paths[k] = args.shift();

				}else if("[object Object]" === Object.prototype.toString.call(k)){
					for(var prop in k){
						if(k.hasOwnProperty(prop)){
							confVar.paths[prop] = k[prop];
						}
					}
				}

				return this;
			},

			timeout: function(time){
				time = parseInt(time);
				time = time > 0 ?
					time :
					0
				;

				confVar.timeout = time;

				return this;
			},

			shim: function(data){
				var
					item
				;

				if("[object Object]" === Object.prototype.toString.call(data)){
					for(var prop in data){
						if(data.hasOwnProperty(prop)){
							item = data[prop];
							item.path && confV.paths(prop, item.path);

							confVar.shim[prop] = {
								deps   : item.deps || [],
								exports: item.exports || ""
							}
						}
					}
				}

				return this;
			}

		};

		conf = function(){
			var
				args = slice(arguments, 0),
				k = args.shift()
			;

			if("string" === typeof k){
				confV.hasOwnProperty(k) && confV[k](args.shift());

			}else if("[object Object]" === Object.prototype.toString.call(k)){

				for(var prop in k){
					if(k.hasOwnProperty(prop)){
						confV.hasOwnProperty(prop) && confV[prop](k[prop]);
					}
				}
			}

			return this;
		};

		// noConflict
		require.noConflict = (function(){
			var
				$require = window.require,
				$define = window.define,
				_require = exports.require,
				_define = exports.define
			;

			return function(bGiveUp){
				window.require = $require;
				window.define = $define;

				if(true === bGiveUp){
					exports.require = _require;
					exports.define = _define;
				}
			}
		})();


		require.conf = conf;
		define.amd = {};

		window.require =
			exports.require =
				require
		;

		window.define =
			exports.define =
				define
		;

		require.version = define.version = "2.0";

		// boot js
		(function(){
			var
				jsEl,
				src
			;

			jsEl = document.getElementsByTagName("script");
			jsEl = jsEl[jsEl.length - 1];
			src = jsEl.getAttribute("data-require-boot");

			if(src){
				jsEl = document.createElement("script");
				jsEl.setAttribute("type", "text/javascript");
				jsEl.src = src;
				document.getElementsByTagName("head")[0].appendChild(jsEl);
			}

		})();

	})(dances);

})(window.dances);
