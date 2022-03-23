import { Music } from "@/interfaces";
import Api from "@/apis"
import iconv from "iconv-lite"
import fs from 'fs'
import { v4 } from "uuid";
import { decodekrc, Font, init_krc } from "./DecodKrc";
import { ipcRenderer } from "electron";

export type MusicTextType = 'krc' | 'lrc' | null;

export class MusicText {
    public uuid: string;
    public textarr: string[][] = [];
    public krcArr: Array<Array<string | Font>> = [];
    public type: MusicTextType = null;
    public activeIndex: number = 0;
    public activeFont: number = 0;
    public activeWidth: string = '0';
    //歌词延时
    public textDelay: number = -100;
    //在每个字上已经播放的时间
    public activeTime: number = 0;
    //在线歌词
    public inline = {
        krcStr: '',
        lrcStr: ''
    }
    constructor(public currentPlay: Music) {
        this.uuid = v4();
    }
    /**
     * 获取歌词
     * @param inline 是否在线获取
     */
    public async getMusicText(inline: boolean = false): Promise<MusicTextType> {
        console.log(inline)
        this.inline = {
            lrcStr: '',
            krcStr: ''
        }
        let fileName = this.currentPlay.path.slice(0, this.currentPlay.path.length - 3);
        this.textarr = [];
        if (inline) {
            let res = await Api.musicText(this.currentPlay._id);
            this.inline.krcStr = res.data.data.krc;
            this.inline.lrcStr = res.data.data.lrc;
        }
        try {
            await this.getKrcText(fileName, inline);
            this.type = 'krc';
        } catch (err) {
            await this.getLrcText(fileName, inline);
            this.type = 'lrc'
        }
        return this.type;
        // this.runtext = true;
    }

    //获取lrc歌词
    private async getLrcText(fileName: string, inline: boolean) {
        let textarr: string[] = [], flag = false;
        if (inline) {
            textarr = this.inline.lrcStr.split('\n');
        } else {
            try {
                let buffer = await fs.readFileSync(fileName + "lrc");
                textarr = iconv.decode(buffer, "gbk").split("\n");
                flag = false;
                // let index = 0;

            } catch (err: any) {
                if (~err.message.indexOf("ENOENT: no such file or directory")) {
                }
                // this.loadText = true;
                return;
            }
        }

        for (let i of textarr) {
            let arr = i.replace(/\]/, "||").replace(/\[/, "").split("||");
            if (flag) {
                // if(!arr[1]){
                //     this.textarr[index-1][0] = arr[0]
                //     continue;
                // }else{
                // }
                this.textarr.push(arr);
                // index++;
            }
            if (~arr[0].indexOf("offset:0")) {
                flag = true;
            }
        }
        // this.loadText = true;
    }

    //获取krc歌词
    private async getKrcText(fileName: string, inline: boolean) {

        return new Promise((resolve, reject) => {
            if (inline) {
                this.krcArr = init_krc(this.inline.krcStr);
                if (!this.krcArr.length) {
                    reject(false);
                } else {
                    resolve(true);
                }
                return;
            }
            decodekrc(fileName + "krc", (res) => {
                if (res != 404) {
                    this.krcArr = <Array<Array<string | Font>>>res;
                    resolve(true);
                } else {
                    console.log(res);
                    reject(false);
                }
            });
        });
    }

    //lrc歌词监听
    public changeLrcText(currentTime: number) {
        if (this.activeIndex >= this.textarr.length - 1) {
            ipcRenderer.send('text', JSON.stringify({
                type: 'lrc',
                data: '暂无歌词'
            }))
        }
        let timearr = this.textarr[this.activeIndex + 1][0].split(":");
        let time = Number(timearr[0]) * 60 + Number(timearr[1]);
        if (Number(currentTime.toFixed(2)) > time + (this.textDelay / 1000)) {
            this.activeIndex++;
            ipcRenderer.send('text', JSON.stringify({
                type: 'lrc',
                data: this.textarr[this.activeIndex][1],
            }))
        }
    }

    //监听krc歌词
    public changeKrcText(currentTime: number) {

        let time = (<string>this.krcArr[this.activeIndex + 1][0]).split(",")[0];
        let currentLineTime = (<string>this.krcArr[this.activeIndex][0]).split(",")[0];
        let currentFont = <Font>this.krcArr[this.activeIndex][this.activeFont];
        let font = <Font>this.krcArr[this.activeIndex][this.activeFont + 1];
        if (currentFont && currentFont.duration) {
            let playTime = currentTime * 1000 - parseInt(currentLineTime) - (currentFont.start + this.textDelay);
            if (playTime < currentFont.duration) {
                this.activeWidth = (playTime / currentFont.duration) * 100 + '%';
            } else {
                this.activeWidth = "100%"
            }
        }
        if (font) {
            if (
                Math.floor(currentTime * 1000) >
                font.start + parseInt(currentLineTime) + this.textDelay
            ) {
                this.activeFont++;
                this.activeWidth = "0";
                this.activeTime = 0;
            }
        }
        let obj = {
            type: 'krc',
            data: {
                reset: false,
                currentTime: currentTime,
                line: this.krcArr[this.activeIndex]
            }

        }
        if (Math.floor(currentTime * 1000) > parseInt(time) + this.textDelay) {
            this.activeIndex++;
            this.activeFont = 0;
            obj.data.reset = true;
        }
        ipcRenderer.send('text', JSON.stringify(obj));
    }
}