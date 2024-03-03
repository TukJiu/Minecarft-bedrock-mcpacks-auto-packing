# MCBE资源包打包工具

这是一个基于nodejs引擎制作的半自动化资源包打包工具，虽能减少资源包、音乐包作者的json工作量，但是并不能减少行为包作者的工作量（工作量根本不差一个文件）

+ 原生版： [protozoa](https://github.com/menghengbai/Minecarft-bedrock-mcpacks-auto-packing/tree/protozoa)

# 功能与解读

+ 自动写入manifest.json文件，但对玩家所展示的内容需要在config.json里面修改
+ 自动写入音频定义文件（音频定义文件只需要一个即可以播放），不过由于疏忽，调用方式为路径+文件名的方式，并且需要在两侧添加双引号
  例如，music文件夹下有一个test文件夹，test文件夹里面有一个wildfire.ogg音频文件，在使用指令调用时，需要写出如下格式才可以运行
  `/music play "test/wildfire"`
  如果此种调用方式带来较多不变，请提交issue，我会在看到后试图修改（因为懒所以这部分我没动）

# 安装与使用

首先安装[NodeJs](https://nodejs.org)，一切默认即可

在下载好的项目文件夹下（包含autopk.js的位置）打开终端（cmd或powershell，具体请自行搜索），切换为英文输入法，输入`npm install uuid archiver`，然后等待，卡顿时可以试图输入`y`并按换行键，待重新出现刚打开终端时前面的内容时（此时可能会有报错，但我的测试结果是不用管，能正常运行），最后输入`node ./autopk.js`即可开始使用



使用时，请确保文件夹内包含`resources`和`behaviors`文件夹，并将`resources`文件夹作为资源包的根目录，`behaviors`作为行为包的根目录（将包含manifest.json文件的位置称为根目录）

在完成以上安装步骤后，每次使用只需要在对应文件夹下的终端内部输入`node ./autopk.js`即可开始打包

# 配置文件解读

config.json即为配置文件

+ title：包名称
+ describe： 包描述
+ author： 包作者
+ uuid： 懂得都懂（默认不好含此选项，由打包器自动生成）
+ version： 版本信息（请修改以下条目
  packv： 包版本
  minv： mcbe可以使用的最低版本

# 其他信息

该项目短期内不会有任何维护和更新，除非有必要

该项目初衷是供自己使用，但如果有人需要，我会进行分享



该项目可以被任何人修改和发布，但请注明作者是[楚酒](https://github.com/TuJiu)和[小丸](https://github.com/MRWS0X2F)。

> 以我的水平，应该没有借鉴的必要，所以建议写一个更好的。

# 友情链接

#### [MCBE自动打包](https://github.com/MRWS0X2F/AutoPack)
