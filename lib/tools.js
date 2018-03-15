const	fs		= require( 'fs' ),
		pathlib	= require( 'path' );

module.exports = {
	app_path: ( name ) => {
		var find = [];
		var path = process.env.PATH.split( ':' ).filter( String );

		path.forEach( ( item ) => {
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
