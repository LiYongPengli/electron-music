import { Application } from "egg";

export = (app:Application)=>{
    const mongoose = app.mongoose;
    const Schema = mongoose.Schema;
    const musicSchema = new Schema({
        name:{
            type:String,
            required:true
        },
        path:{
            type:String,
            required:true
        },
        krc:{
            type:String,
            default:''
        },
        lrc:{
            type:String,
            default:''
        },
        likes:{
            type:Array,
            default:[]
        },
        topics:{
            type:Array,
            default:[]
        },
        id3:{
            type:Schema.Types.Mixed,
            required:true,
            default:{}
        }
    },{versionKey:false});

    return mongoose.model('Music',musicSchema,'music')
}