<template>
  <div id="app">
    <router-view v-if="appready" />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import fs from "fs";
import { Mutation, State } from "vuex-class";
import { GlobelConfig, Music } from "./interfaces";
import { app, ipcRenderer, remote } from "electron";
@Component
export default class App extends Vue {
  @State("dataBase") dataBase!: IDBDatabase;
  @Mutation("setGlobelConfig") setGlobelConfig!: (config: GlobelConfig) => void;
  @Mutation("setCurrentPlay") setCurrentPlay!: (music: Music | null) => void;
  @Mutation("setPlayIndex") setPlayIndex!: (index: number) => void;
  @Mutation("setDataBase") setDataBase!: (db: IDBDatabase) => void;
  public appready: boolean = false;
  async created() {
    if (localStorage.token)
      this.axios.defaults.headers = { token: localStorage.token };
    let dbreq = indexedDB.open("configs");
    dbreq.onerror = this.OpenDbError;
    dbreq.onsuccess = this.OpenDbSuccess;
    dbreq.onupgradeneeded = this.changeDbVersion;
    ipcRenderer.on('download',(e,data)=>{
      let res = JSON.parse(data) as {size:number;current:number};
      if(res.size<=res.current){
        this.$message.success('下载完成');
      }
    })
  }

  private OpenDbError(e: Event) {
    console.log("打开失败");
  }
  private async OpenDbSuccess(e: Event) {
    this.setDataBase((<IDBOpenDBRequest>e.target).result);
    let config = await this.loadApp();
    if (config) {
      this.setGlobelConfig(config);
      this.setCurrentPlay(config.historyConf.currentPlay);
      this.setPlayIndex(config.historyConf.currentIndex);
      this.appready = true;
    } else {
      this.initApp();
    }
  }

  private changeDbVersion(e: Event) {
    this.setDataBase((<IDBOpenDBRequest>e.target).result);
    if (!this.dataBase.objectStoreNames.contains("appConfig")) {
      this.dataBase.createObjectStore("appConfig", { keyPath: "id" });
    }
  }

  private initApp() {
    let req = this.dataBase.transaction(["appConfig"], "readwrite");
    let objectStore = req.objectStore("appConfig");
    let config: GlobelConfig = {
      id: "1",
      historyConf: {
        currentPlay: null,
        currentIndex: 0,
        volume: 1,
        playList: [],
        playetype: "loop",
      },
      appconfig: {
        localPath: remote.app.getPath('music') + "\\downloadmusic",
        theme:{
          background:require('@/assets/img/background/background.jpg'),
          localBackArr:[
            require('@/assets/img/background/background.jpg'),
            require('@/assets/img/background/background1.jpg'),
            require('@/assets/img/background/background2.jpg'),
            require('@/assets/img/background/background3.jpg'),
            require('@/assets/img/background/background4.jpg'),
            require('@/assets/img/background/background5.jpg')
          ]
        },
        text:{
          krc:false,
          lrc:false
        }
      },
      soundsFilter: {
        turnOn: false,
        biquadFilterArr: [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5],
      },
    };
    try {
      let stat = fs.statSync(config.appconfig.localPath);
      if (!stat.isDirectory()) fs.mkdirSync(config.appconfig.localPath);
    } catch (err) {
      fs.mkdirSync(config.appconfig.localPath);
    }
    objectStore.add(config);
    this.setGlobelConfig(config);
    this.appready = true;
    req.onerror = () => console.log("数据写入失败");
  }

  private async loadApp(): Promise<GlobelConfig> {
    let transaction = this.dataBase.transaction(["appConfig"], "readwrite");
    let objectStore = transaction.objectStore("appConfig");
    let req = objectStore.get("1");
    return new Promise((resolve, reject) => {
      req.onsuccess = (e) => {
        resolve(req.result);
      };
      req.onerror = (e) => {
        reject(500);
      };
    });
  }
}
</script>

<style lang="scss">
@import "./style.scss";
#app {
  width: 100%;
  height: 100%;
}
</style>
