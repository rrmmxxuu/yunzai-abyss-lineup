import plugin from '../../lib/plugins/plugin.js'
import fs from 'fs'
import YAML from 'yaml'
import { exec } from 'child_process'
import { segment } from 'oicq'

export class AbyssLineup extends plugin {
  constructor() {
    super({
      /** 功能名称 Funtion Name */
      name: '查询深渊怪物',
      /** 功能描述 Description */
      dsc: '查询深渊怪物血量抗性信息',
      /** https://oicqjs.github.io/oicq/#events */
      event: 'message',
      /** 优先级，数字越小等级越高 */
      priority: 500,
      rule: [{
        /** 命令正则匹配 Regex */
        reg: '^#.*深渊怪物$',
        /** 执行方法 Method */
        fnc: 'abyssLineup',
      },
      {
        /** 命令正则匹配 Regex */
        reg: '^#深渊怪物更新$',
        /** 执行方法 Method */
        fnc: 'updateData',
      },
      {
        /** 命令正则匹配 Regex */
        reg: '^#深渊怪物帮助$',
        /** 执行方法 Method */
        fnc: 'help',
      }
      ]
    })
  }

  /**

   * 查询深渊怪物 Spiral Abyss Lineup Lookup

   * 插件(.js)复制到 Yunzai-Bot/plugins/example/ 目录下 Copy the plugin (.js) to Yunzai-Bot/plugins/example/

   * 指令： ^#.*深渊怪物$ ^#深渊怪物更新$

   */

  /** 插件初始化 Plugin Initialization */
  init() {
    let base_data_dir = "./data/"
    let abyss_data_dir = "./data/spiral-abyss-lineup-data/"

    if (!fs.existsSync(abyss_data_dir)) {
      const command = "git clone https://gitee.com/rrmmxxuu/spiral-abyss-lineup-data.git"
      exec(command, { cwd: base_data_dir }, function (error, stdout, stderr) {    
        if (error) {
          logger.error("Spiral Abyss data failed to initialize!" + error.code)
        } else {
          logger.info("Spiral Abyss data initialization successful.")
        }
      })
    }
  }

  /** 返回深渊怪物数据 Return Spiral Abyss data */
  async abyssLineup (e) {
    logger.info('[用户命令]', e.msg)
    
    let ver = e.msg.replace("#", "").trim()
    ver = ver.replace("深渊怪物", "").trim()
    const regex = /^\d\.\d$/
    const dir = "./data/spiral-abyss-lineup-data/"
    const latest_ver_file = "./data/spiral-abyss-lineup-data/latest_ver.yaml"

    if (!ver) {
      if (fs.existsSync(latest_ver_file)) {
        const file = fs.readFileSync(latest_ver_file, 'utf8')
        const latest_ver = YAML.parse(file)
        ver = latest_ver['latest-ver']
        await e.reply("未指定版本号，将返回最新版本深渊怪物")
      } else {
        logger.error("latest_ver.yaml does not exist!")
        return false
      }
    }
    
    if (!regex.test(ver)) {
      await e.reply("请输入正确的版本号格式！例如：#3.6深渊怪物")
      logger.error("Invalid version number.")
      return false
    }

    let file_path = dir + ver + ".png"

    if (fs.existsSync(file_path)){
        await e.reply(await segment.image(file_path))
        logger.info("Successful.")
        return true
      } else {
        await e.reply("暂无" + ver + "版本深渊信息")
        logger.error("Failed, abyss version does not exist.")
        return false
      }
  }

  /** 更新深渊怪物数据 Spiral Abyss data update */
  async updateData (e) {
    logger.info('[用户命令]', e.msg)

    if (!e.isMaster) {
      await e.reply("只有BOT管理员可执行此操作")
      return false
    }

    let abyss_data_dir = "./data/spiral-abyss-lineup-data/"
    const command = "git pull"
    exec(command, { cwd: abyss_data_dir }, function (error, stdout, stderr) {    
      if (/Already up to date/.test(stdout) || stdout.includes('最新')) {
        logger.info("Spiral Abyss data is already up to date.")
        e.reply("深渊怪物数据库已是最新版本")
        return true
      }
      if (error) {
        logger.error("Spiral Abyss data update failed!" + error.stack)
        e.reply("更新失败！")
        return false
      } else {
        logger.info("Spiral Abyss data update successful.")
        e.reply("深渊怪物更新成功")
        return true
      }
    })
  }

  /** 插件帮助 Plugin Documentation */
  async help(e) {
    logger.info('[用户命令]', e.msg)

    await e.reply("发送 #版本号+深渊怪物即可查询深渊怪物数据，例如：#3.6深渊怪物，如果不指定版本将自动发送最新版本深渊怪物数据")
  }
}