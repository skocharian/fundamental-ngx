import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IconModule, FormModule, ListModule } from '@fundamental-ngx/core';
import { PlatformLinkModule } from '../../link/link.module';
import { InputListItemComponent } from './input-list-item.component';

@NgModule({
    declarations: [InputListItemComponent],
    imports: [
        CommonModule,
        IconModule,
        FormsModule,
        FormModule,
        ListModule,
        PlatformLinkModule

    ],
    exports: [InputListItemComponent]
})
export class InputListItemModule { }
