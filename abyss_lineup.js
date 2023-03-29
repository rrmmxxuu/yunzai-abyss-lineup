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
        /** 使用权限 Permission */
        permission: 'master'
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
      logger.info("Initializing abyss data...")
      const command = "git clone https://gitee.com/rrmmxxuu/spiral-abyss-lineup-data.git"
      exec(command, { cwd: base_data_dir }, function (error, stdout, stderr) {    
        if (error) {
          logger.error("Spiral Abyss data failed to initialize!" + error.stack)
        } else {
          logger.info("Spiral Abyss data initialization successful.")
        }
      })
    }
  }

  /** 返回深渊怪物数据 Return Spiral Abyss data */
  async abyssLineup (e) {
    logger.info('[用户命令]', e.msg)
    
    const ver_floor_regex = /^(\d\.\d)?(.*)$/u
    const dir = "./data/spiral-abyss-lineup-data/"
    const ver_data = this.read_ver()

    let ver_floor = e.msg.replace("#", "").trim()
    ver_floor = ver_floor.replace("深渊怪物", "").trim()

    /** if version and floor not specified */
    if (!ver_floor) {
      logger.info("Version and floor not specified, return current version 11 and 12 floor.")
      await e.reply("未指定版本和层数，将返回当前版本十一层及十二层怪物信息")

      let ver = ver_data['curr-ver']
      let ver_key = ver + "-" + "11"
      if (ver_key in ver_data.ver) {
        ver_key = ver_data.ver[ver_key]
        let file_path = dir + ver_key + ".jpg"
        await this.sendData(e, file_path)
      }

      ver_key = ver + "-" + "12"

      if (ver_key in ver_data.ver) {
        ver_key = ver_data.ver[ver_key]
        let file_path = dir + ver_key + ".jpg"
        await this.sendData(e, file_path)
      }
      
      return true
    }
    
    /** Handle parameters */
    let [, ver, floor] = ver_floor.match(ver_floor_regex)

    if (!ver) {
      logger.info("Version not specified, return the current version.")
      ver = ver_data['curr-ver']
    }

    if (!floor) {
      floor = "all"
    } else if (floor === "十一层"){
      floor = "11"
    } else if (floor === "十二层") {
      floor = "12"
    } else {
      logger.warn("Incorrect floor input")
      await e.reply("不正确的输入，请在#版本 后输入十一层或十二层，或不指定层数以返回十一层和十二层")
      return false
    }

    let ver_key = ver + "-" + floor
    logger.info(ver_key)
    
    if (floor === "all"){
      let ver_key_11 = ver + "-" + "11"
      let ver_key_12 = ver + "-" + "12"

      if (!(ver_key_11 in ver_data.ver) && !(ver_key_12 in ver_data.ver)){
        logger.warn("Abyss Data does not exist")
        await e.reply("此版本/层数深渊数据不存在")
        return false
      }

      if (ver_data.ver[ver_key_11] === ver_data.ver[ver_key_12]) {
        let file_path = dir + ver_data.ver[ver_key_11] + ".jpg"
        await this.sendData(e, file_path)
        return true
      }

      ver_key = ver + "-" + "11"
      if (ver_key in ver_data.ver) {
        ver_key = ver_data.ver[ver_key]
        let file_path = dir + ver_key + ".jpg"
        await this.sendData(e, file_path)
      } else {
        logger.warn("Abyss Data does not exist")
        await e.reply("此版本/层数深渊数据不存在")
      }

      ver_key = ver + "-" + "12"
      if (ver_key in ver_data.ver) {
        ver_key = ver_data.ver[ver_key]
        let file_path = dir + ver_key + ".jpg"
        await this.sendData(e, file_path)
      } else {
        logger.warn("Abyss Data does not exist")
        await e.reply("此版本/层数深渊数据不存在")
      }
      
      return true
    } else if (floor === "11") {
      if (ver_key in ver_data.ver) {
        ver_key = ver_data.ver[ver_key]
        let file_path = dir + ver_key + ".jpg"
        await this.sendData(e, file_path)
      } else {
        logger.warn("Abyss Data does not exist")
        await e.reply("此版本/层数深渊数据不存在")
      }
    } else {
      if (ver_key in ver_data.ver) {
        ver_key = ver_data.ver[ver_key]
        let file_path = dir + ver_key + ".jpg"
        await this.sendData(e, file_path)
      } else {
        logger.warn("Abyss Data does not exist")
        await e.reply("此版本/层数深渊数据不存在")
      }
    }
  }

  async sendData(e, file_path) {
    await e.reply(await segment.image(file_path))
    logger.info("Successful.")
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
        e.reply("更新失败!" + error.stack)
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

    await e.reply("发送 #版本号+层数+深渊怪物即可查询深渊怪物数据，例如：#3.5十二层深渊怪物，如果不指定版本或层数将自动发送当前版本深渊十一及十二层怪物数据")
  }

  read_ver() {
    let file = `./data/spiral-abyss-lineup-data/ver.yaml`

    try {
      return YAML.parse(
        fs.readFileSync(file, 'utf8')
      )
    } catch (error) {
      return false
    }
  }

}