/**
 * setter
 */
// 初始化配置
layui.define(['all'], function(exports) {
  	exports('setter', {
		paths: {
			// 核心库所在目录
			core: layui.cache.base + 'adminui/dist/',
			// 业务视图所在目录
			views: layui.cache.base + 'views/',
			// 业务模块所在目录
			modules: layui.cache.base + 'modules/',
			// 记录静态资源所在基础目录
			base: layui.cache.base
		},

		// 主容器 ID
		container: 'app',
		// 默认视图文件名
		entry: 'index',
		// 视图文件后缀名
		engine: '.html',
		// 是否开启页面选项卡功能。单页版不推荐开启
		pageTabs: false,
		// 当跳转页面 url 与当前页 url 相同时，是否自动执行刷新
		refreshCurrPage: true,

		// 主题名称
		name: '库巴',
		// 本地存储表名
		tableName: 'kuba-admin',
		// 模块事件名
		MOD_NAME: 'admin',

		// 是否开启调试模式。如开启，接口异常时会抛出异常 URL 等信息
		debug: true,
		// 是否开启未登入拦截
		interceptor: true,

		// 自定义请求字段
		request: {
			// 接口自动传递 token 的字段名。可设置 false 不传递
			tokenName: 'access_token',
			// token 的传递方式（可选值: data | headers） --- v2.4.0 新增
			tokenTransferMethod: 'data'
		},

		// 自定义响应字段
		response: {
			// 数据状态的字段名称
			statusName: 'code',
			statusCode: {
				// 数据状态一切正常的状态码
				ok: 0,
				// 登录状态失效的状态码
				logout: 1001
			},
			// 状态信息的字段名称
			msgName: 'msg',
			// 数据详情的字段名称
			dataName: 'data'
		},

		// 独立页面路由，可随意添加（无需写参数）
		indPage: [
			// 登入页
			'/user/login',
			// 注册页
			'/user/reg',
			// 找回密码
			'/user/forget',
			// 独立页的一个测试 demo
			'/template/tips/test'
		],

		// 配置业务模块目录中的特殊模块
		extend: {
			// layim
			layim: 'layim/layim'
		},

		// 主题配置
		theme: {
			// 内置主题配色方案
			color: [{
				// 主题色
				main: '#20222A',
				// 选中色
				selected: '#16baaa',
				// 默认别名
				alias: 'default'
			}, {
				main: '#03152A',
				selected: '#3B91FF',
				alias: 'dark-blue' // 藏蓝
			}, {
				main: '#2E241B',
				selected: '#A48566',
				alias: 'coffee' // 咖啡
			}, {
				main: '#50314F',
				selected: '#7A4D7B',
				alias: 'purple-red' // 紫红
			}, {
				main: '#344058',
				logo: '#1E9FFF',
				selected: '#1E9FFF',
				alias: 'ocean' // 海洋
			}, {
				main: '#3A3D49',
				logo: '#2F9688',
				selected: '#16b777',
				alias: 'green' // 墨绿
			}, {
				main: '#20222A',
				logo: '#F78400',
				selected: '#F78400',
				alias: 'red' // 橙色
			}, {
				main: '#28333E',
				logo: '#AA3130',
				selected: '#AA3130',
				alias: 'fashion-red' // 时尚红
			}, {
				main: '#24262F',
				logo: '#3A3D49',
				selected: '#16baaa',
				alias: 'classic-black' // 经典黑
			}, {
				logo: '#226A62',
				header: '#2F9688',
				alias: 'green-header' // 墨绿头
			}, {
				main: '#344058',
				logo: '#0085E8',
				selected: '#1E9FFF',
				header: '#1E9FFF',
				alias: 'ocean-header' // 海洋头
			}, {
				header: '#393D49',
				alias: 'classic-black-header' // 经典黑
			}, {
				main: '#50314F',
				logo: '#50314F',
				selected: '#7A4D7B',
				header: '#50314F',
				alias: 'purple-red-header' // 紫红头
			}, {
				main: '#28333E',
				logo: '#28333E',
				selected: '#AA3130',
				header: '#AA3130',
				alias: 'fashion-red-header' // 时尚红头
			}, {
				main: '#28333E',
				logo: '#16baaa',
				selected: '#16baaa',
				header: '#16baaa',
				alias: 'green-header' // 墨绿头
			}, {
				main: '#393D49',
				logo: '#393D49',
				selected: '#16baaa',
				header: '#23262E',
				alias: 'Classic-style1' // 经典风格1
			}, {
				main: '#001529',
				logo: '#001529',
				selected: '#1890FF',
				header: '#1890FF',
				alias: 'Classic-style2' // 经典风格2
			}, {
				main: '#25282A',
				logo: '#25282A',
				selected: '#35BDB2',
				header: '#35BDB2',
				alias: 'Classic-style3' // 经典风格3
			}],

			// 初始的颜色索引，对应上面的配色方案数组索引
			// 如果本地已经有主题色记录，则以本地记录为优先，除非请求本地数据（localStorage）
			initColorIndex: 0
		}
	});
});
