export interface Category {
  id?: number;
  name: string;
  color: string;
  isDefault: boolean;
  keywords: string[];
  emoji: string;
}

export interface Transaction {
  id?: number;
  amount: number;
  type: 'expense' | 'income';
  categoryId: number;
  tagIds: number[];
  note: string;
  date: string;
  accountId?: number;
  source?: string;
  sourceId?: string;
}

export interface Tag {
  id?: number;
  name: string;
  color: string;
  emoji: string;
}

export interface Budget {
  id?: number;
  month: string;
  limit: number;
}

export interface Account {
  id?: number;
  name: string;
  type: 'wechat' | 'alipay' | 'bank' | 'cash' | 'other';
  color: string;
  emoji: string;
  balance: number;
}

export const DEFAULT_ACCOUNTS: Omit<Account, 'id'>[] = [
  { name: '微信', type: 'wechat', color: '#07C160', emoji: '💬', balance: 0 },
  { name: '支付宝', type: 'alipay', color: '#1677FF', emoji: '🔵', balance: 0 },
  { name: '银行卡', type: 'bank', color: '#F5A623', emoji: '💳', balance: 0 },
  { name: '现金', type: 'cash', color: '#43B97F', emoji: '💵', balance: 0 },
];

export const DEFAULT_CATEGORIES: Omit<Category, 'id'>[] = [
  { name: '餐饮', color: '#FF8BA7', emoji: '🍜', isDefault: true, keywords: ['饭','餐','外卖','奶茶','水果','零食','小吃','火锅','烧烤','早餐','午餐','晚餐','咖啡','饮料','酒','聚餐','食堂','面包','蛋糕','冰淇淋'] },
  { name: '交通', color: '#84D8D0', emoji: '🚗', isDefault: true, keywords: ['地铁','公交','打车','滴滴','加油','停车','高铁','火车','飞机','机票','单车','共享','出租','过路费','通勤'] },
  { name: '购物', color: '#A78BFA', emoji: '🛍️', isDefault: true, keywords: ['淘宝','京东','拼多多','超市','商场','衣服','鞋','包','化妆品','护肤品','数码','手机','电脑','日用品'] },
  { name: '住房', color: '#F9C74F', emoji: '🏠', isDefault: true, keywords: ['房租','房贷','物业','水电','维修','装修','家居','家具','清洁','暖气','燃气'] },
  { name: '娱乐', color: '#F9844A', emoji: '🎮', isDefault: true, keywords: ['电影','游戏','KTV','旅游','景点','门票','演出','演唱会','健身','运动','SPA','按摩','游泳','滑雪'] },
  { name: '医疗', color: '#F984E5', emoji: '💊', isDefault: true, keywords: ['医院','药','体检','挂号','牙科','诊所','中药','保健品','口罩'] },
  { name: '通讯', color: '#577590', emoji: '📱', isDefault: true, keywords: ['话费','网费','宽带','流量','快递','邮寄'] },
  { name: '理财', color: '#F9C74F', emoji: '💰', isDefault: true, keywords: ['基金','股票','理财','利息','收益','红包','转账','退款','工资','奖金'] },
  { name: '其他', color: '#B5B5B5', emoji: '📌', isDefault: true, keywords: [] },
];

export const CAT_COLORS = [
  '#FF8BA7','#84D8D0','#A78BFA','#F9C74F','#F9844A','#F984E5','#577590','#B5B5B5','#43B97F','#4ECDC4','#FF6B6B','#A8E6CF','#FFD93D','#C9C9FF','#FFB5A7',
];
