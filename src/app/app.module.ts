import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { StoreModule } from '@ngrx/store';
import { CommonModule } from '@angular/common';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { EffectsModule } from '@ngrx/effects';
import { Routes, RouterModule, Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { NgxEditorModule } from 'ngx-editor';
import {MatDatepickerModule} from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ColorPickerModule } from 'primeng/colorpicker';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { DatePipe } from '@angular/common';
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';

import { SocialLoginModule, 
  SocialAuthServiceConfig,
  GoogleLoginProvider,
  MicrosoftLoginProvider,
  GoogleSigninButtonModule 
} from '@abacritt/angularx-social-login';

import { HomeComponent } from './pages/home/home.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { TaskEffects } from './store/effects/tasks.effects';
import { TasksService } from './services/tasks.service';
import { TasksReducer } from './store/reducers/task.reducer';
import { UserReducer } from './store/reducers/user.reducer';
import { ProjectReducer } from './store/reducers/project.reducer';
import { BoardReducer } from './store/reducers/board.reducers';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { AuthComponent } from './pages/auth/auth.component';
import { LogInComponent } from './components/log-in/log-in.component';
import { RegistrationComponent } from './components/registration/registration.component';
import { CannotlogComponent } from './components/cannotlog/cannotlog.component';
import { ChangePasswordComponent } from './components/change-password/change-password.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { BacklogComponent } from './components/backlog/backlog.component';
import { TaskBacklogComponent } from './components/task-backlog/task-backlog.component';
import { HeaderBacklogComponent } from './components/header-backlog/header-backlog.component';
import { SprintComponent } from './components/sprint/sprint.component';
import { IssuesComponent } from './components/issues/issues.component';
import { ParticipantsComponent } from './components/participants/participants.component';
import { IssueEditComponent } from './components/issue-edit/issue-edit.component';
import { NewSprintComponent } from './components/new-sprint/new-sprint.component';
import { NewTaskComponent } from './components/new-task/new-task.component';
import { BoardSettingsComponent } from './components/board-settings/board-settings.component';
import { ProjectSettingsComponent } from './components/project-settings/project-settings.component';
import { PersonalSettingsComponent } from './components/personal-settings/personal-settings.component';
import { LogSocialComponent } from './components/log-social/log-social.component';
import { NewParticipantComponent } from './components/new-participant/new-participant.component';
import { TaskSprintComponent } from './components/task-sprint/task-sprint.component';
import { TaskIssuesComponent } from './components/task-issues/task-issues.component';
import { DateFormatPipe } from './pipes/date-format.pipe';
import { ReportsComponent } from './components/reports/reports.component';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

const config: SocketIoConfig = { url: 'http://localhost:3001/', options: {} };

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    NotFoundComponent,
    AuthComponent,
    RegistrationComponent,
    LogInComponent,
    CannotlogComponent,
    ChangePasswordComponent,
    DashboardComponent,
    BacklogComponent,
    TaskBacklogComponent,
    HeaderBacklogComponent,
    SprintComponent,
    IssuesComponent,
    ParticipantsComponent,
    IssueEditComponent,
    NewSprintComponent,
    NewTaskComponent,
    BoardSettingsComponent,
    ProjectSettingsComponent,
    PersonalSettingsComponent,
    LogSocialComponent,
    NewParticipantComponent,
    TaskSprintComponent,
    TaskIssuesComponent,
    DateFormatPipe,
    ReportsComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    DragDropModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    BrowserAnimationsModule,
    MatDatepickerModule,
    MatInputModule,
    ColorPickerModule,
    MatNativeDateModule,
    SocialLoginModule,
    GoogleSigninButtonModule,
    StoreModule.forRoot({tasks: TasksReducer, user: UserReducer, project: ProjectReducer, board: BoardReducer}),
    EffectsModule.forRoot([TaskEffects]),
    SocketIoModule.forRoot(config),
    StoreDevtoolsModule.instrument({
      maxAge: 25
    }),
    NgxEditorModule
  ],
  providers: [
    TasksService,
    {
      provide: 'SocialAuthServiceConfig',
      useValue: {
        autoLogin: false,
        providers: [
          {
            id: GoogleLoginProvider.PROVIDER_ID,
            provider: new GoogleLoginProvider(
              '1089913271921-hift8vidubvnr92v3lgpgnrihmfjgfnn.apps.googleusercontent.com'
            )
          },
          {
            id: MicrosoftLoginProvider.PROVIDER_ID,
            provider: new MicrosoftLoginProvider('24c82131-f21d-4d96-b33e-de2f540676a8', {
              redirect_uri: 'http://localhost:4200',
            })
          }
        ],
        onError: (err) => {
          console.error(err);
        }
      } as SocialAuthServiceConfig,
    },
    DatePipe
  ],
  bootstrap: [AppComponent],
  exports: [RouterModule]
})

export class AppModule { }
