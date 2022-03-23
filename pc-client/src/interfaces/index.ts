import { Font } from "@/libs/DecodKrc";
import { ID3 } from "@/libs/ID3Reader";

export type PlayType = 'loop'|'sort'|'random'|'loopone';

export interface LeftBarMenu{
    title:string;
    index:string;
    children?:Array<LeftBarMenu>;
}

export interface Music{
    _id:string;
    name:string;
    path:string;
    topics:Array<UserTopic>;
    likes:Array<string>;
    islocal:boolean;
    id3:ID3
}
//用户使用纪录
export interface HistoryConf{
    volume:number;
    playetype:PlayType;
    currentPlay:Music|null;
    currentIndex:number;
    playList:Array<Music>;
}

//桌面歌词
export interface IpcDeskText{
    type:'lrc'|'krc',
    data:string|KrcIpcText
}

export interface KrcIpcText{
    reset:boolean;
    currentTime:number;
    line:Array<string|Font>;
}

export interface UserMessage{
    _id:string;
    likes:Array<string>;
    musicList:Array<MusicList>;
    username:string;
}

//评论
export interface UserTopic{
    _id:string;
    publish_time:number;
    praises:string[];
    reverts?:Array<UserTopic>;
    text:string;
    topicUser:{
        _id:string;
        username:string;
    }
}

//歌单
export interface MusicList{
    name:string;
    info:string;
    cover:string;
}

export interface GlobelConfig{
    id:string;
    soundsFilter:{
        turnOn:boolean;
        biquadFilterArr:Array<number>;
    };
    appconfig:AppConfig;
    historyConf:HistoryConf;
}
//app配置
export interface AppConfig{
    localPath:string;
    theme:{
        background:string;
        localBackArr:Array<string>;
    }
    text:{
        krc:boolean;
        lrc:boolean;
    }
}