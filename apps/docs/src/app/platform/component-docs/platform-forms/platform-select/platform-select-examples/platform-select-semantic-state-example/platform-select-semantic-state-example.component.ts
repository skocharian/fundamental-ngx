import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DATA_PROVIDERS, FdpSelectionChangeEvent } from '@fundamental-ngx/platform';

export class Fruit {
    id: string;
    name: string;
    age: number;

    constructor(id: string, name: string, age: number) {
        this.id = id;
        this.name = name;
        this.age = age;
    }
}

@Component({
    selector: 'fdp-select-semantic-state-example',
    templateUrl: './platform-select-semantic-state-example.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [{ provide: DATA_PROVIDERS, useValue: new Map() }]
})
export class PlatformSelectSemanticStateExampleComponent {

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
    
    selectedState: string = null;

    onSelectState(item: FdpSelectionChangeEvent): void {
        this.selectedState = item.payload;
    }
}
