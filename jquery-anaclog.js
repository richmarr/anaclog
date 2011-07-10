(function($){
	$.anaclog = {
		version : "0.0.1",
		toRad : function(value,unit,orient) {
			var converter = orient ? $.anaclog.fractionToOrientedRad : $.anaclog.fractionToRad;
			if ( unit == 'Minutes' || unit == 'Seconds' ) return converter(value/60);
			return converter(value/12);
		},
		fractionToOrientedRad : function(fraction) { return Math.PI * (2.0 * fraction - 0.5); },
		fractionToRad : function(fraction) { return Math.PI * 2 * fraction; },
		radialFraction: function( ctx, r, fraction, style ) {
			$.anaclog.radial( ctx, r, $.anaclog.fractionToRad(fraction), style );
		},
		radial: function( ctx, r, rad, style ) {
			ctx.save();
			ctx.translate( r, r );
			ctx.rotate(rad);
			ctx.strokeStyle = style.color;
			ctx.lineWidth = style.width || 1;
			ctx.beginPath();
			ctx.moveTo( style.start * r, 0 )
			ctx.lineTo( style.end * r, 0 );
			ctx.stroke();		
			ctx.restore();
		},
		segment: function( ctx, r, segment ) {
			var endRadians, startRadians = $.anaclog.toRad(segment.start,segment.unit,true);
			if ( segment.end ) endRadians = $.anaclog.toRad(segment.end,segment.unit,true);
			else if ( segment.time ) endRadians = startRadians + $.anaclog.toRad(segment.time,segment.unit,false);
			ctx.save();
			ctx.lineWidth = 1;
			ctx.strokeStyle = segment.color;
			ctx.beginPath();
			ctx.moveTo( r, r );
			ctx.arc( r, r, r*segment.radius, startRadians, endRadians, false);
			//if (document.all) ctx.arc( r, r, segment.radius, -0.1, 0.1, false); // work around quirk in excanvas 
			ctx.closePath();
			ctx.fillStyle = segment.color;
			ctx.fill();
			ctx.restore();
		},
		checkTimer:function ( $self, now, segment ){
			var current = now['get'+segment.unit]();
			if ( current == segment.start ) $self.trigger("timerStart");
			else if ( current == segment.end ) $self.trigger("timerEnd");
		}
	};
	$.fn.step = function(){
		
		return this.each(function(){
			
			var $self = $(this);
			var self = this,
				ctx = self.getContext("2d"), 
				r = parseInt($self.attr('radius'));
			
			var now = parseInt($self.attr('now'));
			var radius = parseInt($self.attr('radius'));
			var process = {
				start:parseInt($self.attr('process-start')),
				end:parseInt($self.attr('process-end'))
			};
			var step = {
				start:parseInt($self.attr('step-start')),
				end:parseInt($self.attr('step-end'))
			};
			var datediff = function(ms,units){
				if ( units == 'Seconds' ) return Math.round(ms/1000);
				if ( units == 'Minutes' ) return Math.round(ms/60000);
				if ( units == 'Hours' ) return Math.round(ms/3600000);
			};
			
			self.setAttribute("width",r*2);
			self.setAttribute("height",r*2);
			self.style.width = r*2 + "px";
			self.style.height = r*2 + "px";
			
			//$self.bind();
			var diff = process.end - process.start
			var units = ( diff > 3600000 ) ? 'Hours' : ( diff > 60000 ) ? 'Minutes' : 'Seconds';
			
			// process
			$.anaclog.segment( ctx, r, {
				color:'#d8df93', 
				radius:1, 
				start:(new Date(now+process.start))['get'+units](),
				time:datediff(process.end - process.start, units),
				unit:units
			});
			
			// step
			$.anaclog.segment( ctx, r, {
				color:'#b0c878', 
				radius:1, 
				start:(new Date(now+step.start))['get'+units](),
				time:datediff(step.end - step.start, units),
				unit:units
			});
			
			// radius
			//$.anaclog.radial( ctx, r, hand.value(now), hand );
			
		});
	};
	$.fn.arcs = function( o ){
		o = $.extend({
			radius:50,
			segments : {}
		}, o );
		return this.each(function(){ 
			
			var self = this, 
				$self = $(this), 
				ctx = self.getContext("2d"), 
				r = o.radius;
				
			self.setAttribute("width",r*2);
			self.setAttribute("height",r*2);
			self.style.width = r*2 + "px";
			self.style.height = r*2 + "px";
			
			$self.bind();
			
			
			var now = new Date();
			
			//clear last frame
			//ctx.clearRect( 0, 0, 2*r, 2*r );
			
			// draw timers
			for ( var name in o.segments ) {
				var segment = o.segments[name];
				$.anaclog.checkTimer($self, now, segment);
				$.anaclog.segment( ctx, r, segment );
			}
			// draw ticks
			//for ( var i = 0; i < 60; i++ ) {
			//	var mark = (i%5) ? o.marks.minute : o.marks.hour;
			//	$.anaclog.radial( ctx, r, i/60, mark );
			//}
			// draw hands
			//for ( var name in o.hands ) {
			//	var hand = o.hands[name];
			//	$.anaclog.radial( ctx, r, hand.value(now), hand );
			//}
		});
	};
	$.fn.staticArc = function( o ){
		o = $.extend({
			radius:50,
			segments : {
				a: { color:'#b0c878', radius:0.5, start:35, end:40, unit:'Minutes' },
				b: { color:'#d8df93', radius:0.5, start:55, end:45, unit:'Seconds' }
			}
		}, o );
		return this.each(function(){ // initialise each arc
			
			var self = this, 
				$self = $(this), 
				ctx = self.getContext("2d"), 
				r = o.radius;
				
			self.setAttribute("width",r*2);
			self.setAttribute("height",r*2);
			self.style.width = r*2 + "px";
			self.style.height = r*2 + "px";
			
			$self.bind();
			
			
			var now = new Date();
			
			//clear last frame
			//ctx.clearRect( 0, 0, 2*r, 2*r );
			
			// draw timers
			for ( var name in o.segments ) {
				var segment = o.segments[name];
				$.anaclog.checkTimer($self, now, segment);
				$.anaclog.segment( ctx, r, segment );
			}
			// draw ticks
			//for ( var i = 0; i < 60; i++ ) {
			//	var mark = (i%5) ? o.marks.minute : o.marks.hour;
			//	$.anaclog.radial( ctx, r, i/60, mark );
			//}
			// draw hands
			//for ( var name in o.hands ) {
			//	var hand = o.hands[name];
			//	$.anaclog.radial( ctx, r, hand.value(now), hand );
			//}
		});
	};
	$.fn.anaclog = function( o ){
		
		// Defaults
		o = $.extend({
			interval : 1000, // usually 1 second
			radius:50, // master pixel radius, sets canvas size, all other radii are fractions of this
			marks : {
				hour : { color:'black', width:3, start:.85, end:.95 },
				minute : { color:'white', width:2, start:.9, end:.95 }
			},
			hands : {
				hour:{ width:7, start:-0.1, end:.5, color:'black', value:function(time){return time.getHours() / 12 + time.getMinutes() / 720 } },
				minute:{ width:4, start:-0.1, end:.7, color:'black', value:function(time){return time.getMinutes() / 60} },
				second:{ width:2, start:-0.1, end:.9, color:'red', value:function(time){return time.getSeconds() / 60} }
			},
			timers : {
				a: { color:'#b0c878', radius:0.5, start:35, end:40, unit:'Minutes' },
				b: { color:'#d8df93', radius:0.5, start:55, end:45, unit:'Seconds' }
			},
			border : { width:2, color:'black' }
		}, o);
		
		return this.each(function(){ // Set up each canvas element
			var self = this, 
				$self = $(this), 
				ctx = self.getContext("2d"), 
				r = o.radius;
				
			self.setAttribute("width",r*2);
			self.setAttribute("height",r*2);
			self.style.width = r*2 + "px";
			self.style.height = r*2 + "px";
			
			$self.bind();
			
			$.anaclog.interval = setInterval( function(){ // Refresh each canvas on interval
				
				var now = new Date();
				
				//clear last frame
				ctx.clearRect( 0, 0, 2*r, 2*r );
				
				// draw timers
				for ( var name in o.timers ) {
					var segment = o.timers[name];
					$.anaclog.checkTimer($self, now, segment);
					$.anaclog.segment( ctx, r, segment );
				}
				// draw ticks
				for ( var i = 0; i < 60; i++ ) {
					var mark = (i%5) ? o.marks.minute : o.marks.hour;
					$.anaclog.radialFraction( ctx, r, i/60, mark );
				}
				// draw hands
				for ( var name in o.hands ) {
					var hand = o.hands[name];
					$.anaclog.radialFraction( ctx, r, hand.value(now), hand );
				}
				
			}, o.interval );
		});
		
	};
})(jQuery)