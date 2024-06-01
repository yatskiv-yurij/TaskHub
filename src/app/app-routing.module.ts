import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { AuthComponent } from './pages/auth/auth.component';
import { LogInComponent } from './components/log-in/log-in.component';
import { RegistrationComponent } from './components/registration/registration.component';
import { CannotlogComponent } from './components/cannotlog/cannotlog.component';
import { ChangePasswordComponent } from './components/change-password/change-password.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { BacklogComponent } from './components/backlog/backlog.component';
import { SprintComponent } from './components/sprint/sprint.component';
import { IssuesComponent } from './components/issues/issues.component';
import { ParticipantsComponent } from './components/participants/participants.component';
import { BoardSettingsComponent } from './components/board-settings/board-settings.component';
import { ProjectSettingsComponent } from './components/project-settings/project-settings.component';
import { PersonalSettingsComponent } from './components/personal-settings/personal-settings.component';
import { IssueEditComponent } from './components/issue-edit/issue-edit.component';
import { NewParticipantComponent } from './components/new-participant/new-participant.component';
import { ReportsComponent } from './components/reports/reports.component';

const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'not-found', component: NotFoundComponent },
  { path: 'auth', component: AuthComponent,
    children: [
      {
        path: 'log-in',
        component: LogInComponent,
      },
      {
        path: 'registration',
        component: RegistrationComponent,
      },
      {
        path: 'can-not-log',
        component: CannotlogComponent,
      },
      {
        path: 'change-password/:id',
        component: ChangePasswordComponent,
      }
    ],
  },
  { path: 'dashboard/:projectId/:boardId', component: DashboardComponent,
    children: [
      {
        path: 'backlog',
        component: BacklogComponent,
        children: [
          {
            path: ':taskId',
            component: IssueEditComponent
          }
        ]
      },
      {
        path: 'sprint',
        component: SprintComponent,
        children: [
          {
            path: ':taskId',
            component: IssueEditComponent
          }
        ]
      },
      {
        path: 'issues',
        component: IssuesComponent,
        children: [
          {
            path: ':taskId',
            component: IssueEditComponent
          }
        ]
      },
      {
        path: 'reports',
        component: ReportsComponent
      },
      {
        path: 'participants',
        component: ParticipantsComponent
      },
      {
        path: 'board-settings',
        component: BoardSettingsComponent
      },
      {
        path: 'project-settings',
        component: ProjectSettingsComponent
      },
      {
        path: 'personal-settings',
        component: PersonalSettingsComponent
      },
      {
        path: 'new-participant',
        component: NewParticipantComponent
      }
    ]
  },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: '**', redirectTo: '/not-found', pathMatch: 'full' }
]

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    scrollPositionRestoration: 'enabled',
    anchorScrolling: 'enabled',
    scrollOffset: [0, 64]
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
