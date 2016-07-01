$(document).ready(function () {

	$(document).click(function(event) {
	    if ( $(event.target).closest("popup_wrap").get(0) == null ) {         
	    	event.preventDefault();

			if ( event.target.className == "icon-male") {
	    		event.preventDefault();
	    		$('.popup_wrap').css({"display":"block"});
	    		$('body').css({'overflow':'hidden'});
	    	}else{
	    		if ( event.target.className == "server-img") {
		    		event.preventDefault();
		    		$('.popup_wrap').css({"display":"block"});
		    		$('body').css({'overflow':'hidden'});
		    	}
	    	}

	    	

	    	// else {
	    	// 	$('.popup_wrap').css({"display":"none"});
	    	// 	$('body').css({'overflow':'visible'});
	    	// }
	    } 
	});


	$('.remove_icon').click(function(event) {
		$('.popup_wrap').css({"display":"none"});
		event.preventDefault();
	});
});





