<template>
  <div class="topbar">
    <div class="left">
      <div class="nav">
        <span @click="$router.back()" class="back el-icon-arrow-left"></span>
        <span @click="$router.go(1)" class="go el-icon-arrow-right"></span>
      </div>
      <div class="search">
        <el-select @change="valueChange" clearable="" size="mini" :loading="loading" v-model="searchText" filterable remote :remote-method="remoteMethod">
          <el-option v-for="(v,i) in options" :key="i" :label="v.label" :value="v.value"></el-option>
        </el-select>
      </div>
    </div>
    <div class="moveBar"></div>
    <div class="right">
      <!-- 未登录 -->
      <div v-if="!userMessage" @click="showLogin = true" class="userinfo">
        <div class="userinfo_icon">
          <img src="../assets/img/zwtx.png" alt="" />
        </div>
        <div class="user_name">未登录</div>
      </div>
      <!-- 已登录 -->
      <div v-if="userMessage" class="userinfo">
        <div class="userinfo_icon">
          <img v-if="!userMessage.icon" src="../assets/img/zwtx.png" alt="" />
          <img v-if="userMessage.icon" :src="userMessage.icon" alt="" />
        </div>
        <div class="user_name">{{ userMessage.username }}</div>
      </div>
      <ul class="menu">
        <!-- 设置菜单 -->
        <el-popover trigger="click" popper-class="settingsMenu_wrap">
          <ul class="settingsMenu">
            <li @click.stop="$router.push('/settings')">
              <i class="el-icon-setting"></i>设置
            </li>
            <li @click="showTheme = true">
              <i class="el-icon-picture"></i>切换皮肤
            </li>
            <li @click="toLogout"><i class="el-icon-user"></i>退出登录</li>
            <li @click="toExit"><i class="el-icon-warning-outline"></i>退出动感音乐app</li>
          </ul>
          <li slot="reference" class="mn el-icon-s-fold"></li>
        </el-popover>
      </ul>
      <div class="appcontrol">
        <span @click="mini" class="min el-icon-minus"></span>
        <span @click="hide" class="close el-icon-close"></span>
      </div>
    </div>
    <el-dialog title="用户登录" width="500px" :visible.sync="showLogin">
      <login :usermessage="usermessage" />
      <span slot="footer" class="dialog-footer">
        <el-button size="mini" @click="toRegister">注册</el-button>
        <el-button size="mini" type="primary" @click="loginRequest"
          >登 录</el-button
        >
      </span>
    </el-dialog>
    <!-- 皮肤选择 -->
    <el-dialog
      custom-class="theme"
      width="700px"
      :close-on-click-modal="false"
      title="皮肤设置"
      :visible.sync="showTheme"
    >
      <div v-if="globelConfig.appconfig" class="theme_wrap">
        <img @click="setTheme(v)" :class="{'select':globelConfig.appconfig.theme.background==v}" v-for="(v,i) in globelConfig.appconfig.theme.localBackArr" :key="i" :src="v" alt="">
      </div>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { ipcRenderer, shell } from "electron";
import { Component, Vue } from "vue-property-decorator";
import Login from "@/components/Login.vue";
import { Mutation, State } from "vuex-class";
import { GlobelConfig, UserMessage } from "@/interfaces";
@Component({
  components: {
    Login,
  },
})
export default class TopBar extends Vue {
  @State("userMessage") userMessage!: UserMessage;
  @State("globelConfig") globelConfig!: GlobelConfig;
  @Mutation("setSearchValue") setSearchValue!:(value:string)=>void;
  @Mutation("setUserMessage") setUserMessage: any;
  @Mutation("setGlobelConfig") setGlobelConfig!:(config:GlobelConfig)=>void;
  public showLogin: boolean = false;
  public showTheme: boolean = false;
  public searchText:string = '';
  public loading:boolean = true;
  public options:{label:string;value:string}[] = [];
  public usermessage = {
    username: "",
    password: "",
  };
  public mini() {
    ipcRenderer.send("mini", "");
  }

  public hide() {
    ipcRenderer.send("hide", "");
  }
  //登录
  public loginRequest() {
    if (!this.usermessage.username) {
      this.$message.error("用户名不能为空");
      return;
    }
    if (!this.usermessage.password) {
      this.$message.error("密码不能为空");
      return;
    }
    this.api
      .login(this.usermessage)
      .then((res) => {
        this.axios.defaults.headers = {
          token: res.data.token,
        };
        localStorage.token = res.data.token;
        this.showLogin = false;
        this.api.usermessage().then((res) => {
          this.setUserMessage(res.data);
        });
      })
      .catch((err) => {
        console.log(err);
      });
  }

  //设置主题
  public setTheme(v:string){
    this.globelConfig.appconfig.theme.background = v;
    this.setGlobelConfig(this.globelConfig);
  }

  //注册页
  public toRegister() {
    shell.openExternal(
      this.axios.defaults.baseURL!.replace("/api", "") + "/register"
    );
  }

  public toLogout(){
    this.api.logout().then(res=>{
      this.$router.go(0);
    })
  }

  public valueChange(value:string){
    this.setSearchValue(value);
    this.$router.push('/musiclist/inline').catch(err=>{})
  }

  public toExit(){
    ipcRenderer.send('exit',true);
  }

  public remoteMethod(query:string){
    if(!query){
      this.options = [];
      return;
    }
    this.loading = true;
    this.api.searchMusic(query).then(res=>{
      this.options = res.data.data.map((v:any)=>{
        return {
          label:v.name,
          value:v.name
        }
      })
      this.options.unshift({
        label:query,
        value:query
      })
      console.log(res.data)
      this.loading = false;
    }).catch(err=>{
      console.log(err);
    })
  }
}
</script>

<style lang="scss" scoped>
.topbar {
  width: 100%;
  height: 70px;
  display: flex;
  justify-content: space-between;
  padding: 0 20px;
  box-sizing: border-box;
  color: white;
  .moveBar {
    display: flex;
    flex: 1;
    -webkit-app-region: drag;
  }
  .left {
    display: flex;
    align-items: center;
    .nav {
      font-size: 20px;
      .go,
      .back {
        cursor: pointer;
      }
      .back {
        margin-right: 10px;
      }
    }
    .search {
      
    }
  }
  .right {
    display: flex;
    .userinfo {
      display: flex;
      align-items: center;
      font-size: 14px;
      cursor: pointer;
      &_icon {
        width: 30px;
        img {
          width: 100%;
          display: block;
        }
      }
      .user_name {
        margin-left: 10px;
      }
    }
    .menu {
      display: flex;
      align-items: center;
      margin-left: 20px;
      font-size: 20px;
      .mn {
        cursor: pointer;
      }
    }
    .appcontrol {
      display: flex;
      align-items: center;
      font-size: 20px;
      span {
        padding-left: 10px;
        cursor: pointer;
      }
      span:hover {
        color: yellowgreen;
      }
    }
  }
  .select{
    border: 1px solid green;
  }
}
.settingsMenu_wrap {
  .settingsMenu {
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
</style>