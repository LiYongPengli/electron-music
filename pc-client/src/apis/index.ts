import axios from '@/axios'

//用户登录
export interface UserLogin{
    username:string;
    password:string;
}

//歌单
export interface MusicList{
    name:string;
    info:string;
    cover:string;
}

//喜欢/不喜欢
export interface IsLike{
    m_id:string;
    islike:0|1;
}

//添加到歌单
export interface AddMusicList{
    m_id:string;
    listname:string;
}

//评论
export interface Topics{
    m_id:string;
    text:string;
    toUser?:string;
    revert_id?:string;
}

export interface PraiseTopic{ 
    m_id: string; 
    t_id: string; 
    res_id?: string; 
    praise: 0 | 1;
}

export class Api {
    //登录
    public login = async(params:UserLogin)=> await axios.post('/login',params);
    //登出
    public logout = async()=>await axios.delete('/users/logout');
    //用户信息
    public usermessage = async()=>await axios.get('/users/usermessage');
    //我喜欢(歌单)
    public userlike = async(type:string='userlike')=>await axios.get('/users/usermusics',{params:{type:type}});
    //创建歌单
    public createMusicList = async(params:MusicList)=>await axios.post('/users/musiclist',params)
    //在线歌曲列表
    public inlineMusic = async(q:string='')=>await axios.get('/musiclist',{params:{q:q}});
    public searchMusic = async(q:string='')=>await axios.get('/searchmusic',{params:{q:q}});
    public musicPhoto = async(id:string)=>await axios.get('/musicphoto',{params:{id:id}})
    //歌词
    public musicText = async(id:string)=>await axios.get('/musictext',{params:{id:id}});
    //喜欢/不喜欢
    public userislike = async(params:IsLike)=>await axios.post('/users/islike',params);

    public addMusicList = async(params:AddMusicList)=>await axios.post('/users/addmusiclist',params);
    //评论
    public topic = async(params:Topics)=>await axios.post('/users/topic',params);
    //获取评论列表
    public getTopic = async(m_id:string)=>await axios.get('/users/topic',{params:{id:m_id}})
    //评论点赞
    public praise = async(params:PraiseTopic)=>await axios.post('/users/praise',params)
}

export default new Api();