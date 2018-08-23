
$(window).scroll(function(){
var scrollTop = $(window).scrollTop();
if (scrollTop>200){  
$(".totop").fadeIn(500);  
}else{ 
$(".totop").fadeOut(500);
}
});
$(".totop").on('click', function () {  
$('body').animate({scrollTop:0},300);  
});