import { Routes } from '@angular/router';
import { Dashboard } from './components/dashboard/dashboard';
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
    {path: 'tasks/status/:status', component: TaskList, title: 'Tasks by status'},
    {path:'tasks/department/:department', component: TaskList, title:'Tasks by department'},
    {path:'new-task', component: NewTask, title: 'Create New Task'},    
    {path:'tasks/detail/:id', component:TaskDetail, title:'Aufgabe Detail'},
    {path:'unauthorised', component: Unauthorised, title:'Unauthorised'},
    {path:'tasks', component: OverviewList, title:'All Tasks'},
    
];
