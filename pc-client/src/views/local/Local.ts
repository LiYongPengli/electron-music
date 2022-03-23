import { Component, Vue } from "vue-property-decorator";
import MyScroll from "@/components/MyScroll.vue"
import fs from "fs";
import path from "path";
import { GlobelConfig, Music } from "@/interfaces";
import { Mutation, State } from "vuex-class";
import ID3Reader from "@/libs/ID3Reader";
@Component({
    components: {
        MyScroll
    }
})
export default class Local extends Vue {
    public listurl: string = "";
    public musicList: Array<Music> = []
    @State('audio') audio!: HTMLAudioElement
    @State('currentPlay') currentPlay!: string;
    @State('playIndex') playIndex!: number;
    @State('globelConfig') globelConfig!: GlobelConfig;
    @Mutation('setCurrentPlay') setCurrentPlay!: (music: Music) => void;
    @Mutation('setPlayIndex') setPlayIndex!: (index: number) => void;
    @Mutation('setGlobelConfig') setGlobelConfig!: (conf: GlobelConfig) => void;
    created() {
        this.listurl = this.globelConfig.appconfig.localPath;
        this.toimport()
    }

    public async toimport() {
        try {
            let state = await fs.statSync(this.listurl);
            if (state.isDirectory()) {
                await this.getMusicList(this.listurl);
                if (!this.musicList.length) {
                    // this.$message.error("所选目录暂无mp3文件");
                    return;
                }
            } else {
                // this.$message.error("输入路径为非目录");
                return;
            }
            // localStorage.setItem("musicpath", this.listurl);
        } catch (err) {
            if (~err.message.indexOf("ENOENT: no such file or directory")) {
                this.$message.error("文件目录不存在");
                return;
            }
        }

        // this.getMusicList(this.listurl);
    }

    private async getMusicList(url: string) {
        let dir = await fs.readdirSync(url);
        dir.forEach(async (v, index) => {
            let filepath = path.join(url, v);
            let stat = await fs.statSync(filepath);
            if (stat.isFile() && v.endsWith(".mp3")) {
                let buffer = await fs.readFileSync(filepath);
                let id3 = new ID3Reader(buffer);
                this.musicList.push({
                    _id:v.split('@')[1]?v.split('@')[1].replace('.mp3',''):'',
                    path: filepath,
                    islocal: true,
                    topics:[],
                    likes:[],
                    name: v.split('@')[0],
                    id3: id3.getID3()
                });
            } else if (stat.isDirectory()) {
                await this.getMusicList(filepath);
            }
        });
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
}