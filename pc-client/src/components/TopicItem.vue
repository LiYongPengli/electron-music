<template>
  <li class="topicitem">
    <div class="item_top">
      <div class="usericon">
        <img src="../assets/img/zwtx.png" alt="" />
      </div>
      <div class="userinfo">
        <p class="username">{{ item.topicUser.username }}</p>
        <span class="time">{{
          item.publish_time ? item.publish_time : "暂无"
        }}</span>
      </div>
    </div>
    <div class="item_text">{{ item.text }}</div>
    <div class="btns">
      <div class="praises">
        <span
          @click="toPraises('')"
          :class="{ xihuan: ~item.praises.indexOf(userMessage._id) }"
          class="iconfont icon-xihuan"
        ></span>
        <span class="num">{{ item.praises.length }}</span>
      </div>
      <span
        @click="showRevertText = !showRevertText"
        v-show="!showRevertText"
        class="revert"
        >回复</span
      >
      <span
        @click="showRevertText = !showRevertText"
        v-show="showRevertText"
        class="revert"
        >取消</span
      >
    </div>
    <!-- 回复框 -->
    <div v-show="showRevertText" class="revert_text">
      <textarea v-model="say" rows="4" placeholder="请输入你的评论"></textarea>
      <div class="btns">
        <el-popover popper-class="emojiP" trigger="click">
          <VEmojiPicker @select="selectEmoji" />
          <span slot="reference" class="iconfont icon-biaoqing"></span>
        </el-popover>
        <span @click="toTopic">发布</span>
      </div>
    </div>
    <!-- 回复的评论 -->
    <ul class="revert_list">
      <li v-for="(v, i) in item.reverts" :key="i">
        <span class="username">{{ v.topicUser.username }}:</span>
        <p>{{ v.text }}</p>
        <div class="praises">
          <span
            @click="toPraises(v)"
            :class="{ xihuan: ~v.praises.indexOf(userMessage._id) }"
            class="iconfont icon-xihuan"
          ></span>
          <span class="num">{{ v.praises.length }}</span>
        </div>
      </li>
    </ul>
  </li>
</template>

<script lang="ts">
import { UserMessage, UserTopic } from "@/interfaces";
import { State } from "vuex-class";
import { Component, Emit, Prop, Vue } from "vue-property-decorator";
import { PraiseTopic } from "@/apis";
@Component
export default class TopicItem extends Vue {
  @Prop({}) item!: UserTopic;
  @Prop({}) m_id!: string;
  @State("userMessage") userMessage!: UserMessage;
  public say: string = "";
  public showRevertText: boolean = false;

  //选择表情
  public selectEmoji(emoji: any) {
    this.say += emoji.data;
  }
  public toTopic() {
    this.api
      .topic({
        m_id: this.m_id,
        text: this.say,
        revert_id: this.item._id,
      })
      .then((res) => {
        console.log(res.data);
        this.showRevertText = false;
        this.say = "";
        this.toRefash();
      })
      .catch((err) => {
        console.log(err);
      });
  }

  public toPraises(item: UserTopic) {
    let prise: 0 | 1 = 0;
    if (!item) {
      if (!~this.item.praises.indexOf(this.userMessage._id)) prise = 1;
    } else {
      if (!~item.praises.indexOf(this.userMessage._id)) prise = 1;
    }
    let obj: PraiseTopic = {
      m_id: this.m_id,
      t_id: this.item._id,
      praise: prise,
    };
    if (item) {
      obj.res_id = item._id;
    }
    this.api
      .praise(obj)
      .then((res) => {
        if (prise) {
          if (item) {
            item.praises.push(this.userMessage._id);
          } else {
            this.item.praises.push(this.userMessage._id);
          }
        } else {
            if(item){
                item.praises.splice(item.praises.indexOf(this.userMessage._id),1)
            }else{
                this.item.praises.splice(this.item.praises.indexOf(this.userMessage._id),1)
            }
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }

  @Emit("refash")
  toRefash() {
    return true;
  }
}
</script>

<style lang="scss" scoped>
.topicitem {
  margin-top: 20px;
  .item_top {
    display: flex;
    align-items: center;
    .usericon {
      width: 40px;
      img {
        width: 100%;
        display: block;
      }
    }
    .userinfo {
      margin-left: 10px;
      .username {
        color: white;
      }
      .time {
        font-size: 12px;
        color: lightgray;
      }
    }
  }
  .item_text {
    margin: 10px 0 10px 40px;
    color: white;
  }
  .btns {
    display: flex;
    margin-left: 40px;
    .praises {
      .num {
        margin-left: 3px;
      }
      .icon-xihuan {
        color: black;
        cursor: pointer;
      }
      .xihuan {
        color: brown;
      }
    }
    .revert {
      color: white;
      cursor: pointer;
      margin-left: 10px;
      font-size: 14px;
    }
  }
  .revert_text {
    margin-left: 20px;
    margin-top: 10px;
    background: rgba(0, 0, 0, 0.2);
    display: flex;
    justify-content: space-between;
    padding: 10px;
    textarea {
      flex: 1;
      background: none;
      outline: none;
      border: none;
      color: white;
      font-size: 16px;
    }
    textarea::placeholder {
      color: lightgreen;
    }
    .btns {
      display: flex;
      align-items: flex-end;
      margin-left: 10px;
      color: white;
      span {
        cursor: pointer;
      }
      span:hover {
        color: yellowgreen;
      }
      .icon-biaoqing {
        font-size: 17px;
        margin-right: 10px;
      }
    }
  }
  .revert_list {
    margin-left: 40px;
    background: rgba(255, 255, 255, 0.2);
    font-size: 14px;
    li {
      display: flex;
      align-items: flex-start;
      box-sizing: border-box;
      padding: 10px;
      .username {
        color: green;
      }
      p {
        flex: 1;
        color: white;
        word-break: break-all;
      }
      .praises {
        margin-left: 10px;
        .num {
          margin-left: 3px;
        }
        .icon-xihuan {
          color: black;
          cursor: pointer;
        }
        .xihuan {
          color: brown;
        }
      }
    }
  }
}
</style>