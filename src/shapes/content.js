import baseShape from './baseShape.js';
import jmElement from "./jmElement.js";

/**
 * content 元素
 */
 export default class jmContent extends jmElement {
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

        //左边子弹头
        var lth = loc.height / 2; //子弹尖头高度为图形的一半
        var ltw = loc.width / 2; //子弹尖头宽度默认为图形的一半
        if(ltw > lth) ltw = lth;//当尖头宽大于高时，最长取高
        var ltangle = Math.PI/4;//上下头边取45度圆弧  
        this.leftKeyPoint1 = {x: loc.left, y: loc.top + lth};//尖头顶点
        var jp1 = {x: loc.left + ltw, y: loc.top};//尖头上边点
        var jplen1 = Math.sqrt(lth * lth + ltw * ltw);//弧边长
        this.leftRadius = jplen1 / 2 / Math.sin(ltangle / 2);//算出弧半径
        var jpangle1 = Math.atan(ltw/lth);//计算二点连线和竖线之间的夹角
        var rangle1 = Math.PI / 2 + ltangle / 2 - jpangle1;//点1与中心连线跟竖线的夹角

        this.leftCenter1 = {x: this.leftKeyPoint1.x + Math.sin(rangle1) * this.leftRadius, y: this.leftKeyPoint1.y + Math.cos(rangle1)*this.leftRadius};
        var step = 0.2;
       
        this.leftKeyPoint2 = {x: loc.left + ltw, y: loc.top};
        this.points.push(this.leftKeyPoint2);

        //椭圆方程x=a*cos(r) ,y=b*sin(r) 
        this.leftStartAngle1 = rangle1 - ltangle + Math.PI / 2;
        this.leftEndAngle1 = this.leftStartAngle1 + ltangle;
        /*for(var r=this.leftStartAngle1;r<=this.leftEndAngle1;r += step) {                
            this.points.push({
                x : Math.cos(-r) * this.leftRadius + this.leftCenter1.x,
                y : Math.sin(-r) * this.leftRadius + this.leftCenter1.y
            });
        }*/

        this.points.push(this.leftKeyPoint1);

        this.leftKeyPoint3 = {x: loc.left + ltw, y: loc.top + loc.height};//尖头下边点
        var rangle2 = jpangle1  - ltangle / 2;
        this.leftCenter2 = {x: this.leftKeyPoint1.x + Math.cos(rangle2) * this.leftRadius, y: this.leftKeyPoint1.y - Math.sin(rangle2)*this.leftRadius};
        this.leftStartAngle2 = Math.PI + rangle2;
        this.leftEndAngle2 = this.leftStartAngle2 + ltangle;
        /*for(var r=this.leftStartAngle2;r<=this.leftEndAngle2;r += step) {                
            this.points.push({
                x : Math.cos(-r) * this.leftRadius + this.leftCenter2.x,
                y : Math.sin(-r) * this.leftRadius + this.leftCenter2.y
            });
        }*/

        this.points.push(this.leftKeyPoint3);

        //计算尾部圆弧,跟上面采用同样的角度
        this.rightRadius = loc.height / 2 / Math.sin(ltangle / 2);//圆半径
        this.rightCenter = {x: loc.left + loc.width - this.rightRadius, y: loc.top + loc.height/2};

        this.rightKeyPoint1 = {x: this.rightCenter.x + Math.cos(ltangle / 2) * this.rightRadius, y: loc.top + loc.height};
        this.points.push(this.rightKeyPoint1);

        this.rightStartAngle = -ltangle / 2;
        this.rightEndAngle = ltangle / 2;
        /*for(var r=this.rightStartAngle;r<=this.rightEndAngle;r += step) {                
            this.points.push({
                x : Math.cos(-r) * this.rightRadius + this.rightCenter.x,
                y : Math.sin(-r) * this.rightRadius + this.rightCenter.y
            });
        }*/
        this.rightKeyPoint2 = {x: this.rightKeyPoint1.x, y: loc.top};
        this.points.push(this.rightKeyPoint2);

        return this.points;
    }
    /**
     * 自定义绘制函数，以免出现毛刺
     */
    draw() {	
        //获取父元素绝对坐标
        var bounds = this.parent && this.parent.absoluteBounds?this.parent.absoluteBounds:this.absoluteBounds;

        this.context.arc(this.leftCenter1.x + bounds.left,this.leftCenter1.y + bounds.top,this.leftRadius, -this.leftStartAngle1,-this.leftEndAngle1, true);
        this.context.arc(this.leftCenter2.x + bounds.left,this.leftCenter2.y + bounds.top,this.leftRadius, -this.leftStartAngle2,-this.leftEndAngle2, true);
        this.context.lineTo(bounds.left + this.rightKeyPoint1.x, bounds.top + this.rightKeyPoint1.y);	
        this.context.arc(this.rightCenter.x + bounds.left,this.rightCenter.y + bounds.top,this.rightRadius, -this.rightStartAngle,-this.rightEndAngle, true);
        this.context.lineTo(bounds.left + this.rightKeyPoint2.x, bounds.top + this.rightKeyPoint2.y);	
    }
}