(function($){
	$.anaclog = {
		version : "0.0.1",
		fractionToRad : function(fraction){ return Math.PI * (2.0 * fraction - 0.5); },
		radial: function( ctx, r, fraction, style ) {
			ctx.save();
			ctx.translate( r, r );
			ctx.rotate( $.anaclog.fractionToRad(fraction) );
			ctx.strokeStyle = style.color;
			ctx.lineWidth = style.width || 1;
			ctx.beginPath();
			ctx.moveTo( style.start * r, 0 )
			ctx.lineTo( style.end * r, 0 );
			ctx.stroke();		
			ctx.restore();
		},
		segment: function( ctx, r, segment ) {
			var startRadians = $.anaclog.fractionToRad(segment.convert(segment.start));
			var endRadians = $.anaclog.fractionToRad(segment.convert(segment.end));
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
	};
	$.fn.clock = function( o ){
		
		// Defaults
		o = $.extend({
			interval : 1000, // usually 1 second
			radius:50, // master pixel radius, sets canvas size, all other radii are fractions of this
			marks : {
				hour : { color:'black', width:3, start:.85, end:.95 },
				minute : { color:'white', width:2, start:.9, end:.95 }
			},
			hands : [
				{ width:7, start:-0.1, end:.5, color:'black', value:function(time){return time.getHours() / 12 + time.getMinutes() / 720 } },
				{ width:4, start:-0.1, end:.7, color:'black', value:function(time){return time.getMinutes() / 60} },
				{ width:2, start:-0.1, end:.9, color:'red', value:function(time){return time.getSeconds() / 60} }
			],
			timers : [
				{ color:'#b0c878', radius:0.5, start:35, end:40, convert:function(value){ return value/60; } },
				{ color:'#d8df93', radius:0.5, start:55, end:45, convert:function(value){ return value/60; } }
			],
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
			
			$.anaclog.interval = setInterval( function(){ // Refresh each canvas
				
				var now = new Date();
				
				//clear last frame
				ctx.clearRect( 0, 0, 2*r, 2*r );
				
				// draw timers
				for ( var i = 0; i < o.timers.length; i++ ) {
					var segment = o.timers[i];
					$.anaclog.segment( ctx, r, segment );
				}
				// draw ticks
				for ( var i = 0; i < 60; i++ ) {
					var mark = (i%5) ? o.marks.minute : o.marks.hour;
					$.anaclog.radial( ctx, r, i/60, mark );
				}
				// draw hands
				for ( var i = 0; i < o.hands.length; i++ ) {
					var hand = o.hands[i];
					$.anaclog.radial( ctx, r, hand.value(now), hand );
				}
				
			}, o.interval );
		});
		
	};
})(jQuery)