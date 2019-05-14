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
  let scope   = pkgjson.name.slice( 0, pkgjson.name.indexOf("/"));
  let pkgname = pkgjson.name.slice( pkgjson.name.indexOf("/") + 1 );
  let pkglobl = scope ? `${ scope }.${ pkgname }` : pkgname;

  // console.log( "===> scope:", scope, ", pkgname:", pkgname, ", pkglobl:", pkglobl );

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
      fesm5: { // build an umd package
        src   : "build/public-api.ts",
        dest  : `dist/${ pkgname }/fesm/bundle.js`,
        options: {
          plugins   : [ tsc({
                          compilerOptions : {
                            "target"                  : "es5",
                            "module"                  : "es2015",
                            "moduleResolution"        : "node",
                            "declaration"             : true,
                            "sourceMap"               : true,
                            "inlineSources"           : true,
                            "emitDecoratorMetadata"   : true,
                            "experimentalDecorators"  : true,
                            "importHelpers"           : true
                          }
                        }), srcmaps(), terser()],
          name      : `${ pkglobl }`,
          format    : "esm",
          sourcemap : true
        }
      },
      fesm2015: { // build an umd package
        src   : "build/public-api.ts",
        dest  : `dist/${ pkgname }/fesm2015/bundle.js`,
        options: {
          plugins   : [ tsc({
                          compilerOptions : {
                            "target"                  : "es2015",
                            "module"                  : "es2015",
                            "moduleResolution"        : "node",
                            "declaration"             : true,
                            "sourceMap"               : true,
                            "inlineSources"           : true,
                            "emitDecoratorMetadata"   : true,
                            "experimentalDecorators"  : true,
                            "importHelpers"           : true
                          }
                        }), srcmaps(), terser()],
          name      : `${ pkglobl }`,
          format    : "esm",
          sourcemap : true
        }
      },
      umd: { // build an umd package
        src   : "build/public-api.ts",
        dest  : `dist/${ pkgname }/bundles/bundle.umd.js`,
        options: {
          plugins   : [ srcmaps()],
          name      : `${ pkglobl }`,
          format    : "umd",
          sourcemap : true
        }
      },
      umdmin: { // build a minified umd package
        src   : "build/public-api.ts",
        dest  : `dist/${ pkgname }/bundles/bundle.umd.min.js`,
        options: {
          plugins   : [ srcmaps(), terser()],
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
  });

  grunt.registerTask( "tsconfig", function () {
    let cmpopts  = {}
        cmpopts[ "outDir"                 ] = "xxx";
        cmpopts[ "target"                 ] = "xxx";
        cmpopts[ "module"                 ] = "xxx";
        cmpopts[ "moduleResolution"       ] = "node";
        cmpopts[ "declaration"            ] = true;
        cmpopts[ "sourceMap"              ] = true;
        cmpopts[ "inlineSources"          ] = true;
        cmpopts[ "emitDecoratorMetadata"  ] = true;
        cmpopts[ "experimentalDecorators" ] = true;
        cmpopts[ "importHelpers"          ] = true;
        cmpopts[ "typeRoots"              ] = [ "node_modules/@types", "lib/@types" ];
        cmpopts[ "lib"                    ] = [ "dom", "es2018" ];

    let tsconfig = { };
        tsconfig[ "compilerOptions"       ] = cmpopts;
        tsconfig[ "include"               ] = [ "../build/**/*.ts" ];
        tsconfig[ "exclude"               ] = [ "../build/test/**/*" ];

    // change compiler options for esm2015
    cmpopts[ "outDir" ] = `../dist/${ pkgname }/esm2015`;
    cmpopts[ "target" ] = "es2015";
    cmpopts[ "module" ] = "es2015";

    grunt.file.write( `./${ BUILD }/tsconfig.esm2015.json`, JSON.stringify( tsconfig, null, 2 ));

    // change compiler options for esm5
    cmpopts[ "outDir" ] = `../dist/${ pkgname }/esm5`;
    cmpopts[ "target" ] = "es5";
    cmpopts[ "module" ] = "es2015";

    grunt.file.write( `./${ BUILD }/tsconfig.esm5.json`, JSON.stringify( tsconfig, null, 2 ));
  });

  grunt.registerTask( "clean-default",   [ "clean:dist", "clean:build", "cleanempty:always" ]);

  grunt.registerTask( "prepare-default", [ "newer:copy:prerequisites_lib", "cleanempty:always" ]);

  grunt.registerTask( "rollup-default",  [ "rollup:umd", "rollup:umdmin", "rollup:fesm5", "rollup:fesm2015" ]);

  grunt.registerTask( "ts-default",      [ "ts" /* ts implicit calls: "ts:esm5" & "ts:esm2015" */ ]);

  grunt.registerTask( "default",         [ "clean-default", "prepare-default", "package", "tsconfig", "ts-default" /*, "rollup-default" */ ]);
};
