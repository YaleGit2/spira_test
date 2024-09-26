export const BatteryAttributes = ['DPP:batteryCategory', 'DPP:batteryStatus', 'DPP:CFPClass', 'DPP:carbonFootprint', 'DPP:shape', 'cbvmda:grossWeight', 'DPP:voltage', 'DPP:power', 'DPP:model'];
export const ProductData = {
  battery: {
    name: 'Battery',
    title: 'Battery Digital Passport',
    attributes: [
      {
        id: "DPP:batteryCategory",
        title: "Battery Category",
        description: "The intended use of the battery. Could be: LMT battery, electric vehicle battery or industrial battery."
      }, {
        id: "DPP:batteryStatus",
        title: "Battery Status",
        description: "The state in the battery lifecycle. Could be: original, repurposed, re-used, remanufactured or waste."
      }, {
        id: "DPP:CFPClass",
        title: "Product Class",
        description: ""
      }, {
        id: "DPP:carbonFootprint",
        title: "Carbon Footprint",
        description: ""
      }, {
        id: "DPP:shape",
        title: "Shape",
        description: ""
      }, {
        id: "DPP:voltage",
        title: "Voltage",
        description: ""
      }, {
        id: "DPP:power",
        title: "Power",
        description: ""
      }, {
        id: "DPP:model",
        title: "Model",
        description: ""
      }, {
        id: "cbvmda:grossWeight",
        title: "Gross Weight",
        description: ""
      }
    ]
  },
  plate: {
    name: 'Plate',
    title: 'Plate Traceability Information',
    attributes: [{
        id: 'cbvmda:grossWeight',
        title: "Gross Weight",
        description: ''
      }, {
        id: 'p2p:Material',
        title: 'Material',
        description: ''
      }, {
        id: 'p2p:Grade',
        title: 'Grade',
        description: ''
      }, {
        id: 'p2p:Standard',
        title: 'Standard',
        description: ''
      }, {
        id: 'p2p:Thickness',
        title: 'Tickness',
        description: ''
      }, {
        id: 'p2p:Tolerance',
        title: 'Tolerance',
        description: ''
      }]
  },
  cloth: {
    name: 'Clothing',
    title: 'Clothing Digital Passport',
    attributes: [
      {
        id: "DPP:clothingCategory",
        title: "Clothing Category",
        description: "The intended use of the clothing. Could be: casual wear, winter cloth."
      }, {
        id: "DPP:clothingStatus",
        title: "Clothing Status",
        description: "The state in the clothing lifecycle. Could be: new, re-used."
      }, {
        id: "DPP:CFPClass",
        title: "Product Class",
        description: ""
      }, {
        id: "DPP:carbonFootprint",
        title: "Carbon Footprint",
        description: ""
      }, {
        id: "DPP:size",
        title: "Size",
        description: ""
      }, {
        id: "DPP:voltage",
        title: "Voltage",
        description: ""
      }, {
        id: "DPP:color",
        title: "Color",
        description: ""
      }, {
        id: "DPP:fabricType",
        title: "Fabric Type",
        description: ""
      },{
        id: "DPP:brand",
        title: "Brand",
        description: ""
      },{
        id: "DPP:model",
        title: "Model",
        description: ""
      },{
        id: "DPP:image",
        title: "Image",
        description: "image of the cloth "
      },{
        id: "cbvmda:grossWeight",
        title: "Gross Weight",
        description: ""
      }
    ]
  },
  casset: {
    name: 'Casset',
    title: 'Casset Traceability Information',
    attributes: [{
  }]
  },
}