import { Component } from '@angular/core';
import { ExampleFile } from '../../../../documentation/core-helpers/code-example/example-file';

import * as selectModeHtml from '!raw-loader!./platform-select-examples/platform-select-mode-example/platform-select-mode-example.component.html';
import * as selectModeTs from '!raw-loader!./platform-select-examples/platform-select-mode-example/platform-select-mode-example.component.ts';

import * as selectMobileHtml from '!raw-loader!./platform-select-examples/platform-select-mobile-example/platform-select-mobile-example.component.html';
import * as selectMobileTs from '!raw-loader!./platform-select-examples/platform-select-mobile-example/platform-select-mobile-example.component.ts';

import * as customTriggerHtml from '!raw-loader!./platform-select-examples/platform-select-custom-trigger/platform-select-custom-trigger.component.html';
import * as customTriggerTs from '!raw-loader!./platform-select-examples/platform-select-custom-trigger/platform-select-custom-trigger.component.ts';
import * as customTriggerScss from '!raw-loader!./platform-select-examples/platform-select-custom-trigger/platform-select-custom-trigger.component.scss';

import * as selectFormHtml from '!raw-loader!./platform-select-examples/platform-select-forms/platform-select-forms.component.html';
import * as selectFormTs from '!raw-loader!./platform-select-examples/platform-select-forms/platform-select-forms.component.ts';

import * as selectMaxHeightHtml from '!raw-loader!./platform-select-examples/platform-select-height/platform-select-max-height-example.component.html';
import * as selectMaxHeightTs from '!raw-loader!./platform-select-examples/platform-select-height/platform-select-max-height-example.component.ts';

import * as selectSemanticStateHtml from '!raw-loader!./platform-select-examples/platform-select-semantic-state-example/platform-select-semantic-state-example.component.html';
import * as selectSemanticStateTs from '!raw-loader!./platform-select-examples/platform-select-semantic-state-example/platform-select-semantic-state-example.component.ts';


import * as selectColumnsHtml from '!raw-loader!./platform-select-examples/platform-select-columns/platform-select-columns-example.component.html';
import * as selectColumnsTs from '!raw-loader!./platform-select-examples/platform-select-columns/platform-select-columns-example.component';

import * as selectGroupHtml from '!raw-loader!./platform-select-examples/platform-select-group/platform-select-group-example.component.html';
import * as selectGroupTs from '!raw-loader!./platform-select-examples/platform-select-group/platform-select-group-example.component';

import * as selectDatasourceHtml from '!raw-loader!./platform-select-examples/platform-select-datasource/platform-select-datasource-example.component.html';
import * as selectDatasourceTs from '!raw-loader!./platform-select-examples/platform-select-datasource/platform-select-datasource-example.component';


@Component({
    selector: 'fdp-select-docs',
    templateUrl: './platform-select-docs.component.html',
    styles: [`ul > li:not(:last-child) { margin-bottom: 0.5rem }`]
})
export class PlatformSelectDocsComponent {
    selectMode: ExampleFile[] = [
        {
            language: 'html',
            code: selectModeHtml,
            fileName: 'platform-select-mode-example',
            typescriptFileCode: selectModeTs,
            component: 'PlatformSelectModeExampleComponent'
        }
    ];

    selectColumns: ExampleFile[] = [{
        language: 'html',
        fileName: 'platform-select-columns-example',
        code: selectColumnsHtml
    }, {
        language: 'typescript',
        fileName: 'platform-select-columns-example',
        code: selectColumnsTs,
        component: 'PlatformSelectColumnsExampleComponent'
    }];

    selectMobile: ExampleFile[] = [
        {
            language: 'html',
            code: selectMobileHtml,
            fileName: 'platform-select-mobile-example',
        },
        {
            language: 'typescript',
            component: 'PlatformSelectMobileExampleComponent',
            code: selectMobileTs,
            fileName: 'platform-select-mobile-example',
        }
    ];

    selectGroupExample: ExampleFile[] = [{
        language: 'html',
        fileName: 'platform-select-group-example',
        code: selectGroupHtml
    }, {
        language: 'typescript',
        fileName: 'platform-select-group-example',
        code: selectGroupTs,
        component: 'PlatformSelectGroupExampleComponent'
    }];

    customSelectTemplate: ExampleFile[] = [
        {
            language: 'html',
            code: customTriggerHtml,
            fileName: 'platform-select-custom-trigger',
            typescriptFileCode: customTriggerTs,
            component: 'PlatformSelectCustomTriggerComponent',
            scssFileCode: customTriggerScss
        }
    ];

    selectDatasource: ExampleFile[] = [{
        language: 'html',
        fileName: 'platform-select-datasource-example',
        code: selectDatasourceHtml
    }, {
        language: 'typescript',
        fileName: 'platform-select-datasource-example',
        code: selectDatasourceTs,
        component: 'PlatformSelectDatasourceExampleComponent'
    }];

    selectForm: ExampleFile[] = [
        {
            language: 'html',
            code: selectFormHtml,
            fileName: 'platform-select-forms'

        },
        {
            language: 'typescript',
            component: 'PlatformSelectFormsComponent',
            code: selectFormTs,
            fileName: 'platform-select-forms'
        }
    ];

    selectMaxHeight: ExampleFile[] = [
        {
            language: 'html',
            code: selectMaxHeightHtml,
            fileName: 'platform-select-max-height-example',
            typescriptFileCode: selectMaxHeightTs,
            component: 'PlatformSelectMaxHeightExampleComponent'
        }
    ];

    selectSemantic: ExampleFile[] = [
        {
            language: 'html',
            code: selectSemanticStateHtml,
            fileName: 'platform-select-types-example',
            typescriptFileCode: selectSemanticStateTs,
            component: 'PlatformSelectTypesExampleComponent'
        }
    ];
}
