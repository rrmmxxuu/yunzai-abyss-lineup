import plugin from '../../lib/plugins/plugin.js'
import fs from 'fs'
import YAML from 'yaml'
import { segment } from 'oicq'

export class AbyssLineup extends plugin {
  constructor() {
    super({
      /** 功能名称 */
      name: '查询深渊怪物',
      /** 功能描述 */
      dsc: '查询深渊怪物血量抗性信息',
      /** https://oicqjs.github.io/oicq/#events */
      event: 'message',
      /** 优先级，数字越小等级越高 */
      priority: 500,
      rule: [{
        /** 命令正则匹配 */
        reg: '^#.*深渊怪物$',
        /** 执行方法 */
        fnc: 'abyssLineup',
      }
      ]
    })
  }

  /**

   * 查询深渊怪物

   * 插件(.js)复制到 Yunzai-Bot/plugins/example/ 目录下

   * 指令： ^#.*深渊怪物$

   */

  /** 插件初始化 */
  init() {
    let file = './plugins/example/abyssLineup/'

    if (!fs.existsSync(file)) {
      fs.mkdirSync(file)
    }
  }

  /** 发送数据 */
  async abyssLineup (e) {
    logger.info('[用户命令]', e.msg)
    
    let ver = e.msg.replace("#", "").trim()
    ver = ver.replace("深渊怪物", "").trim()
    const regex = /^\d\.\d$/
    const dir = "./plugins/example/abyssLineup/"
    const latest_ver_file = "./plugins/example/abyssLineup/latest_ver.yaml"

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

}