import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { BarModule, BreadcrumbModule, DynamicPageModule, FlexibleColumnLayoutModule, ToolbarModule } from '@fundamental-ngx/core';

import { ApiComponent } from '../../../documentation/core-helpers/api/api.component';
import { SharedDocumentationPageModule } from '../../../documentation/shared-documentation-page.module';
import { API_FILES } from '../../api-files';
import { DynamicPageDocsComponent } from './dynamic-page-docs.component';
import { PlatformDynamicPageExampleComponent } from './dynamic-page-examples/platform-dynamic-page-example.component';
import { DynamicPageDocsHeaderComponent } from './dynamic-page-header/dynamic-page-docs-header.component';

const routes: Routes = [
    {
        path: '',
        component: DynamicPageDocsHeaderComponent,
        children: [
            { path: '', component: DynamicPageDocsComponent },
            { path: 'api', component: ApiComponent, data: { content: API_FILES.actionBar } }
        ]
    }
];

@NgModule({
    imports: [
        RouterModule.forChild(routes),
        SharedDocumentationPageModule,
        BreadcrumbModule,
        ToolbarModule,
        BarModule,
        FlexibleColumnLayoutModule,
        DynamicPageModule
    ],
    exports: [RouterModule],
    declarations: [
        DynamicPageDocsComponent,
        DynamicPageDocsHeaderComponent,
        PlatformDynamicPageExampleComponent,
    ]
})
export class DynamicPageDocsModule { }
