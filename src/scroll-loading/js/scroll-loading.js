(function(global){
  var class2type = {},
    toString = class2type.toString,
    hasOwn = class2type.hasOwnProperty,
    util = {
      extend: function() {
        var options,
        name,
        src,
        copy,
        copyIsArray,
        clone,
        target = arguments[0] || {},
        length = arguments.length,
        i = 1,
        deep = false

        if (typeof target === 'boolean') {
          deep = target
          target = arguments[i] || {}
          i++
        }

        if (typeof target !== 'object' && !this.isFunction(target)) {
          target = {}
        }

        if (i === length) {
          target = this
          i--
        }

        for (; i < length; i++) {
          if ((options = arguments[i]) != null) {
            for (name in options) {
              src = target[name]
              copy = options[name]

              if (target === copy) {
                continue
              }

              if (deep && copy && (this.isPlainObject(copy) || (copyIsArray = this.isArray(copy)))) {
                if (copyIsArray) {
                  copyIsArray = false
                  clone = src && this.isArray(src) ? src : []
                } else {
                  clone = src && this.isPlainObject(src) ? src : {}
                }

                target[name] = this.extend(deep, clone, copy)
              } else if (copy !== undefined) {
                target[name] = copy
              }
            }
          }
        }

        return target
      },
      isFunction: function(obj) {
        return this.type(obj) === 'function'
      },
      type: function(obj) {
        if (obj == null) {
          return obj + ''
        }

        'Boolean Number String Function Array Date RegExp Object Error'.split(' ').forEach(function(name) {
          class2type['object ' + name + ''] = name.toLowerCase()
        })

        return typeof obj === 'object' || typeof obj === 'function' ?
          class2type[toString.call(obj)] || 'object' :
          typeof obj
      },
      isPlainObject: function(obj) {
        var key

        if (!obj || this.type(obj) !== 'object' || obj.nodeType || this.isWindow(obj)) {
          return false
        }

        try {
          if (obj.constructor &&
            !hasOwn.call(obj, 'constructor') &&
            !hasOwn.call(obj.constructor.prototype, 'isPrototypeOf')) {
            return false
          }
        } catch(e) {
          return false
        }

        for (key in obj) {}

        return key === undefined || hasOwn.call(obj, key)
      },
      isWindow: function(obj) {
        return obj != null && obj == obj.window
      },
      isArray: Array.isArray || function(obj) {
        return this.type(obj) === 'array'
      }
    }

  function ScrollLoading(options) {
    this.container = document.querySelector(options.selector)
    this.options = util.extend(true, {
      allText: '全部加载完成',
      count: 30,
      size: 10,
      page: 0,
      isAjax: true,
      height: document.documentElement.clientHeight,
      template: function() {
        var html = '',
          i = 0,
          len = this.size;

        for (; i < len; i++) {
          html += '<li>'
              + '<img src="image/head.png">'
              + '<div>'
              + '  <div class="name">大侠</div>'
              + '  <p>在设计师详情页面，增加"对设计师评价"模块，点击"更多评价"</p>'
              + '</div>'
              + '</li>'
        }

        return html;
      }
    }, options)

    this.init(this.options)
  }

  ScrollLoading.prototype = {
    init: function(options) {
      var tpl = this._getTemplate(options)

      // 设置列表窗口高度
      this.setHeight()

      this.append(tpl)

      // 滚动加载
      this.scroll()
    },
    _getTemplate: function(options) {
      // 非ajax方式
      if (!options.isAjax) {
        return options.template()
      } else {
        // ajax方式
        // 请求数据,渲染模板
        return this._ajax(options, function(data) {
          return this.options.template(data)
        }).bind(this)
      }
    },
    // 判断列表是否可以滚动
    _isToScroll: function() {
      var container = this.container,
        hContainer = container.clientHeight,
        hList = container.querySelector('ul').clientHeight,
        hTip = container.querySelector('.tip').clientHeight

      return hList + hTip - hContainer > 0
    },
    _ajax: function(options, callback) {
      var url = options.url,
        type = options.type,
        dataType = 'json',
        data = options.data ? JSON.stringify(options.data) : null
        xhr = new XMLHttpRequest()

      xhr.open(type, url, false)
      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
          callback(xhr.responseText)
        }
      }
      xhr.send(data)
    },
    setHeight: function() {
      var container = this.container,
        height = this.options.height

      container.style.height = height + 'px'
    },
    append: function(content) {
      this.container.querySelector('ul').insertAdjacentHTML('beforeend', content)
      this.options.page++

      // 无法滚动，继续添加内容
      if (!this._isToScroll()) {
        this.append(content)
      }
    },
    scroll: function() {
      var container = this.container,
        self = this,
        options = this.options,
        size = options.size,
        count = options.count

      container.addEventListener('scroll', function(e) {
        var hContainer = container.clientHeight,
          hList = container.querySelector('ul').clientHeight,
          stContainer = container.scrollTop,
          tipElem = container.querySelector('.tip'),
          page = options.page

        console.log(stContainer - (hList - hContainer))
        if (stContainer - (hList - hContainer) > 0 && (page * size - count < 0)) {
          self.append(self._getTemplate(options))
        }

        if (page * size - count >= 0) {
          tipElem.innerHTML = options.allText
        }
      }, false)
    }
  }

  global.ScrollLoading = ScrollLoading
}(this))