import { CommonModule } from '@angular/common';
import { By } from '@angular/platform-browser';
import { Component, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DynamicComponentService, FormModule, MenuKeyboardService, RtlService } from '@fundamental-ngx/core';

import { isOptionItem } from '../../../../domain/data-model';
import { DATA_PROVIDERS, DataProvider } from '../../../../domain/data-source';
import { FdpFormGroupModule } from '../../form-group/fdp-form.module';
import { ContentDensity } from '../../form-control';
import { PlatformSelectModule } from '../select.module';
import { SelectComponent } from '../select/select.component';
import { FdpSelectionChangeEvent } from '../commons/base-select';

@Component({
    selector: 'fdp-select-test',
    template: `
        <fdp-form-group>
            <fdp-form-field id="standard" placeholder="Type some text..." label="Standard" zone="zLeft" rank="4">
                <fdp-select
                    name="standard"
                    displayKey="name"
                    [autoResize]="autoResize"
                    [group]="group"
                    [groupKey]="groupKey"
                    [showSecondaryText]="showSecondaryText"
                    [secondaryKey]="secondaryKey"
                    [contentDensity]="contentDensity"
                    [dataSource]="dataSource"
                    [maxHeight]="maxHeight"
                    (selectionChange)="onSelect($event)"
                ></fdp-select>
            </fdp-form-field>
        </fdp-form-group>
    `
})
class SelectStandardComponent {
    @ViewChild(SelectComponent)
    select: SelectComponent;
    dataSource = [
        { name: 'Apple', type: 'Fruits' },
        { name: 'Banana', type: 'Fruits' },
        { name: 'Pineapple', type: 'Fruits' },
        { name: 'Strawberry', type: 'Fruits' },
        { name: 'Broccoli', type: 'Vegetables' },
        { name: 'Carrot', type: 'Vegetables' },
        { name: 'Jalapeño', type: 'Vegetables' },
        { name: 'Spinach', type: 'Vegetables' }
    ];
    selectedItem = null;
    maxHeight: string;
    autoResize = false;
    contentDensity: ContentDensity = 'cozy';
    group = false;
    groupKey = 'type';
    showSecondaryText = false;
    secondaryKey = 'type';

    onSelect(item: FdpSelectionChangeEvent): void {
        this.selectedItem = item;
    }
}

describe('Select Component default values', () => {
    let component: SelectStandardComponent;
    let fixture: ComponentFixture<SelectStandardComponent>;
    let select: SelectComponent;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [FdpFormGroupModule, FormModule, FormsModule, ReactiveFormsModule, CommonModule, PlatformSelectModule],
            declarations: [SelectStandardComponent, SelectComponent],
            providers: [
                DynamicComponentService,
                MenuKeyboardService,
                RtlService,
                { provide: DATA_PROVIDERS, useClass: DataProvider as any }
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SelectStandardComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        select = component.select;
    });

    it('Select items should be converted to OptionItem', () => {
        const item = select._optionItems[0];

        expect(isOptionItem(item)).toBeTruthy();
    });

    it('Select should have compact display', () => {
        component.contentDensity = 'compact';

        fixture.detectChanges();

        const compact = fixture.debugElement.queryAll(By.css('.fd-select--compact'));

        expect(compact.length).toBeGreaterThan(0);
    });

    it('max height should set the select popover height', () => {
        expect(component.maxHeight).toBeFalsy();
        component.maxHeight = '320px';
        fixture.detectChanges();
        expect(select.maxHeight).toBe('320px');
    });
});
