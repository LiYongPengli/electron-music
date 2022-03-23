<template>
  <div class="likes">
    <h1>{{title}}</h1>
    <div class="controls">
      <el-button @click="toPlayAll" type="primary" size="mini"
        >播放全部</el-button
      >
      <span class="music_num"></span>
    </div>
    <div class="music_table">
      <div class="thead">
        <div class="th">歌曲</div>
        <div class="th"></div>
        <div class="th">歌手</div>
        <div class="th">专辑</div>
      </div>
      <div class="tbody">
        <div v-if="!musicList.length&&!loading" class="nomusic">暂无数据</div>
        <div v-if="!musicList.length&&loading" class="nomusic">数据加载中...</div>
        <my-scroll v-if="musicList.length">
          <div
            :style="{
              background:
                currentPlay && currentPlay.name == v.name
                  ? 'rgba(0,0,0,0.3)'
                  : '',
            }"
            @dblclick="clickPlay(v, i)"
            v-for="(v, i) in musicList"
            :key="i"
            class="tr"
          >
            <div class="td">
              <span @click="toLike(v._id,1)" v-if="!userMessage||!~userMessage.likes.indexOf(v._id)" class="iconfont icon-xihuan1"></span>
              <span @click="toLike(v._id,0)" v-else class="iconfont icon-xihuan"></span>
              <p :title="v.name" class="name">{{ v.name }}</p>
            </div>
            <div class="td">
              <span v-if="(currentPlay && currentPlay.name == v.name)&&!audio.paused" class="el-icon-loading"></span>
              <span @click="clickPlay(v, i)" v-else class="el-icon-video-play"></span>
            </div>
            <div class="td">
              <p class="author">{{ v.id3.ID3V1.author }}</p>
            </div>
            <div class="td">
              <p class="album">{{ v.id3.ID3V1.album }}</p>
            </div>
          </div>
        </my-scroll>
      </div>
    </div>
  </div>
</template>
<script lang="ts" src="./Likes.ts"></script>
<style lang="scss" scoped src="./Likes.scss"></style>