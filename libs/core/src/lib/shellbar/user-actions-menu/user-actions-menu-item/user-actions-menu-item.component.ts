import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  Input,
  Output,
  ViewEncapsulation,
  EventEmitter,
  Host,
  OnDestroy,
  Optional
} from '@angular/core';

import { DialogContentType, DialogRef, DialogService } from '../../../dialog/public_api';
import { UserActionsMenuComponent } from '../user-actions-menu/user-actions-menu.component';

@Component({
  selector: 'fd-user-actions-menu-item',
  templateUrl: './user-actions-menu-item.component.html',
  styleUrls: ['./user-actions-menu-item.component.scss'],
  host: {
    class: 'fd-user-actions-menu-item'
  },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserActionsMenuItemComponent implements OnDestroy {
  /** View title for action item. Required property */
  @Input()
  title: string;

  /** Sets icon for user action menu, glyph code from icons */
  @Input()
  glyph: string;

  /** Sets icon src if you want use image. You will have predefined place with dimensions same as glyph `border` */
  @Input()
  glyphSrc: string;

  /** Opens a dialog component with with provided content. */
  @Input()
  dialogContent: DialogContentType;

  @Output() onOpenDialog = new EventEmitter<DialogRef>();

  /** @hidden Active dialog */
  private _activeDialog: DialogRef;

  /** @hidden */
  @HostListener('click')
  handleClick(): void {
    this.parent.menu?.close();
    if (this.dialogContent) {
      this.callDialogTemplateRef();
      return;
    }
  }

  constructor(
    private readonly _dialogService: DialogService,
    @Optional() @Host() private parent: UserActionsMenuComponent
  ) { }

  ngOnDestroy(): void {
    this._dismissDialog();
  }

  /** @hidden */
  private callDialogTemplateRef(): void {
    if (this._activeDialog) {
      return;
    }
    this.onOpenDialog.emit(this._activeDialog);
    this._activeDialog = this._dialogService.open(this.dialogContent, { responsivePadding: true });
    this._activeDialog.afterClosed.subscribe(() => this._activeDialog = null);
  }
  
  /** @hidden */
  private _dismissDialog(): void {
    if (this._activeDialog) {
      this._activeDialog.dismiss();
    }
  }
}
