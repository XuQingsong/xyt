/**
A jQuery plugin for search hints

Author: Lorenzo Cioni - https://github.com/lorecioni
*/

(function($) {
	$.fn.autocomplete = function(params) {
		
		//Selections
		var currentSelection = -1;
		var currentProposals = [];
		
		//Default parameters
		params = $.extend({
			hints: [],
			placeholder: '请输入承运单号',//请输入承运单号
			width: 200,
			height: 16,
			showButton: true,
			buttonText: '查&nbsp;&nbsp询',
			onSubmit: function(text){},
			onBlur: function(){}
		}, params);

		//Build messagess
		this.each(function() {
			//Container
			var searchContainer = $('<div></div>')
				.addClass('autocomplete-container')
				.css('height', params.height * 2);
				
			//Text input		
			var input = $('<input type="text" autocomplete="off" name="query">')
				.attr('placeholder', params.placeholder)
				.addClass('autocomplete-input')
				.css({
					'width' : params.width,
					'height' : params.height
				});
			
			if(params.showButton){
				input.css('border-radius', '3px 0 0 3px');
			}

			//Proposals
			var proposals = $('<div></div>')
				.addClass('proposal-box')
				.css('width', params.width + 0)
				.css('max-height', "400px")
				.css('overflow', "auto")
				.css('top', input.height() + 4);
			var proposalList = $('<ul></ul>')
				.addClass('proposal-list');

			proposals.append(proposalList);
			
			input.keydown(function(e) {
				switch(e.which) {
					case 38: // Up arrow
					e.preventDefault();
					$('ul.proposal-list li').removeClass('selected');
					if((currentSelection - 1) >= 0){
						currentSelection--;
						$( "ul.proposal-list li:eq(" + currentSelection + ")" )
							.addClass('selected');
					} else {
						currentSelection = -1;
					}
					break;
					case 40: // Down arrow
					e.preventDefault();
					if((currentSelection + 1) < currentProposals.length){
						$('ul.proposal-list li').removeClass('selected');
						currentSelection++;
						$( "ul.proposal-list li:eq(" + currentSelection + ")" )
							.addClass('selected');
					}
					break;
					case 13: // Enter
						if(currentSelection == -1 && $( "ul.proposal-list li" ).length > 0){
							currentSelection = 0;
						}
						if(currentSelection > -1){
							var text = $( "ul.proposal-list li:eq(" + currentSelection + ")" ).html();
							input.val(text.split("&nbsp;")[0]);
							input.attr("id", $(text.split("&nbsp;")[1]).attr("id"));
							input.attr("source", $(text.split("&nbsp;")[1]).attr("source"));
						}
						currentSelection = -1;
						proposalList.empty();
						params.onSubmit(input.val() + " " + (input.attr("id")?input.attr("id"):"") + " " + (input.attr("source") ? input.attr("source"):""));
						break;
					case 27: // Esc button
						currentSelection = -1;
						proposalList.empty();
						break;
				}
			});
				
			input.bind("focus paste keyup", function(e){
				if($.trim(input.val()).length <4){
					return;
				}
				//up down Esc
				if(e.which == 27 || e.which == 37
						|| e.which == 38 || e.which == 39 || e.which == 40){
					return;
				}
				$.ajax({
					  url: "/f/onlineBusiness/dept/match",
					  dataType: "json",
					  type:"post",
					  data: {"billNo": input.val().trim()},
					  success: function(data){
						  if(e.which != 13 && e.which != 27
									&& e.which != 38 && e.which != 40){
							  
							  //置空
							  params.hints = [];
							  $(data).each(function(ind) {
			                        params.hints.push(data[ind].billNo+"&nbsp;<span id='"+ data[ind].companyId +"' source='"+ data[ind].source +"'>"+ data[ind].companyName +"</span>");
			                  });
							  
								currentProposals = [];
								currentSelection = -1;
								proposalList.empty();
								if(input.val() != ''){
									var word = "^" + input.val().trim() + ".*";
									proposalList.empty();
									for(var test in params.hints){
										if(params.hints[test].match(word)){
											currentProposals.push(params.hints[test]);	
											var element = $('<li></li>')
												.html(params.hints[test])
												.addClass('proposal')
												.click(function(){
													input.val($(this).html().split("&nbsp;")[0]);
													input.attr("id", $($(this).html().split("&nbsp;")[1]).attr("id"));
													input.attr("source", $($(this).html().split("&nbsp;")[1]).attr("source"));
													proposalList.empty();
													params.onSubmit(input.val() + " " + (input.attr("id")?input.attr("id"):"") + " " + (input.attr("source")?input.attr("source"):""));
												})
												.mouseenter(function() {
													$(this).addClass('selected');
												})
												.mouseleave(function() {
													$(this).removeClass('selected');
												});
											proposalList.append(element);
										}
									}
								}
							}
						 }
					}); 
			});
			
			input.blur(function(e){
				currentSelection = -1;
				//proposalList.empty();
				params.onBlur();
			});
			
			searchContainer.append(input);
			searchContainer.append(proposals);		
			
			if(params.showButton){
				//Search button
				var button = $('<div></div>')
					.addClass('autocomplete-button')
					.html(params.buttonText)
					.css({
						'height': params.height + 2,
						'line-height': params.height + 2 + 'px'
					})
					.click(function(){
						if(currentSelection == -1 && $( "ul.proposal-list li" ).length > 0){
							currentSelection = 0;
						}
						if(currentSelection > -1){
							var text = $( "ul.proposal-list li:eq(" + currentSelection + ")" ).html();
							input.val(text.split("&nbsp;")[0]);
							input.attr("id", $(text.split("&nbsp;")[1]).attr("id"));
							input.attr("source", $(text.split("&nbsp;")[1]).attr("source"));
						}
						currentSelection = -1;
						proposalList.empty();
						params.onSubmit(input.val() + " " + (input.attr("id")?input.attr("id"):"") + " " + (input.attr("source")?input.attr("source"):""));
					});
				searchContainer.append(button);	
			}
	
			$(this).append(searchContainer);	
			
			if(params.showButton){
				//Width fix
				searchContainer.css('width', params.width + button.width() + 50);
			}
		});

		return this;
	};

})(jQuery);