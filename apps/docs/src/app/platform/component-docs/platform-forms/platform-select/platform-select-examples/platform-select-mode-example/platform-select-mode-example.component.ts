import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FdpSelectionChangeEvent } from '@fundamental-ngx/platform';

@Component({
    selector: 'fdp-select-mode-example',
    templateUrl: './platform-select-mode-example.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlatformSelectModeExampleComponent {

dataSource = [
        'Apple',
        'Banana',
        'Pineapple',
        'Strawberry',
        'Broccoli',
        'Carrot',
        'Jalapeño',
        'Spinach'
    ];

    dataSourceAutoResize = [
        'The maximum width is the part of the screen furthest to the right.',
        'Apple',
        'Banana',
        'Pineapple',
        'Strawberry',
        'Broccoli',
        'Carrot',
        'Jalapeño',
        'Spinach'
    ];

    selectedValue1 = null;
    selectedValue2 = null;
    selectedValue3 = this.dataSource[4];
    selectedValue4 = this.dataSource[3];

    onSelect1(item: FdpSelectionChangeEvent): void {
       this.selectedValue1 = item.payload.label;
    }

    onSelect2(item: FdpSelectionChangeEvent): void {
        this.selectedValue2 = item.payload.label;
    }

    onSelect3(item: FdpSelectionChangeEvent): void {
        this.selectedValue3 = item.payload.label;
    }

    onSelect4(item: FdpSelectionChangeEvent): void {
        this.selectedValue4 = item.payload.label;
    }
}


