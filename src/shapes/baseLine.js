import { jmLine, jmArraw } from '../../lib/jmgraph.js';
import jmElement from "./jmElement.js";

/**
 * 基础线条公共类
 */
 export default class jmBaseLine extends jmElement {
	constructor(option) {        
        if(!option.shapeType) option.shapeType = elementShape;// 指定图形为自定义的绘图对象
		
		option.resizable = false;
		option.connectable = false;
		
		super(option);

        this.start = option.start || {x: 0, y: 0};
        this.end = option.end || {x: 0, y: 0};

        this.startArraw = !!option.startArraw;
        this.endArraw = !!option.endArraw;

        this.create();
    } 	

	/**
	 * 控制起始点
	 * 
	 * @property start
	 * @type {point}
	 */
	get start() {
		return this.__pro('start');
	}
	set start(v) {
		this.needUpdate = true;
		return this.__pro('start', v);
	}

	/**
	 * 控制结束点
	 * 
	 * @property end
	 * @type {point}
	 */
	get end() {
		return this.__pro('end');
	}
	set end(v) {
		this.needUpdate = true;
		return this.__pro('end', v);
	}

	/**
	 * 是否有开始箭头
	 * 
	 * @property startArraw
	 * @type {boolean}
	 */
	get startArraw() {
		return this.__pro('startArraw');
	}
	set startArraw(v) {
		this.needUpdate = true;
		return this.__pro('startArraw', v);
	}

	/**
	 * 是否有结束箭头
	 * 
	 * @property endArraw
	 * @type {boolean}
	 */
	get endArraw() {
		return this.__pro('endArraw');
	}
	set endArraw(v) {
		this.needUpdate = true;
		return this.__pro('endArraw', v);
	}
      
    //获取二点的方位，left,top,right,bottom  
    getDirection(s=this.start, e=this.end) {
        if(s.x == e.x) {
            return s.y > e.y? 'bottom': 'top';//垂直方向
        }
        if(s.y == e.y) {
            return s.x > e.x? 'left': 'right';//水平方向
        }
        if(s.x > e.x) {
            return s.y > e.y? 'lefttop': 'leftbottom';//起始点x,y都大于结束点则为左上右下
        }
        else {
            return s.y > e.y? 'righttop': 'rightbottom';//起始点X小于结束点，Y大于结束点则为右下右上
        }
	}
	
	/**
	 * 获取当前位置信息
	 */
	getLocation() {
		const loc = super.getLocation();
		loc.left = Math.min(this.start.x, this.end.x);
		loc.top = Math.min(this.start.y, this.end.y);
		loc.width = Math.abs(this.start.x - this.end.x);
		loc.height = Math.abs(this.start.y - this.end.y);
		return loc;
	}
}

/**
 * 绘制
 */
class elementShape extends jmLine {
    constructor(params) {
        super(params);
        // 起始箭头
        this.startArrawShape = new jmArraw(params);
        // 结束箭头
		this.endArrawShape = new jmArraw(params);

		this.style.fill = this.style.stroke;
    }	
    
    // 画直线
    initPoints() {
        this.points = [];
        if(this.parent) {
			const loc = this.parent.getLocation();
			this.start = Object.assign(this.start, {	
				x: this.parent.start.x - loc.left,
				y: this.parent.start.y - loc.top
			});
			this.end = Object.assign(this.end, {	
				x: this.parent.end.x - loc.left,
				y: this.parent.end.y - loc.top
			});
			
        } 
        this.points = super.initPoints();
        
        // 如果有起始箭头，用箭头计算描点，从结尾处向前计算箭头方向
        if(this.parent && this.parent.startArraw) {
            this.startArrawShape.start = this.end;
            this.startArrawShape.end = this.start; 
            this.points = this.points.concat(this.startArrawShape.initPoints()); 
        }
        // 如果有结束箭头，顺方向计算箭头
        if(this.parent && this.parent.endArraw) {
            this.endArrawShape.start = this.start;
            this.endArrawShape.end = this.end;  
            this.points = this.points.concat(this.endArrawShape.initPoints()); 
        }

        return this.points;
    } 	
}