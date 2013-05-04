function addcart(buynow)
{
	var sizelist = jQuery("#sizeList dd"),
		colorlist=jQuery("#colorList dd"),
		discolor=jQuery("#colorList .disabled"),
		size = (jQuery("#sizeList .selected").length==0?"":jQuery("#sizeList .selected a").html()),
		color= (jQuery("#colorList .selected").length==0?"":jQuery("#colorList .selected a").html());
	if(sizelist.length>0 && size==""){
		alert("请选择产品规格！");
		return false;
	}
	if((colorlist.length-discolor.length)>0 && color==""){
		alert("请选择产品颜色！");
		return false;
	}
	var stockNum = jQuery("#stocknum").find("font").html();
	if(stockNum=="0" || stockNum == "缺货"){
		alert("该规格产品已没有库存！");
		return false;
	}
	var buycount = ~~($("#buycount").val());
	if(isNaN(buycount) || buycount < 1){
		alert("购买数量只能为整数且大于0！");
		return false;
	}
	if((!isNaN(stockNum) && ~~stockNum < buycount)){
		alert("购买数量已超过产品库存量！");
		return false;
	}

	// TODO check issue services return negative
	if(10000 < buycount){
		alert("购买数量已超过产品库存量！");
		return false;
	}

	hg100.cart.add(
	    $("#hide_productid").val(),
		buycount,size,color,
		function(data){
			if(data.status == "success"){
				if(buynow){
					window.top.location.href=data.cart;
				}else{
					var yDefaultBox=$('.DefaultBox').offset().top,xDefaultBox=$('.DefaultBox').offset().left;
					var poperTop = inputTop = $(".d-wrap03-ftr span").eq(1).offset().top-$(".layBox").outerHeight()-5-yDefaultBox;
					var poperLeft = $(".d-wrap03-ftr span").eq(1).offset().left-($(".layBox").outerWidth()/2)+($(".d-wrap03-ftr span").eq(1).outerWidth()/2)-xDefaultBox;
					var layBox = $(".layBox").css({	"top":poperTop,	"left":poperLeft});
					layBox.find("#count").text(data.count);
					layBox.find("#amount").text((data.amount - 0).toFixed(1));
					layBox.show();
				}
			}else{
				if(data.message == "needLogin"){
					alert("当前操作需要登录！");
					$(".s-c-grey4").click();

				}else if("lowMinCount" === data.flag){
					alert("低于最低起售数量\n请重试.");
					document.getElementById("buycount").value = document.getElementById("buycount").getAttribute("min-count");

				}else{
					alert(data.message);
				}
			}
		});
	return false;
}

$(document)

	// 购物车关闭按钮 很遗憾.. 这样的模式
	// TODO 优化购物车窗体组建
	.delegate(".POP_E-close","click",function(){
		$(this).parents(".layBox").hide();
	})

	// 起售 焦点
	.delegate(".stockInfo01-con","click",(function(){
		var $input;
		return function(){
			$input = $input || $(this).find(".stockInfo01-input");
			$input.focus();
			return false;
		}
	})())

	// 起售 输入
	.delegate(".stockInfo01-input","keyup",(function(){
		var valEl,
			$showEl,
			orgVal
		;
		return function(){
			if(!valEl){
				valEl = valEl || document.getElementById("buycount");
				$showEl = $showEl || $(".j_c_totalBuyCount");
				orgVal = ($(".stockInfo01-org").text() || 0) * 1;
			}

			var v = this.value;

			if(/^\d*$/.test(v)){
				valEl.value = orgVal + v * 1;
				$showEl.text(orgVal + v * 1);
			}
			return false;
		}
	})())
	.delegate(".stockInfo01-input","change",function(){
		var v = this.value;
		if(v){
			v = v.replace(/\s*/g, "");

			if(/^\d+$/.test(v)){
			}else{
				alert("请输入大于0的数字");
				this.focus();
			}
		}else{
			this.value = 0;
		}
	})
	.delegate(".h-dBuy","click",function(){
	    addcart(true);
	})
	.delegate(".h-inCar","click",function(){
	    addcart(false);
	})

;

// jquery exposition extension
(function($){
    $.prototype.exPosition = function(fathers){
        if(!fathers)return [false,0];
        if("string" == typeof fathers){
            fathers = $(fathers);
        }else if("object" == typeof fathers && fathers.nodeName && fathers.nodeType){
            fathers = $(fathers);
        }

        var finlOffset=false,
            tem={}
            ;

        if(this.hasParents(fathers)[0]){
            finlOffset={};
            tem.c_offset = this.offset();
            tem.f_offset = fathers.offset();
            finlOffset.top = parseInt(tem.c_offset.top) - parseInt(tem.f_offset.top) ;
            finlOffset.left = parseInt(tem.c_offset.left) - parseInt(tem.f_offset.left);
        }
        return finlOffset;
    };

    $.prototype.hasParents = function(fathers){
        if(!fathers)return [false,0];
        if("string" == typeof fathers){
            fathers = $(fathers);
        }else if("object" == typeof fathers && fathers.nodeName && fathers.nodeType){
            fathers = $(fathers);
        }
        var aResult = [false,0],
            fathers = fathers[0],
            i=0,
            child=this[0]
            ;

        try{
            do{
                child = child.parentNode;
                if(child == fathers){
                    aResult = [true,i++];
                    break;
                }
            }while("html" != child.tagName.toLowerCase());
        }catch(e){
            return [false,0];
        }
        fathers = null;
        child = null;
        return aResult;
    };
})(jQuery);

dances.queue
	// UI extend
	.add(function(){
		var $ = window.jQuery;

		// 尺寸/颜色 添加 selected 冗余 i
		$(".sizeList dd, .colorList dd").each(function(){
			var iEl = document.createElement("i");
			this.appendChild(iEl);
		});

		// .first 商品侧边栏
		$(".d-list02 li").first().addClass("first");

		// "我要买,界面设计需要"
		$(".stockbox").obEventClass({
			className:"stockbox-hover",
			only_ie6:true
		});
	})

	// 活动促销
	.add(function(){
		var $root = $(".d-cox01"),
			$lis,

			nDocWidth
		;
		if(0 === $root.length){
			return ;
		}

		nDocWidth = window.storageHG && window.storageHG.max1220 ? 1220 : 980;
		// 嗅探并修正 活动促销内容溢出的区域
		$root.each(function(){
			var $this = $(this),
				offLeft = $this.exPosition(".s-main").left,
				offWidth = $this.outerWidth(),
				exOff = nDocWidth - offLeft - offWidth
			;
			if(exOff < 0){
				$this.css({
					left : exOff
				});
			}
		});

		// 绑定展示 促销 内容
		$lis = $(".d-line02-con li").obEventClass({
			className:"active"
		});

		$(".d-line02-con")
			.delegate(".d-cox01-close","click",function(){
				$lis.removeClass("active");
			})
		;
	})

	// 获取提货方式 相关产品
	.add(function(){
	//	return false;
		var sID = $(".product-number").text();
		if(!sID){
			return "not ready";
		}
	/*	$.get("/sCenter/async/AssociatedInfo.aspx",{
			action : getfromCache,
			assNum : sID
		},function(data){*/
			// 模拟数据
		var data = [
			{"AssNum" : "62beb2aa153340cdac7c850154e4c2fe","CreateOn" : "\/Date(1347416528171)\/","AssType" : 0,"Asses" : [
				{"ProId" : 182238,"ProNum" : "HG001-1004569856","ProName" : "苏泽尔嘻哈潮流休闲情侣棉","ImgUrl" : "http://www.huihui168.com/ProductPics2/201208/182238/small/waterpred579a376-5591-40c8-b989-7c6606706a37_90X90.jpg"},
				{"ProId" : 172267,"ProNum" : "HG001-652326","ProName" : "天语（K-touch）大黄蜂 W806 3G手机（黑色）WCDMA/GSM  YGP  (成都发货）","ImgUrl" : "http://www.huihui168.com/ProductPics2/201207/172267/small/waterd7052c1ee9b74c678ce2e19231008dff_90X90.jpg"}
			]},
			{"AssNum" : "9e86446e218042eead42e8e0a78f47a0","CreateOn" : "\/Date(1347530222727)\/","AssType" : 0,"Asses" : [
				{"ProId" : 178289,"ProNum" : "XTR-120725007","ProName" : "新品上架！抢购价203元 karicare 可瑞佳金装婴儿1段配方奶粉 900g “我是纽宝”新西兰原装进口！（成都发货）","ImgUrl" : "http://www.huihui168.com/ProductPics2/201208/178289/small/waterpree9c54ef8-b192-4c9f-b182-5b1e68968746_90X90.jpg"},
				{"ProId" : 172267,"ProNum" : "HG001-652326","ProName" : "天语（K-touch）大黄蜂 W806 3G手机（黑色）WCDMA/GSM  YGP  (成都发货）","ImgUrl" : "http://www.huihui168.com/ProductPics2/201207/172267/small/waterd7052c1ee9b74c678ce2e19231008dff_90X90.jpg"},
				{"ProId" : 182238,"ProNum" : "HG001-1004569856","ProName" : "苏泽尔嘻哈潮流休闲情侣棉质家居服睡衣套装84021/74021 女款（成都发货）","ImgUrl" : "http://www.huihui168.com/ProductPics2/201208/182238/small/waterpred579a376-5591-40c8-b989-7c6606706a37_90X90.jpg"}
			]},
			{"AssNum" : "9679d35b23394bbc904ffd452f63b6b1","CreateOn" : "\/Date(1347530317838)\/","AssType" : 1,"Asses" : [
				{"ProId" : 182238,"ProNum" : "HG001-1004569856","ProName" : "苏泽尔嘻哈潮流休闲情侣棉质家居服睡衣套装84021/74021 女款（成都发货）","ImgUrl" : "http://www.huihui168.com/ProductPics2/201208/182238/small/waterpred579a376-5591-40c8-b989-7c6606706a37_90X90.jpg"},
				{"ProId" : 172267,"ProNum" : "HG001-652326","ProName" : "天语（K-touch）大黄蜂 W806 3G手机（黑色）WCDMA/GSM  YGP  (成都发货）","ImgUrl" : "http://www.huihui168.com/ProductPics2/201207/172267/small/waterd7052c1ee9b74c678ce2e19231008dff_90X90.jpg"}
			]},
			{"AssNum" : "37c4c59c85134c3fb8aae48541bd4ce4","CreateOn" : "\/Date(1347591186907)\/","AssType" : 0,"Asses" : [
				{"ProId" : 117543,"ProNum" : "TC-20505","ProName" : "葛根粉600克= 20g×5×6/条（成都发货）","ImgUrl" : "http://www.huihui168.com/ProductPics2/201205/117543/small/waterpre47e38cb2-157a-40c7-a289-66f16772b802_90X90.jpg"},
				{"ProId" : 182238,"ProNum" : "HG001-1004569856","ProName" : "苏泽尔嘻哈潮流休闲情侣棉质家居服睡衣套装84021/74021 女款（成都发货）","ImgUrl" : "http://www.huihui168.com/ProductPics2/201208/182238/small/waterpred579a376-5591-40c8-b989-7c6606706a37_90X90.jpg"},
				{"ProId" : 172267,"ProNum" : "HG001-652326","ProName" : "天语（K-touch）大黄蜂 W806 3G手机（黑色）WCDMA/GSM  YGP  (成都发货）","ImgUrl" : "http://www.huihui168.com/ProductPics2/201207/172267/small/waterd7052c1ee9b74c678ce2e19231008dff_90X90.jpg"}
			]},
			{"AssNum" : "92a5901859ef4209b24668ba18d3e939","CreateOn" : "\/Date(1347591225128)\/","AssType" : 1,"Asses" : [
				{"ProId" : 117543,"ProNum" : "TC-20505","ProName" : "葛根粉600克= 20g×5×6/条（成都发货）","ImgUrl" : "http://www.huihui168.com/ProductPics2/201205/117543/small/waterpre47e38cb2-157a-40c7-a289-66f16772b802_90X90.jpg"},
				{"ProId" : 182238,"ProNum" : "HG001-1004569856","ProName" : "苏泽尔嘻哈潮流休闲情侣棉质家居服睡衣套装84021/74021 女款（成都发货）","ImgUrl" : "http://www.huihui168.com/ProductPics2/201208/182238/small/waterpred579a376-5591-40c8-b989-7c6606706a37_90X90.jpg"},
				{"ProId" : 172267,"ProNum" : "HG001-652326","ProName" : "天语（K-touch）大黄蜂 W806 3G手机（黑色）WCDMA/GSM  YGP  (成都发货）","ImgUrl" : "http://www.huihui168.com/ProductPics2/201207/172267/small/waterd7052c1ee9b74c678ce2e19231008dff_90X90.jpg"}
			]},
			{"AssNum" : "df68d7a4f2b4402cad6b8c6651322a45","CreateOn" : "\/Date(1347596707365)\/","AssType" : 0,"Asses" : [
				{"ProId" : 176912,"ProNum" : "HG001-362250","ProName" : "Guerlain娇兰金钻柔滑保湿粉底液（深米色）spf20 30ML (成都发货)","ImgUrl" : "http://www.huihui168.com/ProductPics2/201208/176912/small/waterpre59df1c4c-59bb-4c99-985b-4d73d9437ff4_90X90.jpg"},
				{"ProId" : 172267,"ProNum" : "HG001-652326","ProName" : "天语（K-touch）大黄蜂 W806 3G手机（黑色）WCDMA/GSM  YGP  (成都发货）","ImgUrl" : "http://www.huihui168.com/ProductPics2/201207/172267/small/waterd7052c1ee9b74c678ce2e19231008dff_90X90.jpg"}
			]},
			{"AssNum" : "b63593e619b648a6b1889b6526990a38","CreateOn" : "\/Date(1347596718239)\/","AssType" : 1,"Asses" : [
				{"ProId" : 176912,"ProNum" : "HG001-362250","ProName" : "Guerlain娇兰金钻柔滑保湿粉底液（深米色）spf20 30ML (成都发货)","ImgUrl" : "http://www.huihui168.com/ProductPics2/201208/176912/small/waterpre59df1c4c-59bb-4c99-985b-4d73d9437ff4_90X90.jpg"},
				{"ProId" : 172267,"ProNum" : "HG001-652326","ProName" : "天语（K-touch）大黄蜂 W806 3G手机（黑色）WCDMA/GSM  YGP  (成都发货）","ImgUrl" : "http://www.huihui168.com/ProductPics2/201207/172267/small/waterd7052c1ee9b74c678ce2e19231008dff_90X90.jpg"},
				{"ProId" : 172267,"ProNum" : "HG001-652326-1","ProName" : "天语（K-touch）大黄蜂 W806 3G手机（黑色）WCDMA/GSM  YGP  (成都发货）","ImgUrl" : "http://www.huihui168.com/ProductPics2/201207/172267/small/waterd7052c1ee9b74c678ce2e19231008dff_90X90.jpg"},
				{"ProId" : 172267,"ProNum" : "HG001-652326-2","ProName" : "天语（K-touch）大黄蜂 W806 3G手机（黑色）WCDMA/GSM  YGP  (成都发货）","ImgUrl" : "http://www.huihui168.com/ProductPics2/201207/172267/small/waterd7052c1ee9b74c678ce2e19231008dff_90X90.jpg"}
			]}
		];

			var num,
				item,

				deliArr = [],
				recArr = [],

				filterFn
			;

			if(!data || !(num = data.length) || (--num) < 0){
				return "no nedd";
			}

			do{
				item = data[num];
				switch (item.AssType){
					// 提货方式
					case 0:
						deliArr = deliArr.concat(item.Asses);
						break;

					// 推荐
					case 1:
						recArr = recArr.concat(item.Asses);
						break;
				}
			}while(--num > -1);

			if(deliArr.length > 0 || recArr.length > 0){
				// 过滤
				filterFn = function(data){
					var newArr = [],
						_pigeon = {},
						num = data.length - 1,
						item
					;
					if(num < 0){
						return false;
					}
					do{
						item = data[num];

						if(!_pigeon[item.ProNum]){
							_pigeon[item.ProNum] = true;
							newArr.push(item)
						}

					}while(--num > -1);
					return newArr;
				};
				deliArr = filterFn(deliArr);
				recArr = filterFn(recArr);
			}

			// 输出 提货方式
			(function(data){
				var sHTML = '',

					currentGoodsNum = $(".product-number").text(),

					num,
					i,
					item,
					itemName,
					bSame

				;
				if(!data || (num = data.length) < 1){
					return "no nedd";
				}
				i = 0;

				do{
					item = data[i];
					/*if(item.ProNum === sID){
						continue;
					}*/
					itemName = item.ProName;
					if(itemName.replace(/[^\x00-\xff]/g,"ds").length > 15){
						itemName = itemName.substring(0,30);
					}

					bSame = currentGoodsNum === item.ProNum;

					sHTML +=
						'<li ' + (bSame ? "class=\"active\"" : "") + '>' +
							' <a href="' + (bSame ? "javascript:void(0)" : "product-" + item.ProId + ".html") + '" target="_blank" ' + (bSame ? "onclick=\"return false;\"" : "") + '>' +
								itemName +
							'</a> ' +
						'</li>';

				}while(++i < num);

				$(".d-list01 ul")
					.empty()
					.append(sHTML)
					.parent()
					.removeClass("none")
				;

			})(deliArr);

			// 输出 推荐
			(function(data){
				var sHTML = '',

					num,
					i,
					item,
					itemName
				;
				if(!data || (num = data.length) < 1){
					return "no nedd";
				}
				sHTML =
						'<div class="d-list03 r-cox01 mb10">' +
							' <div class="d-list03-hdr r-cox01-hdr posr">' +
								' <b>你可能感兴趣的</b> ' +
								'<i class="h r-cox01-hdr-sub"></i> ' +
							'</div>'+
							'<div class="d-list03-con r-cox01-con bc"> ' +
								'<ul>'
				;
				i = 0;

				do{
					item = data[i];
					if(item.ProNum === sID){
						continue;
					}
					itemName = item.ProName;
					if(itemName.replace(/[^\x00-\xff]/g,"ds").length > 15){
						itemName = itemName.substring(0,30);
					}

					sHTML +=
						'<li> ' +
							'<figure>' +
								'<a href="product-' + item.ProId + '.html" class="img2a" target="_blank">' +
									' <img src="' + item.ImgUrl + '" alt="' + itemName + '"> ' +
								'</a>' +
							'</figure>' +
							'<figcaption>' +
								' <a href="product-' + item.ProId + '.html" target="_blank">' +
										itemName +
								'</a>' +
							'</figcaption>' +
						'</li>'
					;

				}while(++i < num);

				sHTML +=
						'</ul>' +
					'</div>'+
				'</div>'
				;

				$(sHTML)
					.prependTo($(".d-wrap04").eq(0).addClass("d-wrap04-Associate"))
				;

			})(recArr);

	})

	// 根据名称添加 库存查询
	.add(function(){
		function addSearchStock(str, nIM, sAddInfo){
			var sHtml;
			if(!str || "string" !== typeof str){
				return ;
			}
			if($(".d-wrap03-hdr h3").text().indexOf(str) > -1){
				sHtml =
					'<div class="stockInfo clearfix">' +
						'<dl>' +
							'<dt>库存查询:</dt>' +
						'	<dd>' +
								'<a href="http://wpa.qq.com/msgrd?v=3&uin=' + nIM + '&site=qq&menu=yes" target="_blank">' +
									'<img class="vam" src="http://wpa.qq.com/pa?p=2:' + nIM + ':41">' +
								'</a>' +
								(sAddInfo ? '<span class="ml5 vam">' + sAddInfo + '</span>' : "") +
							'</dd>' +
						'</dl>' +
					'</div>'
				;
				$(sHtml).insertAfter("#stockInfo");
			}
		}

	//	addSearchStock("特步", 1138382933, "特步产品下单购买请点击咨询此QQ确认库存");
})

	// 收藏
	.add(function(){
		var
			fav,
			request,

			$flagEl,
			$bubble,
			$bubbleLink,

			handling = false
		;

		request = function(opts){

			var
				id = document.getElementById("hide_productid")
			;

			id = id && id.value;

			if(!id){
				alert("数据错误,请刷新界面");
			}

			// keep async
			if(handling){
				return ;
			}
			handling = true;

			$.post("/index_v1_2/Ajax_Collection.aspx", {
				action   : opts.actionType,
				productId: id

			}, function(data){
				handling = false;

				data = data || {};

				if(1 === data.type){
					"function" === typeof opts.success && opts.success(data);

				}else if(0 === data.type){
					"function" === typeof opts.fail && opts.fail(data);

				}else{
					alert("服务器返回值不正确");
				}

				"function" === typeof opts.complete && opts.complete(data);

			});

		};

		fav = {
			add: function(){

				request({
					actionType: "add",

					success: function(data){
						if(!$bubbleLink){

							$bubbleLink = $bubble.find("a");

							// /mCenter/ProductCollection.aspx?fr=fr
							if("owner" === data.uType){
								$bubbleLink.attr("href", "/mCenter/ProductCollection.aspx?fr=fr");

							}else if("buyer" === data.uType){
								$bubbleLink.attr("href", "http://consumer.www.100hg.com/ConsumerColletion.aspx");

							}else{
								$bubbleLink.remove();
							}
						}

						$bubble.removeClass("none");
						$flagEl
							.addClass("i-1616-starRed")
							.removeClass("i-1616-starGray")
						;

						setTimeout(function(){
							$bubble.fadeOut(1500, function(){
								$bubble.addClass("none").removeAttr("style");
							});
						}, 5500);

					},

					fail: function(data){
						// TODO alertHD
						alert(data.msg || "添加失败");

						5 === data.errorType && HUI.login.show();
					}

				});

			},

			remove: function(){
				$bubble.addClass("none");

				request({
					actionType: "remove",

					success: function(){
						$flagEl
							.addClass("i-1616-starGray")
							.removeClass("i-1616-starRed")
						;
					},

					fail: function(data){
						alert(data.msg || "操作失败");

						5 === data.errorType && HUI.login.show();
					}

				});
			}

		};

		$(".r-statusBtn-sub")

			.add(".r-statusBtn-main")

			.bind("click", function(){
				if(!$flagEl){
					$flagEl = $(".r-statusBtn-sub i");
					$bubble = $(".r-bubble");
				}

				if($flagEl.hasClass("i-1616-starRed")){
					fav.remove();

				}else{
					fav.add();
				}

				return false;

			})
		;
	})

	// 商品信息 购物车
	.add(function(){
		$(".d-cox02 .r-cox01-hdr").one("mouseenter", function(){
			$(".d-list04-redun").css({
				width: $(".d-list04-hdr").outerWidth() - 2
			});
		});

		$log("商品信息 购物车");
		require(["dseToggle"], function(_){

			$log(_, "商品信息 购物车_dseToggle");
			_(".d-list04", {
				sClass: "d-list04-active"
			});

			_(".d-cox04", {
				sClass: "d-cox04-active"
			});
		});

	})

	.add(function(){
		define.amd.dsPin = true;

		require(["http://fed.www.100hg.com/js/dances/dances.pin_1.0"], function(_){
			_(".j_test01", {

				inCallback: function(){

				},

				outCallback: function(){

				},

				onCal: function(){

				}
			})

		});


	})

;

