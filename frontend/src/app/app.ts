import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/**
 * Root application component — only a thin router outlet wrapper.
 * All layout and navigation lives in ShellComponent (authenticated shell).
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet></router-outlet>`
})
export class App {}
