// for development
if((typeof console) === "undefined"){
	console = {};
	console.log = window.Boolean;
}

define.amd.jQuery = true;
define.amd.dseToggle = true;
require.conf({
	paths: {
		jq_1_72: "http://fed.www.100hg.com/js/jquery-1.7.2.min",
		dseToggle: "http://fed.www.100hg.com/js/dances/dances.eToggle_1.3.min"
	}
});

// stable
(function(){
	dances.namespace("GLOBAL.oB");

	//cookie handle
	GLOBAL.oB.cookie={ get:function(str){ var arr =  (new RegExp("\\b"+decodeURI(str)+"=([^;]*)\\b")).exec(document.cookie); return arr?arr[1]:false; }, set:function(name,value,expires,path,domain,secure){ var str = encodeURI(name)+"="+encodeURI(value); if (expires) {	str += "; expires="+expires.toGMTString();} if (path) {str += "; path="+path;} if (domain) {str += "; domain="+domain;} if (secure) {str += "; secure";} document.cookie = str; }, clear:function(str,path,domain,secure){ path=path?"; path="+path:''; domain=domain?"; domain="+domain:''; secure=secure?"; secure="+secure:''; if(str){ document.cookie = str+"=; expires="+(new Date).toGMTString()+path+domain+secure;return ; } var hub=document.cookie.split('; '); for(var i=0;i< hub.length;i++){document.cookie= hub[i].split('=')[0]+'=; expires='+(new Date).toGMTString()+path+domain+secure;} }, remove:function(str,path,domain,secure){ path=path?"; path="+path:''; domain=domain?"; domain="+domain:''; secure=secure?"; secure="+secure:''; if(str){ var f=(new RegExp("\\b"+decodeURI(str)+"=([^;]*)\\b")).test(document.cookie); document.cookie = str+"=; expires="+(new Date).toGMTString()+path+domain+secure; if(f){return 'Done';}else{return 'Nocookie';} } var hub=document.cookie.split('; '); for(var i=0;i< hub.length;i++){document.cookie= hub[i].split('=')[0]+'=; expires='+(new Date).toGMTString()+path+domain+secure;} return 'All may cookie cleared!'; } };

	GLOBAL.oB.ie = (function(){
		var reg = /MSIE([\d\.\s]+);/gm;
		if(!document.all)return '0421' * 1;
		return (reg.exec(navigator.appVersion.toUpperCase()))[1] * 1;
	}());
})();


// jQuery.extend
(function ($) {
    $.prototype.textHolder = function (options) {
        var settings = {
            holderName:"",
            keepName:""
        };
        $.extend(settings, options);

        this.blur(function () {
            var $this = $(this);
            if (0 == $this.val().length) {
                $this.val(settings.holderName || this.defaultValue);
            }
        });
        this.focus(function () {
            var $this = $(this), val = $this.val();
            if ((settings.holderName || this.defaultValue) === val && settings.keepName != val) {
                $this.val('');
            }
        });
    };
})(jQuery);
(function(a){a.prototype.obEventClass=function(j){var d={className:"current",timeHold:100,timeResume:100,clearIn:true,clearResume:true,eventStart:"",eventResume:"",only_ie6:false,keepOne:false},e=this;j=a.extend(d,j);if(j.only_ie6&&6!=GLOBAL.oB.ie){return}if(j.keepOne&&j.eventStart){e.bind(j.eventStart,function(){e.removeClass(j.className);a(this).addClass(j.className)})}else{if(j.eventResume!=j.eventStart&&j.eventStart&&j.eventResume){e.bind(j.eventStart,function(){b(this)}).bind(j.eventResume,function(){i(this)})}else{if(j.eventStart){e.bind(j.eventStart,function(){h(this)});function h(k){if(!!k.dualFag){i(k);k.dualFag=false}else{b(k);k.dualFag=true}}}else{e.hover(function(){b(this)},function(){i(this)})}}}function b(k){if(j.clearResume&&!!(k.aly_remove_action)){clearTimeout(k.aly_remove_action);k.aly_remove_action=""}if(1==k.aly_addClass){return}if(j.timeHold>0){k.aly_add_action=setTimeout(function(){f(k)},j.timeHold)}else{f(k)}}function i(k){if(j.timeResume>0){if(g(k)===false){return false}k.aly_remove_action=setTimeout(function(){c(k)},j.timeResume+k.timeResume_offset)}else{if(g(k)===false){return false}if(0==k.timeResume_offset){c(k)}else{setTimeout(function(){c(k)},k.timeResume_offset)}}}function g(k){k.timeResume_offset=0;if(j.clearIn){clearTimeout(k.aly_add_action);k.aly_add_action="";if(1!=k.aly_addClass){return false}}if(!!j.clearIn==false&&j.timeResume<=j.timeHold){k.timeResume_offset=j.timeHold}}function f(k){a(k).addClass(j.className);k.aly_addClass=1}function c(k){a(k).removeClass(j.className);k.aly_addClass=0}return this}})(jQuery);


// contentLoadInvoke js
// 2012.07.30:Main-page
$(document)
	.ready(function(){
		// 收缩伸展 分类事件
		// 2012.08.28 使用委托
		// $(".s-classW").obEventClass({className:"show_Sclass"});


		// nav-extra
		/*
		$(".nav-extra").obEventClass({
			className:"nav-extra-con-hover",
			timeResume:200
		});
		*/

		// css ie9以下增强
	//    if(HUI.Ti.ltIE7){
		if($.browser.msie && $.browser.version < 9){
			// 登陆工作台
			HUI.Ti.maxWidth(".s-greet .uName","10em");
		}

		$(".s-greet").removeClass("vh");


		// 文字公告
/*
		$(".h-global-ntce").followSlide({
			nHoldTime    : 300500,
			nAnimateTime : 450,
			bVertical    : true,
			bNumericNavi : false,
			bNavi        : true,
			nViewWidth   : "none",
			nextHTML     : "下一条"
		});
*/

		// 顶部公告
		$(".h-global-ntce").obEventClass({className:"h-global-ntce-hover",only_ie6:true});

		// screen.fontSmoothingEnabled;
		/*
		// 2012.08.26 全站采用Aria+宋体
		try{
			// if(true) $("html").addClass("fontSmoothingDisabled");
			if(false === screen.fontSmoothingEnabled) $("html").addClass("fontSmoothingDisabled");
		}catch(e){}
		*/

		// 共有 头部联系我们
		$(".s-line01").obEventClass({
			className   : "s-line01-active",
			timeHold    : 120,
			timeResume  : 350
		});

		// 店铺搜搜
		$(".s-sMall").each(function(){
			$(this).obEventClass({
				className  : "s-sMall-hover",
				timeHold   : 120,
				timeResume : 350
			});
		});

		dances.queue.execute();
	})

	// 收缩伸展 分类事件
	//		$(".s-classW").obEventClass({className:"show_Sclass"});
	.delegate(".s-classW","mouseenter",function(){
		$(this).addClass("show_Sclass");
	})
	.delegate(".s-classW","mouseleave",function(){
//		$(this).removeClass("show_Sclass");
		this.className = "s-classW";
	})

	// evt delegate
	// 关闭共有分类
	.delegate(".sec-close","click",function(){
		$(this).parents('.s-class-tie').removeClass('current');
		return false;
	})

	// login bridge
	.delegate(".s-greet .s-c-grey4","click",function(){
		HUI.login.show();
		return false;
	})
;


//======================write by shitou,2011-11-03
(function(){
    var hg100=window.hg100={};

    var cart=hg100.cart={};
    cart.url="/async/shoppingcart.aspx";
    cart.getlist=function(callback){
        callback=callback||function(){};
        $.get(cart.url,{action:"get",t:Math.random()},callback);
    };
    cart.add=function(productid,count,size,color,callback){
        callback=callback||function(){};
        $.get(cart.url,{productid:productid,count:count,size:size,color:color,action:"add",t:Math.random()},callback);
    };
    cart.del=function(productid,size,color,callback){
        callback=callback||function(){};
        $.get(cart.url,{productid:productid,size:size,color:color,action:"del",t:Math.random()},callback);
    };
    cart.update=function(productid,count,size,color,callback){
        callback=callback||function(){};
        $.get(cart.url,{productid:productid,count:count,size:size,color:color,action:"update",t:Math.random()},callback);
    }

    var trade=hg100.trade={};
    trade.buynow=function(productid,count,cart){
        hg100.cart.add(productid,count,"","",function(){window.top.location.href=cart;});
    };
    trade.specialPostage=function(postway,pid,cid,callback){
        $.get("/async/trade/postage.aspx",{t:Math.random(),action:"special",postway:postway,pid:pid,cid:cid},callback||function(){});
    }

    var members=hg100.members={};
    members.getmessagecount=function(callback){
        callback=callback||function(){};
        $.get("/async/members.aspx",{action:"unreadmsg",t:Math.random()},callback);
    }
    members.recommendPros=function(callback){
        callback=callback||function(){};
        $.get("/async/members.aspx",{action:"RecommendPros",shopId:$("#hdshopId").val(),t:Math.random()},callback,"json");
    }

    var tools=hg100.tools={};
    tools.addfavorite=function(url,title){
        try{
            window.external.addFavorite(url,title);
        }
        catch(e){
            try{
                window.sidebar.addPanel(title,url, "");
            }
            catch(e){
                alert("加入收藏失败，请使用Ctrl+D进行添加");
            }
        }
    };
})();

//======================write by shitou,2011-11-03

dances.namespace("HUI.Ti");

HUI.Ti.mask=function(options){
    var settings={
        className:"ti_mask",
        zIndex:1050,
        opacity:0.5
    };
    $.extend(settings,options);
    if(!HUI.Ti.mask.mask){
        HUI.Ti.mask.mask=$("<div/>",settings);
        HUI.Ti.mask.mask.hide().css("z-index",settings.zIndex).css("opacity",settings.opacity).appendTo("body");
    }
};
HUI.Ti.mask.show=function(){
    if(!HUI.Ti.mask.mask){ HUI.Ti.mask(); }
    HUI.Ti.mask.mask.show();

};
HUI.Ti.mask.hide=function(){
    if(!HUI.Ti.mask.mask)return ;
    HUI.Ti.mask.mask.hide();
};
HUI.Ti.mask.toggle=function(){
    if(!HUI.Ti.mask.mask){ HUI.Ti.mask(); }
    HUI.Ti.mask.mask.toggle();
};

HUI.Ti.ltIE7 = (function(num){
	num = num || 7;
	var result = false;
	if(document.all && /msie\s*([\d\.]*)/.test(navigator.userAgent.toLowerCase())){
		result = RegExp.$1<num;
	}
	return result;
})();

HUI.Ti.maxWidth = function (dom, size) {
    var $dom = $(dom),
        px_width = parseInt($dom.width()),
        px_size,
        fz
        ;

    // em
    if (size.indexOf("em") > 0) {
        fz = parseInt($dom.css("font-size"));
        px_size = parseInt(size) * fz;
    } else {
        px_size = parseInt(size)
    }

    if(px_width>px_size){
        $dom.css({
            width: px_size,
            overflow: "hidden"
        });
    }
};

dances.namespace("HUI").login = (function(){
	var $mini,
		iframeEl,

		fShowDialog,
		fHideDialog
	;

	fShowDialog = function(){
		var args = Array.prototype.slice.call(arguments, 0),
			src,

			conf,
			redirectSrc,
			selectType
		;

		conf = args.pop();
		if(conf){
			if("object" === typeof conf){
				redirectSrc = conf.redirectSrc;
				// buyer || owner
				selectType = conf.userType;

			}else if("string" === typeof conf){
				redirectSrc = conf;
				conf = {};

			}else{
				conf = {};
			}
		}

		if(!$mini){
			$mini = $(".miniLogin");
			iframeEl = $mini.find("iframe")[0];
		}

		redirectSrc && iframeEl.setAttribute("data-redirect", redirectSrc);
		selectType && iframeEl.setAttribute("data-userType", selectType);

		src = iframeEl.getAttribute("hsrc");

		if(src){
			iframeEl.setAttribute("src", src);
			iframeEl.removeAttribute("hsrc");
		}

		$mini.show();
		HUI.Ti.mask.show();
	};

	fHideDialog = function(){
		$mini.hide();
		HUI.Ti.mask.hide();
	};

	return {
		show :fShowDialog,
		hide :fHideDialog
	}
})();

// eToggle
(function ($) {
	var addClassWrap,
		removeClassWrap,


		detectAdd,
		detectResume,

		addClass_main,
		removeClass_main,

		dualEvent
	;
	if(!jQuery){
		return $;
	}
	$.prototype.eToggle = function (options) {
		var settings = {
				className : "active",

				nTimeHold    : 100,
				nTimeResume  : 100,
				bClearIn     : true, // 鼠标移进再移出 并且 开始状态没有被激活时,清除"开始定时器"函数
				bClearResume : true, // 鼠标移出,后100+毫秒,再移进 并且 激活状态没有消失时,清除"恢复定时器"函数
				evtStart     : "",
				evtResume    : "",
				evtNS        : "eToggle",

				bKeepOne	 : false        // 唯一同名

				// ltIE:9,
				// fnInCallback:,
				// fnResumeCallback:
			},
			$this = this ,
			oneEvt
		;

		$.extend(settings, options);
		oneEvt = settings.evtStart || settings.evtResume;

		// ie 关卡
		if(!isNaN(parseInt(settings.ltIE)) && (!$.browser.msie || $.browser.version > settings.ltIE)){
			return $this;
		}

		// 执行 keepTheOne 唯一同名事件
		if (settings.bKeepOne && oneEvt) {
			$this
				.bind(oneEvt + "." + settings.evtNS,function(){
				// remove 所有选择器的元素
				$this.removeClass(settings.className).filter(this).addClass(settings.className);
			});

			//console.log('执行keep同名事件');
			return $this;
		}

		// 执行常规事件函数
		if (settings.evtResume !== settings.evtStart && settings.evtStart && settings.evtResume) {
			$this
				.bind(settings.evtStart + "." + settings.evtNS,function(){
					addClassWrap(this, settings);
				})
				.bind(settings.evtResume + "." + settings.evtNS,function(){
					removeClassWrap(this,settings);
				})
			;

			//console.log('执行常规事件函数');
			return $this;
		}

		// 事件相同 或 恢复事件为空
		if (oneEvt) {
			// 执行同名事件
			$this.bind(oneEvt + "." + settings.evtNS,function(){
				dualEvent(this, settings);
			});

			//console.log('执行同名事件');
			return $this;

		} else {
			// 执行缺省 (hover)事件 方法

			$this
				.bind("mouseenter" + "." + settings.evtNS,function(){
				addClassWrap(this,settings);
				})
				.bind("mouseleave" + "." + settings.evtNS,function(){
					removeClassWrap(this,settings);
				})
			;

			// console.log('执行缺省事件函数');
			return $this;
		}
	};


	// 增加 className 框架函数
	addClassWrap = function(dom,settings) {

		// 当 bClearResume 为true && 有[删除定时器标识符] , 则清除删除定时器
		//console.log(dom.remove_action);
		if (settings.bClearResume && dom.remove_action) {
			clearTimeout(dom.remove_action);
			dom.remove_action = false;
		}

		// 当有 [className存在标识符],提前结束函数,无需重复添加
		if (dom.hasClassName){
/*
			if(dom.remove_action){
				clearTimeout(dom.remove_action);
				dom.remove_action = null;
			}
*/
			return "no Need";
		}

		// 根据 settings.nTimeHold 执行对应函数
		if (settings.nTimeHold > 0) {
			detectAdd(dom,settings);
			dom.add_action = setTimeout(function () {
				addClass_main(dom,settings);
			},settings.nTimeHold + dom.timeAdd_plus);
		} else {
			addClass_main(dom,settings);
		}
	};

	// 删除 className 框架函数
	removeClassWrap = function(dom,settings){
		// settings.nTimeResume 大于0 毫秒
		if (settings.nTimeResume > 0) {

			// 根据 detectResume 返回值,判断是否提前结束函数
			if (!detectResume(dom,settings)){
				return false;
			}
			dom.remove_action = setTimeout(function () {
				removeClass_main(dom,settings);

				// dom.timeResume_plus 为增量,在(settings.bClearIn === false && settings.nTimeResume < settings.nTimeHold) 激活!
			}, settings.nTimeResume + dom.timeResume_plus);

		} else {
			// settings.nTimeResume 小于0 毫秒
			if (!detectResume(dom,settings)){
				return false;
			}

			// 当_this.timeResume_plus 大于0,则增量被激活,执行 setTimeout函数;否则执行常规 removeClass_main .
			if (0 === dom.timeResume_plus) {
				removeClass_main(dom,settings);
			} else {
				// 偏移量 恢复计时器
				dom.remove_action = setTimeout(function () {
					removeClass_main(dom,settings);
				}, dom.timeResume_plus);
			}
		}
	};

	detectAdd = function(dom,settings){
		dom.timeAdd_plus = 0;
		if(!settings.bClearIn){
			dom.timeAdd_plus = dom.timeResume_plus || 0;
		}
		return true;
	};

	detectResume = function(dom,settings){
		// 增量计时时间初始化.
		dom.timeResume_plus = 0;

		// 1.当settings.clearIn为true ,清除"开始方法的定时器" || 2.判断 是否已增加 className ,若无提前结束剩余函数.
		if(settings.bClearIn && dom.add_action){
			clearTimeout(dom.add_action);
			dom.add_action = false;

			// 返回标志,不必执行 remove_action
			if(!dom.hasClassName){
				return false;
			}
		}

		// 当 clearIn 为 false, timeResume小于timeHold ,增加计时器的设定时间,使eventResume,仍能执行.
		// 因为 clearIn 为 true 时,已清除开始定时器 , 移出鼠标依然恢复了状态
		// 而 clearIn 为 false 时,移出鼠标不会执行清除开始定时器 , 并且在 设定"恢复的时间"小于"激发的时间"会造成元素无法进入恢复状态
		if(!settings.bClearIn){
			dom.timeResume_plus = settings.nTimeHold + dom.timeAdd_plus;
		}

		// 返回标志,执行 remove_action
		return true;
	};

	// 增加 className 单元函数
	addClass_main = function(dom,settings) {
		dom.add_action = false;
		if(dom.hasClassName){
			return false;
		}

		dom.hasClassName = true;
		$(dom).addClass(settings.className);
		if ("function" === typeof settings.fnInCallback){
			settings.fnInCallback();
		}

		//console.log('完成 addCLass');
	};

	// 删除 className 单元函数
	removeClass_main = function(dom,settings) {
		dom.remove_action = false;
		if(!dom.hasClassName){
			return false;
		}

		dom.hasClassName = false;
		$(dom).removeClass(settings.className);
		if ("function" === typeof settings.fnResumeCallback){
			settings.fnResumeCallback();
		}
		//console.log('完成 removeCLass');
	};


	// 同名事件
	dualEvent = function(dom,settings){
		if (dom.dualFag) {
			removeClassWrap(dom,settings);
			dom.dualFag = false;
		} else {
			addClassWrap(dom ,settings);
			dom.dualFag = true;
		}
	};

})(jQuery);

dances.queue
	// Extend UI
	.add(function(){

		$log("common Extend UI");
		require(["dseToggle"], function(_){
			$log(_);

			// 购物车 展开事件
			_(".s-spCar", {
				sClass: "hover-spCar"
			});

			// 搜索
			_(".s-search-uI", {
				sClass : "s-search-input-focus",
				sEvtOn : "focusin",
				sEvtOff: "focusout"
			});

			// 整站顶部下拉菜单
			$(".s-list02").length && _(".s-list02", {
				sClass: "s-list02-active"
			});
		});

	})

	// 购物车
	// 2013.04.16 edit by fiv
	// query carList
	.add(function(){
		var
			$carWrap = $(".s-spCarW"),

			fQuery,

			shoppingCart,
			callArr = []

		;

		shoppingCart = {

			asynFlush : function(){
				hg100.cart.getlist(fQuery);
				return this;
			},

			addCallBack: function(fn){
				"function" === typeof fn && callArr.push(fn);
				return this;
			},

			removeCallBack: function(fn){
				if("function" === typeof fn){
					for(var i = 0, len = callArr.length; i < len; i++){
						if(callArr[i] === fn){
							callArr.splice(1, i);
							break;
						}
					}
				}
				return this;
			}

		};

		fQuery = function(data){
			var num,
				sHtml,
				$detail
			;

			if(data && (num = data.length) > 0){
				sHtml = "";

				$carWrap.find(".s-spCar-empty").addClass("none");
				$carWrap.find(".s-spCar-go2Buy").removeClass("none");

				$detail = $carWrap.find(".s-spCar-list");
				for(var i = 0, len = data.length; i < len; i++){
					sHtml +=
						'<li class="clearfix">' +
							'<a href="product-'+ data[i].productid + '.html" target="_blank" class="img2a s-spCarimg">' +
								'<img src="' + data[i].pictures[0] + '" />' +
							'</a>' +
							'<h4 class="s-spCar-item-title fl">' + data[i].productname + '</h4>' +
							'<div class="fr">' +
								'<span class="s-spCar-price">¥' + data[i].price + '×' + data[i].count + '</span>' +
							'</div>' +
						'</li>';
				}

				$detail.empty().append(sHtml).removeClass("none");
				$carWrap
					.addClass("full")
					.find(".s-spCar-hdr strong").text(num)
				;

			}else{
				$carWrap.find(".s-spCar-empty").removeClass("none");
				$carWrap.find(".s-spCar-list").addClass("none");
				$carWrap.find(".s-spCar-go2Buy").addClass("none");
				$carWrap.removeClass("full");
			}

			if(callArr.length){
				for(i = 0, len = callArr.length; i < len; i++){
					callArr[i](data);
				}
			}

		};

		shoppingCart.asynFlush();

		dances.namespace("HUI").shoppingCart = shoppingCart;

	})

	// keeper message new+ 2012.08.03 by fiv
	.add(function(){
		setTimeout(function(){
//			hg100.members.getmessagecount(function(data){
				var data = 10;
				try{
					data = parseInt(data);
				}catch(e){
				}
				if(data > 0){
					$(
						'<span class="s-item02">'+
							'<div class="s-item02-con">'+
								'<span>你有 '+ data +' 条消息! </span>'+
								'<a href="#" class="s-btn01">'+
									'<span class="s-btn01-wife">查看</span>'+
								'</a>'+
								'<a class="d-unn01" href="#">如何使用?</a>'+
									'<i class="s-item02-redun"></i>'+
							'</div>'+
						'</span>'
					)
					.appendTo(".s-top .w980");

					require(["dseToggle"], function(_){
						_(".s-item02", {
							sClass: "s-item02-current"
						});
					});

				}
//			});
		},1500);
	})

	// 店主等级
	.add(function(){
		$.get("/async/members.aspx", {action: "honorLevel"},
			function(data){
				var
					level,
					nLevelRange,
					nLevelDot,
					$elem,
					nWidth
				;


				level = data.level;
				if("number" === typeof level){

					nLevelRange = Math.floor((level - 1) / 5);

					nLevelDot = level % 5;
					nLevelDot = (0 === nLevelDot) ? 5 : nLevelDot;

					nWidth = nLevelDot * 16;

					$('<span class="s-levalMall">' +
							'<span class="s-levalMall-con s-levalMall-' + nLevelRange + '"></span>' +
					'</span>')

					.attr("title", data.levelInfo)
					.css("width", nWidth)
					.appendTo(".s-line01-hdr")

					;
				}
			}
		);
	})

	.delay()
;
