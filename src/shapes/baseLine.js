import baseShape from './baseShape.js';
import jmElement from "./jmElement.js";

/**
 * 基础线条公共类
 */
 export default class jmBaseLine extends jmElement {
	constructor(option) {        

        super(option);

        this.start = option.start || {x: 0, y: 0};
        this.end = option.end || {x: 0, y: 0};

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