import { jmPath } from '../../lib/jmgraph.js';
import jmElement from "./jmElement.js";

/**
 * card 元素
 * 边角缺失的图形
 */
 export default class jmCard extends jmElement {
	constructor(option) {
        
        option.shapeType = cardShape;// 指定图形为自定义的绘图对象

        super(option);
    } 
       
}

/**
 * 绘制card
 */
class cardShape extends jmPath {
    /**
     *  重写绘制路径
     **/
    initPoints() {
        const location = this.getLocation();	
        let ltw = 20; //左上角缺角边长
        let lth = 20; //左上角缺角边高
        if(ltw > location.width) ltw = location.width;
        if(lth > location.height) lth = location.height;

        const p1 = {x:location.left,y:location.top+lth};
        const p2 = {x:location.left + ltw,y:location.top};
        const p3 = {x:location.left + location.width,y:location.top};
        const p4 = {x:location.left + location.width,y:location.top + location.height}; 
        const p5 = {x:location.left,y:location.top + location.height};              
        
        this.points = [];
        this.points.push(p1);
        this.points.push(p2);
        this.points.push(p3);
        this.points.push(p4);            	
        this.points.push(p5);   
        return this.points;
    }
}