import { ChangeDetectionStrategy, Component, ContentChildren, EventEmitter, Input, Output, QueryList, ViewChild, ViewEncapsulation } from '@angular/core';
import { Placement, PopperOptions } from 'popper.js';

import { PopoverComponent, PopoverFillMode } from '../../../../lib/popover/public_api';
import { ShellbarUser } from '../../model/shellbar-user';
import { UserActionsMenuItemComponent } from '../user-actions-menu-item/user-actions-menu-item.component';

@Component({
  selector: 'fd-user-actions-menu',
  templateUrl: './user-actions-menu.component.html',
  styleUrls: ['./user-actions-menu.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserActionsMenuComponent {
  /** The user data. */
  @Input()
  user: ShellbarUser;

  /** Show fullName from user data, if it exists */
  @Input()
  showName = true;

  /** Maximum width of menu in px */
  @Input()
  maxWidth = 200;

  /**
   * Preset options for the popover body width.
   * * `at-least` will apply a minimum width to the body equivalent to the width of the control.
   * * `equal` will apply a width to the body equivalent to the width of the control.
   * * Leave blank for no effect.
   */
  @Input()
  fillControlMode: PopoverFillMode = null;

  /** The placement of the popover. It can be one of: top, top-start, top-end, bottom,
   *  bottom-start, bottom-end, right, right-start, right-end, left, left-start, left-end. */
  @Input()
  placement: Placement = 'bottom-end';

  /** The trigger events that will open/close the popover.
   *  Accepts any [HTML DOM Events](https://www.w3schools.com/jsref/dom_obj_event.asp). */
  @Input()
  triggers: string[] = ['click'];

  /** Whether the popover should close when the escape key is pressed. */
  @Input()
  closeOnEscapeKey = true;

  /** Display menu in compact mode */
  @Input()
  compact = false;

  /** Whether the popover should close when a click is made outside its boundaries. */
  @Input()
  closeOnOutsideClick = true;

  /** Whether the popover is disabled. */
  @Input()
  disabled = false;

  /** The Popper.js options to attach to this popover.
   * See the [Popper.js Documentation](https://popper.js.org/popper-documentation.html) for details. */
  @Input()
  bodyOptions: PopperOptions = {
      placement: 'bottom',
      modifiers: {
          preventOverflow: {
              enabled: true,
              escapeWithReference: true,
              boundariesElement: 'scrollParent'
          }
      }
  };

  /** Event emitted when the state of the isOpen property changes. */
  @Output() menuToggleState = new EventEmitter<boolean>()

  /** @hidden */
  @ViewChild(PopoverComponent) menu: PopoverComponent;

  /** @hidden */
  @ContentChildren(UserActionsMenuItemComponent) items: QueryList<UserActionsMenuItemComponent>;

  /** menu open state */
  isOpenMenu = false;
  hasItems = false;

  get menuClass(): string {
    return 'fd-user-actions-menu';
  }

  get canOpen(): boolean {
    return !this.disabled && (this.showName && Boolean(this.user?.fullName) || this.items.length > 0);
  }

  get additionalBodyClass(): string[] {
    if (this.compact) {
      return [this.menuClass + '__body', this.menuClass + '__compact'];
    }
    return [this.menuClass + '__body'];
  }

}
