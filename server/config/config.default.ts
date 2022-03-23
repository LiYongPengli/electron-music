import { EggAppConfig, EggAppInfo, PowerPartial } from 'egg';
import * as path from 'path'

export default (appInfo: EggAppInfo) => {
  const config = {} as PowerPartial<EggAppConfig>;

  // override config from framework / plugin
  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1621231817887_782';
  config.cluster = {
    listen:{
      path:'',
      port:8000,
      hostname:'0.0.0.0'
    }
  }
  //jsonwebtoken配置
  config.jwt = {
    //加密的key
    secret:'123456'
  }

  config.view = {
    mapping:{
      '.ejs':'ejs'
    }
  }

  config.security = {
    csrf:{
      enable:false,
      headerName:'x-csrf-token'
    }
  }

  //文件上传配置
  config.multipart = {
    mode:'stream',
    files:50,
    fileSize:'100mb',
    tmpdir:path.resolve(__dirname,'../fileTemps'),
    whitelist:['.lrc','.krc','.mp3']
  }

  
  // add your egg config in here
  config.middleware = ['errHandler','index'];
  //不需要验证token的路由
  config.index = {
    match:['/api/users'],
    // ignore:['/api/register','/api/login']
  }
  config.errHandler = {
    match:['/api']
  }

  config.mongoose = {
    url:'mongodb://localhost:27017/electron_music',
    options:{useNewUrlParser: true,useUnifiedTopology:true}
  }

  // add your special config in here
  const bizConfig = {
    sourceUrl: `https://github.com/eggjs/examples/tree/master/${appInfo.name}`,
  };

  // the return config will combines to EggAppConfig
  return {
    ...config,
    ...bizConfig,
  };
};
