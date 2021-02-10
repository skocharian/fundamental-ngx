import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output,
    Renderer2,
    ViewChild,
    ViewEncapsulation,
    HostBinding,
    ChangeDetectorRef
} from '@angular/core';

import { DynamicPageBackgroundType, CLASS_NAME, DynamicPageResponsiveSize } from '../../constants';
import { DynamicPageConfig } from '../../dynamic-page.config';
import { DynamicPageService } from '../../dynamic-page.service';
import { addClassNameToElement, removeClassNameFromElement } from '../../utils';
import { distinctUntilChanged } from 'rxjs/operators';

const sizeClasses = [
    CLASS_NAME.dynamicPageCollapsibleHeaderSmall,
    CLASS_NAME.dynamicPageCollapsibleHeaderMedium,
    CLASS_NAME.dynamicPageCollapsibleHeaderLarge,
    CLASS_NAME.dynamicPageCollapsibleHeaderExtraLarge
];

let dynamicPageSubHeaderId = 0;
@Component({
    selector: 'fd-dynamic-page-subheader',
    templateUrl: './dynamic-page-subheader.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class DynamicPageSubheaderComponent implements OnInit, AfterViewInit, OnDestroy {
    /**
     * whether the header can be collapsed. True by default. If set to false, both pin/collapse buttons disappear
     * and the header stays visible
     */
    @Input()
    collapsible = true;

    /**
     * whether the header should be allowed to be pinned or unpinned. When set, the pin button shows up.
     * Pinning the header will make the header stay visible and the collapse button(if present) will disappear until unpinned.
     */
    @Input()
    pinnable = false;

    /**
     * the initial state of the header. Set to true if header should be collapsed.
     */
    @Input()
    set collapsed(collapsed: boolean) {
        this._handleCollapsedChange(collapsed);
    }

    get collapsed(): boolean {
        return this._collapsed;
    }

    /**
     * ARIA label for button when the header is collapsed
     */
    @Input()
    expandLabel: string = this._dynamicPageConfig.expandLabel;

    /**
     * ARIA label for button when the header is expanded
     */
    @Input()
    collapseLabel: string = this._dynamicPageConfig.collapseLabel;

    /** Header role  */
    @Input()
    @HostBinding('attr.role')
    role = 'region';

    /**
     * id for header
     */
    @Input()
    @HostBinding('attr.id')
    id = `fd-dynamic-page-header-id-${dynamicPageSubHeaderId++}`;

    /**
     * aria label for header
     */
    @Input()
    headerAriaLabel: string;

    /**
     * aria label for pin state of pin button
     */
    @Input()
    pinAriaLabel: string = this._dynamicPageConfig.pinLabel;

    /**
     * aria label for unpin state of pin button
     */
    @Input()
    unpinAriaLabel: string = this._dynamicPageConfig.unpinLabel;

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

    /** Collapse/Expand change event raised */
    @Output()
    collapsedChange = new EventEmitter<boolean>();

    /** Reference to page header content */
    @ViewChild('headerContent')
    headerContent: ElementRef<HTMLElement>;

    /** Reference to page header content */
    @ViewChild('pincollapseContainer')
    pinCollapseContainer: ElementRef<HTMLElement>;

    /**
     * tracking if pin button is pinned
     */
    _pinned = false;

    /**
     * @hidden
     * tracking expand/collapse button
     */
    private _collapsed = false;

    /**
     * @hidden
     * tracking collapsible for pinning
     */
    private _collapsible = this.collapsible;

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
        private _cd: ChangeDetectorRef,
        private _elementRef: ElementRef<HTMLElement>,
        private _renderer: Renderer2,
        protected _dynamicPageConfig: DynamicPageConfig,
        private _dynamicPageService: DynamicPageService
    ) {
        this._dynamicPageService.collapsed
            .pipe(distinctUntilChanged())
            .subscribe(collapsed => this._handleCollapsedChange(collapsed));
    }

    /** @hidden */
    ngOnInit(): void {
        // if (this._isCollapsibleCollapsed()) {
        //     this._setStyleToHostElement('z-index', 1);
        // }
    }

    /** @hidden */
    ngAfterViewInit(): void {
        if (this._background) {
            this._setBackgroundStyles(this._background);
        }
        if (this.size) {
            this._setSize(this.size);
        }
    }

    /**@hidden */
    ngOnDestroy(): void {
    }

    /**
     * toggles the state of the header and
     * handles expanded/collapsed event
     */
    toggleCollapse(): void {
        this._pinned = false;
        this._handleCollapsedChange(!this._collapsed)
    }

    /**
     * return the element reference.
     */
    elementRef(): ElementRef<any> {
        return this._elementRef;
    }

    /**
     * @hidden
     * click action on pin button
     */
    togglePinned(): void {
        this._pinned = !this._pinned;
        this._dynamicPageService.pinned.next(this._pinned);
    }

    private _handleCollapsedChange(collapsed: boolean): void {
        if (collapsed === this._collapsed) {
            return;
        }

        this._collapsed = collapsed;

        // if (this._isCollapsibleCollapsed()) {
        //     this._setStyleToHostElement('z-index', 1);
        // } else {
        //     this._removeStyleFromHostElement('z-index');
        // }

        this._dynamicPageService.collapsed.next(collapsed);
        this._cd.detectChanges();
        this._dynamicPageService.subheaderVisibilityChange.next();
    }

    /**
     * return whether this collapse/expand button is collapsed
     */
    private _isCollapsibleCollapsed(): boolean {
        return this.collapsible && this.collapsed && this._collapsible;
    }

    /**
     * @hidden
     * sets the style classes for background property
     * @param background
     */
    private _setBackgroundStyles(background: DynamicPageBackgroundType): any {
        if (this.headerContent) {
            if (background === 'transparent') {
                this._addClassNameToCustomElement(
                    this.headerContent.nativeElement,
                    CLASS_NAME.dynamicPageCollapsibleHeaderTransparentBg
                );
            } else {
                removeClassNameFromElement(
                    this._renderer,
                    this.headerContent.nativeElement,
                    CLASS_NAME.dynamicPageCollapsibleHeaderTransparentBg
                );
            }
        }
    }

    /**
     * @hidden
     * sets the padding classes
     * @param sizeType
     */
    private _setSize(sizeType: DynamicPageResponsiveSize): any {
        if (this.headerContent) {
            sizeClasses.forEach(_class =>
                removeClassNameFromElement(
                    this._renderer,
                    this._elementRef.nativeElement,
                    _class
                )
            );
            this._addClassNameToCustomElement(
                this.headerContent.nativeElement,
                this._getSizeClass(sizeType)
            );
        }
    }

    /** @hidden */
    private _getSizeClass(sizeType: DynamicPageResponsiveSize): string {
        switch (sizeType) {
            case 'small': return CLASS_NAME.dynamicPageCollapsibleHeaderSmall;
            case 'medium': return CLASS_NAME.dynamicPageCollapsibleHeaderMedium;
            case 'large': return CLASS_NAME.dynamicPageCollapsibleHeaderLarge;
            case 'extra-large':
            default:
                return CLASS_NAME.dynamicPageCollapsibleHeaderExtraLarge;

        }
    }

    /**@hidden */
    private _addClassNameToCustomElement(element: Element, className: string): void {
        addClassNameToElement(this._renderer, element, className);
    }
}
