import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    Host,
    Inject,
    OnInit,
    Optional,
    Self,
    SkipSelf,
    TemplateRef,
    ViewChild,
    ViewEncapsulation,
    Input,
    EventEmitter,
    Output,
    AfterViewChecked
} from '@angular/core';
import { NgControl, NgForm } from '@angular/forms';

import { DynamicComponentService, FdSelectChange, MobileModeConfig, SelectControlState, PopoverFillMode } from '@fundamental-ngx/core';
import { SelectDataSource, DATA_PROVIDERS, DataProvider } from '../../../../domain/data-source';
import { OptionItem } from '../../../../domain';
import { FormField } from '../../form-field';
import { FormFieldControl } from '../../form-control';
import { BaseSelect, FdpSelectionChangeEvent } from '../commons/base-select';
import { SelectConfig } from '../select.config';

@Component({
    selector: 'fdp-select',
    templateUrl: './select.component.html',
    styleUrls: ['./select.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [{ provide: FormFieldControl, useExisting: SelectComponent, multi: true }]
})
export class SelectComponent extends BaseSelect implements OnInit, AfterViewInit, AfterViewChecked {

    /** Whether the select component is disabled. */
    @Input()
    state: SelectControlState = null;

    /** Whether the select component should be displayed in mobile mode. */
    @Input()
    mobile = false;

    /** Whether the select component is disabled. */
    @Input()
    stateMessage: string;

    /** Whether the select component is disabled. */
    @Input()
    disabled = false;

    /** Whether the select component is readonly. */
    @Input()
    readonly = false;

    /** Placeholder for the select. Appears in the triggerbox if no option is selected. */
    @Input()
    placeholder: string;

    /** Whether the select is in compact mode. */
    @Input()
    compact = false;

    /** @deprecated
     * it is handled internally by controlTemplate != null|undefined is
     * Equal as extendedBodyTemplate as true.
     * Whether option components contain more than basic text. */
    @Input()
    extendedBodyTemplate = false;

    /** Max height of the popover. Any overflowing elements will
     *  be accessible through scrolling. */
    @Input()
    maxHeight: string;

    /** Glyph to add icon in the select component. */
    @Input()
    glyph = 'slim-arrow-down';

    /** Whether close the popover on outside click. */
    @Input()
    closeOnOutsideClick = true;

    /**
     * Preset options for the Select body width, whatever is chosen, the body has a 600px limit.
     * * `at-least` will apply a minimum width to the body equivalent to the width of the control. - Default
     * * `equal` will apply a width to the body equivalent to the width of the control.
     * * 'fit-content' will apply width needed to properly display items inside, independent of control.
     */
    @Input()
    fillControlMode: PopoverFillMode = 'at-least';

    /** Custom template used to build control body. */
    @Input()
    controlTemplate: TemplateRef<any>;

    /** The element to which the popover should be appended. */
    @Input()
    appendTo: ElementRef;

    /**
     * If the option should be unselected and value changed to undefined, when the current value is
     * not presented in option array. Switching it off can be handy, when there is some delay between providing
     * possible options and chosen value.
     */
    @Input()
    unselectMissingOption = true;

    /** Time to wait in milliseconds after the last keydown
     *  before focusing or selecting option based on alphanumeric keys. */
    @Input()
    typeaheadDebounceInterval = 250;

    /** Binds to control aria-labelledBy attribute */
    @Input()
    ariaLabelledBy: string = null;

    /** Sets control aria-label attribute value */
    @Input()
    ariaLabel: string = null;

    /** Select Input Mobile Configuration */
    @Input()
    mobileConfig: MobileModeConfig = { hasCloseButton: true };

    /**
     * String rendered as first value in the popup which let the user to make 'no selection' from
     * available list of values. When this option is active and use make this selection we save a
     * NULL value
     */
    @Input()
    noValueLabel: string;

    /** Turns on/off Adjustable Width feature */
    @Input()
    autoResize = false;

   /**
   * Directly sets value to the component that at the ends up at writeValue as well fires
   * change detections
   *
   */
    @Input()
    get value(): any {
        return this._value;
    }

    set value(newValue: any) {
        if (newValue !== this._value) {
            this._value = newValue;
            this.onChange(newValue);
            this.onTouched();
            this.valueChange.emit(newValue);
            this.cd.markForCheck();
        }
    }

    /** Event emitted when the selected value of the select changes. */
    @Output()
    readonly valueChange: EventEmitter<FdSelectChange> = new EventEmitter<FdSelectChange>();

    /** @hidden */
    @ViewChild('listTemplate')
    listTemplate: TemplateRef<any>;

    /** @hidden */
    selected?: OptionItem;


    /** @hidden */
    get isGroup(): boolean {
        return !!(this.group && this.groupKey);
    }

    constructor(
        readonly cd: ChangeDetectorRef,
        readonly elementRef: ElementRef,
        @Optional() @Self() readonly ngControl: NgControl,
        @Optional() @Self() readonly ngForm: NgForm,
        readonly _dynamicComponentService: DynamicComponentService,
        @Optional() @Inject(DATA_PROVIDERS) private providers: Map<string, DataProvider<any>>,
        readonly _selectConfig: SelectConfig,
        @Optional() @SkipSelf() @Host() formField: FormField,
        @Optional() @SkipSelf() @Host() formControl: FormFieldControl<any>
    ) {
        super(cd, elementRef, ngControl, ngForm, _selectConfig, formField, formControl);
    }

    /** @hidden */
    ngOnInit(): void {
        const providers = this.providers ?.size === 0 ? this._selectConfig.providers : this.providers;
        // if we have both prefer dataSource
        if (!this.dataSource && this.entityClass && providers.has(this.entityClass)) {
            this.dataSource = new SelectDataSource(providers.get(this.entityClass));
        }
    }

    /** @hidden */
    ngAfterViewInit(): void {
        super.ngAfterViewInit();
    }

    /** @hidden */
    ngAfterViewChecked(): void {
        this._cd.detectChanges();
    }

    /** 
     * Method to emit change event
     * @hidden
     */
    _emitChangeEvent<T>(modelValue: T): void {
        const event = new FdpSelectionChangeEvent(this, modelValue);

        this.selectionChange.emit(event);
    }

    /** 
     * Method to set selected item
     * @hidden
     */
    _selectOptionItem(item: OptionItem): void {
        if (this.mobile) {
            this.selected = item;
            this.value = item.label;
            this.cd.detectChanges();

            return;
        }

        this.value = item.label;
        this._checkAndUpdate(item);
        this.showList(false);
    }

    /**
     * Method to set as selected
     *  @hidden
     */
    _setAsSelected(item: OptionItem[]): void {
        const selectedItem = item[0];

        if (this._isSelectedOptionItem(selectedItem)) {
            return;
        }

        this.selected = this.isGroup ? selectedItem.children ? selectedItem.children[0] : selectedItem : selectedItem;
        this.value = this.displayValue(this.selected);
    }

    /** 
     * Define is selected item selected
     * @hidden
     */
    _isSelectedOptionItem(selectedItem: any): boolean {
        return this.lookupKey && this.lookupValue(this.selected) === this.lookupValue(selectedItem) ||
            this.displayValue(this.selected) === this.displayValue(selectedItem);
    }

    /**
     * Define is selected item selected by display value
     * @hidden
     */
    _isSelectedOptionItemByDisplayValue(selectedItem: any): boolean {
        return this.selected && this.selected.label === selectedItem;
    }

    /** @hidden */
    _onSelection(value: any): void {
        this.value = value;
        this._updateModel(this.value);
        this.onChange(this.value);
        this.onTouched();
        this.cd.markForCheck();
    }

    /** 
     * if not selected update model
     *  @hidden
     */
    private _checkAndUpdate(modelValue: OptionItem): void {
        if (this._isSelectedOptionItem(modelValue)) {
            return;
        }

        const optionItem = this._getSelectedOptionItem(this.value);

        this._updateModel(optionItem ? optionItem.value : this.value);
    }

    /**
     * Update model
     *  @hidden
     */
    private _updateModel(value: any): void {
        // setting value, it will call setValue()
        this.value = value;

        this._emitChangeEvent(value ? value : null);
    }

    /** @hidden */
    private _getSelectedOptionItem(text: string): OptionItem | undefined {
        if (!this.isGroup) {
            return this._optionItems.find(item => item.label === text);
        }

        return this._optionItems
            .reduce((result: OptionItem[], item: OptionItem) => {
                result.push(...item.children);

                return result;
            }, [])
            .find(item => item.label === text);
    }
}
