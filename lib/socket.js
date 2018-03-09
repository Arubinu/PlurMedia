const	path	= require( 'path' ),
		socket	= require( 'socket.io' ),
		child	= require( 'child_process' );

var init = ( app, db, tmp_path, functions ) => {
	var sio = socket( app );

	sio.on( 'connection', ( socket ) => {
		var address = socket.handshake.address;

		var tmp = address.split( '.' );
		if ( tmp.length === 4 )
		{
			address = '';
			tmp.forEach( ( item ) => { address += ( address ? '.' : '' ) + ( ' '.repeat( 3 ) + item ).slice( -3 ); } );
		}
		else if ( address.length < 15 )
			address = ( ' '.repeat( 15 ) + address ).slice( -15 );

		console.log( '\r[%s] client connected\t%s', address, socket.id );
		socket.on( 'disconnect', ( data ) => {
			console.log( '\r[%s] client disconnected\t%s', address, socket.id );
		} );

		// Open a media on the server
		socket.on( 'open', ( data ) => {
			var error = false;
			var result = false;

			try
			{
				var sys_local = {
					darwin:	[ 'open' ],
					linux:	[ 'xdg-open' ],
					win:	[ 'start' ], // A vérifier ( ou: explorer )
				};
				var sys_network = {
					darwin:	[ 'open', '-b', 'org.videolan.vlc' ],
					linux:	[ functions.tools.app_path( 'vlc' )[ 0 ] ],
					win:	[ 'start' ], // A changer
				};

				var keys = Object.keys( sys_local );
				for ( var i in keys )
				{
					var key = keys[ i ];
					if ( process.platform.indexOf( key ) === 0 )
					{
						result = [ sys_local[ key ], sys_network[ key ] ];
						break ;
					}
				}

				if ( result )
				{
					var media = functions.get_media( data.id );
					if ( media )
					{
						var method = 0;
						if ( [ 'localhost', '127.0.0.1', '::1', '[::1]' ].indexOf( socket.handshake.address ) < 0 )
						{
							//method = 1;
							media = socket.request.headers.referer + [ 'media', data.id, path.basename( media ) ].join( '/' );
						}

						var cmd = result[ method ].concat( media );
						if ( Array.isArray( cmd[ 0 ] ) && cmd[ 0 ].length )
							cmd[ 0 ] = cmd[ 0 ][ 0 ];

						console.log( 'open:', cmd.join( ' ' ) );
						try
						{
							child.spawn( cmd[ 0 ], cmd.slice( 1 ) ).unref();
						}
						catch ( e ) { error = true; }
					}
				}
			}
			catch ( e )
			{
				error = true;
				console.log( 'error:', e );
			}

			socket.emit( 'open', { receive: data, result: result, error: error } );
		} );

		// Returns the list of categories or a set of media
		socket.on( 'medias', ( data ) => {
			var error = false;
			var result = false;

			try
			{
				var i = 0;
				var words = [];
				var search = '';
				var category = data.category;
				if ( !category || typeof( category ) !== 'number' )
					category = false;

				if ( category )
				{
					words.push( category );
					if ( typeof( data.search ) === 'string' )
					{
						for ( word in data.search.split( ' ' ) )
						{
							var word = word.strip();
							if ( !word.length )
								continue ;

							words.push( word );
							if ( search )
								search += ' OR ';
							search += '( ( `Column1` || `Column2` ) LIKE ( \'%\' || ? || \'%\' ) )';
						}
					}

					if ( search )
						search = ' AND ( ' + search + ' )';

					result = db.run( 'SELECT * FROM `medias` WHERE `category` = ?' + search, words );
				}
				else
					result = db.run( 'SELECT * FROM `categories`' );

				var size = ( ( typeof( result ) === 'object' && Array.isArray( result ) ) ? result.length : 0 );
				result = { type: ( category ? 'medias' : 'categories' ), category: category, list: result, size: size };
			}
			catch ( e )
			{
				error = true;
				console.log( 'error:', e );
			}

			socket.emit( 'medias', { receive: data, result: result, error: error } );
		} );

		// Returns information about a media
		socket.on( 'infos', ( data ) => {
			var error = false;
			var result = false;

			try
			{
				var infos = db.run( 'SELECT * FROM `medias` WHERE `id` = ?', [ data.id ] )[ 0 ];

				tmp = infos.actors;
				try
				{
					tmp = JSON.parse( tmp );
				}
				catch ( e )
				{
					tmp = false;
				}
				infos.actors = tmp;

				result = { type: 'infos', category: data.category, infos: infos };
			}
			catch ( e )
			{
				error = true;
				console.log( 'error:', e );
			}

			socket.emit( 'infos', { receive: data, result: result, error: error } );
		} );
	} );

	return ( sio );
};

module.exports = init;
