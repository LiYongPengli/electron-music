<template>
  <div class="settings">
      <h1>设置</h1>
      <div class="content">
          <my-scroll>
              <el-form class="settinglist">
                  <el-form-item label="下载地址:" class="list-item">
                      <input readonly v-model="downloadPath" class="input" type="text" />
                      <el-button @click="chooseDirectory" size="mini" type="primary">选择目录</el-button>
                      <el-button @click="showDirectory" type="mini">显示文件夹</el-button>
                  </el-form-item>
                  <el-form-item label="是否下载歌词:">
                      <el-radio v-model="text" :label="true">是</el-radio>
                      <el-radio v-model="text" :label="false">否</el-radio>
                  </el-form-item>
              </el-form>
          </my-scroll>
      </div>
  </div>
</template>

<script lang="ts" src="./Settings.ts"></script>

<style lang="scss" scoped src="./Settings.scss"></style>