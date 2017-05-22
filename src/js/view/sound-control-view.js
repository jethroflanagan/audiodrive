__DEFAULT_IMPORTS__
var SoundEngineEvents = require('event/sound-engine-events');

var SoundControlView = Backbone.View.extend({
	frame: 0,
	isEnabled: true,
	// timeoutId: null,

	initialize: function () {
		Binder.all(this);
		this.$el.click(this.onToggleSound);
		this.animateIcon();
	},

	onToggleSound: function (e) {
		console.log('toggle');
		var $sound = this.$el;
		$sound.toggleClass('is-muted');
		var volume = 1;
		this.isEnabled = !$sound.hasClass('is-muted');
		if (!this.isEnabled) {
			this.$el.removeClass('frame' + this.getFrameNum());
			volume = 0;
		}
		else {
			this.frame = 0;
			this.animateIcon();
		}
		Event.dispatch(SoundEngineEvents.SET_MASTER_VOLUME, { volume: volume });
	},
	
	animateIcon: function () {
		// this.clearTimeout(this.timeoutId);
		if (this.isEnabled) {
			var frame = this.getFrameNum();
			this.$el.removeClass('frame' + frame);
			this.frame++;
			if (this.frame >= 10) {
				this.frame = 1;
			}
			frame = this.getFrameNum();
			this.$el.addClass('frame' + frame);
			setTimeout(this.animateIcon, 100);
		}

	},

	getFrameNum: function () {
		if (this.frame < 5)
			return this.frame;
		return 10 - this.frame;
	},
});

return SoundControlView;