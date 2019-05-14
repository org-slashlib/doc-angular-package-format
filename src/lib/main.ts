/**
 *  © 2019, slashlib.org.
 */

// this one should not be visible in the package (sorted out by treeshaking)
function somefunct() { console.log( "main.ts: function somefunct" ); }

export function dummy() { console.log( "main.ts: function dummy" ); };
