import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { LayoutService } from '../../services/layout.service';
import { SvgService } from '../../services/svg/svg.service';
import { DisplayMergedRunComponent } from './display-merged-run.component';
import { MergeService } from './merge.service';

describe('DisplayMergedRunComponent', () => {
    window.ResizeObserver =
        window.ResizeObserver ||
        jest.fn().mockImplementation(() => ({
            disconnect: jest.fn(),
            observe: jest.fn(),
            unobserve: jest.fn(),
        }));
    let component: DisplayMergedRunComponent;
    let fixture: ComponentFixture<DisplayMergedRunComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [DisplayMergedRunComponent],
            providers: [
                {
                    provide: MergeService,
                    useValue: {
                        getMergedRun$: jest.fn().mockReturnValue(of([])),
                    },
                },
                { provide: LayoutService, useValue: {} },
                { provide: SvgService, useValue: {} },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(DisplayMergedRunComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
