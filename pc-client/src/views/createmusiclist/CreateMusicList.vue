<template>
  <div class="createmusiclist">
    <h1>创建歌单</h1>
    <div class="center">
        <div class="cover">
            <img src="../../assets/img/cover.jpg" alt="">
        </div>
        <div class="info">
            <div class="item">
                <p>歌单名</p>
                <input v-model="names" type="text" placeholder="请输入歌单名">
            </div>
            <div class="item">
                <p>简介</p>
                <textarea v-model="info" rows="10" placeholder="每张歌单都有自己的故事,聊聊吧"></textarea>
            </div>
        </div>
    </div>
    <div class="bottom">
        <el-button @click="toCreate" style="width:100px;" size="small" type="primary">保存</el-button>
        <el-button style="width:100px;" size="small">取消 </el-button>
    </div>
  </div>
</template>

<script lang="ts">
import { MusicList } from "@/apis";
import { LeftBarMenu, UserMessage } from "@/interfaces";
import { State } from "vuex-class";
import { Component, Vue } from "vue-property-decorator";
@Component
export default class CreateMusicList extends Vue {
    @State('userMessage') userMessage!:UserMessage;
    @State("leftBar") barMenu!: Array<LeftBarMenu>;
    public names:string = "";
    public info:string = "";
    public cover:string = "";

    public toCreate(){
        if(!this.userMessage){
            this.$message.warning('请登录后操作!');
            return;
        }
        if(!this.names){
            this.$message.error('歌单名称不可为空');
            return;
        }
        let musicList:MusicList = {
            name:this.names,
            info:this.info,
            cover:this.cover
        }
        this.api.createMusicList(musicList).then(res=>{
            console.log(res.data)
            if(res.data.status==1){
                this.$message.success('创建歌单成功');
                this.userMessage.musicList.push(musicList)
                for(let i of this.barMenu){
                    if(i.title=='我的歌单'){
                        i.children?.push({
                            title:musicList.name,
                            index:'/musiclist/'+musicList.name
                        })
                    }
                }
                this.$router.back();
            }
        }).catch(err=>{
            console.log(err);
        })
    }
}
</script>

<style lang="scss" scoped>
.createmusiclist {
  height: 100%;
  box-sizing: border-box;
  padding-top: 100px;
  h1 {
    color: white;
    margin-top: -94px;
    padding-left: 20px;
  }
  .center{
      padding: 40px 20px;
      display: flex;
      color: white;
      .cover{
          width: 200px;
          height: 200px;
          border-radius: 5px;
          overflow: hidden;
          img{
              display: block;
              width: 100%;
          }
      }
      .info{
          margin-left: 10px;
          flex: 1;
          .item{
              margin-top: 10px;
              p{
                  padding-bottom: 10px;
              }
              input,textarea{
                  width: 100%;
                  background: rgba(255,255,255,0.3);
                  border: 1px solid gray;
                  border-radius: 3px;
                  padding: 5px 10px;
                  box-sizing: border-box;
                  outline: none;
                  color: white;
                  &::placeholder{
                      color: white;
                  }
              }
          }
      }
  }
  .bottom{
      padding: 0 20px;
      text-align: right;
  }
}
</style>