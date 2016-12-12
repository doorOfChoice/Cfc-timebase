
$.fn.jTimebase = function(option){
  var setting = $.extend({
    id_contentPane                : '#contentPane' , //内容控制面板id
    id_timeControl                : '#timeControl' , //时间控制面板id
    class_timeActived             : 'tim_actived'  , //时间控制面板激活
    class_timeInActived           : 'tim_inactived', //时间控制面板失活
    class_contentActived          : 'cot_actived'  , //内容控制面板激活
    class_contentInActived        : 'cot_inactived', //内容控制面板失活
    class_contentOver             : 'cot_over' ,     //鼠标覆盖内容面板
    class_contentLeave            : 'cot_leave',     //鼠标离开内容面板
    speed_timeControl             : 35  ,            //时间控制面板动画速度
    speed_contentPane             : 35  ,            //内容控制面板动画速度
    property_timeRadiusRate       : 0.5 ,            //时间控制面板元素半径
    property_contentWidthRate     : 0.4 ,            //内容面板的宽度百分比
    property_contentHeightRate    : 0.4 ,            //内容面板的高度百分比
    property_contentIntervalRate  : 0.2 ,            //内容面板元素间隔百分比
    boolean_timeRotation          : true,            //是否开启时间控制面板
    boolean_contentMove           : true	     //是否开启内容控制面板
  } , option);

  if($(setting.id_contentPane).length > 0 ||
     $(setting.id_timeControl).length > 0 ||
     $(setting.id_clockPane).length   > 0){

     var clockPane   = $($(setting.id_clockPane)[0]),   //时钟控制面板
         contentPane = $($(setting.id_contentPane)[0]), //内容控制面板
         timeControl = $($(setting.id_timeControl)[0]), //时间控制面板
         clockPane_Child   = clockPane.children()  ,    //时钟控制面板的孩子
         contentPane_Child = contentPane.children(),    //内容控制面板的孩子
         timeControl_Child = timeControl.children(),    //时间控制面板的孩子
         timeWidth     = timeControl.width(),           //时间控制面板的宽度
         contentWidth  = contentPane.width(),           //内容控制面板的宽度
         timeHeight    = timeControl.height(),          //时间控制面板的中心
         contentHeight = contentPane.height(),          //内容控制面板的高度
         timeCenterX   = timeWidth  / 2,                //时间控制面板的中心X
         timeCenterY   = timeHeight / 2,                //时间控制面板的中心Y
         contentCenterX = contentWidth  / 2,            //内容控制面板的中心X
         contentCenterY = contentHeight / 2;            //内容控制面板的中心Y

     var  listenTime,               //时间控制面板事件监听器
          listenContent,            //内容控制面板事件监听器
          angel  = 0,               //时间控制面板元素每次变化角度
          speed  = 1,               //角度的加速度
          mouseX = 0,               //鼠标的横坐标
          mouseY = 0,               //鼠标的纵坐标
          onclick = false,          //时间控制面板是否被按下
          direction = 'down';       //内容控制面板移动方向


     (function addInitClass(){
       contentPane.css('position', 'absolute');
       contentPane_Child.css('position', 'inherit');
       contentPane_Child.addClass(setting.class_contentInActived);
       contentPane_Child.addClass(setting.class_contentLeave);
       timeControl_Child.addClass(setting.class_timeInActived);
       (function addUserClass(){
         for(var index = 0; index < contentPane_Child.length; ++index){
           $(contentPane_Child[index]).find('img, h2')
                                      .addClass(index % 2 == 0 ? 'right' : 'left');
         }
       })();
     })();

     $(window).resize(function(){
       timeWidth     = timeControl.width();
       contentWidth  = contentPane.width();
       timeHeight    = timeControl.height();
       contentHeight = contentPane.height();
       timeCenterX   = timeWidth  / 2;
       timeCenterY   = timeHeight / 2;
       contentCenterX = contentWidth / 2;
       contentCenterY = contentHeight/ 2;
     });

     /*时间控制面板的动画*/
     function timeAnimation(){
         angel = (angel + speed) % 360;//角度变化

         for(var index = 0 ; index < timeControl_Child.length ; ++index){
           var length  = setting.property_timeRadiusRate *
                         Math.min(timeControl.height(), timeControl.width());

           var current = $(timeControl_Child[index]);
           //获取当前元素应该移动到的角度
           var eachAngel = (1.0 / timeControl_Child.length * index * 2 + angel / 180 ) * Math.PI;
           current.css({
             'position'   : 'absolute',

             'margin-top' :timeCenterY -
              parseInt(length * Math.cos(eachAngel)) - current.height() / 2,

             'margin-left':timeCenterX +
             parseInt(length * Math.sin(eachAngel)) - current.width()  / 2,

           });
        }
      }
     /*获取整个内容控制面板元素高度加间隔的和*/
     function getHeight(end){
        if(contentPane_Child.length === 0 || end === 0)
           return 0;

        var  sum = 0,
             len = (end <= contentPane_Child.length ? end : contentPane_Child.length);
        for(var index = 0; index < len ; ++index){
          var current = $(contentPane_Child[index]);
          sum += current.height() + setting.property_contentIntervalRate * contentHeight;
        }

        return sum - setting.property_contentIntervalRate * contentHeight;
      }

     function contentAnimation(){
        var len         = contentPane_Child.length,
            wheight     = $(window).height(),//可视屏幕的高度
            upheight    = getHeight(len),    //不可视上屏幕的高度
            totalHeight = upheight+ wheight; //总屏幕高度

        for(var index = 0; index < len; ++index){
            var current    = $(contentPane_Child[index]),
                before     = $(current.prevAll()[0]),   //前一个节点
                blen       = current.prevAll().length,  //前面节点的个数
                before_top = parseInt(current.css('margin-top')),//当前节点top
                after_top  = 0; //计算后的top
            /*移动的思路和贪吃蛇差不多*/
            if(blen === 0){
              after_top = before_top + speed + upheight; //第一个节点移动
            }else{
              //后面的跟着第一个节点移动
              after_top = parseInt(before.css('margin-top'))
                        - setting.property_contentIntervalRate * contentHeight
                        - current.height() + upheight;
            }
            //进行上屏幕和下屏幕的出界处理
            if(after_top < 0)
              after_top = after_top + totalHeight;
            after_top = after_top % totalHeight - upheight;

            current.css({
              'width'       : contentWidth * setting.property_contentWidthRate,
              'position'    : 'inherit',
              'margin-top'  : after_top,
              'margin-left' : index % 2 == 0 ? contentWidth * 0.05 :
                              contentWidth * (0.9 - setting.property_contentWidthRate),

            });

        }
      }
      /*
       *  滚轮事件
       *  mousewheel用于chrome ie等浏览器，DOMMouseScroll用来适应firefox浏览器
       *  mousewheel获取出来的变化量和DOMMouseScroll的变化量是相反的.
       *  正代表上，负代表下
      */
     function mousewheelEvent(e){
          e.preventDefault();
          var value = e.originalEvent.wheelDelta || -e.originalEvent.detail;
          direction = value < 0 ? 'down' : 'up';
          speed = value < 0 ? 5 : -5;
          timeAnimation();
          contentAnimation();
          speed = value < 0 ? 1 : -1;

     };

     if(setting.boolean_timeRotation){
       listenTime = setInterval(timeAnimation, setting.speed_timeControl);
       timeControl.bind('mouseup mouseleave', function(e){
         onclick = false;
         speed = direction == 'down' ? 1 : -1;
         timeControl_Child.removeClass(setting.class_timeActived);
         timeControl_Child.addClass(setting.class_timeInActived);
       });

       timeControl.bind('mousedown', function(e){
         onclick = true;
         timeControl_Child.removeClass(setting.class_timeInActived);
         timeControl_Child.addClass(setting.class_timeActived);
       });

       timeControl.bind('mousemove', function(e){
         e.preventDefault();
         if(onclick){
           if(e.pageY > mouseY){
             speed = 10;
             direction = 'down';
           }else if(e.pageY < mouseY){
             speed = -10;
             direction = 'up';
           }
           mouseY = e.pageY;
         }
      });
       $(timeControl).bind('mousewheel DOMMouseScroll', mousewheelEvent);
     }

     if(setting.boolean_contentMove){
       listenContent = setInterval(contentAnimation, setting.speed_contentPane);
       contentPane_Child.bind('click'    , function(e){
         if(!$(this).hasClass(setting.class_contentInActived)){
           $(this).addClass(setting.class_contentInActived);
           $(this).removeClass(setting.class_contentActived);
         }else{
           $(this).addClass(setting.class_contentActived);
           $(this).removeClass(setting.class_contentInActived);
         }

       });

       contentPane_Child.bind('mouseover', function(e){
         if(!$(this).hasClass(setting.class_contentOver)){
           $(this).addClass(setting.class_contentOver);
           $(this).removeClass(setting.class_contentLeave);
           clearInterval(listenContent);

         }
       });

       contentPane_Child.bind('mouseout' , function(e){
         if(!$(this).hasClass(setting.class_contentLeave)){
           $(this).addClass(setting.class_contentLeave);
           $(this).removeClass(setting.class_contentOver);
           listenContent = setInterval(contentAnimation, setting.speed_contentPane);

         }
       });

       $(contentPane).bind('mousewheel DOMMouseScroll', mousewheelEvent);
     }

  }
}
