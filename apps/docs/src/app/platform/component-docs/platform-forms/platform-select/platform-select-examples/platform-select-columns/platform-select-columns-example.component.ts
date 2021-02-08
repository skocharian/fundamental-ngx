import { ChangeDetectionStrategy, Component } from '@angular/core';

import { FdpSelectionChangeEvent, DATA_PROVIDERS } from '@fundamental-ngx/platform';

@Component({
    selector: 'fdp-select-columns-example',
    templateUrl: './platform-select-columns-example.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [{ provide: DATA_PROVIDERS, useValue: new Map() }]
})
export class PlatformSelectColumnsExampleComponent {
    dataSource = [
        { name: 'Apple', type: 'Fruits' },
        { name: 'Banana', type: 'Fruits' },
        { name: 'Biiiiiiiiiiiiiiiiiiiiiiggggggggggggggggggggggggg Banananananananananananananananananananananananananananananananananananananana', type: 'Fruits' },
        { name: 'Pineapple', type: 'Fruits' },
        { name: 'Strawberry', type: 'Fruits' },
        { name: 'Broccoli', type: 'Vegetables' },
        { name: 'Carrot', type: 'Vegetables' },
        { name: 'Jalapeño', type: 'Vegetables' },
        { name: 'Spinach', type: 'Vegetables' }
    ];

    selectedItem = null;

    onSelect(item: FdpSelectionChangeEvent): void {
        this.selectedItem = item.payload;
    }
}
