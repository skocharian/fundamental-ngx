import { ChangeDetectionStrategy, Component } from '@angular/core';

import { FdpSelectionChangeEvent, DATA_PROVIDERS } from '@fundamental-ngx/platform';

@Component({
    selector: 'fdp-select-group-example',
    templateUrl: './platform-select-group-example.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [{ provide: DATA_PROVIDERS, useValue: new Map() }]
})
export class PlatformSelectGroupExampleComponent {
    dataSource = [
        { name: 'Apple', type: 'Fruits' },
        { name: 'Banana', type: 'Fruits' },
        { name: 'Pineapple', type: 'Fruits' },
        { name: 'Strawberry', type: 'Fruits' },
        { name: 'Broccoli', type: 'Vegetables' },
        { name: 'Carrot', type: 'Vegetables' },
        { name: 'Jalapeño', type: 'Vegetables' },
        { name: 'Spinach', type: 'Vegetables' }
    ];

    selectedItem = null;
    selectedItem1 = null;

    onSelect(item: FdpSelectionChangeEvent): void {
        this.selectedItem = item.payload;
    }

    onSelect1(item: FdpSelectionChangeEvent): void {
        this.selectedItem1 = item.payload;
    }
}
