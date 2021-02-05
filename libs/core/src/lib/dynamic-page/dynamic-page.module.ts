import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { DynamicPageContentComponent } from './dynamic-page-content/dynamic-page-content.component';
import { DynamicPageFooterComponent } from './dynamic-page-footer/dynamic-page-footer.component';
import { DynamicPageGlobalActionsComponent } from './dynamic-page-header/actions/global-actions/dynamic-page-global-actions.component';
import { DynamicPageLayoutActionsComponent } from './dynamic-page-header/actions/layout-actions/dynamic-page-layout-actions.component';
import { DynamicPageSubheaderComponent } from './dynamic-page-header/subheader/dynamic-page-subheader.component';
import { DynamicPageTitleComponent } from './dynamic-page-header/header/dynamic-page-title.component';
import { DynamicPageComponent } from './dynamic-page.component';
import { ButtonModule } from '../button/button.module';

@NgModule({
    declarations: [
        DynamicPageComponent,
        DynamicPageTitleComponent,
        DynamicPageGlobalActionsComponent,
        DynamicPageLayoutActionsComponent,
        DynamicPageSubheaderComponent,
        DynamicPageContentComponent,
        DynamicPageFooterComponent
    ],
    imports: [CommonModule, ButtonModule],
    exports: [
        DynamicPageComponent,
        DynamicPageTitleComponent,
        DynamicPageGlobalActionsComponent,
        DynamicPageLayoutActionsComponent,
        DynamicPageSubheaderComponent,
        DynamicPageContentComponent,
        DynamicPageFooterComponent
    ]
})
export class DynamicPageModule {}
