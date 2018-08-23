
//随移固定 1.作用id 2.起始高度 3.结束高度 4.上边距or下边距 5.垂直边距
function scr_fixed(id, startH, finishH, vertical_type, mar) {
    var obj = document.getElementById(id),
        llq, inNun = false, inNun2 = false, inNun3 = false;
    if(document.all) {
        var browser = navigator.appName,
            b_version = navigator.appVersion,
            version = b_version.split(";"),
            trim_Version = version[1].replace(/[ ]/g, "");
        if (browser == "Microsoft Internet Explorer" && trim_Version == "MSIE6.0") {
            llq = "ie6";
        } else {
            llq = "ie";
        }
    } else {
        llq = "noie";
    }
    if (vertical_type == "b") {
        startH -= document.documentElement.clientHeight;
    }
    function scrollFunc(){
        var allH = document.body.scrollHeight - finishH,
            scroH = document.documentElement.scrollTop + document.body.scrollTop;
        if (vertical_type == "b") {
            allH -= document.documentElement.clientHeight;
        }
        //右侧移动
        if (scroH >= startH && scroH < allH) {
            if (llq == "ie6") {
                if (vertical_type == "t") {
                    obj.style.cssText = "margin-top:" + mar + "px; position:absolute; top:" + scroH + "px";
                } else if (vertical_type == "b") {
                    obj.style.cssText = "margin-bottom:" + mar + "px; position:absolute; top:" + scroH + "px";
                }
            } else {
                if (!inNun) {
                    if (vertical_type == "t") {
                        obj.style.cssText = "margin-top:" + mar + "px; top:0; position:fixed;";
                    } else if (vertical_type == "b") {
                        obj.style.cssText = "margin-bottom:" + mar + "px; top:auto; bottom:0; position:fixed;";
                    }
                    inNun = true;
                } else return false;
            }
            inNun2 = false;
            inNun3 = false;
        } else if (scroH >= allH) {
            if (!inNun3) {
                if (vertical_type == "t") {
                    obj.style.cssText = "margin-top:0; position:absolute; top:" + allH + "px";
                } else if (vertical_type == "b") {
                    obj.style.cssText = "margin-bottom:0; position:absolute; top:auto; bottom:" + -allH + "px";
                }
                inNun3 = true;
            } else return false;
            inNun = false;
        } else {
            inNun = false;
            if (llq == "ie6") {
                if (vertical_type == "t") {
                    obj.style.cssText = "margin-top:0; position:absolute;";
                } else if (vertical_type == "b") {
                    obj.style.cssText = "margin-bottom:0; position:absolute;";
                }
            } else {
                if (!inNun2) {
                    if (vertical_type == "t") {
                        obj.style.cssText = "margin-top:0; position:absolute;";
                    } else if (vertical_type == "b") {
                        obj.style.cssText = "margin-bottom:0; position:absolute;";
                    }
                    inNun2 = true;
                } else return false;
            }
        }
    }
    if(window.addEventListener){   
        window.addEventListener('scroll', scrollFunc);
    } else {   
        window.attachEvent('onscroll', scrollFunc);
    }
    if(document.documentElement.scrollTop + document.body.scrollTop == 0){
        scrollFunc();
    }
}
// 滚动导航分块
function orderScroll(opt){
    this.options = {
        menu: "",               //要固定的顶部导航栏的ID
        type: 'scroll',         //类型, scroll:滚动 tab:tab切换
        tab_hide: true,         //若选择tab方式,true为默认隐藏非当前分块,false为默认不隐藏非当前分块
        vertical: 't',          //附着在顶部或者底部   "t" or "b"
        cell: "",               //分块,选择器ID前缀,后加数字确定次序——分块类型请用一种
        cell_class: "",         //分块,由相同class组成,按次序排——分块类型请用一种
        cut_class: "cur",       //选中样式名
        btn: "",                //导航栏中控制显隐的按钮选择器
        cell_t: 10,             //分块距离顶部高度——单数字视为每个分块距离顶部高度一样,也可设置为数组定义不同的高度
        start_h: undefined,     //开始高度
        end_h: 500,             //结束高度
        animate: 500            //滚动速度
    };
    for(var i in opt){
        if(opt[i] != undefined){
            this.options[i] = opt[i];
        }
    }

    this._start = function(){
        var self = this,
            opt = self.options,
            menu = opt.menu,
            $menu = $('#' + menu),
            $menuH = $menu.outerHeight(),
            start_h = opt.start_h || $menu.offset().top,
            cell = "#" + opt.cell,
            cell_class = '.' + opt.cell_class,
            cell_t = opt.cell_t,
            vertical = opt.vertical,
            $btn = $(opt.btn),
            length = $menu.find('li').length,
            cellH = new Array(length),
            obj = new Array(length),
            n, i, contain, nowH;

        if(vertical == 'b'){
            start_h += $menuH;
        }

        //随移固定 1.作用id 2.起始高度 3.结束高度 4.上边距or下边距 5.垂直边距   
        scr_fixed(menu,start_h,opt.end_h,vertical,0);

        if (vertical == "b") {
            start_h -= $(window).height();
            opt.end_h += $(window).height();
        }

        // 添加占位div
        if($menu.next().attr('class') != (menu + "_stay") && $menu.next().height() != $menuH){
            $menu.after('<div class="' + menu +'_stay" style="height:' + $menuH + 'px;"></div>');
        }

        if(typeof cell_t == 'number'){
            n = cell_t;
            cell_t = new Array(length);
            for(i = 0; i < length; i++){
                cell_t[i] = n;
            }
        }

        for(i = 0; i < length; i++){
            obj[i] = (cell_class == '.') ? $(cell + i) : $(cell_class).eq(i);
        }

        function countPos(){
            for(i = 0; i < length; i++){
                cellH[i] = obj[i].length ? obj[i].offset().top - $menuH - cell_t[i] : 0;
                if (vertical == "b") {
                    cellH[i] += $menuH;
                }
            }
        }

        countPos();

        //tab方式
        if(opt.type == "tab"){
            if(opt.tab_hide){
                for(i = 0; i < length; i++){
                    obj[i].hide();
                }
                obj[0].show();
            }
            $menu.find('li').each(function(){
                var $this = $(this),
                    index = $this.index();
                $(this).click(function(){
                    $menu.find('li').removeClass(opt.cut_class).eq(index).addClass(opt.cut_class);
                    $('html,body').stop().animate({scrollTop:cellH[0] + 10}, opt.animate);
                    obj[index].show().siblings().hide();
                })
            })
        }

        function judge_statu(){
            countPos();
            nowH = $(this).scrollTop();
            for(i = 0; i < length; i++){
                contain = i == length-1 ? 999999 : cellH[i + 1];
                if(nowH > cellH[i] && nowH < contain){
                    $menu.find('li').removeClass(opt.cut_class).eq(i).addClass(opt.cut_class);
                    break;
                }
            }
        }
        $(window).scroll(function(){
            if($(this).scrollTop() >= start_h && $(this).scrollTop() <= document.body.scrollHeight - opt.end_h){
                if(opt.type == "scroll"){
                    judge_statu();
                }
                $btn.show();
            }else{
                $btn.hide();
            }
        })
        if(opt.type == "scroll"){
            judge_statu();
            $menu.find('li').each(function(){
                var $this = $(this),
                    index = $this.index();
                $(this).click(function(){
                    $('html,body').stop().animate({scrollTop:cellH[index] + 10}, opt.animate);
                })
            })
        }
    }

    this._start();
}
orderScroll.prototype = {
    
}
// 随屏滚动固定菜单并导航分块  0811
var scroll_order = new orderScroll({
    menu: "page_Tab_title",        //要固定的顶部导航栏的ID
    cell: "page_Tab_cell",        //分块的选择器ID前缀
    btn: "#page_Tab_buy",        //导航栏中控制显隐的按钮选择器
    cell_t: 150                     //滚动到时分块距离顶部的距离
});
