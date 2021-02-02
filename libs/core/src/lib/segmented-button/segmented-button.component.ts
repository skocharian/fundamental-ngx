import {
    AfterContentInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChildren,
    forwardRef,
    HostBinding,
    Input,
    QueryList,
    ViewEncapsulation
} from '@angular/core';
import { ButtonComponent } from '../button/button.component';
import { filter, startWith, takeUntil, tap } from 'rxjs/operators';
import { Subject, merge, fromEvent } from 'rxjs';
import { KeyUtil } from '../utils/functions';
import { ENTER, SPACE } from '@angular/cdk/keycodes';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export const isSelectedClass = 'is-selected';
export const isDisabledClass = 'is-disabled';

/**
 * Container for grouped buttons.
 *
 * ```html
 * <fd-segmented-button [(ngModel)]="value">
 *     <button fd-button value="first">Button</button>
 *     <button fd-button value="second">Button</button>
 *     <button fd-button value="third">Button</button>
 * </fd-segmented-button>
 * ```
 */
@Component({
    selector: 'fd-segmented-button',
    templateUrl: './segmented-button.component.html',
    styleUrls: ['./segmented-button.component.scss'],
    host: {
        role: 'group'
    },
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => SegmentedButtonComponent),
            multi: true
        }
    ],
})
export class SegmentedButtonComponent implements AfterContentInit, ControlValueAccessor {
    /** Whether segmented button is on toggle mode, which allows to toggle more than 1 button */
    @Input()
    toggle = false;

    /** @hidden */
    @HostBinding('class.fd-segmented-button')
    fdSegmentedButtonClass = true;

    /** @hidden */
    @ContentChildren(ButtonComponent)
    _buttons: QueryList<ButtonComponent>;

    private _currentValue: string | string[];

    private _isDisabled = false;

    /** An RxJS Subject that will kill the data stream upon component’s destruction (for unsubscribing)  */
    private readonly _onDestroy$ = new Subject<void>();

    /** An RxJS Subject that will kill the data stream upon queryList changes (for unsubscribing)  */
    private readonly _onRefresh$: Subject<void> = new Subject<void>();

    /** @hidden */
    onChange: any = () => {};

    /** @hidden */
    onTouched: any = () => {};

    constructor(
       private _changeDetRef: ChangeDetectorRef
    ) {}

    /** @hidden */
    ngAfterContentInit(): void {
        this._listenToButtonChanges();
        this._setInitialState();
    }

    /** @hidden */
    writeValue(values: string[] | string): void {
        this._currentValue = values;
        this._pickButtonsByValues(values);
    }

    /**
     * @hidden
     * @param fn User defined function that handles the *onChange* event of the SegmentedButtons.
     */
    registerOnChange(fn): void {
        this.onChange = fn;
    }

    /**
     * @hidden
     * @param fn User defined function that handles the *onTouch* event of the SegmentedButtons.
     */
    registerOnTouched(fn): void {
        this.onTouched = fn;
    }

    /**
     * @hidden
     * @param isDisabled Sets the value of the *disabled* property of the SegmentedButtons.
     */
    setDisabledState(isDisabled: boolean): void {
        this._isDisabled = isDisabled;
        this._toggleDisableButtons(isDisabled);
        this._changeDetRef.detectChanges();
    }

    /** @hidden */
    private _setInitialState(): void {
        this._toggleDisableButtons(this._isDisabled);
        this._pickButtonsByValues(this._currentValue);
    }

    /** @hidden */
    private _listenToButtonChanges(): void {
        this._buttons.changes.pipe(startWith(1))
            .subscribe(_ => {
                this._onRefresh$.next();
                this._buttons.forEach(button => this._listenToTriggerEvents(button))
            })
        ;
    }

    /** @hidden */
    private _listenToTriggerEvents(buttonComponent: ButtonComponent): void {
        const htmlElement = buttonComponent.elementRef().nativeElement;

        const refresh$ = merge(this._onDestroy$, this._onRefresh$);

        const triggerEvents = merge(
            fromEvent(htmlElement, 'click'),
            fromEvent(htmlElement, 'keydown')
                .pipe(
                    filter(event => KeyUtil.isKeyCode(<KeyboardEvent>event, [ENTER, SPACE])),
                    tap(event => (<KeyboardEvent>event).preventDefault())
                )
        )

        triggerEvents.pipe(takeUntil(refresh$)).subscribe(_ => this._handleTriggerOnButton(buttonComponent));
    }

    /** @hidden */
    private _handleTriggerOnButton(buttonComponent: ButtonComponent): void {
        if (!this._isButtonDisabled(buttonComponent)) {

            if (!this._isButtonSelected(buttonComponent) && !this.toggle) {
                this._buttons.forEach(button => this._deselectButton(button));
                this._selectButton(buttonComponent)
            }

            if (this.toggle) {
                this._toggleButton(buttonComponent);
            }

            this.onChange(this._getValuesBySelected());
            this._currentValue = this._getValuesBySelected();
        }
    }

    /** @hidden */
    private _toggleButton(buttonComponent: ButtonComponent): void {
        if (this._isButtonSelected(buttonComponent)) {
            this._deselectButton(buttonComponent);
        } else {
            this._selectButton(buttonComponent);
        }
    }

    /** @hidden */
    private _pickButtonsByValues(values: string | string[]): void {
        if (!this._buttons) {
            return;
        }
        this._buttons.forEach(button => this._deselectButton(button));
        this._getButtonsByValues(values).forEach(button => this._selectButton(button));
    }

    /** @hidden */
    private _getButtonsByValues(values: string | string[]): ButtonComponent[] {
        if (!values) {
            return [];
        }

        if (typeof values === 'string') {
            return this._buttons.filter(button => this._getButtonValue(button) === values)
        } else {
            return this._buttons
                .filter(button =>
                    !!values.find(value => this._getButtonValue(button) === value)
                );
        }
    }

    /** @hidden */
    private _selectButton(buttonComponent: ButtonComponent): void {
        buttonComponent.elementRef().nativeElement.classList.add(isSelectedClass);
        this._changeDetRef.detectChanges();
    }

    /** @hidden */
    private _deselectButton(buttonComponent: ButtonComponent): void {
        buttonComponent.elementRef().nativeElement.classList.remove(isSelectedClass);
        this._changeDetRef.detectChanges();
    }

    /** @hidden */
    private _isButtonSelected(buttonComponent: ButtonComponent): boolean {
        return buttonComponent.elementRef().nativeElement.classList.contains(isSelectedClass);
    }

    /** @hidden */
    private _isButtonDisabled(buttonComponent: ButtonComponent): boolean {
        return buttonComponent.elementRef().nativeElement.classList.contains(isDisabledClass);
    }

    /** @hidden */
    private _toggleDisableButtons(disable: boolean): void {
        if (!this._buttons) {
            return;
        }

        if (disable) {
            this._buttons.forEach(button => button.elementRef().nativeElement.setAttribute('disabled', true));
        } else {
            this._buttons.forEach(button => button.elementRef().nativeElement.removeAttribute('disabled'));
        }
    }

    /** @hidden */
    private _getButtonValue(buttonComponent: ButtonComponent): string {
        return buttonComponent.elementRef().nativeElement.value;
    }

    /** @hidden
     * Returns values depending on selected state of buttons
     */
    private _getValuesBySelected(): string[] | string {
        if (!this._buttons) {
            return [];
        }

        const resButtons = this._buttons
            .filter(button => this._isButtonSelected(button))
            .map(button => this._getButtonValue(button))
        ;

        if (!this.toggle) {
            return resButtons.length === 1 ? resButtons[0] : null
        } else {
            return resButtons
        }
    }
}
