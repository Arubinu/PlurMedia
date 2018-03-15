const	app_title	= 'PlurMedia',
		db_name		= 'default',
		cfg_file	= app_title.toLowerCase(),
		host		= ( process.env.HOST || '' ),
		port		= ( process.env.PORT || 8842 ),
		pwd			= '387d52e8-a73a-4af8-a60a-f155d64b745d';

const	fs			= require( 'fs' ),
		tmplib		= require( 'tmp' ),
		http		= require( 'http' ),
		pathlib		= require( 'path' ),
		unzip		= require( 'unzip' ),
		express		= require( 'express' ),
		winattr		= require( 'winattr' ),
		sqlite		= require( 'sqlite-sync' ),
		tools		= require( './lib/tools' );

var		start		= false,
		config		= {},
		app			= express(),
		server		= http.createServer( app ),
		gui			= false,
		sio			= false,
		tray		= false,
		exec_path	= __dirname,
		sql_path	= false,
		tmp_obj		= false,
		tmp_path	= pathlib.join( exec_path, 'static' );

/// Functions
var functions = {
	tools: tools,
	error: function( file, method, err ) {
		var title = pathlib.basename( file, '.js' );
		if ( typeof( err ) !== 'undefined' )
			title += ' ' + method;
		else
			err = method;

		console.error( title + ':', err );
	},
	config_load: ( init ) => {
		var vars = {};
		var base = {
			general: {
				path: ''
			}
		};

		if ( init )
		{
			try
			{
				var err, file = fs.readFileSync( '.' + cfg_file, { encoding: 'utf-8' } );
				if ( err )
					throw ( err );

				var section = false;
				file = file.replace( '\n', '\r\n' ).split( '\r\n' ).filter( String );
				for ( var i in file )
				{
					var line = file[ i ].trim();
					var key = line.split( '=' );
					if ( line[ 0 ] == '[' && line[ line.length - 1 ] == ']' && line.length > 2 )
					{
						section = line.slice( 1, -1 );
						vars[ section ] = {};
					}
					else if ( section && key.length > 1 )
						vars[ section ][ key[ 0 ] ] = key.slice( '1' ).join( '=' );
				}
			}
			catch ( err )
			{
				config = base;
				functions.config_save();
				throw ( 'config_load: ' + err.toString() );
			}
		}

		config = Object.assign( base, config, vars );
		if ( init )
			functions.config_save();

		return ( config );
	},
	config_save: () => {
		var file = [];
		try
		{
			var err, fd = fs.openSync( '.' + cfg_file, 'w+', { encoding: 'utf-8' } );
			if ( err )
				throw ( err );

			var nl = '\r\n';
			for ( var section in config )
			{
				if ( typeof( config[ section ] ) !== 'object' || Array.isArray( config[ section ] ) )
					continue ;

				file.push( ( file.length ? nl : '' ) + '[' + section + ']' );
				for ( var key in config[ section ] )
				{
					var item = config[ section ][ key ];
					var type = typeof( item );
					if ( type === 'boolean' )
						item = ( item ? 1 : 0 );

					if ( [ 'string', 'number', 'boolean' ].indexOf( type ) >= 0 )
						file.push( key + '=' + item );
				}
			}

			fs.writeSync( fd, file.join( nl ) + nl );
			fs.closeSync( fd );

			winattr.set( '.' + cfg_file, { hidden: true } );
		}
		catch ( err )
		{
			console.error( 'config_save:', err );
		}
	},
	shutdown_server: ( num ) => {
		[ app, sio, sqlite ].forEach( ( item ) => {
			try
			{
				if ( item )
					item.close();
			}
			catch ( err ) {}
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
		console.log( '\rServer ' + ( start ? 'Stoped' : 'Failed to start' ) );

		if ( tmp_obj )
			tmp_obj.removeCallback();

		if ( gui )
		{
			tray.remove();
			tray = null;

			gui.App.quit();
		}

		process.exit( num || 0 );
	},
	get_media: ( idx ) => { // Returns information about a media from its id
		try
		{
			var row = sqlite.run( 'SELECT *, c.path AS cpath, m.path AS mpath FROM medias AS m, categories AS c WHERE m.id = ? AND c.id = m.category', [ idx ] )[ 0 ];

			var media = pathlib.join( row.cpath, row.mpath );
			media = pathlib.join( functions.config_load().general.path, media );

			return ( media );
		}
		catch ( err )
		{
			console.error( 'get_media:', err );
		}

		return ( false );
	}
};

/// Verification
var error = 1;
if ( !fs.existsSync( pathlib.join( tmp_path, 'index.html' ) ) )
{
	if ( fs.existsSync( pathlib.join( exec_path, app_title + '.ass' ) ) )
	{
		tmp_obj = tmplib.dirSync();
		tmp_path = tmp_obj.name;
		fs.createReadStream( pathlib.join( exec_path, app_title + '.ass' ) ).pipe( unzip.Extract( { path: tmp_path } ) );

		if ( fs.existsSync( pathlib.join( tmp_path, 'index.html' ) ) )
		{
			error = false;
			tmp_path = pathlib.join( tmp_path, 'static' );
		}
	}
}
else
	error = false;

if ( !error )
{
	sql_path = pathlib.normalize( pathlib.join( tmp_path, '../' + db_name + '.db' ) )
	sqlite.connect( sql_path );
	if ( !Array.isArray( sqlite.run( 'SELECT * FROM `categories`' ) ) )
		error = 2;
}

if ( !error )
{
	try
	{
		functions.config_load( true );
	}
	catch ( err )
	{
		error = 3;
	}
}

/// Initialisation
if ( error )
{
	var msg = 'unknown error';
	switch ( error )
	{
		case 1: msg = 'Assets file not found'; break ;
		case 2: msg = 'Database error'; break ;
		case 3: msg = 'Configuration file problem'; break ;
	}

	console.error( '\r' + msg + ' !' );
	functions.shutdown_server( error );
}
else
	start = true;

try
{
	gui	= require( 'nw.gui' );
}
catch ( err ) {}

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
