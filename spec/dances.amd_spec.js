
(function(){

	var
		baseUrl,
		sAmdSrc
	;

	baseUrl = "test/dances.require/src/";
	sAmdSrc = "dist/dances.amd.js";

	var
		uncurrying = function(fn){
			return function(){
				return Function.prototype.call.apply(fn, arguments);
			}
		},

		slice = uncurrying(Array.prototype.slice),

		fnBindReady = undefined === document.createElement("script").onload ?
			function(elem, fLoaded, scope){
				var
					fPreLoaded = "function" === typeof elem.onreadystatechange ?
					elem.onreadystatechange :
					false
				;

				if("function" === typeof fLoaded){
					elem.onreadystatechange = function(){
						if("loaded" === elem.readyState || "complete" === elem.readyState){
							if(fPreLoaded){
								fPreLoaded.call(scope);

								// gc
								fPreLoaded = null;
							}
							fLoaded.call(scope);

							// gc
							elem.onreadystatechange = null;
							scope = elem = fLoaded = null;
						}
					};
				}
			} :

			function(elem, fLoaded, scope){
				var
					fPreLoaded = "function" === typeof elem.onload ?
					elem.onload :
					false
				;

				if("function" === typeof fLoaded){
					elem.onload = function(){
						if(fPreLoaded){
							fPreLoaded.call(scope);

							//gc
							fPreLoaded = null;
						}
						fLoaded.call(scope);

						// gc
						elem.onload = null;
						scope = elem = fLoaded = null;
					};
				}
			}
	;

	describe("define", function(){
		var iframeEl;

		beforeEach(function(){
			iframeEl = document.createElement("iframe");
			iframeEl.style.display = "none";
		});

		it("双层引自一层", function(){
			var getA, getB;

			runs(function(){

				iframeEl.setAttribute("data-name","双层引自一层");
				fnBindReady(iframeEl, function(){
					var
						w = this.contentWindow,
						jsEl
					;

					jsEl = w.document.createElement("script");

					fnBindReady(jsEl, function(){
						w.require([baseUrl + "define_basic/a-master", baseUrl + "define_basic/b-master"], function(a, b){
							getA = a;
							getB = b;
						});
					});

					jsEl.src = sAmdSrc ;
					w.document.getElementsByTagName("head")[0].appendChild(jsEl);

				}, iframeEl);

				document.body.appendChild(iframeEl);

			});

			waitsFor(function(){
				return getA  && getB;
			}, "双层引自一层 fail", 550);

			runs(function(){
				expect(getA.a1).toEqual("a1.js loaded");
				expect(getA.a2).toEqual("a2.js loaded");
				expect(getB.b1).toEqual("b1.js loaded");
				expect(getB.b2).toEqual("b2.js loaded");
			});

		});

		it("5层 define", function(){

			var
				getI
			;

			runs(function(){

				iframeEl.setAttribute("data-name","5层 define");
				fnBindReady(iframeEl, function(){
					var
						w = this.contentWindow,
						jsEl
					;

					jsEl = w.document.createElement("script");

					fnBindReady(jsEl, function(){
						w.require([baseUrl + "define_depthMore/a-master"], function(inst){
							getI = inst;
						});
					});

					jsEl.src = sAmdSrc ;
					w.document.getElementsByTagName("head")[0].appendChild(jsEl);

				}, iframeEl);

				document.body.appendChild(iframeEl);

			});

			waitsFor(function(){
				return getI;
			}, "5层 define fail", 550);

			runs(function(){
				function plusDepth(len){
					var v = 0;

					while(len){
						v += len--;
					}

					return v;
				}

				expect(getI).toEqual(plusDepth(5));
			});

		});

		it("paramDependencies", function(){
			var getA, getB;

			runs(function(){

				iframeEl.setAttribute("data-name","paramDependencies");
				fnBindReady(iframeEl, function(){
					var
						w = this.contentWindow,
						jsEl = w.document.createElement("script")
					;

					fnBindReady(jsEl, function(){
						w.require([baseUrl + "define_paramDependencies/a-master", baseUrl + "define_paramDependencies/b-master"], function(a, b){
							getA = a;
							getB = b;
						});
					});

					jsEl.src = sAmdSrc ;
					w.document.getElementsByTagName("head")[0].appendChild(jsEl);

				}, iframeEl);

				document.body.appendChild(iframeEl);

			});

			waitsFor(function(){
				return getA  && getB;
			}, "双层引自一层 fail", 550);

			runs(function(){
				expect(getA.a1).toEqual("a1.js loaded");
				expect(getA.a2).toEqual("a2.js loaded");
				expect(getB.b1).toEqual("b1.js loaded");
				expect(getB.b2).toEqual("b2.js loaded");
			});

		});

		it("multiple require", function(){
			var
				getA,
				getB,
				getC
			;

			runs(function(){

				iframeEl.setAttribute("data-name","multiple require");
				fnBindReady(iframeEl, function(){
					var
						w = this.contentWindow,
						jsEl
					;

					jsEl = w.document.createElement("script");

					fnBindReady(jsEl, function(){
						w.require([baseUrl + "mul_require/a1", baseUrl + "mul_require/~a1", baseUrl + "mul_require/~~a1"], function(a, $a, $$a){
							getA = slice(arguments, 0);
						});

						w.require([baseUrl + "mul_require/b1", baseUrl + "mul_require/~b1"], function(){
							getB = slice(arguments, 0);
						});

						w.require([baseUrl + "mul_require/c1"], function(res){
							getC = res;
						});
					});

					jsEl.src = sAmdSrc ;
					w.document.getElementsByTagName("head")[0].appendChild(jsEl);

				}, iframeEl);

				document.body.appendChild(iframeEl);

			});

			waitsFor(function(){
				return getA  && getB && getC;
			}, "multiple require", 550);

			runs(function(){
				expect(getA).toEqual([10, 15, 20]);
				expect(getB.shift().b()).toEqual("b2 created");
				expect(getB.shift().arr.length).toEqual(100);
				expect(getC.c1()).toEqual("created by c1.js");
				expect(getC.c2.main).toEqual("create by c3.js");
				expect(getC.c2.sub).toEqual("create by c3.1.js");
			});

		});

		it("defineParamModOne", function(){
			var
				getA,
				getB,
				getC
			;

			runs(function(){

				iframeEl.setAttribute("data-name","defineParamModOne");
				fnBindReady(iframeEl, function(){
					var
						w = this.contentWindow,
						jsEl
					;

					jsEl = w.document.createElement("script");

					fnBindReady(jsEl, function(){
						w.require([baseUrl + "defineParamModOne/a-master"], function(v){
							getA = v;
						});

						w.require([baseUrl + "defineParamModOne/a-master-branch"], function(v){
							getB = v;
						});

						w.require([baseUrl + "defineParamModOne/a1"], function(v){
							getC = v;
						});
					});

					jsEl.src = sAmdSrc ;
					w.document.getElementsByTagName("head")[0].appendChild(jsEl);

				}, iframeEl);

				document.body.appendChild(iframeEl);

			});

			waitsFor(function(){
				return getA && getB && getC;
			}, "defineParamModOne fail", 550);

			runs(function(){
				expect(getA.hasOwnProperty("a-master")).toEqual(true);
				expect(getA["a-master"]).toEqual("a data belong a-master");
				expect(getA["a-master-a1"]).toEqual("a data belong a-a1_____ a message form a2.js");

				expect(getB.hasOwnProperty("a-master-branch")).toEqual(true);
				expect(getB["a-master-a1"]).toEqual("a data belong a-a1_____ a message form a2.js");
				expect(getB["a-x"]).toEqual("fiv");
			})

		});

		it("defineParamModTwo", function(){
			var
				getA,
				getB
			;

			runs(function(){

				iframeEl.setAttribute("data-name","defineParamModTwo");
				fnBindReady(iframeEl, function(){
					var
						w = this.contentWindow,
						jsEl
					;

					jsEl = w.document.createElement("script");

					fnBindReady(jsEl, function(){
						w.require([baseUrl + "defineParamModTwo/a-master"], function(v){
							getA = v;
						});

						w.require([baseUrl + "defineParamModTwo/a-master-branch"], function(v){
							getB = v;
						});

					});

					jsEl.src = sAmdSrc ;
					w.document.getElementsByTagName("head")[0].appendChild(jsEl);

				}, iframeEl);

				document.body.appendChild(iframeEl);

			});

			waitsFor(function(){
				return getA && getB;
			}, "defineParamModTwo fail", 550);

			runs(function(){
				expect(getA.hasOwnProperty("a-master")).toEqual(true);
				expect(getA["a-master-a1"]).toEqual("a data belong a-a1_____ a message form a2.js");

				expect(getB.hasOwnProperty("a-master-branch")).toEqual(true);
				expect(getB["a-master-a1"]).toEqual("a data belong a-a1_____ a message form a2.js");
				expect(getB["a-x"]).toEqual("fiv");
			});

		});

		it("defineID", function(){
			var
				getA
			;

			runs(function(){

				iframeEl.setAttribute("data-name", "defineID");
				fnBindReady(iframeEl, function(){
					var
						w = this.contentWindow,
						jsEl
					;

					jsEl = w.document.createElement("script");

					fnBindReady(jsEl, function(){
						w.require([baseUrl + "defineID/define"], function(_){
							w.require(["x-man"], function(_){
								getA = _;
							})
						})
					});

					jsEl.src = sAmdSrc ;
					w.document.getElementsByTagName("head")[0].appendChild(jsEl);

				}, iframeEl);

				document.body.appendChild(iframeEl);

			});

			waitsFor(function(){
				return getA;
			}, "defineID fail", 550);

			runs(function(){
				expect(typeof getA.chat).toEqual("function");
				expect(getA.chat()).toEqual("base is loaded");
			});

		});
	});

	describe("require", function(){
		var iframeEl;

		beforeEach(function(){
			iframeEl = document.createElement("iframe");
			iframeEl.style.display = "none";
		});

		it("require invokeII",function(){
			var
				getA
			;

			runs(function(){

				iframeEl.setAttribute("data-name", "require invokeII");

				fnBindReady(iframeEl, function(){
					var
						w = this.contentWindow,
						jsEl
					;

					jsEl = w.document.createElement("script");

					fnBindReady(jsEl, function(){
						w.require(function(_){
							// important !!!
							// 特别留意, 这必须显示使用路径, 不需带变量, 这是限制!!!!
							getA = _("test/dances.require/src/require_invokeII/a");
						});
					});

					jsEl.src = sAmdSrc ;
					w.document.getElementsByTagName("head")[0].appendChild(jsEl);

				}, iframeEl);

				document.body.appendChild(iframeEl);

			});

			waitsFor(function(){
				return getA
			}, "require invokeII fail", 500);

			runs(function(){
				expect(getA).toEqual("ok fine with it");
			});


		});

	});

	describe("require ss", function(){
		it("require css", function(){
			// TODO
		});
		it("custom ss/less/sass", function(){
			// TODO
		});
	});

	describe("测试 conf 配置", function() {
		var iframeEl;

		beforeEach(function(){
			iframeEl = document.createElement("iframe");
			iframeEl.style.display = "none";
		});

		it("baseUrl", function(){
			var getA;

			runs(function(){

				iframeEl.setAttribute("data-name", "baseUrl");
				fnBindReady(iframeEl, function(){
					var
						w = this.contentWindow,
						jsEl
					;

					jsEl = w.document.createElement("script");

					fnBindReady(jsEl, function(){
						w.require.conf({
							"baseUrl": baseUrl + "conf/"
						});
						w.require(["baseURl"], function(_){
							getA = _;
						});
					});

					jsEl.src = sAmdSrc ;
					w.document.getElementsByTagName("head")[0].appendChild(jsEl);

				}, iframeEl);

				document.body.appendChild(iframeEl);

			});

			waitsFor(function(){
				return getA;
			}, "baseURl fail", 555);

			runs(function(){
				require.conf("baseUrl", "");
				expect(getA).toEqual("you get me.");
			});

		});

		it("paths", function(){
			var
				getA,
				getB,
				iWin
			;

			runs(function(){

				iframeEl.setAttribute("data-name", "paths");
				fnBindReady(iframeEl, function(){
					var
						w = this.contentWindow,
						jsEl
					;

					iWin = w;
					jsEl = w.document.createElement("script");

					fnBindReady(jsEl, function(){
						w.define.amd.jQuery = true;

						w.require
							.conf("paths", {
								jq: baseUrl + "conf/jquery-1.7.2.min.js",
								us: baseUrl + "conf/underscore-min.js"
							})
							.conf("shim", {
								us: {
									exports: "_"
								}
							})
						;

						w.require(["jq", "us"], function($, _){
							getA = $("body");
							getB = _.toArray(getA)[0];
						});
					});

					jsEl.src = sAmdSrc ;
					w.document.getElementsByTagName("head")[0].appendChild(jsEl);

				}, iframeEl);

				document.body.appendChild(iframeEl);

			});

			waitsFor(function(){
				return getA && getB;
			}, "path fail", 550);

			runs(function(){
				expect(getA[0] === iWin.document.body).toEqual(true);
				expect(getB === iWin.document.body).toEqual(true);
			});

		});

		it("timeout", function(){
			var
				getA
			;

			runs(function(){

				iframeEl.setAttribute("data-name", "paths");
				fnBindReady(iframeEl, function(){
					var
						w = this.contentWindow,
						jsEl
					;

					jsEl = w.document.createElement("script");

					fnBindReady(jsEl, function(){

						w.require
							.conf("timeout", 1)
						;

						w.require([baseUrl + "timeout/ajs"], function(_){
							getA = _;
						})
							.error(function(){
								getA = slice(arguments)
							})
						;
					});

					jsEl.src = sAmdSrc ;
					w.document.getElementsByTagName("head")[0].appendChild(jsEl);

				}, iframeEl);

				document.body.appendChild(iframeEl);

			});

			waitsFor(function(){
				return getA;
			}, "timeout fail", 500);

			runs(function(){

				expect(getA[0]).toEqual("timeout");

			});

		});

	});

	describe("fix bugs in 2.0", function(){
		var iframeEl;

		beforeEach(function(){
			iframeEl = document.createElement("iframe");
			iframeEl.style.display = "none";
		});

		it("call factory the same", function(){

			var
				getA,
				getB,
				iWin
			;

			runs(function(){

				iframeEl.setAttribute("data-name", "call factory the same");
				fnBindReady(iframeEl, function(){
					var
						w = this.contentWindow,
						jsEl
					;

					iWin = w;

					jsEl = w.document.createElement("script");

					fnBindReady(jsEl, function(){
						w.require([baseUrl + "mul_require_sameFile/a"], function(_){
							getA = _;
						});

						w.require([baseUrl + "mul_require_sameFile/a"], function(_){
							getB = _;
						});
					});

					jsEl.src = sAmdSrc ;
					w.document.getElementsByTagName("head")[0].appendChild(jsEl);

				}, iframeEl);

				document.body.appendChild(iframeEl);

			});

			waitsFor(function(){
				return getA && getB;
			}, "call factory the same", 550);

			runs(function(){
				expect(getA.reflect("first")).toEqual("first");
				expect(getB.reflect("second")).toEqual("second");
				expect(getA.reflect === getB.reflect).toEqual(true);

				expect(iWin.dances.add.__view()[baseUrl + "mul_require_sameFile/a"].__TEST_CALL_THE_SAME).toEqual(1);

			});


		});

		it("call mix", function(){
			var
				getA,
				getB,
				getC,
				getD
			;

			runs(function(){

				iframeEl.setAttribute("data-name", "call mix");
				fnBindReady(iframeEl, function(){
					var
						w = this.contentWindow,
						jsEl
					;

					jsEl = w.document.createElement("script");

					fnBindReady(jsEl, function(){
						w.require([baseUrl + "mul_require_mix/mod1"], function($){
							getA = $;
						});

						w.require([baseUrl + "mul_require_mix/mod2", baseUrl + "mul_require_mix/mod1"], function($1, $2){
							getB = $1;
						});

						w.require([baseUrl + "mul_require_mix/mod2", baseUrl + "mul_require_mix/mod3"], function($1, $2){
							getC = $2;
						});

						w.require([baseUrl + "mul_require_mix/mod3", baseUrl + "mul_require_mix/mod1"], function($1, $2){
							getD = $2;
						});
					});

					jsEl.src = sAmdSrc ;
					w.document.getElementsByTagName("head")[0].appendChild(jsEl);

				}, iframeEl);

				document.body.appendChild(iframeEl);

			});

			waitsFor(function(){
				return getA && getB && getC && getD;
			}, "call fix", 550);

			runs(function(){
				expect(getA.name).toEqual("mod1");
				expect(getB.name).toEqual("mod2");
				expect(getC.name).toEqual("mod3");
				expect(getD.name).toEqual("mod1");
			});

		});
	});

	describe("shim", function(){

		var iframeEl;

		beforeEach(function(){
			iframeEl = document.createElement("iframe");
			iframeEl.style.width = "1px";
			iframeEl.style.height = "1px";
			iframeEl.style.overflow = "hidden";
			iframeEl.style.border = "none";
		});

		it("自定模块 dances.color", function(){
			var
				getA
			;

			runs(function(){

				iframeEl.setAttribute("data-name", "自定模块 dances.color");
				fnBindReady(iframeEl, function(){
					var
						w = this.contentWindow,
						jsEl
					;

					jsEl = w.document.createElement("script");

					fnBindReady(jsEl, function(){
						w.require.conf({
							shim: {
								color: {
									path   : baseUrl + "conf/dances.color.js",
									exports: "dances.color"
								}
							}
						});

						w.require(["color"], function(color){
							getA = color("#fffff");
						});
					});

					jsEl.src = sAmdSrc ;
					w.document.getElementsByTagName("head")[0].appendChild(jsEl);

				}, iframeEl);

				document.body.appendChild(iframeEl);

			});

			waitsFor(function(){
				return getA;
			}, "shim 自定模块 dances.color", 550);

			runs(function(){
				expect(getA).toEqual("#fffff");
			});

		});

		it("jquery_1.4", function(){
			var
				getA
			;

			runs(function(){

				iframeEl.setAttribute("data-name", "jquery_1.4");
				fnBindReady(iframeEl, function(){
					var
						w = this.contentWindow,
						jsEl
					;

					jsEl = w.document.createElement("script");

					fnBindReady(jsEl, function(){
						w.require.conf({
							shim: {
								$14: {
									path   : baseUrl + "shim/jquery-1.4.4.min",
									exports: "jQuery"
								}
							}
						});

						w.require(["$14"], function($){
							getA = $;
						});
					});

					jsEl.src = sAmdSrc ;
					w.document.getElementsByTagName("head")[0].appendChild(jsEl);

				}, iframeEl);

				document.body.appendChild(iframeEl);

			});

			waitsFor(function(){
				return getA
			}, "shim jquery_14 fail", 500);

			runs(function(){
				expect(getA().jquery ).toEqual("1.4.4");
			});

		});


		it("测试错误添加 非AMD 模块", function(){
			var
				getA
			;

			runs(function(){
				iframeEl.setAttribute("data-name", "测试错误添加 非AMD 模块");
				fnBindReady(iframeEl, function(){
					var
						w = this.contentWindow,
						jsEl
					;

					jsEl = w.document.createElement("script");

					fnBindReady(jsEl, function(){
						w.require.conf("timeout", 500);

						w.require([baseUrl + "shim/noAMD"], function(_){
							getA = _;
						})
							.error(function(status, inst){
								getA = slice(arguments);
							})

						;
					});

					jsEl.src = sAmdSrc ;
					w.document.getElementsByTagName("head")[0].appendChild(jsEl);

				}, iframeEl);

				document.body.appendChild(iframeEl);

			});

			waitsFor(function(){
				return getA;
			}, "测试错误添加 非AMD 模块 fail", 500);

			runs(function(){
				expect(getA[0]).toEqual("noAMD");
				expect(getA[1].exports).toEqual(undefined);
				expect(getA[1].src).toEqual(baseUrl + "shim/noAMD.js");
			});

		});

	});

	describe("miscellaneous", function(){
		var iframeEl;

		beforeEach(function(){
			iframeEl = document.createElement("iframe");
			iframeEl.style.display = "none";
		});

		it("恶意调用 define", function(){
			// TODO
		});
	});

	describe("扩展需求 extending", function(){
		var iframeEl;

		beforeEach(function(){
			iframeEl = document.createElement("iframe");
			iframeEl.style.display = "none";
		});

		it("允许 指定id define 多次调用", function(){
			var
				$person,
				$feder,
				$designer
			;

			runs(function(){

				iframeEl.setAttribute("data-name", "allow specific id multi define");

				fnBindReady(iframeEl, function(){
					var
						w = this.contentWindow,
						jsEl
					;

					jsEl = w.document.createElement("script");

					fnBindReady(jsEl, function(){

						// 实际情况会是 同步加载 src/specificIdMultiDefine/MultiDefine_pkg1.js
						// 这里方便测试
						w.dances.add(baseUrl + "specificIdMultiDefine/MultiDefine_pkg1", function(){
							$log("ok.....");
							w.require(["person", "designer", "feder"], function(){
								$person = arguments[0];
								$feder = arguments[2];
								$designer = arguments[1];
							});

						});
					});

					jsEl.src = sAmdSrc ;
					w.document.getElementsByTagName("head")[0].appendChild(jsEl);

				}, iframeEl);

				document.body.appendChild(iframeEl);

			});

			waitsFor(function(){
				return $person && $feder && $designer;
			}, "specificIdMultiDefine time out", 550);

			runs(function(){
				expect($person.read("javascript")).toEqual("read this javascript");
				expect($feder.build("webBank")).toEqual("build this webBank");
				expect($designer.design("ios7")).toEqual("design this ios7");
			});

		});
	});

})();
