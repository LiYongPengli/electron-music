import { EggPlugin } from 'egg';

const plugin: EggPlugin = {
  // static: true,
  // nunjucks: {
  //   enable: true,
  //   package: 'egg-view-nunjucks',
  // },
  ejs:{
    enable:true,
    package:'egg-view-ejs'
  },
  jwt:{
    enable:true,
    package:'egg-jwt'
  },
  mongoose:{
    enable:true,
    package:'egg-mongoose'
  }
};

export default plugin;
