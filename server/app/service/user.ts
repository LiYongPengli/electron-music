import { Service } from 'egg';
import * as utility from 'utility';
import { TMusic, Users } from '../libs/interface';
/**
 * Test Service
 */
export default class User extends Service {


  private async createToken(obj: { username: string; userid: string; }) {
    const token = await this.app.jwt.sign({
      username: obj.username,
      userid: obj.userid
    }, this.app.config.jwt.secret, {
      expiresIn: '24h'
    });
    return token;
  }

  public async verifyLogin(body, user: Users) {
    let pwd = utility.md5(body.password);
    if (user.password == pwd) {
      let token = await this.createToken({ username: body.username, userid: user._id })
      await this.ctx.model.User.updateOne({_id:this.app.mongoose.Types.ObjectId(user._id)},{
        $set:{
          token:token
        }
      })
      return {
        state: 1,
        token: token,
        message: '登录成功'
      }
    } else {
      this.ctx.status = 401;
      return {
        state: 0,
        message: '用户名或密码不正确'
      }
    }
  }

  public async register(body: { username: string; password: string; }) {
    let result = utility.md5(body.password);
    try {
      await this.ctx.model.User.create({ username: body.username, password: result });
    } catch (err) {
      this.ctx.status = 500;
    }

    return {
      message: "注册成功!"
    };
  }

  //用户喜欢或不喜欢
  public async userLike(body: { m_id: string; islike: 0 | 1 }) {
    const { ctx } = this;
    let mongo = ctx.app.mongoose;
    if (body.islike == 1) {
      await mongo.models.User.updateOne({ _id: mongo.Types.ObjectId(<string>ctx.headers.userid) }, {
        $addToSet: {
          likes: body.m_id
        }
      })
      await ctx.model.Music.updateOne({ _id: mongo.Types.ObjectId(body.m_id) }, {
        $addToSet: {
          likes: ctx.headers.userid
        }
      })
    } else {
      await mongo.models.User.updateOne({ _id: mongo.Types.ObjectId(<string>ctx.headers.userid) }, {
        $pull: {
          likes: body.m_id
        }
      })
      await ctx.model.Music.updateOne({ _id: mongo.Types.ObjectId(body.m_id) }, {
        $pull: {
          likes: ctx.headers.userid
        }
      })
    }

    return {
      status: 1,
      message: '操作成功'
    }

  }

  public async addMusicList(body: { m_id: string; listname: string }) {
    const { ctx } = this;
    // let user:Users = await ctx.model.User.findById(ctx.headers.userid);
    await ctx.model.User.updateOne({ _id: ctx.app.mongoose.Types.ObjectId(<string>ctx.headers.userid) }, {
      $addToSet: {
        "musicList.$[id0].musics": body.m_id
      }
    }, {
      arrayFilters: [
        {
          'id0.name': body.listname
        }
      ]
    })

    return {
      status: 1,
      message: '操作成功'
    }
  }

  public async getMusicList(musicListType: string): Promise<Array<TMusic>> {
    const { ctx } = this;
    let userMusicList: string[] = (await ctx.model.User.aggregate([
      {
        $unwind: "$musicList"
      },
      {
        $replaceRoot: { newRoot: "$musicList" }
      },
      {
        $match: {
          "name": musicListType
        }
      },
      {
        $project: {
          musics: 1,
        }
      },
    ]))[0].musics;
    return await ctx.model.Music.find({ _id: { $in: userMusicList } })
  }

  public async topic() {
    const { ctx, app } = this;
    let req = ctx.request.body as { m_id: string; text: string; revert_id: string };
    let user: Users = await ctx.model.User.findById(ctx.headers.userid, "username");
    if (!req.revert_id) {
      let obj = {
        _id: app.mongoose.Types.ObjectId(),
        publish_time: new Date().getTime(),
        topicUser: user,
        text: req.text,
        praises: [],
        reverts: []
      }
      await ctx.model.Music.updateOne({ _id: req.m_id }, {
        $push: {
          topics: obj
        }
      })
    } else {
      let obj = {
        _id: app.mongoose.Types.ObjectId(),
        publish_time: new Date().getTime(),
        topicUser: user,
        text: req.text,
        praises: []
      }

      await ctx.model.Music.updateOne({ _id: req.m_id }, {
        $push: {
          "topics.$[id0].reverts": obj
        }
      }, {
        arrayFilters: [
          {
            "id0._id": app.mongoose.Types.ObjectId(req.revert_id)
          }
        ]
      })
    }
    return {
      status: 1,
      message: '操作成功'
    }
  }
  //用户点赞
  public async praise() {
    const { ctx, app } = this;
    let req = ctx.request.body as { m_id: string; t_id: string; res_id?: string; praise: 0 | 1 };
    if (req.praise) {
      if (!req.res_id) {
        await ctx.model.Music.updateOne({ _id: req.m_id }, {
          $addToSet: {
            'topics.$[index1].praises': ctx.headers.userid
          }
        }, {
          arrayFilters: [
            {
              'index1._id': app.mongoose.Types.ObjectId(req.t_id)
            }
          ]
        })
      } else {
        await ctx.model.Music.updateOne({ _id: req.m_id }, {
          $addToSet: {
            'topics.$[index1].reverts.$[index2].praises': ctx.headers.userid
          }
        }, {
          arrayFilters: [
            {
              'index1._id': app.mongoose.Types.ObjectId(req.t_id)
            },
            {
              'index2._id': app.mongoose.Types.ObjectId(req.res_id)
            }
          ]
        })
      }
      return {
        status: 1,
        message: '操作成功'
      }
    } else {
      if (!req.res_id) {
        await ctx.model.Music.updateOne({ _id: req.m_id }, {
          $pull: {
            'topics.$[index1].praises': ctx.headers.userid
          }
        }, {
          arrayFilters: [
            {
              'index1._id': app.mongoose.Types.ObjectId(req.t_id)
            }
          ]
        })
      } else {
        await ctx.model.Music.updateOne({ _id: req.m_id }, {
          $pull: {
            'topics.$[index1].reverts.$[index2].praises': ctx.headers.userid
          }
        }, {
          arrayFilters: [
            {
              'index1._id': app.mongoose.Types.ObjectId(req.t_id)
            },
            {
              'index2._id': app.mongoose.Types.ObjectId(req.res_id)
            }
          ]
        })
      }
      return {
        status: 1,
        message: '操作成功'
      }
    }
  }
}
