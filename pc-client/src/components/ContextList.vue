<template>
  <div class="contextlist">
    <el-popover
      popper-class="context"
      :placement="placement"
      width="50"
      trigger="click"
    >
      <ul>
        <li
          @click="toLike"
          :class="{ disabled: ~userMessage.likes.indexOf(currentPlay._id) }"
        >
          <i class="iconfont icon-xihuan1"></i>添加到我喜欢
        </li>
        <el-popover popper-class="context" placement="right" trigger="hover">
          <ul>
            <li
              style="cursor: pointer"
              @click="toAddMusicList(v)"
              v-for="(v, i) in userMessage.musicList"
              :key="i"
            >
              {{ v.name }}
            </li>
          </ul>
          <li slot="reference"><i class="el-icon-document"></i>添加到歌单</li>
        </el-popover>
      </ul>
      <slot slot="reference"></slot>
    </el-popover>
  </div>
</template>

<script lang="ts">
import { State } from "vuex-class";
import { Component, Prop, Vue } from "vue-property-decorator";
import { Music, MusicList, UserMessage } from "@/interfaces";
@Component
export default class ContextList extends Vue {
  @Prop({ default: "top-start" }) placement!: string;
  @State("currentPlay") currentPlay!: Music;
  @State("inlineList") inlineList!: Array<Music>;
  @State("userMessage") userMessage!: UserMessage;

  public toLike() {
    if (~this.userMessage.likes.indexOf(this.currentPlay._id)) return;
    let id = this.currentPlay._id;
    if (!id) {
      this.$message.error("未找到线上歌曲!");
      return;
    }
    this.api.userislike({ m_id: id, islike: 1 }).then((res) => {
      this.userMessage.likes.push(id);
    });
  }

  public toAddMusicList(item: MusicList) {
    if (!this.currentPlay._id) {
      this.$message.error("未找到线上歌曲!");
      return;
    }
    this.api
      .addMusicList({
        listname: item.name,
        m_id: this.currentPlay._id,
      })
      .then((res) => {
        if (res.data.status == 1) {
          this.$message.success("添加成功");
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }
}
</script>

<style lang="scss">
.contextlist {
}
.context {
  ul {
    li {
      padding: 5px;
      border-bottom: 1px solid lightgray;
      cursor: pointer;
      i {
        margin-right: 10px;
      }
    }
    li:hover {
      background: rgba(0, 0, 0, 0.3);
    }
    li:last-of-type {
      border-bottom: none;
    }
  }
}
.disabled {
  color: lightgray;
  cursor: not-allowed !important;
}
</style>