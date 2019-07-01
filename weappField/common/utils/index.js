
export const stringToRegExp = function(target) {
  if (typeof target !== 'string') return '';

  let stringReg = target.replace(/^\/|\/[gim]*$|\/$/g, '');
  let Modifier = /[gim]*$/.exec(target);
  return new RegExp(stringReg, Modifier);
};

export const getPropByPath = function(obj, path, strict) {
  let tempObj = obj;
  path = path.replace(/\[(\w+)\]/g, ".$1");
  path = path.replace(/^\./, "");

  let keyArr = path.split(".");
  let i = 0;
  for (let len = keyArr.length; i < len - 1; ++i) {
    if (!tempObj && !strict) break;
    let key = keyArr[i];
    if (key in tempObj) {
      tempObj = tempObj[key];
    } else {
      if (strict) {
        throw new Error("please transfer a valid prop path to form item!");
      }
      break;
    }
  }
  return {
    o: tempObj,
    k: keyArr[i],
    v: tempObj ? tempObj[keyArr[i]] : null
  };
}

export const typeOf = function(obj) {
  const toString = Object.prototype.toString;
  const map = {
      '[object Boolean]': 'boolean',
      '[object Number]': 'number',
      '[object String]': 'string',
      '[object Function]': 'function',
      '[object Array]': 'array',
      '[object Date]': 'date',
      '[object RegExp]': 'regExp',
      '[object Undefined]': 'undefined',
      '[object Null]': 'null',
      '[object Object]': 'object',
      '[object FormData]': 'formdata'
  };
  return map[toString.call(obj)];
}

export const encodePattern = function(data, code) {
  if (!code) code = 'encode';

  const t = typeOf(data);
  let o;

  if (t === 'array') {
      o = [];
  } else if (t === 'object') {
      o = {};
  } else {
      return data;
  }

  if (t === 'array') {
      for (let i = 0; i < data.length; i++) {
          o.push(encodePattern(data[i], code));
      }
  } else if (t === 'object') {
      for (let i in data) {
        if (i === 'pattern') {
          if (code === 'encode') {
            o[i] = encodeURI(data[i]);
          } else if (code === 'decode') {
            o[i] = decodeURI(data[i]);
          }
        } else {
          o[i] = encodePattern(data[i], code);
        }
      }
  }
  return o;
}