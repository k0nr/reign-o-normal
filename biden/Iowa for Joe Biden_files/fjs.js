/*

a flickr-powered javascript gallery

v 0.5 - 11/27/2006 by Lucas J. Shuman

more info: http://fsviewr.lackadaisical.com/

*/

var FJS = {
	
	/* ------ PROPS -------- */
	
	api_key: '625c4e77af956ca9b1d7de89f4896587',
	data: null,
	current: null,
	source_type: null,
	source_id: null,
	set_owner: null,
	image_size: "",
	update_browser: false,
	
	/* ------- SETUP -------- */
	
	init: function(source_type, source_id, image_size, update_browser) {
		
		this.source_type = source_type.toLowerCase();
		this.source_id = source_id;
		this.update_browser = update_browser;
		
		if (image_size != "" && image_size != null)
			this.image_size = image_size.toLowerCase();
		
		this.requestPhotoData();
		
	},
	
	/* ------- JSON REQUEST -------- */
	
	requestPhotoData: function() {
		
		var flickr_api_path = "https://web.archive.org/web/20080108194957/http://api.flickr.com/services/rest/?format=json&jsoncallback=FJS.handleResponse&api_key=" + this.api_key;
		
		switch (this.source_type) {
			case 'photoset':
				flickr_api_path += "&method=flickr.photosets.getPhotos&photoset_id=" + this.source_id;
				break;
			case 'user':
				flickr_api_path += "&method=flickr.people.getPublicPhotos&user_id=" + this.source_id;
				break;
			case 'contacts':
				flickr_api_path += "&method=flickr.photos.getContactsPublicPhotos&user_id=" + this.source_id;
				break;
			case 'favorites':
				flickr_api_path += "&method=flickr.favorites.getPublicList&user_id=" + this.source_id;
				break;
			case 'group':
				flickr_api_path += "&method=flickr.groups.pools.getPhotos&group_id=" + this.source_id;
				break;
			case 'interesting':
				flickr_api_path += "&method=flickr.interestingness.getList";
				break;
			case 'tag':
				flickr_api_path += "&method=flickr.photos.search&tags=" + this.source_id;
				break;
		}
		
		document.write('<script type="text/javascript" src="' + flickr_api_path + '"></script>');
		
	},
	
	/* ----- JSON CALLBACK ----- */
	
	handleResponse: function(rsp) {
		
		if (rsp.stat.toLowerCase() == "fail") {
			this.initErrorDisplay(rsp.message);
			return;
		}
		
		switch (this.source_type) {
			case 'photoset':
				this.set_owner = rsp.photoset.owner;
				this.data = rsp.photoset.photo;
				break;
			default:
				this.data = rsp.photos.photo;
				break;
		}
		
		this.initDisplay();
		
	},
	
	/* ------- SETUP ------- */
	
	initDisplay: function() {
		
		this.openDiv("fjs-flickr");
		this.writeDiv("fjs-flickrphotonav");
		this.writeDiv("fjs-flickrphoto");
		this.writeDiv("fjs-flickrphototitle");
		this.writeDiv("fjs-flickrlink");
		this.closeDiv();
		
		this.current = 0;
		
		if (location.hash != "") {
			var i = this.getPhotoIndexById(location.hash.substr(1));
			if (i > -1) this.current = i;
		}
		
		this.loadCurrentImage();
		
	},
	
	initErrorDisplay: function(err) {
		
		this.openDiv("fjs-flickr");
		this.writeDiv("fjs-flickrerror");
		this.closeDiv();
		this.setError(err);
	
	},
	
	/* ------ DIVS -------- */
	
	openDiv: function(div_id) {
		document.write("<div id=\"" + div_id + "\">");
	},
	
	closeDiv: function(div_id) {
		document.write("</div>");
	},
	
	writeDiv: function(div_id) {
		this.openDiv(div_id);
		this.closeDiv();
	},
	
	updateDiv: function(div_id, html) {
		document.getElementById(div_id).innerHTML = html;
	},
	
	/* -------- IMGS -------- */
	
	loadCurrentImage: function() {
		this.setCurrentTitle();
		this.setCurrentNav();
		this.setCurrentPhoto();
		this.setCurrentLink();
		if (this.update_browser) this.updateBrowserLocation();
	},
	
	/* -------- NAVIGATION ----- */
	
	goNextPhoto: function() {
		this.current++;
		if (this.current == this.data.length) this.current = 0;
		this.loadCurrentImage();
	},
	
	goPreviousPhoto: function() {
		this.current--;
		if (this.current < 0) this.current = this.data.length - 1;
		this.loadCurrentImage();
	},
	
	/* ------- DISPLAY ------- */
	
	setCurrentNav: function() {
		var html_prev = "<a href=\"#\" title=\"«Previous\" onclick=\"FJS.goPreviousPhoto(); return false;\">« Previous</a>";
		var html_next = "<a href=\"#\" title=\"Next»\" onclick=\"FJS.goNextPhoto(); return false;\">Next »</a>";
		this.updateDiv("fjs-flickrphotonav", html_prev + " | " + this.getCurrentCount() + " | " + html_next);
	},
	
	setCurrentTitle: function() {
		this.updateDiv("fjs-flickrphototitle", this.getPhotoTitle(this.current));
	},
	
	setCurrentPhoto: function() {
		var html = "<a href=\"#\" title=\"Next»\" onclick=\"FJS.goNextPhoto(); return false;\">";
		html += "<img src=\"" + this.getPhotoUrl(this.current) + "\" alt=\"\" />";
		html += "</a>";
		this.updateDiv("fjs-flickrphoto", html);
	},
	
	setCurrentLink: function() {
		var html = "<a href=\"" + this.getFlickrUrl(this.current) + "\" title=\"View at Flickr\" target=\"_blank\">View at Flickr</a>";
		this.updateDiv("fjs-flickrlink", html);
	},
	
	setError: function(err) {
		var html = "<span class=\"err-label\">Flickr Error:</span> <span class=\"err-message\">" + err + "</span>";
		this.updateDiv("fjs-flickrerror", html);
	},
	
	/* -------- DATA ------ */
	
	getPhotoIndexById: function(id) {
		var i = this.data.length;
		while (i--) {
			if (this.data[i].id == id) return i;
		}
		return -1;
	},
	
	getPhotoId: function(i) {
		return this.data[i].id;
	},
	
	getPhotoTitle: function(i) {
		return this.data[i].title;
	},
	
	getPhotoUrl: function(i) {
		var photo = this.data[i];
		var server = photo.server;
		var id = photo.id;
		var secret = photo.secret;
		var s = (this.image_size == "") ? "" : "_" + this.image_size;
		var url = "https://web.archive.org/web/20080108194957/http://static.flickr.com/" + server + "/" + id + "_" + secret + s + ".jpg";
		return url;
	},
	
	getFlickrUrl: function(i) {
		var photo = this.data[i];
		var owner = this.set_owner == null ? photo.owner : this.set_owner;
		var id = photo.id;
		var url = "https://web.archive.org/web/20080108194957/http://www.flickr.com/photos/" + owner + "/" + id;
		return url;
	},
	
	getCurrentCount: function() {
		return (this.current + 1) + " of " + this.data.length;
	},
	
	/* ---- BROWSER ---- */
	
	updateBrowserLocation: function() {
		location.hash = "#" + this.getPhotoId(this.current);
		document.title = this.getPhotoTitle(this.current);
	}
	
};

/*
     FILE ARCHIVED ON 19:49:57 Jan 08, 2008 AND RETRIEVED FROM THE
     INTERNET ARCHIVE ON 14:50:03 May 20, 2020.
     JAVASCRIPT APPENDED BY WAYBACK MACHINE, COPYRIGHT INTERNET ARCHIVE.

     ALL OTHER CONTENT MAY ALSO BE PROTECTED BY COPYRIGHT (17 U.S.C.
     SECTION 108(a)(3)).
*/
/*
playback timings (ms):
  RedisCDXSource: 9.644
  exclusion.robots: 0.212
  PetaboxLoader3.datanode: 1099.929 (4)
  LoadShardBlock: 1106.547 (3)
  CDXLines.iter: 16.012 (3)
  esindex: 0.014
  captures_list: 1136.468
  load_resource: 57.332
  PetaboxLoader3.resolve: 42.544
  exclusion.robots.policy: 0.197
*/