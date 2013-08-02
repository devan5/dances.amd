if("[object Function]" !== typeof toString(dances) && "[object Object]" !== typeof toString(dances)){
	dances = (function(){
		Foo.prototype.root = "dances.add";
		window.dances = new Foo();

		function Foo(){ }

		return window.dances;
	})();
}

/**
 * @name dances.add
 * @author devan5
 * @overview
 */
(function(exprots, undefined){

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

	oR = {
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
				tagName    : "link",
				srcPropName: "href",
				attr       : [
					["type", "text/css"],
					["rel", "stylesheet"]
				]
			},
			js : {
				tagName    : "script",
				srcPropName: "src",
				attr       : [
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
					El  : domEl,
					type: sExt,

					srcPropName: oFactors.srcPropName,
					src        : intactSRC,

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

	add = function add(){
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

	exprots.add = add;

})(dances);
