import { GlobelConfig } from "@/interfaces";
import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    music_picture:'',//音乐图片
    showMusicInfo:false,//是否显示音乐详情
    deskText:false,//桌面歌词
    searchValue:'',
    musicText:null,
    inlineList:[],
    dataBase:null as IDBDatabase|null,
    audio: null,
    userMessage:null,
    currentPlay: null,
    currentTime: 0,
    duration: 0,
    audioContext: null,
    analyser: null,
    audioSource:null,
    soundSwitch:false,
    playIndex: -1,
    playList: [],
    leftBar: [],
    globelConfig:{} as GlobelConfig,
    showSoundConfig:false,
  },
  mutations: {
    setShowMusicInfo(state,n){
      state.showMusicInfo = n;
    },
    setMusicPicture(state,n){
      state.music_picture = n;
    },
    setDeskText(state,n){
      state.deskText = n;
    },
    setMusicText(state,n){
      state.musicText = n;
    },
    setSearchValue(state,n){
      state.searchValue = n;
    },
    setDataBase(state,n){
      state.dataBase = n;
    },
    setLeftBar(state, n) {
      state.leftBar = n;
    },
    setLnlineList(state,n){
      state.inlineList = n;
    },
    setCurrentPlay(state, n) {
      state.currentPlay = n;
    },
    setPlayIndex(state, n) {
      state.playIndex = n;
    },
    setAudio(state, n) {
      state.audio = n;
    },
    setCurrentTime(state, n) {
      state.currentTime = n;
    },
    setDuration(state, n) {
      state.duration = n;
    },
    setAudioContext(state, n) {
      state.audioContext = n;
    },
    setAnalyser(state, n) {
      state.analyser = n;
    },
    setPlayList(state, n) {
      state.playList = n;
    },
    setAudioSource(state,n){
      state.audioSource = n;
    },
    setUserMessage(state,n){
      state.userMessage = n;
    },
    setShowSoundConfig(state,n){
      state.showSoundConfig = n;
    },
    setSoundSwitch(state,n){
      state.soundSwitch = n;
    },
    setGlobelConfig(state,n){
      state.globelConfig = n;
      setTimeout(()=>{
        let db = state.dataBase;
        db!.transaction(['appConfig'],'readwrite').objectStore('appConfig').put(n);
      },200)
    }
  },
  actions: {},
  modules: {},
});
