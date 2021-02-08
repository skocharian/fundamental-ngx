import {
    AfterViewInit,
    ChangeDetectorRef,
    ContentChildren,
    Directive,
    ElementRef,
    EventEmitter,
    Host,
    Input,
    OnDestroy,
    Optional,
    Output,
    QueryList,
    Self,
    SkipSelf,
    TemplateRef,
    ViewChild
} from '@angular/core';
import { NgControl, NgForm } from '@angular/forms';
import {
    CONTROL,
    DOWN_ARROW,
    ENTER,
    ESCAPE,
    LEFT_ARROW,
    RIGHT_ARROW,
    SHIFT,
    TAB,
    UP_ARROW,
    BACKSPACE
} from '@angular/cdk/keycodes';

import { fromEvent, isObservable, Observable, Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import {
    FocusEscapeDirection,
    KeyUtil,
    ListComponent,
    MobileModeConfig,
    TemplateDirective,
    PopoverFillMode
} from '@fundamental-ngx/core';
import {
    ArraySelectDataSource,
    SelectDataSource,
    isDataSource,
    isOptionItem,
    MatchingBy,
    ObservableSelectDataSource,
    OptionItem
} from '../../../../domain';

import { isFunction, isJsObject, isString } from '../../../../utils/lang';
import { CollectionBaseInput } from '../../collection-base.input';
import { SelectComponent } from '../select/select.component';
import { SelectConfig, MatchingStrategy } from '../select.config';
import { ContentDensity, FormFieldControl } from '../../form-control';
import { FormField } from '../../form-field';
import { TextAlignment } from '../../combobox';

export type FdpSelectDataSource<T> = SelectDataSource<T> | Observable<T[]> | T[];

export class FdpSelectionChangeEvent {
    constructor(
        public source: SelectComponent,
        public payload: any // Contains selected item
    ) {}
}

@Directive()
export abstract class BaseSelect extends CollectionBaseInput implements AfterViewInit, OnDestroy {
    /** Provides maximum height for the optionPanel */
    @Input()
    maxHeight = '250px';

    /**
     * Todo: Name of the entity for which DataProvider will be loaded. You can either pass list of
     * items or use this entityClass and internally we should be able to do lookup to some registry
     * and retrieve the best matching DataProvider that is set on application level
     */
    @Input()
    entityClass: string;

    /** Whether the select should be built on mobile mode */
    @Input()
    mobile = false;

    /** Multi Input Mobile Configuration, it's applied only, when mobile is enabled */
    @Input()
    mobileConfig: MobileModeConfig;

    /** Tells the select if we need to group items */
    @Input()
    group = false;

    /** A field name to use to group data by (support dotted notation) */
    @Input()
    groupKey?: string;

    /** The field to show data in secondary column */
    @Input()
    secondaryKey?: string;

    /** Show the second column (Applicable for two columns layout) */
    @Input()
    showSecondaryText = false;

    /** Glyph to add icon in the select component. */
    @Input()
    glyph = 'slim-arrow-down';

    /** The element to which the popover should be appended. */
    @Input()
    appendTo: ElementRef;

    @Input()
    triggerValue: String;

    @Input()
    fillControlMode: PopoverFillMode = 'at-least';

    /** Horizontally align text inside the second column (Applicable for two columns layout) */
    @Input()
    secondaryTextAlignment: TextAlignment = 'right';

    /** Turns on/off Adjustable Width feature */
    @Input()
    autoResize = false;

    @Input()
    noValueLabel: String;

    /**
     * Max width of list container
     * */
    @Input()
    maxWidth?: number;

    /**
     * content Density of element. 'cozy' | 'compact'
     */
    @Input()
    set contentDensity(contentDensity: ContentDensity) {
        this._contentDensity = contentDensity;
        this.isCompact = contentDensity === 'compact';
    }

    /** Datasource for suggestion list */
    @Input()
    get dataSource(): FdpSelectDataSource<any> {
        return this._dataSource;
    }

    set dataSource(value: FdpSelectDataSource<any>) {
        if (value) {
            this._initializeDataSource(value);
        }
    }


    @Input()
    get value(): any {
        return super.getValue();
    }

    set value(value: any) {
        if (!value) {
            return;
        }

        const selectedItems = Array.isArray(value) ? value : [value];
        this._setAsSelected(this._convertToOptionItems(selectedItems));
        super.setValue(value);
    }

    /** Event emitted when item is selected. */
    @Output()
    selectionChange = new EventEmitter<FdpSelectionChangeEvent>();

    /** @hidden */
    @ViewChild(ListComponent)
    listComponent: ListComponent;

    /** @hidden */
    @ContentChildren(TemplateDirective)
    customTemplates: QueryList<TemplateDirective>;

    /** Custom Option item Template
     * * @hidden
     * */
    _optionItemTemplate: TemplateRef<any>;

    /** 
     * Custom Group Header item Template
     * @hidden
     * */
    _groupItemTemplate: TemplateRef<any>;

    /**
     * Custom Secondary item Template
     * @hidden
     * */
    _secondaryItemTemplate: TemplateRef<any>;

    /**
     * Custom Selected option item Template
     * @hidden
     * */
    _selectedItemTemplate: TemplateRef<any>;

    /** @hidden */
    searchInputElement: ElementRef;

    /** @hidden */
    _contentDensity: ContentDensity = this.selectConfig.contentDensity;
  
    /**
      * @hidden
      * Used to define if contentDensity value is 'compact' or not.
    */
   _isCompact = this._contentDensity === 'compact';

    /**
     * @hidden
     * Whether "contentDensity" is "compact"
     */
    isCompact: boolean = this._contentDensity === 'compact';

    /** @hidden */
    controlTemplate: TemplateRef<any>;

    /** @hidden */
    listTemplate: TemplateRef<any>;

    /** Whether the select is opened. */
    isOpen = false;

    get canClose(): boolean {
        return !(this.mobile && this.mobileConfig.approveButtonText);
    }

    /**
     * List of option items
     * @hidden
     * */
    _optionItems: OptionItem[];

    /**
     * Min width of list container
     * @hidden
     * */
    minWidth?: number;

    /**
     * Need for opening mobile version
     *
     * @hidden
     */
    openChange = new Subject<boolean>();

    protected _dataSource: FdpSelectDataSource<any>;

    /** @hidden */
    private _matchingStrategy: MatchingStrategy = this.selectConfig.matchingStrategy;

    /** @hidden */
    private _dsSubscription?: Subscription;

    /** @hidden */
    private _element: HTMLElement = this.elementRef.nativeElement;
   
    /** Keys, that won't trigger the popover's open state, when dispatched on search input */
    private readonly _nonOpeningKeys: number[] = [
        ESCAPE, ENTER, CONTROL, TAB, SHIFT,
        UP_ARROW, RIGHT_ARROW, DOWN_ARROW, LEFT_ARROW
    ];

    /** @hidden */
    private _displayFn = (value: any) => {
        return this.displayValue(value);
    };

    /** @hidden */
    private _secondaryFn = (value: any) => {
        if (isOptionItem(value)) {
            return value.secondaryText;
        } else if (isJsObject(value) && this.secondaryKey) {
            const currentItem = this.objectGet(value, this.secondaryKey);

            return isFunction(currentItem) ? currentItem() : currentItem;
        } else {
            return value;
        }
    };

    constructor(
        readonly cd: ChangeDetectorRef,
        protected readonly elementRef: ElementRef,
        @Optional() @Self() readonly ngControl: NgControl,
        @Optional() @Self() readonly ngForm: NgForm,
        protected selectConfig: SelectConfig,
        @Optional() @SkipSelf() @Host() formField: FormField,
        @Optional() @SkipSelf() @Host() formControl: FormFieldControl<any>
    ) {
        super(cd, ngControl, ngForm, formField, formControl);
    }

    /** @hidden */
    ngAfterViewInit(): void {
        this._initWindowResize();
        this._assignCustomTemplates();
        super.ngAfterViewInit();
    }

    /** @hidden */
    ngOnDestroy(): void {
        super.ngOnDestroy();

        if (isDataSource(this.dataSource)) {
            (this.dataSource as SelectDataSource<any>).close();
        }

        if (this._dsSubscription) {
            this._dsSubscription.unsubscribe();
        }
    }

    /**
     * Method to emit change event
     * @hidden
     */
    abstract _emitChangeEvent<K>(value: K): void;

    /**
     * Define is this item selected
     * @hidden
     */
    abstract _isSelectedOptionItem(selectedItem: OptionItem): boolean;

    /**
     * Emit select OptionItem
     * @hidden
     * */
    abstract _selectOptionItem(item: OptionItem): void;

    /** 
     * Define value as selected
     * @hidden
     * */
    abstract _setAsSelected(item: OptionItem[]): void;

    /** Is empty search field */
    get isEmptyValue(): boolean {
        return this.value.trim().length === 0;
    }

    /** write value for ControlValueAccessor */
    writeValue(value: any): void {
        if (!value) {
            return;
        }

        const selectedItems = Array.isArray(value) ? value : [value];
        this._setAsSelected(this._convertToOptionItems(selectedItems));
        super.writeValue(value);
    }

    /** @hidden
     * Close list
     * */
    close(event: MouseEvent = null, forceClose: boolean = false): void {
        if (event) {
            const target = event.target as HTMLInputElement;
            if (target && target.id === this.id) {
                return;
            }
        }

        if (this.isOpen && (forceClose || this.canClose)) {
            this.isOpen = false;
            this.openChange.next(this.isOpen);
            this.cd.markForCheck();
            this.onTouched();
        }
    }

    /** @hidden */
    searchTermChanged(text: string = this.value): void {
        const map = new Map();
        map.set('query', text);
        map.set('limit', 12);

        this.ds.match(map);
    }

    /** @hidden */
    showList(isOpen: boolean): void {
        if (this.isOpen !== isOpen) {
            this.isOpen = isOpen;
            this.onTouched();
            this.openChange.next(isOpen);
        }

        if (!this.isOpen) {
            this.searchTermChanged('');
        }

        this.cd.detectChanges();
    }

    /** @hidden */
    handleOptionItem(value: OptionItem): void {
        if (value) {
            this._selectOptionItem(value);
        }
    }

    /** @hidden */
    handlePressEnter(event: KeyboardEvent, value: OptionItem): void {
        if (!KeyUtil.isKeyCode(event, ENTER)) {
            return;
        }

        this.handleOptionItem(value);
    }

    /**
     * Handle Click on Button
     * @hidden
     */
    onPrimaryButtonClick(isOpen: boolean): void {
        if (!isOpen) {
            this.searchTermChanged('');
        }

        this.showList(!isOpen);
        if (this.isOpen) {
            this.listComponent.setItemActive(0);
        }
    }

    /**
     * Handle Keydown on Input
     * @hidden
     */
    onInputKeydownHandler(event: KeyboardEvent): void {
        if (this.readonly) {
            return;
        }

        if (KeyUtil.isKeyCode(event, DOWN_ARROW)) {
            event.preventDefault();

            if (event.altKey) {
                this.showList(true);
            }

            if (this.isOpen && this.listComponent) {
                this.listComponent.setItemActive(0);
            } else if (!this.isOpen) {
                this._chooseOtherItem(1);
            }
        } else if (KeyUtil.isKeyCode(event, UP_ARROW)) {
            event.preventDefault();

            this._chooseOtherItem(-1);
        } else if (KeyUtil.isKeyCode(event, ESCAPE)) {
            event.stopPropagation();

            this.showList(false);
        } else if (!event.ctrlKey && !KeyUtil.isKeyCode(event, this._nonOpeningKeys)) {
            this.showList(true);
            const acceptedKeys = !KeyUtil.isKeyCode(event, BACKSPACE)
                && !KeyUtil.isKeyType(event, 'alphabetical')
                && !KeyUtil.isKeyType(event, 'numeric');
            if (this.isEmptyValue && acceptedKeys) {
                this.listComponent?.setItemActive(0);
            }
        }
    }

    /** Method passed to list component */
    handleListFocusEscape(direction: FocusEscapeDirection): void {
        if (direction === 'up') {
            this.searchInputElement.nativeElement.focus();
        }
    }

    /** @hidden */
    protected get ds(): SelectDataSource<any> {
        return (<SelectDataSource<any>>this.dataSource);
    }

    /** @hidden
     * Method that picks other value moved from current one by offset, called only when select is closed */
    private _chooseOtherItem(offset: number): void {
        const activeValue: OptionItem = this._getSelectItemByValue(this.value);
        const index: number = this._optionItems.findIndex(value => value === activeValue);

        if (this._optionItems[index + offset]) {
            this.handleOptionItem(this._optionItems[index + offset]);
        }
    }

    /** @hidden */
    private _getSelectItemByValue(displayValue: string): OptionItem {
        return this._optionItems.find(value => value.label === displayValue);
    }

    /** @hidden */
    private _initializeDataSource(ds: FdpSelectDataSource<any>): void {
        this._optionItems = [];

        if (isDataSource(this.dataSource)) {
            (this.dataSource as SelectDataSource<any>).close();

            if (this._dsSubscription) {
                this._dsSubscription.unsubscribe();
                this._dsSubscription = null;
            }
        }
        // Convert whatever comes in as DataSource so we can work with it identically
        this._dataSource = this._openDataStream(ds);
    }

    /** @hidden */
    private _openDataStream(ds: FdpSelectDataSource<any>): SelectDataSource<any> {
        const initDataSource = this._toDataStream(ds);

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
            .subscribe(data => {
                this._optionItems = this._convertToOptionItems(data);
                this.stateChanges.next('initDataSource.open().');

                this.cd.markForCheck();
            });

        initDataSource.dataProvider.setLookupKey(this.lookupKey);
        const matchingBy: MatchingBy = {
            firstBy: this._displayFn
        };

        if (this.secondaryKey) {
            matchingBy.secondaryBy = this._secondaryFn;
        }

        initDataSource.dataProvider.setMatchingBy(matchingBy);
        initDataSource.dataProvider.setMatchingStrategy(this._matchingStrategy);

        // initial data fetch
        const map = new Map();
        map.set('query', '*');
        map.set('limit', 12);
        initDataSource.match(map);

        return initDataSource;
    }

    /** @hidden */
    private _toDataStream(ds: FdpSelectDataSource<any>): SelectDataSource<any> | undefined {
        if (isDataSource(ds)) {
            return ds as SelectDataSource<any>;
        } else if (Array.isArray(ds)) {
            // default implementation to work on top of arrays
            return new ArraySelectDataSource<any>(ds);
        } else if (isObservable(ds)) {
            return new ObservableSelectDataSource<any>(ds);
        }

        return undefined;
    }

    /** @hidden */
    private _initWindowResize(): void {
        this._getOptionsListWidth();

        if (!this.autoResize) {
            return;
        }

        fromEvent(window, 'resize')
            .pipe(takeUntil(this._destroyed))
            .subscribe(() => this._getOptionsListWidth());
    }

    /** @hidden */
    private _getOptionsListWidth(): void {
        const body = document.body;
        const rect = this._element
            .getBoundingClientRect();
        const scrollBarWidth = body.offsetWidth - body.clientWidth;
        this.maxWidth = (window.innerWidth - scrollBarWidth) - rect.left;
        this.minWidth = rect.width - 2;
    }

    /**
     * Convert original data to OptionItems Interface
     * @hidden
     */
    private _convertToOptionItems(items: any[]): OptionItem[] {
        const item = items[0];

        const elementTypeIsOptionItem = isOptionItem(item);
        if (elementTypeIsOptionItem) {
            return items as OptionItem[];
        }

        const elementTypeIsObject = isJsObject(item);
        if (elementTypeIsObject) {
            return this._convertObjectsToOptionItems(items);
        }

        const elementTypeIsString = isString(item);
        if (elementTypeIsString) {
            return this._convertPrimitiveToOptionItems(items);
        }

        return [];
    }

    /**
     * Convert data to OptionItems Interface
     * @hidden
     */
    private _convertObjectsToOptionItems(items: any[]): OptionItem[] {
        if (this.group && this.groupKey) {
            return this._convertObjectsToGroupOptionItems(items);
        } else if (this.showSecondaryText && this.secondaryKey) {
            return this._convertObjectsToSecondaryOptionItems(items);
        } else {
            return this._convertObjectsToDefaultOptionItems(items);
        }
    }

    /**
     * Convert object[] data to Group OptionItems Interface
     * @hidden
     */
    private _convertObjectsToGroupOptionItems<K>(items: K[]): OptionItem[] {
        const group: { [key: string]: K[] } = {};

        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const keyValue = item[this.groupKey];
            if (!keyValue) {
                continue;
            }

            if (!group[keyValue]) {
                group[keyValue] = [];
            }

            group[keyValue].push(item);
        }

        return Object.keys(group).map(key => {
            const selectItem: OptionItem = {
                label: key,
                value: null,
                isGroup: true
            };

            const currentGroup = group[key];

            if (this.showSecondaryText && this.secondaryKey) {
                selectItem.children = this._convertObjectsToSecondaryOptionItems(currentGroup);
            } else {
                selectItem.children = this._convertObjectsToDefaultOptionItems(currentGroup);
            }

            return selectItem;
        });
    }

    /**
     * Convert object[] data to Secondary OptionItems Interface
     * @hidden
     */
    private _convertObjectsToSecondaryOptionItems<K>(items: K[]): OptionItem[] {
        const selectItems: OptionItem[] = [];

        for (let i = 0; i < items.length; i++) {
            const value = items[i];
            selectItems.push({
                label: this.displayValue(value),
                secondaryText: this.objectGet(value, this.secondaryKey),
                value: value
            });
        }

        return selectItems;
    }

    /**
     * Convert Primitive data(Boolean, String, Number) to OptionItems Interface
     * @hidden
     */
    private _convertPrimitiveToOptionItems(items: any[]): OptionItem[] {
        const selectItems: OptionItem[] = [];

        for (let i = 0; i < items.length; i++) {
            const value = items[i];
            selectItems.push({ label: value, value: value });
        }

        return selectItems;
    }

    /**
     * Convert object[] to OptionItems Interface (Default)
     * @hidden
     */
    private _convertObjectsToDefaultOptionItems(items: any[]): OptionItem[] {
        const selectItems: OptionItem[] = [];

        for (let i = 0; i < items.length; i++) {
            const value = items[i];
            selectItems.push({
                label: this.displayValue(value),
                value: value
            });
        }

        return selectItems;
    }

    /** @hidden
     * Assign custom templates
     * */
    private _assignCustomTemplates(): void {
        this.customTemplates.forEach(template => {
            switch (template.getName()) {
                case '_optionItemTemplate':
                    this._optionItemTemplate = template.templateRef;
                    break;
                case '_groupItemTemplate':
                    this._groupItemTemplate = template.templateRef;
                    break;
                case '_secondaryItemTemplate':
                    this._secondaryItemTemplate = template.templateRef;
                    break;
                case '_selectedItemTemplate':
                    this._selectedItemTemplate = template.templateRef;
                    break;
            }
        });
    }
}
