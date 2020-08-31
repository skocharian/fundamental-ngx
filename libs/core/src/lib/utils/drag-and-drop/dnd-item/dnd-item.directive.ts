import { AfterContentInit, Directive, ElementRef, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { DragDrop, DragRef } from '@angular/cdk/drag-drop';
import { ElementChord, LinkPosition } from '../dnd-list/dnd-list.directive';
import { Subscription } from 'rxjs';

export interface ElementPosition {
    x: number;
    y: number;
}

@Directive({
    // tslint:disable-next-line:directive-selector
    selector: '[fd-dnd-item]',
    host: {
        class: 'fd-dnd-item'
    },
    providers: [
        DragDrop
    ]
})
export class DndItemDirective implements AfterContentInit, OnDestroy {
    /** Event thrown when the element is moved by 1px */
    @Output()
    readonly moved = new EventEmitter<ElementPosition>();

    /** Event thrown when the element is released */
    @Output()
    readonly released = new EventEmitter<void>();

    /** Event thrown when the element is started to be dragged */
    @Output()
    readonly started = new EventEmitter<void>();

    /**
     *  Defines if the item is prevented from being moved by other elements.
     * So nothing can be placed just before and just after it
     */
    @Input()
    stickInPlace = false;

    /** Defines if element is draggable */
    @Input()
    set draggable(draggable: boolean) {
        this._draggable = draggable;
        this.changeCDKDragState();
    }

    /** Class added to element, when it's dragged. */
    @Input()
    classWhenElementDragged = 'fd-dnd-on-drag';

    /** Defines if every element in list is draggable */
    listDraggable = true;

    /** @hidden
     * Drag reference, object created from DND CDK Service
     */
    private _dragRef: DragRef;

    /** @hidden */
    private _draggable = true;

    /** @hidden */
    private _subscriptions = new Subscription();

    /** @hidden */
    private _placeholderElement: HTMLElement;

    /** @hidden */
    private _lineElement: HTMLElement;

    /** @hidden */
    private _replaceIndicator: HTMLElement;

    /** @hidden */
    constructor(public element: ElementRef, private _dragDrop: DragDrop) {}

    /** @hidden */
    getElementCoordinates(isBefore: boolean, gridMode: boolean): ElementChord {
        /** Takes distance from the beginning of window page */
        const rect = <DOMRect>this.element.nativeElement.getBoundingClientRect();

        const position: LinkPosition = isBefore ? 'before' : 'after';

        /** Depending on the position, gets the left or right side of element */
        const x = rect.left + ((isBefore && gridMode) ? this.element.nativeElement.offsetWidth : 0);

        /** Vertically distance is counted by distance from top of the side + half of the element height */
        return {
            x: x,
            position: position,
            y: rect.top + this.element.nativeElement.offsetHeight / 2,
            stickToPosition: this.stickInPlace
        };
    }

    /** @hidden */
    ngAfterContentInit(): void {
        this._setCDKDrag();
    }

    /** @hidden */
    ngOnDestroy(): void {
        this._subscriptions.unsubscribe();
    }

    /** @hidden */
    onCdkMove(position: ElementPosition): void {
        this.moved.emit(position);
    }

    /** @hidden */
    onCdkDragReleased(): void {
        /** Remove class which is added, when element is dragged */
        this.element.nativeElement.classList.remove(this.classWhenElementDragged);
        this.released.emit();

        /** Resets the position of element. */
        this._dragRef.reset();

        /** Removes placeholder element */
        this.removePlaceholder();
    }

    /** @hidden */
    onCdkDragStart(): void {
        /** Adds class */
        this.element.nativeElement.classList.add(this.classWhenElementDragged);
        if (!this._placeholderElement) {
            this.createPlaceHolder();
        }
        this.started.emit();
    }

    /** @hidden */
    removePlaceholder(): void {
        if (this._placeholderElement && this._placeholderElement.parentNode) {
            // IE11 workaround
            this._placeholderElement.parentNode.removeChild(this._placeholderElement);
            this._placeholderElement = null;
        }
    }

    /** @hidden */
    removeLine(): void {
        if (this._lineElement && this._lineElement.parentNode) {
            // IE11 workaround
            this._lineElement.parentNode.removeChild(this._lineElement);
            this._lineElement = null;
        }
    }

    /** @hidden */
    removeReplacement(): void {
        if (this._replaceIndicator && this._replaceIndicator.parentNode) {
            // IE11 workaround
            this._replaceIndicator.parentNode.removeChild(this._replaceIndicator);
            this._replaceIndicator = null;
        }
    }

    /** @hidden */
    createReplaceIndicator(): void {
        this._replaceIndicator = document.createElement('DIV');
        this._replaceIndicator.classList.add('fd-replace-indicator');
        this.element.nativeElement.appendChild(this._replaceIndicator);
    }

    /** @hidden */
    createLine(position: LinkPosition, gridMode: boolean): void {
        /** Creating of line element */
        this._lineElement = document.createElement('div');
        this._lineElement.classList.add('drop-area__line');

        if (gridMode) {
            this._lineElement.classList.add('drop-area__line--vertical');
        } else {
            this._lineElement.classList.add('drop-area__line--horizontal');
        }
        if (position === 'after') {
            this._lineElement.classList.add('after');
        }
        if (position === 'before') {
            this._lineElement.classList.add('before');
        }

        /** Putting element to the container */
        this.element.nativeElement.appendChild(this._lineElement);
    }

    /** @hidden */
    changeCDKDragState(): void {
        if (this._dragRef) {
            this._dragRef.disabled = !(this._draggable && this.listDraggable);
        }
    }

    /** @hidden */
    private createPlaceHolder(): void {
        /** Cloning container element */
        const clone = this.element.nativeElement.cloneNode(true);

        /** Taking cloned element reference */
        this._placeholderElement = clone.firstChild.parentElement;

        this._placeholderElement.classList.add('fd-dnd-placeholder');
        this._setPlaceholderStyles();

        /** Including element to the container */
        this.element.nativeElement.after(clone);
    }

    /** @hidden */
    private _setPlaceholderStyles(): void {
        const offset = this._getOffsetToParent(this.element.nativeElement);

        this._placeholderElement.style.top = offset.y + 'px';
        this._placeholderElement.style.left = offset.x + 'px';
        this._placeholderElement.style.position = 'absolute';
        this._placeholderElement.style.zIndex = '0';
        this._placeholderElement.style.opacity = '0.3';

        this._placeholderElement.style.width = this.element.nativeElement.offsetWidth + 'px';
        this._placeholderElement.style.height = this.element.nativeElement.offsetHeight + 'px';
    }

    /** @hidden */
    private _getOffsetToParent(element: Element): { x: number, y: number } {
        const parentElement = element.parentElement;

        const parentTop = parentElement.getBoundingClientRect().top;
        const parentLeft = parentElement.getBoundingClientRect().left;

        return {
            x: Math.abs(element.getBoundingClientRect().left - parentLeft),
            y: Math.abs(element.getBoundingClientRect().top - parentTop)
        }

    }

    /** @hidden */
    private _setCDKDrag(): void {
        this._dragRef = this._dragDrop.createDrag(this.element);
        this._dragRef.disabled = !this._draggable;
        this._subscriptions.add(
            this._dragRef.moved.subscribe(event => this.onCdkMove(event.pointerPosition))
        );
        this._subscriptions.add(
            this._dragRef.released.subscribe(() => this.onCdkDragReleased())
        )
        this._subscriptions.add(
            this._dragRef.started.subscribe(() => this.onCdkDragStart())
        );
    }
}
