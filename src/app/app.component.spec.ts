import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { AppComponent } from './app.component';
import { DisplayService } from './services/display.service';
import { ParserService } from './services/parser.service';
import { UploadService } from './services/upload/upload.service';

describe('AppComponent', () => {
    const mockUploadService = {
        get upload$(): any {
            return {
                subscribe: () => ({
                    unsubscribe: jest.fn(),
                }),
            };
        },
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [RouterTestingModule],
            declarations: [AppComponent],
            providers: [
                { provide: ParserService, useValue: {} },
                { provide: DisplayService, useValue: {} },
                { provide: UploadService, useValue: mockUploadService },
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        }).compileComponents();
    });

    it('should create the app', () => {
        const fixture = TestBed.createComponent(AppComponent);
        const app = fixture.componentInstance;
        expect(app).toBeTruthy();
    });
});
