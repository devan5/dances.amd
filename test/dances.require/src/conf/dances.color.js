/*~~~~~~~~
with dances

	toolsName:color

	version:1.0

	firstDate:2012.07.16

	lastDate:2012.07.16

	effect:[
		+.实现 GRB <==> HEX ,
		+.{effects}
	];

	log:{
		"v1.0":[
			+.{logs},
			+.{logs}
		]
	}

~~~~~~~~*/

// 命名扩展
if ("object" !== typeof window.dances){
	window.dances = {};
	if(window.console){
		window.$log = window.console.log;
	}
}

dances.color = (function(){
	var Main,
		rgbREG = /rgb\(*(\d{1,3})\,(\d{1,3})\,(\d{1,3})\)?$/,
		hexREG = /^#?([0-9a-f]{3}$|[0-9a-f]{6}$)/,

		toRGB,
		toHEX
	;

	toRGB = function(str){
		var matched = str.match(rgbREG),
			i,
			num,
			itemExpect
		;
		if(matched){
			str = "#";
			i = 1;
			num = matched.length;

			do{
				itemExpect = parseInt(matched[i]).toString(16);
				if(1 === itemExpect.length){
					itemExpect += itemExpect;
				}
				str += itemExpect;

			}while(++i < num);

		}
		return str;
	};

	toHEX = function(str){
		var matched = str.match(hexREG),
			expect,
			itemExpect,

			bThr,
			num
		;
		if(matched){
			expect = [];
			matched = matched[1];
			bThr = 3 === matched.length;
			num = bThr ? 1 : 2;

			while(matched){
				itemExpect = "0x" + matched.substring(0,num);
				if(itemExpect){
					expect.push(parseInt((bThr ? itemExpect + itemExpect : itemExpect)));
					matched = matched.substring(num);
				}else{
					break;
				}
			}
			expect = "rgb(" + expect.join(", ") + ")";
		}

		return expect || str;
	};

	Main = function(v){
		if("string" !== typeof v){
			return v;
		}
		v = v.replace(/\s+/g,"");
		if(!v){
			return v;
		}
		v = v.toLowerCase();

		// RGB
		if(v.indexOf("rgb") > -1){
			v = toRGB(v);

		// HEX
		}else {
			v = toHEX(v);
		}

		return v;
	};
	Main.toRGB = toRGB;
	Main.toHEX = toHEX;
	return Main;
})();