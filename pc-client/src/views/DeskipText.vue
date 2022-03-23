<template>
  <!-- 桌面歌词 -->
  <div ref="deskiptext" class="deskiptext">
    <div class="drag"></div>
    <div v-if="false" class="text" ref="text"></div>
    <div v-if="textType=='lrc'" class="text_krc">
      {{lrcText}}
    </div>
    <div class="text_krc" v-if="textType=='krc'">
      <template v-for="(v, i) in textLine">
        <span
          :key="i"
          :style="{ '--fontColor': activeWidth }"
          :data-content="typeof v == 'String' ? '' : v.text"
          :class="{
            color: activeFont == i,
            no_color: activeFont > i,
          }"
          v-if="v.text"
          >{{ v.text }}</span
        >
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import { ipcRenderer, remote } from "electron";
import { Component, Ref, Vue } from "vue-property-decorator";
import { Font } from "@/libs/DecodKrc";
import { IpcDeskText, KrcIpcText } from "@/interfaces";
@Component
export default class DeskipText extends Vue {
  @Ref("text") text!: HTMLCanvasElement;
  @Ref("deskiptext") readonly deskiptext!: HTMLElement;
  public textLine: Array<string | Font> = [];
  public activeWidth: string = "0";
  public activeFont: number = 0;
  public textDelay: number = 0;
  public lrcText:string = "";
  public textType:string = ""
  public created() {
    ipcRenderer.on("text", (e, data: string) => {
      let res = JSON.parse(data) as IpcDeskText;
      if(res.type=='lrc'){
        this.setLrc(res.data as string);
      }else{
        this.setKrc(res.data as KrcIpcText)
      }
    });
  }

  //设置lrc歌词
  private setLrc(text:string){
    this.textType = 'lrc';
    this.lrcText = text;
  }

  private setKrc(datas:KrcIpcText){
    this.textType = 'krc';
    if (datas.reset) this.activeFont = 0;
      this.textLine = datas.line;

      let currentLineTime = (<string>this.textLine[0]).split(",")[0];
      let currentFont = <Font>this.textLine[this.activeFont];
      let font = <Font>this.textLine[this.activeFont + 1];
      if (currentFont && currentFont.duration) {
        let playTime =
          datas.currentTime * 1000 -
          parseInt(currentLineTime) -
          (currentFont.start + this.textDelay);
        if (playTime < currentFont.duration) {
          this.activeWidth = (playTime / currentFont.duration) * 100 + "%";
        } else {
          this.activeWidth = "100%";
        }
      }

      if (font) {
        if (
          Math.floor(datas.currentTime * 1000) >
          font.start + parseInt(currentLineTime) + this.textDelay
        ) {
          this.activeFont++;
          this.activeWidth = "0";
        }
      }
  }

  public mounted() {
    this.setPosition();
  }

  //设置窗口位置
  private setPosition(): void {
    let dragging = false;
    let mouseX = 0;
    let mouseY = 0;
    this.deskiptext.addEventListener("mousedown", (e) => {
      dragging = true;
      const { pageX, pageY } = e;
      mouseX = pageX;
      mouseY = pageY;
    });
    window.addEventListener("mouseup", () => {
      dragging = false;
    });
    this.deskiptext.addEventListener("mousemove", (e: MouseEvent) => {
      if (dragging) {
        const { pageX, pageY } = e;
        const win = remote.getCurrentWindow();
        const pos = win.getPosition();
        pos[0] = pos[0] + pageX - mouseX;
        pos[1] = pos[1] + pageY - mouseY;
        win.setPosition(pos[0], pos[1], true);
      }
    });
  }
}
</script>

<style lang="scss" scoped>
.deskiptext {
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0);
  position: relative;
  cursor: move;
  user-select: none;
  // -webkit-app-region: drag;
  .text {
    width: 100%;
    height: 100%;
  }
  .text_krc {
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 25px;
    color: orange;
  }
  .color,
  .no_color {
    // display: block;
    position: relative;
    overflow: hidden;
  }
  .color::before {
    position: absolute;
    left: 0;
    top: 0;
    color: blue;
    // display: block;
    width: var(--fontColor);
    /*如果想变色一半文字，就设置50%*/
    content: attr(data-content);
    /* 伪元素的动态获取内容 */
    overflow: hidden;
  }
  .no_color::before {
    position: absolute;
    left: 0;
    top: 0;
    color: blue;
    display: block;
    width: 100%;
    /*如果想变色一半文字，就设置50%*/
    content: attr(data-content);
    /* 伪元素的动态获取内容 */
    overflow: hidden;
  }
  &:hover {
    background: rgba(0, 0, 0, 0.5);
  }
}
</style>