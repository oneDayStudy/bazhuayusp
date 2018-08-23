$(function(){
    //filter object
    var filter = {
        getEle: function () {            
			this.addressLeft = $('.address_left');
			this.addressRight = $('.address_right');
			this.keyWordGroup = $('.keyword_group');
			this.cityFromProvince = $('#provinceList li');
			this.keyWords = $('.keyword_group li');
			this.month = $('.monthUl li');
			this.dateSubmit = $('.date_submit');
			this.dateTab = $('.date_tabs li');
			this.cityList = $('#cityList');
			this.dateList = $('.dates_group');
        }, 
		getSize: function () {
            var h2 = window.screen.height;
            this.addressLeft.css({height:h2-80})		
			this.addressRight.css({height:h2-80});
			this.keyWordGroup.css({height:h2});
        },
		
		filterIconClick: function (el) {
            //filter Icon Click
			var h = document.documentElement.clientHeight;			
			$(el).css({height:h,left:"0",transition:"left 0.5s"});
        },
		
		filterBackClick: function (el) {
            //back filter Click		
			$(el).css({left:"100%",transition:"left 0.5s"});
        },
		
		filterConfirm: function (obj,str) {
            //筛选时选中标签返回	
			var parentLayerId=$(obj).parents('.page').attr('id');
            $("#"+parentLayerId).css({left:"100%",transition:"left 0.5s"});
            for(var i=0;i<$(".filter").length;i++){
                if($(".filter").eq(i).attr("data-tagid") == parentLayerId){
                    $(".filter").eq(i).children(".filter_detail").children("font").text(str).css('color','#ff5a5a');
                }
            }
        },
		        
        bind: function () {
            var that = this;
			
			// filter click
			$('body').delegate('.filter','click',function(){
				var tagid=$(this).attr('data-tagid');
				that.filterIconClick('#'+tagid);
			});
			
			// back filter click
			$('body').delegate('.back_layer','click',function(){
				var layerid=$(this).attr('data-layerid');
				that.filterBackClick('#'+layerid);
			});
			
			// confirm layer click
			$('body').delegate('.confirm_layer','click',function(){
				$("#layer_1").css({left:"100%",transition:"left 0.5s"});
			});
			
			// cities from province
			$('#provinceList').delegate('li','click',function(){
				that.cityFromProvince.removeClass('sel');
				$(this).addClass('sel');
				$("#cityList div").text($(this).text());
				
				//ajax加载该省下的市区
				var pid=$(this).attr('data-pid');//省id
				
				//$.get("http://www.baidu.com/",{pid:pid},function(res){
					//res=$.trim(res);
					var cityData='<li class="city">温州</li>';
					cityData+='<li class="city">衢州</li>';
					cityData+='<li class="city">丽水</li>';
					cityData+='<li class="city">绍兴</li>';
					cityData+='<li class="city">金华</li>';
					$("#cityList ul").html(cityData);
				//});
			});	

			that.keyWords.on('click',function(){
				that.filterConfirm(this,$(this).text());
			});
			
			that.month.on('click',function(){
				that.filterConfirm(this,$(this).text());
			});
			
			that.dateSubmit.on('click',function(){
				var startDateVal=$("#start_date").val();
				var endDateVal=$("#end_date").val();
				if(startDateVal=='' || endDateVal==''){
					alert('请选择开始日期和结束日期');
				}else{
					that.filterConfirm(this,startDateVal.substr(2,8)+" 至 "+endDateVal.substr(2,8));
				}
			});
			
			that.dateTab.on('click',function(){
				var index_tab = $(this).parent().children().index($(this)); //选项卡的索引值 
				$(this).addClass('sel').siblings().removeClass('sel');
				var content_obj = $(".date_tabs_con") //内容节点 
				content_obj.hide(); 
				content_obj.eq(index_tab).show(); 
			});
			
			that.cityList.delegate('.city','click',function(){
				that.filterConfirm(this,$(this).text());
			});
			
			that.dateList.delegate('.date','click',function(){
				that.filterConfirm(this,$(this).text());
			});			
        },
        ini: function () {
            this.getEle();
            this.bind();
        }
    };

    //ini
    var page = Object.beget (filter);
    page.ini();
});