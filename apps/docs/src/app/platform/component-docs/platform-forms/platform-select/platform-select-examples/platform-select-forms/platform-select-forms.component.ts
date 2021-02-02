import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FormControl, FormGroup, Validators} from '@angular/forms';

import { SelectItem } from '@fundamental-ngx/platform';

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
    selector: 'fdp-select-forms',
    templateUrl: './platform-select-forms.component.html',
    styleUrls: ['platform-select-forms.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlatformSelectFormsComponent {

    selectedValue: string;

    userList = [
        new Fruit('A', 'Apple', 10),
        new Fruit('B', 'orange', 70),
        new Fruit('C', 'Plums', 10),
        new Fruit('D', 'pineapple', 11),
        new Fruit('E', 'watermelon', 10)
    ];
    option = this.userList.map<SelectItem>((item) => {
        return {
            label: item.name + item.id,
            value: item,
            triggerValue: '( ' + item.id + ' )',
            disabled: item.id === 'B' ? true : false,
            icon: ''
        };
    });

      customForm = new FormGroup({
        selectControl: new FormControl(this.selectedValue, Validators.required),
    });

}
