
import { jmProperty } from "jmgraph/src/common/jmProperty.js";
import jmGraph from "jmgraph/src/jmGraph.js";

import defaultStyle from "./defaultStyle.js";

/**
 * jm流程图编辑器
 * 继承jmProperty
 * option参数:connectable=是否可连线，enabled=是否可编辑
 *
 * @class jmDraw
 * @param {object} option 流程图参数
 * @param {function} callback 初始化后的回调
 */
class jmDraw extends jmProperty {
	constructor(option) {
		super();
		this.init(option);
	}

	init(option) {
		if(typeof option.container === 'string') {
			option.container = document.getElementById(option.container);
		} 
		this.option = option;
		/**
		 * 当前所有样式集合
		 *
		 * @property styles
		 * @type object
		 */
		this.styles = {};

		//是否可编辑
		if(typeof option.enabled === 'undefined') option.enabled = true;
		this.enabled = option.enabled;
		
		this.movable = option.movable === false? false: true;

		this.shapeTypes = {};

		if(option.container.tagName != 'CANVAS') {
			this.container = document.createElement('div');
			this.container.style.position = 'relative';
			this.container.style.padding = '0';
			this.container.style.margin = '0';
			this.container.style.width = '100%';
			this.container.style.height = '100%';
			option.container.appendChild(this.container);
		}			
		else {
			this.container = option.container.parentElement;
			canvas = option.container;
		}

		/**
		 * 画图组件jmGraph实例
		 * @property graph
		 * @type jmGraph
		 */
		this.graph = jmGraph.create(canvas, this.option);

		/**
		 * 当前画布所有节点元素
		 *
		 * @property cells
		 * @type list
		 */
		this.cells = new this.graph.util.list();

		/**
		 * 当前画布所有连线集合
		 *
		 * @property connects
		 * @type list
		 */
		this.connects = new this.graph.util.list();

		//生成框选对象
		this.selectRect = this.graph.createShape('rect', {
			style: defaultStyle.selectRect
		});	
		this.selectRect.visible = false;
		this.graph.children.add(this.selectRect);		
		//this.graph.registerShape('cellConnectLine',jmConnectLine);		
		this.initEvents();//绑定基础事件

		this.graph.autoRefresh();//自动刷新
	}

	/**
	 * 是否可编辑
	 * @property enabled
	 * @type {boolean}
	 */
	get enabled() {
		return this.__pro('enabled');
	}
	set enabled(v) {
		return this.__pro('enabled', v);
	}

	/**
	 * 是否移动节点
	 *
	 * @property movable
	 * @type boolean
	 */
	get movable() {
		return this.__pro('movable');
	}
	set movable(v) {
		return this.__pro('movable', v);
	}

	/**
	 * 添加元素节点,并监听其选择事件
	 *
	 * @method addCell
	 * @param {string} shapeType 图型类型名
	 * @param {object} option 元素参数，主要为jmcell的参数
	 */
	addCell(shapeType, option) {			
		var st = this.shapeTypes[shapeType];
		if(!st) {
			console.error && console.error(shapeType+' 图形不存在');
			return;
		}

		option = option || {};
		option.graph = this.graph;
		option.editor = this;
		if(!this.enabled || this.option.resizable === false) {
			option.resizable = false;
		}
		//如果有指定默认大小，则采用
		if(st.defaultSize) {
			if(!option.width && st.defaultSize.width) option.width = st.defaultSize.width;
			if(!option.height && st.defaultSize.height) option.height = st.defaultSize.height;
		}

		var cell = new st(option);
		//如果已设定校验节点，则需通过校验才可添加
		if(this.validCell && !this.validCell(cell)) {
			return;
		}

		//监控对象选择事件
		cell.on('select',function(e) {
			this.editor.emit('select', this, e);
		});
		//监听移动事件,如果移动且当前选择了其它节点，则一同移动
		cell.on('move',function(e) {
			//如果事件传递则处理所有已选节点位置
			if(e.trans === true) {			
				var cells = _this.getSelectedCells();
				for(var i = 0; i < cells.length; i++) {
					if(cells[i] != this) {
						cells[i].offset(e.offsetX, e.offsetY, false);//移动但不传递 事件
					}			
				}	
			}
			this.editor.resize(this);			
		});
		
		cell.id = option.id || this.maxId();
		this.cells.add(cell);
		cell.add();
		this.resize(cell);
		return cell;
	}

	/**
	 * 获取当前流程中最大ID, 并自加1
	 *
	 * @method maxId
	 * @return {int} 当前编辑器中的最大ID加1
	 */
	maxId() {
		let id = 0;
		this.cells.each(function(i,cell) {
			id = Math.max(cell.id,id);
		});
		this.connects.each(function(i,cn) {
			id = Math.max(cn.id,id);
		});
		return id + 1;
	}

	/**
	 * 初始化编辑器的基础事件
	 *
	 * @method initEvents
	 * @for jmDraw
	 * @private
	 */
	initEvents() {
		let self = this;
		//编辑器开始框选
		this.graph.bind('mousedown',function(evt) {
			var _this = self;		
			if(evt.button == 0 || evt.button == 1) {
				_this.selectAll(false);
				_this.selecting = true;//开始框选
				_this.selectRect.position = {x:evt.position.offsetX,y:evt.position.offsetY};
				_this.selectRect.width = 1;
				_this.selectRect.height=1;
				_this.selectRect.location = null;//重置坐标点，防止短暂出现原方框的问题
				return false;
			}		
		});
		//编辑器框选中
		this.graph.bind('mousemove',function(evt) {
			var _this = self;
			if(_this.selecting) {
				//改变框选控件大小
				var p = _this.selectRect.position;
				var w = evt.position.offsetX - p.x;
				var h = evt.position.offsetY - p.y;
				_this.selectRect.width = w;
				_this.selectRect.height = h;
				_this.selectRect.visible = true;
				return false;
			}
		});

		//鼠标移动事件，
		//有拖出组件时，移动组件
		this.graph.util.bindEvent(document, 'mousemove', function(evt) {
			var _this = self;
			if(_this.currentComponent) {
				evt = evt || event;
				var evtpos = jmUtils.getEventPosition(evt || event);
				var dx = evtpos.pageX - _this.currentComponent.evtX;
				var dy = evtpos.pageY - _this.currentComponent.evtY;
				
				_this.currentComponent.left += dx;
				_this.currentComponent.top += dy;
				_this.currentComponent.img.style.left = _this.currentComponent.left + 'px';
				_this.currentComponent.img.style.top = _this.currentComponent.top + 'px';
				_this.currentComponent.evtX = evtpos.pageX;
				_this.currentComponent.evtY = evtpos.pageY;	
				return false;		
			}		
		});
		//松开鼠标
		//当有组件时，定位组件
		this.graph.util.bindEvent(document, 'mouseup', function(evt) {
			var _this = self;
			//当有拖放组件时，生成组件元素
			if(_this.currentComponent) {
				evt = evt || event;
				var pos = jmUtils.getElementPosition(_this.graph.canvas);
				var evtpos = jmUtils.getEventPosition(evt);
				if(evtpos.pageX >= pos.left && evtpos.pageX <= pos.left + _this.graph.canvas.width &&
					evtpos.pageY >= pos.top && evtpos.pageY <= pos.top + _this.graph.canvas.height) {
					var componentindex = _this.currentComponent.img.getAttribute('data-component');
					var option = _this.components[componentindex];
					//中心定位到当前鼠标位置				
					var left = evtpos.pageX - pos.left;
					var top = evtpos.pageY - pos.top;
					if(option.width) {
						left -= option.width / 2;
					}
					if(option.height) {
						top -= option.height / 2;
					}
					if(typeof option === 'function') {
						option.call(_this,{x:left,y:top});
					}
					else {
						option = jmUtils.clone(option);				
						option.position = {x:left,y:top};
						_this.addCell(option);
					}				
					_this.save();//当手动添加元素时。保存缓存
				}			
				document.body.removeChild(_this.currentComponent.img);
				_this.currentComponent = null;
				return false;
			}	

			//如果正在框选则结束处理
			if(_this.selecting) {
				_this.selectRect.visible = false;
				_this.selecting = false;
				//计算选框的对角线位置
				var p = _this.selectRect.position;
				var endp = {x:p.x + _this.selectRect.width,y:p.y + _this.selectRect.height};
				_this.cells.each(function(i,cell) {
					var cp = cell.position?cell.position:(cell.center?cell.center:{x:0,y:0});
					//如果节点的中心或位置点在框内。则选中
					if(cp.x >= Math.min(p.x,endp.x) && cp.x <= Math.max(p.x,endp.x) &&
						cp.y >= Math.min(p.y,endp.y) && cp.y <= Math.max(p.y,endp.y)) {
						cell.select(true);
					}
				});
			}	
		});

		/**
		 * 绑定当前编辑器按健事件
		 */
		this.graph.bind('keydown',function(evt) {
			var code = evt.keyCode;	
			var _this = self;	
			switch(code) {
				case 46: {//按下delete健
					if(_this.isEnabled()) {
						var changed = false;
						var cells = _this.getSelectedCells();
						if(cells && cells.length > 0) {
							_this.remove(cells);
							changed = true;							
						}	
						//删除选择的连线				
						_this.connects.each(function(i,conn) {
							if(conn.selected) {
								conn.remove();
								changed = true;
							}
						},true);			
						if(changed) {
							_this.save();	
							return false;
						}
					}				
					break;
				}
				case 97:
				case 65: {
				//按下A健//如果同时按下了ctrl健，则全选
					if(evt.ctrlKey) {
						_this.selectAll(true);
						_this.emit('select',_this,true);
						return false;
					}
					break;
				}
				case 37: { // 向左
					if(_this.movable) {
						var cells = _this.getSelectedCells();
						_this.moveCells(cells,-1,0);
						return false;
					}				
					break;
				}
				case 38: { //向上
					if(_this.movable) {
						var cells = _this.getSelectedCells();
						_this.moveCells(cells,0,-1);
						return false;
					}
					break;
				}
				case 39: { //向右
					if(_this.movable) {
						var cells = _this.getSelectedCells();
						_this.moveCells(cells,1,0);
						return false;
					}
					break;
				}
				case 40: { //向下
					if(_this.movable) {
						var cells = _this.getSelectedCells();
						_this.moveCells(cells,0,1);
						return false;
					}
					break;
				}
			}		
		});
	}

	/**
	 * 选择所有元素
	 * 
	 * @method selectAll
	 * @for jmDraw
	 * @param {boolean} true=选择所有元素，false=取消所有元素的选择
	 * @param {int} 选择或消选所排除的id
	 */
	selectAll(b, exid) {
		this.cells.each(function(i,cell) {
			//如果为排除元素则不改变它的状态
			if(exid && cell.id == exid) return;
			cell.select(b);
		});
		//所有连线处理
		this.connects.each(function(i,conn) {
			conn.select(b == true);
		});
	}

	/**
	 * 通过id获取元素
	 *
	 * @method getCell
	 * @param {int} id 需要获取的元素id
	 * @return {jmCell} 元素对象
	 */
	getCell(id) {
		return this.cells.get(function(c) {
			return c.id == id;
		});
	}

	/**
	 * 获取所有元素的数组
	 *
	 * @method getCells
	 * @return {Array}
	 */
	getCells() {
		return this.cells.items;
	}

	/**
	 * 获取当前已选中的节点
	 *
	 * @method getSelectedCells
	 * @return {array} 所有已选择的元素数组 
	 */
	getSelectedCells() {
		var cells = [];
		this.cells.each(function(i,c) {
			if(c.selected) {
				cells.push(c);
			}
		});
		return cells;
	}

	/**
	 * 获取当前已选中的连线
	 *
	 * @method getSelectedConnects
	 * @return {array} 所有已选择的元素数组 
	 */
	getSelectedConnects = function() {
		var lines = [];
		this.connects.each(function(i,c) {
			if(c.selected) {
				lines.push(c);
			}
		});
		return lines;
	}

	/**
	* 移动指定的节点
	*
	* @method moveCells
	* @param {array} cells 需要移动的节点数组
	* @param {number} dx 移动的X偏移量
	* @param {number} dy 移动的Y偏移量
	*/
	moveCells(cells, dx, dy) {
		if(Array.isArray(cells)) {
			for(var i = cells.length - 1;i >= 0;i--) {
				cells[i].offset(dx,dy);
			}	
		}
		else if(cells) {
			cells.offset(dx,dy);
		}
	}

	/**
	 * 移除元素
	 *
	 * @method remove
	 * @param {array/jmCell} 需要移除的元素集合或指定的某个元素
	 */
	remove = function(cells) {	
		if(jmUtils.isArray(cells)) {
			for(var i = cells.length - 1;i >= 0;i--) {
				cells[i].remove();
			}	
		}
		else if(cells) {
			cells.remove();
		}
	}

	/**
	 * 清除所有画布上的对象
	 *
	 * @method clear
	 */
	clear() {	
		this.remove(this.cells.items);
	}

	/**
	 * 初始化组件添加对象
	 *
	 * @method regComponent
	 * @param {string} el 组件小图标
	 * @param {object} option 组件参数
	 */
	regComponent(el, option) {
		if(!this.components) this.components = [];
		this.components.push(option);
		if(typeof el === 'string') {
			var tmp = document.createElement('img');
			tmp.src = el;
			el = tmp;
		}
		el.setAttribute('data-component',this.components.length - 1);
		var self = this;
		jmUtils.bindEvent(el,'mousedown',function(evt) {
			var _this = self;
			evt = evt || event;
			var target = evt.target || evt.srcElement;
			var pos = jmUtils.getElementPosition(target);

			if(!target.getAttribute('data-component')) {
				if(target.children.length == 0) {
					target = target.parentElement;
				}
			}

			_this.currentComponent = {};
			_this.currentComponent.img = document.createElement('img');
			_this.currentComponent.img.setAttribute('data-component',target.getAttribute('data-component'));

			if(target.tagName !== 'IMG') {			
				for(var i in target.children) {
					var n = target.children[i];
					if(n.tagName === 'IMG') {
						target = n;
						break;
					}
				}
			}
			_this.currentComponent.img.src = target.src;
			_this.currentComponent.img.width = target.width;
			_this.currentComponent.img.height = target.height;
			_this.currentComponent.img.style['position'] = 'absolute';
			
			_this.currentComponent.left = pos.left;
			_this.currentComponent.top = pos.top;
			_this.currentComponent.img.style.left = pos.left + 'px';
			_this.currentComponent.img.style.top = pos.top + 'px';
			window.document.body.appendChild(_this.currentComponent.img);
			var evtpos = jmUtils.getEventPosition(evt || event);
			_this.currentComponent.evtX = evtpos.pageX;
			_this.currentComponent.evtY = evtpos.pageY;
			if ( evt && evt.preventDefault ) {
				//阻止默认浏览器动作(W3C) 
				evt.preventDefault(); 
			}		
			else {
				//IE中阻止函数器默认动作的方式 
				window.event.returnValue = false; 
			}			
			return false;
		});
		return el;
	}

	/**
	 * 保存样式信息，可供后面直接通过样式名称设定，
	 * 简单重复使用。
	 *
	 * @method regStyle
	 * @param {string} name 样式指定名称
	 * @param {object} style 样式对象
	 */
	regStyle = function(name,style) {
		this.styles[name] = style;
	}

	/**
	 * 保存当前画布状态
	 * 把当前画布对象转为json对象保存
	 *
	 * @method save
	 */
	save() {
		if(!this.enabled) return;//不可编辑时，直接退出
		if(!this.caches) this.caches = [];
		//当前缓存索引不是最后一个时，表示正在做撤消或恢复操作
		//去除后面可恢复的操作，只保存当前状态前的状态和当前操作
		if(this.cacheIndex < this.caches.length - 1) {
			this.caches = this.caches.slice(0,this.cacheIndex);
		}
		//只保持10个缓存
		if(this.caches.length > 10) {
			this.caches = this.caches.slice(this.caches.length - 10);
		}
		this.caches.push(this.toJSON());
		this.cacheIndex = this.caches.length - 1;
	}

	/**
	 * 撤消当前操作
	 *
	 * @method undo
	 */
	undo() {
		if(!this.isEnabled()) return;//不可编辑时，直接退出

		if(this.caches && this.caches.length > 0 && this.cacheIndex  > 0) {
			if(typeof this.cacheIndex === 'undefined') {
				this.cacheIndex = this.cacheIndex || this.caches.length - 1;
			}
			this.cacheIndex = this.cacheIndex > 0?--this.cacheIndex:0;
			var json = this.caches[this.cacheIndex];
			this.fromJSON(json,true);//撤消并不保存
		}	
	}

	/**
	 * 恢复操作
	 * 
	 * @method redo
	 */
	redo() {
		if(!this.enabled) return;//不可编辑时，直接退出
		//当前索引不为最后一个时方可恢复操作
		if(this.cacheIndex !== undefined && this.cacheIndex < this.caches.length - 1 && 
			this.caches && this.caches.length > 0) {
			this.cacheIndex = this.cacheIndex + 1;
			if(this.cacheIndex < this.caches.length) {
				var json = this.caches[this.cacheIndex];
				this.fromJSON(json,true);//恢复，并不保存状态
			}
		}
	}

	/**
	 * 排列已选元素
	 * @method align
	 * @param {string} 排列方式,top=顶端对齐,bottom=底端对齐,middle=垂直居中,left=左对齐,right=右对齐,center=水平居中
	 */
	align(der) {
		var cells = this.getSelectedCells();
		if(cells.length < 2) return;
		//首先取得最顶部的元素
		var topcell;
		for(var i in cells) {
			var cell = cells[i];
			var p = cell.position;
			if(!topcell || topcell.y > p.y) {
				topcell = cell;
			}
		}
		switch(der) {
			case 'left': {
				for(var i in cells) {
					var cell = cells[i];
					if(der == 'left') {
						cell.offset(topcell.position.x - cell.position.x,0,false);
					}				
				}
				break;
			}
			case 'right':
				for(var i in cells) {
					var cell = cells[i];			
					var right = topcell.position.x + topcell.width;
					cell.offset(right - cell.width - cell.position.x,0,false);					
				}
				break;
			case 'center': {			
				for(var i in cells) {
					var cell = cells[i];	
					var middle = topcell.position.y + topcell.height / 2;			
					cell.offset(0,middle - cell.height / 2 - cell.position.y,false);				
				}
				break;
			}
			case 'top': {
				for(var i in cells) {
					var cell = cells[i];				
					cell.offset(0,topcell.position.y - cell.position.y,false);				
				}
				break;
			}
			case 'bottom': {
				for(var i in cells) {
					var cell = cells[i];	
					var bottom = topcell.position.y + topcell.height;			
					cell.offset(0,bottom - cell.height - cell.position.y,false);				
				}
				break;
			}
			case 'middle': {
				for(var i in cells) {
					var cell = cells[i];				
					var center = topcell.position.x + topcell.width / 2;
					cell.offset(center - cell.width / 2 - cell.position.x,0,false);				
				}			
				break;
			}
		}	
		this.save();
	}

	/**
	 * 根据最新元素重新计算画布大小
	 * 如果没有指定元素，则循环所有元素计算大小
	 *
	 * @method resize
	 * @param {jmCell} [cell] 是影响大小的元素
	 */
	resize(cell) {
		var maxw = 0;
		var maxh = 0;
		//取元素边界
		if(cell) {
			var p = cell.position;
			maxw = p.x + cell.width;
			maxh = p.y + cell.height;
		}
		//处理所有元素
		else {
			this.cells.each(function(i,cell) {
				var p = cell.position;
				var w = p.x + cell.width;
				var h = p.y + cell.height;
				maxw = Math.max(w,maxw);
				maxh = Math.max(h,maxh);
			});
		}
		
		if(maxw > this.graph.canvas.width || maxh > this.graph.canvas.height) {
			this.graph.redraw(Math.max(maxw,this.graph.canvas.width) + 10,Math.max(maxh,this.graph.canvas.height) + 10);
		}
	}


	/**
	 * 对画布执行基本命令
	 *
	 * @method execute
	 * @param {string} cmd 要执行的名称
	 */
	execute = function(cmd) {
		switch(cmd) {
			case 'zoomOut': {
				this.graph.zoomOut();
				break;
			}
			case 'zoomIn': {
				this.graph.zoomIn();
				break;
			}
			case 'zoomActual': {
				this.graph.zoomActual();
				break;
			}
			case 'undo': {
				this.undo();
				break;
			}
			case 'redo': {
				this.redo();
				break;
			}
		}
	}

	/**
	 * 转为图片信息
	 * 
	 * @method toImage
	 * @return {string} 当前画布的base64字符串
	 */
	toImage() {
		return this.graph.toDataURL();
	}

	/**
	 * 转为json对象
	 * 画布完整json描述
	 * 
	 * @method toJSON
	 * @return {object} 当前描述json
	 */
	toJSON() {
		var json = {cells:[],toString:function() {
			return JSON.stringify(this);
		}};
		this.cells.each(function(i,cell) {		
			var c = {outs:[]};
			c.id = cell.id;
			c.position = cell.position;
			c.width = cell.width;
			c.height = cell.height;
			c.style = cell.styleName || cell.style;
			c.text = cell.text;
			if(cell.connects) {
				cell.connects.each(function(j,cn) {
					if(cn.from == cell) {
						c.outs.push(
							{
								id:cn.id,
								to:cn.to.id,
								text:cn.text,
								from:cell.id
							});
					}
				});
			}
			json.cells.push(c);
		}) 
		return json;
	}

	/**
	 * 从json中恢复图
	 * 根据json描述恢复原图
	 *
	 * @method fromJSON
	 * @for jmDraw
	 * @param {string/object} json 描述json
	 * @param {boolean} [s=false] 当前恢复是否记录状态 true表示记录，false不记录
	 */
	jmDraw.prototype.fromJSON = function(json,s) {
		if(!json) return;
		if(typeof json === 'string') {
			json = JSON.parse(json);
		}
		this.clear();
		if(json.cells) {
			//从源中生成流程图的节点
			for(var i in json.cells) {
				var cell = json.cells[i];
				this.addCell(cell);			
			}
			//循环所有节点，连接彼此的连线
			for(var i in json.cells) {
				var cell = json.cells[i];
				if(cell.outs) {
					//获取连接起始节点
					var cur = this.getCell(cell.id);
					if(!cur) continue;
					for(var j in cell.outs) {
						var o = cell.outs[j];
						if(o.to) {
							//获取目标节点对象
							var target = this.getCell(o.to);
							if(target) {
								cur.connect(target,o.id,o.value);//连接
							}
						}
					}
				}	
			}
			this.resize();//重置大小
		}
		if(s !== true) {
			this.save();
		}	
	}
}

/**
 * 编辑器的右健菜单
 * 可直接对返回的对象执行操作
 *
 * @method menus
 * @for jmDraw
 * @return {object} 菜单主体对象
 */
jmDraw.prototype.menus = function() {
	if(!this.menuBody) {
		var menu = this.menuBody = {};
		this.menuBody.panel = document.createElement('div');
		this.menuBody.panel.style.display = 'none';
		this.menuBody.panel.className = 'editor-menu';
		this.menuBody.container = document.createElement('ul'); 
		this.menuBody.panel.appendChild(this.menuBody.container);
		document.body.appendChild(this.menuBody.panel);

		/**
		 * 显示当前菜单
		 *
		 * @method show
		 * @for menus
		 * @param {nubmer} [x] 菜单显示位置的X坐标
		 * @param {nubmer} [y] 菜单显示位置的Y坐标
		 * @return {object} 当前菜单对象 
		 */
		this.menuBody.show = function(x,y) {
			this.panel.style.display = 'inline';
			this.panel.style.position = 'absolute';
			//如果指定了位置
			if(x && y) {
				this.panel.style['top'] = (y + 1) + 'px';
				this.panel.style['left'] = (x + 1)+ 'px';
			}
			else {
				var p = jmUtils.getEventPosition(event);
				this.panel.style['top'] = (p.pageY + 1) + 'px';
				this.panel.style['left'] = (p.pageX + 1) + 'px';
			}
			return this;
		};
		/**
		 * 向菜单中添加项
		 *
		 * @method add
		 * @for menus
		 * @param {element/string} item 菜单项，可以是字符串或html元素
		 * @param {function} click 当前菜单项单击事件委托
		 */
		this.menuBody.add = function(item,click) {
			var mitem = document.createElement('li');
			if(typeof item === 'string') {
				mitem.innerHTML = item;
			}
			else {
				mitem.appendChild(item);
			}
			mitem.onmouseup = function() {
				if(click) {
					click.call(this);
				}
				menu.hide();
			};
			this.container.appendChild(mitem);
			return this;
		};
		this.menuBody.hide = function() {
			this.panel.style.display = 'none';
			return this;
		};
		this.graph.bind('mousedown',function(evt) {
			menu.hide();
		});
	}
	this.menuBody.container.innerHTML = '';
	return this.menuBody;
}

export default jmDraw;
