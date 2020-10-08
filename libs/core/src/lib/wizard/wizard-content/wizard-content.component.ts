import { ChangeDetectionStrategy, Component, Input, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { WizardSize } from '../wizard-progress-bar/wizard-progress-bar.directive';

export type WizardContentBackground = 'solid' | 'list' | 'transparent';

@Component({
    selector: 'fd-wizard-content',
    templateUrl: './wizard-content.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class WizardContentComponent {
    /**
     * The type of wizard background ('solid', 'list', or 'transparent').
     */
    @Input()
    contentBackground: WizardContentBackground;

    /**
     * Size of the wizard progress bar.
     */
    @Input()
    size: WizardSize;

    /** @hidden */
    @ViewChild('contentTemplate')
    contentTemplate: TemplateRef<any>;
}
