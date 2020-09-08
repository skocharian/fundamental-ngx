import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { FormModule, ToolbarModule, ListModule, BusyIndicatorModule, InfiniteScrollModule, DragAndDropModule } from '@fundamental-ngx/core';
import { ListComponent, ListFooter, ListGroupHeader } from './list.component';

@NgModule({
    declarations: [ListComponent, ListFooter, ListGroupHeader],
    imports: [
        DragDropModule,
        CommonModule,
        FormsModule,
        FormModule,
        ToolbarModule,
        ListModule,
        DragAndDropModule,
        BusyIndicatorModule,
        InfiniteScrollModule

    ],
    exports: [ListComponent, ListFooter, ListGroupHeader]
})
export class PlatformListModule { }
