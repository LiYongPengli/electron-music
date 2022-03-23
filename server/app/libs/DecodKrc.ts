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
export const decodekrc = async(filepath:string):Promise<string>=>{
    return new Promise((resolve,reject)=>{
        readFile(filepath,(err,buffer)=>{
            if(err){
                if (~err!.message.indexOf("ENOENT: no such file or directory")) {
                    reject(new Error('read krc filed:'+err!.message));
                    return;
                }
            }
            let tmpArr = buffer.slice(4);
            for(let i=0;i<tmpArr.length;i++){
                tmpArr[i] = tmpArr[i] ^ keyBuffer[i % keyBuffer.length];
            }
            unzip(tmpArr,(err,res)=>{
                if(err) throw err;
                resolve(res.toString());
            })
        });
    })
}