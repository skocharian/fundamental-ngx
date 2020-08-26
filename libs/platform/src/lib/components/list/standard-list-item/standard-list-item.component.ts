import {
    Component, ChangeDetectionStrategy, ElementRef,
    ChangeDetectorRef, forwardRef, AfterViewInit
} from '@angular/core';
import { BaseListItem } from '../base-list-item';
import { ListConfig } from '../list.config';


@Component({
    selector: 'fdp-standard-list-item',
    templateUrl: './standard-list-item.component.html',
    styleUrls: ['./standard-list-item.component.scss'],
    providers: [
        { provide: BaseListItem, useExisting: forwardRef(() => StandardListItemComponent) }
    ],
    changeDetection: ChangeDetectionStrategy.OnPush

})
export class StandardListItemComponent extends BaseListItem implements AfterViewInit {

    /** @hidden */
    _contentDensity = this._listConfig.contentDensity;

    /**
     * @hidden
     * Used to define if contentDensity value is 'compact' or not.
     */
    isCompact = this._contentDensity === 'compact';

    /** @hidden */
    constructor(_changeDetectorRef: ChangeDetectorRef, public itemEl: ElementRef,
        protected _listConfig: ListConfig) {
        super(_changeDetectorRef, itemEl, _listConfig);
    }

    /** @hidden */
    /** message type styles to secondary text in Byline*/
    ngAfterViewInit(): void {
        this._setProperties();
    }

    /** @hidden */
    _setProperties(): void {
        if (this.statusType !== null && this.statusType !== undefined) {
            this._addClassToElement('fd-list__byline-right--' + this.statusType);
        }
    }
    /** @hidden */
    _addClassToElement(className: string): void {
        const secItems = this.listItem.nativeElement.querySelectorAll('.fd-list__byline-right');
        secItems.forEach((secItem: any) => {
            secItem.classList.add(...className.split(' '));
        });

    }
}
