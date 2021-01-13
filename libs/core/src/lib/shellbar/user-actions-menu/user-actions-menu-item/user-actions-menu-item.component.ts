import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  Input,
  Output,
  ViewEncapsulation,
  EventEmitter,
  Host,
  OnDestroy
} from '@angular/core';
import { take } from 'rxjs/operators';

import { DialogContentType, DialogRef, DialogService } from '../../../dialog/public_api';
import { UserActionsMenuComponent } from '../user-actions-menu/user-actions-menu.component';

@Component({
  selector: 'fd-user-actions-menu-item',
  templateUrl: './user-actions-menu-item.component.html',
  styleUrls: ['./user-actions-menu-item.component.scss'],
  host: {
    '[class.fd-user-actions-menu-item]': 'true',
    '[attr.tabindex]': 'tabIndex'
  },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserActionsMenuItemComponent implements OnDestroy {
  @Input()
  title: string;

  @Input()
  glyph: string;

  @Input()
  glyphSrc: string;

  @Input()
  routerLink: string | any[];

  @Input()
  dialogContent: DialogContentType;

  @Output() onOpenDialog = new EventEmitter<DialogRef>();

  /** @hidden Active dialog */
  private _activeDialog: DialogRef;

  @HostListener('click')
  handleClick(): void {
    this.parent.menu?.close();
    if (this.routerLink) {
      return;
    }
    if (this.dialogContent) {
      this.callDialogTemplateRef();
      return;
    }
  }

  constructor(
    private readonly _dialogService: DialogService,
    @Host() private parent: UserActionsMenuComponent
  ) { }

  ngOnDestroy(): void {
    this._dismissDialog();
  }

  /** @hidden */
  private callDialogTemplateRef(): void {
    if (this._activeDialog) {
      this._dismissDialog();
    }
    this.onOpenDialog.emit(this._activeDialog);
    this._activeDialog = this._dialogService.open(this.dialogContent, { responsivePadding: true });
    this._activeDialog.afterClosed.pipe(
      take(1)
    ).subscribe(() => {
      this._activeDialog = null;
    });
  }
  
  /** @hidden */
  private _dismissDialog(): void {
    if (this._activeDialog) {
      this._activeDialog.dismiss();
    }
  }
}
