import baseLine from './baseLine.js';
import { jmBezier, jmArraw } from '../../lib/jmgraph.js';

/**
 * 贝赛尔曲线 元素
 */
 export default class jmBezierLine extends baseLine {
	constructor(option) {
        option.shapeType = elementShape;// 指定图形为自定义的绘图对象

        super(option);

        
        // 连线不需要改变大小
        this.style && delete this.style.resize;

        this.create();
    } 
       
}

/**
 * 绘制
 */
class elementShape extends jmBezier {
    constructor(params) {
        //params.style && (params.style.close = false);
        
        super(params);
        
        
        // 起始箭头
		this.startArrawShape = new jmArraw(params);
		this.startArrawShape.visible = false;
        // 结束箭头
		this.endArrawShape = new jmArraw(params);
		this.endArrawShape.visible = false;

		this.on('add', ()=>{
			this.parent.children.add(this.startArrawShape);
			this.parent.children.add(this.endArrawShape);
		});

		//this.style.fill = this.style.stroke;
	}	
}