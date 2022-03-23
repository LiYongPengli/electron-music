import { Component, Vue, Watch } from 'vue-property-decorator';
import MyScroll from '@/components/MyScroll.vue';
import fs from 'fs';
import { remote } from 'electron';
import { Mutation, State } from 'vuex-class';
import { GlobelConfig } from '@/interfaces';
@Component({
    components:{
        MyScroll
    }
})
export default class Settings extends Vue{
    @State('globelConfig') globelConfig!:GlobelConfig;
    @Mutation('setGlobelConfig') setGlobelConfig!:(config:GlobelConfig)=>void;
    public downloadPath:string = "";
    public text:boolean = false;
    created(){
        this.downloadPath = this.globelConfig.appconfig.localPath
        this.text = this.globelConfig.appconfig.text.lrc
    }

    @Watch('text',{deep:true})
    listenTextChange(newVal:any){
        this.globelConfig.appconfig.text.lrc = this.text;
        this.setGlobelConfig(this.globelConfig);
    }


    //选择目录
    public chooseDirectory(){
        remote.dialog.showOpenDialog({
            properties:['openDirectory']
        }).then(res=>{
            if(!res.canceled) this.downloadPath = res.filePaths[0];
            this.globelConfig.appconfig.localPath = this.downloadPath;
            this.setGlobelConfig(this.globelConfig);
        }).catch(err=>{
            console.log(err);
        })
    }

    //显示文件夹
    public showDirectory(){
        remote.shell.openPath(this.downloadPath+'\\');
    }
}