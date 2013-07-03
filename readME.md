# dances. amd
异步模块加载与定义. .amd 是 dances 核心. 

## 包含模块
+ dances.add
+ dances.define

# dances.add
定位于脚本加载器. 语法极其灵活.  

## syntax

+
	dances
		.add(src[, src1][, srcN][, callback])
	;

+
	dances
		.add(src, callback)
	;

+
	dances
		.add(src)
		.add(callback)
	;

+
	dances
		.add(src)
		.add(callback)
		.add(src2)
		.add(src3)
	;

+
	dances
		.add(src)
		.add(src2)
		.add(src3, src4, src)
		.add(callback)
	;

##

### 解决 模板与子页的依赖

	// 模板页
	dances
		.add(require1, require2, require3)
		.add(function(){
			// do with code
		})
	;

	// 子页
	dances
		// notice "require3" !
		.add(require3)
		.add(require4)
		.add(require5)
	;

# dances.require
定位于精度模块加载管理, 遵循 AMD 机制.

## syntax
	define([id, ][dependencies, ]factory);

### id:
	定义模块名称,
	如果模块名被省略不写,则是一个匿名模块, 模块引用与 它文件路径和文件名有关
	// The AMD loader will give the module an ID based on how it is referenced by other scripts

### dependencies:
定义中模块依赖模块的数组.

+ rule 0:
依赖模块中的模块按照依赖顺序实现, 并且实现的结果应该按照依赖数组中的位置顺序以参数的形式传入(定义中模块的)工厂方法中

+ rule1:
要在 dependencies 中, 使用定义模块中的 "require" | "module" | "exports", 必须显示地使用它们. 本规则遵守 rule 0

+ rule2:
省略 dependencies, factory 的形参默认使用 "require" | "exports" | "module", 而且形参长度以 factory.length 为准,
另外, 形参名字没有要求必须使用 "require" | "exports" | "module" 关键字.

依赖参数是可选的, 如果忽略此参数, 则 factory函数的形参默认为 ["require", "exports", "module"], 如下:
	define(function(require, exports, module){
		// factory
	});

注意: 工厂函数, 并没有定义形参, 则不会传入 ["require", "exports", "module"] 作为参数:
	define(function(){
		// factory
		arguments.length === 0;	// true
	});

然而, 如果工厂方法的长度属性小于3, 加载器会选择以函数的长度属性指定的参数个数调用工厂方法:
	define(function(require){
		// factory
	});

	define(function(require, exports){
		// factory
	});

### factory
工厂函数, 模块的定义.

#### 形参关键字
全称, 工厂函数形参关键字.

是指, 省略依赖时, 默认作为形参的三个对象集合.

+ require
+ exports
+ module

## demo:

### 全体模式
	define("newModuleId", ["module1", "module2", "moduleN"], function(module1, module2, moduleN){
		// Do your asyn define
	});

### 形参定义混入模式
	define("newModuleId", ["require", "module2", "exports"], function(re, module2, exports){
		// Do your asyn define
	});

### 省略 define id
	define([module1, module2, moduleN], function(module1, module2, moduleN){
		// Do your asyn define
	});

### 省略 dependencies
	define("newModule", function(require, exports, module){
		// Do your asyn define
	});

### 混合 dependencies
	define(["moduleA", "require"], function(moduleA, require){
		// factory
	});

### 使用 定义关键字, 作为形参
	define(["exports"], function(exports){
		// factory
	});


### 简易 define
	define("newModule", {});

### 常用
	define(function(require, exports, module){
		// factory
	});

# dances.require
## syntax:
	require(dependencies, applyFactory);

### dependencies
依赖应用模块的数组

### applyFactory
应用工厂方法

### demo

#### 一般模式
	require(["module1", "module2", "module3"], function(module1, module2, module3){
		// 应用工厂方法
	});

#### 使用两个版本jQuery
	require(["jQuery_1.7", "jQuery_1.9"], function($17, $19){

	});

	require(function(require){
		var
			$17 = require("jQuery_1.7"),
			$14 = require("jQuery_1.9")
		;
	});

# dances.require.conf
配置.

## syntax

### 配置基路径
 	require.conf("baseUrl": "");

### 配置模块路径
	require.conf("paths": {
		moduleName: "moduleSrc"
	});

### 配置超时时间
	require.conf("timeout": millisecond);

### 配置垫片
	require.conf("shim": {
		moduleName: {
			deps: [],
			exports: "string" || function(){},
			path: ""
		}
	});

### 多重调用
	require.conf({
		confName: confValue,
		confNameN: confValueN
	});

