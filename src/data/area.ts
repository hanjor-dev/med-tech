/**
 * 中国行政区划树形数据（省-市-区三级）
 * 用于 el-cascader 等级选择组件
 * 来源：参考国家统计局行政区划代码
 */
export interface AreaNode {
  id: number
  name: string
  children?: AreaNode[]
}

export const areaTree: AreaNode[] = [
  {
    id: 110000, name: '北京市',
    children: [
      { id: 110101, name: '东城区' },
      { id: 110102, name: '西城区' },
      { id: 110105, name: '朝阳区' },
      { id: 110106, name: '丰台区' },
      { id: 110107, name: '石景山区' },
      { id: 110108, name: '海淀区' },
    ],
  },
  {
    id: 310000, name: '上海市',
    children: [
      { id: 310101, name: '黄浦区' },
      { id: 310104, name: '徐汇区' },
      { id: 310105, name: '长宁区' },
      { id: 310106, name: '静安区' },
      { id: 310107, name: '普陀区' },
      { id: 310109, name: '虹口区' },
      { id: 310110, name: '杨浦区' },
    ],
  },
  {
    id: 440000, name: '广东省',
    children: [
      {
        id: 440100, name: '广州市', children: [
          { id: 440103, name: '荔湾区' },
          { id: 440104, name: '越秀区' },
          { id: 440105, name: '海珠区' },
          { id: 440106, name: '天河区' },
          { id: 440111, name: '白云区' },
          { id: 440112, name: '黄埔区' },
          { id: 440113, name: '番禺区' },
        ],
      },
      {
        id: 440300, name: '深圳市', children: [
          { id: 440303, name: '罗湖区' },
          { id: 440304, name: '福田区' },
          { id: 440305, name: '南山区' },
          { id: 440306, name: '宝安区' },
          { id: 440307, name: '龙岗区' },
        ],
      },
    ],
  },
  {
    id: 330000, name: '浙江省',
    children: [
      {
        id: 330100, name: '杭州市', children: [
          { id: 330102, name: '上城区' },
          { id: 330105, name: '拱墅区' },
          { id: 330106, name: '西湖区' },
          { id: 330108, name: '滨江区' },
        ],
      },
      { id: 330200, name: '宁波市', children: [{ id: 330203, name: '海曙区' }, { id: 330205, name: '江北区' }] },
      { id: 330300, name: '温州市' },
    ],
  },
  {
    id: 510000, name: '四川省',
    children: [
      {
        id: 510100, name: '成都市', children: [
          { id: 510104, name: '锦江区' },
          { id: 510105, name: '青羊区' },
          { id: 510106, name: '金牛区' },
          { id: 510107, name: '武侯区' },
          { id: 510108, name: '成华区' },
        ],
      },
      { id: 510700, name: '绵阳市' },
    ],
  },
  {
    id: 320000, name: '江苏省',
    children: [
      {
        id: 320100, name: '南京市', children: [
          { id: 320102, name: '玄武区' },
          { id: 320104, name: '秦淮区' },
          { id: 320105, name: '建邺区' },
          { id: 320106, name: '鼓楼区' },
        ],
      },
      { id: 320500, name: '苏州市' },
    ],
  },
  {
    id: 420000, name: '湖北省',
    children: [
      {
        id: 420100, name: '武汉市', children: [
          { id: 420102, name: '江岸区' },
          { id: 420103, name: '江汉区' },
          { id: 420104, name: '硚口区' },
          { id: 420105, name: '汉阳区' },
          { id: 420106, name: '武昌区' },
          { id: 420107, name: '青山区' },
          { id: 420111, name: '洪山区' },
        ],
      },
    ],
  },
  {
    id: 610000, name: '陕西省',
    children: [
      {
        id: 610100, name: '西安市', children: [
          { id: 610102, name: '新城区' },
          { id: 610103, name: '碑林区' },
          { id: 610104, name: '莲湖区' },
          { id: 610112, name: '雁塔区' },
        ],
      },
    ],
  },
]
