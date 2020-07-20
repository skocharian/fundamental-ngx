import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ApiComponent } from '../../../documentation/core-helpers/api/api.component';
import { SharedDocumentationModule } from '../../../documentation/shared-documentation.module';
import { API_FILES } from '../../api-files';
import { PlatformInputListItemHeaderComponent } from './platform-input-list-item-header/platform-input-list-item-header.component';
import { PlatformInputListItemDocsComponent } from './platform-input-list-item-docs.component';
import {
    PlatformInputListItemExampleComponent,
    PlatformInputListItemWithFooterExampleComponent,
    PlatformInputListBorderLessExampleComponent
} from './platform-input-list-item-examples/platform-input-list-item-example.component';
import { PlatformListModule, InputListItemModule, PlatformButtonModule, PlatformCheckboxModule } from '@fundamental-ngx/platform';
import { ToolbarModule, SwitchModule, RadioModule } from '@fundamental-ngx/core';
import { PlatformInputListItemtWithGroupHeaderExampleComponent } from './platform-input-list-item-examples/platform-input-list-item-with-group-header-example.component';
const routes: Routes = [
    {
        path: '',
        component: PlatformInputListItemHeaderComponent,
        children: [
            { path: '', component: PlatformInputListItemDocsComponent },
            { path: 'api', component: ApiComponent, data: { content: API_FILES.list } }
        ]
    }
];

@NgModule({
    imports: [
        RouterModule.forChild(routes),
        SharedDocumentationModule,
        PlatformListModule,
        PlatformButtonModule,
        ToolbarModule,
        SwitchModule,
        PlatformCheckboxModule,
        InputListItemModule,
        RadioModule
    ],
    exports: [RouterModule],
    declarations: [
        PlatformInputListItemDocsComponent,
        PlatformInputListItemHeaderComponent,
        PlatformInputListItemExampleComponent,
        PlatformInputListItemWithFooterExampleComponent,
        PlatformInputListItemtWithGroupHeaderExampleComponent,
        PlatformInputListBorderLessExampleComponent
    ]
})
export class PlatformInputListItemDocsModule {
}
