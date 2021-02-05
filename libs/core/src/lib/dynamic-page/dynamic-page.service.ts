import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class DynamicPageService {
    collapsed = new BehaviorSubject<boolean>(false);
    pinned = new BehaviorSubject<boolean>(false);

    toggleCollapsed(): void {
        this.collapsed.next(!this.collapsed.value);
    }
}
