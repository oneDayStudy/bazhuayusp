$(function(){
    //home object
    var home = {
        getEle: function () {            
			this.flexSlider = $('.flexslider');
        },        
		flexslider: function () {
            //flexslider setting
            this.flexSlider.flexslider({
				animation:"slide",
				slideshowSpeed:"5000",
				animationSpeed:"500",
				move:"1",
				directionNav: false
			});
        },
        
        bind: function () {
            var that = this;			
        },
        ini: function () {
            this.getEle();
            this.flexslider();
            this.bind();
        }
    };

    //ini
    var page = Object.beget (home);
    page.ini();
});