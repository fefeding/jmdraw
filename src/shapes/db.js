import baseShape from './baseShape.js';
import jmElement from "./jmElement.js";

/**
 * DB数据库
 */
 export default class jmDB extends jmElement {
	constructor(option) {
        
        option.shapeType = elementShape;// 指定图形为自定义的绘图对象

        super(option);

        this.create();
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

        //上部一个椭圆
        //先计算椭圆的高度，如果高度超过总高度的一半，则采用一半
        var cw = loc.width / 2;
        var ch = cw / 4;
        if(ch > loc.height / 4) ch = loc.height / 4;

        var bottomArcPoints = []; //底部半圆的集合
        var step = 1/cw;
        //顶部的椭圆
        for(var r=0;r<=Math.PI*2;r += step) {
            var p = {
                x : Math.cos(r) * cw + cw,
                y : Math.sin(r) * ch + ch
            };
            this.points.push(p);
            //底部半圆就是上面的圆下部分平移一个柱子高度
            if(r >= 0 && r <= Math.PI) {
                bottomArcPoints.push({
                    x: p.x,
                    y: p.y - ch*2 + loc.height
                });
            }
        }

        /*for(var r=0;r<=Math.PI;r += step) {
            var p = {
                x : Math.cos(r) * cw + cw,
                y : Math.sin(r) * ch + loc.height - ch
            };
            this.points.push(p);
        }*/
        this.points = this.points.concat(bottomArcPoints);

        this.points.push({x: loc.left, y:loc.top+ch});
        //这里是一个重新移到此处开始画，避免最后多出一个封闭的连线
        this.points.push({x: loc.left + loc.width,y:loc.top+ch, m:true});
        return this.points;
    }
}