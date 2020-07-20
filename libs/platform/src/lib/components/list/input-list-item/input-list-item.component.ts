import { Component, ChangeDetectorRef, ElementRef, forwardRef, ChangeDetectionStrategy } from '@angular/core';
import { BaseListItem } from '../base-list-item';

@Component({
    selector: 'fdp-input-list-item',
    templateUrl: './input-list-item.component.html',
    styleUrls: ['./input-list-item.component.scss'],
    providers: [
        { provide: BaseListItem, useExisting: forwardRef(() => InputListItemComponent) }
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class InputListItemComponent extends BaseListItem {

    /** @hidden */
    constructor(_changeDetectorRef: ChangeDetectorRef, public itemEl: ElementRef) {
        super(_changeDetectorRef, itemEl);
    }

}
