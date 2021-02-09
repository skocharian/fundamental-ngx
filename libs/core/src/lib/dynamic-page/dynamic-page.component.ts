import {
    AfterContentInit,
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChild, ContentChildren,
    ElementRef,
    HostBinding,
    Input,
    OnDestroy,
    QueryList,
    Renderer2,
    ViewChild,
    ViewChildren,
    ViewEncapsulation
} from '@angular/core';
import { TabPanelComponent } from '@fundamental-ngx/core';
import { fromEvent, Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil, throttleTime } from 'rxjs/operators';
import { CLASS_NAME, DynamicPageBackgroundType, DynamicPageResponsiveSize } from './constants';
import {
    DynamicPageContentComponent
} from './dynamic-page-content/dynamic-page-content.component';
import { DynamicPageSubheaderComponent } from './dynamic-page-header/subheader/dynamic-page-subheader.component';
import { DynamicPageHeaderComponent } from './dynamic-page-header/header/dynamic-page-header.component';
import { DynamicPageService } from './dynamic-page.service';
import { addClassNameToElement } from './utils';
import { TabListComponent } from '../tabs/tab-list.component';

@Component({
    selector: 'fd-dynamic-page',
    templateUrl: './dynamic-page.component.html',
    styleUrls: ['./dynamic-page.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [DynamicPageService]
})
export class DynamicPageComponent implements AfterContentInit, AfterViewInit, OnDestroy {
    /** Page role  */
    @Input()
    @HostBinding('attr.role')
    role = 'region';

    /** aria label for the page */
    @Input()
    ariaLabel: string;

    /**
     * sets background for content to `list`, `transparent`, or `solid` background color.
     * Default is `solid`.
     */
    @Input()
    background: DynamicPageBackgroundType = 'solid';

    /**
     * sets size which in turn adds corresponding padding for the size type.
     * size can be `small`, `medium`, `large`, or `extra-large`.
     */
    @Input()
    size: DynamicPageResponsiveSize = 'extra-large';

    /**
     * user provided offset in px
     */
    @Input()
    offset = 0;

    /** reference to header component  */
    @ContentChild(DynamicPageSubheaderComponent)
    pageSubheaderComponent: DynamicPageSubheaderComponent;

    /** reference to title component  */
    @ContentChild(DynamicPageHeaderComponent)
    titleComponent: DynamicPageHeaderComponent;

    /** reference to content component  */
    @ContentChild(DynamicPageContentComponent)
    contentComponent: DynamicPageContentComponent;

    @ContentChild(TabListComponent)
    tabComponent: TabListComponent;

    @ViewChildren(TabPanelComponent)
    dynamicPageTabs: QueryList<TabPanelComponent>;

    /**
     * @hidden
     * reference to header container
     */
    @ViewChild('header')
    header: ElementRef<HTMLElement>;

    /**
     * @hidden
     * reference to tabbed content container
     */
    @ViewChild('contentContainer')
    contentContainer: ElementRef<HTMLElement>;

    /**
     * @hidden
     * holds the tab content
     */
    tabs: DynamicPageContentComponent[] = [];

    /** @hidden */
    private _distanceFromTop = 0;

    /** @hidden */
    private _subscriptions: Subscription = new Subscription();

    /**
     * subscription for when collapse value has changed
     */
    private _collapseValSubscription: Subscription = new Subscription();

    /** @hidden **/
    private readonly _onDestroy$: Subject<void> = new Subject<void>();


    /** @hidden */
    public headerCollapsible = true;

    /** @hidden */
    constructor(
        protected _cd: ChangeDetectorRef,
        private _elementRef: ElementRef<HTMLElement>,
        private _renderer: Renderer2,
        private _dynamicPageService: DynamicPageService
    ) {
        this._listenOnCollapse();
    }

    /** @hidden */
    ngAfterContentInit(): void {
        this._propagatePropertiesToChildren();
    }

    /**@hidden */
    ngAfterViewInit(): void {
        // this._setToolbarStyles();
        this.setContainerPositions();
        this._setTabStyles();
        this._subscriptions.add(
            // this.tabbedContent.changes.subscribe(() => {
            //     this._setTabStyles();
            // })
        );
        if (this.pageSubheaderComponent?.collapsible) {
            this._addScrollListeners();
            this._listenOnResize();
        }
    }

    /**@hidden */
    ngOnDestroy(): void {
        this._collapseValSubscription.unsubscribe();
        this._subscriptions.unsubscribe();
    }

    /**
     * Set the positions of the tabs and content with respect to the window
     */
    setContainerPositions(): void {
        console.log('changed collapsed');
        this._setTabsPosition();
        this._setContainerPosition();
    }

    /**
     * toggle the visibility of the header on click of title area.
     */
    toggleCollapse(): void {
        if (this.headerCollapsible) {
            this._dynamicPageService.toggleCollapsed();
        }
    }

    /**
     * get reference to this element
     */
    elementRef(): ElementRef<HTMLElement> {
        return this._elementRef;
    }

    /** TODO */
    refreshSize(): void {
        this.setContainerPositions();
    }

    /** @hidden */
    private _propagatePropertiesToChildren(): void {
        if (this.background) {
            this.titleComponent.background = this.background;
            this.pageSubheaderComponent.background = this.background;
            this.contentComponent.background = this.background;
        }
        if (this.size) {
            this.titleComponent.size = this.size;
            this.pageSubheaderComponent.size = this.size;
            this.contentComponent.size = this.size;
        }
        this.headerCollapsible = this.pageSubheaderComponent.collapsible;
    }

    private _listenOnCollapse(): void {
        this._dynamicPageService.subheaderVisibilityChange
            .pipe(
                takeUntil(this._onDestroy$)
            )
            .subscribe(_ => this.setContainerPositions())
        ;
    }

    /**@hidden */
    private _getCalculatedFullHeight(element: HTMLElement): string {
        if (!element) {
            return null;
        }
        const distanceFromTop = element.getBoundingClientRect().top;
        return 'calc(100vh - ' + (distanceFromTop + this.offset) + 'px)';
    }

    /** @hidden */
    private _addScrollListeners(): void {
        const contentElement = this.contentComponent?.getElementRef()?.nativeElement;
        if (contentElement) {
            this._listenOnScroll(contentElement);
        }

        const tabElement = this.tabComponent?.contentContainer?.nativeElement
        if (tabElement) {
            this._listenOnScroll(tabElement);
        }
    }

    /** @hidden */
    private _listenOnScroll(element: HTMLElement): void {
        fromEvent(element, 'scroll')
            .pipe(debounceTime(10), takeUntil(this._onDestroy$))
            .subscribe(_ => {
                const collapse = !this._dynamicPageService.pinned.value && element.scrollTop > 0;
                this._dynamicPageService.collapsed.next(collapse);
            })
        ;
    }


    /** @hidden Listen for window resize and adjust tab and content positions accordingly */
    private _listenOnResize(): void {
        this._subscriptions.add(
            fromEvent(window, 'resize')
                .pipe(debounceTime(60))
                .subscribe(_ => this.setContainerPositions())
        );
    }

    /**
     * @hidden
     * set top position of normal content on scrolling
     */
    private _setContainerPosition(): void {
        if (this.contentComponent) {
            const contentComponentElement = this.contentComponent.getElementRef().nativeElement;
            this._renderer.setStyle(
                contentComponentElement,
                'height',
                this._getCalculatedFullHeight(contentComponentElement)
            );
        }
    }

    /**
     * @hidden
     * set position for tabs and tabbed content's position relative to the tabs on scrolling
     */
    private _setTabsPosition(): void {
        if (!this.tabComponent || !this.tabComponent.contentContainer) {
            return;
        }
        const element = this.tabComponent.contentContainer.nativeElement;
        this._renderer.setStyle(
            element,
            'height',
            this._getCalculatedFullHeight(element)
        );
    }

    /**
     * @hidden
     * set styles for tab labels
     */
    private _setTabStyles(): void {
        if (!this.tabComponent) {
            return;
        }
        this._removeShadowWhenTabComponent();
        if (this.size) {
            this._setTabsSize(this.size, this.tabComponent.headerContainer.nativeElement);
        }
    }

    private _removeShadowWhenTabComponent(): void {
        if (!this.pageSubheaderComponent?.collapsible) {
            return;
        }

        const pinCollapseShadowElement = this.pageSubheaderComponent?.pinCollapseContainer;

        if (pinCollapseShadowElement) {
            this._addClassNameToCustomElement(
                pinCollapseShadowElement.nativeElement,
                CLASS_NAME.dynamicPageCollapsibleHeaderPinCollapseNoShadow
            );
        }
    }

    /**
     * @hidden
     * add size classes to tabs
     * @param sizeType
     * @param element
     */
    _setTabsSize(sizeType: DynamicPageResponsiveSize, element: Element): void {
        switch (sizeType) {
            case 'small':
                this._addClassNameToCustomElement(element, CLASS_NAME.dynamicPageTabsSmall);
                break;
            case 'medium':
                this._addClassNameToCustomElement(element, CLASS_NAME.dynamicPageTabsMedium);

                break;
            case 'large':
                this._addClassNameToCustomElement(element, CLASS_NAME.dynamicPageTabsLarge);
                break;
            case 'extra-large':
            default:
                this._addClassNameToCustomElement(element, CLASS_NAME.dynamicPageTabsExtraLarge);
                break;
        }
    }

    /**
     * @hidden
     * add classes to projected toolbars
     */
    private _setToolbarStyles(): void {
        // adds global actions classes to its toolbar
        const globalToolbarEl = this._elementRef.nativeElement.querySelector(
            'fd-dynamic-page-global-actions .fd-toolbar'
        );
        if (globalToolbarEl) {
            addClassNameToElement(this._renderer, globalToolbarEl, CLASS_NAME.dynamicPageGlobalActions);
        }

        const layoutToolbarEl = this._elementRef.nativeElement.querySelector(
            'fd-dynamic-page-layout-actions .fd-toolbar'
        );
        if (layoutToolbarEl) {
            addClassNameToElement(this._renderer, layoutToolbarEl, CLASS_NAME.dynamicPageLayoutActions);
        }

        const actionsContainerEl = this._elementRef.nativeElement.querySelector(
            '.' + CLASS_NAME.dynamicPageActionsContainer
        );
        // set toolbar sizes
        this._setToolbarsSize(this.size, actionsContainerEl, globalToolbarEl, layoutToolbarEl);
    }

    /**
     * @hidden
     * add size classes to toolbars
     * @param sizeType
     * @param element
     */
    _setToolbarsSize(
        sizeType: DynamicPageResponsiveSize,
        actionsContainer: Element,
        globalActions: Element,
        layoutActions: Element
    ): void {
        switch (sizeType) {
            case 'small':
                if (globalActions) {
                    this._addClassNameToCustomElement(globalActions, CLASS_NAME.dynamicPageGlobalActionsToolbarSmall);
                }
                break;
            case 'medium':
                if (actionsContainer) {
                    this._addClassNameToCustomElement(actionsContainer, CLASS_NAME.dynamicPageActionsContainerMedium);
                    const globalActionsEl: HTMLElement = actionsContainer.querySelector(
                        'fd-dynamic-page-global-actions'
                    );
                    const layoutActionsEl: HTMLElement = actionsContainer.querySelector(
                        'fd-dynamic-page-layout-actions'
                    );
                    if (globalActionsEl) {
                        globalActionsEl.style.order = '2';
                    }
                    if (layoutActionsEl) {
                        layoutActionsEl.style.order = '1';
                    }
                }
                if (globalActions) {
                    this._addClassNameToCustomElement(globalActions, CLASS_NAME.dynamicPageGlobalActionsToolbarMedium);
                }
                if (layoutActions) {
                    this._addClassNameToCustomElement(layoutActions, CLASS_NAME.dynamicPageLayoutActionsToolbarMedium);
                }
                break;
            case 'large':
            case 'extra-large':
            default:
                break;
        }
    }

    /**@hidden */
    private _addClassNameToCustomElement(element: Element, className: string): void {
        addClassNameToElement(this._renderer, element, className);
    }
}
