import { jmPath } from '../../lib/jmgraph.js';
import jmElement from "./jmElement.js";

/**
 * 循环界限 元素
 */
 export default class jmCyclelimit extends jmElement {
	constructor(option) {
        
        option.shapeType = elementShape;// 指定图形为自定义的绘图对象

        super(option);
    } 
       
}

/**
 * 绘制
 */
class elementShape extends jmPath {
    /**
     *  重写绘制路径
     **/
    initPoints() {
        const location = this.getLocation();	
        var ltw = 20; //左上角缺角边长
        var lth = 20; //左上角缺角边高
        if(ltw > location.width/2) ltw = location.width/2;
        if(lth > location.height/2) lth = location.height/2;

        var p1 = {x:location.left,y:location.top+lth};
        var p2 = {x:location.left + ltw,y:location.top};
        var p3 = {x:location.left + location.width-ltw,y:location.top};
        var p4 = {x:location.left + location.width,y:location.top + lth};
        var p5 = {x:location.left + location.width,y:location.top + location.height}; 
        var p6 = {x:location.left,y:location.top + location.height};              
        
        this.points = [];
        this.points.push(p1);
        this.points.push(p2);
        this.points.push(p3);
        this.points.push(p4);            	
        this.points.push(p5);           	
        this.points.push(p6);     
        return this.points;
    }
}