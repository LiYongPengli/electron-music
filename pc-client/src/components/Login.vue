<template>
  <div class="login">
      <div class="top">
          <span :class="{'navactive':choose==0}" class="account">账号登录</span>
          <span :class="{'navactive':choose==1}" class="code">扫码登录</span>
      </div>
      <!-- 账号密码登录 -->
      <div class="body body_account">
          <el-form label-position="right" label-width="80px" :model="usermessage" ref="form">
              <el-form-item label="用户名:" prop="username">
                  <el-input type="text" placeholder="请输入用户名" v-model="usermessage.username" />
              </el-form-item>
              <el-form-item label="密码:" prop="password">
                  <el-input type="password" placeholder="请输入用户名" v-model="usermessage.password" />
              </el-form-item>
          </el-form>
      </div>
      <!-- 二维码登录 -->
      <div class="body body_code"></div>
  </div>
</template>

<script lang="ts">
import { ElForm } from "node_modules/element-ui/types/form";
import { Component, Prop, Ref, Vue } from "vue-property-decorator";
@Component
export default class Login extends Vue {
    @Prop({}) usermessage!:{username:string;password:string};
    public choose:number = 0;
    @Ref('form') readonly form!:ElForm;
}
</script>

<style lang="scss" scoped>
.login{
    .top{
        display: flex;
        align-items: center;
        span{
            flex: 1;
            text-align: center;
        }
        span:last-of-type{
            border-left: 1px solid lightgray;
        }
    }
    .body{
        margin-top: 20px;
    }
    .navactive{
        color: blue;
    }
}
</style>