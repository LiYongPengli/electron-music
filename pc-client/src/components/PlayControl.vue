<template>
  <div class="playcontrol">
    <div @click="jump" ref="tpbar" class="tpbar">
      <div class="pre" :style="{ width: current + '%' }"></div>
    </div>
    <div v-if="globelConfig.historyConf.playList.length" class="body">
      <div class="left">
        <div @mouseenter="showControl = true" @mouseleave="showControl = false" class="icon">
          <img :src="music_picture" alt />
          <div @click="setShowMusicInfo(true)" v-show="showControl" class="icon_control el-icon-d-arrow-right"></div>
        </div>
        <div class="music_info">
          <p class="name">{{ currentPlay.name }}</p>
          <p v-if="currentPlay.id3" class="author">{{ currentPlay.id3.ID3V1.author }}</p>
          <div class="music_control">
            <div class="nolike_wrap" @click="toLike(1)" v-if="
              !userMessage || !~userMessage.likes.indexOf(currentPlay._id)
            ">
              <span v-if="currentPlay._id && currentPlay.likes.length" class="label">{{ currentPlay.likes.length }}</span>
              <span class="nolike iconfont icon-xihuan1"></span>
            </div>
            <span @click="toLike(0)" v-else class="like iconfont icon-xihuan"></span>
            <span @click="toDownload" class="download iconfont icon-xiazai"></span>
            <context-list v-if="userMessage">
              <span class="more iconfont icon-gengduocaozuo"></span>
            </context-list>
          </div>
        </div>
      </div>
      <div class="center">
        <div class="play_sort">
          <el-dropdown size="mini" @command="playtypeChg" trigger="click">
            <span class="el-dropdown-link">
              <span v-if="globelConfig.historyConf.playetype == 'loop'" class="loop iconfont icon-ziyuan"></span>
              <span v-if="globelConfig.historyConf.playetype == 'sort'" class="loop iconfont icon-shunxubofang"></span>
              <span v-if="globelConfig.historyConf.playetype == 'loopone'" class="loop iconfont icon-danquxunhuan"></span>
              <span v-if="globelConfig.historyConf.playetype == 'random'" class="loop iconfont icon-suijibofang"></span>
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="loop" icon="iconfont icon-ziyuan">循环播放</el-dropdown-item>
              <el-dropdown-item command="sort" icon="iconfont icon-shunxubofang">顺序播放</el-dropdown-item>
              <el-dropdown-item command="random" icon="iconfont icon-suijibofang">随机播放</el-dropdown-item>
              <el-dropdown-item command="loopone" icon="iconfont icon-danquxunhuan">单曲循环</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
        <div @click="playUp" class="up el-icon-d-arrow-left"></div>
        <div @click="playOrPause" class="play" :class="{
          'el-icon-video-play': audio.paused,
          'el-icon-video-pause': !audio.paused,
        }"></div>
        <div @click="playNext" class="next el-icon-d-arrow-right"></div>
        <div class="vol">
          <el-popover popper-class="volume-popper" placement="top" width="15" trigger="click">
            <div class="volume-slider">
              <el-slider :min="0" :max="100" :step="10" v-model="volume" vertical height="100px"></el-slider>
            </div>
            <span slot="reference" class="volume iconfont icon-yinliang"></span>
          </el-popover>
        </div>
      </div>
      <div class="right">{{ init_time(currentTime) }}/{{ init_time(duration) }}</div>
    </div>
  </div>
</template>

<script lang="ts">
import { Mutation, State } from "vuex-class";
import { Component, Ref, Vue, Watch } from "vue-property-decorator";
import { GlobelConfig, Music, PlayType, UserMessage } from "@/interfaces";
import { ID3V2Label } from "@/libs/ID3Reader";

import ContextList from "@/components/ContextList.vue";
import fs from "fs";
import http from "http";
import { ipcRenderer, net } from "electron";
@Component({
  components: {
    ContextList,
  },
})
export default class PlayControl extends Vue {
  @State("userMessage") userMessage!: UserMessage;
  @State("inlineList") inlineList!: Array<Music>;
  @State("audio") audio!: HTMLAudioElement;
  @State("currentTime") currentTime!: number;
  @State("duration") duration!: number;
  @State("playIndex") playIndex!: number;
  @State("currentPlay") currentPlay!: Music;
  @State("globelConfig") globelConfig!: GlobelConfig;
  @Ref("tpbar") readonly tpbar!: HTMLElement;
  @State("music_picture") music_picture!: string;
  @State("showMusicInfo") showMusicInfo!: boolean;
  public volume: number = 0;

  public showControl: boolean = false;

  @Mutation("setMusicPicture") setMusicPicture!: (str: string) => void;
  @Mutation("setShowMusicInfo") setShowMusicInfo!: (n: boolean) => void;
  @Mutation("setPlayIndex") setPlayIndex!: (index: number) => void;
  @Mutation("setGlobelConfig") setGlobelConfig!: (conf: GlobelConfig) => void;

  private timer: any = null;

  @Watch("volume")
  changeVolume() {
    this.globelConfig.historyConf.volume = this.volume / 100;
    this.audio.volume = this.volume / 100;
    this.setGlobelConfig(this.globelConfig);
  }

  @Watch("playIndex")
  listenPlayIndex() {
    setTimeout(async () => {
      let apic;
      if (this.currentPlay.id3.ID3V2) {
        apic = <ID3V2Label>this.currentPlay.id3.ID3V2.APIC;
      } else {
        let data = await this.api.musicPhoto(this.currentPlay._id);
        this.currentPlay.id3.ID3V2 = data.data.data.id3.ID3V2;
        apic = data.data.data.id3.ID3V2.APIC as ID3V2Label;
      }
      if (apic) {
        this.getMediaImg(apic);
      }
    }, 200);
  }

  async created() {
    this.volume = Math.floor(this.audio.volume * 100);
    let apic;
    if (this.currentPlay.id3.ID3V2) {
      apic = <ID3V2Label>this.currentPlay.id3.ID3V2.APIC;
    } else {
      let data = await this.api.musicPhoto(this.currentPlay._id);
      if (data.data.data) {
        apic = data.data.data.id3.ID3V2.APIC as ID3V2Label;
        this.currentPlay.id3.ID3V2 = data.data.data.id3.ID3V2;
      }
    }
    if (apic) {
      this.getMediaImg(apic);
    }
  }

  get current() {
    if (this.duration == 0) return 0;
    return (this.currentTime / this.duration) * 100;
  }

  public playtypeChg(n: PlayType) {
    this.globelConfig.historyConf.playetype = n;
    this.setGlobelConfig(this.globelConfig);
  }

  //下一首
  public playNext() {
    if (this.globelConfig.historyConf.playetype != "random") {
      if (this.playIndex < this.globelConfig.historyConf.playList.length - 1) {
        this.setPlayIndex(this.playIndex + 1);
      } else {
        this.setPlayIndex(0);
      }
    }
  }

  //上一首
  public playUp() {
    if (this.globelConfig.historyConf.playetype != "random") {
      if (this.playIndex < 1) {
        this.setPlayIndex(this.globelConfig.historyConf.playList.length - 1);
      } else {
        this.setPlayIndex(this.playIndex - 1);
      }
    }
  }

  public init_time(time: number) {
    let hour = Math.floor(time / 60 / 60);
    let min = Math.floor(time / 60);
    let seconds = Math.floor(time % 60);
    return `${hour > 0 ? (hour > 9 ? hour : "0" + hour) + ":" : ""}${min > 9 ? min : "0" + min
      }:${seconds > 9 ? seconds : "0" + seconds}`;
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

  public jump(e: MouseEvent) {
    let position = e.clientX - this.tpbar.offsetLeft;
    this.audio.currentTime =
      this.duration * (position / this.tpbar.clientWidth);
  }

  //下载
  public toDownload() {
    if (this.currentPlay.islocal) {
      this.$message.success("文件已存在");
      return;
    }
    let downloadPath =
      this.axios.defaults.baseURL + "/download?id=" + this.currentPlay._id;
    ipcRenderer.send(
      "download",
      JSON.stringify({
        url: downloadPath,
        lrc: this.globelConfig.appconfig.text.lrc,
        id: this.currentPlay._id,
        type: this.currentPlay.path.slice(this.currentPlay.path.indexOf(".")),
        name: this.currentPlay.name,
        savePath: this.globelConfig.appconfig.localPath,
      })
    );
  }

  //喜欢与不喜欢
  public toLike(type: 0 | 1) {
    if (!this.userMessage) {
      this.$message.warning("请登录后操作!");
      return;
    }
    let id = this.currentPlay._id;
    if (!id) {
      this.$message.error("未找到线上歌曲!");
      return;
    }
    this.api.userislike({ m_id: id, islike: type }).then((res) => {
      if (type) {
        this.userMessage.likes.push(id);
        this.currentPlay.likes.push(this.userMessage._id);
      } else {
        this.userMessage.likes.splice(this.userMessage.likes.indexOf(id), 1);
        this.currentPlay.likes.splice(
          this.currentPlay.likes.indexOf(this.userMessage._id),
          1
        );
      }
    });
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
      this.setMusicPicture(URL.createObjectURL(blob))
    }, 200);
  }
}
</script>

<style lang="scss" scoped>
.playcontrol {
  height: 70px;
  box-sizing: border-box;
  padding-top: 3px;
  .tpbar {
    width: 100%;
    height: 3px;
    margin-top: -3px;
    cursor: pointer;
    background: gray;
    .pre {
      height: 100%;
      background: green;
    }
  }

  .body {
    display: flex;
    height: 100%;
    .left,
    .right {
      flex: 1;
    }
    .center {
      flex: 2;
      display: flex;
      align-items: center;
      justify-content: center;
      .play {
        color: white;
        font-weight: 500;
        font-size: 50px;
        cursor: pointer;
      }
      .play:hover {
        color: green;
      }
      .up,
      .next {
        font-size: 30px;
        font-weight: 600;
        color: white;
        cursor: pointer;
        margin: 0 10px;
      }
      .up:hover,
      .next:hover {
        color: green;
      }
      .play_sort {
        width: 20px;
        .loop {
          color: white;
          cursor: pointer;
          outline: none;
          font-size: 20px;
        }
        .loop:hover {
          color: chartreuse;
        }
      }
      .vol {
        color: white;
        .volume {
          outline: none;
          cursor: pointer;
        }
        .volume:hover {
          color: chartreuse;
        }
      }
    }
    .left {
      display: flex;
      align-items: center;
      padding-left: 20px;
      .icon {
        width: 55px;
        height: 55px;
        cursor: pointer;
        position: relative;
        img {
          display: block;
          width: 100%;
        }
        .icon_control {
          width: 100%;
          height: 100%;
          position: absolute;
          left: 0;
          top: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: 40px;
          color: white;
          transform: rotateZ(-90deg);
        }
      }
      .music_info {
        margin-left: 20px;
        text-overflow: ellipsis;
        overflow: hidden;
        .name {
          width: 200px;
          color: white;
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
          font-size: 14px;
        }
        .author {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.5);
        }
        .music_control {
          height: 20px;
          display: flex;
          align-items: center;
          color: white;
          span {
            font-size: 18px;
            margin-right: 10px;
            cursor: pointer;
          }
          span:hover {
            color: chartreuse;
          }
          .nolike_wrap {
            position: relative;
            .nolike:hover {
              color: red;
            }
            .label {
              position: absolute;
              top: -4px;
              right: -4px;
              font-size: 12px;
              transform: scale(0.8);
            }
          }
          .icon-xihuan {
            color: brown;
          }
          .icon-xihuan:hover {
            color: brown;
          }
        }
      }
    }
    .right {
      display: flex;
      align-items: center;
      color: white;
      font-size: 14px;
    }
  }
}
</style>