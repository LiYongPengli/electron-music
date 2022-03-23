import { Component, Vue, Watch } from "vue-property-decorator";
import LeftBar from "@/components/LeftBar.vue";
import TopBar from "@/components/TopBar.vue";
import MusicInfo from "@/views/musicinfo/MusicInfo.vue";
import PlayControl from "@/components/PlayControl.vue";
import SoundConfig from "@/components/soundconfig/SoundConfig.vue";
import { Mutation, State } from "vuex-class";
import { GlobelConfig, HistoryConf, Music } from "@/interfaces";
import fs from "fs";
import { MusicText } from "@/libs/Untils";
@Component({
    components: {
        LeftBar,
        TopBar,
        MusicInfo,
        PlayControl,
        SoundConfig
    }
})
export default class Home extends Vue {
    //html audio标签
    private audio!: HTMLAudioElement;
    private timer:any = null;
    @State("showMusicInfo") showMusicInfo!: boolean;
    public showContent: boolean = false;
    @State("music_picture") music_picture!:string;
    @State("globelConfig") globelConfig!: GlobelConfig;
    @State("currentPlay") currentPlay!: Music;
    @State("musicText") musicText!: MusicText;
    //显示均衡器配置
    @State('showSoundConfig') showSoundConfig!: boolean;
    //当前播放队列索引
    @State("playIndex") playIndex!: number;
    @Mutation("setAudio") setAudio!: (audio: HTMLAudioElement) => void;
    @Mutation("setPlayIndex") setPlayIndex!: (index: number) => void;
    @Mutation("setCurrentTime") setCurrentTime!: (time: number) => void;
    @Mutation("setDuration") setDuration!: (time: number) => void;
    @Mutation("setAudioContext") setAudioContext!: (context: AudioContext) => void;
    @Mutation("setAnalyser") setAnalyser!: (context: AnalyserNode) => void;
    @Mutation("setAudioSource") setAudioSource!: (source: MediaElementAudioSourceNode) => void;
    @Mutation("setGlobelConfig") setGlobelConfig!: (conf: GlobelConfig) => void;
    @Mutation("setCurrentPlay") setCurrentPlay!: (music: Music) => void;
    @Mutation("setShowSoundConfig") setShowSoundConfig!: (n: boolean) => void;
    @Mutation("setMusicText") setMusicText!: (n: MusicText) => void;
    @Mutation("setShowMusicInfo") setShowMusicInfo!: (n: boolean) => void;

    @Watch("playIndex")
    listenPlayIndex(newVal: number) {
        this.toPlay(this.globelConfig.historyConf.playList[newVal], newVal);
        this.globelConfig.historyConf.currentIndex = newVal;
        this.globelConfig.historyConf.currentPlay = this.globelConfig.historyConf.playList[newVal]
        this.setGlobelConfig(this.globelConfig);
        
    }

    async created() {
        this.init_music();
        let url: string = "";
        if(this.globelConfig.historyConf.currentPlay)
            if (this.globelConfig.historyConf.currentPlay!.islocal) {
                let buffer = await fs.readFileSync(this.globelConfig.historyConf.currentPlay!.path).buffer;
                let blob = new Blob([buffer], { type: "application/octet-binary" });
                url = URL.createObjectURL(blob);
            } else {
                //网络音乐
                url = this.axios.defaults.baseURL?.replace('/api','') + this.globelConfig.historyConf.currentPlay.path
            }

        this.audio.src = url;
    }
    //初始化播放器
    private init_music() {
        //创建html audio标签
        this.audio = new Audio();
        if(this.globelConfig.historyConf.volume) this.audio.volume =this.globelConfig.historyConf.volume;
        //实例化webAudio对象
        let audioContext = new AudioContext();
        //创建音频分析器
        let analyser = audioContext.createAnalyser();
        //创建以html媒体标签为来源的音源
        let source = audioContext.createMediaElementSource(this.audio);
        //将音源与分析器连接
        source.connect(analyser);
        //将分析器连接至扬声器
        analyser.connect(audioContext.destination);
        //设置vuex全局对象
        this.setAudio(this.audio);
        this.setAudioContext(audioContext);
        this.setAnalyser(analyser);
        this.setAudioSource(source);
        //给audio标签添加监听事件
        // this.audio.onplay = this.OnPlay;
        this.audio.oncanplay = this.OnPlay;
        this.audio.onended = this.OnPlayEnd;
        //执行渲染动画
        this.run();
    }
    //渲染动画
    private run() {
        //实时提供currentTime的最新值
        this.timer = setInterval(()=>{
            this.setCurrentTime(this.audio.currentTime);
            if(this.musicText){
                if(this.musicText.type=='lrc') this.musicText.changeLrcText(this.audio.currentTime);
                if(this.musicText.type=='krc') this.musicText.changeKrcText(this.audio.currentTime);
            }
        },10)
        // requestAnimationFrame(this.run.bind(this));
    }

    private OnPlay(e: Event) {
        setTimeout(()=>{
            this.setDuration(this.audio.duration);
        },100)
    }

    private OnPlayEnd(e: Event) {
        switch (this.globelConfig.historyConf.playetype) {
            case 'loop':
                if (this.playIndex < this.globelConfig.historyConf.playList.length - 1) {
                    console.log(this.globelConfig.historyConf);
                    this.setPlayIndex(this.playIndex + 1);
                } else {
                    this.setPlayIndex(0);
                }
                break;
            case 'sort':
                if (this.playIndex < this.globelConfig.historyConf.playList.length - 1) {
                    this.setPlayIndex(this.playIndex + 1);
                }
                break;
            case 'loopone':
                this.toPlay(this.globelConfig.historyConf.playList[this.playIndex], this.playIndex);
                break;
        }
    }

    private async toPlay(v: Music, index: number) {
        let url: string = "";
        if (v.islocal) {
            let buffer = await fs.readFileSync(v.path).buffer;
            let blob = new Blob([buffer], { type: "application/octet-binary" });
            url = URL.createObjectURL(blob);
        } else {
            //网络音乐
            url = this.axios.defaults.baseURL?.replace('/api','')+v.path;
        }

        this.audio.src = url;
        setTimeout(() => {
            this.audio.play();
        }, 100);
        this.setCurrentPlay(v);
        let musicText = new MusicText(this.currentPlay);
        await musicText.getMusicText(!this.currentPlay.islocal)
        this.setMusicText(musicText);
        // this.setPlayIndex(index);
    }
}