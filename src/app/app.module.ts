import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';

import { AppComponent } from './app.component';
import { DisplayComponent } from './components/display/display.component';
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
    ],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}
