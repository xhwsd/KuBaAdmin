/**
 * 界面核心模块
 */

layui.define('view', function(exports) {
  var $ = layui.jquery;
  var laytpl = layui.laytpl;
  var table = layui.table;
  var element = layui.element;
  var util = layui.util;
  var upload = layui.upload;
  var form = layui.form;
  var setter = layui.setter;
  var view = layui.view;
  var device = layui.device();

  var $win = $(window);
  var $doc = $(document);
  var $body = $('body');
  var container = $('#'+ setter.container);

  var SHOW = 'layui-show';
  var HIDE = 'layui-hide';
  var THIS = 'layui-this';
  var DISABLED = 'layui-disabled';
  var TEMP = 'template';
  var APP_BODY = '#LAY_app_body';
  var APP_FLEXIBLE = 'LAY_app_flexible';
  var FILTER_TAB_TBAS = 'layadmin-layout-tabs';
  var APP_SPREAD_SM = 'layadmin-side-spread-sm';
  var TABS_BODY = 'layadmin-tabsbody-item';
  var ICON_SHRINK = 'layui-icon-shrink-right';
  var ICON_SPREAD = 'layui-icon-spread-left';
  var SIDE_SHRINK = 'layadmin-side-shrink';
  var SIDE_SCROLL = 'layui-side-scroll';
  var SIDE_MENU = 'LAY-system-side-menu';

  // 通用方法
  var admin = {
    v: '2.6.0',
    mode: 'spa',

    // 数据的异步请求
    req: view.req,

    // 清除本地 token，并跳转到登入页
    exit: view.exit,

    // HTML 转义
    escape: util.escape,

    // 事件
    on: function(events, callback){
      return layui.onevent.call(this, setter.MOD_NAME, events, callback);
    },

    // 弹出面板
    popup: view.popup,

    // 右侧面板
    popupRight: function(options){
      // layer.close(admin.popup.index);
      return admin.popup.index = layer.open($.extend({
        type: 1
        ,id: 'LAY_adminPopupR'
        ,anim: -1
        ,title: false
        ,closeBtn: false
        ,offset: 'r'
        ,shade: 0.1
        ,shadeClose: true
        ,skin: 'layui-anim layui-anim-rl layui-layer-adminRight'
        ,area: '300px'
      }, options));
    },

    // 渲染侧边菜单
    renderMenuItems: function(res) {
      var url = layui.hash()
      var path =  url.path
      var pathURL = path.join('/')
      var dataName = layui.setter.response.dataName;
      var childrenName = 'children'; // 用于存放子菜单集合的名称

      // 递归
      return (function eachItems(data, itemTagName) {
        itemTagName = itemTagName || 'li'; // 菜单项标签名
        var arr = [];
        var isli = itemTagName === 'li';

        layui.each(data || res[dataName], function(index, item) {
          // 是否有子菜单
          var hasChildren = typeof item[childrenName] === 'object' && item[childrenName].length > 0
          var url = item.url || ''; // URL
          var primaryClassName = isli ? 'layui-nav-item' : '' // 初始 className
          var selectedClassName = function() { // 选中的 className
            var matched = (!data && index == 0 && !path[0]) // 匹配首页
              || (pathURL === url) // 按 URL 匹配
              || item.spread // 展开状态
            // 返回选中样式
            return matched ? (hasChildren ? 'layui-nav-itemed' : 'layui-this') : '';
          };
          // 递归子菜单
          var eachChildItems = function() {
            return hasChildren
              ? '<dl class="layui-nav-child">'+ eachItems(item[childrenName], 'dd') + '</dl>'
            : '';
          };
          // 子菜单父元素
          arr.push([
            '<'+ itemTagName +' class="'+ primaryClassName +' '+ selectedClassName() +'">',
              '<a href="javascript:;"'+ function() {
                var attrs = [];
                if (!hasChildren) {
                  attrs.push('lay-href="'+ url +'"');
                }
                if (item.pageMode) {
                  attrs.push('lay-page-mode="'+ item.pageMode +'"');
                }
                if (isli) {
                  attrs.push('lay-tips="'+ item.title +'"');
                  attrs.push('lay-direction="2"');
                }
                return attrs.length ? ' '+ attrs.join('') : '';
              }() +'>',
                '<i class="layui-icon '+ (item.icon || '') +'"></i>',
                '<cite>'+ (item.title || '未命名') +'</cite>',
              '</a>',
              eachChildItems(), // 子菜单
            '</'+ itemTagName +'>'
          ].join(''));
        });
        return arr.join('');
      })();
    },

    // 设置侧边状态展开和选中状态，并同步其他状态
    setSideMenuStatus: function(url) {
      url = url || layui.hash();

      var sideMenu = $('#'+ SIDE_MENU);
      var SIDE_NAV_ITEM = 'layui-nav-item';
      var SIDE_NAV_ITEMD = 'layui-nav-itemed';
      var selectMenuItem = function(item) {
        item.addClass(SIDE_NAV_ITEMD).siblings().removeClass(SIDE_NAV_ITEMD);
      };

      // 捕获对应菜单
      var matchMenu = function(list) {
        var pathURL = url.path.join('/');
        // var tabsData = setter.tabs ? tabs.data(TABS_ID) : {};

        list.find('li,dd').each(function(index, item) {
          var othis = $(this);
          var elemA = othis.children('a');
          var href = admin.correctRouter(elemA.attr('lay-href'));
          var matched = href === url.href || href === pathURL || function() {
            var href2Hash = layui.hash('#'+ href);
            var hrefPath = href2Hash.path.join('/');
            return url.href.indexOf(hrefPath) !== -1;
          }()

          // 匹配当前路由对应的菜单
          if (matched) {
            list.find('.'+ THIS).removeClass(THIS); // 清除旧选中状态
            othis.addClass(THIS); // 设置当前选中状态

            // 自动展开祖级节点
            var closestLi = othis.closest('.'+ SIDE_NAV_ITEM);
            var closestDd = othis.parent().closest('dd')
            selectMenuItem(closestLi);
            selectMenuItem(closestDd);

            // 让选中的菜单保持在可视范围内
            util.toVisibleArea({
              scrollElem: container.find('.'+ SIDE_SCROLL),
              thisElem: othis
            });

            // 初始设置 tabs 标题
            /* if (!args[0] && setter.tabs) {
              var title = elemA.attr('lay-title') || elemA.text().replace(/\s/g, '');
              tabs.headerItem(TABS_ID, tabsData.index).find('span').html(title);
            } */
          }
        });
      };

      // 重置状态
      sideMenu.find('.'+ THIS).removeClass(THIS);

      // 移动端点击菜单时自动收缩
      if(admin.screen() < 2) admin.sideFlexible();

      // 开始捕获
      matchMenu(sideMenu);
    },

    // 发送验证码
    sendAuthCode: function(options) {
      options = $.extend({
        seconds: 60
        ,elemPhone: '#LAY_phone'
        ,elemVercode: '#LAY_vercode'
      }, options);

      var seconds = options.seconds
      ,token = null
      ,timer, countDown = function(loop){
        var btn = $(options.elem)
        seconds--;
        if(seconds < 0){
          btn.removeClass(DISABLED).html('获取验证码');
          seconds = options.seconds;
          clearInterval(timer);
        } else {
          btn.addClass(DISABLED).html(seconds + '秒后重获');
        }

        if(!loop){
          timer = setInterval(function(){
            countDown(true);
          }, 1000);
        }
      };

      $body.off('click', options.elem).on('click', options.elem, function(){
        options.elemPhone = $(options.elemPhone);
        options.elemVercode = $(options.elemVercode);

        var elemPhone = options.elemPhone
        ,value = elemPhone.val();

        if(seconds !== options.seconds || $(this).hasClass(DISABLED)) return;

        if(!/^1\d{10}$/.test(value)){
          elemPhone.focus();
          return layer.msg('请输入正确的手机号')
        };

        if(typeof options.ajax === 'object'){
          var success = options.ajax.success;
          delete options.ajax.success;
        }

        admin.req($.extend(true, {
          url: ''
          ,type: 'get'
          ,data: {
            phone: value
          }
          ,success: function(res){
            layer.msg('验证码已发送至你的手机，请注意查收', {
              icon: 1
              ,shade: 0
            });
            options.elemVercode.focus();
            countDown();
            success && success(res);
          }
        }, options.ajax));
      });
    },

    // 屏幕类型
    screen: function(){
      var width = $win.width();
      if(width > 1200){
        return 3; // 大屏幕
      } else if(width > 992){
        return 2; // 中屏幕
      } else if(width > 768){
        return 1; // 小屏幕
      } else {
        return 0; // 超小屏幕
      }
    },

    // 侧边伸缩
    sideFlexible: function(status){
      var app = container
      ,iconElem =  $('#'+ APP_FLEXIBLE)
      ,screen = admin.screen();

      // 设置状态，PC：默认展开、移动：默认收缩
      if(status === 'spread'){
        // 切换到展开状态的 icon，箭头：←
        iconElem.removeClass(ICON_SPREAD).addClass(ICON_SHRINK);

        // 移动：从左到右位移；PC：清除多余选择器恢复默认
        if(screen < 2){
          app.addClass(APP_SPREAD_SM);
        } else {
          app.removeClass(APP_SPREAD_SM);
        }

        app.removeClass(SIDE_SHRINK)
      } else {
        // 切换到搜索状态的 icon，箭头：→
        iconElem.removeClass(ICON_SHRINK).addClass(ICON_SPREAD);

        // 移动：清除多余选择器恢复默认；PC：从右往左收缩
        if(screen < 2){
          app.removeClass(SIDE_SHRINK);
        } else {
          app.addClass(SIDE_SHRINK);
        }

        app.removeClass(APP_SPREAD_SM)
      }

      layui.event.call(this, setter.MOD_NAME, 'side({*})', {
        status: status
      });
    },

    // 重置主体区域表格尺寸
    resizeTable: function(delay){
      var that = this, runResizeTable = function(){
        that.tabsBody(admin.tabsPage.index).find('.layui-table-view').each(function(){
          var tableID = $(this).attr('lay-id');
          layui.table.resize(tableID);
        });
      };
      if(!layui.table) return;
      delay ? setTimeout(runResizeTable, delay) : runResizeTable();
    },

    // 主题设置
    theme: function(options){
      var theme = setter.theme;
      var local = layui.data(setter.tableName);
      var id = 'LAY_layadmin_theme';
      var styleElem = document.getElementById(id);
      var style = document.createElement('style');

      // 清除主题
      if (options.CLEAR) {
        $(styleElem).remove();
        return layui.data(setter.tableName, {
          key: 'theme',
          remove: true
        });
      }

      var styleText = laytpl([
        // 主题色
        '.layui-side-menu,'
        ,'.layui-layer-admin .layui-layer-title,'
        ,'.layadmin-side-shrink .layui-side-menu .layui-nav>.layui-nav-item>.layui-nav-child'
        ,'{background-color:{{d.color.main}} !important;}'

        // 背景选中色
        ,'.layadmin-pagetabs .layui-tab-title li:after,'
        ,'.layadmin-pagetabs .layui-tab-title li.layui-this:after,'
        ,'.layui-nav-tree .layui-this,'
        ,'.layui-nav-tree .layui-this>a,'
        ,'.layui-nav-tree .layui-nav-child dd.layui-this,'
        ,'.layui-nav-tree .layui-nav-child dd.layui-this a,'
        ,'.layui-nav-tree .layui-nav-bar'
        ,'{background-color:{{d.color.selected}} !important;}'

        // logo
        ,'.layui-layout-admin .layui-logo{background-color:{{d.color.logo || d.color.main}} !important;}'

        // 文字选中色
        ,'.layadmin-pagetabs .layui-tab-title li:hover,'
        ,'.layadmin-pagetabs .layui-tab-title li.layui-this'
        ,'{color: {{d.color.selected}} !important;}'

        // 头部色
        ,'{{# if(d.color.header){ }}'
          ,'.layui-layout-admin .layui-header{background-color:{{ d.color.header }};}'
          ,'.layui-layout-admin .layui-header a,'
          ,'.layui-layout-admin .layui-header a cite{color: #f8f8f8;}'
          ,'.layui-layout-admin .layui-header a:hover{color: #fff;}'
          ,'.layui-layout-admin .layui-header .layui-nav .layui-nav-more{border-top-color: #fbfbfb;}'
          ,'.layui-layout-admin .layui-header .layui-nav .layui-nav-mored{border-color: transparent; border-bottom-color: #fbfbfb;}'
          ,'.layui-layout-admin .layui-header .layui-nav .layui-this:after, .layui-layout-admin .layui-header .layui-nav-bar{background-color: #fff; background-color: rgba(255,255,255,.5);}'
          ,'.layadmin-pagetabs .layui-tab-title li:after{display: none;}'
        ,'{{# } }}'
      ].join('')).render(options = $.extend({}, local.theme, options));

      // 添加主题样式
      if('styleSheet' in style){
        style.setAttribute('type', 'text/css');
        style.styleSheet.cssText = styleText;
      } else {
        style.innerHTML = styleText;
      }
      style.id = id;

      styleElem && $body[0].removeChild(styleElem);

      $body[0].appendChild(style);
      options.color && $body.attr('layadmin-themealias', options.color.alias);

      // 本地存储记录
      local.theme = local.theme || {};
      layui.each(options, function(key, value){
        local.theme[key] = value;
      });
      layui.data(setter.tableName, {
        key: 'theme'
        ,value: local.theme
      });
    },

    // 初始化主题
    initTheme: function(index){
      var theme = setter.theme;
      index = index || 0;
      if(theme.color[index]){
        theme.color[index].index = index;
        admin.theme({
          color: theme.color[index]
        });
      }
    },

    // 记录最近一次点击的页面标签数据
    tabsPage: {},

    // 获取标签页的头元素
    tabsHeader: function(index){
      return $('#LAY_app_tabsheader').children('li').eq(index || 0);
    },

    // 获取页面标签主体元素
    tabsBody: function(index){
      return $(APP_BODY).find('.'+ TABS_BODY).eq(index || 0);
    },

    // 切换页面标签主体
    tabsBodyChange: function(index){
      admin.tabsHeader(index).attr('lay-attr', layui.hash().href);
      admin.tabsBody(index).addClass(SHOW).siblings().removeClass(SHOW);
      events.rollPage('auto', index);
    },

    // resize事件管理
    resize: function(fn){
      var url = layui.hash();
      var key = url.path.join('-');

      if(admin.resizeFn[key]){
        $win.off('resize', admin.resizeFn[key]);
        delete admin.resizeFn[key];
      }

      if(fn === 'off') return; // 如果是清除 resize 事件，则终止往下执行

      fn(), admin.resizeFn[key] = fn;
      $win.on('resize', admin.resizeFn[key]);
    },
    resizeFn: {},
    runResize: function(){
      var url = layui.hash()
      var key = url.path.join('-');
      admin.resizeFn[key] && admin.resizeFn[key]();
    },
    delResize: function(){
      this.resize('off');
    },

    // 关闭当前 pageTabs
    closeThisTabs: function(){
      if(!admin.tabsPage.index) return;
      $(TABS_HEADER).eq(admin.tabsPage.index).find('.layui-tab-close').trigger('click');
    },

    // 全屏
    fullScreen: function(){
      var ele = document.documentElement
      ,reqFullScreen = ele.requestFullscreen || ele.webkitRequestFullScreen
      || ele.mozRequestFullScreen || ele.msRequestFullscreen;
      if(typeof reqFullScreen !== 'undefined' && reqFullScreen) {
        reqFullScreen.call(ele);
      };
    },

    // 退出全屏
    exitScreen: function(){
      var ele = document.documentElement
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitCancelFullScreen) {
        document.webkitCancelFullScreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    },

    // 纠正单页路由格式
    correctRouter: function(href) {
      if(!/^\//.test(href)) href = '/' + href;

      // 纠正首尾
      return href.replace(/^(\/+)/, '/')
      .replace(new RegExp('\/' + setter.entry + '$'), '/'); // 过滤路由最后的默认视图文件名（如：index）
    }

    // ……
  };

  // 事件
  var events = admin.events = {
    // 伸缩
    flexible: function(othis){
      var iconElem = othis.find('#'+ APP_FLEXIBLE)
      ,isSpread = iconElem.hasClass(ICON_SPREAD);
      admin.sideFlexible(isSpread ? 'spread' : null); // 控制伸缩
      admin.resizeTable(350);
    }

    // 刷新
    ,refresh: function(){
      admin.render();
    }

    // 输入框搜索
    ,serach: function(othis){
      othis.off('keypress').on('keypress',function(e){
        if(!this.value.replace(/\s/g, '')) return;
        // 回车跳转
        if(e.keyCode === 13){
          var href = othis.attr('lay-action')
          ,text = othis.attr('lay-text') || '搜索';

          href = href + this.value;
          text = text + ' <span style="color: #FF5722;">'+ admin.escape(this.value) +'</span>';

          // 打开标签页
          location.hash = admin.correctRouter(href)

          // 如果搜索关键词已经打开，则刷新页面即可
          events.serach.keys || (events.serach.keys = {});
          events.serach.keys[admin.tabsPage.index] = this.value;
          if(this.value === events.serach.keys[admin.tabsPage.index]){
            events.refresh(othis);
          }

          // 清空输入框
          this.value = '';
        }
      });
    }

    // 点击消息
    ,message: function(othis){
      othis.find('.layui-badge-dot').remove();
    }

    // 弹出主题面板
    ,theme: function(){
      admin.popupRight({
        id: 'LAY_adminPopupTheme'
        ,success: function(){
          view(this.id).render('system/theme')
        }
      });
    }

    // 便签
    ,note: function(othis){
      var mobile = admin.screen() < 2
      ,note = layui.data(setter.tableName).note;

      events.note.index = admin.popup({
        title: '便签'
        ,shade: 0
        ,offset: [
          '41px'
          ,(mobile ? null : (othis.offset().left - 250) + 'px')
        ]
        ,anim: -1
        ,id: 'LAY_adminNote'
        ,skin: 'layadmin-note layui-anim layui-anim-upbit'
        ,content: '<textarea placeholder="内容"></textarea>'
        ,resize: false
        ,success: function(layero, index){
          var textarea = layero.find('textarea')
          ,value = note === undefined ? '便签中的内容会存储在本地，这样即便你关掉了浏览器，在下次打开时，依然会读取到上一次的记录。是个非常小巧实用的本地备忘录' : note;

          textarea.val(value).focus().on('keyup', function(){
            layui.data(setter.tableName, {
              key: 'note'
              ,value: this.value
            });
          });
        }
      })
    }

    // 全屏
    ,fullscreen: function(othis, opts){
      var SCREEN_FULL = 'layui-icon-screen-full';
      var SCREEN_REST = 'layui-icon-screen-restore';
      var iconElem = othis.children("i");
      var hasFull = iconElem.hasClass(SCREEN_FULL);

      // 设置图标状态
      var setIcon = function(status){
        if(status){
          iconElem.addClass(SCREEN_REST).removeClass(SCREEN_FULL);
        } else {
          iconElem.addClass(SCREEN_FULL).removeClass(SCREEN_REST);
        }
      };

      // 设置全屏状态
      var setScreen = function(status){
        status ? admin.fullScreen() : admin.exitScreen();
      };

      // 仅设置图标状态
      if(opts){
        return setIcon(opts.status);
      }

      setIcon(hasFull);
      setScreen(hasFull);
    }

    // 弹出关于面板
    ,about: function(){
      admin.popupRight({
        id: 'LAY_adminPopupAbout'
        ,success: function(){
          view(this.id).render('system/about')
        }
      });
    }

    // 弹出更多面板
    ,more: function(){
      admin.popupRight({
        id: 'LAY_adminPopupMore'
        ,success: function(){
          view(this.id).render('system/more')
        }
      });
    }

    // 返回上一页
    ,back: function(){
      history.back();
    }

    // 主题设置
    ,setTheme: function(othis){
      var index = othis.data('index');
      var nextIndex = othis.siblings('.layui-this').data('index');

      if(othis.hasClass(THIS)) return;

      othis.addClass(THIS).siblings('.layui-this').removeClass(THIS);
      admin.initTheme(index);

      view('LAY_adminPopupTheme').render('system/theme');
    }

    // 左右滚动页面标签
    ,rollPage: function(type, index){
      var tabsHeader = $('#LAY_app_tabsheader')
      ,liItem = tabsHeader.children('li')
      ,scrollWidth = tabsHeader.prop('scrollWidth')
      ,outerWidth = tabsHeader.outerWidth()
      ,tabsLeft = parseFloat(tabsHeader.css('left'));

      // 右左往右
      if(type === 'left'){
        if(!tabsLeft && tabsLeft <=0) return;

        // 当前的left减去可视宽度，用于与上一轮的页标比较
        var  prefLeft = -tabsLeft - outerWidth;

        liItem.each(function(index, item){
          var li = $(item)
          ,left = li.position().left;

          if(left >= prefLeft){
            tabsHeader.css('left', -left);
            return false;
          }
        });
      } else if(type === 'auto'){ // 自动滚动
        (function(){
          var thisLi = liItem.eq(index), thisLeft;

          if(!thisLi[0]) return;
          thisLeft = thisLi.position().left;

          // 当目标标签在可视区域左侧时
          if(thisLeft < -tabsLeft){
            return tabsHeader.css('left', -thisLeft);
          }

          // 当目标标签在可视区域右侧时
          if(thisLeft + thisLi.outerWidth() >= outerWidth - tabsLeft){
            var subLeft = thisLeft + thisLi.outerWidth() - (outerWidth - tabsLeft);
            liItem.each(function(i, item){
              var li = $(item)
              ,left = li.position().left;

              // 从当前可视区域的最左第二个节点遍历，如果减去最左节点的差 > 目标在右侧不可见的宽度，则将该节点放置可视区域最左
              if(left + tabsLeft > 0){
                if(left - tabsLeft > subLeft){
                  tabsHeader.css('left', -left);
                  return false;
                }
              }
            });
          }
        }());
      } else {
        // 默认向左滚动
        liItem.each(function(i, item){
          var li = $(item)
          ,left = li.position().left;

          if(left + li.outerWidth() >= outerWidth - tabsLeft){
            tabsHeader.css('left', -left);
            return false;
          }
        });
      }
    }

    // 向右滚动页面标签
    ,leftPage: function(){
      events.rollPage('left');
    }

    // 向左滚动页面标签
    ,rightPage: function(){
      events.rollPage();
    }

    // 关闭当前标签页
    ,closeThisTabs: function(){
      admin.closeThisTabs();
    }

    // 关闭其它标签页
    ,closeOtherTabs: function(type){
      var TABS_REMOVE = 'LAY-system-pagetabs-remove';
      var thisIndex = admin.tabsPage.index;
      if(type === 'all'){
        $(TABS_HEADER+ ':gt(0)').remove();
        $(APP_BODY).find('.'+ TABS_BODY+ ':gt(0)').remove();
      } else if(type === 'right') {
        $(TABS_HEADER+ ':gt('+ thisIndex +')').remove();
        $(APP_BODY).find('.'+ TABS_BODY+ ':gt('+ thisIndex +')').remove();
      } else {
        $(TABS_HEADER).each(function(index, item){
          if(index && index != thisIndex){
            $(item).addClass(TABS_REMOVE);
            admin.tabsBody(index).addClass(TABS_REMOVE);
          }
        });
        $('.'+ TABS_REMOVE).remove();
      }
    }

    // 关闭右侧标签页
    ,closeRightTabs: function() {
      events.closeOtherTabs('right');
    }

    // 关闭全部标签页
    ,closeAllTabs: function(){
      events.closeOtherTabs('all');
      location.hash = '';
    }

    // 遮罩
    ,shade: function(){
      admin.sideFlexible();
    }
  };

  // 初始结构
  (function(){
    // 禁止水平滚动
    $body.addClass('layui-layout-body');

    // 移动端强制不开启页面标签功能
    if(admin.screen() < 1){
      delete setter.pageTabs;
    }

    // 不开启页面标签时
    if(!setter.pageTabs){
      container.addClass('layadmin-tabspage-none');
    }

    // 低版本 IE 提示
    if(device.ie && device.ie < 10){
      view.error('IE'+ device.ie + '下访问可能不佳，推荐使用：Chrome / Firefox / Edge 等高级浏览器', {
        offset: 'auto',
        id: 'LAY_errorIE'
      });
    }

  })();

  // 初始主题
  (function(){
    // 主题初始化，本地主题记录优先，其次为 initColorIndex
    var local = layui.data(setter.tableName);
    if(local.theme){
      admin.theme(local.theme);
    } else if(setter.theme){
      admin.initTheme(setter.theme.initColorIndex);
    }
  })();

  // admin.prevRouter = {}; // 上一个路由

  // hash 改变侧边状态
  admin.on('hash(side)', admin.setSideMenuStatus);

  // 侧边导航点击事件
  element.on('nav(layadmin-system-side-menu)', function(elem){
    if(elem.siblings('.layui-nav-child')[0] && container.hasClass(SIDE_SHRINK)){
      admin.sideFlexible('spread');
      layer.close(elem.data('index'));
    };
    admin.tabsPage.type = 'nav';
  });

  // 选项卡的更多操作
  element.on('nav(layadmin-pagetabs-nav)', function(elem){
    var dd = elem.parent();
    dd.removeClass(THIS);
    dd.parent().removeClass(SHOW);
  });

  // 同步路由
  var setThisRouter = function(othis){
    var layid = othis.attr('lay-id');
    var attr = othis.attr('lay-attr');
    var index = othis.index();

    location.hash = layid === setter.entry ? '/' : (attr || '/');
    admin.tabsBodyChange(index);
  }
  ,TABS_HEADER = '#LAY_app_tabsheader>li';

  // 页面标签点击
  $body.on('click', TABS_HEADER, function(){
    var othis = $(this)
    ,index = othis.index();

    admin.tabsPage.type = 'tab';
    admin.tabsPage.index = index;

    // 如果是 iframe 类型的标签页
    if(othis.attr('lay-attr') === 'iframe'){
      return admin.tabsBodyChange(index);
    };


    setThisRouter(othis); // 同步路由
    admin.runResize(); // 执行 resize 事件，如果存在的话
    admin.resizeTable(); // 重置当前主体区域的表格尺寸
  });

  // tabspage 删除
  element.on('tabDelete(layadmin-layout-tabs)', function(obj){
    var othis = $(TABS_HEADER+ '.layui-this');

    obj.index && admin.tabsBody(obj.index).remove();
    setThisRouter(othis);

    // 移除 resize 事件
    admin.delResize();
  });

  // 页面跳转
  $body.on('click', '*[lay-href]', function(){
    var othis = $(this)
    var href = othis.attr('lay-href')
    var url = layui.hash();

    admin.tabsPage.elem = othis;
    // admin.prevRouter[router.path[0]] = url.href; // 记录上一次各菜单的路由信息

    // 执行跳转
    location.hash = admin.correctRouter(href);

    // 如果为当前页，则执行刷新
    if (setter.refreshCurrPage) {
      if (admin.correctRouter(href) === url.href) {
        admin.events.refresh();
      }
    }
  });

  // 点击事件
  $body.on('click', '*[layadmin-event]', function(){
    var othis = $(this)
    ,attrEvent = othis.attr('layadmin-event');
    events[attrEvent] && events[attrEvent].call(this, othis);
  });

  // tips
  $body.on('mouseenter', '*[lay-tips]', function(){
    var othis = $(this);

    if(othis.parent().hasClass('layui-nav-item') && !container.hasClass(SIDE_SHRINK)) return;

    var tips = othis.attr('lay-tips')
    ,offset = othis.attr('lay-offset')
    ,direction = othis.attr('lay-direction')
    ,index = layer.tips(tips, this, {
      tips: direction || 1
      ,time: -1
      ,success: function(layero, index){
        if(offset){
          layero.css('margin-left', offset + 'px');
        }
      }
    });
    othis.data('index', index);
  }).on('mouseleave', '*[lay-tips]', function(){
    layer.close($(this).data('index'));
  });

  // 窗口 resize 事件
  var resizeSystem = layui.data.resizeSystem = function(){
    // layer.close(events.note.index);
    layer.closeAll('tips');

    if(!resizeSystem.lock){
      setTimeout(function(){
        admin.sideFlexible(admin.screen() < 2 ? '' : 'spread');
        delete resizeSystem.lock;
      }, 100);
    }

    resizeSystem.lock = true;
  }
  $win.on('resize', layui.data.resizeSystem);

  // 全屏事件
  $doc.on("fullscreenchange", function(){
    events.fullscreen($('[layadmin-event="fullscreen"]'), {
      status: document.fullscreenElement
    });
  });

  // 预设基础组件 token，以便在组件请求数据时自动传递 token
  admin.setComponentsToken = (function fn(opts) {
    var request = setter.request;
    opts = $.extend({}, opts);
    // 若开启 token 功能
    if (request.tokenName) {
      // 根据 token 的传递方式，给组件返回动态配置项
      var dynamicOptions = function(dataAlias) {
        var rst = {};
        var obj = {};
        obj[request.tokenName] = layui.data(setter.tableName)[request.tokenName] || opts.value || '';

        // token 的传参方式
        if (request.tokenTransferMethod === 'headers') { // Headers 方式传递
          rst.headers = obj;
        } else { // data 方式传递 --- 默认
          rst[dataAlias || 'data'] = obj;
        }

        return rst;
      };

      // 带数据请求功能的基础组件
      table.set(dynamicOptions('where')); // table
      upload.set(dynamicOptions()); // upload
    }
    return fn;
  })();


  // 接口输出
  exports('admin', admin);
});
