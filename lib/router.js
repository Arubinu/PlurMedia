const	fs		= require( 'fs' ),
		pathlib	= require( 'path' ),
		router	= require( 'express' ).Router();

var init = ( app, db, tmp_path, functions ) => {
	router.get( '/', ( req, res ) => {
		res.sendfile( pathlib.join( tmp_path, 'index.html' ) );
	} );

	// Loading languages
	router.get( '/langs.json', ( req, res ) => {
		var dir = pathlib.join( tmp_path, '..', 'language' );
		fs.readdir( dir, ( err, files ) => {
			var langs = {};
			if ( !err )
			{
				files.forEach( ( file ) => {
					var parse = pathlib.parse( file );
					if ( parse.ext != '.json' )
						return ;

					try
					{
						var data = fs.readFileSync( pathlib.join( dir, file ), { encoding: 'utf8' } );
						langs[ parse.name ] = JSON.parse( data );
					}
					catch ( err ) {}
				} );
			}

			res.json( langs ).end();
		} );
	} );

	// Stream a media
	router.get( '/media/:idx/:file', ( req, res ) => {
		var idx = req.params.idx;
		var file = req.params.file;

		try
		{
			var media = functions.get_media( idx );
			if ( media && pathlib.basename( media ) == file && fs.existsSync( media ) )
				return ( res.sendFile( media ) );
		}
		catch ( err )
		{
			functions.error( __filename, 'stream', err );
		}

		res.status( 404 ).end();
	} );

	return ( router );
};

module.exports = init;
