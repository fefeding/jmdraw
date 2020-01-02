import baseShape from './baseShape.js';
import jmElement from "./jmElement.js";

/**
 * DB数据库
 */
 export default class jmDelay extends jmElement {
	constructor(option) {
        
        option.shapeType = elementShape;// 指定图形为自定义的绘图对象

        super(option);
    } 
       
}

/**
 * 绘制
 */
class elementShape extends baseShape {
    /**
     *  重写绘制路径
     **/
    initPoints() {
        var loc = this.getLocation();
        this.points = [];

        this.points.push({x: loc.left, y:loc.top});

        //右边的圆弧
        //最大半径为高度的一半
        var radius = loc.height / 2;
        var offWidth = radius;//右边圆弧点宽，最宽为半径
        if(offWidth > loc.width / 4) {
            offWidth = loc.width / 4;//最宽不能超过总长度的1/4
            //重新计算半径
            radius = (radius * radius / offWidth + offWidth) / 2;
        }
        var arcTopPoint = {x: loc.left + loc.width - offWidth, y:loc.top};
        var arcBottomPoint = {x: arcTopPoint.x, y: loc.top + loc.height};
        var arcCenter = {
            x: loc.left + loc.width - radius,
            y: loc.top + loc.height / 2
        }

        this.points.push(arcTopPoint);

        var step = 1/radius;
        var start = Math.asin(loc.height/2/radius);
        var end = -start;
        for(var r=end;r<=start;r += step) {
            var p = {
                x : Math.cos(r) * radius + arcCenter.x,
                y : Math.sin(r) * radius + arcCenter.y
            };
            this.points.push(p);
        }

        this.points.push(arcBottomPoint);
        this.points.push({x: loc.left,y:loc.top+loc.height});
        return this.points;
    }
}