// This file is created by egg-ts-helper@1.25.9
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportMusic from '../../../app/controller/music';
import ExportUser from '../../../app/controller/user';
import ExportView from '../../../app/controller/view';

declare module 'egg' {
  interface IController {
    music: ExportMusic;
    user: ExportUser;
    view: ExportView;
  }
}
