import { TemplateRef } from '@angular/core';

import { FormFieldControl } from './form-control';
import { LabelLayout, Column, FormZone, HintPlacement } from './form-options';

/**
 * FormField base class.
 *
 * This class is used to create form field components.
 *
 */
export abstract class FormField {
    /**
     * Form field id
     */
    id: string;
    /**
     * Rank is used for ordering.
     * Than lower number then higher priority
     */
    rank: number;
    /**
     * Form field template reference
     */
    renderer: TemplateRef<any>;
    /**
     * Form field custom width in columns must be between 1 - 12
     */
    columns: Column;
    /**
     * Indicates when "columns" should be ignored
     */
    fluid: boolean;
    /**
     * Indicates in which FormZone a form field should be rendered
     */
    zone: FormZone;
    /**
     * Translations template reference
     */
    i18Strings: TemplateRef<any>;
    /**
     * Indicates if field is editable
     */
    editable: boolean;
    /**
     * Indicates when form field label should not be displayed
     */
    noLabelLayout: boolean;
    /**
     * Define form field label placement
     */
    labelLayout: LabelLayout;
    /**
     * Define hint placement
     */
    hintPlacement: HintPlacement;
    /**
     * A reference to the underlying FormFieldControl.
     */
    control: FormFieldControl<any> | null;
    /**
     * Register underlying form control
     */
    registerFormFieldControl: (control: FormFieldControl<any>) => void;
    /**
     * Unregister underlying form control
     */
    unregisterFormFieldControl: (control: FormFieldControl<any>) => void;
}
