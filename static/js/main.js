document.addEventListener( 'contextmenu', ( event ) => event.preventDefault() );

$( function() {
	// Variables
	var begin = false;
	var socket = false;
	var language = ( cookie( 'lang' ) || 'en' );
	var templates = {};
	var emit_prev = false;
	var emit_callback = [];
	var bartop_callback = false;

	var back = $( '.navbar .fa-angle-left' );
	var search = $( '#search' );
	var bartop = $( '#bartop' );
	var medias = $( '#medias' );
	var player = $( '#player' );

	// Loading and Templates
	var langs = {};
	$.get( 'langs.json', 'json' ).done( ( data ) => {
		langs = data;

		var auto = { search: search };
		$.each( [ 'search', 'bartop', 'medias', 'player' ], ( index, item ) => {
			$.get( 'templates/' + item + '.tpl', ( tpl ) => {
				templates[ item ] = Handlebars.compile( tpl );

				if ( item in auto )
					auto[ item ].html( templates[ item ]() );
			} );
		} );
	} );

	// Functions
	function cookie( key, value )
	{
		if ( typeof( value ) !== 'undefined' )
			$.cookie( key, value, { expires: 365, path: '/' } );

		return ( $.cookie( key ) );
	}

	function status( connected, check )
	{
		if ( check && begin != connected )
			return ;
		else if ( !begin && connected )
			emit( 'medias', { category: false, search: '' } );

		begin = ( begin || connected );
		$( '#server-status' )[ connected ? 'fadeOut' : 'fadeIn' ]();
	}

	function emit( key, value, passed )
	{
		socket.emit( key, value );
		if ( !passed )
		{
			var tmp = emit_callback.slice( -1 );
			if ( !tmp || JSON.stringify( [ key, value ] ) != JSON.stringify( tmp[ 0 ] ) )
				emit_callback.push( [ key, value ] );
		}

		emit_prev = false;
		back.toggle( emit_callback.length >= 2 );
	}

	function prev()
	{
		if ( emit_callback.length >= ( emit_prev ? 1 : 2 ) )
		{
			if ( !emit_prev )
				emit_callback.pop();

			var tmp = emit_callback.pop();
			if ( !emit_callback.length )
				emit_callback.push( tmp );

			emit( ...tmp, true );
		}

		emit_prev = true;
		back.toggle( emit_callback.length >= 2 );
	}

	function empty()
	{
		medias.html( $( '<div>' ).addClass( 'empty text-center' ).text( 'Aucun média trouvé ...' ) );
	}

	function bartop_refresh( data )
	{
		var zoom = medias.attr( 'data-zoom' );
		if ( !zoom )
			zoom = cookie( 'zoom' );

		bartop.html( templates[ 'bartop' ]( data ) ).find( '.zoom' ).val( zoom || 2 ).trigger( 'change' );
	}

	function play( data )
	{
		var video = $( '<video>' ).attr( 'volume', 1 ).appendTo( player );
		var video0 = video.get( 0 );

		player.find( '.tpl' ).html( templates[ 'player' ]( data ) );
		var top = $( '.top', player );
		var bottom = $( '.bottom', player );

		top.off( 'click', '.fa-exchange-alt' ).on( 'click', '.fa-exchange-alt', function( event, force ) {
			if ( !force && ( window.screenTop || window.screenY ) )
			{
				if ( player.get( 0 ).mozRequestFullScreen )
					player.get( 0 ).mozRequestFullScreen();
				else if ( player.get( 0 ).webkitRequestFullScreen )
					player.get( 0 ).webkitRequestFullScreen( Element.ALLOW_KEYBOARD_INPUT );
				else if ( player.get( 0 ).requestFullscreen )
					player.get( 0 ).requestFullscreen();
			}
			else
			{
				if ( document.mozCancelFullScreen )
					document.mozCancelFullScreen();
				else if ( document.webkitCancelFullScreen )
					document.webkitCancelFullScreen( Element.ALLOW_KEYBOARD_INPUT );
				else if ( document.exitFullscreen )
					document.exitFullscreen();
			}
		} );
		bottom.off( 'click', '.play' ).on( 'click', '.play', function( event, passed ) {
			var keys = [ 'play', 'pause' ];
			var played = video0.paused;
			if ( passed === true )
				played = !played;
			else
				video0[ keys[ played ? 0 : 1 ] ]();

			$( this ).removeClass( 'fa-' + keys[ played ? 0 : 1 ] ).addClass( 'fa-' + keys[ played ? 1 : 0 ] );
		} );
		bottom.off( 'click', '.fa-backward, .fa-forward' ).on( 'click', '.fa-backward, .fa-forward', function() {
			var tmp = video0.currentTime;
			if ( $( this ).hasClass( 'fa-forward' ) )
			{
				tmp += 30;
				if ( tmp >= video0.duration )
				{
					tmp = 0;
					video0.pause();
				}
			}
			else
				tmp = ( ( ( tmp - 10 ) <= 0 ) ? 0 : ( tmp - 10 ) );

			video0.currentTime = tmp;
		} );
		$( '.volume', bottom ).on( 'input change drag', function() { video0.volume = ( $( this ).val() / 100 ); } ).val( parseInt( video0.volume * 100 ) );

		video.on( 'error', function() { console.log( 'error:', arguments ); } );
		video.on( 'abort', function() { console.log( 'abort:', arguments ); } );

		video.on( 'canplay', function() { video.fadeIn( 5000 ); setTimeout( () => { video0.play(); }, 1000 ) } );
		video.on( 'play pause', function() { $( '.play', bottom ).trigger( 'click', [ true ] ); } );

		video.on( 'loadeddata', function() { console.log( 'loadeddata:', arguments ); } );
		video.on( 'loadedmetadata', function() { console.log( 'loadedmetadata:', arguments ); } );

		//video.on( 'progress', function() { console.log( 'progress:', arguments ); } );
		//video.on( 'timeupdate', function() { console.log( 'timeupdate:', arguments ); } );

		//video.on( 'volumechange', function() { console.log( 'volumechange:', video0.volume ); } );
		video.on( 'ratechange', function() { console.log( 'ratechange:', arguments ); } );
		video.on( 'seeking', function() { console.log( 'seeking:', arguments ); } );
		video.on( 'seeked', function() { console.log( 'seeked:', arguments ); } );

		video.hide().attr( 'src', ( 'media/' + data.id + '/' + data.path.split( '/' ).slice( -1 ) ) );

		medias.fadeOut( 'slow' );
		player.fadeIn( 'slow' );
	}

	// Actions
	setTimeout( () => { status( false, true ); }, 1000 );

	$( window ).resize( () => {
		var infos = medias.find( '.infos' );
		if ( infos.length )
		{
			var h = medias.height();
			var w = medias.width();
			var r = w / h;

			var tmp = ( h - 250 );
			if ( r > 1.78 )
			{
				var tmp2 = w / 1.78;
				if ( tmp2 < tmp )
					tmp = tmp2;
			}
			else if ( tmp < 110 )
				tmp = 110;

			infos.find( '.banner' ).height( tmp );
		}
	} );

	$( document )
		.on( 'click', '.navbar .fa-angle-left', prev )
		.on( 'click', '.navbar .fa-home', () => { emit( 'medias', { category: false, search: '' } ); } )
		.on( 'click', '#medias .category', function() {
			emit( 'medias', { category: $( this ).data( 'id' ), search: false } );
		} )
		.on( 'click', '#medias .media', function( event ) {
			var elem = $( event.target );
			if ( elem.hasClass( 'fa-play' ) || elem.children( '.fa-play' ).length || elem.parents( '.fa-play' ).length )
				return ;

			emit( 'infos', { category: $( this ).data( 'category' ), id: $( this ).data( 'id' ) } );
		} )
		.on( 'click', '#bartop i, #bartop svg', function() {
			if ( typeof( bartop_callback ) === 'function' )
				bartop_callback( ...arguments );
		} )
		.on( 'input change drag', '#bartop .zoom', function() {
			var zoom = $( this ).val();
			medias.attr( 'data-zoom', zoom );
			cookie( 'zoom', zoom );
		} )
		.on( 'click', '#player .bottom .fa-times-circle', function() {
			$( '.top .fa-exchange-alt', player ).trigger( 'click', [ true ] );

			medias.fadeIn( 'slow' );
			player.fadeOut( 'slow', function() { $( this ).find( 'video' ).remove(); } );
		} );

	var timeout_search = 0;
	search.find( 'input' )
		.keyup( function() {
			var elem = $( this );
			var text = elem.val();
			var visible = !!text.length;

			if ( timeout_search )
				clearTimeout( timeout_search );

			timeout_search = setTimeout( () => {
				timeout_search = 0;
				elem.parent().find( '.fa-times' ).toggle( visible );
				emit( 'medias', { category: false, search: text } );
			}, 250 );
		} )
		.parent().find( '.fa-times' ).click( function() {
			$( this ).hide().parent().find( 'input' ).val( '' );
		} );

	$( '#dropdown' ).on( 'change', function( event ) {
		var selected = event.target.selectedOptions[ 0 ].value;
		emit( 'medias', [ selected ] );
	} ).trigger( 'change' );

	// Handlebar
	var set_values = {};
	var date_null = [ null, '', '0000-00-00', '0000-00-00 00:00:00' ];
	$.each( [
		[ 'log',			function() { console.log( ...Array.prototype.slice.call( arguments, 0, -1 ) ); } ],
		[ 'concat',			function() { return ( Array.prototype.slice.call( arguments, 1, -1 ).join( '' ) ); } ],
		[ 'upper',			function() { return ( arguments[ 0 ].toUpperCase() ); } ],
		[ 'lower',			function() { return ( arguments[ 0 ].toLowerCase() ); } ],
		[ 'eq',				function() { return ( arguments[ 0 ] === arguments[ 1 ] ); } ],
		[ 'not-eq',			function() { return ( arguments[ 0 ] !== arguments[ 1 ] ); } ],
		[ 'not',			function() { return ( !arguments[ 0 ] ); } ],
		[ 'and',			function() { return ( arguments[ 0 ] && arguments[ 1 ] ); } ],
		[ 'or',				function() { return ( arguments[ 0 ] || arguments[ 1 ] ); } ],
		[ 'xor',			function() { return ( ( arguments[ 0 ] && !arguments[ 1 ] || !arguments[ 0 ] && arguments[ 1 ] ) ); } ],
		[ 'gt',				function() { return ( arguments[ 0 ] > arguments[ 1 ] ); } ],
		[ 'gte',			function() { return ( arguments[ 0 ] >= arguments[ 1 ] ); } ],
		[ 'lt',				function() { return ( arguments[ 0 ] < arguments[ 1 ] ); } ],
		[ 'lte',			function() { return ( arguments[ 0 ] <= arguments[ 1 ] ); } ],
		[ 'in',				function() { return ( arguments[ 1 ].indexOf( arguments[ 0 ] ) >= 0 ); } ],
		[ 'not-in',			function() { return ( arguments[ 1 ].indexOf( arguments[ 0 ] ) < 0 ); } ],
		[ 'count',			function() { return ( ( typeof( arguments[ 0 ] ) === 'object' ) ? ( Array.isArray( arguments[ 0 ] ) ? arguments[ 0 ].length : Object.keys( arguments[ 0 ] ).length ) : 0 ); } ],
		[ 'is-array',		function() { return ( Array.isArray( arguments[ 0 ] ) ); } ],
		[ 'date-null',		function() { return ( date_null.indexOf( arguments[ 0 ] ) >= 0 ); } ],
		[ 'get',			function() { return ( set_values[ arguments[ 0 ] ] ); } ],
		[ 'set',			function() { set_values[ arguments[ 0 ] ] = arguments[ 1 ]; } ],
		[ 'keys',			function() { return ( Object.keys( arguments[ 0 ] ) ); } ],
		[ 'join',			function() { return ( arguments[ 0 ].join( arguments[ 1 ] ) ); } ],
		[ 'split',			function() { return ( arguments[ 0 ].split( arguments[ 1 ] ) ); } ],
		[ 'slice',			function() { return ( arguments[ 0 ].slice( arguments[ 1 ], arguments[ 2 ] ) ); } ],
		[ 'array',			function() { return ( Array.prototype.slice.call( arguments, 0, -1 ) ); } ],
		[ 'array-get',		function() { return ( arguments[ 1 ][ arguments[ 0 ] ] ); } ],
		[ 'array-add',		function() { return ( arguments[ 0 ].concat( Array.prototype.slice.call( arguments, 1, -1 ) ) ); } ],
		[ 'array-concat',	function() { return ( arguments[ 0 ].concat( arguments[ 1 ] ) ); } ],
		[ 'atob',			function() { return ( atob( arguments[ 0 ] ) ); } ],
		[ 'btoa',			function() { return ( btoa( arguments[ 0 ] ) ); } ],
		[ 'encode',			function() { return ( unescape( encodeURIComponent( arguments[ 0 ] ) ) ); } ],
		[ 'decode',			function() {
			var val = arguments[ 0 ];
			try { val = decodeURIComponent( escape( val ) ); } catch ( e ) {}
			return ( val );
		} ],
	], ( index, item ) => {
		Handlebars.registerHelper( item[ 0 ], function() {
			try
			{
				return ( item[ 1 ]( ...arguments ) );
			}
			catch ( e )
			{
				console.error( item[ 0 ], arguments, e );
			}

			return ( '' );
		} );
	} );

	Handlebars.registerHelper( 'dateFormat', ( date, block ) => {
		var format = block.hash.format || 'mm D, yy';
		return ( $.datepicker.formatDate( format, new Date( date ) ) );
	} );

	Handlebars.registerHelper( 'assets', function() {
		var path = Array.prototype.slice.call( arguments, 1, -1 ).join( '' );
		path = unescape( encodeURIComponent( path ) );

		return ( arguments[ 0 ] + '/' + path );
		//return ( btoa( arguments[ 0 ] + '/' + path ) );
	} );

	Handlebars.registerHelper( 'trans', function( name, block ) {
		var lang = ( block.hash.lang ? block.hash.lang : language );
		return ( ( ( lang in langs ) && name in langs[ lang ] ) ? langs[ lang ][ name ] : '' );
	} );

	// Socket
	socket = io( window.location.host, {
		'rejectUnauthorized':	true,
		'timeout':				1000,
		'reconnect':			true,
		'reconnectionDelay':	5000,
		'reconnectionDelayMax':	5000
	} );

	socket.on( 'connect', () => { status( true ); } );
	socket.on( 'disconnect', () => { status( false ) } );

	socket.on( 'medias', ( data ) => {
		data = data.result;
		if ( typeof( data ) !== 'object' || typeof( data.list ) !== 'object' || !Array.isArray( data.list ) || !data.list.length )
			return ( empty() );

		bartop_refresh( data );
		medias.html( templates[ 'medias' ]( data ) );

		$.each( data.list, function( index, item ) {
			medias.find( '.media[data-id=\'' + item.id + '\'] .poster > div > div > div > div' ).click( () => { play( item ); } );
		} );
	} );

	socket.on( 'infos', ( data ) => {
		data = data.result;
		if ( typeof( data ) !== 'object' || typeof( data.infos ) !== 'object' )
			return ( empty() );

		bartop_refresh( data );
		medias.html( templates[ 'medias' ]( data ) );

		$( window ).trigger( 'resize' );
		medias.find( '.poster' ).click( () => { play( data.infos ); } );
		bartop_callback = ( event ) => {
			var elem = $( event.target );
			if ( !elem.is( 'i, svg' ) )
				elem = elem.parents( 'i, svg' );

			var name = false;
			$.each( elem.attr( 'class' ).split( ' ' ), ( index, item ) => {
				var key = 'fa-';
				if ( item.indexOf( key ) === 0 )
				{
					var tmp = item.substr( key.length );
					name = ( ( tmp.indexOf( '-' ) !== 1 ) ? tmp : name );
				}
			} );

			switch ( name )
			{
				case 'play':
					play( data.infos );
					break ;
				case 'share-square':
					socket.emit( 'open', { id: data.infos.id } );
					break ;
			}
		};
	} );
} );
