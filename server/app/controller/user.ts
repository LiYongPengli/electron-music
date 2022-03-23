import { Controller } from 'egg';
import { TMusic, Topic, Users } from '../libs/interface';

export default class UserController extends Controller {

  //用户登录
  public async login() {
    const { ctx } = this;
    const results: Users = await ctx.model.User.findOne({ username: ctx.request.body.username });
    if (!results) ctx.throw(401, '用户不存在')
    ctx.body = await ctx.service.user.verifyLogin(ctx.request.body, results)
  }

  //用户登出
  public async logout(){
    const { ctx } = this;
    await ctx.model.User.updateOne({_id:ctx.headers.userid},{
      $unset:{
        token:true
      }
    })
    ctx.body = {
      status:1,
      message:'操作成功'
    }
  }

  //用户注册
  public async register() {
    const { ctx } = this;
    ctx.body = await ctx.service.user.register(ctx.request.body);
  }

  //获取用户信息
  public async usermessage() {
    const { ctx } = this;
    const findItems = "musicList username likes _id";
    const result: Users = await ctx.model.User.findOne({ username: ctx.request.headers.username }, findItems);
    if (!result) ctx.throw(401, '用户不存在')
    ctx.body = result;
  }

  //获取用户喜欢的歌单
  public async userlike() {
    const { ctx } = this;
    const user: Users = await ctx.model.User.findById(ctx.request.headers.userid);
    let musicListType = ctx.request.query.type as string;
    let likeMusics: Array<TMusic> = [];
    if (musicListType == 'userlike') {
      let userLikes = user.likes;
      likeMusics = await ctx.model.Music.find({ _id: { $in: userLikes } })
    } else {
      likeMusics = await this.service.user.getMusicList(musicListType);
    }
    ctx.body = {
      status: 1,
      data: likeMusics
    };
  }

  //创建歌单
  public async createMusicList() {
    const { ctx } = this;
    await ctx.model.User.updateOne({ username: ctx.request.headers.username }, {
      '$push': {
        musicList: {
          name: ctx.request.body.name,
          info: ctx.request.body.info,
          cover: ctx.request.body.cover,
          musics: []
        }
      }
    })
    ctx.body = {
      status: 1,
      message: '创建成功'
    }
  }

  public async islike() {
    const { ctx } = this;
    let req = ctx.request.body;
    ctx.body = await this.service.user.userLike(req);
  }

  public async addMusicList() {
    const { ctx } = this;
    let req = ctx.request.body;
    ctx.body = await this.service.user.addMusicList(req);
  }

  public async topic(){
    const { ctx } = this;
    ctx.body = await this.service.user.topic()
  }

  public async getTopic(){
    const { ctx } = this;
    let m_id = ctx.request.query.id as string;
    let topics:Array<Topic> = await ctx.model.Music.findById(m_id,{_id:0,topics:1});
    ctx.body = {
      status:1,
      data:topics
    }
  }

  public async praise(){
    const { ctx } = this;
    ctx.body = await this.service.user.praise();
  }
}
