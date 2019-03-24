/**
 *  基本流程图形状
 */


//流程 长方体
(function(stName){    
    /**
     * @param {object} 参照jmElement 的参数
     */
    function shapeType(option){        
        option = jmUtils.extend(option||{}, {		
            shapeName: 'rect', //方型
            position :{x:300,y:50},
            width:100,
            height:60
        });
        //继承jmElement
        jmUtils.extend(this, new jmDraw.jmElement());
        //初始化节点
        this.init(option);
    }
    //图型类型名
    shapeType.prototype.type = stName;
    shapeType.ico = 'img/shapes/baseflow/process.png';
    shapeType.nickName = '流程';
    jmDraw.shapeTypes[stName] = shapeType; //挂截到jmDraw下
 })('baseFlow_process');

 //卡
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
        //继承jmElement
        jmUtils.extend(this, new jmDraw.jmElement());

        //初始化节点
        this.init(option);

        //重置图形生成
        this.shape.initPoints = function() {
            var location = this.getLocation();	
            var ltw = 20; //左上角缺角边长
            var lth = 20; //左上角缺角边高
            if(ltw > location.width) ltw = location.width;
            if(lth > location.height) lth = location.height;

            var p1 = {x:location.left,y:location.top+lth};
            var p2 = {x:location.left + ltw,y:location.top};
            var p3 = {x:location.left + location.width,y:location.top};
            var p4 = {x:location.left + location.width,y:location.top + location.height}; 
            var p5 = {x:location.left,y:location.top + location.height};              
            
            this.points = [];
            this.points.push(p1);
            this.points.push(p2);
            this.points.push(p3);
            this.points.push(p4);            	
            this.points.push(p5);   
            return this.points;
        }
    }
    //图型类型名
    shapeType.prototype.type = stName;
    shapeType.ico = 'img/shapes/baseflow/card.png';
    shapeType.nickName = '卡';
    jmDraw.shapeTypes[stName] = shapeType; //挂截到jmDraw下
 })('baseFlow_card');

 //循环界限
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
        //继承jmElement
        jmUtils.extend(this, new jmDraw.jmElement());

        //初始化节点
        this.init(option);

        //重置图形生成
        this.shape.initPoints = function() {
            var location = this.getLocation();	
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
    //图型类型名
    shapeType.prototype.type = stName;
    shapeType.ico = 'img/shapes/baseflow/cyclelimit.png';
    shapeType.nickName = '循环界限';
    jmDraw.shapeTypes[stName] = shapeType; //挂截到jmDraw下
 })('baseFlow_cyclelimit');

 //数据
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
        //继承jmElement
        jmUtils.extend(this, new jmDraw.jmElement());

        //初始化节点
        this.init(option);

        //重置图形生成
        this.shape.initPoints = function() {
            var loc = this.getLocation();	
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
            if(this.parent.connectLeft) this.parent.connectLeft.center().x = p4.x + ltw/2;
            if(this.parent.connectRight) this.parent.connectRight.center().x = p2.x - ltw/2;

            return this.points;
        }
    }
    //图型类型名
    shapeType.prototype.type = stName;
    shapeType.ico = 'img/shapes/baseflow/data.png';
    shapeType.nickName = '数据';
    jmDraw.shapeTypes[stName] = shapeType; //挂截到jmDraw下
 })('baseFlow_data');

 //内容
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
        //继承jmElement
        jmUtils.extend(this, new jmDraw.jmElement());

        //初始化节点
        this.init(option);

        //重置图形生成
        this.shape.initPoints = function() {
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
        this.shape.draw = function() {	
            //获取父元素绝对坐标
            var bounds = this.parent && this.parent.absoluteBounds?this.parent.absoluteBounds:this.absoluteBounds;

            this.context.arc(this.leftCenter1.x + bounds.left,this.leftCenter1.y + bounds.top,this.leftRadius, -this.leftStartAngle1,-this.leftEndAngle1, true);
            this.context.arc(this.leftCenter2.x + bounds.left,this.leftCenter2.y + bounds.top,this.leftRadius, -this.leftStartAngle2,-this.leftEndAngle2, true);
            this.context.lineTo(bounds.left + this.rightKeyPoint1.x, bounds.top + this.rightKeyPoint1.y);	
            this.context.arc(this.rightCenter.x + bounds.left,this.rightCenter.y + bounds.top,this.rightRadius, -this.rightStartAngle,-this.rightEndAngle, true);
            this.context.lineTo(bounds.left + this.rightKeyPoint2.x, bounds.top + this.rightKeyPoint2.y);	
        }
    }
    //图型类型名
    shapeType.prototype.type = stName;
    shapeType.ico = 'img/shapes/baseflow/content.png';
    shapeType.nickName = '内容';
    jmDraw.shapeTypes[stName] = shapeType; //挂截到jmDraw下
 })('baseFlow_content');

 //DB数据库
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
        //继承jmElement
        jmUtils.extend(this, new jmDraw.jmElement());

        //初始化节点
        this.init(option);
        //重置图形生成
        this.shape.initPoints = function() {
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
    //图型类型名
    shapeType.prototype.type = stName;
    shapeType.ico = 'img/shapes/baseflow/db.png';
    shapeType.nickName = '数据库';
    shapeType.defaultSize = {width: 40, height: 66};
    jmDraw.shapeTypes[stName] = shapeType; //挂截到jmDraw下
 })('baseFlow_db');


 //推迟
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
        //继承jmElement
        jmUtils.extend(this, new jmDraw.jmElement());

        //初始化节点
        this.init(option);
        //重置图形生成
        this.shape.initPoints = function() {
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
    //图型类型名
    shapeType.prototype.type = stName;
    shapeType.ico = 'img/shapes/baseflow/delay.png';
    shapeType.nickName = '推迟';
    jmDraw.shapeTypes[stName] = shapeType; //挂截到jmDraw下
 })('baseFlow_depay');