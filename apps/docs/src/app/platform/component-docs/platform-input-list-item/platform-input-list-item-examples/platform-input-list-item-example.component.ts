import { Component } from '@angular/core';

@Component({
    selector: 'fdp-input-list-item-example',
    templateUrl: './platform-input-list-item-example.component.html'
})
export class PlatformInputListItemExampleComponent { }

@Component({
    selector: 'fdp-borderless-input-list-item-example',
    templateUrl: './platform-borderless-input-list-item-example.component.html'
})
export class PlatformInputListBorderLessExampleComponent { }



@Component({
    selector: 'fdp-input-list-item-with-footer-example',
    templateUrl: './platform-input-list-item-with-footer-example.component.html'
})
export class PlatformInputListItemWithFooterExampleComponent {

    items: any[] = [
        {
            'title': 'Item1',
            'secondary': 'Second text'
        },
        {
            'title': 'Item2',
            'secondary': 'Second text'
        },
        {
            'title': 'Item3',
            'secondary': 'Second text'
        }];
}
