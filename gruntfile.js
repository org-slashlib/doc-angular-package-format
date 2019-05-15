/**
 *  © 2019, slashlib.org.
 */
"use strict";
const path      = require( "path" );
const tsc       = require( "rollup-plugin-tsc" );
const srcmaps   = require( "rollup-plugin-sourcemaps" );
const terser    = require( "rollup-plugin-terser" ).terser;

const BUILD     = "build";
const CONFIG    = "config";
const DIST      = "dist";
const DOC       = "doc";
const LIB       = "lib";
const SRC       = "src";

module.exports = function( grunt ) {
  // set grunt options
  let pkgjson = grunt.file.readJSON( "package.json"  );
  let scope   = pkgjson.name.slice( 0, pkgjson.name.indexOf("/")).replace( "@", "" );
  let pkgname = pkgjson.name.slice( pkgjson.name.indexOf("/") + 1 );
  let pkglobl = scope ? `${ scope }.${ pkgname }` : pkgname;

  let cmpopts  = {}
      cmpopts[ "outDir"                 ] = "xxx";
      cmpopts[ "target"                 ] = "xxx";
      cmpopts[ "module"                 ] = "xxx";
      cmpopts[ "moduleResolution"       ] = "node";
      cmpopts[ "declaration"            ] = true;
      // cmpopts[ "sourceMap"              ] = true; // cannot be used together with inlineSourceMap
      cmpopts[ "inlineSourceMap"        ] = true;
      cmpopts[ "inlineSources"          ] = true;
      cmpopts[ "emitDecoratorMetadata"  ] = true;
      cmpopts[ "experimentalDecorators" ] = true;
      cmpopts[ "importHelpers"          ] = true;
      cmpopts[ "typeRoots"              ] = [ "node_modules/@types", "lib/@types" ];
      cmpopts[ "lib"                    ] = [ "dom", "es2018" ];

  const es5cmpopts    = Object.assign({}, cmpopts );
        // change compiler options for esm5
        es5cmpopts[ "outDir" ] = `../dist/${ pkgname }/esm5`;
        es5cmpopts[ "target" ] = "es5";
        es5cmpopts[ "module" ] = "es2015";

  const es2015cmpopts = Object.assign({}, cmpopts );
        // change compiler options for esm2015
        es2015cmpopts[ "outDir" ] = `../dist/${ pkgname }/esm2015`;
        es2015cmpopts[ "target" ] = "es2015";
        es2015cmpopts[ "module" ] = "es2015";

  grunt.initConfig({

    clean: {
      build:        [ `${BUILD}/**/*` ],
      dist:         [ `${DIST}/**/*`  ]
    }, // end of clean

    cleanempty: {
      // remove empty folders in build and dist directories
      always: {
        src:        [ `${BUILD}/**/*`, `${DIST}/**/*` ]
      },
    }, // end of cleanempty

    copy: {
      prerequisites_lib: {
        files: [{
          expand:   true,
          src:      [
                      `${DOC}/**/*`,    // copy docs to build directory
                      `./*`,            // copy licence, readme etc.
                      `!./*.bak`,       // do not copy projectroot/*.bak (backups)
                      `!./*.bak.*`,     // do not copy projectroot/*.bak.* (backups)
                      `!./*.bat`,       // do not copy projectroot/*.bat (windows batchfiles)
                      `!./*.js`,        // do not copy projectroot/*.js (gruntfile etc.)
                      `!./*.json`,      // do not copy projectroot/*.json (package.json etc.)
                      `!./*.lnk`,       // do not copy projectroot/*.lnk (windows desktop links)
                      `!./*.log`,       // do not copy projectroot/*.log  (logfiles)
                      `!./*.log.*`,     // do not copy projectroot/*.log.* (versioned or packed logfiles)
                      `!./*.zip`,       // do not copy projectroot/*.zip
                      `!./*.7z`,        // do not copy projectroot/*.7z
                      `!./*.tgz`,       // do not copy projectroot/*.tgz
                      `!./config/**/*`, // do not copy configuration tree (if there is one)
                      `!./node-*/**/*`, // do not copy projectroot/node binaries (junction on windows)
                      `!./node_modules` // do not copy projectroot/node_modules
                    ],
          dest:     BUILD
        },{
          expand:   true,
          cwd:      SRC,                // copy sources to build directory
          src:      [ "**/*" ],
          dest:     BUILD
        }]
      } // end of copy:prerequisites_lib
    }, // end of copy

    rollup: {
      esm5: { // build an umd package
        src   : "build/public-api.ts",
        dest  : `dist/${ pkgname }/esm5/${ pkglobl }.js`,
        options: {
          plugins   : [ tsc({
                          compilerOptions : es5cmpopts
                        })],
          name      : `${ pkglobl }`,
          format    : "esm",
          sourcemap : "inline"
        }
      },
      fesm5: { // build an umd package
        src   : "build/public-api.ts",
        dest  : `dist/${ pkgname }/fesm/${ pkglobl }.js`,
        options: {
          plugins   : [ tsc({
                          compilerOptions : es5cmpopts
                        }), terser()],
          name      : `${ pkglobl }`,
          format    : "esm",
          sourcemap : true
        }
      },
      esm2015: { // build an umd package
        src   : "build/public-api.ts",
        dest  : `dist/${ pkgname }/esm2015/${ pkglobl }.js`,
        options: {
          plugins   : [ tsc({
                          compilerOptions : es2015cmpopts
                        })],
          name      : `${ pkglobl }`,
          format    : "esm",
          sourcemap : "inline"
        }
      },
      fesm2015: { // build an umd package
        src   : "build/public-api.ts",
        dest  : `dist/${ pkgname }/fesm2015/${ pkglobl }.js`,
        options: {
          plugins   : [ tsc({
                          compilerOptions : es2015cmpopts
                        }), terser()],
          name      : `${ pkglobl }`,
          format    : "esm",
          sourcemap : true
        }
      },
      umd: { // build an umd package
        src   : "build/public-api.ts",
        dest  : `dist/${ pkgname }/bundles/${ pkglobl }.umd.js`,
        options: {
          plugins   : [ tsc({
                          compilerOptions : es5cmpopts
                        })],
          name      : `${ pkglobl }`,
          format    : "umd",
          sourcemap : true
        }
      },
      umdmin: { // build a minified umd package
        src   : "build/public-api.ts",
        dest  : `dist/${ pkgname }/bundles/${ pkglobl }.umd.min.js`,
        options: {
          plugins   : [ tsc({
                          compilerOptions : es5cmpopts
                        }), terser()],
          name      : `${ pkglobl }`,
          format    : "umd",
          sourcemap : true
        }
      }
    }, // end of rollup

    ts: {
      options: {
        rootDir   : "build"
      },
      esm5: {
        tsconfig  : "build/tsconfig.esm5.json"
      },
      esm2015: {
        tsconfig  : "build/tsconfig.esm2015.json"
      }
    } // end of grunt-ts (typescript compiler)
  }); // end of grunt.initConfig

  grunt.loadNpmTasks( "grunt-cleanempty"      );
  grunt.loadNpmTasks( "grunt-contrib-clean"   );
  grunt.loadNpmTasks( "grunt-contrib-copy"    );
  // grunt.loadNpmTasks( "grunt-move"            );
  grunt.loadNpmTasks( "grunt-newer"           );
  grunt.loadNpmTasks( "grunt-rollup"          );
  // grunt.loadNpmTasks( "grunt-shell"           );
  grunt.loadNpmTasks( "grunt-ts"              );

  grunt.registerTask( "package", function () {
    // package.json
    let pkjson = grunt.file.readJSON( "package.json" );

    delete( pkjson.dependencies    );
    delete( pkjson.devDependencies );

    pkjson[ "main"         ] = `bundles/${ pkglobl }.umd.js`;
    pkjson[ "module"       ] = `fesm5/${ pkglobl }.js`;
    pkjson[ "es2015"       ] = `fesm2015/${ pkglobl }.js`;
    pkjson[ "esm5"         ] = `esm5/${ pkglobl }.js`;
    pkjson[ "esm2015"      ] = `esm2015/${ pkglobl }.js`;
    pkjson[ "fesm5"        ] = `fesm5/${ pkglobl }.js`;
    pkjson[ "fesm2015"     ] = `fesm2015/${ pkglobl }.js`;
    pkjson[ "typings"      ] = `${ pkglobl }.d.ts`;
    pkjson[ "metadata"     ] = `${ pkglobl }.metadata.json`;
    pkjson[ "sideEffects"  ] = true;
    pkjson[ "dependencies" ] = { "tslib": "^1.9.0" };

    grunt.file.write( `./${ BUILD }/package.json`, JSON.stringify( pkjson, null, 2 ));
    grunt.file.write( `./${ DIST }/${ pkgname }/package.json`, JSON.stringify( pkjson, null, 2 ));
  });

  grunt.registerTask( "tsconfig", function () {

    let tsconfig = { };
        tsconfig[ "compilerOptions" ] = es5cmpopts;
        tsconfig[ "include"         ] = [ "../build/**/*.ts"   ];
        tsconfig[ "exclude"         ] = [ "../build/test/**/*" ];

    grunt.file.write( `./${ BUILD }/tsconfig.esm5.json`, JSON.stringify( tsconfig, null, 2 ));

        tsconfig[ "compilerOptions" ] = es2015cmpopts;

    grunt.file.write( `./${ BUILD }/tsconfig.esm2015.json`, JSON.stringify( tsconfig, null, 2 ));

  });

  grunt.registerTask( "clean-default",   [ "clean:dist", "clean:build", "cleanempty:always" ]);

  grunt.registerTask( "prepare-default", [ "newer:copy:prerequisites_lib", "cleanempty:always" ]);

  grunt.registerTask( "rollup-default",  [ "rollup:umd", "rollup:umdmin", "rollup:esm5", "rollup:fesm5", "rollup:esm2015", "rollup:fesm2015" ]);

  grunt.registerTask( "ts-default",      [ "ts" /* ts implicit calls: "ts:esm5" & "ts:esm2015" */ ]);

  grunt.registerTask( "default",         [ "clean-default", "prepare-default", "package", "tsconfig", "ts-default", "rollup-default" ]);
};
