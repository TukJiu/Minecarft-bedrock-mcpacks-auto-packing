const fs = require("fs")
const uuid = require("uuid")
const archiver = require("archiver")
console.log("程序已经启动…")
let cfg = {
    "title": "包标题",
    "describe": "包描述",
    "author": "包作者",
    "type": "a",
    "uuid": {
        "header": uuid.v4(),
        "modules": [
            uuid.v4(), uuid.v4()
        ],
        "dependencies": uuid.v4()
    },
    version: {
        "packv": [0,0,1],
        "minv": [1,16,0]
    }
}
let testuuid = [cfg.uuid.header,cfg.uuid.modules[0],cfg.uuid.modules[1],cfg.uuid.dependencies]
for (let i=0; i<testuuid.length; i++) {
    for (let j=i+1; j<testuuid.length; j++) {
        if(testuuid[i]==testuuid[j]) {
            console.log("默认uuid生成了相同的uuid。\n欧皇，请保存你的结果，并在稍后重新运行本程序！\n")
            console.log(cfg)
            try {
                fs.writeFileSync("cfg.txt",JSON.stringify(cfg,null,4))
                console.log("结果已输出到文件cfg.txt")
            }catch(e){
                if(e){
                    console.log("文件输出失败！请及时保存结果！")
                    return 1
                }
            }
            return 0
        }
    }
}
delete testuuid
console.log("现在，开始读取配置文件…")
let data
try {
    data = fs.readFileSync("config.json")
    data = JSON.parse(data)
    cfg = Object.assign(cfg,data)
}catch(e){
    if(e) {
        console.log("读取配置文件失败："+e)
        return 2
    }
}
console.log("读取配置文件完成，开始校验uuid…")
let uugo = false
if (!uuid.validate(cfg.uuid.header)){
    uugo = true
    console.log("header部分uuid不合格！")
}
if (!(uuid.validate(cfg.uuid.modules[0])&&uuid.validate(cfg.uuid.modules[1]))){
    uugo = true
    console.log("modules部分uuid不合格！")
}
if (!uuid.validate(cfg.uuid.dependencies)){
    uugo = true
    console.log("dependencies部分uuid不合格！")
}
if(uugo) {
    return 3
}else{
console.log("uuid校验通过！")
}
delete uugo
console.log("读取配置的包类型…")
const manifest = {
  "format_version": 2,
  "header": {
      "name": cfg.title,
      "description": `${cfg.describe}\n\nAuthor: ${cfg.author}`,
      "uuid": cfg.uuid.header,
      "version": cfg.version.packv,
      "min_engine_version": cfg.version.minv
  },
  "modules":
    [
      {
        "description": `${cfg.describe}\n\nAuthor: ${cfg.author}`,
          "type": null,
          "uuid": cfg.uuid.modules[0],
          "version": cfg.version.packv
      }
    ],
  "dependencies": [
    {
     "uuid":cfg.uuid.dependencies,
      "version": cfg.version.packv
    }
 ]
}
let r = JSON.parse(JSON.stringify(manifest))
let s = JSON.parse(JSON.stringify(manifest))
s.modules[0].uuid = cfg.uuid.modules[1]
if(cfg.type=="a"){
    console.log("这是一个合并包，已调整至合并包处理逻辑")
    r.modules[0].type = "resources"
    s.modules[0].type = "data"
    let tmp = s.dependencies[0].uuid
    s.dependencies[0].uuid = s.header.uuid
    s.header.uuid = tmp
}else if(cfg.type=="r"){
    console.log("这是一个资源包，已调整至资源包处理逻辑")
    delete s
    r.modules[0].type = "resources"
}else if(cfg.type=="s"){
    console.log("这是一个行为包，已调整至行为包处理逻辑")
    delete r
    s.modules[0].type = "data"
}else{
    console.log("读取包类型错误，请指定正确的包类型。它只能是r，s，a。")
    return 4
}
function musd(dir) {
    let list = fs.readdirSync("resources/sounds/"+dir)
    let ret = ""
    for (i in list) {
        if(!fs.statSync("resources/sounds/"+dir+"/"+list[i]).isFile()) {
            ret += musd(dir+"/"+list[i])
        }else{
            ret += `"${dir}/${list[i].slice(0,-4)}":{"category":"music","sounds":[{"name":"sounds/${dir}/${list[i].slice(0,-4)}","stream":true,"volume":1,"load_on_low_memory":true}]},`
        }
    }
    return ret
}
if (cfg.type=="a"||cfg.type=="r") {
    console.log("所选的类型中包含资源包，音频文件json生成…")
    try{
        let list = fs.readdirSync("resources/sounds")
        let f = ""
        for (i in list) {
            if (!fs.statSync(`resources/sounds/${list[i]}`).isFile()){
                f += musd(list[i])
            }
        }
        f = f.slice(0,-1)
        f = "{"+f+"}"
        f = JSON.parse(f)
        fs.writeFileSync("resources/sounds/sound_definitions.json", JSON.stringify(f,null,4))
        console.log("音频定义文件写入完成")
        delete list
        delete f
    }catch(e){
        console.log("音乐部分文件生成异常（程序继续执行）："+e)
        delete list
        delete f
    }
}
console.log("生成manifest文件…")
try {
    if(cfg.type == "a" || cfg.type == "r"){
        fs.writeFileSync("resources/manifest.json", JSON.stringify(r, null, 4))
    }
    if(cfg.type =="a" || cfg.type == "s"){
        fs.writeFileSync("behaviors/manifest.json", JSON.stringify(s, null, 4))
    }
    console.log("写入manifest完成")
}catch(e){
    if (e) {
        console.log("写入manifest失败："+e)
        return 5
    }
}
const archive = archiver('zip',{zlib: {level: 0}})
if(cfg.type=="a"){
    const RBP_output = fs.createWriteStream(`${cfg.title}.mcaddon`);
    archive.on('error',function(err){
        throw err;
    });
    archive.pipe(RBP_output);
    archive.directory(`resources`);
    archive.directory(`behaviors`);
    archive.finalize();
}else if(cfg.type == "r"){
    const RP_output = fs.createWriteStream(`${cfg.title}.mcpack`);
    archive.on('error',function(err){
        throw err;
    });
    archive.pipe(RP_output)
    archive.directory(`resources`)
    archive.finalize()
}else if (cfg.type == "s"){
    const BP_output = fs.createWriteStream(`${cfg.title}.mcpack`);
    archive.on('error',function(err){
        throw err;
    });
    archive.pipe(BP_output)
    archive.directory(`behaviors`)
    archive.finalize()
}
console.log("打包中，请等待…\n打包结束后，程序将会结束…")
