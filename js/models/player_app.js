define([
	'underscore',
	'backbone',
	'./user_profile_manager',
	'./youtube_media_provider',
	'./youtube_profile_service',
	'./youtube_player',
	
	'utils',
	'safe',
	'xManager'
], function(_, Backbone, 
	UserProfileManager, YoutubeMediaProvider, YoutubeProfileService, 
	YoutubePlayer
	) {

	var PlayerModel = Backbone.Model.extend({
		defaults: {
			query: '',
			// results filter state: video, playlist
			filter: 'videos',

			// handles the router navigation 'routes' object
			route: 'videos',

			// models
			user: null,
			youtube: null,
			player: null
		},

		safe: 'EchoesPlayerApp-v20130202',

		initialize: function() {
			// initialize models
			this.set('youtube', new YoutubeMediaProvider());
			this.set('user', new YoutubeProfileService());
			this.set('player', new YoutubePlayer());

			// reset attributes that don't need cache
			this.set('route', 'videos');

			// register to app events
			// this.on('change:route', this.onRouteChange);
			this.on('change:filter', this.onFilterChange);
			this.on('change:query', this.onQueryChange);

			this.youtube().set({'feedType': this.get('filter')}, { silent: true });
			this.youtube().query({ query: this.get('query') });
		},
		
		/* handlers */
		onFilterChange: function(model, filter) {
			this.youtube().set('feedType', filter);
		},

		onQueryChange: function(model, query) {
			this.youtube().query({ query: query });
		},

		/* convinience methods for retrieving models */
		//  user profile manager
		user: function() {
			return this.get('user');
		},

		connectUser: function() {
			this.user().fetch();
		},

		connect: function(token) {
			this.user().setToken(token);
		},

		getSignin: function() {
			return this.user().urls.signin;
		},

		getSignout: function() {
			return this.user().urls.signout;
		},
		
		//  youtube media provider
		youtube: function() {
			return this.get('youtube');
		},

		/**
		 * sets the current visible screen presented to the user
		 * @param {string} screenId
		 */
		route: function(screenId) {
			if (screenId) {
				this.set('route', screenId);
			} else {
				return this.get('route');
			}
		},
		
		playMedia: function(options) {
			this.get('player').setOptions(options);
		},

		fetchCurrentMediaInfo: function() {
			this.youtube().fetchMediaById(this.get('player').get('mediaId'));
		},

		fetchPlaylistInfo: function(items) {
			// @todo should be a playlistId and a videoId seperated
			this.youtube().fetchPlaylistInfo(this.get('player').get('nowPlayingId'));
		}
	});

	return PlayerModel;
});