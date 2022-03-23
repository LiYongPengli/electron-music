import { ID3 } from "./ID3Reader";

export interface Users {
    username: string;
    password: string;
    likes:Array<string>;
    _id: string;
    token:string;
    musicList:Array<MusicList>;
}
//歌单
export interface MusicList{
    name:string;
    info:string;
    cover:string;
    musics?:Array<string>;
}

export interface TMusic{
    name:string;
    path:string;
    lrc:string;
    krc:string;
    topics:Array<Topic>;
    likes:Array<string>;
    id3?:ID3;
}

export interface Topic{
    _id:string;
    publish_time:number;
    topicUser:Users
    text:string;
    praises:number;
    reverts?:Array<Topic>
}