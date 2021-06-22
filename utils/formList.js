// 动态表单数据
//sort:序号，label:表单input/select等，type:表单类型，name：关键字，通过固定name名进行校验 ，title :表单名称，placeholder:提示信息，maxLength:最大长度，required:是否为必填，requiredMessage:未填时的提示信息,ruleMessage:填写错误的提示信息，options:单选，多选数组数据，mode:单选类型（selector,time,date）

module.exports = {
	"data": [
    {
			"sort": 1,
			"label": "input",  
			"type": "text",
			"name": "tel",
			"title": "手机号",
			"placeholder": "请填写手机号",
			"maxLength": 11,
			"required": true,
			"requiredMessage": "请填写手机号",
			"ruleMessage": "请输入正确的手机号"
		},
		{
			"sort": 2,
			"label": "input",
			"type": "text",
			"name": "sqdwdz",
			"title": "地址",
			"placeholder": "请填写地址",
			"maxLength": 20,
			"required": true,
			"requiredMessage": "请填写申请单位地址",
			"ruleType": "string",
			"checkRule": "/^1[0-9]{10}$/",
			"ruleMessage": "申请单位地址必须为1-50个字符！"
		},
		{
			"sort": 3,
			"label": "select",
			"type": "",
			"name": "township",
			"title": "所属镇区",
			"required": false,
			"ruleType": "notcheck",
			"checkRule": "",
      "ruleMessage": "不需要",
      "placeholder":"请选择",
			"options": ['东区', '石岐区', '古镇', '五桂山', '其他'],
			"mode": "selector",
			"index": 0
		},
		{
			"sort": 4,
			"label": "select",
			"type": "",
			"name": "sqrzjlx",
			"title": "证件类型",
			"placeholder": "请选择证件类型",
			"required": true,
			"requiredMessage": "请选择证件类型",
			"ruleType": "notnull",
			"checkRule": "",
      "ruleMessage": "请选择申请单位证件类型",
      "placeholder":"请选择",
			"options": ['统一社会信用代码', '工商营业执照', '组织机构代码', '登记证', '其他'],
			"mode": "selector",
			"index": 0
		},
		{
			"sort": 5,
			"label": "select",
			"type": "",
			"name": "dlxzq",
			"title": "多列选择器",
			"placeholder": "",
			"required": false,
			"requiredMessage": "",
			"ruleType": "notnull",
			"checkRule": "",
      "ruleMessage": "请选择城市",
      "placeholder":"请选择",
			"options": [
				['中国', '伊朗'],
				['广东省', '山东省'],
				['中山市', '北京', '上海', '广州']
			],
			"mode": "multiSelector",
			"multiIndex": [0, 0, 0]
		},
		{
			"sort": 6,
			"label": "select",
			"type": "",
			"name": "rqxzq",
			"title": "日期选择器",
			"placeholder": "",
			"required": false,
			"requiredMessage": "",
			"ruleType": "notnull",
			"checkRule": "",
      "ruleMessage": "请选择日期",
      "placeholder":"请选择",
			"options": null,
			"mode": "date",
			"index": 0
		},
		{
			"sort": 6,
			"label": "select",
			"type": "",
			"name": "sjxzq",
			"title": "时间选择器",
			"placeholder": "",
			"required": false,
			"requiredMessage": "",
			"ruleType": "notnull",
			"checkRule": "",
      "ruleMessage": "请选择时间",
      "placeholder":"请选择",
			"options": null,
			"mode": "time",
			"index": 0
		},
		{
			"sort": 7,
			"label": "radio",
			"type": "",
			"name": "radio",
			"title": "单选框",
			"placeholder": "",
			"required": false,
			"ruleType": "notcheck",
			"checkRule": "",
      "ruleMessage": "不需要",
      "placeholder":"请选择",
			"options": [{
					"value": "radio1",
					"text": "选项1"
				},
				{
					"value": "radio2",
					"text": "选项2"
				}
      ],
      mode:"selector"
		},
		{
			"sort": 8,
			"label": "checkbox",
			"type": "",
			"name": "checkbox",
			"title": "复选框",
			"placeholder": "",
			"required": false,
			"ruleType": "notcheck",
			"checkRule": "",
			"ruleMessage": "不需要",
			"options": [{
					"value": "checkbox1",
					"text": "选项1"
				},
				{
					"value": "checkbox2",
					"text": "选项2"
				},
				{
					"value": "checkbox3",
					"text": "选项3"
				}
			]
		},
		{
			"sort": 9,
			"label": "switch",
			"type": "",
			"name": "switch",
			"title": "开关选择器",
			"placeholder": "",
			"maxLength": 0,
			"required": false,
			"ruleType": "notcheck",
			"checkRule": "",
			"ruleMessage": "不需要",
			"checked": "checked"
		},
		{
			"sort": 10,
			"label": "textarea",
			"type": "",
			"name": "sqsy",
			"title": "申请事由",
			"placeholder": "请填写申请事由",
			"maxLength": 2000,
			"required": false,
			"ruleType": "notcheck",
			"checkRule": "",
			"ruleMessage": "不需要"
		},
		{
			"sort": 11,
			"label": "image",
			"type": "image",
			"name": "image",
			"title": "请选择图片",
			"placeholder": "",
			"maxLength": 9,
			"required": false,
			"ruleType": "notcheck",
			"checkRule": "",
			"ruleMessage": "您未上传图片",

		},
		{
			"sort": 12,
			"label": "slider",
			"type": "",
			"name": "slider",
			"title": "滑动选择器",
			"placeholder": "",
			"maxLength": 0,
			"required": false,
			"ruleType": "notcheck",
			"checkRule": "",
			"ruleMessage": "不需要",
			"options": {
				"min": 5,
				"max": 100,
				"step": 5,
				"value": 50
			}
		},
	]
}