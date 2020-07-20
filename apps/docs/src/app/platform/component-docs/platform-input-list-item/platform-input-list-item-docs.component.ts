import { Component, OnInit } from '@angular/core';
import * as iliSrc from '!raw-loader!./platform-input-list-item-examples/platform-input-list-item-example.component.html';
import * as borderLessILISrc from '!raw-loader!./platform-input-list-item-examples/platform-borderless-input-list-item-example.component.html';
import * as groupHeaderILITs from '!raw-loader!./platform-input-list-item-examples/platform-input-list-item-with-group-header-example.component.ts';
import * as iliWithFooter from '!raw-loader!./platform-input-list-item-examples/platform-input-list-item-with-footer-example.component.html';
import * as iliWithGroupHeader from '!raw-loader!./platform-input-list-item-examples/platform-input-list-item-with-group-header-example.component.html';
import { ExampleFile } from '../../../documentation/core-helpers/code-example/example-file';

@Component({
    selector: 'app-input-list-item',
    templateUrl: './platform-input-list-item-docs.component.html'
})
export class PlatformInputListItemDocsComponent implements OnInit {
    simpleILI: ExampleFile[] = [
        {
            language: 'html',
            code: iliSrc,
            fileName: 'platform-input-list-item-example',
        }
    ];

    borderLessILI: ExampleFile[] = [
        {
            language: 'html',
            code: borderLessILISrc,
            fileName: 'platform-borderless-input-list-item-example',
        }
    ];

    iliWithFooter: ExampleFile[] = [
        {
            language: 'html',
            code: iliWithFooter,
            fileName: 'platform-input-list-item-with-footer-example',
        }
    ];

    iliWithGroupHeader: ExampleFile[] = [
        {
            language: 'html',
            code: iliWithGroupHeader,
            fileName: 'platform-input-list-item-with-group-header-example',
        },
        {
            language: 'typescript',
            component: 'PlatformInputListWithGroupHeaderExampleComponent',
            code: groupHeaderILITs,
            fileName: 'platform-input-list-item-with-group-header-example'
        }
    ];

    ngOnInit() { }
    constructor() { }

}
