import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ApiComponent } from '../../../documentation/core-helpers/api/api.component';
import { SharedDocumentationModule } from '../../../documentation/shared-documentation.module';
import { API_FILES } from '../../api-files';
import { PlatformActionListItemHeaderComponent } from './platform-action-list-item-header/platform-action-list-item-header.component';
import { PlatformActionListItemDocsComponent } from './platform-action-list-item-docs.component';
import {
    PlatformActionListItemExampleComponent
} from './platform-action-list-item-examples/platform-action-list-item-example.component';
import { PlatformListModule, ActionListItemModule, PlatformButtonModule } from '@fundamental-ngx/platform';
import { ToolbarModule } from '@fundamental-ngx/core';
import { PlatformActionListItemBorderLessExampleComponent } from './platform-action-list-item-examples/platform-action-list-item-border-less-example.component';
const routes: Routes = [
    {
        path: '',
        component: PlatformActionListItemHeaderComponent,
        children: [
            { path: '', component: PlatformActionListItemDocsComponent },
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
        ActionListItemModule
    ],
    exports: [RouterModule],
    declarations: [
        PlatformActionListItemDocsComponent,
        PlatformActionListItemHeaderComponent,
        PlatformActionListItemExampleComponent,
        PlatformActionListItemBorderLessExampleComponent
    ]
})
export class PlatformActionListItemDocsModule {
}
