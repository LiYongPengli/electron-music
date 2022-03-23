<template>
  <div class="soundconfig">
    <div class="top">
      <div class="swich">
        <span>音效开启</span>
        <el-switch
          v-model="switchs"
          active-color="#13ce66"
          inactive-color="#ff4949"
        >
        </el-switch>
      </div>
      <div @click="close" class="close el-icon-close"></div>
    </div>
    <div class="center">
      <div class="body">
        <sound-slider
          :turn_on.sync="switchs"
          :item="v"
          v-for="(v, i) in slides"
          :key="i"
        />
      </div>
      <div class="bottom">
        <el-form>
          <el-form-item label="消除人声">
            <el-switch
              v-model="disabledPeople"
              active-color="#13ce66"
              inactive-color="#ff4949"
            >
            </el-switch>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Mutation, State } from "vuex-class";
import { Component, Emit, Vue, Watch } from "vue-property-decorator";
import SoundSlider from "./SoundSlider.vue";
import { GlobelConfig } from "@/interfaces";
@Component({
  components: {
    SoundSlider,
  },
})
export default class SoundConfig extends Vue {
  @State("analyser") analyser!: AnalyserNode;
  @State("audioContext") audioContext!: AudioContext;
  @State("soundSwitch") soundSwitch!: boolean;
  @State("globelConfig") globelConfig!: GlobelConfig;
  @Mutation("setGlobelConfig") setGlobelConfig!: (n: GlobelConfig) => void;
  @Mutation("setSoundSwitch") setSoundSwitch!: (n: boolean) => void;
  public switchs: boolean = false;
  public disabledPeople:boolean = false;
  @Watch("switchs")
  listenSoundSwitch(newVal: boolean) {
    if (newVal) {
      this.analyser.disconnect();
      this.globelConfig.soundsFilter.turnOn = true;
    } else {
      setTimeout(() => {
        this.analyser.connect(this.audioContext.destination);
      }, 100);
      this.globelConfig.soundsFilter.turnOn = false;
    }
    this.setSoundSwitch(newVal);
  }

  @Watch('disabledPeople')
  listenDisabledPeople(newVal:boolean){
    if(newVal){
      
    }
  }

  public slides = [
    {
      label: "31",
      value: 0.5,
      type: 31,
    },
    {
      label: "62",
      value: 0.5,
      type: 62,
    },
    {
      label: "125",
      value: 0.5,
      type: 125,
    },
    {
      label: "250",
      value: 0.5,
      type: 250,
    },
    {
      label: "500",
      value: 0.5,
      type: 500,
    },
    {
      label: "1k",
      value: 0.5,
      type: 1000,
    },
    {
      label: "2k",
      value: 0.5,
      type: 2000,
    },
    {
      label: "4k",
      value: 0.5,
      type: 4000,
    },
    {
      label: "8k",
      value: 0.5,
      type: 8000,
    },
    {
      label: "16k",
      value: 0.5,
      type: 16000,
    },
  ];

  created() {
    let slides = this.globelConfig.soundsFilter.biquadFilterArr;
    this.switchs = this.globelConfig.soundsFilter.turnOn;
    for (let i = 0; i < slides.length; i++) {
      this.slides[i].value = slides[i];
    }
  }

  @Emit("close")
  close() {
    let arr = [];
    for (let i of this.slides) {
      arr.push(i.value);
    }
    this.globelConfig.soundsFilter.biquadFilterArr = arr;
    this.setGlobelConfig(this.globelConfig);
    return false;
  }
}
</script>

<style lang="scss" scoped>
.soundconfig {
  width: 500px;
  position: fixed;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: 1000;
  background: white;
  box-sizing: border-box;
  .top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: gray;
    padding: 10px;
    .swich {
      span {
        margin-right: 10px;
      }
    }
    .close {
      color: gray;
      cursor: pointer;
    }
  }
  .center {
    padding: 0 10px;
    .body {
      display: flex;
      justify-content: space-between;
    }
  }
  .bottom{
    color: black;
  }
}
</style>