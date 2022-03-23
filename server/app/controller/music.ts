import { Controller } from 'egg';

export default class MusicController extends Controller {
    public async upmusic(){
        const { ctx } = this;
        ctx.body =  await this.service.music.upLoadMusic();
    }

    public async getMusic(){
        const { ctx } = this;
        let resFilter = {
            path:1,
            name:1,
            id3:1,
            topics:1,
            likes:1
        }
        if(!ctx.request.query.q){
            ctx.body = {
                status:1,
                data:await ctx.app.mongoose.models.Music.find({},resFilter)
            }
        }else{
            ctx.body = {
                status:1,
                data:await ctx.app.mongoose.models.Music.find({name:{$regex:ctx.request.query.q}},resFilter)
            }
        }
        
    }

    public async searchs(){
        const { ctx } = this;
        ctx.body = {
            status:1,
            data:await ctx.app.mongoose.models.Music.find({name:{$regex:ctx.request.query.q}},{name:1,_id:0})
        }
    }

    public async getMusicText(){
        const { ctx } = this;
        let musicid = ctx.request.query.id;
        ctx.body = await this.service.music.getMusicText(musicid);
    }

    public async downloadMusic(){
        const { ctx } = this;
        let query = ctx.request.query;
        ctx.body = await this.service.music.downLoadMusic(query);
    }
}