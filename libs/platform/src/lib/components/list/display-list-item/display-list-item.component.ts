import { Component, ChangeDetectorRef, ElementRef, forwardRef, ChangeDetectionStrategy } from '@angular/core';
import { BaseListItem } from '../base-list-item';

@Component({
    selector: 'fdp-display-list-item',
    templateUrl: './display-list-item.component.html',
    styleUrls: ['./display-list-item.component.scss'],
    providers: [
        { provide: BaseListItem, useExisting: forwardRef(() => DisplayListItemComponent) }
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DisplayListItemComponent extends BaseListItem {

    /** @hidden */
    constructor(_changeDetectorRef: ChangeDetectorRef, public itemEl: ElementRef) {
        super(_changeDetectorRef, itemEl);
    }

}
