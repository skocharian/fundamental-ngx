import { ChangeDetectionStrategy, Component, ContentChildren, EventEmitter, Input, Output, QueryList, ViewChild, ViewEncapsulation } from '@angular/core';

import { PopoverComponent, Placement } from '../../../../lib/popover/public_api';
import { BasePopoverClass } from '../../../popover/base/base-popover.class';
import { ShellbarUser } from '../../model/shellbar-user';
import { UserActionsMenuItemComponent } from '../user-actions-menu-item/user-actions-menu-item.component';

@Component({
  selector: 'fd-user-actions-menu',
  templateUrl: './user-actions-menu.component.html',
  styleUrls: ['./user-actions-menu.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserActionsMenuComponent extends BasePopoverClass {
  /** The user data. */
  @Input()
  user: ShellbarUser;

  /** Show fullName from user data, if it exists */
  @Input()
  showName = true;

  /** Maximum width of menu in px */
  @Input()
  maxWidth = 200;

  /** The placement of the popover. It can be one of: top, top-start, top-end, bottom,
   *  bottom-start, bottom-end, right, right-start, right-end, left, left-start, left-end. */
  @Input()
  placement: Placement = 'bottom';

  /** Display menu in compact mode */
  @Input()
  compact = false;

  /** @hidden */
  @ViewChild(PopoverComponent) menu: PopoverComponent;

  /** @hidden */
  @ContentChildren(UserActionsMenuItemComponent) items: QueryList<UserActionsMenuItemComponent>;

  get menuClass(): string {
    return 'fd-user-actions-menu';
  }

  get canOpen(): boolean {
    return !this.disabled && (this.showName && Boolean(this.user?.fullName) || this.items.length > 0);
  }

  get bodyClass(): string[] {
    if (this.compact) {
      return [this.menuClass + '__body', this.menuClass + '__compact'];
    }
    return [this.menuClass + '__body'];
  }

}
