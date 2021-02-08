import { ChangeDetectionStrategy, Component } from '@angular/core';
import { of } from 'rxjs';

import { ArraySelectDataSource, FdpSelectionChangeEvent, DATA_PROVIDERS } from '@fundamental-ngx/platform';

@Component({
    selector: 'fdp-select-datasource-example',
    templateUrl: './platform-select-datasource-example.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [{ provide: DATA_PROVIDERS, useValue: new Map() }]
})
export class PlatformSelectDatasourceExampleComponent {
    dataSourceStrings = [
        'Apple',
        'Banana',
        'Pineapple',
        'Strawberry',
        'Broccoli',
        'Carrot',
        'Jalapeño',
        'Spinach'
    ];

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

    dataSourceOf = of(this.dataSource);
    ds = new ArraySelectDataSource(this.dataSource);

    selectedItem1 = null;
    selectedItem2 = null;
    selectedItem3 = null;
    selectedItem4 = null;

    onSelect1(item: FdpSelectionChangeEvent): void {
        this.selectedItem1 = item.payload;
    }

    onSelect2(item: FdpSelectionChangeEvent): void {
        this.selectedItem2 = item.payload;
    }

    onSelect3(item: FdpSelectionChangeEvent): void {
        this.selectedItem3 = item.payload;
    }

    onSelect4(item: FdpSelectionChangeEvent): void {
        this.selectedItem4 = item.payload;
    }
}
