import { GlobelConfig, Music, UserTopic } from '@/interfaces';
import { ID3V2Label } from '@/libs/ID3Reader';
import { Component, Vue, Watch } from 'vue-property-decorator';
import { State } from 'vuex-class';
import VEmojiPicker from 'v-emoji-picker';
import MyScroll from '@/components/MyScroll.vue';
import TopicItem from '@/components/TopicItem.vue';
Vue.use(VEmojiPicker);
@Component({
    components:{
        MyScroll,
        TopicItem
    }
})
export default class Topic extends Vue {
    public currentPlay!: Music;
    public say:string = "";
    public topicList:Array<UserTopic> = [];
    @State('playIndex') playIndex!: number;
    @State('globelConfig') globelConfig!: GlobelConfig;
    public photo: string = "";
    created() {
        for (let i of this.globelConfig.historyConf.playList) {
            if (i._id == this.$route.params.id) {
                this.currentPlay = i;
                break;
            }
        }
        let apic = <ID3V2Label>this.currentPlay.id3.ID3V2.APIC;
        if (apic) {
            this.getMediaImg(apic);
        }
        this.getTopicList();
    }

    @Watch("$route.params.id")
    listenPlayIndex() {
        for (let i of this.globelConfig.historyConf.playList) {
            if (i._id == this.$route.params.id) {
                this.currentPlay = i;
                break;
            }
        }
        let apic = <ID3V2Label>this.currentPlay.id3.ID3V2.APIC;
        if (apic) {
            this.getMediaImg(apic);
        }
        this.getTopicList();
    }

    private getTopicList(){
        this.api.getTopic(this.$route.params.id).then(res=>{
            console.log(res.data);
            this.topicList = res.data.data.topics;
            this.topicList.sort(function(a,b){
                return b.publish_time - a.publish_time;
            })
        }).catch(err=>{
            console.log(err);
        })
    }

    //获取封面图片
    private getMediaImg(apic: ID3V2Label): void {
        let seek = 0;
        let content = apic.content;
        let encoding = content[0];
        seek++;
        seek += content.slice(1).indexOf(0);
        let type = "";
        for (let i of content.slice(1, seek)) {
            type += String.fromCharCode(i);
        }
        seek++;
        let imgType = content[seek];
        if (encoding == 0x00) {
            while (content[seek] != 0x00) {
                seek++;
            }
            seek++;
        } else {
            while (content[seek] != 0x00 || content[seek + 1] != 0x00) {
                seek += 2;
            }
            seek += 2;
        }
        let blob = new Blob([new Uint8Array(content.slice(seek))], { type: type });
        setTimeout(() => {
            this.photo = URL.createObjectURL(blob);
        }, 200);
    }
    //选择表情
    public selectEmoji(emoji: any) {
        this.say+=emoji.data;
    }

    //发布评论
    public toTopic(){
        if(!this.say) return;
        this.api.topic({
            m_id:this.$route.params.id,
            text:this.say,
            toUser:''
        }).then(res=>{
            console.log(res.data)
            this.getTopicList();
            this.say = "";
        }).catch(err=>{
            console.log(err);
        })
    }

    public refashData(){
        this.getTopicList();
    }
}