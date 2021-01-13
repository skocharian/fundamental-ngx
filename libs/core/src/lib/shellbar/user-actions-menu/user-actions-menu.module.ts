import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IconModule } from '../../icon/public_api';
import { PopoverModule } from '../../popover/public_api';
import { ListModule } from '../../list/public_api';
import { TitleModule } from '../../title/public_api';
import { AvatarModule } from '../../avatar/public_api';
import { DialogModule } from '../../dialog/public_api';
import { ButtonModule } from '../../button/public_api';

import { UserActionsMenuComponent } from './user-actions-menu/user-actions-menu.component';
import { UserActionsMenuItemComponent } from './user-actions-menu-item/user-actions-menu-item.component';

@NgModule({
  declarations: [UserActionsMenuComponent, UserActionsMenuItemComponent],
  exports: [UserActionsMenuComponent, UserActionsMenuItemComponent],
  imports: [
    CommonModule,
    PopoverModule,
    IconModule,
    AvatarModule,
    ListModule,
    TitleModule,
    DialogModule,
    ButtonModule
  ]
})
export class UserActionsMenuModule { }
