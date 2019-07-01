import {encodePattern} from '../../weappField/common/utils/index';

const app = getApp();

// 正则校验请使用 encodePattern函数包裹， 因为小程序会自动把正则过滤
Page({
  data: {
    fields: [
      {
        name: 'user_mobile',
        label: '手机号码',
        type: 'tel',
        message: '请输入手机号',
        mask: '###-####-####'
      },
      {
        name: 'user_pass',
        label: '服务密码',
        message: '请输入服务密码',
        type: 'password'
      },
      {
        name: 'identity_code',
        label: '身份证',
        message: '请输入身份证号',
        type: 'text'
      },
      {
        name: 'real_name',
        label: '真实姓名',
        message: '请输入真实姓名',
        type: 'text'
      }
    ],

    model: {
      user_mobile: '',
      user_pass: '',
      identity_code: '',
      real_name: 'laowang'
    },

    rules: encodePattern({
      user_mobile: [
        {
          required: true,
          message: '手机号不能为空'
        },
        {
          required: true,
          message: '手机号格式不正确',
          pattern: /^1[3-9][0-9]{9}$/
        }
      ],
      user_pass: [
        {
          required: true,
          message: '密码不能为空'
        },
        {
          required: true,
          message: '密码格式不正确',
          pattern: /^[\S]{6,20}$/
        }
      ],
      identity_code: [
        {
          required: true,
          message: '身份证不能为空'
        },
        {
          message: '身份证号码格式不正确',
          pattern: /^([1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3})|([1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}([0-9]|X|x)|[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3})$/
        }
      ],
      real_name: [
        {
          required: true,
          message: '真实姓名不能为空'
        },
        {
          message: '姓名格式不正确',
          pattern: /^([\u4e00-\u9fa5\u3400-\u4DBF\uF900-\uFAFF\·•]){2,15}$/
        }
      ]
    })
  },
  sendHandle(obj) {
    console.log('send', obj);
  },
  btnHandle(e) {
    this.selectComponent('#boxForm').clearValidate();
  },
  resetHandle() {
    this.selectComponent('#boxForm').resetFields();
  },
  validateHandle() {
    this.selectComponent('#boxForm').validate(value => {
      console.log(value, 'validate');
    });
  }
});
