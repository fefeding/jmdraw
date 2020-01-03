import { jmPath } from '../../lib/jmgraph.js';
import jmElement from "./jmElement.js";

/**
 * data 元素
 */
 export default class jmData extends jmElement {
	constructor(option) {
        
        option.shapeType = elementShape;// 指定图形为自定义的绘图对象

        super(option);

        this.create();
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
        const loc = this.getLocation();	
        var ltw = loc.width / 4; //棱形缺口宽

        var p1 = {x:loc.left + ltw,y:loc.top};
        var p2 = {x:loc.left + loc.width,y:loc.top};
        var p3 = {x:loc.left + loc.width - ltw,y:loc.top + loc.height};
        var p4 = {x:loc.left,y:loc.top + loc.height}; 
        
        this.points = [];
        this.points.push(p1);
        this.points.push(p2);
        this.points.push(p3);
        this.points.push(p4);  

        //计算连接点
        if(this.parent.connectLeft) this.parent.connectLeft.center.x = p4.x + ltw/2;
        if(this.parent.connectRight) this.parent.connectRight.center.x = p2.x - ltw/2;

        return this.points;
    }
}