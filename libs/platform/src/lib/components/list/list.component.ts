import {
    ChangeDetectionStrategy, Component, Input, ViewEncapsulation,
    ContentChildren, QueryList, HostBinding, ViewChild,
    ElementRef, AfterContentInit, Output, EventEmitter,
    HostListener, ChangeDetectorRef, OnInit, AfterViewInit, ContentChild, Self, Optional, SkipSelf, Host, OnDestroy
} from '@angular/core';
import { FocusKeyManager } from '@angular/cdk/a11y';
import { UP_ARROW, DOWN_ARROW, ENTER, SPACE } from '@angular/cdk/keycodes';
import { NgControl, NgForm } from '@angular/forms';
import { SelectionModel } from '@angular/cdk/collections';
import { Subscription, Subject, of } from 'rxjs';
import { takeUntil, delay, tap } from 'rxjs/operators';
import { BaseComponent } from '../base';
import { BaseInput } from '../form/base.input';
import { ListDataSource, isDataSource } from '../../domain/data-source';
import { ContentDensity, FormFieldControl } from '../../components/form/form-control';
import { BaseListItem, ListItemDef } from './base-list-item';
import { ListConfig } from './list.config';
import { FormField } from '../form/form-field';


export type SelectionType = '' | 'multi' | 'single' | 'delete';
export type ListType = 'inactive' | 'active' | 'detail';
let nextListId = 0;
let nextListGrpHeaderId = 0;
export type FdpListDataSource<T> = ListDataSource<T> | T[];
export class SelectionChangeEvent {
    selectedItems: BaseListItem[];
    index: number;
}

/**
 * The List component represents a container for list item types.
 * It is used to display a list features.
 */
@Component({
    selector: 'fdp-list',
    templateUrl: './list.component.html',
    encapsulation: ViewEncapsulation.None,
    styleUrls: ['./list.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [{ provide: FormFieldControl, useExisting: ListComponent, multi: true }]
})


export class ListComponent extends BaseInput implements OnInit, AfterViewInit, AfterContentInit, OnDestroy {

    /**Enables lazy loadMore of data */
    @Input()
    loadMore: boolean;

    /**Enables data load on scroll for true
     * false: enables data loading on button
     * click
     */
    @Input()
    loadOnScroll: boolean;

    /**Wait time for new items */
    @Input()
    delayTime: number;

    /**Max height for viewport to display scroll */
    @Input()
    maxHeight: string;

    /**Items to be loaded at once */
    @Input()
    itemSize: number;

    /**Scroll offset percentage to trigger scroll event */
    @Input()
    scrollOffsetPercentage: number;

    /** Whether list component has removed borders */
    @Input()
    noBorder = false;

    @Input()
    selection = false;

    /** Whether list component has removed bottom borders */
    @Input()
    noSeperator: boolean;


    /** The type of the selection. Types include:
    *''| 'multi' | 'single'|'delete'.
    * Leave empty for default ().'
    * Default value is set to ''
    */
    @Input()
    public selectionMode: SelectionType = '';

    /**ListType 'inactive' | 'active' | 'navigation' | 'detail' */
    @Input()
    listType: ListType;

    /**  An array that holds a list of all selected items**/
    @Input()
    protected selectedItems: BaseListItem[];

    /** define size of items for screen reader */
    @Input()
    @HostBinding('attr.aria-setsize')
    ariaSetsize: number;

    /** Defines whether items are multiseletable for screen reader */
    @Input()
    @HostBinding('attr.aria-multiselectable')
    ariaMultiselectable: boolean;

    /** define label of list for screen reader */
    @Input()
    @HostBinding('attr.aria-label')
    ariaLabel: string;

    /**Title used on button when data loads on button click */
    @Input()
    loadTitle: string;

    /**
   * Todo: Name of the entity for which DataProvider will be loaded.
   *  You can either pass list of
   * items or use this entityClass and internally we should be able
   * to do lookup to some registry
   * and retrieve the best matching DataProvider that is set on application level
   *
   *
   */
    @Input()
    entityClass: string;

    /**
      * Child items of the List.
      */
    @ContentChildren(BaseListItem, { descendants: true }) ListItems: QueryList<BaseListItem>;

    @ContentChild(ListItemDef) listItemDef: ListItemDef;

    /** Access child element, for checking link content*/
    @ViewChild('link', { read: ElementRef })
    anchor: ElementRef;

    /**@hidden
     * keyManger to handle keybord events
     */
    keyManager: FocusKeyManager<BaseListItem>;

    /**@hidden
     * Whether Navigation mode is included to list component
     * for all the items
    */
    _navigated: boolean;

    /**
     * @hidden
     * Whether Navigation mode is included to list component
     * only a subset of the list items are navigable
     * you should indicate those by displaying a navigation arrow
    */
    _navigationIndicator: boolean;

    /**@hidden
     * Whether By line is present in list item*/
    _hasByLine: boolean;


    /**@hidden
     * To display loading symbol */
    loading = false;

    /** @hidden */
    _contentDensity = this._listConfig.contentDensity;

    /**
     * @hidden
     * Used to define if contentDensity value is 'compact' or not.
     */
    isCompact = this._contentDensity === 'compact';


    /**@hidden
     * Whether list component has multiselection */
    multiSelect = false;

    /**@hidden
    * To store */
    tempItems = [];

    startIndex = 0;

    lastIndex = this.itemSize;

    /** role */
    @HostBinding('attr.role')
    role = 'list';

    protected _destroyed = new Subject<void>();

    items = [];
    dsItems = [];
    selectedvalue: string;

    private _dsSubscription: Subscription | null;
    private _itemsSubscription: Subscription | null;


    /** The model backing of the component. */
    selectionModel: SelectionModel<BaseListItem>;

    /**
    * Datasource for suggestion list
    */
    @Input()
    get dataSource(): FdpListDataSource<any> {
        return this._dataSource;
    }
    set dataSource(value: FdpListDataSource<any>) {
        if (value) {
            this.initializeDS(value);
        }
    }
    protected _dataSource: FdpListDataSource<any>;

    /**
    * content Density of element. 'cozy' | 'compact'
    */
    @Input()
    set contentDensity(contentDensity: ContentDensity) {
        this._contentDensity = contentDensity;
        this.isCompact = contentDensity === 'compact';
    }

    /** setter and getter for _navigated */
    get navigated(): boolean {
        return this._navigated;
    }

    @Input('navigated')
    set navigated(value: boolean) {
        this._navigated = value;
        this.itemEl.nativeElement.querySelector('ul').classList.add('fd-list--navigation');
    }

    /** setter and getter for _navigationIndicator */
    get navigationIndicator(): boolean {
        return this._navigationIndicator;
    }

    @Input('navigationIndicator')
    set navigationIndicator(value: boolean) {
        this._navigationIndicator = value;
        this.itemEl.nativeElement.querySelector('ul').classList.add('fd-list--navigation-indication');
    }

    /** setter and getter for _hasByLine*/
    get hasByLine(): boolean {
        return this._hasByLine;
    }

    @Input('hasByLine')
    set hasByLine(value: boolean) {
        this._hasByLine = value;
        this.itemEl.nativeElement.querySelector('ul').classList.add('fd-list--byline');
    }

    /** @hidden */
    @Output()
    selectedItemChange: EventEmitter<SelectionChangeEvent> = new EventEmitter<SelectionChangeEvent>();

    /** @hidden */
    constructor(protected _changeDetectorRef: ChangeDetectorRef,
        public itemEl: ElementRef,
        @Optional() @Self() public ngControl: NgControl,
        @Optional() @Self() public ngForm: NgForm,
        @Optional() @SkipSelf() @Host() formField: FormField,
        @Optional() @SkipSelf() @Host() formControl: FormFieldControl<any>,
        protected _listConfig?: ListConfig) {
        super(_changeDetectorRef, ngControl, ngForm, formField, formControl);
    }

    /** @hidden */
    /** Instailization of list with selection mode*/
    ngOnInit(): void {

        if (this.dsItems.length !== null && this.itemSize !== 0) {
            this.startIndex = 0;
            this.lastIndex = this.itemSize;
            this.items = [];
            this.items = this.dsItems.slice(this.startIndex, this.lastIndex);
        } else {
            this.items = this.dsItems;
        }
        this.id = `fdp-list-${nextListId++}`;
        // using selection Model for multiselect
        if (this.selectionMode === 'multi') {
            this.multiSelect = true;
            this.ariaMultiselectable = true;
        } else { this.multiSelect = false; }
        this.selectionModel = new SelectionModel<BaseListItem>(
            this.multiSelect,
            this.selectedItems
        );

        this.selectionModel.changed.subscribe(e => {
            this.selectedItems = this.selectionModel.selected;
            const event = new SelectionChangeEvent();
            event.selectedItems = this.selectedItems;
            this.selectedItemChange.emit(event);
        });


    }

    /** @hidden */
    /**Keyboard manager on list items, set values when passed via array */
    ngAfterViewInit(): void {

        this.keyManager = new FocusKeyManager<BaseListItem>(this.ListItems).withWrap();
        this.ListItems.forEach((item) => {
            item.navigated = this._navigated;
            item.navigationIndicator = this._navigationIndicator;
            item.contentDensity = this.contentDensity;
            item.selectionMode = this.selectionMode;
            item.listType = this.listType;
            item.hasByLine = this._hasByLine;
            item.noSeperator = this.noSeperator;
        });
    }


    /** @hidden */
    /**Setting values from list to list items
     * example:
     * Does list item has navigation,
     * should show arrows,
     * will it be compact mode,
     * should be in which selection mode
     * set values when passed via datasource
     */
    ngAfterContentInit(): void {
        this._itemsSubscription = this.ListItems.changes.subscribe((items) => {
            items.forEach((item) => {
                item.navigated = this._navigated;
                item.navigationIndicator = this._navigationIndicator;
                item.contentDensity = this.contentDensity;
                item.selectionMode = this.selectionMode;
                item.listType = this.listType;
                item.hasByLine = this._hasByLine;
                item.noSeperator = this.noSeperator;
            });
        });
    }

    ngOnDestroy(): void {
        if (isDataSource(this.dataSource)) {
            this.dataSource.close();
        }
        if (this._dsSubscription) {
            this._dsSubscription.unsubscribe();
        }
        if (this.selectionModel) {
            this.selectionModel.changed.unsubscribe();
        }
        if (this._itemsSubscription) {
            this._itemsSubscription.unsubscribe();
        }
    }

    get value(): any {
        return this.selectedItems;
    }
    set value(value: any) {
        this.selectedItems = value;
        this._changeDetectorRef.markForCheck();
    }


    /** @hidden */
    /**handline keyboard operations
    *  on list and list items
    */
    handleKeyDown(event: any): boolean {
        event.stopImmediatePropagation();
        if (this.keyManager) {
            if (event.keyCode === DOWN_ARROW || event.keyCode === UP_ARROW) {
                return false;
            } else if (event.keyCode === ENTER || event.keyCode === SPACE) {
                this.updateNavigation(event);
                return false;
            }
        }
    }

    private initializeDS(ds: FdpListDataSource<any>): void {
        this.dsItems = [];
        if (isDataSource(this.dataSource)) {
            this.dataSource.close();
            if (this._dsSubscription) {
                this._dsSubscription.unsubscribe();
                this._dsSubscription = null;
            }
        }
        // Convert ListDataSource<T> | T[] as DataSource
        this._dataSource = this.openDataStream(ds);
    }

    private toDataStream(ds: FdpListDataSource<any>): ListDataSource<any> {
        if (isDataSource(ds)) {
            return ds;
        }
        return undefined;
    }

    private openDataStream(ds: FdpListDataSource<any>): ListDataSource<any> {
        const initDataSource = this.toDataStream(ds);
        if (initDataSource === undefined) {
            throw new Error(`[dataSource] source did not match an array, Observable, or DataSource`);
        }
        /**
         * This is single point of data entry to the component. We dont want to set data on different
         * places. If any new data comes in either you do a search and you want to pass initial data
         * its here.
         */
        this._dsSubscription = initDataSource
            .open()
            .pipe(takeUntil(this._destroyed))
            .subscribe((data) => {
                this.dsItems = data || [];
                this._cd.markForCheck();
            });
        // initial data fetch
        initDataSource.match('*');
        return initDataSource;
    }

    scrollHandler(): void {
        if (!this.loading && this.loadOnScroll) {
            this.getMoreData();
        }
    }

    /**
   *  Handles lazy loading data
   * onscroll and on more button click
   */
    public getMoreData(): void {
        this.loading = true;
        of(this._loadNewItems())
            .pipe(
                tap(data => {
                    if (data === null || data === undefined) {
                        console.error('===Invalid Response recived===');
                    }
                }),
                delay(this.delayTime)
            ).subscribe(result => {
                if (result !== null && result !== undefined) {
                    for (let i = this.items.length, j = 0; j < result.length; ++i, ++j) {
                        this.items[i] = result[j];
                    }
                }
                this.loading = false;
                this._changeDetectorRef.markForCheck();

            });
    }
    _loadNewItems(): any[] {
        this.startIndex = this.startIndex + this.itemSize;
        this.lastIndex = this.lastIndex + this.itemSize;
        this.tempItems = this.dsItems.slice(this.startIndex, this.lastIndex);
        return this.tempItems;
    }
    /**  filter to get Selected items from a list**/
    onSelectionChanged(event: any): void {
        if (event.target.checked) {
            this.selectionModel.select(event.target.parentNode.parentNode.parentNode);
        } else {
            this.selectionModel.deselect(event.target.parentNode.parentNode.parentNode);
        }
    }

    /** @hidden */
    /**  Update navgiation styles for non navigated items**/
    @HostListener('click', ['$event'])
    updateNavigation(event: any): void {
        this.ListItems.forEach((item) => {
            if (item.anchor !== undefined) {
                item.anchor.nativeElement.classList.remove('is-navigated');
            }
        });
        if (event.target !== null && event.target.tagName.toLowerCase() === 'a') {
            event.target.classList.add('is-navigated');
        }
        this.handleSingleSelect(event);
        this.handleMultiSelect(event);

    }
    /** @hidden */
    /**List item with radio button styles,check,uncheckupdates */
    handleSingleSelect(event: any): void {

        if (event.target !== null && event.target !== undefined && this.selectionMode === 'single') {
            this.selectionModel.clear();
            if (event.target.tagName.toLowerCase() === 'li' &&
                event.target.querySelector('fd-radio-button') !== undefined) {
                const radio1 = event.target.querySelector('fd-radio-button');
                radio1.childNodes[0].checked = true;
                this.selectedvalue = radio1.getAttribute('ng-reflect-value');
                this.selectionModel.select(radio1.parentNode.parentNode);
            } else if (event.target.tagName.toLowerCase() === 'span' &&
                event.target.parentNode.querySelector('fd-radio-button') !== undefined) {
                const radio2 = event.target.parentNode.querySelector('fd-radio-button');
                radio2.checked = true;
                this.selectedvalue = radio2.getAttribute('ng-reflect-value');
                this.selectionModel.select(radio2.parentNode.parentNode);
            } else if ((event.target.tagName.toLowerCase() === 'label'
                || event.target.tagName.toLowerCase() === 'input') &&
                event.target.type === 'radio') {
                const radio3 = event.target.parentNode;
                radio3.checked = true;
                this.selectedvalue = radio3.getAttribute('ng-reflect-value');
                this.selectionModel.select(radio3.parentNode.parentNode);
            } else if (event.target.querySelector('fd-radio-button') !== undefined &&
                event.target.querySelector('fd-radio-button') !== null) {
                const target1 = event.target;
                target1.checked = true;
                this.selectedvalue = target1.getAttribute('ng-reflect-value');
                this.selectionModel.select(target1.parentNode.parentNode);
            } else if ((event.target.tagName.toLowerCase() === 'div')) {
                const divPart = event.target.parentNode.parentNode;
                const radio = divPart.querySelector('input');
                radio.checked = true;
                this.selectionModel.select(divPart);
            }
        }
        this.ListItems.forEach((item) => {
            if (item.radioButtonComponent !== undefined) {
                item.selectionValue = this.selectedvalue;
            }
        });
    }

    /** @hidden */
    /**List item with checkbox styles,check,uncheckupdates */
    handleMultiSelect(event: any): void {
        if (event.target !== null &&
            event.target !== undefined &&
            this.selectionMode === 'multi') {
            if (event.target.tagName.toLowerCase() === 'li' &&
                event.target.querySelector('fd-checkbox') !== undefined) {
                const checkbox1 = event.target.querySelector('fd-checkbox');
                if (checkbox1.childNodes[0].checked) {
                    this.selectionModel.select(checkbox1.parentNode.parentNode);
                } else {
                    this.selectionModel.deselect(checkbox1.parentNode.parentNode);
                }
            } else if (event.target.tagName.toLowerCase() === 'span' &&
                event.target.parentNode.querySelector('fd-checkbox') !== undefined) {
                const checkbox2 = event.target.parentNode.querySelector('fd-checkbox');
                if (checkbox2.childNodes[0].checked) {
                    this.selectionModel.select(checkbox2.parentNode.parentNode);
                } else {
                    this.selectionModel.deselect(checkbox2.parentNode.parentNode);
                }
            } else if ((event.target.tagName.toLowerCase() === 'label'
                || event.target.tagName.toLowerCase() === 'input')
                && event.target.type === 'checkbox') {
                const checkbox3 = event.target;
                if (checkbox3.checked) {
                    this.selectionModel.select(
                        checkbox3.parentNode.parentNode.parentNode);
                } else {
                    this.selectionModel.deselect(
                        checkbox3.parentNode.parentNode.parentNode);
                }
            } else if ((event.target.tagName.toLowerCase() === 'label'
                || event.target.tagName.toLowerCase() === 'input') &&
                event.target.type === 'checkbox') {
                if (event.target.checked) {
                    this.selectionModel.select(
                        event.target.parentNode.parentNode.parentNode);
                } else {
                    this.selectionModel.deselect(
                        event.target.parentNode.parentNode.parentNode);
                }
            } else if ((event.target.tagName.toLowerCase() === 'div')) {
                const divPart = event.target.parentNode.parentNode;
                const checkbox = divPart.querySelector('input');
                if (checkbox.checked) {
                    this.selectionModel.select(divPart);
                } else {
                    this.selectionModel.deselect(divPart);
                }
            }
        }

    }
}

@Component({
    selector: 'fdp-list-footer',
    template: `<li #listfooter class="fd-list__footer" [attr.id]="id" role="listitem">
    <ng-content> </ng-content>
    </li>`
})
export class ListFooter extends BaseComponent { }

@Component({
    selector: 'fdp-list-group-header',
    template: `<li #listItem fd-list-group-header [attr.id]="id" role="listitem"
    [attr.aria-label]="grpheaderTitle" [attr.title]="grpheaderTitle">
    {{grpheaderTitle}} <ng-content></ng-content>
</li>`
})
export class ListGroupHeader extends BaseListItem implements OnInit {
    /**
    *  Displays list goup header title
   */
    @Input()

    grpheaderTitle?: string;

    /** @hidden */
    /** Instailization of list header*/
    ngOnInit(): void {
        this.id = `fdp-list-${nextListGrpHeaderId++}`;
    }
}
