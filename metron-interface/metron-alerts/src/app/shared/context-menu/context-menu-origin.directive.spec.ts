import { ContextMenuOriginDirective } from './context-menu-origin.directive';
import { ElementRef } from '@angular/core';

describe('ContextMenuDirective', () => {
  it('should create an instance', () => {
    const menuOrigin = new ElementRef(document.createElement('a'));
    const directive = new ContextMenuOriginDirective(menuOrigin);
    expect(directive).toBeTruthy();
  });
});
