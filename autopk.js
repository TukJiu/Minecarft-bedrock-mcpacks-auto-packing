const fs = require("fs")
const zlib = require("zlib")
const path = require('path')
function uuid() {
    let uuid = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'
    for (let i = 0; i < 32; i++) uuid = uuid.replace(/x/, Math.floor(Math.random() * 16).toString(16))
    return uuid
}
function uuidvalidate(uuid) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uuid)
}
function gzip(pkpath , pkfile, pkname) {
    fs.stat(pkfile, (err, stats) => {
        if (err) {
            console.log("打包出现异常" + err)
            return 6
        }
        if (stats.isFile()) {
            fs.createReadStream(`${pkpath}/${pkfile}`).pipe(zlib.createGzip()).pipe(fs.createWriteStream(pkname + '.mcaddon'))
        } else {
            fs.readdirSync(`${pkpath}/${pkfile}`).forEach((v,a)=>{
                gzip(`${pkpath}/${pkfile}`, v, pkname)
            })
        }
    })
}
console.log("程序已经启动…")
let cfg = {
    "title": "包标题",
    "describe": "包描述",
    "author": "包作者",
    "type": "a",
    "uuid": {
        "header": uuid(),
        "modules": [
            uuid(), uuid()
        ],
        "dependencies": uuid()
    },
    "version": {
        "packv": [0, 0, 1],
        "minv": [1, 16, 0]
    }
}
let testuuid = [cfg.uuid.header, cfg.uuid.modules[0], cfg.uuid.modules[1], cfg.uuid.dependencies]
for (let i = 0; i < testuuid.length; i++) {
    for (let j = i + 1; j < testuuid.length; j++) {
        if (testuuid[i] == testuuid[j]) {
            console.log("默认uuid生成了相同的uuid。\n欧皇，请保存你的结果，并在稍后重新运行本程序！\n")
            console.log(cfg)
            try {
                fs.writeFileSync("cfg.txt", JSON.stringify(cfg, null, 4))
                console.log("结果已输出到文件cfg.txt")
            } catch (e) {
                if (e) {
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
    cfg = Object.assign(cfg, data)
} catch (e) {
    if (e) {
        console.log("读取配置文件失败：" + e)
        return 2
    }
}
console.log("读取配置文件完成，开始校验uuid…")
if (!uuidvalidate(cfg.uuid.header)) {
    console.log("header部分uuid不合格！")
    return 3
}
if (!(uuidvalidate(cfg.uuid.modules[0]) && uuidvalidate(cfg.uuid.modules[1]))) {
    console.log("modules部分uuid不合格！")
    return 3
}
if (!uuidvalidate(cfg.uuid.dependencies)) {
    console.log("dependencies部分uuid不合格！")
    return 3
}
console.log("uuid校验通过！")
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
            "uuid": cfg.uuid.dependencies,
            "version": cfg.version.packv
        }
    ]
}
let r = JSON.parse(JSON.stringify(manifest))
let s = JSON.parse(JSON.stringify(manifest))
s.modules[0].uuid = cfg.uuid.modules[1]
if (cfg.type == "a") {
    console.log("这是一个合并包，已调整至合并包处理逻辑")
    r.modules[0].type = "resources"
    s.modules[0].type = "data"
    let tmp = s.dependencies[0].uuid
    s.dependencies[0].uuid = s.header.uuid
    s.header.uuid = tmp
} else if (cfg.type == "r") {
    console.log("这是一个资源包，已调整至资源包处理逻辑")
    r.modules[0].type = "resources"
} else if (cfg.type == "s") {
    console.log("这是一个行为包，已调整至行为包处理逻辑")
    s.modules[0].type = "data"
} else {
    console.log("读取包类型错误，请指定正确的包类型。它只能是r，s，a。")
    return 4
}
function musd(dir) {
    let list = fs.readdirSync("resources/sounds/" + dir)
    let ret = ""
    for (i in list) {
        if (!fs.statSync("resources/sounds/" + dir + "/" + list[i]).isFile()) {
            ret += musd(dir + "/" + list[i])
        } else {
            ret += `"${dir}/${list[i].slice(0, -4)}":{"category":"music","sounds":[{"name":"sounds/${dir}/${list[i].slice(0, -4)}","stream":true,"volume":1,"load_on_low_memory":true}]},`
        }
    }
    return ret
}
if (cfg.type == "a" || cfg.type == "r") {
    console.log("所选的类型中包含资源包，音频文件json生成…")
    try {
        let list = fs.readdirSync("resources/sounds")
        let f = ""
        for (i in list) {
            if (!fs.statSync(`resources/sounds/${list[i]}`).isFile()) {
                f += musd(list[i])
            }
        }
        f = f.slice(0, -1)
        f = "{" + f + "}"
        f = JSON.parse(f)
        fs.writeFileSync("resources/sounds/sound_definitions.json", JSON.stringify(f, null, 4))
        console.log("音频定义文件写入完成")
    } catch (e) {
        console.log("音乐部分文件生成异常（程序继续执行）：" + e)
    }
}
console.log("生成manifest文件…")
try {
    if (cfg.type == "a" || cfg.type == "r") {
        fs.writeFileSync("resources/manifest.json", JSON.stringify(r, null, 4))
    }
    if (cfg.type == "a" || cfg.type == "s") {
        fs.writeFileSync("behaviors/manifest.json", JSON.stringify(s, null, 4))
    }
    console.log("写入manifest完成")
} catch (e) {
    if (e) {
        console.log("写入manifest失败：" + e)
        return 5
    }
}
console.log("复制pack_icon文件...")
try {
    if (cfg.type == "a" || cfg.type == "r") {
        fs.writeFileSync("resources/pack_icon.png", fs.readFileSync("pack_icon.png"))
    }
    if (cfg.type == "a" || cfg.type == "s") {
        fs.writeFileSync("behaviors/pack_icon.png", fs.readFileSync("pack_icon.png"))
    }
    console.log("复制pack_icon文件完成")
} catch (e) {
    if (e) {
        console.log("复制pack_icon失败（程序继续执行）：" + e)
    }
}
console.log("打包中，请等待…")
if (cfg.type == "a") {
    gaip(`resources`, cfg.title)
    gzip(`behaviors`, cfg.title)
} else if (cfg.type == "r") {
    gzip(`resources`, cfg.title)
} else if (cfg.type == "s") {
    gzip(`behaviors`, cfg.title)
}
console.log(`打包完成，请查看${cfg.title}.mcaddon`)