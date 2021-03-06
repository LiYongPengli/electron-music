const path = require('path');

module.exports = {
  lintOnSave: false,
  productionSourceMap: false,
  configureWebpack: config => {
    if (process.env.NODE_ENV !== 'development') {
      // 清除开发中debug和console.log等等
      config.optimization.minimizer[0].options.terserOptions.warnings = false;
      config.optimization.minimizer[0].options.terserOptions.compress = {
        warnings: false,
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log']
      };
    }
  },
  pluginOptions: {
    // 这里是electronbuild的配置信息
    electronBuilder: {
      // 这里是在浏览器中使用node环境，需要为true
      nodeIntegration: true,
      builderOptions: {
        productName: '我的音乐',
        appId: 'com.inote.heiyehk',
        copyright: 'heiyehk',
        compression: 'store', // "store" | "normal"| "maximum" 打包压缩情况(store 相对较快)，store 39749kb, maximum 39186kb
        directories: {
          output: 'build' // 输出文件夹
        },
        win: {
          icon: path.resolve(__dirname, './public/icon.ico'),
          target: ['nsis', 'zip']
        },
        mac: {
          target: { target: 'dir', arch: 'arm64' }
        },
        nsis: {
          oneClick: false, // 一键安装
          // guid: 'xxxx', // 注册表名字，不推荐修改
          perMachine: true, // 是否开启安装时权限限制（此电脑或当前用户）
          allowElevation: true, // 允许请求提升。 如果为false，则用户必须使用提升的权限重新启动安装程序。
          allowToChangeInstallationDirectory: true, // 允许修改安装目录
          installerIcon: path.resolve(__dirname, './public/icon.ico'), // 安装图标
          uninstallerIcon: path.resolve(__dirname, './public/icon.ico'), // 卸载图标
          // uninstallerIcon: './build/icons/bbb.ico', // 卸载图标
          installerHeaderIcon: path.resolve(__dirname, './public/icon.ico'), // 安装时头部图标
          createDesktopShortcut: true, // 创建桌面图标
          createStartMenuShortcut: true, // 创建开始菜单图标
          shortcutName: '我的音乐' // 图标名称
        }
      }
    },
    'style-resources-loader': {
      preProcessor: 'scss',
      patterns: [path.resolve(__dirname, 'src/style.scss')] // 引入全局样式变量
    }
  },
  chainWebpack: config => {
    config.plugin('html').tap(args => {
      args[0].title = '我的音乐'
      return args
    })
  },
};
