import { Application } from 'egg';

export default (app: Application) => {
  const { controller, router } = app;
  //注册页
  router.get('/register',controller.view.register)
  //管理页
  router.get('/admin',controller.view.admin)
  //音乐文件上传
  router.post('/upmusic',controller.music.upmusic)
  //下载音乐
  router.get('/api/download',controller.music.downloadMusic);
  //用户注册
  router.post('/api/register',controller.user.register)
  //用户登录
  router.post('/api/login', controller.user.login);
  router.delete('/api/users/logout',controller.user.logout);
  //用户信息获取
  router.get('/api/users/usermessage',controller.user.usermessage)
  //我喜欢
  router.get('/api/users/usermusics',controller.user.userlike);
  //创建歌单
  router.post('/api/users/musiclist',controller.user.createMusicList)
  //用户操作(喜欢/不喜欢)
  router.post('/api/users/islike',controller.user.islike);
  //添加到歌单
  router.post('/api/users/addmusiclist',controller.user.addMusicList)
  //评论
  router.post('/api/users/topic',controller.user.topic);
  //点赞评论
  router.post('/api/users/praise',controller.user.praise);
  //获取评论列表
  router.get('/api/users/topic',controller.user.getTopic);
  //获取所有在线音乐
  router.get('/api/musiclist',controller.music.getMusic);
  router.get('/api/searchmusic',controller.music.searchs);
  //获取某歌曲的歌词
  router.get('/api/musictext',controller.music.getMusicText);
};
