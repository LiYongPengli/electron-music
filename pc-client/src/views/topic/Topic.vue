<template>
  <div class="topic">
    <div class="top">
      <div class="music_photo">
        <img :src="photo" alt="" />
      </div>
      <div class="music_info">
        <p class="name">{{ currentPlay.name }}</p>
        <span>歌手: {{ currentPlay.id3.ID3V1.author }}</span>
        <span>专辑: {{ currentPlay.id3.ID3V1.album }}</span>
      </div>
    </div>
    <p class="num">评论({{ topicList.length }})</p>
    <div class="content">
      <my-scroll>
        <div class="say_wrap">
          <textarea
            v-model="say"
            rows="4"
            placeholder="请输入你的评论"
          ></textarea>
          <div class="btns">
            <el-popover popper-class="emojiP" trigger="click">
              <VEmojiPicker @select="selectEmoji" />
              <span slot="reference" class="iconfont icon-biaoqing"></span>
            </el-popover>
            <span @click="toTopic">发布</span>
          </div>
        </div>
        <!-- 用户评论区 -->
        <ul class="user_saylist">
          <topic-item @refash="refashData" v-for="(v,i) in topicList" :m_id="currentPlay._id" :key="i" :item="v" />
        </ul>
      </my-scroll>
    </div>
  </div>
</template>

<script lang="ts" src="./Topic.ts"></script>
<style lang="scss" src="./Topic.scss"></style>