import { Component, ElementRef, ViewChild } from '@angular/core';

@Component({
    selector: 'fd-dynamic-page-tabs-example',
    templateUrl: './dynamic-page-tabs-example.component.html',
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
export class DynamicPageTabsExampleComponent {

    @ViewChild('overlay')
    overlay: ElementRef<HTMLElement>;

    fullscreen = false;

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
