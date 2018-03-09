const	fs		= require( 'fs' ),
		path	= require( 'path' ),
		router	= require( 'express' ).Router();

var init = ( app, db, tmp_path, functions ) => {
	router.get( '/', ( req, res ) => {
		res.sendfile( path.join( tmp_path, 'index.html' ) );
	} );

	// Stream a media
	router.get( '/media/:idx/:file', ( req, res ) => {
		var idx = req.params.idx;
		var file = req.params.file;

		try
		{
			var media = functions.get_media( idx );
			if ( media && path.basename( media ) == file && fs.existsSync( media ) )
				return ( res.sendFile( media ) );
		}
		catch ( e )
		{
			console.log( 'error:', e );
		}

		res.status( 404 ).end();
	} );

	return ( router );
};

module.exports = init;
