import { Routes } from '@angular/router';
import { Dashboard } from './components/dashboard/dashboard';
import { Overview } from './components/overview/overview';
import { NewTask } from './components/new-task/new-task';
import { TaskList } from './components/task-list/task-list';
import { TaskDetail } from './components/task-detail/task-detail';
import { canActivateAuthRole } from './auth/keycloak-guard';
import { Unauthorised } from './components/unauthorised/unauthorised';
import { OverviewList } from './components/overview-list/overview-list';
import { Admin } from './components/admin/admin';

export const routes: Routes = [

    {path:'', component:Dashboard, title: 'Dashboard'},
    {path:'admin', component:Admin, title: 'Admin Overview', canActivate: [canActivateAuthRole], data: { role: ['admin', 'user'] }},
    {path:'new-task', component: NewTask, title: 'Create New Task'},
    {path:'tasks/:status', component:TaskList, title:'Status Detail'},
    {path:'tasks/detail/:id', component:TaskDetail, title:'Aufgabe Detail'},
    {path:'unauthorised', component: Unauthorised, title:'Unauthorised'},
    {path:'alltasks', component: OverviewList, title:'All Tasks'}
];
