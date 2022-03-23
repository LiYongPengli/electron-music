// This file is created by egg-ts-helper@1.25.9
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportErrHandler from '../../../app/middleware/err_handler';
import ExportIndex from '../../../app/middleware/index';

declare module 'egg' {
  interface IMiddleware {
    errHandler: typeof ExportErrHandler;
    index: typeof ExportIndex;
  }
}
