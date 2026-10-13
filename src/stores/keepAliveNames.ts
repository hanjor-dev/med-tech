import { defineStore } from 'pinia';
interface KeepAliveNamesState {
	keepAliveNames: string[];
	cachedViews: string[];
}
/**
 * 路由缓存列表
 * @methods setCacheKeepAlive 设置要缓存的路由 names
 * @methods addCachedView 添加要缓存的路由 names
 * @methods delCachedView 删除要缓存的路由 names
 * @methods delOthersCachedViews 右键菜单`关闭其它`，删除要缓存的路由 names
 * @methods delAllCachedViews 右键菜单`全部关闭`，删除要缓存的路由 names
 */
export const useKeepALiveNames = defineStore('keepALiveNames', {
	state: (): KeepAliveNamesState => ({
		keepAliveNames: [],
		cachedViews: [],
	}),
	actions: {
		async setCacheKeepAlive(data: Array<string>) {
			this.keepAliveNames = data;
		},
		async addCachedView(view: any) {
			if (view.meta.isKeepAlive) this.cachedViews?.push(view.name);
		},
		async delCachedView(view: any) {
			const index = this.cachedViews.indexOf(view.name);
			index > -1 && this.cachedViews.splice(index, 1);
		},
		async delOthersCachedViews(view: any) {
			if (view.meta.isKeepAlive) this.cachedViews = [view.name];
			else this.cachedViews = [];
		},
		async delAllCachedViews() {
			this.cachedViews = [];
		},
	},
});
