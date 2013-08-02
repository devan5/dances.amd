/**
* @dances.amd
* @overview
*/
(function(exports){

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

	// 从函数中, 提取出形参, 返回
	getInlineDependencies = function getInlineDependencies(_factory){
		var
			factoryPlain = _factory.toString(),

		    regRequire = oREG.requireAtom.exec(factoryPlain)[1],

			requireInner,

			dependencies = []
		;

		regRequire = regRequire.replace("$", "\\$");

		regRequire = new RegExp("=\\s*" + regRequire + "\\s*\\(\\s*([\"\'])([^\\s\'\"]+)\\1\\s*\\)\\s*;", "g");

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
				// 检测函数是否具有形参
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

	define = function define(/*[id, ][dependencies, ]factory*/){
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
	require = function require(dependence, callback){
		var
			v5 = arguments[arguments.length - 1],
			sType = typeof  v5,

			require
		;

		// @example dances.require(..., fn)
		if("function" === sType){
			if(arguments.length > 1 || v5.length){
				require = create(Require)
					.init(arguments)
					.require()
				;

			}else{
				v5();
			}

		// @example dances.require("onlySrc")
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
