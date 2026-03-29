import type { AgentSkillExecutor, SkillInput, SkillOutput } from "../types";

interface PriceCatalog {
  model: string;
  name: string;
  priceRMB: number;
}

const PRICE_CATALOG: PriceCatalog[] = [
  { model: "HM3-G01", name: "Hub M3", priceRMB: 599 },
  { model: "RTCZCGQ12LM", name: "FP2 人体存在传感器", priceRMB: 499 },
  { model: "YLXD76YL", name: "智能吸顶灯", priceRMB: 399 },
  { model: "DL-2C", name: "LED 筒灯", priceRMB: 79 },
  { model: "ZNCLDJ14LM", name: "智能窗帘电机", priceRMB: 699 },
  { model: "WS-EUK02", name: "墙壁开关 (双键)", priceRMB: 149 },
  { model: "MCCGQ14LM", name: "门窗传感器", priceRMB: 79 },
  { model: "JY-GZ-01AQ", name: "烟雾报警器", priceRMB: 149 },
  { model: "JT-BZ-01AQ", name: "天然气报警器", priceRMB: 169 },
  { model: "SJCGQ13LM", name: "水浸传感器", priceRMB: 89 },
  { model: "WSDCGQ12LM", name: "温湿度传感器", priceRMB: 69 },
  { model: "ARIR2-GL01", name: "空调伴侣 P3", priceRMB: 199 },
  { model: "ZNMS17LM", name: "智能门锁 D100", priceRMB: 1999 },
  { model: "ZNCJMB14LM", name: "场景面板 S1", priceRMB: 399 },
  { model: "ZNCZ15LM", name: "智能插座", priceRMB: 79 },
  { model: "RTCGQ14LM", name: "人体传感器 P2", priceRMB: 129 },
  { model: "WXKG13LM", name: "无线按钮 (mini)", priceRMB: 59 },
  { model: "CH-H03D", name: "摄像头 G3", priceRMB: 349 },
];

export const bomEstimateSkill: AgentSkillExecutor = {
  id: "bom_estimate",
  name: "BOM Estimation",
  description: "Generate bill-of-materials with quantities and estimated cost",
  icon: "📋",
  supportedIntents: ["estimate_bom"],

  async execute(input: SkillInput): Promise<SkillOutput> {
    const devices = input.currentBXML.objects.filter((o) => o.type === "device");

    if (devices.length === 0) {
      return {
        updatedBXML: input.currentBXML,
        responseText: "暂无设备数据，请先为空间配置设备。",
        skillId: "bom_estimate",
      };
    }

    const modelCount = new Map<string, { name: string; qty: number; price: number }>();
    for (const dev of devices) {
      const model = dev.properties.find((p) => p.key === "model")?.value ?? "unknown";
      const qtyProp = dev.properties.find((p) => p.key === "qty");
      const qty = qtyProp ? parseInt(qtyProp.value) || 1 : 1;
      const catalog = PRICE_CATALOG.find((c) => c.model === model);
      const price = catalog?.priceRMB ?? 199;
      const name = catalog?.name ?? dev.name;

      if (modelCount.has(model)) {
        modelCount.get(model)!.qty += qty;
      } else {
        modelCount.set(model, { name, qty, price });
      }
    }

    let totalCost = 0;
    const lines: string[] = [];
    for (const [model, info] of modelCount) {
      const subtotal = info.qty * info.price;
      totalCost += subtotal;
      lines.push(`| ${info.name} | ${model} | ${info.qty} | ¥${info.price} | ¥${subtotal.toLocaleString()} |`);
    }

    const table = `| 设备 | 型号 | 数量 | 单价 | 小计 |\n|------|------|------|------|------|\n${lines.join("\n")}\n| **合计** | | **${devices.length}** | | **¥${totalCost.toLocaleString()}** |`;

    return {
      updatedBXML: input.currentBXML,
      responseText: `📋 **BOM 采购清单估算**\n\n${table}\n\n> 价格为参考零售价，批量采购可享折扣。联系 Aqara 商务获取报价。`,
      skillId: "bom_estimate",
    };
  },
};
