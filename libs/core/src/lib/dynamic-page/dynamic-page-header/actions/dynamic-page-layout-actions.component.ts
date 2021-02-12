import {
    Component,
    ChangeDetectionStrategy,
    ViewEncapsulation,
    AfterContentInit,
    ElementRef,
    Renderer2,
    ChangeDetectorRef
} from '@angular/core';
import { DynamicPageBaseActions } from './dynamic-page-base-actions';
import { CLASS_NAME, DynamicPageResponsiveSize } from '../../constants';

const sizeClasses = [CLASS_NAME.dynamicPageLayoutActionsToolbarMedium];

@Component({
    selector: 'fd-dynamic-page-layout-actions',
    template: '<ng-content></ng-content>',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class DynamicPageLayoutActionsComponent extends DynamicPageBaseActions implements AfterContentInit {

    constructor(
        private _elementRef: ElementRef,
        private _renderer: Renderer2,
        private _changeDetRef: ChangeDetectorRef
    ) {
        super();
    }

    /** @hidden */
    ngAfterContentInit(): void {
        this.addClassToToolbar(CLASS_NAME.dynamicPageLayoutActions, this._elementRef);
    }

    /** @hidden */
    setSize(size: DynamicPageResponsiveSize): void {
        sizeClasses.forEach(_class => this._renderer.removeClass(this._elementRef.nativeElement, _class));
        if (size === 'medium') {
            this._renderer.addClass(this._elementRef.nativeElement, CLASS_NAME.dynamicPageLayoutActionsToolbarMedium)
        }
        this._changeDetRef.detectChanges();
    }
}
