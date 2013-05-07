(function(){

	// check for Backbone
	// check for Underscore
	var _ = this._;
	var Backbone = this.Backbone;

	// if Underscore or Backbone have not been loaded
	// exit to prevent js errors
	if (!_ || !Backbone || !JSON) {
		return;
	}

	// * check for requirejs?
	
	// save reference to Backbone.View's contructore to allow 
	// overiding 
	var ViewExtend = Backbone.View.extend;

	_.extend(Backbone.View.prototype, {

		_init: function() {
			var key;
			// activate the switcher's configuration
			if (this.switcher) {
				key = this.switcher.key || "";
				this._parseOptions();
				this.listenTo(this.model, 'change:' + key, this._handleResource);
			}
			this._userInit.apply(this, arguments);
			// TODO: make pre render configurable
			if (this.switcher) {
				// pre render by default selected "key" view
				this._handleResource(this.model, this.model.get(key));
			}
		},

		_parseOptions: function() {
			var options = this.switcher.options;
			// set the target to append the views to
			if (options && options.target) {
				this.$target = this.$(options.target);
			} else {
				this.$target = this.$el;
			}
			// a quick reference for convience
			this._views = this.switcher.views;
		},

		_handleResource: function(model, resource) {
			this._currentResource = resource;
			if (this._currentView) {
				// this._currentView.remove();
				this._currentView.$el.fadeOut(300, _.bind(this._renderResource, this));
			} else {
				this._renderResource();
			}
			// this._currentResource = resource;
			// render the view object
			// this._render();
		},

		_renderResource: function() {
			if (this._currentView) {
				this._currentView.remove();
			}
			// render the view object
			this._render();
		},

		// TODO: apply transitions
		_render: function () {
			this._currentView = new this._views[this._currentResource]({ model: this.model });
			this.$target.append(this._currentView.render().el);
			this._currentView.$el.fadeIn(300);
			// to allow transitions between views
			// this.tid = setTimeout(_.bind(function(){
			// 	this._currentView.showViews();
			// 	clearTimeout(this.tid);
			// }, this), 0);

			this.trigger("after:render");
		}
	});

	_.extend(Backbone.View, {

		extend: function (options) {
			// keep user's initialize
			options._userInit = options.initialize;
			// replace user's initialize with the plugin's init
			options.initialize = Backbone.View.prototype._init;
			return ViewExtend.call(this, options);
		}
	});
	

}());
/*
	usage:
	======
	var layout = Backbone.View.extend({
		switcher: {
			key: 'resource',
			views: {
				viewA: SomeViewA,
				viewB: SomeViewB
			}
		},
		
		initialize: function() {
			console.log('init...', this.options);
		}
	});
*/