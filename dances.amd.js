/*~~~~~~~~
with dances

	called: amd

	version: 2.2_dev

	firstDate: 2013.04.09

	lastDate: 2013.07.03

	require: [
	],

	log: {
		"v2.0": [
			+ 实现五大 dances.core 之一 dances.amd, dances.add 与 dances.require 合并
			+ 版本号从 2.0 开始, 预防冲突
		],

		"v2.1": [
			+ dances.add() 增加一个实现, 若 .add 最后一个参数为 布尔值true, 则会省去倒数, 直接运行.
			+ 解决 mul 调用 factory 被调用多次.
			+ 重写 帮助文档
			+ 重写 unit TEST 防止互相干扰
			+ 测试 不符合 ADM 规范: "显示地 抛出错误"
		],

		"v2.2": [
			+ 增加 Multi specific DefineId
			+ // TODO 使用 Model_create_init 模式重写 工厂结构
			+ // TODO 路径自动化
			+ TODO require/seajs 跑测试单元
		]

	}

~~~~~~~~*/

"use strict";

if("function" !== typeof window.dances && "object" !== typeof window.dances){
	window.dances = {};
}

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

	}else{
		window.$$log = function(){return Array.prototype.slice.call(arguments, 0).join(", ")};
	}

	return $log;
})();

(function(dances){

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
		slice = uc(Array.prototype.slice),

		toString = uc(Object.prototype.toString)

	;


	var
		_hub = {}
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
			root = window,

			oR
		;

		oR= {
			hasExt: /\.[^\.]+$/
		};

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
				rMatchExt = /\.([^\/\\\.]+)$/,
				fAppend,
				headEl = document.getElementsByTagName("head")[0],
				oAss
			;

			oAss = {
				css: {
					tagName: "link",
					srcPropName: "href",
					attr   : [
						["type", "text/css"],
						["rel", "stylesheet"]
					]
				},
				js : {
					tagName: "script",
					srcPropName: "src",
					attr   : [
						["type", "text/javascript"]
					]
				}
			};

			// 开始加载 script
			fAppend = function(){
				this.El.setAttribute(this.srcPropName, this.src);
				(rootHeadEl || headEl).appendChild(this.El);
				this.isAppend = true;
			};

			return function(src){
				var
					inst,
					domEl,
					sExt,
					oFactors,
					intactSRC,

					base,
					len,
					item
				;

				if(!addRepo.hasOwnProperty(src)){

					intactSRC = src;
					// 匹配 src 后缀
					sExt = rMatchExt.exec(src);
					sExt = sExt && sExt[1].toLowerCase();
					if(!sExt || !oAss.hasOwnProperty(sExt)){
						sExt = "js";
						intactSRC += ".js"
					}

					oFactors = oAss[sExt];

					domEl = (rootDoc || document).createElement(oFactors.tagName);

					base = oFactors.attr;
					len = base.length;
					while(len--){
						item = base[len];
						domEl.setAttribute(item[0], item[1]);
					}

					// arrDefine => fWait2Call: 第二形参 就是它!
					inst = {
						El         : domEl,
						type       : sExt,

						srcPropName: oFactors.srcPropName,
						src        : intactSRC,

						isAppend   : false,
						isReady    : false,

						append     : fAppend
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
				domEl = null;

				return inst;
			}

		})();

		// 关联 文件 加载逻辑
		// src 和 callback 皆为 prevInst 的回调
		// callback 先于 src 执行
		// 优先返回 nextInst
		AddingEngine = function(prevInst, src, callback){
			var
				nextInst
			;

			if(!prevInst){
				throw "AddingEngine expect correct ADD instance."
			}

			src && (nextInst = AddFactory(src));

			// switch 1: prevInst 已经装载完成
			// 无法挽回
			if(prevInst.isReady){
				"function" === typeof callback && callback.call(root, prevInst);

				if(nextInst && !nextInst.isAppend){

					fnBindReady(nextInst.El, function(){
						nextInst.isReady = true;

						prevInst = nextInst = null;
					});

					nextInst.append();
				}

			// switch 2: prevInst 并没有添加至文档
			}else if(!prevInst.isAppend){

				// 清除 前一个实例 定时器
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

					prevInst = callback = null;
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

						prevInst = callback = null;
					});
				}

			}

			return nextInst || prevInst;
		};

		//
		Add = {
			add: function(){
				var
					_this = this,
					bDirectly,
					args = slice(arguments)
				;

				this.time && clearTimeout(this.time);

				bDirectly = args.pop();

				if("boolean" !== typeof bDirectly && bDirectly){
					args.push(bDirectly);
					bDirectly = false;
				}

				this.stack = this.stack.concat(args);

				if(bDirectly){
					this.handleStack();

				}else{

					this.time = setTimeout(function(){
						_this.handleStack();
					}, 0);
				}

				return this;
			},

			// 分组规则:
			/*
				(src, fn1, fn2, fn3)
				=>
				[src, fn1] [src, fn2] [src, fn3]
			*/
			/*
				(src, fn, src2, src3)
				=>
				[src, fn, src2] [src2, src3]

			*/
			/*
				(src, src2, fn1, fn2)
				=>
				[src, src2] [src2, fn1] [src2, fn2]
			*/

			handleStack: function(){
				var
					arrStack,

					inst,

					src,
					fn,

					sType,
					len,
					i,
					next
				;

				arrStack = this.stack;

				// 嗅探第一位 src, 并初始化
				// 遇上的 fn, 都即时执行
				while(!src){
					inst = undefined;
					src = arrStack.shift();

					sType = typeof src;

					if("string" === sType){
						inst = AddFactory(src);

					}else if("function" === sType){
						src.call(root);
						src = null;

					}else{
						src = null;
					}

					if(!inst && 0 === arrStack.length){
						return this;
					}
				}

				len = arrStack.length;

				// 若首位实例 是唯一一个剩下的实参(单身) - -!!
				inst && len < 1 && AddingEngine(inst);

				// step 3: 遍历绑定
				for(i = 0; i < len; i++){

					fn = undefined;
					src = arrStack[i];

					sType = typeof src;

					if("function" === sType){
						fn = src;
						src = undefined;

						next = arrStack[i + 1];

						if("string" === typeof next){
							src = next;
							i++;
						}

					}else if("string" !== sType){
						continue;
					}

					// 返回的是 nextInst
					inst = AddingEngine(inst, src, fn);
				}

				this.stack = [];

				return this;
			}

		};

		// 兼容之前代码
		Add.ready = Add.waits = function(){
			this.add.apply(this, arguments);
			return this;
		};

		add = function(){
			var
				instAdd
			;

			instAdd = create(Add);
			instAdd.stack = slice(arguments);
			instAdd.stack.length && instAdd.add();

			return instAdd;
		};

		/**
		 * 添加没有使用 .add 加载的资源
		 * @param src 完整 src, 最后不要省略 .后缀格式
		 * @param [elem]
		 * @returns {*}
		 */
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

							rSrc
						;

						src = src.replace(/\./g, "\\\\.");

						src = oR.hasExt.test(src) ?
							src.replace(oR.hasExt, "($&)?$") :
							src + "(\\\\.js)?$"
						;

						rSrc = new RegExp(src);

						while(len--){

							item = jsEls[len];

							if(rSrc.test(item.getAttribute("src"))){
								elem = item;
								break;
							}
						}

						// gc
						jsEls = item = null;

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

		add.version = "2.2";

		exprots.add = add;

		// 私有通信
		_hub.add = {
			map: {
				factory: AddFactory
			},

			get: function(v){
				return this.map.hasOwnProperty(v) ? this.map[v] : false;
			}
		};

	})(dances);

	// dances.require
	(function(exports, name, undefined){

		var
			define,
			require,
			Require,

			arrDefine = [],
			getExistExports,
			getInlineDependencies,

			commonRepo = dances.add.__view(),

			oREG,

			confVar,
			conf,
			confV,

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
			,

			protectDefine = 0

		;

		oREG = {
			requireAtom  : /^function\s*\(\s*([$\d\w]+)/i,
			commentBlock : /\/\*[\s\S]+\*\//gm,
			commentSingle: /\/\/.+/g,
			factoryParam : /dances\.key\.(exports|module)\$\$/
		};

		window.arrDefine = arrDefine;

		function id2path(id){

			// 嗅探是否有假名(模块id), 假名对应路径
			id = confVar.paths[id] || id;

			// .js 结尾, "/" 开头, http,https,ftp 协议 不会触发 baseUrl
			id = /\.js$/.test(id) || /^\//.test(id) || /(http|https|ftp):/.test(id) ?
				id :
				confVar.baseUrl + id
			;

			return id;
		}

		function callError(status, addProduct){
			this.errorArr.length && forEach(this.errorArr, function(err){
				err(status, addProduct);
			});

			return this;
		}

		getExistExports = function(id){
			var src;

			src = id2path(id);

			// commonRepo 只储存[路径]作为键名
			if(commonRepo.hasOwnProperty(src) && undefined !== commonRepo[src].exports){
				return commonRepo[src].exports;

			}else{
				throw "require doesn't load [" + id + "] module;";
			}
		};

		getInlineDependencies = function(_factory){
			var
				factoryPlain = _factory.toString(),

			 	regRequire = oREG.requireAtom.exec(factoryPlain)[1],

				requireInner,

				dependencies = []
			;

			regRequire = regRequire.replace("$", "\\$");

			regRequire = new RegExp(regRequire + "\\s*\\(\\s*([\"\'])([^\\s\'\"]+)\\1\\s*\\)", "g");

			// 清除注释
			factoryPlain = factoryPlain.replace(oREG.commentSingle, "").replace(oREG.commentBlock, "");

			// detect require in define scope
			while(requireInner = regRequire.exec(factoryPlain)){
				dependencies.push(requireInner[2]);
			}

			return dependencies;
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
				this.loadComplete = [];
				this.errorArr = [];
				this.requireCallback = callback;

				this.dependencies = args.pop();

				if("[object Array]" !== toString(this.dependencies)){
					if(callback.length){
						this.dependencies = getInlineDependencies(callback);
						this.requireExports.push(getExistExports);

					}else{
						this.dependencies = [];
					}

				}

				this.add = dances.add();

				this.init = function(){
					return this;
				};

				return this;
			},

			require: function(){
				var
					id,
					dep = this.dependencies,
					_this = this
				;

				if(dep.length){
					id = dep.shift();

					this.requireAtom(trim(id), function(addProduct){

						// 非第一次请求依赖
						// 因为 ie9 及以下, loaded 模式不同, 应当先判断是否已初始化了工厂方法.

						if(addProduct.exports){
							_this.requireExports.push(addProduct.exports);
							_this.require();

						}else if(arrDefine.length){
							arrDefine.shift()(_this, addProduct);

						}else if(addProduct.amd){

							if("[object Array]" !== toString(addProduct.loadComplete)){
								addProduct.loadComplete = [];
							}

							// 支持并发多次 require 相同的 src
							addProduct.loadComplete.push(function(exports){
								_this.requireExports.push(exports);
								_this.require();
							});

						}else{
							callError.call(_this, "noAMD", addProduct);
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
			// 如果已经被加载后, 则同步得到 模块 exports
			requireAtom: function(id, callback){
				var
					_id = id.toLowerCase(),
					src,

					__time,

					instShim,
					fShim,

					_this = this
				;

				switch(_id){
					// switch 1: 寻找关键字
					case "require":
							this.requireExports.push(getExistExports);
							this.require();
						break;

					case "module":
					case "exports":
							this.requireExports.push("dances.key." + _id + "$$");
							this.require();
						break;

					// switch 2: 非关键 加载
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

						src = id2path(id);

						// switch 2: 寻找是否已经加载
						if(commonRepo.hasOwnProperty(src) && commonRepo[src].exports){

							this.requireExports.push(commonRepo[src].exports);

							// 继续 require 依赖队列
							this.require();

						}else{

							// switch 3: 调用 dances.add() 加载

							// 超时管理
							if(confVar.timeout){
								__time = setTimeout(function(){
									protectDefine--;
									callError.call(_this, "timeout", _this.add);
									_this.add.status = "timeout";
									$$log("[" + src + "]: load has failed", "error");
								}, confVar.timeout);
							}

							// shim
							(instShim = confVar.shim[id]) && (fShim = function(){
								protectDefine++;
								define(instShim.deps || [], function(){
									protectDefine--;
									return eval(instShim.exports);
								});
							});

							this.add.status = "requesting";
							protectDefine++;

							this.add.add(src, function(addProduct){

								if("timeout" !== addProduct.status){
									_this.add.status = "loaded";

									__time && clearTimeout(__time);

									fShim && fShim();

									callback(addProduct);

									// gc
									callback =
										instShim = null
									;

								}

							});
						}
				}
				return this;
			},

			loadExports: function(_factory, _factoryArgs){
				var
					moduleAchieve = this.transferModule,
					exports,
					aParam,

					linkKey
				;

				// 防止重复调用 工厂方法
				if(moduleAchieve.exports){
					exports = moduleAchieve.exports;

				}else{
					exports = moduleAchieve.exports = {};

					if(_factoryArgs && _factoryArgs.length){
						_factoryArgs = slice(_factoryArgs, 0);

						linkKey = {
							module : moduleAchieve,
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

					aParam = _factoryArgs || [getExistExports, exports, moduleAchieve];
					aParam.length = _factory.length;

					// 以下两行不得插入其他代码
					exports = _factory.apply(this, aParam) || moduleAchieve.exports;
					moduleAchieve.exports = exports;

					if(moduleAchieve.loadComplete && "[object Array]" === toString(moduleAchieve.loadComplete)){

						forEach(moduleAchieve.loadComplete, function(item){
							item(exports);
						});

						moduleAchieve.loadComplete.length = 0;

					}

					// debug
//					moduleAchieve._factoryArgs = aParam;
				}

				return exports;
			},

			// 暴露给使用者
			// 添加错误信息处理
			// TODO 编写使用文档
			error: function(fn, bDel){
				var
					base,
					len
				;

				if("function" === typeof fn){
					if(bDel){
						base = this.errorArr;
						len = base.length;
						while(len--){
							if(fn === base[len]){
								base.splice(1, len);
								break;
							}
						}

					}else{
						this.errorArr.push(fn);
					}
				}

				return this;
			}
		};

		define = function(/*[id, ][dependencies, ]factory*/){
			var
				args,

				sModuleId,
				dependencies,
				_factoryParam,
				_factory,

				bMulDefine
			;

			// 防止 直接调用 define 引发的挫感
			// 指定 id 可以多重调用
			if(protectDefine === 0){
				if("string" === typeof arguments[0]){
					bMulDefine = true;

				}else{
					$$log("Timeout or Illegal_Invoke_Define", "error");
					return;
				}
			}

			// do nothings
			if(0 === arguments.length) {
				$$log("define() expect a function/object as factory at least", "error");
				return ;
			}

			args = slice(arguments, 0);
			bMulDefine || protectDefine--;

			// step 1.1: 找到工厂方法
			_factory = args.pop();
			if("function" === typeof _factory){

				// step 2.1: 过滤出 id dependencies
				if(args.length){

					dependencies = args.pop();

					if("string" === typeof dependencies){
						sModuleId = dependencies;
						dependencies = undefined;

					}else if("[object Array]" !== toString(dependencies)){
						dependencies = undefined;

					}else{
						_factoryParam = true;
						sModuleId = "string" === typeof (sModuleId = args.pop()) ? sModuleId : undefined;
					}
				}

				// step 3.1: 寻找 define工厂方法中的依赖
				if(!dependencies && _factory.length){
					dependencies = getInlineDependencies(_factory);
				}

			}else{

				// step 2.2: 组装简易 exports
				_factory = (function(exprots){
					return function(){
						return exprots;
					}
				})(_factory);

				sModuleId = "string" === typeof (sModuleId = args.pop()) ? sModuleId : undefined;

			}

			var fWait2Call;

			fWait2Call = function(instRequire, addProduct, bMulDefine){
				var
					_dependencies
				;

				// 做一个 标志
				addProduct.amd = true;

				if(dependencies && dependencies.length){
					_dependencies = [];
					forEach(dependencies, function(item){
						_dependencies.push(item);
					});
				}

				// handle mock id
				sModuleId && confV.paths(sModuleId, addProduct.src);

				// 保留激活链
				addProduct.callAgain = function(instRequire, deps){

					// 拷贝依赖
					if(!deps && _dependencies && _dependencies.length){
						deps = [];
						forEach(_dependencies, function(item){
							deps.push(item);
						});
					}

					instRequire.transferModule = addProduct;
					instRequire.transferModule.__define = _factory;

					if(deps && deps.length){

						// 开启 define中 dependence 队列
						require(deps, function(){
							instRequire.requireExports.push(
								instRequire.loadExports(_factory, _factoryParam && arguments)
							);
							bMulDefine || instRequire.require();
						});

					}else{
						instRequire.requireExports.push(
							instRequire.loadExports(_factory, "")
						);
						bMulDefine || instRequire.require();
					}

				};

				addProduct.callAgain(instRequire, dependencies);

			};

			if(bMulDefine){
				(function(){
					var
						instRequire,
						addProduct
					;

					// 借用 dances.add AddFactory
					addProduct = _hub.add.get("factory")(sModuleId);

					// config id&path
					addProduct.src = sModuleId.replace(/\.[\w\d]+$/, "");

					// fake normal instRequire
					instRequire = create(Require).init([function(){}]);

					fWait2Call(instRequire, addProduct, bMulDefine);

				})();
			}else{
				arrDefine.push(fWait2Call);
			}

		};

		/**
		 * @param {Array} [dependence]
		 * @param {Function} callback
		 * @returns {*} require inst
		 */
		require = function(dependence, callback){
			var
				v5 = arguments[arguments.length - 1],
				sType = typeof  v5,

				require
			;

			if("function" === sType){
				if(arguments.length > 1 || v5.length){
					require = create(Require).init(arguments);
					require.require();

				}else{
					v5();
				}

			}else if("string" === sType && 1 === arguments.length){
				dances.add(v5);
			}

			return require;
		};

		confVar = {
			baseUrl: "",

			paths  : {},

			timeout: 0,

			shim   : {
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

			/**
			 * @example
			 * .paths("id", "src");
			 * .paths({
			 *     id: "src"
			 * });
			 */
			paths: function(){
				var
					args = slice(arguments, 0),
					sModuleId = args.shift()
				;

				if("string" === typeof sModuleId){
					confVar.paths[sModuleId] = args.shift();

				}else if("[object Object]" === toString(sModuleId)){
					for(var prop in sModuleId){
						if(sModuleId.hasOwnProperty(prop)){
							confVar.paths[prop] = sModuleId[prop];
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

				if("[object Object]" !== toString(data)){
					return this;
				}

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

			}else if("[object Object]" === toString(k)){

				for(var prop in k){
					if(k.hasOwnProperty(prop)){
						confV.hasOwnProperty(prop) && confV[prop](k[prop]);
					}
				}
			}

			return this;
		};

		// 配置时间 默认是 15 秒
		conf("timeout", 15000);

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

				// 放弃 dances.amd exports 的 require 与 define 定义
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
			require.define =
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
