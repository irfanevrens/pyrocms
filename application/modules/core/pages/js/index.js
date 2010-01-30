(function($) {
	
	function TreeCookie(node_id){
		this.node_id = node_id || false;
		return this.prototype;
	}

	TreeCookie.prototype = {
		config : {
			name : 'page_parent_ids',	// cookie name
			delimiter : ',',		// its a csv string
			expiredays : 1			// life of cookie in days
		},
		_set : function(name, val, expiredays){
			expiredays = expiredays || this.config.expiredays;
			var exdate = new Date();
			exdate.setDate(exdate.getDate()+expiredays);
			document.cookie = name+"="+escape(val)+((expiredays==null) ? "" : ";expires="+exdate.toGMTString())+";path=/";
		},
		_get : function(name){
			if (document.cookie.length > 0){
				var start = document.cookie.indexOf(name+"=");
				if (start != -1){
					start = start+name.length+1;
					var end = document.cookie.indexOf(";", start);
					if (end == -1)
						end = document.cookie.length;
					return unescape(document.cookie.substring(start, end));
				}
			}
			return '';
		},
		add : function(){
			var ids = this._get(this.config.name).split(this.config.delimiter);
			// check id doesn't already exist in cookie list
			for(var i=0; i<ids.length; i++) if (ids[i] == this.node_id) return; 
			// add parent id list
			ids.push(this.node_id);
			// save csv string to cookie
			this._set(this.config.name, ids.join(this.config.delimiter));
		},
		remove : function(){
			var self = this, pageids = [], newids = [], 
			ids = this._get(this.config.name).split(this.config.delimiter);

			for(var id in ids) {
				if (ids[id] == this.node_id) {
					ids.splice(id,1);
				}
			}
			console.debug(ids);
			// remove pages from cookie list 
			//for(var i=0; i<ids.length; i++) (!ids[1] in pageids) && newids.push(ids[i]);
			// save csv string to cookie
			this._set(this.config.name, ids.join(this.config.delimiter));
		}
	};
	
	
	$(function(){

		var page_tree = $("div#page-tree > ul");

		page_tree.treeview({
			toggle: function() {
				expandTree(this);
				return false;
			}
		});

		function expandTree(item)
		{
			// Define elements
			li = $(item);
			span = li.children('span');
			a = span.children('a');
			other_a = page_tree.find('span > a');
			
			var page_id = a.attr('rel').replace('page-', '');
		
			// Change which link is selected
			other_a.removeClass('selected');
			a.addClass('selected');

			// Folder eh? Let's do cool stuff
			if(span.hasClass('folder'))
			{
				child_ul = $('ul', li);
		
				// This is being expanded (and therefore the class has switched to collapseable to show that it is now opened)
				if(li.hasClass('collapsable'))
				{
					// We have already AJAXed in the contents of this folder
					if( child_ul.children().length == 0 )
					{
						$.get(BASE_URI + 'admin/pages/ajax_fetch_children/' + page_id, function(data){
							var branches = $(data).appendTo(child_ul);
							page_tree.treeview({
								add: branches
							});
						});
						
						$('li span', page_tree).unbind('click');
					}
					(new TreeCookie(page_id)).add();
				} else {
					(new TreeCookie(page_id)).remove();
				}
			}
			
		}
	
		$('.filetree li span', page_tree).unbind('click');
		$('.filetree li a', page_tree).live('click', function()
		{
			a = $(this);
			other_a = page_tree.find('span > a');

			// Already selected?
			/*if(a.hasClass('selected'))
			{
				return false; // BAIL!
			}*/
			
			// Change which link is selected
			other_a.removeClass('selected');
			a.addClass('selected');
			
			page_id = $(this).attr('rel').replace('page-', '');
			
			// Update the "Details" panel
			$('div#page-details').load(BASE_URI + 'admin/pages/ajax_page_details/' + page_id);
			
			return false;
		});
		
		/*$(".filetree").sortable({
			connectWith: 'ul',
			handle: 'span'
		});*/
		
	});
  
})(jQuery);