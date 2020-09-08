import { NgModule } from '@angular/core';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IconModule, FormModule, ListModule, DragAndDropModule } from '@fundamental-ngx/core';
import { PlatformLinkModule } from '../../link/link.module';
import { DisplayListItemComponent } from './display-list-item.component';

@NgModule({
    declarations: [DisplayListItemComponent],
    imports: [
        DragDropModule,
        CommonModule,
        IconModule,
        FormsModule,
        FormModule,
        ListModule,
        PlatformLinkModule,
        DragAndDropModule,
        RouterModule

    ],
    exports: [DisplayListItemComponent]
})
export class DisplayListItemModule { }
