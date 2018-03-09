const	fs		= require( 'fs' ),
		path	= require( 'path' );

module.exports = {
	app_path: ( name ) => {
		var find = [];
		var paths = process.env.PATH.split( ':' ).filter( String );

		paths.forEach( ( item ) => {
			try
			{
				if ( fs.readdirSync( item ).indexOf( name ) >= 0 )
					find.push( item );
			}
			catch ( e ) {}
		} );

		return ( find );
	}
};
