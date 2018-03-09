const	app_title	= 'PlurMedia',
		db_name		= 'default',
		host		= ( process.env.HOST || '' ),
		port		= ( process.env.PORT || 8842 ),
		pwd			= '387d52e8-a73a-4af8-a60a-f155d64b745d';

const	fs			= require( 'fs' ),
		tmp			= require( 'tmp' ),
		http		= require( 'http' ),
		path		= require( 'path' ),
		unzip		= require( 'unzip' ),
		express		= require( 'express' ),
		sqlite		= require( 'sqlite-sync' ),
		tools		= require( './lib/tools' );

var		app			= express(),
		server		= http.createServer( app ),
		gui			= false,
		sio			= false,
		tray		= false,
		exec_path	= __dirname,
		sql_path	= false,
		tmp_obj		= false,
		tmp_path	= path.join( exec_path, 'static' );

/// Verification
var error = 1;
if ( !fs.existsSync( path.join( tmp_path, 'index.html' ) ) )
{
	if ( fs.existsSync( path.join( exec_path, app_title + '.ass' ) ) )
	{
		tmp_obj = tmp.dirSync();
		tmp_path = tmp_obj.name;
		fs.createReadStream( path.join( exec_path, app_title + '.ass' ) ).pipe( unzip.Extract( { path: tmp_path } ) );

		if ( fs.existsSync( path.join( tmp_path, 'index.html' ) ) )
		{
			error = false;
			tmp_path = path.join( tmp_path, 'static' );
		}
	}
}
else
	error = false;

if ( !error )
{
	sql_path = path.normalize( path.join( tmp_path, '../' + db_name + '.db' ) )
	sqlite.connect( sql_path );
	if ( !Array.isArray( sqlite.run( 'SELECT * FROM `categories`' ) ) )
		error = 2;
}

/// Initialisation
if ( error )
{
	if ( error == 1 )
		console.log( '\rFicher d\'assets introuvable !' );
	else if ( error == 2 )
		console.log( '\rErreur concernant la base de donnée !' );

	process.exit( error );
}

try
{
	gui	= require( 'nw.gui' );
}
catch ( e ) {}

/// Functions
var functions = {
	tools: tools,
	shutdown_server: () => {
		[ app, sio, sqlite ].forEach( ( item ) => {
			try
			{
				if ( item )
					item.close();
			}
			catch ( e ) {}
		} );

		var date = '';
		var tdate = new Date();
		[ 'Day', 'Month', 'Date', 'Hours', ':Minutes', ':Seconds', 'FullYear' ].forEach( ( item ) => {
			if ( date.length )
			{
				var time = ( item[ 0 ] == ':' );
				date += ( time ? ':' : ' ' );
				if ( time )
					item = item.substr( 1 );
			}

			var tmp = tdate[ 'get' + item ]();
			switch ( item )
			{
				case 'Hours':
				case 'Minutes':
				case 'Seconds':
					tmp = ( '0' + tmp ).slice( -2 );
					break ;

				case 'Day':
					tmp = [ 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat' ][ tmp ];
					break ;

				case 'Month':
					tmp = [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ][ tmp ];
					break ;
			}

			date += tmp;
		} );

		date = date.split( ' ' );
		if ( date[ 2 ].length == 1 )
			date[ 2 ] = ' ' + date[ 2 ];

		console.log( '\r' + date.join( ' ' ) );
		console.log( '\rServer Stoped' );

		if ( tmp_obj )
			tmp_obj.removeCallback();

		if ( gui )
		{
			tray.remove();
			tray = null;

			gui.App.quit();
		}

		process.exit();
	},
	get_media: ( idx ) => { // Returns information about a media from its id
		try
		{
			var row = sqlite.run( 'SELECT *, c.path AS cpath, m.path AS mpath FROM medias AS m, categories AS c WHERE m.id = ? AND c.id = m.category', [ idx ] )[ 0 ];

			var media = path.join( row.cpath, row.mpath );
			media = path.join( '/Users/apergens/Movies', media );

			return ( media );
		}
		catch ( e )
		{
			console.log( 'error:', e );
		}

		return ( false );
	}
};

/// Management of system tray
if ( gui )
{
	// Create a tray icon
	tray = new gui.Tray( { title: app_title, icon: './resources/logo_64.' + ( ( process.platform.indexOf( 'win' ) === 0 ) ? 'ico' : 'png' ) } );

	// Create an empty menu
	var menu = new gui.Menu();

	// Create some items
	items = [
		//new gui.MenuItem( { type: 'checkbox', label: 'box1' } ),
		{ type: 'separator' },
		{ label: 'Exit', click: functions.shutdown_server }
	];

	// Add some items
	items.forEach( ( item ) => {
		menu.append( new gui.MenuItem( item ) );
	} );

	// Add menu in tray
	tray.menu = menu;
}

/// Launching
var args = [ server, sqlite, tmp_path, functions ];
process.on( 'SIGINT', functions.shutdown_server );

app.use( express.static( tmp_path ) );
app.use( '/', require( './lib/router' )( ...args ) );

sio = require( './lib/socket' )( ...args );

server.listen( port, host, function() {
	var address = this.address();
	console.log( '\rServer Started on ' + address.address + ':' + address.port );
} );
