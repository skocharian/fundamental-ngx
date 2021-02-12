import { Component, ElementRef, ViewChild } from '@angular/core';
import { DynamicPageResponsiveSize } from '@fundamental-ngx/core';

@Component({
    selector: 'fd-dynamic-page-responsive-example',
    templateUrl: './dynamic-page-responsive-example.component.html',
    styleUrls: ['./dynamic-page-responsive-example.component.scss'],
    styles: [
            `
            .overlay {
                height: 100%;
                width: 0;
                position: fixed;
                z-index: 10;
                top: 0;
                left: 0;
                background-color: rgba(0, 0, 0, 0.8);
                overflow-x: hidden;
                display: flex;
                justify-content: center;
            }

            .overlay-content {
                width: 100%;
            }
        `
    ]
})
export class DynamicPageResponsiveExampleComponent {
    @ViewChild('overlay')
    overlay: ElementRef<HTMLElement>;

    fullscreen = false;

    pageTitle = 'Balenciaga Tripple S Trainers';

    onCollapseChange(): void {
        console.log('collapse changed');
    }

    resizeClicked(event: Event): void {
        event.stopPropagation();
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
