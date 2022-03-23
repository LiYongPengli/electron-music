<template>
  <div class="musicinfo">
    <div
      :style="{ 'background-image': 'url(' + background + ')' }"
      class="backimg"
    ></div>
    <div class="info_top">
      <span @click="toClose" class="el-icon-arrow-down left"></span>
      <div class="right">
        <span @click="appmini" class="min el-icon-minus"></span>
        <span @click="apphide" class="close el-icon-close"></span>
      </div>
    </div>
    <div class="info_center">
      <div class="music_photo">
        <img :src="background" alt="" />
      </div>
      <div class="music_text">
        <div class="music_text_top">
          <p class="music_title">{{ currentPlay.name }}</p>
          <p class="music_author">歌手：{{ currentPlay.id3.ID3V1.author }}</p>
          <p class="music_album">专辑：{{ currentPlay.id3.ID3V1.album }}</p>
        </div>
        <!-- 歌词 -->
        <div v-if="showContent" class="music_text_center">
          <div
            v-if="!textarr.length && loadText && !krcArr.length"
            class="noText"
          >
            暂无歌词
          </div>
          <!-- lrc -->
          <div
            v-if="!krcArr.length && textarr.length"
            class="music_texts"
            id="lrc_text"
          >
            <div class="swiper-wrapper">
              <template v-for="(v, i) in textarr">
                <div :key="i" class="swiper-slide">
                  <p :title="v[1]">{{ v[1] }}</p>
                </div>
              </template>
            </div>
          </div>
          <!-- krc -->
          <div
            v-if="krcArr.length && !textarr.length"
            class="music_texts"
            id="krc_text"
          >
            <div class="swiper-wrapper">
              <div v-for="(v, i) in krcArr" :key="i" class="swiper-slide">
                <p class="krc_text_line">
                  <span
                    v-show="index != 0"
                    :data-content="typeof font == 'string' ? '' : font.text"
                    :style="{ '--fontColor': musicText.activeWidth }"
                    :class="{
                      color: musicText.activeFont == index && musicText.activeIndex == i,
                      no_color: musicText.activeFont > index && musicText.activeIndex == i,
                    }"
                    v-for="(font, index) in v"
                    :key="index + 's'"
                    >{{ typeof font == "string" ? "" : font.text }}</span
                  >
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="pinpu">
      <pin-pu v-if="showContent" />
    </div>
    <div class="info_bottom">
      <div @click="jump" ref="tpbar" class="tpbar">
        <div class="pre" :style="{ width: current + '%' }"></div>
      </div>
      <div class="body">
        <div class="left">
          <div
            class="nolike_wrap"
            v-if="!userMessage || !~userMessage.likes.indexOf(currentPlay._id)"
          >
            <span
              v-if="currentPlay._id && currentPlay.likes.length"
              class="label"
              >{{ currentPlay.likes.length }}</span
            >
            <span
              @click="toLike(1)"
              class="nolike iconfont icon-xihuan1"
            ></span>
          </div>
          <span
            @click="toLike(0)"
            v-else
            class="like iconfont icon-xihuan"
          ></span>
          <span
            @click="toDownload"
            class="download iconfont icon-xiazai"
          ></span>
          <context-list v-if="userMessage">
            <span class="more iconfont icon-gengduocaozuo"></span>
          </context-list>
          <div class="say_wrap">
            <span
              v-if="currentPlay._id"
              class="label"
              >{{ currentPlay.topics.length }}</span
            >
            <span @click="toTopic" class="say iconfont icon-pinglun"></span>
          </div>
          <div class="time">
            {{ init_time(currentTime) }}/{{ init_time(duration) }}
          </div>
        </div>
        <div class="center">
          <div class="play_sort">
            <el-dropdown size="mini" @command="playtypeChg" trigger="click">
              <span class="el-dropdown-link">
                <span
                  v-if="globelConfig.historyConf.playetype == 'loop'"
                  class="loop iconfont icon-ziyuan"
                ></span>
                <span
                  v-if="globelConfig.historyConf.playetype == 'sort'"
                  class="loop iconfont icon-shunxubofang"
                ></span>
                <span
                  v-if="globelConfig.historyConf.playetype == 'loopone'"
                  class="loop iconfont icon-danquxunhuan"
                ></span>
                <span
                  v-if="globelConfig.historyConf.playetype == 'random'"
                  class="loop iconfont icon-suijibofang"
                ></span>
              </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item command="loop" icon="iconfont icon-ziyuan"
                  >循环播放</el-dropdown-item
                >
                <el-dropdown-item
                  command="sort"
                  icon="iconfont icon-shunxubofang"
                  >顺序播放</el-dropdown-item
                >
                <el-dropdown-item
                  command="random"
                  icon="iconfont icon-suijibofang"
                  >随机播放</el-dropdown-item
                >
                <el-dropdown-item
                  command="loopone"
                  icon="iconfont icon-danquxunhuan"
                  >单曲循环</el-dropdown-item
                >
              </el-dropdown-menu>
            </el-dropdown>
          </div>
          <div @click="playUp" class="up el-icon-d-arrow-left"></div>
          <div
            @click="playOrPause"
            class="play"
            :class="{
              'el-icon-video-play': audio.paused,
              'el-icon-video-pause': !audio.paused,
            }"
          ></div>
          <div @click="playNext" class="next el-icon-d-arrow-right"></div>
          <div class="vol">
            <el-popover
              popper-class="volume-popper"
              placement="top"
              width="15"
              trigger="click"
            >
              <div class="volume-slider">
                <el-slider
                  :min="0"
                  :max="100"
                  :step="10"
                  v-model="volume"
                  vertical
                  height="100px"
                >
                </el-slider>
              </div>
              <span
                slot="reference"
                class="volume iconfont icon-yinliang"
              ></span>
            </el-popover>
          </div>
        </div>
        <div class="right">
          <span
            v-show="!soundSwitch"
            @click="setShowSoundConfig(true)"
            class="soundoff"
            >音效 off</span
          >
          <span
            v-show="soundSwitch"
            @click="setShowSoundConfig(true)"
            class="soundon"
            >音效 on</span
          >
          <span
            @click="setShowDeskText(true)"
            v-show="!deskText"
            class="desk_text_off"
            >词</span
          >
          <span
            @click="setShowDeskText(false)"
            v-show="deskText"
            class="desk_text_on"
            >词</span
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" src="./MusicInfo.ts"></script>
<style lang="scss" src="./MusicInfo.scss" scoped></style>
<style lang="scss">
.volume-popper {
  min-width: 0 !important;
  .volume-slider {
    margin: auto;
    display: flex;
    justify-content: center;
  }
}
</style>