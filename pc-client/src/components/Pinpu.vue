<template>
  <div ref="wrap" class="pinpu">
      <canvas ref="canvas"></canvas>
  </div>
</template>

<script lang="ts">
import { State } from "vuex-class";
import { Component, Ref, Vue, Watch } from "vue-property-decorator";
@Component
export default class PinPu extends Vue {
    @Ref('wrap') readonly wrap!:HTMLDivElement;
    @Ref('canvas') readonly canvas!:HTMLCanvasElement;
    @State('currentTime') currentTime!:number;
    @State('audioContext') audioContext!:AudioContext;
    @State('analyser') analyser!:AnalyserNode;
    private pinpuData!:Uint8Array;
    private ctx!:CanvasRenderingContext2D;
    private headerArr:number[] = [];
    private lineStyle!:CanvasGradient;
    
    @Watch('currentTime')
    run(){
        if(!this.pinpuData) return;
        this.draw();
    }


    mounted(){
        this.canvas.width = this.wrap.offsetWidth
        this.canvas.height = this.wrap.offsetHeight
        this.pinpuData = new Uint8Array(this.analyser.frequencyBinCount);
        this.ctx = this.canvas.getContext('2d')!;
        this.lineStyle = this.ctx.createLinearGradient(0,this.canvas.height/2,this.canvas.width,this.canvas.height/2);
        this.lineStyle.addColorStop(0,'lightgreen');
        this.lineStyle.addColorStop(0.5,'green');
        this.lineStyle.addColorStop(1,'lightgreen');
        for(let i=0;i<100;i++){
            this.headerArr.push(this.canvas.height);
        }
    }

    private draw(){
        this.analyser.getByteFrequencyData(this.pinpuData)
        this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
        for(let i=0;i<100;i++){
            this.ctx.beginPath();
            this.ctx.moveTo(i*10+10,this.canvas.height);
            this.ctx.strokeStyle = this.lineStyle;
            this.ctx.lineWidth = 4;
            this.ctx.lineTo(i*10+10,(this.canvas.height-this.pinpuData[i*5]/3)*1.5);
            this.ctx.stroke();
            this.ctx.closePath();
            this.ctx.beginPath();
            if(this.headerArr[i]>(this.canvas.height-this.pinpuData[i*5]/3)*1.5) this.headerArr[i] = (this.canvas.height-this.pinpuData[i*5]/3)*1.5;
            this.ctx.moveTo(i*10+10,this.headerArr[i]-1);
            this.ctx.strokeStyle = 'rgba(16, 190, 143, 1)';
            this.ctx.lineTo(i*10+10,this.headerArr[i]+1)
            this.headerArr[i]+=0.3
            if(this.headerArr[i]>this.canvas.height) this.headerArr[i] = this.canvas.height;
            this.ctx.stroke()
            this.ctx.closePath();
        }
    }
}
</script>

<style lang="scss" scoped>
.pinpu{
    width: 100%;
    height: 100%;
}
</style>