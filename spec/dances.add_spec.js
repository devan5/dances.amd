describe("dances.add", function(){
	var
		iframeEl,
		fnBindReady,

		baseUrl
	;

	baseUrl = "test/dances.add/src/" + "";

	fnBindReady = undefined === document.createElement("script").onload ?
		function(elem, fn){
			var prevFn = "function" === typeof elem.onreadystatechange ? elem.onreadystatechange : false;

			elem.onreadystatechange = function(){
				if("loaded" === elem.readyState || "complete" === elem.readyState){
					if(prevFn){
						prevFn.call(elem);

						// gc
						prevFn = null;
					}
					fn.call(elem);

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
					prevFn.call(elem);

					//gc
					prevFn = null;
				}
				fn.call(elem);

				// gc
				elem.onload = null;
				elem = fn = null;
			};
		}
	;

	describe("syntax form", function(){

		beforeEach(function(){
			iframeEl = document.createElement("iframe");
			iframeEl.style.width = "1px";
			iframeEl.style.height = "1px";
			iframeEl.style.overflow = "hidden";
			iframeEl.style.border = "none";
		});

		it("src, fn ", function(){
			var
				resp
			;
			runs(function(){

				fnBindReady(iframeEl, function(){
					var
						w = this.contentWindow
						;

					dances.add.switchWindow(w);

					dances
						.add(baseUrl + "TestReady.js")
						.add(function(){
							resp = this._readyTime;
						})
					;
				});

				document.body.appendChild(iframeEl);
			});

			waitsFor(function(){
				return resp;
			}, "demo1 fail", 550);

			runs(function(){
				expect("number" === typeof resp).toEqual(true);
			});

		});

		it("fn, src, fn", function(){
			var
				time,
				time2
			;

			runs(function(){

				fnBindReady(iframeEl, function(){
					var
						w = this.contentWindow
						;

					dances.add.switchWindow(w);

					dances
						.add(function(){
							time = this._readyTime;
						})
						.add(baseUrl + "TestReady.js")
						.add(function(){
							time2 = this._readyTime;
						})
					;
				});

				document.body.appendChild(iframeEl);
			});

			waitsFor(function(){
				return time2;
			}, "demo2 fail", 550);

			runs(function(){
				expect("undefined" === typeof time).toEqual(true);
				expect("number" === typeof time2).toEqual(true);
			});

		});

		it("src, src, fn", function(){
			var
				time,
				time2
				;

			runs(function(){

				fnBindReady(iframeEl, function(){
					var
						w = this.contentWindow
						;

					dances.add.switchWindow(w);

					dances
						.add(baseUrl + "TestReady.js")
						.add(baseUrl + "TestReady2.js")
						.add(function(){
							time = this._readyTime;
							time2 = this._readyTime2;
						})
					;
				});

				document.body.appendChild(iframeEl);
			});

			waitsFor(function(){
				return time2;
			}, "demo2 fail", 550);

			runs(function(){
				expect("number" === typeof time).toEqual(true);
				expect("number" === typeof time2).toEqual(true);
				expect(time).toEqual(time2);
			});

		});

		it("src, fn, src, fn", function(){
			var
				time,
				time2
			;

			runs(function(){

				fnBindReady(iframeEl, function(){
					var
						w = this.contentWindow
						;

					dances.add.switchWindow(w);

					dances
						.add(baseUrl + "TestReady.js")
						.add(function(){
							time = this._readyTime;
							this._readyTime = 5;
						})
						.add(baseUrl + "TestReady2.js")
						.add(function(){
							time2 = this._readyTime2;
						})
					;
				});

				document.body.appendChild(iframeEl);
			});

			waitsFor(function(){
				return time2;
			}, "demo2 fail", 550);

			runs(function(){
				expect("number" === typeof time).toEqual(true);
				expect(time2).toEqual(5);
			});

		});

		it("src&fn, src&fn, src&src&fn, fn, src&src, src, fn", function(){
			var

				expect_1,
				expect_2,
				expect_3,
				expect_4,
				expect_MX,
				expectUndefined,
				expectEnd
				;

			runs(function(){

				fnBindReady(iframeEl, function(){
					var
						w = this.contentWindow
						;

					dances.add.switchWindow(w);

					dances
						.add(baseUrl + "demo5/common-base-base.js", function(){
							expect_1 = this.bg2Change;
						})
						.add(baseUrl + "demo5/common-base-base2.js", function(){
							expect_2 = this.bgRecover;
						})

						.add(baseUrl + "demo5/common-base.js", baseUrl + "demo5/apps-1.js", function(){
							expect_MX = this.MX;
							expect_3 = this.MX.alertCurrentColor;
						})

						.add(function(){
							expect_4 = expect_3 === this.MX.alertCurrentColor;

							// 'baseUrl + "apps-2.js" 定义了此方法, 这里应该输出 [undefined] '
							expectUndefined = this.MX.bg2Pink;
						})

						.add(baseUrl + "demo5/TestReady.js", baseUrl + "demo5/TestReady2.js")

						.add(baseUrl + "demo5/apps-2.js")
						.add(function(){
							expectEnd = 5;
						})
					;
				});

//					iframeEl.src = "dances.add.html";
				document.body.appendChild(iframeEl);
			});

			waitsFor(function(){
				return expectEnd;
			}, "demo2 fail", 550);

			runs(function(){
				expect(expectUndefined).toEqual(undefined);
				expect(expect_1).toEqual(expect_MX.bg2Change);
				expect(expect_2).toEqual(expect_MX.bgRecover);
				expect(expect_4).toEqual(true);
			});

		});

		// 拟真环境
		it("拟真环境", function(){
			var
				jsLength,
				tag,
				$,

				msg
			;

			runs(function(){

				fnBindReady(iframeEl, function(){
					var
						w = this.contentWindow
						;

					dances.add.switchWindow(w);

					dances
						.add(baseUrl + "necessaryImplement/jquery-1.7.2.min.js")
						.add(function(){
							$ = this.jQuery;
						})
						.add(baseUrl + "necessaryImplement/common-library.js")
						.add(baseUrl + "necessaryImplement/common.js")
					;

					dances
						.add(baseUrl + "necessaryImplement/common.js")
						.add(baseUrl + "necessaryImplement/page.js")
						.add(function(){
							// 这里定义域 不仅仅是 js/common.js 已经加载完毕
							// very important
							// 而且 jquery.js common-library.js 也加载完毕

							var
								$El
							;

							$El = this.$("<section></section>");
							tag = $El.getTag();

						})
						.add(function(){
							jsLength = this.document.getElementsByTagName("script");
							msg = w.NS.methodA("by page.js");
						})
					;
				});

				document.body.appendChild(iframeEl);
			});

			waitsFor(function(){
				return jsLength;
			}, "demo6 fail", 550);

			runs(function(){
				expect(jsLength.length).toEqual(4);
				expect(tag).toEqual("section");
				expect(typeof $.prototype.find).toEqual("function");
				expect(msg).toEqual("NS.methodA invoked. by page.js");
			});

		});

		// 复查
		it("复查", function(){
			var
				time,
				jsLength,
				expectEnd
			;

			runs(function(){

				fnBindReady(iframeEl, function(){
					var
						w = this.contentWindow
					;

					dances.add.switchWindow(w);

					dances.
						add(baseUrl + "TestReady.js")
					;
					dances
						.add(baseUrl + "TestReady.js")
						.add(function(){
							time = this._readyTime;
							jsLength = this.document.getElementsByTagName("script").length;
							expectEnd = 5;
						})
					;
				});

				document.body.appendChild(iframeEl);
			});

			waitsFor(function(){
				return expectEnd;
			}, "demo6 fail", 550);

			runs(function(){
				expect(jsLength).toEqual(1);
				expect(typeof time).toEqual("number");
			});

		});

		// css
		it("css", function(){
			var
				time,
				time2
			;

			runs(function(){

				fnBindReady(iframeEl, function(){
					var
						w = this.contentWindow
						;

					dances.add.switchWindow(w);

					dances.
						add(function(){
							var doc = this.document;

							time = doc.defaultView ?
								doc.defaultView.getComputedStyle(doc.body).borderBottomWidth :
								doc.body.currentStyle.borderBottomWidth
							;
						})
						.add(baseUrl + "demo_01.css")
						.add(function(){
							var doc = this.document;
							time2 = doc.defaultView ?
								doc.defaultView.getComputedStyle(doc.body).borderBottomWidth :
								doc.body.currentStyle.borderBottomWidth
							;
						})
				});

				document.body.appendChild(iframeEl);
			});

			waitsFor(function(){
				return time2;
			}, "demo8 fail", 550);

			runs(function(){
				expect(time !== "1px").toEqual(true);
				expect(time2).toEqual("1px");
			});

		});

		// css + js
		it("css + js", function(){
			var
				time,
				time2,
				time3,
				jsLength,
				expectEnd
				;

			runs(function(){

				fnBindReady(iframeEl, function(){
					var
						w = this.contentWindow
						;

					dances.add.switchWindow(w);

					dances
						.add(baseUrl + "TestReady.js")
						.add(function(){
							var doc = this.document;

							time = doc.defaultView ?
								doc.defaultView.getComputedStyle(doc.body).borderBottomWidth :
								doc.body.currentStyle.borderBottomWidth
							;
						})
						.add(baseUrl + "demo_01.css")

						.add(function(){
							var doc = this.document;

							time2 = doc.defaultView ?
								doc.defaultView.getComputedStyle(doc.body).borderBottomWidth :
								doc.body.currentStyle.borderBottomWidth
							;
						})

						.add(baseUrl + "TestReady2.js")
						.add(function(){
							time3 = this._readyTime;
							expectEnd = 5;
						})
					;
				});

				document.body.appendChild(iframeEl);
			});

			waitsFor(function(){
				return expectEnd;
			}, "demo6 fail", 550);

			runs(function(){
				expect(time !== "1px").toEqual(true);
				expect(time2).toEqual("1px");
				expect(typeof time3).toEqual("number");
			});

		});

	});


	describe("[method] mark", function(){
		// TODO
	});

	describe("[method] switchWindow", function(){
		// TODO
	});

});
