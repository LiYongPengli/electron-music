import * as iconv from 'iconv-lite';
//标签头
export interface ID3V2TagHeader {
    header: string;
    version: string;
    revision: number;
    flag: number;
    size: number;
}
//标签帧
export interface ID3V2Label{
    tag:string;
    size:number;
    flag:number[];
    content:number[];
}
//id3v1
export interface ID3V1{
    tag:string;
    name:string;
    author:string;
    album:string;
    year:string;
    remark:string;
    type:string;
}

export interface ID3V2{
    [key:string]:ID3V2Label|ID3V2TagHeader;
}
export interface ID3{
    ID3V1:ID3V1;
    ID3V2:ID3V2;
}

export default class ID3Reader {
    private ID3V1: Buffer;
    private filedata: Buffer;
    //指针位置
    private seek:number = 0;
    constructor(filedata: Buffer) {
        this.filedata = filedata;
        this.ID3V1 = filedata.slice(filedata.length - 128);
    }
    public getID3():ID3{
        return {
            ID3V1:this.getID3V1(),
            ID3V2:this.getID3V2()
        }
    }
    //获取id3v2
    private getID3V2(): ID3V2 {
        let id3Obj:ID3V2 = {};
        //标签头，长10bit
        let id3Header: ID3V2TagHeader = {
            header: '',
            version: '',
            revision: 0,
            flag: 0,
            size: 0,
        };
        //必须为“ID3”否则认为标签不存在
        id3Header.header = this.filedata.slice(this.seek, 3).toString();
        this.seek+=3
        //版本号ID3V2.3 就记录3
        let ver = this.filedata[this.seek];
        id3Header.version = 'ID3V2.' + ver;
        this.seek+=1;
        //副版本号此版本记录为0
        id3Header.revision = this.filedata[this.seek];
        this.seek+=1;
        //标志字节，只使用高三位，其它位为0
        id3Header.flag = this.filedata[this.seek];
        this.seek+=1;
        let SizeArr = this.filedata.slice(this.seek, 10);
        id3Header.size = (SizeArr[0] & 0x7F) * 0x200000 + (SizeArr[1] & 0x7F) * 0x400 + (SizeArr[2] & 0x7F) * 0x80 + (SizeArr[3] & 0x7F)
        this.seek+=4;
        id3Obj.header = id3Header;
        //标签帧，长10bit
        //标签帧类型数组
        let labelArr = [
            'AENC','APIC','COMM','COMR','ENCR','EQUA','ETCO',
            'GEOB','GRID','IPLS','LINK','MCDI','MLLT','OWNE',
            'PRIV','PCNT','POPM','POSS','RBUF','RVAD','RVRB',
            'SYLT','SYTC','TALB','TBPM','TCOM','TCON','TCOP',
            'TDAT','TDLY','TENC','TEXT','TFLT','TIME','TIT1',
            'TIT2','TIT3','TKEY','TLAN','TLEN','TMED','TOAL',
            'TOFN','TOLY','TOPE','TORY','TOWN','TPE1','TPE2',
            'TPE3','TPE4','TPOS','TPUB','TRCK','TRDA','TRSN',
            'TRSO','TSIZ','TSRC','TSSE','TYER','TXXX','UFID',
            'USER','USLT','WCOM','WCOP','WOAF','WOAR','WOAS',
            'WORS','WPAY','WPUB','WXXX'
        ]
        while(~labelArr.indexOf(this.filedata.slice(this.seek,this.seek+4).toString())){
            let label = this.getLabel();
            id3Obj[label.tag] = label;
        }
        return id3Obj;
    }

    //获取id3v2标签帧
    private getLabel():ID3V2Label{
        let tag = this.filedata.slice(this.seek,this.seek+4).toString();
        this.seek+=4;
        let sizeArr = this.filedata.slice(this.seek,this.seek+4);
        let size = sizeArr[0] * 0x100000000 + sizeArr[1] * 0x10000 + sizeArr[2] * 0x100 + sizeArr[3];
        this.seek+=4;
        let flag = this.filedata.slice(this.seek,this.seek+2).toJSON().data;
        this.seek+=2;
        let content = this.filedata.slice(this.seek,this.seek+size).toJSON().data;
        this.seek+=size;
        return {
            tag:tag,
            size:size,
            flag:flag,
            content:content
        }
    }

    //获取id3V1
    private getID3V1():ID3V1{
        //存放tag字符，表示ID3V1.0标准
        let tag = this.ID3V1.slice(0,3).toString();
        //歌名
        let name = iconv.decode(Buffer.from(this.ID3V1.slice(3,33).filter(function(value){return value!=0})),'gbk');
        //作者
        let author = iconv.decode(Buffer.from(this.ID3V1.slice(33,63).filter(function(value){return value!=0})),'gbk');
        //专辑名
        let album = iconv.decode(Buffer.from(this.ID3V1.slice(63,93).filter(function(value){return value!=0})),'gbk');
        //年份
        let year = this.ID3V1.slice(93,97).toString().trim();
        //备注
        let remark = iconv.decode(Buffer.from(this.ID3V1.slice(97,127).filter(function(value){return value!=0})),'gbk');
        //mp3音乐类别共147种
        let type = this.getMusicType(this.ID3V1[127]);
        return {
            tag:tag,
            name:name,
            author:author,
            album:album,
            year:year,
            remark:remark,
            type:type
        }
    }

    //获取id3v1类型
    private getMusicType(type:number):string{
        let typestr = "";
        switch(type){
            case 0: typestr = "Blues";break;
            case 1: typestr = "ClassicRock";break;
            case 2: typestr = "Country";break;
            case 3: typestr = "Dance";break;
            case 4: typestr = "Disco";break;
            case 5: typestr = "Funk";break;
            case 6: typestr = "Grunge";break;
            case 7: typestr = "Hip-Hop";break;
            case 8: typestr = "Jazz";break;
            case 9: typestr = "Metal";break;
            case 10: typestr = "NewAge";break;
            case 11: typestr = "Oldies";break;
            case 12: typestr = "Other";break;
            case 13: typestr = "Pop";break;
            case 14: typestr = "R&B";break;
            case 15: typestr = "Rap";break;
            case 16: typestr = "Reggae";break;
            case 17: typestr = "Rock";break;
            case 18: typestr = "Techno";break;
            case 19: typestr = "Industrial";break;
            case 20: typestr = "Alternative";break;
            case 21: typestr = "Ska";break;
            case 22: typestr = "Deathl";break;
            case 23: typestr = "Pranks";break;
            case 24: typestr = "Soundtrack";break;
            case 25: typestr = "Euro-Techno";break;
            case 26: typestr = "Ambient";break;
            case 27: typestr = "Trip-Hop";break;
            case 28: typestr = "Vocal";break;
            case 29: typestr = "Jazz+Funk";break;
            case 30: typestr = "Fusion";break;
            case 31: typestr = "Trance";break;
            case 32: typestr = "Classical";break;
            case 33: typestr = "Instrumental";break;
            case 34: typestr = "Acid";break;
            case 35: typestr = "House";break;
            case 36: typestr = "Game";break;
            case 37: typestr = "SoundClip";break;
            case 38: typestr = "Gospel";break;
            case 39: typestr = "Noise";break;
            case 40: typestr = "AlternRock";break;
            case 41: typestr = "Bass";break;
            case 42: typestr = "Soul";break;
            case 43: typestr = "Punk";break;
            case 44: typestr = "Space";break;
            case 45: typestr = "Meditative";break;
            case 46: typestr = "InstrumentalPop";break;
            case 47: typestr = "InstrumentalRock";break;
            case 48: typestr = "Ethnic";break;
            case 49: typestr = "Gothic";break;
            case 50: typestr = "Darkwave";break;
            case 51: typestr = "Techno-Industrial";break;
            case 52: typestr = "Electronic";break;
            case 53: typestr = "Pop-Folk";break;
            case 54: typestr = "Eurodance";break;
            case 55: typestr = "Dream";break;
            case 56: typestr = "SouthernRock";break;
            case 57: typestr = "Comedy";break;
            case 58: typestr = "Cult";break;
            case 59: typestr = "Gangsta";break;
            case 60: typestr = "Top40";break;
            case 61: typestr = "ChristianRap";break;
            case 62: typestr = "Pop/Funk";break;
            case 63: typestr = "Jungle";break;
            case 64: typestr = "NativeAmerican";break;
            case 65: typestr = "Cabaret";break;
            case 66: typestr = "NewWave";break;
            case 67: typestr = "Psychadelic";break;
            case 68: typestr = "Rave";break;
            case 69: typestr = "Showtunes";break;
            case 70: typestr = "Trailer";break;
            case 71: typestr = "Lo-Fi";break;
            case 72: typestr = "Tribal";break;
            case 73: typestr = "AcidPunk";break;
            case 74: typestr = "AcidJazz";break;
            case 75: typestr = "Polka";break;
            case 76: typestr = "Retro";break;
            case 77: typestr = "Musical";break;
            case 78: typestr = "Rock&Roll";break;
            case 79: typestr = "HardRock";break;
            case 80: typestr = "Folk";break;
            case 81: typestr = "Folk-Rock";break;
            case 82: typestr = "NationalFolk";break;
            case 83: typestr = "Swing";break;
            case 84: typestr = "FastFusion";break;
            case 85: typestr = "Bebob";break;
            case 86: typestr = "Latin";break;
            case 87: typestr = "Revival";break;
            case 88: typestr = "Celtic";break;
            case 89: typestr = "Bluegrass";break;
            case 90: typestr = "Avantgarde";break;
            case 91: typestr = "GothicRock";break;
            case 92: typestr = "ProgessiveRock";break;
            case 93: typestr = "PsychedelicRock";break;
            case 94: typestr = "SymphonicRock";break;
            case 95: typestr = "SlowRock";break;
            case 96: typestr = "BigBand";break;
            case 97: typestr = "Chorus";break;
            case 98: typestr = "EasyListening";break;
            case 99: typestr = "Acoustic";break;
            case 100: typestr = "Humour";break;
            case 101: typestr = "Speech";break;
            case 102: typestr = "Chanson";break;
            case 103: typestr = "Opera";break;
            case 104: typestr = "ChamberMusic";break;
            case 105: typestr = "Sonata";break;
            case 106: typestr = "Symphony";break;
            case 107: typestr = "BootyBass";break;
            case 108: typestr = "Primus";break;
            case 109: typestr = "PornGroove";break;
            case 110: typestr = "Satire";break;
            case 111: typestr = "SlowJam";break;
            case 112: typestr = "Club";break;
            case 113: typestr = "Tango";break;
            case 114: typestr = "Samba";break;
            case 115: typestr = "Folklore";break;
            case 116: typestr = "Ballad";break;
            case 117: typestr = "PowerBallad";break;
            case 118: typestr = "RhythmicSoul";break;
            case 119: typestr = "Freestyle";break;
            case 120: typestr = "Duet";break;
            case 121: typestr = "PunkRock";break;
            case 122: typestr = "DrumSolo";break;
            case 123: typestr = "Acapella";break;
            case 124: typestr = "Euro-House";break;
            case 125: typestr = "DanceHall";break;
            case 126: typestr = "Goa";break;
            case 127: typestr = "Drum&Bass";break;
            case 128: typestr = "Club-House";break;
            case 129: typestr = "Hardcore";break;
            case 130: typestr = "Terror";break;
            case 131: typestr = "Indie";break;
            case 132: typestr = "BritPop";break;
            case 133: typestr = "Negerpunk";break;
            case 134: typestr = "PolskPunk";break;
            case 135: typestr = "Beat";break;
            case 136: typestr = "ChristianGangstaRap";break;
            case 137: typestr = "Heavyl";break;
            case 138: typestr = "Blackl";break;
            case 139: typestr = "Crossover";break;
            case 140: typestr = "ContemporaryChristian";break;
            case 141: typestr = "ChristianRock";break;
            case 142: typestr = "Merengue";break;
            case 143: typestr = "Salsa";break;
            case 144: typestr = "Trashl";break;
            case 145: typestr = "Anime";break;
            case 146: typestr = "JPop";break;
            case 147: typestr = "Synthpop";break;
        }
        return typestr;
    }
}