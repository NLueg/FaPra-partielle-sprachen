import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';

import { AppComponent } from './app.component';
import { CanvasComponent } from './components/canvas/canvas.component';
import { ColorComponent } from './components/color/color.component';
import { DisplayComponent } from './components/display/display.component';
import { DisplayMergedRunComponent } from './components/display-merged-run/display-merged-run.component';
import { DownloadComponent } from './components/download/download.component';
import { DownloadPopoverComponent } from './components/download/download-popover/download-popover.component';
import { FooterComponent } from './components/footer/footer.component';
import { SourceFileTextareaComponent } from './components/source-file-textarea/source-file-textarea.component';
import { TemplateButtonComponent } from './components/template-button/template-button.component';

@NgModule({
    declarations: [
        AppComponent,
        DisplayComponent,
        FooterComponent,
        TemplateButtonComponent,
        SourceFileTextareaComponent,
        DisplayMergedRunComponent,
        DownloadComponent,
        CanvasComponent,
        ColorComponent,
        DownloadPopoverComponent,
    ],
    imports: [
        BrowserModule,
        FlexLayoutModule,
        BrowserAnimationsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatTooltipModule,
        MatDividerModule,
        ReactiveFormsModule,
        ToastrModule.forRoot({
            preventDuplicates: true,
        }),
        MatTabsModule,
        MatRadioModule,
        MatCheckboxModule,
        FormsModule,
        MatDialogModule,
    ],
    bootstrap: [AppComponent],
})
export class AppModule {}
