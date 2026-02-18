export interface WireRecord {
  id: string;
  machineName: string;
  wireType: string;
  totalProduction: number;
  changeDate: string;
  remark?: string;
}

export interface EquipmentRecord {
  id: string;
  groupName: string;
  equipmentName: string;
  totalProduction: number; // Added to match transcript "production pe change hua"
  changeDate: string;
  productionImpact: 'Yes' | 'No' | 'Remark';
  remark?: string;
}

export const wireRecords: WireRecord[] = [
  {
    id: '1',
    machineName: 'First Press',
    wireType: 'HEW-200 Primary',
    totalProduction: 12500,
    changeDate: '2024-02-15',
    remark: 'Standard wear and tear',
  },
  {
    id: '2',
    machineName: 'Second Press',
    wireType: 'SP-500 Bottom',
    totalProduction: 15400,
    changeDate: '2024-02-10',
    remark: 'Unexpected tear observed',
  },
  {
    id: '3',
    machineName: 'Bottom Wire',
    wireType: 'BW-900 Ultra',
    totalProduction: 45000,
    changeDate: '2024-01-20',
  },
];

export const equipmentRecords: EquipmentRecord[] = [
  {
    id: '1',
    groupName: 'First Press',
    equipmentName: 'Top Roller Bearing',
    totalProduction: 12550,
    changeDate: '2024-02-18',
    productionImpact: 'No',
    remark: 'Routine maintenance',
  },
  {
    id: '2',
    groupName: 'Dryer Section',
    equipmentName: 'Steam Valve V-102',
    totalProduction: 12400,
    changeDate: '2024-02-12',
    productionImpact: 'Yes',
    remark: 'Was causing steam leakage',
  },
  {
    id: '3',
    groupName: 'Top Buyer',
    equipmentName: 'Main Seal',
    totalProduction: 12000,
    changeDate: '2024-02-05',
    productionImpact: 'Remark',
    remark: 'Small leak, replaced to avoid future impact',
  },
];

export const currentMachineSections = [
  'First Press',
  'Second Press',
  'First Group Dryer',
  'Second Group Dryer',
  'Dryer Section',
  'Bottom Wire',
  'Press Bottom Wire',
];

export const currentEquipmentNames = [
  'Top Buyer',
  'Bottom Buyer',
  'First Press – Top',
  'First Press – Bottom',
  'First Press – Second Bottom',
  'Second Press – Top',
  'Second Press – Bottom',
  'First Group – Dryer',
  'First Group – Bottom',
  'Second Group – Dryer',
  'Dryer Section Parts',
];
