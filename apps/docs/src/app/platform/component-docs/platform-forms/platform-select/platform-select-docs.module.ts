import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

import {
    DialogModule,
    ListModule,
    SelectMobileModule,
    SelectModule
} from '@fundamental-ngx/core';
import {PlatformSelectModule, FdpFormGroupModule, PlatformButtonModule } from '@fundamental-ngx/platform';

import { ApiComponent } from '../../../../documentation/core-helpers/api/api.component';
import { SharedDocumentationPageModule } from '../../../../documentation/shared-documentation-page.module';
import { API_FILES } from '../../../api-files';
import { PlatformSelectHeaderComponent } from './platform-select-header/platform-select-header.component';
import { PlatformSelectDocsComponent } from './platform-select-docs.component';
import { PlatformSelectFormsComponent } from './platform-select-examples/platform-select-forms/platform-select-forms.component';
import { PlatformSelectCustomTriggerComponent } from './platform-select-examples/platform-select-custom-trigger/platform-select-custom-trigger.component';
import { PlatformSelectMaxHeightExampleComponent } from './platform-select-examples/platform-select-height/platform-select-max-height-example.component';
import { PlatformSelectSemanticStateExampleComponent } from './platform-select-examples/platform-select-semantic-state-example/platform-select-semantic-state-example.component';
import { PlatformSelectModeExampleComponent } from './platform-select-examples/platform-select-mode-example/platform-select-mode-example.component';
import { PlatformSelectMobileExampleComponent } from './platform-select-examples/platform-select-mobile-example/platform-select-mobile-example.component';
import { PlatformSelectColumnsExampleComponent } from './platform-select-examples/platform-select-columns/platform-select-columns-example.component';
import { PlatformSelectGroupExampleComponent } from './platform-select-examples/platform-select-group/platform-select-group-example.component';
import { PlatformSelectDatasourceExampleComponent } from './platform-select-examples/platform-select-datasource/platform-select-datasource-example.component';


const routes: Routes = [
    {
        path: '',
        component: PlatformSelectHeaderComponent,
        children: [
            { path: '', component: PlatformSelectDocsComponent },
            { path: 'api', component: ApiComponent, data: { content: API_FILES.select } }
        ]
    }
];

@NgModule({
    imports: [
        RouterModule.forChild(routes),
        SharedDocumentationPageModule,
        SelectModule,
        SelectMobileModule,
        DialogModule,
        ListModule,
        FdpFormGroupModule,
        PlatformSelectModule,
        ReactiveFormsModule,
        PlatformButtonModule
    ],
    exports: [RouterModule],
    declarations: [
        PlatformSelectDocsComponent,
        PlatformSelectFormsComponent,
        PlatformSelectHeaderComponent,
        PlatformSelectModeExampleComponent,
        PlatformSelectMobileExampleComponent,
        PlatformSelectCustomTriggerComponent,
        PlatformSelectMaxHeightExampleComponent,
        PlatformSelectSemanticStateExampleComponent,
        PlatformSelectColumnsExampleComponent,
        PlatformSelectGroupExampleComponent,
        PlatformSelectDatasourceExampleComponent
    ]
})
export class PlatformSelectDocsModules {}
