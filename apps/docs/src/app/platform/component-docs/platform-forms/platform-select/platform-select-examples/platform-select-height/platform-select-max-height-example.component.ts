import { Component, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';
import { FdpSelectionChangeEvent, DATA_PROVIDERS } from '@fundamental-ngx/platform';
@Component({
    selector: 'fdp-select-max-height-example',
    templateUrl: './platform-select-max-height-example.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [{ provide: DATA_PROVIDERS, useValue: new Map() }]
})
export class PlatformSelectMaxHeightExampleComponent {
    selectedValue: string;

    dataSource = [
        'Apple',
        'Banana',
        'Pineapple',
        'Strawberry',
        'Broccoli',
        'Carrot',
        'Jalapeño',
        'Spinach',
        'Banana',
        'Pineapple',
        'Strawberry',
        'Broccoli',
        'Carrot',
        'Jalapeño',
        'Spinach',
        'Banana',
        'Pineapple',
        'Strawberry',
        'Broccoli',
        'Carrot',
        'Jalapeño',
        'Spinach'
    ];

    onSelect(item: FdpSelectionChangeEvent): void {
        if (item) {
         this.selectedValue = item.payload.label;
        }
     }
 }
