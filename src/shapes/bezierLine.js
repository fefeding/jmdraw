import baseLine from './baseLine.js';
import { jmBezier } from '../../lib/jmgraph.js';

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
	}	
}