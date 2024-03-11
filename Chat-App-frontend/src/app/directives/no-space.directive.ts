import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[appNoSpace]',
  standalone: true
})
export class NoSpaceDirective {
  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === ' ') {
      event.preventDefault();
    }
  }
}
