import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FormControl, FormGroup} from '@angular/forms';

import { FdpSelectionChangeEvent, DATA_PROVIDERS } from '@fundamental-ngx/platform';


@Component({
    selector: 'fdp-select-forms',
    templateUrl: './platform-select-forms.component.html',
    styleUrls: ['platform-select-forms.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [{ provide: DATA_PROVIDERS, useValue: new Map() }]
})
export class PlatformSelectFormsComponent {
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

    customForm = new FormGroup({
        field: new FormControl(this.dataSource[3])
    });

    selectedItem = this.dataSource[3];

    onSelect(item: FdpSelectionChangeEvent): void {
        this.selectedItem = item.payload;
    }
}
