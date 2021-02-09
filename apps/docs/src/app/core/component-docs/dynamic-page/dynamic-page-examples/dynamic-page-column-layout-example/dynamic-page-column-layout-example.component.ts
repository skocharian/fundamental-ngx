import { Component, ElementRef, ViewChild } from '@angular/core';
import { DynamicPageComponent } from '@fundamental-ngx/core';

@Component({
    selector: 'fd-dynamic-page-column-layout-example',
    templateUrl: './dynamic-page-column-layout-example.component.html',
    styles: [
            `
            .overlay {
                height: 100%;
                width: 0;
                position: fixed;
                z-index: 10;
                top: 0;
                left: 0;
                background-color: rgb(255, 255, 255);
                overflow-x: hidden;
            }

            .overlay-content {
                width: 100%;
            }
        `
    ]
})
export class DynamicPageColumnLayoutExampleComponent {

    @ViewChild('overlay')
    overlay: ElementRef<HTMLElement>;

    fullscreen = false;

    @ViewChild(DynamicPageComponent)
    dynamicPageComponent: DynamicPageComponent

    /**
     * documentation related property
     * sets the initial layout of the component to 'OneColumnStartFullScreen'
     * sets a new layout for the component
     */
    localLayout = 'OneColumnStartFullScreen';

    /**
     * this function is reacting to events (button clicks) and
     * updates the local property which sets a new layout for the component.
     * Available values for the layouts include:
     * 'OneColumnStartFullScreen' | 'OneColumnMidFullScreen' | 'OneColumnEndFullScreen' |
     * 'TwoColumnsStartExpanded' | 'TwoColumnsMidExpanded' | 'TwoColumnsEndExpanded' |
     * 'ThreeColumnsMidExpanded' | 'ThreeColumnsEndExpanded' | 'ThreeColumnsStartMinimized' |
     * 'ThreeColumnsEndMinimized';
     */
    changeLayout(newValue: string): void {
        this.localLayout = newValue;
        this.dynamicPageComponent.refreshSize();
    }

    openPage(): void {
        this.fullscreen = true;
        this.overlay.nativeElement.style.width = '100%';
        document.getElementById('page-content').style.overflowY = 'hidden'; // hide the underlying page scrollbars
    }

    closePage(event: Event): void {
        event.stopPropagation();
        this.fullscreen = false;
        this.overlay.nativeElement.style.width = '0%';
        document.getElementById('page-content').style.overflowY = 'auto';
    }
}
