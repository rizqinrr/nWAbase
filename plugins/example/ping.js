import { formatUptime } from '../../src/utils/index.js'

export default {
  name: 'ping',
  command: 'ping',
  alias: 'p',
  category: 'example',
  description: 'Memeriksa status bot',
  async execute(message) {
    await message.reply(`Pong! Bot aktif.\nUptime: ${formatUptime(process.uptime() * 1000)}`)
  }
}
