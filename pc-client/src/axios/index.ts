import { GlobelConfig } from '@/interfaces';
import store from '@/store';
import axios from 'axios';
import { Message } from 'element-ui';
axios.defaults.baseURL = process.env.VUE_APP_URL+'/api';

axios.interceptors.response.use(res=>{
    
    return res;
},err=>{
    if(!err.response){
        Message.error('服务器离线');
    }
    switch(err.response.status){
        case 401:
            switch(err.response.data.error){
                case 'Identity is overdue':
                    Message.error('身份过期请重新登录');
                    let config:GlobelConfig = store.state.globelConfig;
                    config.historyConf.currentIndex = -1;
                    config.historyConf.currentPlay = null;
                    config.historyConf.playList = [];
                    store.commit('setGlobelConfig',config);
                    break;
                case '用户不存在':
                    Message.error('该用户未注册，请到注册页进行注册!');
                    break;
                case 'no login':
                    Message.error('未登录');
                    break;
            }
            localStorage.removeItem('token');
            break;
        case 500:
            Message.error("服务器故障");
            break
        case 422:
            break;
        default:
            Message.error("服务器故障!")
            break;
    }
    return Promise.reject(err);
})

export default axios;