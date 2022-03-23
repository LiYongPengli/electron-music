// This file is created by egg-ts-helper@1.25.9
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportMusic from '../../../app/model/music';
import ExportUser from '../../../app/model/user';

declare module 'egg' {
  interface IModel {
    Music: ReturnType<typeof ExportMusic>;
    User: ReturnType<typeof ExportUser>;
  }
}
