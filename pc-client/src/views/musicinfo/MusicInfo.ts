import { GlobelConfig, Music, PlayType, UserMessage } from "@/interfaces";
import { decodekrc, Font, init_krc } from "@/libs/DecodKrc";
import { Component, Emit, Prop, Ref, Vue, Watch } from "vue-property-decorator";
import { Mutation, State } from "vuex-class";
import Swiper from 'swiper';
import fs from "fs";
import iconv from "iconv-lite";
import { ipcRenderer, remote } from "electron"

import PinPu from "@/components/Pinpu.vue";
import ContextList from "@/components/ContextList.vue";
import { MusicText } from "@/libs/Untils";

@Component({
    components: {
        PinPu,
        ContextList
    }
})
export default class MusicInfo extends Vue {
    @Prop({}) background!: string;
    @Prop({}) showContent!: boolean;
    public volume: number = 0;
    @State("userMessage") userMessage!: UserMessage;
    @State("audio") audio!: HTMLAudioElement;
    @State("currentTime") currentTime!: number;
    @State('duration') duration!: number;
    @State('currentPlay') currentPlay!: Music;
    @State('playIndex') playIndex!: number;
    @State('globelConfig') globelConfig!: GlobelConfig;
    @State("soundSwitch") soundSwitch!: boolean;
    @State("musicText") musicText!: MusicText;
    //显示均衡器配置
    @State('showSoundConfig') showSoundConfig!: boolean;
    @Ref("tpbar") readonly tpbar!: HTMLElement;
    @Mutation("setPlayIndex") setPlayIndex!: (index: number) => void;
    @Mutation("setGlobelConfig") setGlobelConfig!: (conf: GlobelConfig) => void;
    @Mutation("setShowSoundConfig") setShowSoundConfig!: (n: boolean) => void;
    @Mutation("setMusicText") setMusicText!: (n: MusicText) => void;
    @Mutation('setDeskText') setDeskText!:(n:boolean)=>void;
    public textarr: string[][] = [];
    public krcArr: Array<Array<string | Font>> = [];
    public runtext: boolean = false;
    public krcTextWrap: Swiper | null = null;
    public lrcTextWrap: Swiper | null = null;
    public loadText: boolean = false;
    
    private timer: any = null;
    @State('deskText') deskText!: boolean;
    //在线歌词
    public inline = {
        krcStr: '',
        lrcStr: ''
    }

    @Emit('close')
    toClose() {
        return false;
    }

    get current() {
        if (this.duration == 0) return 0;
        return (this.currentTime / this.duration) * 100;
    }

    @Watch('volume')
    changeVolume() {
        this.audio.volume = this.volume / 100;
    }

    //当音乐改变时重新初始化歌词
    private changeMusic() {
        this.loadText = false;
        this.runtext = false;
        this.textarr = [];
        this.krcArr = [];
        this.textarr = this.musicText.textarr;
        this.krcArr = this.musicText.krcArr;
        setTimeout(() => {
            if (this.musicText.type == 'krc') {
                this.krcTextWrap = new Swiper("#krc_text", {
                    direction: "vertical",
                    slidesPerView: 7,
                    speed: 800,
                    observer: true,
                    centeredSlides: true,
                });
                this.loadText = true;
            } else if (this.musicText.type == 'lrc') {
                this.lrcTextWrap = new Swiper("#lrc_text", {
                    direction: "vertical",
                    slidesPerView: 7,
                    speed: 800,
                    observer: true,
                    centeredSlides: true,
                });
                this.loadText = true;
            } else {

            }
            // this.runtext = true;
            if (this.krcArr.length) {
                this.krcTextWrap?.slideTo(this.musicText.activeIndex);
            } else if (this.textarr.length) {
                this.lrcTextWrap?.slideTo(this.musicText.activeIndex);
            }
        }, 20)
        setTimeout(() => {
            this.runtext = true;
        }, 1000);
    }

    @Watch('musicText.uuid')
    listenMusicText(newVal: string, oldVal: string) {
        this.changeMusic();
    }
    @Watch('musicText.activeIndex')
    listenActiveIndex(newVal:number){
        if(this.musicText.type=='krc'){
            this.changeKrcText();
        }else if(this.musicText.type=='lrc'){
            this.changeLrcText();
        }
    }

    @Watch('currentTime')
    public listenCurrentTime(newVal: number, oldVal: number) {
        if (this.krcArr.length) {
            // this.changeKrcText();
        } else if (this.textarr.length) {
            // this.changeLrcText();
        }
    }

    //lrc歌词监听
    private changeLrcText() {
        if (this.musicText.activeIndex >= this.textarr.length - 1) this.runtext = false;
        if (!this.runtext) return;
        this.lrcTextWrap?.slideTo(this.musicText.activeIndex);
        
    }
    //监听krc歌词
    private changeKrcText() {
        if (this.musicText.activeIndex >= this.krcArr.length - 1) this.runtext = false;
        if (!this.runtext) return;
        this.krcTextWrap?.slideTo(this.musicText.activeIndex);
    }

    created() {
        this.volume = Math.floor(this.audio.volume * 100);
    }

    @Watch('showContent')
    async mountedCom(newVal: boolean) {
        if (newVal) {
            if (!this.musicText) {
                let musicText = new MusicText(this.currentPlay);
                await musicText.getMusicText(!this.currentPlay.islocal)
                this.setMusicText(musicText);
            } else {
                this.changeMusic()
            }
        }

    }

    //歌曲进度跳跃
    public jump(e: MouseEvent) {
        //进度条跳跃
        let position = e.clientX - this.tpbar.offsetLeft;
        this.audio.currentTime = this.duration * (position / this.tpbar.clientWidth);
        if (this.textarr.length) {
            //lrc歌词跳跃
            for (let i = 0; i < this.textarr.length; i++) {
                let timearr = this.textarr[i][0].split(":");
                let time = Number(timearr[0]) * 60 + Number(timearr[1]);
                if (Number(this.currentTime.toFixed(2)) > time + (this.musicText.textDelay / 1000)) {
                    this.musicText.activeIndex = i;
                    this.lrcTextWrap?.slideTo(this.musicText.activeIndex);
                    break;
                }
            }
        } else if (this.krcArr.length) {
            //krc歌词跳跃
            for (let i = 0; i < this.krcArr.length; i++) {
                let time = (<string>this.krcArr[i][0]).split(",")[0];
                if (Math.floor(this.currentTime * 1000) > parseInt(time) + this.musicText.textDelay) {
                    this.musicText.activeIndex = i;
                    this.musicText.activeFont = 0;
                    this.krcTextWrap?.slideTo(this.musicText.activeIndex);
                    break;
                }
            }
        }
    }

    public playOrPause() {
        if (this.audio.paused) {
            this.audio.play();
            this.timer = setInterval(() => {
                if (this.audio.volume >= 1) {
                    clearInterval(this.timer);
                    this.timer = null;
                } else {
                    this.audio.volume += 0.1;
                }
            }, 100);
        } else {
            if (this.audio.volume > 0.1) {
                this.timer = setInterval(() => {
                    this.audio.volume -= 0.1;
                    if (this.audio.volume < 0.1) {
                        this.audio.pause();
                        clearInterval(this.timer);
                        this.timer = null;
                    }
                }, 100);
            } else {
                this.audio.pause();
            }
        }
    }

    public playtypeChg(n: PlayType) {
        this.globelConfig.historyConf.playetype = n;
        this.setGlobelConfig(this.globelConfig);
    }


    //获取krc每行歌词
    public getKrcTextLine(): string {
        if (!this.krcArr.length) return '';
        let line = this.krcArr[this.musicText.activeIndex].slice(1) as Array<Font>;
        let str = ""
        for (let i of line) {
            str += i.text
        }
        return str;
    }

    public init_time(time: number) {
        let hour = Math.floor(time / 60 / 60);
        let min = Math.floor(time / 60);
        let seconds = Math.floor(time % 60);
        return `${hour > 0 ? (hour > 9 ? hour : "0" + hour) + ":" : ""}${min > 9 ? min : "0" + min
            }:${seconds > 9 ? seconds : "0" + seconds}`;
    }

    //下一首
    public playNext() {
        if (this.globelConfig.historyConf.playetype != 'random') {
            if (this.playIndex < this.globelConfig.historyConf.playList.length - 1) {
                this.setPlayIndex(this.playIndex + 1);
            } else {
                this.setPlayIndex(0);
            }
        }
    }

    //上一首
    public playUp() {
        if (this.globelConfig.historyConf.playetype != 'random') {
            if (this.playIndex < 1) {
                this.setPlayIndex(this.globelConfig.historyConf.playList.length - 1);
            } else {
                this.setPlayIndex(this.playIndex - 1);
            }
        }
    }

    //下载
    public toDownload() {
        if (this.currentPlay.islocal) {
            this.$message.success('文件已存在');
            return;
        }
        let downloadPath = this.axios.defaults.baseURL + '/download?id=' + this.currentPlay._id;
        ipcRenderer.send('download', JSON.stringify({
            url: downloadPath,
            lrc: this.globelConfig.appconfig.text.lrc,
            id: this.currentPlay._id,
            type: this.currentPlay.path.slice(this.currentPlay.path.indexOf('.')),
            name: this.currentPlay.name,
            savePath: this.globelConfig.appconfig.localPath
        }))
    }

    //喜欢与不喜欢
    public toLike(type: 0 | 1) {
        if (!this.userMessage) {
            this.$message.warning('请登录后操作!');
            return;
        }
        let id = this.currentPlay._id;
        if (!id) {
            this.$message.error('未找到线上歌曲!');
            return;
        }
        this.api.userislike({ m_id: id, islike: type }).then((res) => {
            if (type) {
                this.userMessage.likes.push(id);
                this.currentPlay.likes.push(this.userMessage._id);
            } else {
                this.userMessage.likes.splice(this.userMessage.likes.indexOf(id), 1);
                this.currentPlay.likes.splice(this.currentPlay.likes.indexOf(this.userMessage._id), 1);
            }
        });
    }

    //跳转评论区
    public toTopic() {
        if (!this.currentPlay._id) {
            this.$message.error('该歌曲非线上歌曲不能进行评论!');
            return;
        }
        this.$router.push('/topic/' + this.currentPlay._id).catch(err => { });
        this.toClose();
    }

    /**
     * 是否开启桌面歌词
     * @param n 布尔量
     */
    public setShowDeskText(n: boolean) {
        if (this.deskText) {
            ipcRenderer.send('deskiptext', false)
        } else {
            ipcRenderer.send('deskiptext', true)
        }
        this.setDeskText(!this.deskText);
    }

    public appmini() {
        let win = remote.getCurrentWindow();
        win.minimize();
    }

    public apphide() {
        let win = remote.getCurrentWindow();
        win.hide();
    }
}