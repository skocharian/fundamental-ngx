import { Component, ChangeDetectorRef, ElementRef, ChangeDetectionStrategy, forwardRef, AfterViewInit } from '@angular/core';
import { BaseListItem } from '../base-list-item';
import { ENTER, SPACE } from '@angular/cdk/keycodes';
import { FocusMonitor } from '@angular/cdk/a11y';


@Component({
    selector: 'fdp-action-list-item',
    templateUrl: './action-list-item.component.html',
    styleUrls: ['./action-list-item.component.scss'],
    providers: [
        { provide: BaseListItem, useExisting: forwardRef(() => ActionListItemComponent) }
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActionListItemComponent extends BaseListItem {


    // /** @hidden */
    // /**on keydown append active styles on actionable item */
    onKeyDown(event: any): void {
        if (event.keyCode === ENTER || event.keyCode === SPACE) {
            this.itemEl.nativeElement.childNodes[0].classList.add('is-active');
        }
    }

    // /** @hidden */
    // /**on keyup remove active styles from actionable item*/
    onKeyUp(event: any): void {
        if (event.keyCode === ENTER || event.keyCode === SPACE) {
            this.itemEl.nativeElement.childNodes[0].classList.remove('is-active');
        }
    }

    /** @hidden */
    /**Created focus on list item on mouseclick,
     * Up,down arrow press */
    public focus(): void {
        this.itemEl.nativeElement.focus();
    }

    /** @hidden */
    constructor(_changeDetectorRef: ChangeDetectorRef, public itemEl: ElementRef, private _focusMonitor: FocusMonitor) {
        super(_changeDetectorRef, itemEl);
    }

}
