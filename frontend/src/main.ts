/**
 * Angular application bootstrap entry point.
 * Zone.js is loaded via angular.json polyfills array (not imported here).
 */
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
