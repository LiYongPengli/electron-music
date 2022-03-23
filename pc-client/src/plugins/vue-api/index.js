(function () {

    /**
     * Install plugin
     * @param Vue
     * @param api
     */
    
    function plugin(Vue, api) {
    
      if (plugin.installed) {
        return
      }
      plugin.installed = true
    
      if (!api) {
        console.error('You have to install api')
        return
      }
    
      Vue.api = api
    
      Object.defineProperties(Vue.prototype, {
    
        api: {
          get() {
            return api
          }
        },
      })
    }
    
    if (typeof exports == "object") {
      module.exports = plugin
    } else if (typeof define == "function" && define.amd) {
      define([], function(){ return plugin })
    } else if (window.Vue && window.api) {
      Vue.use(plugin, window.api)
    }
    
    })();
    