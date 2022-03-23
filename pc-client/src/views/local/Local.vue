<template>
  <div class="local">
    <h1>本地和下载</h1>
    <div class="controls">
      <el-button @click="toPlayAll" type="primary" size="mini">播放全部</el-button>
      <span class="music_num"></span>
    </div>
    <div class="music_table">
      <div class="thead">
        <div class="th">歌曲</div>
        <div class="th">歌手</div>
        <div class="th">专辑</div>
      </div>
      <div class="tbody">
        <div v-if="!musicList.length" class="nomusic">暂无数据</div>
        <my-scroll>
          <div :style="{'background':currentPlay&&currentPlay.name==v.name?'rgba(0,0,0,0.3)':''}" @click="clickPlay(v,i)" v-for="(v, i) in musicList" :key="i" class="tr">
            <div class="td"><p :title="v.name" class="name">{{ v.name }}</p></div>
            <div class="td"><p class="author">{{v.id3.ID3V1.author}}</p></div>
            <div class="td"><p class="album">{{v.id3.ID3V1.album}}</p></div>
          </div>
        </my-scroll>
      </div>
    </div>
  </div>
</template>
<script lang="ts" src="./Local.ts"></script>
<style lang="scss" scoped src="./Local.scss"></style>