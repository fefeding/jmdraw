'use strict';

/**
 * 编辑器默认样式
 *	 
 * @class defaultStyle
 * @static
 */
const defaultStyle = {	
	/**
	 * 拖放连线的样式
	 *
	 * @property dragLine
	 * @type object
	 */
	dragLine: {
		stroke:'rgb(59,111,41)',
        lineWidth:1,
        lineType: "dotted",
        dashLength :6,
        zIndex:10000
	},

	/**
	 * 元素默认样式
	 *
	 * @property cell
	 * @type object
	 */
	cell: {
		resize : {
			stroke : 'rgb(0,255,0)',
			fill:'transparent',
			lineWidth: 1,
			zIndex: 1000,
			//大小改变拖放边框样式
			rectStroke: '#008000',
			rectFill: 'linear-gradient(0 0 100% 100%,#FFF 0,#C2F0C2 0.5,#84E184 1)',
			close: true,
			minWidth: 40,
			minHeight: 20
		},
		shape: {
			stroke : '#3B3B3B',
			shadow: '2,2,2,#ccc',
			fill:'linear-gradient(50% 0 50% 100%,#FFFCFC 0,#EFEFEF 1)',
			close: true
		},
		/**
		* 编辑器字符样式
		*/
	   label : {
		   textAlign : 'center',
		   'textBaseline' : 'middle',
		   fill : "blue",
		   font : '12px Arial',
		   border : null
	   },
	   //图形连接点样式
	   connectPoint: {
	   		//中间X点样式
	   		xShape: {
	   			stroke : '#2712FC',
	   			lineWidth: 1
	   		},
	   		//外框图形样式
	   		sideShape: {
	   			stroke : '#D00003',
	   			lineWidth: 2
	   		},
	   		fill: 'transparent'
	   },
	   fill: 'transparent'
	},
	/**
	 * 连线样式
	 *
	 * @property line
	 * @type object
	 */
	line: {
		stroke : '#3B3B3B',
		overStroke : 'red' ,
		close: false,
		lineWidth : 1,
		//对应的箭头样式
		arrow: {
			fill: '#3B3B3B',
			lineWidth : 1
		},
		//二端拖放样式
		dragShape: {
			fill: 'linear-gradient(0 0 100% 100%,#FFF 0,#C2F0C2 0.5,#84E184 1)',
			stroke: '#008000',
			lineWidth: 1,
			zIndex: 10,
			connected: {
				fill: 'linear-gradient(0 0 100% 100%,#FFF 0,#FCC6C6 0.2,#FF6D70 1)',
				stroke: '#D00003'
			},
			hover: {
				fill: 'linear-gradient(0 0 100% 100%,#FFE6BF 0,#FFD99F 0.2,#FFB340 1)',
				stroke: '#E75C00'
			}
		}
	},

	/**
	 * 编辑器字符样式
	 *
	 * @property font
	 * @type object
	 */
	font: {
		textAlign : 'center',
		'textBaseline' : 'middle',
		fill : "blue",
		font : '20px Arial',
		border : null
	},

	/**
	 * 选择元素边框样式
	 *
	 * @property selectRect
	 * @type object
	 */
	selectRect: {
		stroke : 'rgb(0,0,0)',
		lineWidth: 0.8,
		zIndex : 100000,
		lineType: 'dotted', //指定为虚线
		dashLength: 10 //虚线间隔
	}
};

export default defaultStyle;