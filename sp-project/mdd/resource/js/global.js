
(function(win) {
	var deviceWidth = document.documentElement.clientWidth;
	if(deviceWidth > 750) deviceWidth = 750;
	document.documentElement.style.fontSize = deviceWidth / 7.5 + 'px';
    var doc = win.document;
    var docEl = doc.documentElement;

    var dpr = 0;
    var scale = 0;

    if (!dpr && !scale) {
        var isAndroid = win.navigator.appVersion.match(/android/gi);
        var isIPhone = win.navigator.appVersion.match(/iphone/gi);
        var devicePixelRatio = win.devicePixelRatio;
        if (isIPhone) {
            // iOS下，对于2和3的屏，用2倍的方案，其余的用1倍方案
            if (devicePixelRatio >= 3 && (!dpr || dpr >= 3)) {                
                dpr = 3;
            } else if (devicePixelRatio >= 2 && (!dpr || dpr >= 2)){
                dpr = 2;
            } else {
                dpr = 1;
            }
        } else {
            // 其他设备下，仍旧使用1倍的方案
            dpr = 1;
        }
        scale = 1 / dpr;
    }
    //为html标签添加data-dpr属性
    docEl.setAttribute('data-dpr', dpr);

})(window);	