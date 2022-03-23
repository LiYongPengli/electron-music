<template>
  <div class="soundslider">
    <el-slider
      :disabled="!turn_on"
      :min="0"
      :step="0.1"
      :max="1"
      v-model="item.value"
      vertical
      height="150px"
    >
    </el-slider>
    <div class="label">{{ item.label }}</div>
  </div>
</template>

<script lang="ts">
import { State } from "vuex-class";
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
@Component
export default class SoundSlider extends Vue {
  @Prop({}) item!: { label: string; value: number; type: number };
  //是否开启音效
  @Prop({}) turn_on!: boolean;
  @State("audioContext") audioContext!: AudioContext;
  @State("audioSource") audioSource!: MediaElementAudioSourceNode;
  public biquadFilter: BiquadFilterNode | null = null;
  public gain: GainNode | null = null;
  created() {
    if (this.turn_on) {
      if (!this.biquadFilter) {
        this.createBiquadFilterNode();
      }
    }
  }

  @Watch("turn_on")
  listenTurnOn(newVal: boolean) {
    if (newVal) {
      setTimeout(() => {
        this.createBiquadFilterNode();
      }, 200);
    } else {
      this.biquadFilter!.disconnect();
      this.gain!.disconnect();
      this.biquadFilter = null;
      this.gain = null;
    }
  }

  @Watch("item.value", { deep: true })
  listenValue(newVal: number) {
    this.gain!.gain.value = newVal;
  }

  private createBiquadFilterNode() {
    this.biquadFilter = this.audioContext.createBiquadFilter();
    this.gain = this.audioContext.createGain();
    this.gain.gain.value = this.item.value;
    this.biquadFilter.type = "bandpass";
    this.biquadFilter.Q.value = 1;
    this.biquadFilter.frequency.value = this.item.type;
    this.audioSource.connect(this.biquadFilter);
    this.biquadFilter.connect(this.gain);
    this.gain.connect(this.audioContext.destination);
  }

  //   beforeDestroy() {
  //     this.biquadFilter!.disconnect();
  //     this.gain!.disconnect();
  //     this.biquadFilter = null;
  //     this.gain = null;
  //   }
}
</script>

<style lang="scss">
.soundslider {
  .label {
    color: gray;
    margin-top: 20px;
    text-align: center;
    font-size: 14px;
  }
}
</style>