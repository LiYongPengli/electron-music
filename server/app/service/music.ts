import { FileStream, Service } from 'egg';
import * as fs from 'fs';
import * as path from 'path';
import * as iconv from 'iconv-lite';
import ID3Reader from '../libs/ID3Reader';
import { TMusic } from '../libs/interface';
import { decodekrc } from '../libs/DecodKrc';
/**
 * Test Service
 */
export default class Music extends Service{

    //音乐文件上传
    public async upLoadMusic(){
        const { ctx } = this;
        let music = {
            name:'',
            path:'',
            lrc:'',
            krc:'',
            id3:{}
        }
        let parts = ctx.multipart();
        let stream:FileStream;
        while((stream= await parts())!=null){
            if(stream.filename){
                if(stream.fieldname=='music'){
                    music.name = stream.filename.slice(0,stream.filename.lastIndexOf('.'));
                    music.path = '/public/musics/'+stream.filename;
                    let bufferArr:Buffer[] = [];
                    stream.on('data',(chunk:Buffer)=>{
                        bufferArr.push(chunk);
                    })
                    stream.on('end',()=>{
                        let id3 = new ID3Reader(Buffer.concat(bufferArr));
                        music.id3 = id3.getID3();
                        ctx.app.mongoose.models.Music.updateOne({name:music.name},{
                            $set:{
                                id3:music.id3
                            }
                        })
                    })
                };
                if(stream.fieldname=='lrc'){
                    music.lrc = '/public/musics/'+stream.filename;
                }
                if(stream.fieldname=='krc'){
                    music.krc = '/public/musics/'+stream.filename;
                }
                let writestream = fs.createWriteStream(path.resolve(__dirname,'../public/musics/'+stream.filename));
                stream.pipe(writestream);
            }else{
                break;
            }
        }
        let dbfind = await ctx.app.mongoose.models.Music.findOne({name:music.name});
        if(!dbfind){
            ctx.app.mongoose.models.Music.create(music);
        }else{
            ctx.app.mongoose.models.Music.updateOne({name:music.name},music);
        }
        return {
            status:1,
            'message':'上传成功'
        }
    }

    //获取音乐歌词
    public async getMusicText(id:string){
        const { ctx } = this;
        let mongo = ctx.app.mongoose;
        let music:TMusic = await mongo.models.Music.findById(id);
        let res = {
            lrc:'',
            krc:''
        }
        if(music.lrc){
            let buffer = await fs.readFileSync(path.resolve(__dirname,'../'+music.lrc))
            res.lrc = iconv.decode(buffer,'gbk');
        }
        if(music.krc){
            res.krc = await decodekrc(path.resolve(__dirname,'../'+music.krc))
        }
        return {
            status:1,
            data:res
        }
    }

    //音乐下载
    public async downLoadMusic(req:any){
        const { ctx } = this;
        let music:TMusic = await ctx.model.Music.findById(req.id);
        let buffer = await fs.readFileSync(path.resolve(__dirname,'..'+music.path));
        if(req.lrc){
            let splitBf = Buffer.from("@split@");
            let bf = await fs.readFileSync(path.resolve(__dirname,'..'+music.lrc))
            buffer = Buffer.concat([buffer,splitBf,bf]);
        }
        return buffer;
    }
}