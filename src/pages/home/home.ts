import { Component } from '@angular/core';
import { NavController, Loading, LoadingController, ItemSliding, AlertOptions, AlertController } from 'ionic-angular';

import { Task } from './../../models/task.model';
import { TaskService } from './../../providers/task/task.service';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  tasks: Task[] = [];

  constructor(
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    public navCtrl: NavController,
    public taskService: TaskService
  ) {}

  ionViewDidLoad() {
    this.taskService.getAll(true)
      .then((tasks: Task[]) => {
        this.tasks = tasks;
      });
  }

  onSave(type: string, ItemSliding?: ItemSliding, task?: Task): void {
    let title: string = type.charAt(0).toUpperCase() + type.substr(1);
    let options = {
      title: `${title} task`,
      itemSliding: ItemSliding,
      type: type
    };
    this.showAlert(options, task);
  }

  onDelete(task: Task): void {
    this.alertCtrl.create({
      title: `Do you want to delete '${task.title}' task?`,
      buttons: [
        {
          text: 'Yes',
          handler: () => {
            let loading: Loading = this.showLoading(`Deleting ${task.title}...`);

            this.taskService.delete(task.id)
              .then((deleted: boolean) => {
                this.tasks.splice(this.tasks.indexOf(task), 1);
                loading.dismiss();
              });
          }
        },
        'No'
      ]
    }).present();
  }

  private showAlert(options: {itemSliding: ItemSliding, title: string, type: string}, task?: Task): void {

    let alertOptions: AlertOptions = {
      title: options.title,
      inputs: [
        {
          name: 'title',
          placeholder: 'Task title'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Save',
          handler: (data) => {

            let loading: Loading = this.showLoading(`Saving ${data.title} task...`);
            let contextTask: Task;

            switch(options.type) {
              case 'create':
                contextTask = new Task(data.title);
                break;
              case 'update':
                task.title = data.title;
                contextTask = task;
                break;
            }

            this.taskService[options.type](contextTask)
              .then((savedTask: Task) => {
                if (options.type === 'create') this.tasks.unshift(savedTask);
                loading.dismiss();
                if (options.itemSliding) options.itemSliding.close();
              });

          }
        }
      ]
    };

    if (options.type === 'update') {
      alertOptions.inputs[0].value = task.title;
    }

    this.alertCtrl.create(alertOptions).present();

  }

  private showLoading(message?: string): Loading {
    let loading: Loading = this.loadingCtrl.create({
      content: message || 'Please wait...'
    });
    loading.present();
    return loading;
  }

}
