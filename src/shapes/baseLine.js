import { jmLine, jmArraw } from '../../lib/jmgraph.js';
import jmElement from "./jmElement.js";

/**
 * 基础线条公共类
 */
 export default class jmBaseLine extends jmElement {
	constructor(option) {        
        if(!option.shapeType) option.shapeType = elementShape;// 指定图形为自定义的绘图对象
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
    }	
    
    // 画直线
    initPoints() {
        this.points = [];
        if(this.parent) {
            this.start = this.parent.start;
            this.end = this.parent.end;

            
        } 
        this.points = super.initPoints();
        
        // 如果有起始箭头，用箭头计算描点，从结尾处向前计算箭头方向
        if(this.parent && this.parent.startArraw) {
            this.startArrawShape.start = this.parent.end;
            this.startArrawShape.end = this.parent.start; 
            this.points = this.points.concat(this.startArrawShape.initPoints()); 
        }
        // 如果有结束箭头，顺方向计算箭头
        if(this.parent && this.parent.endArraw) {
            this.endArrawShape.start = this.parent.start;
            this.endArrawShape.end = this.parent.end;  
            this.points = this.points.concat(this.endArrawShape.initPoints()); 
        }

        return this.points;
    } 	
}