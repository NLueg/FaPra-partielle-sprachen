import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    selector: 'app-template-button',
    templateUrl: './template-button.component.html',
    styleUrls: ['./template-button.component.scss'],
})
export class TemplateButtonComponent {
    @Input() buttonText: string | undefined;
    @Input() buttonIcon: string | undefined;
    @Output() buttonAction: EventEmitter<any> = new EventEmitter();
    @Output() dropAction: EventEmitter<any> = new EventEmitter();

    prevent(e: Event): void {
        e.preventDefault();
        e.stopPropagation();
    }

    hoverStart(e: MouseEvent): void {
        this.prevent(e);
        const target = e.target as HTMLElement;
        target.classList.add('mouse-hover');
    }

    hoverEnd(e: MouseEvent): void {
        this.prevent(e);
        const target = e.target as HTMLElement;
        target.classList.remove('mouse-hover');
    }

    processMouseClick(e: MouseEvent): void {
        if (this.buttonAction) {
            this.buttonAction.emit();
        }
    }

    processDrop(e: DragEvent): void {
        this.prevent(e);
        const target = e.target as HTMLElement;
        target.classList.remove('drag-hover');

        if (this.dropAction) {
            this.dropAction.emit(e);
        }
    }

    dragStart(e: DragEvent): void {
        this.prevent(e);
        const target = e.target as HTMLElement;
        target.classList.add('drag-hover');
    }

    dragEnd(e: DragEvent): void {
        this.prevent(e);
        const target = e.target as HTMLElement;
        target.classList.remove('drag-hover');
    }
}
