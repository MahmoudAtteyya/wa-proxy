<?php
/**
 * The base configuration for WordPress
 *
 * The wp-config.php creation script uses this file during the installation.
 * You don't have to use the website, you can copy this file to "wp-config.php"
 * and fill in the values.
 *
 * This file contains the following configurations:
 *
 * * Database settings
 * * Secret keys
 * * Database table prefix
 * * ABSPATH
 *
 * @link https://developer.wordpress.org/advanced-administration/wordpress/wp-config/
 *
 * @package WordPress
 */

// ** Database settings - You can get this info from your web host ** //
/** The name of the database for WordPress */
define( 'DB_NAME', 'cyo1kajm1_644885dd_wordpress' );

/** Database username */
define( 'DB_USER', 'cyo1kajm1_644885dd_wordpress' );

/** Database password */
define( 'DB_PASSWORD', 'gM!2lKb!Abt2RF1tbSgm' );

/** Database hostname */
define( 'DB_HOST', 'mysql.cyo1kajm1.service.one' );

/** Database charset to use in creating database tables. */
define( 'DB_CHARSET', 'utf8' );

/** The database collate type. Don't change this if in doubt. */
define( 'DB_COLLATE', '' );

/**#@+
 * Authentication unique keys and salts.
 *
 * Change these to different unique phrases! You can generate these using
 * the {@link https://api.wordpress.org/secret-key/1.1/salt/ WordPress.org secret-key service}.
 *
 * You can change these at any point in time to invalidate all existing cookies.
 * This will force all users to have to log in again.
 *
 * @since 2.6.0
 */
define( 'AUTH_KEY',         'UmbFMsLKty3J3JXtMNqhEDSj5QU084AJ9lBoKg5_7ro=' );
define( 'SECURE_AUTH_KEY',  'vQK2TlCEGcMzsUwiTD25__KD_pf1jayr_DWxa-bveR8=' );
define( 'LOGGED_IN_KEY',    '48_mWqW6MKjI3JbDJHyXi9kCu_REZ2-uhVzBmb66MJU=' );
define( 'NONCE_KEY',        'lM9y2QXD2a4UbzJiiCV-y3HfcYtuCeBsxw-eSOLokHI=' );
define( 'AUTH_SALT',        '8SFEQnPYPqGSTE8PKCjCYlDkDBI93JAC9UWX_rnnvuA=' );
define( 'SECURE_AUTH_SALT', 'UaX1SqG_H9Qlit-t4sKzRE2A8rSlP50GrRl9XbQiXG0=' );
define( 'LOGGED_IN_SALT',   'jzDn7JDJFOxUQHgvvNmN52MQiFfx2yEG_tgKeNLYTRs=' );
define( 'NONCE_SALT',       't1DuhysGP-O8_qnAmFhIqQs1gS3EydzpqakKdCTTYCo=' );

/**#@-*/

/**
 * WordPress database table prefix.
 *
 * You can have multiple installations in one database if you give each
 * a unique prefix. Only numbers, letters, and underscores please!
 *
 * At the installation time, database tables are created with the specified prefix.
 * Changing this value after WordPress is installed will make your site think
 * it has not been installed.
 *
 * @link https://developer.wordpress.org/advanced-administration/wordpress/wp-config/#table-prefix
 */
$table_prefix = 'wp499701_';

/**
 * For developers: WordPress debugging mode.
 *
 * Change this to true to enable the display of notices during development.
 * It is strongly recommended that plugin and theme developers use WP_DEBUG
 * in their development environments.
 *
 * For information on other constants that can be used for debugging,
 * visit the documentation.
 *
 * @link https://developer.wordpress.org/advanced-administration/debug/debug-wordpress/
 */
/* Add any custom values between this line and the "stop editing" line. */
define('OCI_DOMAIN', 'elliaa.com');
define('OCI_SUBDOMAIN', 'wp');


/**
 * WordPress Localized Language, defaults to English.
 *
 * Change this to localize WordPress. A corresponding MO file for the chosen
 * language must be installed to wp-content/languages. For example, install
 * de_DE.mo to wp-content/languages and set WPLANG to 'de_DE' to enable German
 * language support.
 */
define( 'WPLANG', 'en_GB' );

/**
 * Get email from control email
 *
 * Just set to default email fields during 1-click installation
 */
define( 'WPEMAIL', '' );

/**
 * Prevent file editing from WP admin.
 * Just set to false if you want to edit templates and plugins from WP admin.
 */
define('DISALLOW_FILE_EDIT', true);

/**
 * API for One.com wordpress themes and plugins
 */
define('ONECOM_WP_ADDONS_API', 'https://wpapi.one.com');

/**
 * Client IP for One.com logs
 */
if (getenv('HTTP_CLIENT_IP')){$_SERVER['ONECOM_CLIENT_IP'] = @getenv('HTTP_CLIENT_IP');}
else if(getenv('REMOTE_ADDR')){$_SERVER['ONECOM_CLIENT_IP'] = @getenv('REMOTE_ADDR');}
else{$_SERVER['ONECOM_CLIENT_IP']='0.0.0.0';}

define( 'WP_DEBUG', false );
/* That's all, stop editing! Happy publishing. */

/** Absolute path to the WordPress directory. */
if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', __DIR__ . '/' );
}

/** Sets up WordPress vars and included files. */
require_once ABSPATH . 'wp-settings.php';