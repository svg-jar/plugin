const ENV = {
  environment: import.meta.env.DEV ? 'development' : 'production',
  rootURL: '/',
  locationType: 'history',
  EmberENV: {},
  APP: {},
};

export default ENV;

// @ts-expect-error: Ignoreing private API
import { getGlobalConfig } from '@embroider/macros/src/addon/runtime';

export function enterTestMode() {
  ENV.locationType = 'none';
  ENV.APP.rootElement = '#ember-testing';
  ENV.APP.autoboot = false;

  const theMacrosGlobal = getGlobalConfig();
  theMacrosGlobal['@embroider/macros'] ||= {};
  theMacrosGlobal['@embroider/macros'].isTesting ||= true;
}
