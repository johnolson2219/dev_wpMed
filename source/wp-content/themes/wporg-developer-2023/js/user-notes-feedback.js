( function( $ ) {

	if ( undefined === wporg_note_feedback ) {
		return;
	}

	function appendCount( str, count ) {
		return `${ str } (${ count })`;
	}

	var headerOffset     = 0;
	var options        = wporg_note_feedback;
	var comments       = $( '.comment' );
	var feedbackToggle = $( '<a role="button" class="feedback-toggle" href="#"></a>' );
	var commentID      = window.location.hash;

	// Check if the fragment identifier is a comment ID (e.g. #comment-63)
	if ( !commentID.match( /#comment\-[0-9]+$/ ) ) {
		commentID = '';
	}
	
	$( '.feedback-editor' ).each( function() {
		// Hide feedback editors with hide-if-js class
		$( this ).not('.edit-feedback-editor').addClass( 'hide-if-js' );
		$( this ).removeAttr("style");

		// Add quicktag 'inline code' button to editor. 
		var id = $( this ).find( 'textarea' ).attr( 'id' );
		if ( id.length ) {
			QTags.addButton( 'inline-code', 'inline code', '<code>', '</code>', '', '', '', id );
		}
	} );

	// Loop through feedback notes
	comments.each( function() {
		var feedbackLinks = $( this ).find( '.feedback-links' );
		var childComments = $( this ).find( 'ul.children' );
		
		if ( childComments.length && feedbackLinks.length ) {
			var feedback = $( this ).find( '.feedback' );
			var toggle = feedbackToggle.clone();

			var feedback_id = getCommentID( $(this) );
			toggle.attr( {
				'aria-expanded': 'false',
				'aria-controls': 'feedback-' + feedback_id
			} );

			// Set text to 'Hide Feedback' if feedback is displayed
			if ( !feedback.hasClass( 'hide-if-js' ) ) {
				toggle.text( appendCount( options.hide, feedback.attr( 'data-comment-count' ) ) );
			} else {
				toggle.text( appendCount( options.show,  feedback.attr( 'data-comment-count' ) ) )
			}

			// Display hidden add feedback link and add aria
			feedbackLinks.find( '.feedback-add' ).removeAttr("style").attr( {
				'aria-expanded': 'false',
				'aria-controls': 'feedback-editor-' + feedback_id
			} );

			feedbackLinks.prepend( toggle );
		}

		if ( feedbackLinks.length ) {
			// Move the feedback links before the feedback section.
			var clonedElements = feedbackLinks.clone().children();
			var feedbackLinksTop = $( '<div class="feedback-links wporg-dot-link-list"></div>' ).append( clonedElements );
			$( this ).find( '.feedback' ).first().before( feedbackLinksTop );

			// Hide the bottom feedback links.
			feedbackLinks.addClass( 'bottom hide-if-js' );
		}
	} );

	// Returns comment ID from data attribute.
	function getCommentID( el ) {
		return $(el).is("[data-comment-id]") ? el.data( 'comment-id' ) : 0;
	}

	// Removes added elements 
	function resetComment( el ) {
		var children = el.find( 'ul.children' );
		if ( !children.length ) {
			el.find( '.feedback-toggle' ).remove();
		}

		el.find( '.feedback-links.bottom' ).addClass( 'hide-if-js' );
	}

	// Show hidden child comments if the fragment identifier is a comment ID (e.g. #comment-63).  
	$( document ).ready( function() {
		// Set wpAdminBar
		headerOffset = $( '#wpadminbar' ).length ? 32 + 10 : 0;

		// Calculate the header height
		$( '.global-header' )
			.parent()
			.children()
			.each( function () {
				headerOffset += $( this ).outerHeight();
			} );

		var childComments = comments.find( 'ul.children' );

		if ( ! ( commentID.length && childComments.length ) ) {
			return;
		}

		var childComment = childComments.find( commentID + '.depth-2' ).first();
		if ( ! childComment.length ) {
			return;
		}
		// Child comment exists.

		var parent = childComment.closest( '.comment.depth-1' );
		if ( parent.find( '.feedback' ).hasClass( 'hide-if-js' ) ) {
			// Show child comments.
			parent.find( '.feedback-toggle' ).first().trigger( 'click' );
		}

		// Scroll to child comment and adjust for admin bar
		var pos = childComment.offset();
		$( 'html,body' ).animate( {
			scrollTop: pos.top - headerOffset
		}, 1 );

	} );

	// Click event for Show/Hide feedback toggle link.
	comments.on( 'click', '.feedback-toggle', function( e ) {
		e.preventDefault();

		var parent = $( this ).closest( '.comment.depth-1' );
		if ( !parent.length ) {
			return;
		}

		resetComment( parent );
		var feedback = parent.find( '.feedback' );
		var toggleLinks = parent.find( '.feedback-toggle' );
		var children = parent.find( 'ul.children > li' );

		if ( feedback.hasClass( 'hide-if-js' ) ) {
			// Feedback is hidden.

			// Show feedback.
			toggleLinks.text( appendCount( options.hide, children.length ) );
			feedback.removeClass( 'hide-if-js' );
			toggleLinks.attr( 'aria-expanded', 'true' );

			// Go to the clicked feedback toggle link.
			let pos = $( this ).offset();
			$( 'html,body' ).animate(
				{
					scrollTop: pos.top - headerOffset,
				},
				1000
			);
		} else {
			// Hide feedback.
			toggleLinks.text( appendCount( options.show, children.length ) );
			feedback.addClass( 'hide-if-js' );
			toggleLinks.attr( 'aria-expanded', 'false' );

			// Hide editor.
			var editor = feedback.find( '.feedback-editor' );
			editor.addClass( 'hide-if-js' );

			$feedbackAdd = parent.find( '.feedback-add' );
			$feedbackAdd.attr( 'aria-expanded', 'false' );
			$feedbackAdd.text( options.add_feedback );
		}
	} );

	// Show editor when the add feedback link is clicked.
	comments.on( 'click', '.feedback-add', function( e ) {
		e.preventDefault();

		var parent = $( this ).closest( '.comment.depth-1' );
		if ( ! parent.length ) {
			return;
		}

		var feedback = parent.find( '.feedback' );
		var editor = feedback.find( '.feedback-editor' );

		var $button = $( e.target );
		if ( $button.text() === options.hide_feedback ) {
			$button.text( options.add_feedback );

			// Hide the editor
			editor.addClass( 'hide-if-js' );
		} else {
			resetComment( parent );

			var children = parent.find( 'ul.children' );
			var feedbackLinks = parent.find( '.feedback-add' );

			// Show feedback.
			feedback.removeClass( 'hide-if-js' );
			feedbackLinks.attr( 'aria-expanded', 'true' );

			// Show the feedback editor.
			editor.removeClass( 'hide-if-js' );

			// Change the toggle link text to 'Hide Feedback'.
			var toggleLinks = parent.find( '.feedback-toggle' );
			if ( toggleLinks.length ) {
				toggleLinks.attr( 'aria-expanded', 'true' );
				toggleLinks.text( appendCount( options.hide, feedback.attr( 'data-comment-count' ) ) );
			}

			// Go to the feedback editor and give it focus.
			var pos = editor.offset();
			$( 'html,body' ).animate(
				{
					scrollTop: pos.top - headerOffset,
				},
				1000,
				function () {
					editor.find( 'textarea' ).focus();
				}
			);
			editor.find( 'textarea' ).focus();
			$button.text( options.hide_feedback );
		}
	} );
} )( jQuery );
