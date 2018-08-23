;(function($) {

function TimelineFactory() {
	this.tls = {};
	this.tls['default'] = new DefaultTimeline();
}
TimelineFactory.prototype = {
	constructor: TimelineFactory,

	getTimeline: function(name) {
		if (this.tls[name]) {
			return this.tls[name];
		} else {
			return this.tls[name] = new Timeline(name);
		}
	},
	removeTimeline: function(name) {
		if (this.tls[name]) {
			delete this.tls[name];
		}
	}
}

function DefaultTimeline() {
	this.name = 'default';
}

DefaultTimeline.prototype = {
	constructor: DefaultTimeline,

	addTween: function(o, an, t, p, r, d, s, cb) {
		o.css({
			'display': 'none',
			'-webkit-animation': ''
		});
		setTimeout(function() {
			o.one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
				o._onTweenComplete();
				cb && cb.call(o);
			}).css({
				'display': 'block',
				'-webkit-animation': an + ' '+ t +'s ease '+ (p + s) +'s '+ r + ' '+ d +' both'
			});
		}, 17);
	}
}

function Timeline(name, callback) {
	this.name = name;
	this.queue = [];
	this._queue = []; // 播放使用
	this.__queue = []; // css3 hack
	this.state = 0; // 0 idle, 1 playing, 2 stopped, 3 reset
	this.timer = {};
	this.timer.origin = 0;
	this.timer.startTime = 0;
	this.timer.currentTime = 0;
	this.timer.raf = null;
}

Timeline.prototype = {
	constructor: Timeline,

	play: function() {
		this.state = 1;
		this._queue = this.queue.slice();
		this.timer.startTime = this.timer.currentTime = Date.now();
		this.update();
	},
	stop: function() {
		this.queue.forEach(function(tn) {
			tn.o.data('index', 0);
			tn.o.css({
				'display': 'block',
				'-webkit-animation': ''
			});
		});
		this.state = 2;
	},
	reset: function() {
		this.queue.forEach(function(tn) {
			tn.o.data('index', 0);
			tn.o.css('-webkit-animation', '');
			initTweenState(tn.o, tn.o.data('queue')[0]);
		});
		this.state = 3;
	},
	remove: function() {
		this._queue.length = 0;
		this.__queue.length = 0;
		while (this.queue.length) {
			var tn = this.queue.pop();
			tn.o.removeData();
			tn.o.css('-webkit-animation', '');
		}
		timelineFactory.removeTimeline(this.name);
	},
	update: function() {
		if (this.state !== 1) return;

		this.doTween();

		while (this._queue.length) {
			if (this.timer.startTime + this._queue[0].p <= this.timer.currentTime) {
				this.addTween(this.deQueue());
			} else {
				break;
			}
		}

		this.timer.currentTime = Date.now();

		this.timer.raf = requestAnimationFrame(this.update.bind(this));
	},
	addQueue: function(o, an, t, p, r, d, s, cb, inc) {
		var tn = { o: o, an: an, t: t, p: this.timer.origin + p * 1000, r: r, d: d, cb: cb };
		this.queue.push(tn);

		if (inc) this.timer.origin += (p + t * r) * 1000;
		else this.timer.origin += s * 1000;
	},
	deQueue: function() {
		return this._queue.shift();
	},
	addTween: function(tn) {
		tn.o.css({
			'-webkit-animation': ''
		});
		this.__queue.push(tn);
	},
	doTween: function() {
		this.__queue.forEach(function(tn) {
			tn.o.one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
				tn.o._onTweenComplete();
				tn.cb && tn.cb.call(this);
			}).css({
				'display': 'block',
				'-webkit-animation': tn.an + ' '+ tn.t +'s ease 0s '+ tn.r + ' '+ tn.d +' both'
			});
		});
		this.__queue.length = 0;

		if (!this._queue.length) { // 如果状态是2，就从timeline里面删除当前的，再将状态恢复0
			this.state = 2;
			// 清除动画raf
		}
	}
}

$.fn.extend({
	defaultHidden: function(hidden) {
		if (hidden) {
			this.each(function(i, n) {
				$(n).data('hidden', hidden);
			});
		}
		return this;
	},
	tween: function(animation_name, time, position, params) {
		var len = this.length;
		this.each(function(i, n) {
			var dom = $(n);
			var args = getAniArgs(time, position, params);
			var queue = dom.data('queue') || [];
			dom.data('queue', queue);
			if (currentTimeline.name == 'default') {
				queue[0] = animation_name;
				// initTweenState(dom, queue);
				currentTimeline.addTween(dom, animation_name, args.time, args.position, args.repeat, args.reverse, args.stagger * i, args.callback);
			} else {
				// var _queue = dom.data('_queue') || [];
				// dom.data('_queue', _queue);
				queue.push(animation_name);
				// _queue.push(animation_name);
				// initTweenState(dom, queue);
				currentTimeline.addQueue(dom, animation_name, args.time, args.position, args.repeat, args.reverse, args.stagger, args.callback, len > 1 ? i == len - 1 : !i);
			}
		});
		return this;
	},
	/**
	 * bounceOut
	 * @param  {int}   time     动画时间
	 * @param  {int}   position 动画播放在timeline上的位置
	 * @param  {Object}   params   repeat, reverse, stagger, onComplete
	 * @return {Object}            返回jQuery对象
	 */
	bounce: function(time, position, params) {
		return this.tween('bounce', time, position, params);
	},
	flash: function(time, position, params) {
		return this.tween('flash', time, position, params);
	},
	pulse: function(time, position, params) {
		return this.tween('pulse', time, position, params);
	},
	rubberBand: function(time, position, params) {
		return this.tween('rubberBand', time, position, params);
	},
	shake: function(time, position, params) {
		return this.tween('shake', time, position, params);
	},
	swing: function(time, position, params) {
		return this.tween('swing', time, position, params);
	},
	tada: function(time, position, params) {
		return this.tween('tada', time, position, params);
	},
	wobble: function(time, position, params) {
		return this.tween('wobble', time, position, params);
	},
	bounceIn: function(time, position, params) {
		return this.tween('bounceIn', time, position, params);
	},
	bounceInDown: function(time, position, params) {
		return this.tween('bounceInDown', time, position, params);
	},
	bounceInLeft: function(time, position, params) {
		return this.tween('bounceInLeft', time, position, params);
	},
	bounceInRight: function(time, position, params) {
		return this.tween('bounceInRight', time, position, params);
	},
	bounceInUp: function(time, position, params) {
		return this.tween('bounceInUp', time, position, params);
	},
	bounceOut: function(time, position, params) {
		return this.tween('bounceOut', time, position, params);
	},
	bounceOutDown: function(time, position, params) { // TODO
		return this.tween('bounceOutDown', time, position, params);
	},
	bounceOutLeft: function(time, position, params) {
		return this.tween('bounceOutLeft', time, position, params);
	},
	bounceOutRight: function(time, position, params) {
		return this.tween('bounceOutRight', time, position, params);
	},
	bounceOutUp: function(time, position, params) {
		return this.tween('bounceOutUp', time, position, params);
	},
	fadeIn: function(time, position, params) {
		return this.tween('fadeIn', time, position, params);
	},
	fadeInDown: function(time, position, params) {
		return this.tween('fadeInDown', time, position, params);
	},
	fadeInDownBig: function(time, position, params) {
		return this.tween('fadeInDownBig', time, position, params);
	},
	fadeInLeft: function(time, position, params) {
		return this.tween('fadeInLeft', time, position, params);
	},
	fadeInLeftBig: function(time, position, params) {
		return this.tween('fadeInLeftBig', time, position, params);
	},
	fadeInRight: function(time, position, params) {
		return this.tween('fadeInRight', time, position, params);
	},
	fadeInRightBig: function(time, position, params) {
		return this.tween('fadeInRightBig', time, position, params);
	},
	fadeInUp: function(time, position, params) {
		return this.tween('fadeInUp', time, position, params);
	},
	fadeInUpBig: function(time, position, params) {
		return this.tween('fadeInUpBig', time, position, params);
	},
	fadeOut: function(time, position, params) {
		return this.tween('fadeOut', time, position, params);
	},
	fadeOutDown: function(time, position, params) {
		return this.tween('fadeOutDown', time, position, params);
	},
	fadeOutDownBig: function(time, position, params) {
		return this.tween('fadeOutDownBig', time, position, params);
	},
	fadeOutLeft: function(time, position, params) {
		return this.tween('fadeOutLeft', time, position, params);
	},
	fadeOutLeftBig: function(time, position, params) {
		return this.tween('fadeOutLeftBig', time, position, params);
	},
	fadeOutRight: function(time, position, params) {
		return this.tween('fadeOutRight', time, position, params);
	},
	fadeOutRightBig: function(time, position, params) {
		return this.tween('fadeOutRightBig', time, position, params);
	},
	fadeOutUp: function(time, position, params) {
		return this.tween('fadeOutUp', time, position, params);
	},
	fadeOutUpBig: function(time, position, params) {
		return this.tween('fadeOutUpBig', time, position, params);
	},
	flip: function(time, position, params) {
		return this.tween('flip', time, position, params);
	},
	flipInX: function(time, position, params) {
		return this.tween('flipInX', time, position, params);
	},
	flipInY: function(time, position, params) {
		return this.tween('flipInY', time, position, params);
	},
	flipOutX: function(time, position, params) {
		return this.tween('flipOutX', time, position, params);
	},
	flipOutY: function(time, position, params) {
		return this.tween('flipOutY', time, position, params);
	},
	lightSpeedIn: function(time, position, params) {
		return this.tween('lightSpeedIn', time, position, params);
	},
	lightSpeedOut: function(time, position, params) {
		return this.tween('lightSpeedOut', time, position, params);
	},
	rotateIn: function(time, position, params) {
		return this.tween('rotateIn', time, position, params);
	},
	rotateInDownLeft: function(time, position, params) {
		return this.tween('rotateInDownLeft', time, position, params);
	},
	rotateInDownRight: function(time, position, params) {
		return this.tween('rotateInDownRight', time, position, params);
	},
	rotateInUpLeft: function(time, position, params) {
		return this.tween('rotateInUpLeft', time, position, params);
	},
	rotateInUpRight: function(time, position, params) {
		return this.tween('rotateInUpRight', time, position, params);
	},
	rotateOut: function(time, position, params) {
		return this.tween('rotateOut', time, position, params);
	},
	rotateOutDownLeft: function(time, position, params) {
		return this.tween('rotateOutDownLeft', time, position, params);
	},
	rotateOutDownRight: function(time, position, params) {
		return this.tween('rotateOutDownRight', time, position, params);
	},
	rotateOutUpLeft: function(time, position, params) {
		return this.tween('rotateOutUpLeft', time, position, params);
	},
	rotateOutUpRight: function(time, position, params) {
		return this.tween('rotateOutUpRight', time, position, params);
	},
	hinge: function(time, position, params) {
		return this.tween('hinge', time, position, params);
	},
	rollIn: function(time, position, params) {
		return this.tween('rollIn', time, position, params);
	},
	rollOut: function(time, position, params) {
		return this.tween('rollOut', time, position, params);
	},
	zoomIn: function(time, position, params) {
		return this.tween('zoomIn', time, position, params);
	},
	zoomInDown: function(time, position, params) {
		return this.tween('zoomInDown', time, position, params);
	},
	zoomInLeft: function(time, position, params) {
		return this.tween('zoomInLeft', time, position, params);
	},
	zoomInRight: function(time, position, params) {
		return this.tween('zoomInRight', time, position, params);
	},
	zoomInUp: function(time, position, params) {
		return this.tween('zoomInUp', time, position, params);
	},
	zoomOut: function(time, position, params) {
		return this.tween('zoomOut', time, position, params);
	},
	zoomOutDown: function(time, position, params) {
		return this.tween('zoomOutDown', time, position, params);
	},
	zoomOutLeft: function(time, position, params) {
		return this.tween('zoomOutLeft', time, position, params);
	},
	zoomOutRight: function(time, position, params) {
		return this.tween('zoomOutRight', time, position, params);
	},
	zoomOutUp: function(time, position, params) {
		return this.tween('zoomOutUp', time, position, params);
	},
	slideInDown: function(time, position, params) {
		return this.tween('slideInDown', time, position, params);
	},
	slideInLeft: function(time, position, params) {
		return this.tween('slideInLeft', time, position, params);
	},
	slideInRight: function(time, position, params) {
		return this.tween('slideInRight', time, position, params);
	},
	slideInUp: function(time, position, params) {
		return this.tween('slideInUp', time, position, params);
	},
	slideOutDown: function(time, position, params) {
		return this.tween('slideOutDown', time, position, params);
	},
	slideOutLeft: function(time, position, params) {
		return this.tween('slideOutLeft', time, position, params);
	},
	slideOutRight: function(time, position, params) {
		return this.tween('slideOutRight', time, position, params);
	},
	slideOutUp: function(time, position, params) {
		return this.tween('slideOutUp', time, position, params);
	},
	_onTweenComplete: function() {
		console.log(this.data('queue'));
		var queue = this.data('queue');
		var index = this.data('index') || 0;
		if (queue && queue[++index]) {
			// queue.shift();
			// if (queue.length) {
				initTweenState(this, queue[index]);
			// }
		}
		this.data('index', index);
	}
});

function initTweenState(dom, animation_name) {
	switch (animation_name) {
		case 'bounce':
			dom.css({
				'-webkit-transform-origin': 'center bottom',
				'display': 'block'
			});
			break;
		case 'flash':
		case 'pulse':
		case 'rubberBand':
		case 'shake':
		case 'tada':
		case 'wobble':
		case 'flip':
			dom.css({
				'-webkit-transform-origin': '50% 50% 0',
				'display': 'block'
			});
			break;
		case 'swing':
			dom.css({
				'-webkit-transform-origin': 'top center',
				'display': 'block'
			});
			break;
		case 'bounceIn':
		case 'bounceInDown':
		case 'bounceInLeft':
		case 'bounceInRight':
		case 'bounceInUp':
		case 'fadeIn':
		case 'fadeInDown':
		case 'fadeInDownBig':
		case 'fadeInLeft':
		case 'fadeInLeftBig':
		case 'fadeInRight':
		case 'fadeInRightBig':
		case 'fadeInUp':
		case 'fadeInUpBig':
		case 'flipInX':
		case 'flipInY':
		case 'lightSpeedIn':
		case 'rotateIn':
		case 'rotateInDownLeft':
		case 'rotateInDownRight':
		case 'rotateInUpLeft':
		case 'rotateInUpRight':
		case 'rollIn':
		case 'zoomIn':
		case 'zoomInDown':
		case 'zoomInLeft':
		case 'zoomInRight':
		case 'zoomInUp':
		case 'slideInDown':
		case 'slideInLeft':
		case 'slideInRight':
		case 'slideInUp':
			dom.css({
				'-webkit-transform-origin': '50% 50% 0',
				'display': 'none'
			});
			break;
		case 'bounceOut':
		case 'bounceOutDown':
		case 'bounceOutLeft':
		case 'bounceOutRight':
		case 'bounceOutUp':
		case 'fadeOut':
		case 'fadeOutDown':
		case 'fadeOutDownBig':
		case 'fadeOutLeft':
		case 'fadeOutLeftBig':
		case 'fadeOutRight':
		case 'fadeOutRightBig':
		case 'fadeOutUp':
		case 'fadeOutUpBig':
		case 'flipOutX':
		case 'flipOutY':
		case 'lightSpeedOut':
		case 'rotateOut':
		case 'rotateOutDownLeft':
		case 'rotateOutDownRight':
		case 'rotateOutUpLeft':
		case 'rotateOutUpRight':
		case 'hinge':
		case 'rollOut':
		case 'zoomOut':
		case 'zoomOutDown':
		case 'zoomOutLeft':
		case 'zoomOutRight':
		case 'zoomOutUp':
		case 'slideOutDown':
		case 'slideOutLeft':
		case 'slideOutRight':
		case 'slideOutUp':
			dom.css({
				'-webkit-transform-origin': '50% 50% 0',
				'display': 'block'
			});
			break;
		default:
			if (dom.data('hidden')) dom.css('display', 'none');
			else dom.css('display', 'block');
			break;
	}
}

function getAniArgs(t, p, params) {
	var set = $.isPlainObject(params) ? params : {},
		r = set.repeat || 1,
		d = !!set.reverse,
		s = set.stagger || 0,
		cb = set.onComplete;

	if ($.isPlainObject(t)) {
		p = t.position;
		r = t.repeat;
		d = t.reverse;
		s = t.stagger;
		cb = t.callback;
		t = t.time;
	}
	if ($.isFunction(t)) {
		cb = t;
		t = 1;
		p = 0;
		r = 1;
		d = !1;
	}
	if ($.isFunction(p)) {
		t = $.isNumeric(t) ? t : 1;
		cb = p;
		p = 0;
		r = 1;
		d = !1;
	}
	if ($.isFunction(params)) {
		t = $.isNumeric(t) ? t : 1;
		p = $.isNumeric(p) ? p : 0;
		cb = params;
		r = 1;
		d = !1;
	}

	t = $.isNumeric(t) ? t : 1;
	p = $.isNumeric(p) ? p : 0;
	r = $.isNumeric(r) ? r : 1;
	s = $.isNumeric(s) ? s : 0;
	if (d) {
		d = 'alternate';
		t = t / 2;
		r = r * 2;
	} else {
		d = 'normal';
	}

	return {time: t, position: p, repeat: r, reverse: d, stagger: s, callback: cb}
}

var uid = 0;
function getUUID() {
	return 'timeline' + uid++;
}


var requestAnimationFrame = (function() {
 	return window.requestAnimationFrame ||
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		window.oRequestAnimationFrame ||
		window.msRequestAnimationFrame || function(callback) {
			window.setTimeout(callback, 1000 / 60);
		};
})();


var timelineFactory = new TimelineFactory();
var currentTimeline = timelineFactory.getTimeline('default');

$.timeline = function(name, callback) {
	if ($.isFunction(name)) {
		callback = name;
		name = getUUID();
	}

	if (name && !callback) {
		return timelineFactory.getTimeline(name);
	}

	var tl = currentTimeline = timelineFactory.getTimeline(name || 'default ');
	callback && callback.call(currentTimeline);
	currentTimeline = timelineFactory.getTimeline('default');
	tl.reset();
	return tl;
};

})(jQuery);