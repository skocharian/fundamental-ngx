import { ChangeDetectionStrategy, Component } from '@angular/core';

import { MobileModeConfig } from '@fundamental-ngx/core';
import { FdpSelectionChangeEvent, DATA_PROVIDERS } from '@fundamental-ngx/platform';

@Component({
    selector: 'fdp-select-mobile-example',
    templateUrl: './platform-select-mobile-example.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [{ provide: DATA_PROVIDERS, useValue: new Map() }]
})
export class PlatformSelectMobileExampleComponent {

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

    mobileConfig: MobileModeConfig = {
        title: 'Title',
        hasCloseButton: true,
        dialogConfig: { 
            width: '360px',
            height: '640px' 
            } 
    };

    onSelect(item: FdpSelectionChangeEvent): void {
        this.selectedItem = item.payload.label;
    }
 }
