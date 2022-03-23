import { Component, Vue, Watch } from "vue-property-decorator";
import MyScroll from "@/components/MyScroll.vue"
import { GlobelConfig, Music, UserMessage } from "@/interfaces";
import { Mutation, State } from "vuex-class";

@Component({
    components: {
        MyScroll
    }
})
export default class Likes extends Vue {
    public title:string = "在线音乐"
    public musicList: Array<Music> = [];
    public loading:boolean = true;
    @State('searchValue') searchValue!:string;
    @State('userMessage') userMessage!: UserMessage
    @State('audio') audio!: HTMLAudioElement
    @State('currentPlay') currentPlay!: Music;
    @State('playIndex') playIndex!: number;
    @State('globelConfig') globelConfig!: GlobelConfig;
    @Mutation('setCurrentPlay') setCurrentPlay!: (music: Music) => void;
    @Mutation('setPlayIndex') setPlayIndex!: (index: number) => void;
    @Mutation('setLnlineList') setLnlineList!: (list: Array<Music>) => void;
    @Mutation('setGlobelConfig') setGlobelConfig!: (conf: GlobelConfig) => void;
    created() {
        this.getMusicList();
        console.log(this.userMessage)
    }
    
    @Watch('$route.params.type')
    listenParams(newVal:any){
        this.getMusicList();
    }

    @Watch("searchValue")
    listenSearch(){
        if(this.$route.params.type=='inline'){
            this.getMusicList();
        }
    }

    //在线音乐
    private getInlineList(){
        this.api.inlineMusic(this.searchValue).then(res=>{
            this.setLnlineList(res.data.data);
            this.musicList = res.data.data;
            this.loading = false;
            if(!this.currentPlay) return;
            for(let i of this.musicList){
                if(this.currentPlay.name==i.name){
                    this.currentPlay._id = i._id;
                    break;
                }
            }
            this.setCurrentPlay(this.currentPlay);
            console.log(this.musicList);
        })
    }

    //我喜欢
    private getLikeList(type:string=""){
        if(!type){
            this.api.userlike().then(res=>{
                console.log(res.data);
                this.musicList = res.data.data;
                this.loading = false;
            })
        }else(
            this.api.userlike(type).then(res=>{
                console.log(res.data);
                this.musicList = res.data.data;
                this.loading = false;
            })
        )
        
    }

    private getMusicList(){
        this.loading = true;
        switch(this.$route.params.type){
            case 'likes':
                this.title = "我喜欢"
                this.getLikeList();
                break;
            case 'inline':
                this.title = "在线音乐"
                this.getInlineList();
                break;
            default:
                this.title = this.$route.params.type;
                this.getLikeList(this.$route.params.type)
        }
    }

    //播放全部
    public toPlayAll(){
        this.globelConfig.historyConf.playList = this.musicList;
        this.globelConfig.historyConf.currentPlay = this.musicList[0];
        this.globelConfig.historyConf.currentIndex = 0;
        this.setCurrentPlay(this.musicList[0]);
        this.setPlayIndex(0);
        this.setGlobelConfig(this.globelConfig);
    }

    public clickPlay(v: Music, index: number) {
        // this.toPlay(v,index);
        this.globelConfig.historyConf.playList = this.musicList;
        this.globelConfig.historyConf.currentPlay = v;
        this.globelConfig.historyConf.currentIndex = index;
        this.setGlobelConfig(this.globelConfig)
        this.setCurrentPlay(v);
        this.setPlayIndex(index);
        
    }

    public toLike(id:string,type:0|1){
        if(!this.userMessage){
            this.$message.warning('请登录后操作!');
            return;
        }
        this.api.userislike({m_id:id,islike:type}).then(res=>{
            if(type){
                this.userMessage.likes.push(id);
            }else{
                this.userMessage.likes.splice(this.userMessage.likes.indexOf(id),1);
            }
        })
    }
}