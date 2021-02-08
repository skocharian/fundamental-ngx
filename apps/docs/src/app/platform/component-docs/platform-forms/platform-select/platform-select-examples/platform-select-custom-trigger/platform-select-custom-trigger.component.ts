import { Component, ChangeDetectionStrategy, ViewEncapsulation} from '@angular/core';
import { FdpSelectionChangeEvent, DATA_PROVIDERS } from '@fundamental-ngx/platform';

@Component({
    selector: 'fdp-select-custom-trigger',
    templateUrl: './platform-select-custom-trigger.component.html',
    styleUrls: ['./platform-select-custom-trigger.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [{ provide: DATA_PROVIDERS, useValue: new Map() }]
})
export class PlatformSelectCustomTriggerComponent {

    selectedValue: string;
    selected: string;

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
        'Apple With less price',
        'Banana With bit more big line',
        'Lorem ipsum dolor sit, amet' + 
       ' consectetur adipisicing elit.' + 
        'et tempore cum. Corporis, nobis.' ,
        'Strawberry',
        'Broccoli',
        'Carrot',
        'Jalapeño',
        'Spinach'
    ];

    onSelect(item: FdpSelectionChangeEvent): void {
        this.selectedValue = item.payload;
    }
}
