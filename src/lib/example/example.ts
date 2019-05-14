/**
 *  © 2019, slashlib.org.
 */

export interface Configuration {
  [ key : string ]: string | number
};

export class Example {
  constructor( private config: Configuration ) { }
  public print(): void { JSON.stringify( this.config ); }
}
