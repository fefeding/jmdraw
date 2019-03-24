//带箭头的折线
(function(stName){    
    /**
     * @param {object} 参照jmElement 的参数
     */
    function shapeType(option){        
        option = jmUtils.extend(option||{}, {
            position :{x:300,y:50},
            width:100,
            height:60
        });
        this.start = option.start || option.position;
        this.end = option.end || {x: option.position.x + option.width, y: option.position.y + option.height};

        this.resizable = false;
        this.connectable = false;
        this.style = option.style || jmUtils.clone(option.editor.defaultStyle.line, true);

        //继承jmElement
        jmUtils.extend(this, new jmDraw.jmElement());
        //补充一个箭头
        this.shape = option.graph.createShape('arraw', {style: this.style.arrow||option.editor.defaultStyle.line.arrow}); 
        //起始位置可拖放图形
        this.startDragShape = option.graph.createShape('rect', {width:8,height:8,style: this.style.dragShape||option.editor.defaultStyle.line.dragShape});
        this.endDragShape = option.graph.createShape('rect', {width:8,height:8,style: this.style.dragShape||option.editor.defaultStyle.line.dragShape}); 

        //鼠标进入显示hover样式
        this.startDragShape.bind('mouseover', function(){
            this.style = jmUtils.extend(jmUtils.clone(this.parent.style.dragShape.hover),this.style);
            //this.cursor('crosshair');
        });
        this.startDragShape.bind('mouseleave', function(){
            this.style = jmUtils.extend(jmUtils.clone(this.parent.style.dragShape),this.style);
        });
        //鼠标进入显示hover样式
        this.endDragShape.bind('mouseover', function(){
            this.style = jmUtils.extend(jmUtils.clone(this.parent.style.dragShape.hover),this.style);
        });
        this.endDragShape.bind('mouseleave', function(){
            this.style = jmUtils.extend(jmUtils.clone(this.parent.style.dragShape),this.style);
        });
        this.startDragShape.canMove(true).on('move', function(args){
             //如果是元素的连接占，则取其中心
             if(this.parent.start.type == 'jmConnectPoint') {
                this.parent.start = jmUtils.clone(this.parent.start.getCenter(true, true));
            }
            this.parent.start.x += args.offsetX;
            this.parent.start.y += args.offsetY;
            this.parent.checkConnectPointsStatus();
        }).on('moveend', function(args){
            this.parent.checkConnectPointsStatus(true, function(start, end) {
                if(start) this.start = start;
            });//结束显示状态            
        }).visible = false;;   
        this.endDragShape.canMove(true).on('move', function(args){
             //如果是元素的连接占，则取其中心             
            if(this.parent.end.type == 'jmConnectPoint') {
                this.parent.end = jmUtils.clone(this.parent.end.getCenter(true, true));
            }

            this.parent.end.x += args.offsetX;
            this.parent.end.y += args.offsetY;
            this.parent.checkConnectPointsStatus();
        }).on('moveend', function(args){
            this.parent.checkConnectPointsStatus(true, function(start, end) {
                if(end) this.end = end;
            });
        }).visible = false;       

        //初始化节点
        this.init(option);
        //加宽触控区域，使它更容易选中
        this.style.touchPadding = 5;

        this.children.add(this.startDragShape);
        this.children.add(this.endDragShape);

        //重置图形生成
        this.initPoints = function() {  
            var loc = this.getLocation();          
            //获取二点的方位，1=left,2=top,3=right,=bottom  
            function getDirection(s,e) {
                if(s.x == e.x) {
                    return s.y > e.y?4:2;//垂直方向
                }
                if(s.y == e.y) {
                    return s.x > e.x?3:1;//水平方向
                }
                if(s.x > e.x) {
                    return s.y > e.y?3412:3214;//起始点x,y都大于结束点则为左上右下
                }
                else {
                    return s.y > e.y?1432:1234;//起始点X小于结束点，Y大于结束点则为右下右上
                }
            }
            //计算第一个默认点位
            //根据不同方位连接点偏移不同的方向
            function initFirstPoint(connectPoint, p, step) {
                var ret = {x: p.x, y: p.y};
                switch(connectPoint.pos) {
                    //顶部,向上回退一个step
                    case 'top': {
                        ret.y -= step;
                        break;
                    }
                    //在边,向右移一个step
                    case 'right': {
                        ret.x += step;
                        break;
                    }
                    //底部,向下移step
                    case 'bottom': {
                        ret.y += step;
                        break;
                    }
                    //顶部,向上回退一个step
                    case 'left': {
                        ret.x -= step;
                        break;
                    }
                }
                return ret;
            }
            var maxFirstStep = 20;//每个连接点有一个最大隔离长度，让线条离图形一定距离
            var start = this.start;
            var end = this.end;

            var firstStart,firstEnd;//定义二个隔度点，离连接点最近的点
            //如果是元素的连接占，则取其中心
            if(start.type == 'jmConnectPoint') {
                start = jmUtils.clone(start.getCenter(true, true));
                firstStart = initFirstPoint(this.start, start, maxFirstStep);//计算连接点外移的第一个点
            }
            //如果不是连接的图形连接点，则不需要隔点
            else {
                firstStart = start;
            }
            if(end.type == 'jmConnectPoint') {
                end = jmUtils.clone(end.getCenter(true, true));
                firstEnd = initFirstPoint(this.end, end, maxFirstStep);//计算连接点外移的第一个点
            }
            else {
                firstEnd = end;
            }

            var points = this.points = [start, firstStart];


            //判断二点所在方位
            var der = getDirection(start, end);
            //points.push({x: end.x, y: start.y});
            //如果起始点连接的是图形
            if(this.start.type == 'jmConnectPoint') {
                //如果目录也是图形
                if(this.end.type == 'jmConnectPoint') {
                    switch(der) {
                        //从左往右的水平方向
                        case 1:{     
                            shape2ShapeLeft2Right.call(this, start, end, firstStart, firstEnd, maxFirstStep);
                            break;
                        }
                        //从右往左的水平方向
                        case 3:{
                            shape2ShapeRight2Left.call(this, start, end, firstStart, firstEnd, maxFirstStep);
                            break;
                        }
                        //从上往下的垂直方向
                        case 2:{
                            shape2ShapeTop2Bottom.call(this, start, end, firstStart, firstEnd, maxFirstStep);
                            break;
                        }
                        //从下往上的垂直方向
                        case 4:{
                            shape2ShapeBottom2Top.call(this, start, end, firstStart, firstEnd, maxFirstStep);
                            break;
                        }
                        //右下往左上
                        case 3412:{
                            shape2ShapeRightBottom2LeftTop.call(this, start, end, firstStart, firstEnd, maxFirstStep);
                            break;
                        }
                        //右上往左下
                        case 3214:{
                            var len = (firstEnd.x - firstStart.x)/2;
                            points.push({x:firstStart.x + len,y:firstStart.y});
                            points.push({x:firstEnd.x - len,y: firstEnd.y});
                            break;
                        }
                        //左下往右上
                        case 1432:{
                            var len = (firstEnd.x - firstStart.x)/2;
                            points.push({x:firstStart.x + len,y: firstStart.y});
                            points.push({x:firstEnd.x - len,y: firstEnd.y});
                            break;
                        }
                        //左上右下
                        default:{
                            var len = (firstEnd.x - firstStart.x)/2;
                            points.push({x:firstStart.x + len,y: firstStart.y});
                            points.push({x:firstEnd.x - len,y: firstEnd.y});
                            break;
                        }
                    }
                }
            }
            else {
                switch(der) {
                    //从左往右的水平方向
                    case 1:{
                        
                        var len = (firstEnd.x - firstStart.x)/3;
                        points.push({x:firstStart.x + len, y: firstStart.y});
                        points.push({x:firstEnd.x - len, y: firstStart.y});
                        break;
                    }
                    //从右往左的水平方向
                    case 3:{
                        var len = (firstStart.x - firstEnd.x)/3;
                        points.push({x:firstStart.x - len, y: firstStart.y});
                        points.push({x:firstEnd.x + len, y: firstStart.y});
                        break;
                    }
                    //从上往下的垂直方向
                    case 2:{
                        var len = (firstEnd.y - firstStart.y)/3;
                        points.push({x:firstStart.x, y: firstStart.y + len});
                        points.push({x:firstStart.x , y: firstEnd.y - len});
                        break;
                    }
                    //从下往上的垂直方向
                    case 4:{
                        var len = (firstStart.y - firstEnd.y)/3;
                        points.push({x:firstStart.x, y: firstEnd.y + len});
                        points.push({x:firstStart.x , y: firstStart.y - len});
                        break;
                    }
                    //右下往左上
                    case 3412:{
                        var len = (firstStart.x - firstEnd.x)/2;
                        points.push({x:firstStart.x - len,y: firstStart.y});
                        points.push({x:firstStart.x - len,y: firstEnd.y});
                        break;
                    }
                    //右上往左下
                    case 3214:{
                        var len = (firstEnd.x - firstStart.x)/2;
                        points.push({x:firstStart.x + len,y:firstStart.y});
                        points.push({x:firstEnd.x - len,y: firstEnd.y});
                        break;
                    }
                    //左下往右上
                    case 1432:{
                        var len = (firstEnd.x - firstStart.x)/2;
                        points.push({x:firstStart.x + len,y: firstStart.y});
                        points.push({x:firstEnd.x - len,y: firstEnd.y});
                        break;
                    }
                    //左上右下
                    default:{
                        var len = (firstEnd.x - firstStart.x)/2;
                        points.push({x:firstStart.x + len,y: firstStart.y});
                        points.push({x:firstEnd.x - len,y: firstEnd.y});
                        break;
                    }
                }
            }

            points.push(firstEnd, end);
            var bounds = this.getBounds(true);//强制重算bounds,this.points才会当前绘制生效

            //生成箭头坐标点
            //箭头加到了当前子控件中，所以它的坐标是对应为当前控件左上角的
            var arrawP1 = jmUtils.clone(points[points.length-2]);
            var arrawP2 = jmUtils.clone(points[points.length-1]);
            jmUtils.offsetPoints([arrawP1,arrawP2], {x:-bounds.left, y:-bounds.top});
            this.shape.start = arrawP1;    
            this.shape.end = arrawP2;

            //计算线条相对起点和结束点
            var offstart = jmUtils.clone(start);
            var offend = jmUtils.clone(end);
            jmUtils.offsetPoints([offstart,offend], {x:-bounds.left-this.startDragShape.width/2, y:-bounds.top-this.endDragShape.height/2});
            this.startDragShape.position = offstart;
            this.endDragShape.position = offend;

            return points;
        }

        //图形连图形从左向右水平方位
        function shape2ShapeLeft2Right(start, end, firstStart, firstEnd, maxFirstStep) {            
            //起始图形的边界信息
            var startShapeBound = this.start.parent.getBounds();
            var endShapeBound = this.end.parent.getBounds();
            //起始点为图形的左侧                       
            if(this.start.pos == 'left') {
                //然后根据结束点的方位来连线
                switch(this.end.pos) {
                    //结束点为左侧的情况下，导线需要绕过起始图形
                    case 'left': {
                        //如果二图太近，则直连即可
                        if(end.x <= startShapeBound.right + maxFirstStep) {
                            firstStart.x = start.x;    
                            firstEnd = end;                                        
                        }
                        //绕过图形连结
                        else {
                            //如果结束位置离起始图形太近，则采中位
                            var foffx = end.x - startShapeBound.right;
                            firstEnd.x = startShapeBound.right + foffx/2
                            
                            //绕过底部
                            var p1 = {x:firstStart.x, y: startShapeBound.bottom + maxFirstStep};
                            var p2 = {x: firstEnd.x, y: p1.y};
                            this.points.push(p1,p2);
                        }
                        break;
                    }
                    //结束点在图形上方
                    case 'top': {
                        //绕过图形连结
                        var p1 = {x:firstStart.x, y: startShapeBound.top - maxFirstStep};
                        p1.y = Math.min(p1.y, firstEnd.y);//取最高的一个点
                        firstEnd.y = p1.y;

                        this.points.push(p1);
                        break;
                    }
                    //结束位在图形右边
                    case 'right': {
                        
                        //绕过图形连结
                        var p1 = {x:firstStart.x, y: startShapeBound.top - maxFirstStep};
                        p1.y = Math.min(p1.y, endShapeBound.top - maxFirstStep);
                        var p2 = {x: firstEnd.x, y: p1.y};

                        this.points.push(p1, p2);
                        break;
                    }

                    //结束位在图形底部
                    //从起始图形下边绕过
                    case 'bottom': {
                        //绕过图形连结
                        var p1 = {x:firstStart.x, y: startShapeBound.bottom + maxFirstStep};
                        p1.y = Math.max(p1.y, firstEnd.y);
                        firstEnd.y = p1.y;

                        this.points.push(p1);
                        break;
                    }
                }
            }
            //起始位在图形上边
            else if(this.start.pos == 'top') {
                //然后根据结束点的方位来连线
                switch(this.end.pos) {
                    //结束点为左侧的情况下
                    case 'left': {
                         //如果结束位置离起始图形太近，则采中位
                        var foffx = end.x - startShapeBound.right;
                        firstEnd.x = startShapeBound.right + foffx/2
                        
                        //绕过底部
                        var p1 = {x:firstEnd.x, y: firstStart.y};
                        this.points.push(p1);
                        break;
                    }
                    //结束点在图形上方
                    case 'top': {
                        //直连偏移点即可
                        firstStart.y = firstEnd.y = Math.min(firstStart.y, firstEnd.y);
                        break;
                    }
                    //结束位在图形右边
                    case 'right': {                        
                        //绕过图形连结
                        var p1 = {x:firstStart.x, y: startShapeBound.top - maxFirstStep};
                        p1.y = Math.min(p1.y, endShapeBound.top - maxFirstStep);
                        var p2 = {x: firstEnd.x, y: p1.y};

                        this.points.push(p1, p2);
                        break;
                    }

                    //结束位在图形底部
                    //从起始图形下边绕过
                    case 'bottom': {                        
                        //绕过图形连结
                        var p1 = {x: firstStart.x/2 + firstEnd.x/2, y: firstStart.y};
                        var p2 = {x: p1.x, y: firstEnd.y};
                        //二者太近，则直连
                        if(startShapeBound.right <= endShapeBound.left) {
                            firstStart.y = p1.y = start.y;
                            firstEnd.y = p2.y = end.y;
                        }
                        this.points.push(p1,p2);
                        break;
                    }
                }
            }
            //起始位在图形右边
            else if(this.start.pos == 'right') {
                //然后根据结束点的方位来连线
                switch(this.end.pos) {
                    //结束点为左侧的情况下
                    case 'left': {
                        //直连
                        firstStart.x = start.x;
                        firstEnd.x = end.x;
                        break;
                    }
                    //结束点在图形上方
                    case 'top': {
                        //从中线绕上连
                        firstStart.x = endShapeBound.left/2 + startShapeBound.right/2;
                        var p1 = {x: firstStart.x, y: firstEnd.y};
                        //如果连线在起始图形内了，则直连
                        if(firstStart.x <= startShapeBound.right) {
                            firstStart.x = start.x;
                            p1.y = firstEnd.y = end.y;
                        }
                        this.points.push(p1);
                        break;
                    }
                    //结束位在图形右边
                    case 'right': {                        
                        //从中线绕上连
                        firstStart.x = endShapeBound.left/2 + startShapeBound.right/2;
                        var p1 = {x: firstStart.x, y: endShapeBound.top - maxFirstStep};
                        var p2 = {x: firstEnd.x, y: p1.y};
                        //如果连线在起始图形内了，则直连
                        if(firstStart.x <= startShapeBound.right) {
                            firstStart.x = p1.x = start.x;
                            firstEnd.x = p2.x = end.x;                            
                            p1.y = p2.y = end.y;
                        }
                        this.points.push(p1, p2);
                        break;
                    }

                    //结束位在图形底部
                    //从起始图形下边绕过
                    case 'bottom': {                        
                        //从中线绕上连
                        firstStart.x = endShapeBound.left/2 + startShapeBound.right/2;
                        var p1 = {x: firstStart.x, y: firstEnd.y};
                        //如果连线在起始图形内了，则直连
                        if(firstStart.x <= startShapeBound.right) {
                            firstStart.x = p1.x = start.x;
                            firstEnd.y = end.y;  
                        }
                        this.points.push(p1);
                        break;
                    }
                }
            }
            //起始位在图形底 边
            else if(this.start.pos == 'bottom') {
                //然后根据结束点的方位来连线
                switch(this.end.pos) {
                    //结束点为左侧的情况下
                    case 'left': {
                        //偏离底部再走中线连接
                        var p1 = {x: endShapeBound.left/2 + startShapeBound.right/2, y: firstStart.y};
                        if(p1.x <= startShapeBound.right) {
                            firstStart.y = p1.y = start.y;
                            firstEnd.x = p1.x = end.x;
                        }
                        firstEnd.x = p1.x;
                        this.points.push(p1);
                        break;
                    }
                    //结束点在图形上方
                    case 'top': {                     
                        var p1 = {x: endShapeBound.left/2 + startShapeBound.right/2, y: firstStart.y};
                        //太近则从底部绕过去
                        if(p1.x <= startShapeBound.right) {
                            p1.y = firstStart.y = Math.max(firstStart.y, endShapeBound.y + maxFirstStep);
                            p1.x = endShapeBound.right + maxFirstStep;                            
                        }
                        var p2 = {x: p1.x, y: firstEnd.y};                        
                        this.points.push(p1,p2);
                        break;
                    }
                    //结束位在图形右边
                    case 'right': {                         
                        //从底部绕过去
                        firstStart.y = Math.max(firstStart.y, endShapeBound.y + maxFirstStep);
                        var p1 = {x: firstEnd.x, y: firstStart.y};            
                        this.points.push(p1);
                        break;
                    }
                    //结束位在图形底部
                    case 'bottom': {   
                        firstStart.y = firstEnd.y;
                        break;
                    }
                }
            }
        }

        //图形连图形从右向左水平方位
        function shape2ShapeRight2Left(start, end, firstStart, firstEnd, maxFirstStep) {            
            //起始图形的边界信息
            var startShapeBound = this.start.parent.getBounds();
            var endShapeBound = this.end.parent.getBounds();
            //起始点为图形的左侧                       
            if(this.start.pos == 'left') {
                //然后根据结束点的方位来连线
                switch(this.end.pos) {
                    //结束点为左侧的情况下，导线需要绕过起始图形
                    case 'left': {
                        //绕过最近的一个顶部或底部
                        firstStart.x = endShapeBound.right + maxFirstStep;
                        var p1 = {x: firstStart.x, y: endShapeBound.top - maxFirstStep};
                        //如果超过了起始点，则直连即可
                        if(firstStart.x >= start.x) {
                            p1.y = firstStart.y;
                            firstStart.x = start.x;
                            firstEnd.x = end.x;
                        }

                        var p2 = {x: firstEnd.x, y: p1.y};
                        this.points.push(p1);
                        break;
                    }
                    //结束点在图形上方
                    case 'top': {
                        //绕过图形连结
                        firstStart.x = endShapeBound.right + maxFirstStep;
                        //如果绕过结束图形的X位超过起始X位，则采用起始X位
                        if(firstStart.x >= start.x) {
                            firstStart.x = start.x;
                        }

                        var p1 = {x:firstStart.x, y: firstEnd.y};
                        
                        this.points.push(p1);
                        break;
                    }
                    //结束位在图形右边
                    case 'right': {           
                        //这里啥都不用干，直连  
                        firstStart.x = firstEnd.x = start.x;           
                        break;
                    }

                    //结束位在图形底部
                    //从起始图形下边绕过
                    case 'bottom': {
                        //绕过图形连结
                        firstStart.x = endShapeBound.right + maxFirstStep;
                        //如果绕过结束图形的X位超过起始X位，则采用起始X位
                        if(firstStart.x >= start.x) {
                            firstStart.x = start.x;
                            firstEnd.x = start.x;
                        }

                        var p1 = {x:firstStart.x, y: firstEnd.y};
                        
                        this.points.push(p1);
                        break;
                    }
                }
            }
            //起始位在图形上边
            else if(this.start.pos == 'top') {
                //然后根据结束点的方位来连线
                switch(this.end.pos) {
                    //结束点为左侧的情况下
                    case 'left': {
                        firstStart.y = Math.min(firstStart.y, endShapeBound.right + maxFirstStep);

                        //绕过顶部
                        var p1 = {x:firstEnd.x, y: firstStart.y};                        

                        //如果起始位小于结束图形右侧，则直连
                        if(firstStart.x <= endShapeBound.right) {
                            firstStart.y = start.y;
                            firstEnd.x = start.x;
                            p1 = start;
                        }                        
                        
                        this.points.push(p1);
                        break;
                    }
                    //结束点在图形上方
                    case 'top': {
                        //直连偏移点即可
                        firstStart.y = firstEnd.y = Math.min(firstStart.y, firstEnd.y);
                        break;
                    }
                    //结束位在图形右边
                    case 'right': {                        
                        //从二图之间的空隙连接
                        var p1 = {x: firstEnd.x, y: firstStart.y};
                        //如果转折处太靠近起始图形，则直连
                        if(p1.x >= startShapeBound.left) {
                            p1.y = firstStart.y = start.y;
                            firstEnd.x = p1.x = start.x;
                        }

                        this.points.push(p1);
                        break;
                    }

                    //结束位在图形底部
                    //从起始图形下边绕过
                    case 'bottom': {                        
                        //从二图之间的空隙连接
                        var p1 = {x: endShapeBound.right + maxFirstStep, y: firstStart.y};

                        this.points.push(p1);

                        //如果转折处太靠近起始图形，则直连
                        if(p1.x >= startShapeBound.left) {
                            p1.y = firstStart.y = start.y;
                            firstEnd.x = p1.x = start.x;
                            firstEnd.y = p1.y;
                            
                        }
                        else {
                            var p2 = {x: p1.x, y:firstEnd.y};
                            this.points.push(p2);
                        }
                        break;
                    }
                }
            }
            //起始位在图形右边
            else if(this.start.pos == 'right') {
                //然后根据结束点的方位来连线
                switch(this.end.pos) {
                    //结束点为左侧的情况下
                    case 'left': {
                        //绕过二个图形
                        //从顶部绕过
                        var p1 = {x: firstStart.x, y: Math.min(startShapeBound.top - maxFirstStep, endShapeBound.top - maxFirstStep)};
                        var p2 = {x: firstEnd.x, y: p1.y};
                        this.points.push(p1,p2);
                        break;
                    }
                    //结束点在图形上方
                    case 'top': {
                        //绕过起始图形上方
                        var p1 = {x: firstStart.x, y: startShapeBound.top - maxFirstStep};
                        p1.y = firstEnd.y = Math.min(p1.y, firstEnd.y);
                        this.points.push(p1);
                        break;
                    }
                    //结束位在图形右边
                    case 'right': {                        
                        var p1 = {x: firstStart.x, y: startShapeBound.top - maxFirstStep};
                        var p2 = {x: firstEnd.x, y: p1.y};
                        //如果绕线在起始点左侧太近，则直连
                        if(p2.x >= startShapeBound.left) {
                            p1.y = p2.y = firstStart.y;
                            p2.x = firstEnd.x = p1.x;
                        }
                        this.points.push(p1, p2);
                        break;
                    }

                    //结束位在图形底部
                    case 'bottom': {                        
                        //绕过起始图形下方
                        var p1 = {x: firstStart.x, y: startShapeBound.bottom + maxFirstStep};
                        p1.y = firstEnd.y = Math.max(p1.y, firstEnd.y);
                        this.points.push(p1);
                        break;
                    }
                }
            }
            //起始位在图形底 边
            else if(this.start.pos == 'bottom') {
                //然后根据结束点的方位来连线
                switch(this.end.pos) {
                    //结束点为左侧的情况下
                    case 'left': {
                        //偏离底部
                        firstStart.y = Math.max(firstStart.y, endShapeBound.bottom + maxFirstStep);
                        var p1 = {x: firstEnd.x, y: firstStart.y};
                        this.points.push(p1);
                        break;
                    }
                    //结束点在图形上方
                    case 'top': {     
                        //从二图形中间过去，如果太近就往外绕                
                        var p1 = {x: startShapeBound.left/2 + endShapeBound.right/2, y: firstStart.y};
                        //太近则从底部绕过去
                        if(p1.x >= startShapeBound.left || p1.x <= endShapeBound.right) {
                            p1.x = Math.max(startShapeBound.right + maxFirstStep, endShapeBound.right + maxFirstStep);
                            firstEnd.y = Math.min(firstEnd.y, startShapeBound.top - maxFirstStep);
                        }
                        
                        var p2 = {x: p1.x, y: firstEnd.y};                        
                        this.points.push(p1,p2);
                        break;
                    }
                    //结束位在图形右边
                    case 'right': {                         
                        //从中间连线
                        var p1 = {x: firstEnd.x, y: firstStart.y};  
                        //太近则直连
                        if(p1.x >= startShapeBound.left || p1.x <= endShapeBound.right) {
                            p1.x = firstEnd.x = start.x;
                            p1.y = firstStart.y= firstEnd.y = start.y;
                        }          
                        this.points.push(p1);
                        break;
                    }
                    //结束位在图形底部
                    case 'bottom': {   
                        firstStart.y = firstEnd.y = Math.max(firstStart.y, firstEnd.y);
                        break;
                    }
                }
            }
        }

        //图形连图形从上向下垂直方位
        function shape2ShapeTop2Bottom(start, end, firstStart, firstEnd, maxFirstStep) {            
            //起始图形的边界信息
            var startShapeBound = this.start.parent.getBounds();
            var endShapeBound = this.end.parent.getBounds();
            //起始点为图形的左侧                       
            if(this.start.pos == 'left') {
                //然后根据结束点的方位来连线
                switch(this.end.pos) {
                    //结束点为左侧的情况下
                    case 'left': {
                        //不需要做任何事件，直接连接偏移点
                        firstStart.x = start.x;
                        //结束点的偏移点也得移到起始点
                        firstEnd.y = start.y;
                        break;
                    }
                    //结束点在图形上方
                    case 'top': {
                        var p1 = {x: firstStart.x, y: firstEnd.y};
                        //如果上下离太近，则直连
                        if(firstEnd.y <= startShapeBound.bottom) {
                            firstStart.x = p1.x = start.x;
                            firstEnd.y = p1.y = start.y;
                        }
                        this.points.push(p1);
                        break;
                    }
                    //结束位在图形右边
                    case 'right': {           
                        //如果图形距离够远，则之字相连
                        if(startShapeBound.bottom <= endShapeBound.top - maxFirstStep) {
                            var p1 = {x: firstStart.x, y: startShapeBound.bottom/2+endShapeBound.top/2};
                            var p2 = {x: firstEnd.x, y: p1.y};
                            this.points.push(p1, p2);
                        }
                        else {
                            //直连
                            firstEnd.x = firstStart.x = start.x;
                            firstEnd.y = firstStart.y;
                        }       
                        break;
                    }

                    //结束位在图形底部
                    //从起始图形下边绕过
                    case 'bottom': {
                        //如果起始点离结束图形顶部够距离，则绕过结束图形
                        if(start.y <= endShapeBound.top - maxFirstStep) {
                            firstStart.x = Math.min(firstStart.x, endShapeBound.left - maxFirstStep);
                            var p1 = {x: firstStart.x, y: firstEnd.y};
                            this.points.push(p1);
                        }
                        else {
                            //直连
                            firstStart.x = start.x;
                            firstEnd.y = start.y;
                        }
                        break;
                    }
                }
            }
            //起始位在图形上边
            else if(this.start.pos == 'top') {
                //然后根据结束点的方位来连线
                switch(this.end.pos) {
                    //结束点为左侧的情况下
                    case 'left': {                        
                        //绕过顶部
                        var p1 = {x:startShapeBound.left - maxFirstStep, y: firstStart.y};
                        //最左侧取结束点偏移位和起始图形左侧 最左的值
                        p1.x = firstEnd.x = Math.min(p1.x,firstEnd.x);              
                        this.points.push(p1);
                        break;
                    }
                    //结束点在图形上方
                    case 'top': {
                        //太近则直连
                        if(endShapeBound.top <= startShapeBound.bottom + maxFirstStep) {
                            firstStart.y = firse.y = start.y;
                        }
                        else {
                            //从左侧绕过起始图形
                            var p1 = {x: startShapeBound.x - maxFirstStep, y: firstStart.y};
                            var p2 = {x: p1.x, y: firstEnd.y};
                            this.points.push(p1,p2); 
                        }
                        break;
                    }
                    //结束位在图形右边
                    case 'right': {  
                        var p1 = {x: Math.max(startShapeBound.right + maxFirstStep, firstEnd.x), y: firstStart.y}; 
                        firstEnd.x = p1.x;
                        this.points.push(p1);
                        break;
                    }

                    //结束位在图形底部
                    case 'bottom': {                        
                        //从右侧绕到底部
                        var p1 = {x: Math.max(startShapeBound.right + maxFirstStep, endShapeBound.right + maxFirstStep), y: firstStart.y};
                        var p2 = {x: p1.x, y: firstEnd.y};
                        this.points.push(p1, p2);
                        break;
                    }
                }
            }
            //起始位在图形右边
            else if(this.start.pos == 'right') {
                //然后根据结束点的方位来连线
                switch(this.end.pos) {
                    //结束点为左侧的情况下
                    case 'left': {
                        var p1 = {x: firstStart.x, y: endShapeBound.top - maxFirstStep};                        
                        //太近则取中位走，否则贴近结束图形
                        if(startShapeBound.bottom >= p1.y) {
                            p1.y = end.y /2 + start.y/2;
                        }
                        var p2 = {x: firstEnd.x, y: p1.y};
                        this.points.push(p1, p2);
                        break;
                    }
                    //结束点在图形上方
                    case 'top': {
                        //太近直连
                        if(start.y >= firstEnd.y - maxFirstStep) {
                            firstStart.x = start.x;
                            firstEnd.y = start.y;
                        }
                        else {
                            var p1 = {x: firstStart.x, y: firstEnd.y};
                            this.points.push(p1);
                        }                        
                        break;
                    }
                    //结束位在图形右边
                    case 'right': {   
                        //偏移点直连，啥也不用做
                        break;
                    }

                    //结束位在图形底部
                    case 'bottom': {                        
                        //绕过结束图形右侧
                        firstStart.x = Math.max(firstStart.x, startShapeBound.right + maxFirstStep);
                        var p1 = {x: firstStart.x, y: firstEnd.y};
                        this.points.push(p1);
                        break;
                    }
                }
            }
            //起始位在图形底 边
            else if(this.start.pos == 'bottom') {
                //然后根据结束点的方位来连线
                switch(this.end.pos) {
                    //结束点为左侧的情况下
                    case 'left': {
                        //结束图形顶部偏移位置转折
                        firstStart.y = Math.max(firstStart.y, endShapeBound.top - maxFirstStep);
                        var p1 = {x: firstEnd.x, y: firstStart.y};
                        this.points.push(p1);
                        break;
                    }
                    //结束点在图形上方
                    case 'top': {     
                        //直连
                        firstStart.y = start.y;
                        firstEnd.y = end.y;
                        break;
                    }
                    //结束位在图形右边
                    case 'right': {                         
                        //结束图形顶部偏移位置转折
                        firstStart.y = Math.max(firstStart.y, endShapeBound.top - maxFirstStep);
                        var p1 = {x: firstEnd.x, y: firstStart.y};
                        this.points.push(p1);
                        break;
                    }
                    //结束位在图形底部
                    case 'bottom': { 
                        //如果上下太近，则直连
                        if(firstStart.y >= endShapeBound.top) {
                            firstStart.y = firstEnd.y = start.y;
                        }
                        else {
                            //从结束图形右侧绕过去
                            var p1 = {x: endShapeBound.right + maxFirstStep, y: firstStart.y};
                            var p2 = {x: p1.x, y: firstEnd.y};
                            this.points.push(p1, p2);
                        }
                        
                        break;
                    }
                }
            }
        }

        //图形连图形从下向上垂直方位
        function shape2ShapeBottom2Top(start, end, firstStart, firstEnd, maxFirstStep) {            
            //起始图形的边界信息
            var startShapeBound = this.start.parent.getBounds();
            var endShapeBound = this.end.parent.getBounds();
            //起始点为图形的左侧                       
            if(this.start.pos == 'left') {
                //然后根据结束点的方位来连线
                switch(this.end.pos) {
                    //结束点为左侧的情况下，从左侧偏移位连
                    case 'left': {
                        //啥都不用做
                        break;
                    }
                    //结束点在图形上方
                    case 'top': {
                        //左侧绕上
                        var p1 = {x: endShapeBound.left - maxFirstStep, y: firstEnd.y};
                        p1.x = firstStart.x = Math.min(p1.x, firstStart.x);
                        //太近直连
                        if(endShapeBound.bottom >= start.y) {
                            p1.x = firstStart.x = firstEnd.x = start.x;
                            p1.y = firstEnd.y = start.y;
                        }
                        this.points.push(p1);
                        break;
                    }
                    //结束位在图形右边
                    case 'right': {           
                        //之字连
                        var p1 = {x: firstStart.x, y: endShapeBound.bottom + maxFirstStep};
                        
                        //太近，则直连
                        if(p1.y >= startShapeBound.top) {
                            p1.x = firstStart.x = firstEnd.x = start.x;                            
                            p1.y = firstEnd.y = start.y;
                        }
                        else {
                            var p2 = {x: firstEnd.x, y: p1.y};
                            this.point.push(p1, p2); 
                        }        
                        break;
                    }

                    //结束位在图形底部
                    case 'bottom': {
                        var p1 = {x:firstStart.x, y: firstEnd.y};
                        if(p1.y >= startShapeBound.top) {
                            p1.y = firstEnd.y = start.y;
                            p1.x = firstStart.x = firstEnd.x = start.x;
                        }
                        this.points.push(p1);
                        break;
                    }
                }
            }
            //起始位在图形上边
            else if(this.start.pos == 'top') {
                //然后根据结束点的方位来连线
                switch(this.end.pos) {
                    //结束点为左侧的情况下
                    case 'left': {
                        if(endShapeBound.bottom >= firstStart.y) {
                            firstStart.y = firstEnd.y = start.y;
                            firstEnd.x = start.x;
                        }
                        else {
                            //离了二个偏移量，则更靠近上面的图形
                            if(endShapeBound.bottom < firstStart.y - maxFirstStep) {
                                firstStart.y = endShapeBound.bottom + maxFirstStep;
                            }
                            
                            var p1 = {x: firstEnd.x, y: firstStart.y};
                            this.points.push(p1);
                        }
                        break;
                    }
                    //结束点在图形上方
                    case 'top': {
                        if(endShapeBound.bottom >= firstStart.y) {
                            firstStart.y = firstEnd.y = start.y;
                            firstEnd.x = start.x;
                        }
                        else {
                            //离了二个偏移量，则更靠近上面的图形
                            if(endShapeBound.bottom < firstStart.y - maxFirstStep) {
                                firstStart.y = endShapeBound.bottom + maxFirstStep;
                            }
                            var p1 = {x: firstEnd.x, y: firstStart.y};
                            var p2 = {x: p1.x, y: firstEnd.y};
                            this.points.push(p1, p2);
                        }
                        break;
                    }
                    //结束位在图形右边
                    case 'right': {                        
                        if(endShapeBound.bottom >= firstStart.y) {
                            firstStart.y = firstEnd.y = start.y;
                            firstEnd.x = start.x;
                        }
                        else {
                            //离了二个偏移量，则更靠近上面的图形
                            if(endShapeBound.bottom < firstStart.y - maxFirstStep) {
                                firstStart.y = endShapeBound.bottom + maxFirstStep;
                            }
                            var p1 = {x: firstEnd.x, y: firstStart.y};
                            this.points.push(p1);
                        }
                        break;
                    }

                    //结束位在图形底部
                    case 'bottom': {  
                        //直连
                        firstStart.y = firstEnd.y = start.y;
                        break;
                    }
                }
            }
            //起始位在图形右边
            else if(this.start.pos == 'right') {
                //然后根据结束点的方位来连线
                switch(this.end.pos) {
                    //结束点为左侧的情况下
                    case 'left': {
                        var p1 = {x: firstStart.x, y: endShapeBound.bottom + maxFirstStep};
                        //太近，则走中线
                        if(startShapeBound.top <= p1.y && startShapeBound.top > endShapeBound.bottom) {
                            p1.y = startShapeBound.top/2 + endShapeBound.bottom/2;
                        }
                        //有相交后，则直连
                        else if(startShapeBound.top < endShapeBound.bottom) {
                            firstEnd.y = start.y;
                            firstStart.x = firstEnd.x = start.x;
                            break;
                        }
                        
                        var p2 = {x: firstEnd.x, y: p1.y};
                        this.points.push(p1, p2);                       
                        break;
                    }
                    //结束点在图形上方
                    case 'top': {
                        //走结束图形右侧上连
                        firstStart.x = Math.max(firstStart.x, endShapeBound.right + maxFirstStep);
                        var p1 = {x: firstStart.x, y: firstEnd.y};
                        this.points.push(p1);
                        break;
                    }
                    //结束位在图形右边
                    case 'right': { 
                        break;
                    }
                    //结束位在图形底部
                    case 'bottom': {    
                        //如果偏移点离起始图形太近，则取空隔中位
                        if(firstEnd.y >= startShapeBound.top) {
                            firstEnd.y = startShapeBound.top/2 + endShapeBound.bottom/2;
                        }
                        var p1 = {x: firstStart.x, y: firstEnd.y};
                        this.points.push(p1);
                        break;
                    }
                }
            }
            //起始位在图形底边
            else if(this.start.pos == 'bottom') {
                //然后根据结束点的方位来连线
                switch(this.end.pos) {
                    //结束点为左侧的情况下
                    case 'left': {
                        //偏离底部                        
                        var p1 = {x: 0, y: firstStart.y};
                        p1.x = Math.min(firstEnd.x, startShapeBound.left - maxFirstStep);
                        this.points.push(p1);
                        break;
                    }
                    //结束点在图形上方
                    case 'top': {     
                        var p1 = {x: 0, y: firstStart.y};
                        p1.x = Math.min(endShapeBound.left - maxFirstStep, startShapeBound.left - maxFirstStep);
                        var p2 = {x: p1.x, y: firstEnd.y};
                        this.points.push(p1, p2);
                        break;
                    }
                    //结束位在图形右边
                    case 'right': {                         
                        var p1 = {x: 0, y: firstStart.y};
                        p1.x = Math.min(firstEnd.x, startShapeBound.right + maxFirstStep);
                        this.points.push(p1);
                        break;
                    }
                    //结束位在图形底部
                    case 'bottom': {   
                        //隔太近，则直连
                        if(firstEnd.y >= startShapeBound.top) {
                            firstStart.y = firstEnd.y = start.y;
                        }
                        else {
                            var p1 = {x: startShapeBound.left - maxFirstStep, y: firstStart.y};
                            var p2 = {x: p1.x, y: firstEnd.y};
                            this.points.push(p1, p2);
                        }                        
                        break;
                    }
                }
            }
        }
        //图形连图形从右下往左上
        function shape2ShapeRightBottom2LeftTop(start, end, firstStart, firstEnd, maxFirstStep) {            
            //起始图形的边界信息
            var startShapeBound = this.start.parent.getBounds();
            var endShapeBound = this.end.parent.getBounds();
            //起始点为图形的左侧                       
            if(this.start.pos == 'left') {
                //然后根据结束点的方位来连线
                switch(this.end.pos) {
                    //结束点为左侧的情况下，从左侧偏移位连
                    case 'left': {
                        //直连结束图形左偏移点垂直线
                        var p1 = {x: firstEnd.x, y: start.y};
                        this.points.push(p1);
                        break;
                    }
                    //结束点在图形上方
                    case 'top': {
                        //如果起始点左偏移点在结束图形右侧偏左，则从结束图形左侧绕过
                        //否则从右侧绕过
                        var p1 = {x: endShapeBound.right + maxFirstStep, y: firstEnd.y};
                        if(firstStart.x < p1.x) {
                            p1.x = endShapeBound.left - maxFirstStep;
                            if(firstStart.y <= endShapeBound.bottom) {
                                p1.x = firstEnd.x = start.x;
                                p1.y = firstEnd.y = start.y;
                            }
                        }
                        firstStart.x = p1.x;
                        this.points.push(p1);
                        break;
                    }
                    //结束位在图形右边
                    case 'right': {        
                        //只要不是太近，就走贴近结束图形右侧，否则中线  
                        if(firstStart.x < firstEnd.x) {
                            firstStart.x = firstEnd.x / 2 + firstStart.x / 2;
                            firstEnd.x = firstStart.x;
                        }
                        else {
                            firstStart.x = firstEnd.x;
                        }
                        break;
                    }
                    //结束位在图形底部
                    case 'bottom': {
                        firstStart.x = firstEnd.x;
                        firstEnd.y = Math.min(firstStart.y, firstEnd.y);
                        break;
                    }
                }
            }
            //起始位在图形上边
            else if(this.start.pos == 'top') {
                //然后根据结束点的方位来连线
                switch(this.end.pos) {
                    //结束点为左侧的情况下
                    case 'left': {                        
                        //如果上下太近，则从结束图形顶部绕过
                        if(firstStart.y < endShapeBound.bottom) {
                            //如果交X，则直连
                            if(firstStart.x <= endShapeBound.right) {
                                firstEnd.x = end.x;
                                firstStart.y = end.y;
                            }
                            //从顶部绕
                            else {
                                firstStart.y = Math.min(firstStart.y, endShapeBound.top - maxFirstStep);
                                var p1 = {x: firstEnd.x, y: firstStart.y};
                                this.points.push(p1);
                            }
                        }
                        else {
                            var p1 = {x: firstEnd.x, y: firstStart.y};
                            this.points.push(p1);
                        }
                        break;
                    }
                    //结束点在图形上方
                    case 'top': {
                        //起点与结束图形X轴交X
                        if(firstStart.x <= endShapeBound.right) {
                            //而且Y轴交X，则直连
                            if(firstStart.y <= endShapeBound.bottom) {
                                firstEnd.y = firstStart.y = start.y;
                                firstEnd.x = start.x;
                            }
                            else {
                                var p1 = {x: endShapeBound.right + maxFirstStep, y: firstStart.y};
                                var p2 = {x: p1.x, y: firstEnd.y};
                                this.point.push(p1, p2);
                            }
                        }
                        else {
                            firstStart.y = firstEnd.y;
                        }
                        break;
                    }
                    //结束位在图形右边
                    case 'right': {                        
                        firstStart.y = Math.max(firstEnd.y, firstStart.y);
                        firstEnd.x = Math.min(firstEnd.x, firstStart.x);
                        break;
                    }

                    //结束位在图形底部
                    case 'bottom': {  
                        firstStart.y = firstEnd.y = Math.max(firstEnd.y, firstStart.y);
                        break;
                    }
                }
            }
            //起始位在图形右边 TODO::
            else if(this.start.pos == 'right') {
                //然后根据结束点的方位来连线
                switch(this.end.pos) {
                    //结束点为左侧的情况下
                    case 'left': {
                        var p1 = {x: firstStart.x, y: endShapeBound.bottom + maxFirstStep};
                        //太近，则走中线
                        if(startShapeBound.top <= p1.y && startShapeBound.top > endShapeBound.bottom) {
                            p1.y = startShapeBound.top/2 + endShapeBound.bottom/2;
                        }
                        //有相交后，则直连
                        else if(startShapeBound.top < endShapeBound.bottom) {
                            firstEnd.y = start.y;
                            firstStart.x = firstEnd.x = start.x;
                            break;
                        }
                        
                        var p2 = {x: firstEnd.x, y: p1.y};
                        this.points.push(p1, p2);                       
                        break;
                    }
                    //结束点在图形上方
                    case 'top': {
                        //走结束图形右侧上连
                        firstStart.x = Math.max(firstStart.x, endShapeBound.right + maxFirstStep);
                        var p1 = {x: firstStart.x, y: firstEnd.y};
                        this.points.push(p1);
                        break;
                    }
                    //结束位在图形右边
                    case 'right': { 
                        break;
                    }
                    //结束位在图形底部
                    case 'bottom': {    
                        //如果偏移点离起始图形太近，则取空隔中位
                        if(firstEnd.y >= startShapeBound.top) {
                            firstEnd.y = startShapeBound.top/2 + endShapeBound.bottom/2;
                        }
                        var p1 = {x: firstStart.x, y: firstEnd.y};
                        this.points.push(p1);
                        break;
                    }
                }
            }
            //起始位在图形底边
            else if(this.start.pos == 'bottom') {
                //然后根据结束点的方位来连线
                switch(this.end.pos) {
                    //结束点为左侧的情况下
                    case 'left': {
                        //偏离底部                        
                        var p1 = {x: 0, y: firstStart.y};
                        p1.x = Math.min(firstEnd.x, startShapeBound.left - maxFirstStep);
                        this.points.push(p1);
                        break;
                    }
                    //结束点在图形上方
                    case 'top': {     
                        var p1 = {x: 0, y: firstStart.y};
                        p1.x = Math.min(endShapeBound.left - maxFirstStep, startShapeBound.left - maxFirstStep);
                        var p2 = {x: p1.x, y: firstEnd.y};
                        this.points.push(p1, p2);
                        break;
                    }
                    //结束位在图形右边
                    case 'right': {                         
                        var p1 = {x: 0, y: firstStart.y};
                        p1.x = Math.min(firstEnd.x, startShapeBound.right + maxFirstStep);
                        this.points.push(p1);
                        break;
                    }
                    //结束位在图形底部
                    case 'bottom': {   
                        //隔太近，则直连
                        if(firstEnd.y >= startShapeBound.top) {
                            firstStart.y = firstEnd.y = start.y;
                        }
                        else {
                            var p1 = {x: startShapeBound.left - maxFirstStep, y: firstStart.y};
                            var p2 = {x: p1.x, y: firstEnd.y};
                            this.points.push(p1, p2);
                        }                        
                        break;
                    }
                }
            }
        }
        /**
         * 重写控件移动事件
         */
        this.offset = function(offx, offy, trans) {
            
            //如果是元素的连接点，则取其中心
            if(this.start.type == 'jmConnectPoint') {
                this.start = jmUtils.clone(this.start.getCenter(true, true));
            }
            if(this.end.type == 'jmConnectPoint') {
                this.end = jmUtils.clone(this.end.getCenter(true, true));
            }
            this.start.x += offx;
            this.start.y += offy,
            this.end.x += offx;
            this.end.y += offy;

            //触发控件移动事件  
            this.emit('move',{offsetX:offx,offsetY:offy,trans:trans});
        }

        //选中当前图形
        this.on('select', function(selected){            
            this.startDragShape.visible = selected;
            this.endDragShape.visible = selected;      
            //当选中时，层级置顶   
            if(selected) {
                this.lastZIndex = this.style.zIndex;
                this.style.zIndex = 10000;
            }
            else {
                this.style.zIndex = this.lastZIndex;
            }
        });

        //鼠标进入时显示可移动
        this.bind('mouseover', function(){
            this.cursor('move');
        });
        this.bind('mouseleave', function(){
            this.cursor('default');
        });
        //当前线条移动后，触发其它元素显示状态
        this.on('move', function(e){
            this.checkConnectPointsStatus();           
        });
        this.on('moveend', function(e){
            this.checkConnectPointsStatus(true, function(start, end) {
                if(start) this.start = start;
                if(end) this.end = end;
            });
        });
        //检查当前跟连接点情况，显示可连或焦点
        //hide 强制指定是隐掉连接点
        this.checkConnectPointsStatus = function(hide, callback) {
            var minLen = 80;//指定触发靠近的距离
            var self = this;
            //连接线二头合中的连接点
            var startPoint = null;
            var endPoint = null;

            this.editor.cells.each(function(i,cell) {
                if(cell.type == 'baseFlow_polyarrow') return;
               
                var start = self.start;
                var end = self.end;
                //如果是元素的连接占，则取其中心
                if(start.type == 'jmConnectPoint') {
                    start = start.getCenter(true, true);
                }
                if(end.type == 'jmConnectPoint') {
                    end = end.getCenter(true, true);
                }
                var o = !hide && (cell.checkPoint(start, minLen) || cell.checkPoint(end, minLen));//起点或终点是否进入了图形
                //如果不在图形内，则计算到它每个连接点的距离，如果近也认为可以出现连接点
                if(cell.connectPoints) {
                    var loc = cell.getLocation();
                    for(var i = cell.connectPoints.length - 1;i >= 0;i--) {
                        var c = cell.connectPoints[i];
                        var center = c.getCenter(true, true);//获取绝对中心位置
                        var r = jmUtils.getDistance(start, center);//计算起点距离
                        if(r <= minLen) {
                            o = !hide;
                            //如果进入连接点，则高亮显示
                            if(r < c.width*2) {
                                c.sideShape.visible = o;
                                startPoint = c;
                            }
                            else {
                                c.sideShape.visible = false;
                            }
                        }
                        r = jmUtils.getDistance(end, center);//计算离结束点距离
                        if(r <= minLen) {
                            o = !hide;
                            //如果进入连接点，则高亮显示
                            if(r <  c.width*2) {
                                c.sideShape.visible = o;
                                endPoint = c;
                            }
                            else {
                                c.sideShape.visible = false;
                            }
                        }
                    } 
                }
                
                cell.connectPointsVisible&&cell.connectPointsVisible(o);
            });
            callback && callback.call(this, startPoint, endPoint);
        }
    }
    //图型类型名
    shapeType.prototype.type = stName;
    shapeType.ico = 'img/shapes/baseflow/polyarrow.png';
    shapeType.nickName = '动态连线';
    jmDraw.shapeTypes[stName] = shapeType; //挂截到jmDraw下
 })('baseFlow_polyarrow');