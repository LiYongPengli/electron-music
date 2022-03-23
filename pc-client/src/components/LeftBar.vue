<template>
  <div class="leftbar">
    <div class="logo">
      <img src="../../public/icon.png" alt="">
      <span>lyps</span>
    </div>
    <el-menu
      router
      text-color="white"
      active-text-color="blue"
      class="el-menu"
      :unique-opened="false"
      :default-active="$route.path"
      :default-openeds="['1','2']"
    >
      <template v-for="(v, i) in barMenu">
        <el-submenu v-if="v.children" :key="i" :index="v.index">
          <template slot="title">
            <i style="color: white" :class="v.icon"></i>
            <span>{{ v.title }}</span>
          </template>
          <el-menu-item
            v-for="(item, index) in v.children"
            :key="index"
            :index="item.index"
          >
            {{ item.title }}
          </el-menu-item>
        </el-submenu>
        <el-menu-item v-if="!v.children" :key="i" :index="v.index">
         <template slot="title">
            <i style="color: white" :class="v.icon"></i>
            <span>{{ v.title }}</span>
          </template>
        </el-menu-item>
      </template>
    </el-menu>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { State } from "vuex-class";
import { LeftBarMenu, UserMessage } from "@/interfaces";
@Component
export default class LeftBar extends Vue {
  @State("userMessage") userMessage!: UserMessage;
  @State("leftBar") barMenu!: Array<LeftBarMenu>;

  created() {
    if (this.userMessage) {
      for (let i = 0; i < this.barMenu.length; i++) {
        if (this.barMenu[i].title == "我的歌单") {
          for (let item of this.userMessage.musicList) {
            this.barMenu[i].children!.push({
              title: item.name,
              index: "/musiclist/" + item.name,
            });
          }
        }
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.leftbar {
  height: 100%;
  border-right: 1px solid lightgray;
  background-color: rgba(0, 0, 0, 0.3);
  .logo{
    display: flex;
    align-items: center;
    padding-top: 20px;
    img{
      width: 80px;
      display: block;
      margin-left: 20px;
    }
    span{
      font-size: 40px;
      color: white;
      margin-left: 10px;
    }
  }
}
</style>
