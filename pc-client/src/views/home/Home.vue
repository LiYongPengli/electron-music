<template>
  <div class="home" :style="{'background-image':'url('+globelConfig.appconfig.theme.background+')'}">
    <leftBar />
    <div class="rightContent">
      <top-bar class="top" />
      <div class="content">
        <router-view />
      </div>
      <play-control v-if="globelConfig.historyConf.playList.length&&!showMusicInfo" />
      <div v-if="!globelConfig.historyConf.playList.length" class="nolist">
        音乐让生活更美好
      </div>
    </div>
    <!-- 音乐详情 -->
    <transition
      @after-enter="showContent = true"
      @after-leave="showContent = false"
      name="slider"
    >
      <music-info
        @close="setShowMusicInfo(false)"
        :background="music_picture"
        :showContent.sync="showContent"
        v-if="showMusicInfo"
      />
    </transition>
    <!-- 均衡器 -->
    <sound-config @close="setShowSoundConfig(false)" v-show="showSoundConfig" />
  </div>
</template>

<script src="./Home.ts" lang="ts"></script>
<style src="./Home.scss" lang="scss" scoped></style>
