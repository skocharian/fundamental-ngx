import { FocusMonitor } from '@angular/cdk/a11y';

import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component, ContentChild,
    ElementRef,
    Input,
    NgZone,
    OnInit,
    Renderer2,
    ViewEncapsulation
} from '@angular/core';

import { DynamicPageBackgroundType, CLASS_NAME, DynamicPageResponsiveSize } from '../../constants';
import { DynamicPageService } from '../../dynamic-page.service';
import { addClassNameToElement, removeClassNameFromElement } from '../../utils';
import { BreadcrumbComponent } from '../../../breadcrumb/breadcrumb.component';

@Component({
    selector: 'fd-dynamic-page-header',
    templateUrl: './dynamic-page-header.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        '[attr.tabindex]': '0'
    }
})
export class DynamicPageHeaderComponent implements OnInit, AfterViewInit {
    @Input()
    title: string;

    @Input()
    subtitle: string;

    @Input()
    keyInfo: string;

    /**
     * sets background for content to `list`, `transparent`, or `solid` background color.
     * Default is `solid`.
     */
    @Input()
    set background(backgroundType: DynamicPageBackgroundType) {
        if (backgroundType) {
            this._background = backgroundType;
            this._setBackgroundStyles(backgroundType);
        }
    }

    get background(): DynamicPageBackgroundType {
        return this._background;
    }

    /**
     * sets size which in turn adds corresponding padding for the size type.
     * size can be `small`, `medium`, `large`, or `extra-large`.
     */
    @Input()
    set size(sizeType: DynamicPageResponsiveSize) {
        if (sizeType) {
            this._size = sizeType;
            this._setSize(sizeType);
        }
    }

    get size(): DynamicPageResponsiveSize {
        return this._size;
    }

    /** @hidden */
    @ContentChild(BreadcrumbComponent)
    _breadcrumbComponent: BreadcrumbComponent

    /**
     * @hidden
     * tracking the background value
     */
    private _background: DynamicPageBackgroundType;

    /**
     * @hidden
     * tracks the size for responsive padding
     */
    private _size: DynamicPageResponsiveSize;

    /** @hidden */
    constructor(
        private _elementRef: ElementRef<HTMLElement>,
        private _renderer: Renderer2,
        private _focusMonitor: FocusMonitor,
        private _dynamicPageService: DynamicPageService,
        private _ngZone: NgZone
    ) {}

    /** @hidden */
    ngOnInit(): void {
        this._addClassNameToHostElement(CLASS_NAME.dynamicPageTitleArea);
        this._listenForFocusInToExpand();
    }

    /** @hidden */
    ngAfterViewInit(): void {
        this._addCustomClassToBreadcrumb();
        this._applyEntryProperties();
    }

    /**
     * get reference to this element
     */
    elementRef(): ElementRef<HTMLElement> {
        return this._elementRef;
    }

    /**
     * @hidden
     * sets the style classes for background property
     * @param background
     */
    private _setBackgroundStyles(background: DynamicPageBackgroundType): void {
        if (background === 'transparent') {
            this._addClassNameToHostElement(CLASS_NAME.dynamicPageTitleAreaTransparentBg);
        } else {
            removeClassNameFromElement(
                this._renderer,
                this._elementRef.nativeElement,
                CLASS_NAME.dynamicPageTitleAreaTransparentBg
            );
        }
    }

    /** @hidden */
    private _listenForFocusInToExpand(): void {
        this._focusMonitor.monitor(this._elementRef).subscribe((origin) =>
            this._ngZone.run(() => {
                if (origin === 'keyboard') {
                    this._dynamicPageService.collapsed.next(false);
                }
            })
        );
    }

    /**
     * @hidden
     * sets the padding classes
     * @param sizeType
     */
    private _setSize(sizeType: DynamicPageResponsiveSize): void {
        this._addClassNameToHostElement(this._getSizeClass(sizeType));
    }

    /** @hidden */
    private _getSizeClass(sizeType: DynamicPageResponsiveSize): string {
        switch (sizeType) {
            case 'small': return CLASS_NAME.dynamicPageTitleAreaSmall;
            case 'medium': return CLASS_NAME.dynamicPageTitleMedium;
            case 'large': return CLASS_NAME.dynamicPageTitleAreaLarge;
            case 'extra-large':
            default:
                return CLASS_NAME.dynamicPageTitleAreaExtraLarge;
        }
    }

    private _applyEntryProperties(): void {
        if (this.background) {
            this._setBackgroundStyles(this.background);
        }

        if (this.size) {
            this._setSize(this.size);
        }
    }

    /**@hidden */
    private _addClassNameToHostElement(className: string): void {
        addClassNameToElement(this._renderer, this._elementRef.nativeElement, className);
    }

    /**@hidden */
    private _addClassNameToCustomElement(element: Element, className: string): void {
        addClassNameToElement(this._renderer, element, className);
    }

    /** @hidden */
    private _addCustomClassToBreadcrumb(): void {
        if (this._breadcrumbComponent) {
            this._addClassNameToCustomElement(
                this._breadcrumbComponent.elementRef.nativeElement,
                CLASS_NAME.dynamicPageBreadcrumb
            );
        }
    }
}
