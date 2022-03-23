import { Application } from "egg";

export = (app:Application)=>{
    const mongoose = app.mongoose;
    const Schema = mongoose.Schema;
    const userSchema = new Schema({
        username:{
            type:String,
            required:true
        },
        password:{
            type:String,
            required:false
        },
        likes:{
            type:Array,
            default:[]
        },
        token:{
            type:String,
            required:false
        },
        musicList:{
            required:false,
            type:Array,
            default:[]
        }
    },{versionKey:false});

    return mongoose.model('User',userSchema,'user')
}