/**
 * 初始化主题入口模块
 */
layui.config({
	// 静态资源所在路径
	base: 'res/',
	// 动态刷新缓存
	version: new Date().getTime()
}).extend({
	// 将 config.js 扩展到 layui 模块
	setter: 'config'
}).define(['setter'], function(exports) {
	var setter = layui.setter;

	// 将核心库扩展到 layui 模块
	layui.each({
		admin: 'admin',
		view: 'view',
		adminIndex: 'index'
	}, function(modName, fileName) {
		var libs = {};
		libs[modName] = '{/}' + setter.paths.core + '/modules/' + fileName;
		layui.extend(libs);
	});

	// 指定业务模块基础目录
	layui.config({
		base: setter.paths.modules
	});

	// 将业务模块中的特殊模块扩展到 layui 模块
	layui.each(setter.extend, function(key, value) {
		var mods = {};
		mods[key] = '{/}' + layui.cache.base + value;
		layui.extend(mods);
	});

	// 加载主题核心库入口模块
	layui.use('adminIndex', function() {
		// 加载公共业务模块，如不需要可剔除
		layui.use('common');

		// 输出模块 / 模块加载完毕标志
		exports('index', layui.admin);
	});
});
