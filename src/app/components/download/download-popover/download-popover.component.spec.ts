import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DownloadPopoverComponent } from './download-popover.component';

describe('DownloadPopoverComponent', () => {
    let component: DownloadPopoverComponent;
    let fixture: ComponentFixture<DownloadPopoverComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [DownloadPopoverComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(DownloadPopoverComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
