import { readFile } from 'fs';
import { unzip } from 'zlib';
//密钥
let keyBuffer = [64, 71, 97, 119, 94, 50, 116, 71, 81, 54, 49, 45, 206, 210, 110, 105];

//每个字
export interface Font{
    start:number;
    duration:number;
    text:string
}

//krc文件解码
export const decodekrc = (filepath:string,call:(res:Array<Array<string|Font>>|number)=>void)=>{
    readFile(filepath,(err,buffer)=>{
        if(err){
            if (~err!.message.indexOf("ENOENT: no such file or directory")) {
                call(404);
                return;
            }
        }
        let tmpArr = buffer.slice(4);
        for(let i=0;i<tmpArr.length;i++){
            tmpArr[i] = tmpArr[i] ^ keyBuffer[i % keyBuffer.length];
        }
        unzip(tmpArr,(err,res)=>{
            if(err) throw err;
            call(init_krc(res.toString()));
        })
    });
}


//初步处理krc文件的字符串
export const init_krc = (krcStr:string):Array<Array<string|Font>>=>{
    let krcArr1 = krcStr.split('\n');
    let krcArr:Array<Array<string|Font>> = [];
    let flag = false;
      for (let i of krcArr1) {
        let arr = i.replace(/\]/, "||").replace(/\[/, "").split("||");
        if (flag&&arr[1]) {
            if(arr[1].replace(/\s/g, "")!=""){
                arr[1] = arr[1].replace(/\>/g,",").replace(/\</g,"@").substr(1);
                let fontarr = arr[1].split('@');
                let bufferArr:Array<string|Font> = [];
                bufferArr.push(arr[0]);
                for(let i of fontarr){
                    let strArr = i.split(',');
                    bufferArr.push({
                        start:parseInt(strArr[0]),
                        duration:parseInt(strArr[1]),
                        text:strArr[3]
                    })
                }
                krcArr.push(bufferArr);
            }
        }
        if (~arr[0].indexOf("offset:0")) {
          flag = true;
        }
      }
    return krcArr;
}