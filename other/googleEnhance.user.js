/* eslint-env browser */
// ==UserScript==
// @name        [google]Enhance
// @description
// @version     1.11
// @grant       GM_setValue
// @grant       GM_getValue
// @grant       GM_xmlhttpRequest
// @author      dodying
// @namespace   https://github.com/dodying/
// @supportURL  https://github.com/dodying//UserJs/issues
// @icon        https://gitee.com/dodying/userJs/raw/master/Logo.png
// @require     https://cdnjs.cloudflare.com/ajax/libs/jquery/3.1.0/jquery.js
// @run-at      document-end
// @include     https://www.google.co.jp/search?*
// ==/UserScript==
(function () {
  // 自动翻译英文搜索
  if ($('#lst-ib').val().match(/^[a-zA-Z\s-]+$/)) {
    const appid = '20170910000081816';
    const q = $('#lst-ib').val();
    const salt = new Date().getTime();
    const pass = 'YGwmW30xFQZxDiOxcANS';
    //
    GM_xmlhttpRequest({
      method: 'POST',
      url: 'https://fanyi-api.baidu.com/api/trans/vip/translate',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-Requested-With': 'XMLHttpRequest',
      },
      data: `q=${q}&from=en&to=zh&appid=${appid}&salt=${salt}&sign=${MD5(appid + q + salt + pass)}`,
      responseType: 'json',
      onload(res) {
        if (res.status === 200) {
          const data = res.response;
          let info;
          if ('error_code' in data) {
            console.log(data);
            info = `<a href="http://fanyi-api.baidu.com/api/trans/product/apidoc" target="_blank">Error Code: ${data.error_code}<br>Error Message: ${data.error_msg}</a>`;
          } else {
            info = '百度Api翻译结果: <br>';
            data.trans_result.forEach((i) => {
              info = `${info}<a href="https://translate.google.com.hk/#en/zh-CN/${encodeURIComponent(i.src)}" target="_blank">${i.src}</a>` + `: ${i.dst}`;
            });
          }
          $('<div class="kp-blk" style="font-size:22px;"></div>').html(info).prependTo('#rhs_block');
        } else {
          console.log(res);
        }
      },
    });
  }
  // addStyle
  $('<style>.tags{display:inline;color:#1A0DAB;margin:0 2px;border:dashed 1px #000;}.tags:before{content:"Tags: ";}.tags>a{margin:0 1px;}.f.kv._SWb>a.fl{color:#1A0DAB;margin:0 2px;border-style:solid none;border-width:1px;border-color:#000;cursor:pointer;}</style>').appendTo('head');
  // 去除跳转
  $('a[onmousedown]').removeAttr('onmousedown');
  // 隐藏挂马网站
  $('.g:has(a[href^="/interstitial?url="])').hide();
  // 取消下拉按钮
  $('.action-menu').css('visibility', 'hidden');
  // 隐藏"转为简体网页"/"翻译此页"
  $('.f.kv._SWb>a[href^="https://translate.google.co.jp/translate"]').hide();
  // 网页快照
  $('<a class="fl" target="_blank">网页快照</a>').appendTo('.f.kv._SWb').attr('href', function () {
    return `/search?q=cache%3A${encodeURIComponent($(this).parentsUntil('.rc').eq(-1).prev()
      .find('a')
      .prop('href'))}`;
  });
  // 添加标签
  $('<a class="fl">Tag</a>').on({
    click() {
      editTags($(this).parentsUntil('.rc').eq(-1).prev()
        .find('a')
        .prop('host'));
      updateTags($(this).parentsUntil('.rc').eq(-1).prev()
        .find('a')[0]);
    },
  }).appendTo('.f.kv._SWb');
  // 添加到黑名单
  $('<a class="fl">Blacklist</a>').on({
    click() {
      editTags($(this).parentsUntil('.rc').eq(-1).prev()
        .find('a')
        .prop('host'), 'block');
      updateTags($(this).parentsUntil('.rc').eq(-1).prev()
        .find('a')[0]);
    },
  }).appendTo('.f.kv._SWb');
  // 显示标签与隐藏黑名单
  $('.r:visible>a').each(function () {
    updateTags(this);
  });

  // 函数
  function editTags(host, value) {
    const tags = GM_getValue('tags', {});
    value = value || prompt('separating character (,)', tags[host] || '');
    if (!value) {
      delete tags[host];
    } else {
      tags[host] = value;
    }
    GM_setValue('tags', tags);
  }

  function updateTags(obj) {
    const tags = GM_getValue('tags', {});
    const { host } = obj;
    let _tag; let
      html;
    if (host in tags) {
      _tag = tags[host].split(',');
      $(obj).parentsUntil('.srg').eq(-1).css('background-color', _tag.indexOf('block') >= 0 ? '#000' : '#FFF');
      $(obj).parentsUntil('.srg').eq(-1).find('.f.kv._SWb>.tags')
        .remove();
      $('<div class="tags"></div>').html(() => {
        html = [];
        _tag.forEach((i) => {
          html.push(`<a href="/search?q=${i}" target="_blank">${i}</a>`);
        });
        return html.join('');
      }).appendTo($(obj).parentsUntil('.srg').eq(-1).find('.f.kv._SWb'));
    } else {
      $(obj).parentsUntil('.srg').eq(-1).css('background-color', '#FFF');
      $(obj).parentsUntil('.srg').eq(-1).find('.f.kv._SWb>.tags')
        .remove();
    }
  }
}());

function MD5(string) {
  function RotateLeft(lValue, iShiftBits) {
    return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
  }

  function AddUnsigned(lX, lY) {
    let lX4; let lY4; let lX8; let lY8; let
      lResult;
    lX8 = (lX & 0x80000000);
    lY8 = (lY & 0x80000000);
    lX4 = (lX & 0x40000000);
    lY4 = (lY & 0x40000000);
    lResult = (lX & 0x3FFFFFFF) + (lY & 0x3FFFFFFF);
    if (lX4 & lY4) {
      return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
    }
    if (lX4 | lY4) {
      if (lResult & 0x40000000) {
        return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
      }
      return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
    }
    return (lResult ^ lX8 ^ lY8);
  }

  function F(x, y, z) { return (x & y) | ((~x) & z); }

  function G(x, y, z) { return (x & z) | (y & (~z)); }

  function H(x, y, z) { return (x ^ y ^ z); }

  function I(x, y, z) { return (y ^ (x | (~z))); }

  function FF(a, b, c, d, x, s, ac) {
    a = AddUnsigned(a, AddUnsigned(AddUnsigned(F(b, c, d), x), ac));
    return AddUnsigned(RotateLeft(a, s), b);
  }

  function GG(a, b, c, d, x, s, ac) {
    a = AddUnsigned(a, AddUnsigned(AddUnsigned(G(b, c, d), x), ac));
    return AddUnsigned(RotateLeft(a, s), b);
  }

  function HH(a, b, c, d, x, s, ac) {
    a = AddUnsigned(a, AddUnsigned(AddUnsigned(H(b, c, d), x), ac));
    return AddUnsigned(RotateLeft(a, s), b);
  }

  function II(a, b, c, d, x, s, ac) {
    a = AddUnsigned(a, AddUnsigned(AddUnsigned(I(b, c, d), x), ac));
    return AddUnsigned(RotateLeft(a, s), b);
  }

  function ConvertToWordArray(string) {
    let lWordCount;
    const lMessageLength = string.length;
    const lNumberOfWords_temp1 = lMessageLength + 8;
    const lNumberOfWords_temp2 = (lNumberOfWords_temp1 - (lNumberOfWords_temp1 % 64)) / 64;
    const lNumberOfWords = (lNumberOfWords_temp2 + 1) * 16;
    const lWordArray = Array(lNumberOfWords - 1);
    let lBytePosition = 0;
    let lByteCount = 0;
    while (lByteCount < lMessageLength) {
      lWordCount = (lByteCount - (lByteCount % 4)) / 4;
      lBytePosition = (lByteCount % 4) * 8;
      lWordArray[lWordCount] = (lWordArray[lWordCount] | (string.charCodeAt(lByteCount) << lBytePosition));
      lByteCount++;
    }
    lWordCount = (lByteCount - (lByteCount % 4)) / 4;
    lBytePosition = (lByteCount % 4) * 8;
    lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
    lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
    lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
    return lWordArray;
  }

  function WordToHex(lValue) {
    let WordToHexValue = '';

    let WordToHexValue_temp = '';

    let lByte; let lCount;
    for (lCount = 0; lCount <= 3; lCount++) {
      lByte = (lValue >>> (lCount * 8)) & 255;
      WordToHexValue_temp = `0${lByte.toString(16)}`;
      WordToHexValue = WordToHexValue + WordToHexValue_temp.substr(WordToHexValue_temp.length - 2, 2);
    }
    return WordToHexValue;
  }

  function Utf8Encode(string) {
    string = string.replace(/\r\n/g, '\n');
    let utftext = '';

    for (let n = 0; n < string.length; n++) {
      const c = string.charCodeAt(n);

      if (c < 128) {
        utftext = utftext + String.fromCharCode(c);
      } else if ((c > 127) && (c < 2048)) {
        utftext = utftext + String.fromCharCode((c >> 6) | 192);
        utftext = utftext + String.fromCharCode((c & 63) | 128);
      } else {
        utftext = utftext + String.fromCharCode((c >> 12) | 224);
        utftext = utftext + String.fromCharCode(((c >> 6) & 63) | 128);
        utftext = utftext + String.fromCharCode((c & 63) | 128);
      }
    }

    return utftext;
  }

  let x = Array();
  let k; let AA; let BB; let CC; let DD; let a; let b; let c; let
    d;
  const S11 = 7;

  const S12 = 12;

  const S13 = 17;

  const S14 = 22;
  const S21 = 5;

  const S22 = 9;

  const S23 = 14;

  const S24 = 20;
  const S31 = 4;

  const S32 = 11;

  const S33 = 16;

  const S34 = 23;
  const S41 = 6;

  const S42 = 10;

  const S43 = 15;

  const S44 = 21;

  string = Utf8Encode(string);

  x = ConvertToWordArray(string);

  a = 0x67452301;
  b = 0xEFCDAB89;
  c = 0x98BADCFE;
  d = 0x10325476;

  for (k = 0; k < x.length; k = k + 16) {
    AA = a;
    BB = b;
    CC = c;
    DD = d;
    a = FF(a, b, c, d, x[k + 0], S11, 0xD76AA478);
    d = FF(d, a, b, c, x[k + 1], S12, 0xE8C7B756);
    c = FF(c, d, a, b, x[k + 2], S13, 0x242070DB);
    b = FF(b, c, d, a, x[k + 3], S14, 0xC1BDCEEE);
    a = FF(a, b, c, d, x[k + 4], S11, 0xF57C0FAF);
    d = FF(d, a, b, c, x[k + 5], S12, 0x4787C62A);
    c = FF(c, d, a, b, x[k + 6], S13, 0xA8304613);
    b = FF(b, c, d, a, x[k + 7], S14, 0xFD469501);
    a = FF(a, b, c, d, x[k + 8], S11, 0x698098D8);
    d = FF(d, a, b, c, x[k + 9], S12, 0x8B44F7AF);
    c = FF(c, d, a, b, x[k + 10], S13, 0xFFFF5BB1);
    b = FF(b, c, d, a, x[k + 11], S14, 0x895CD7BE);
    a = FF(a, b, c, d, x[k + 12], S11, 0x6B901122);
    d = FF(d, a, b, c, x[k + 13], S12, 0xFD987193);
    c = FF(c, d, a, b, x[k + 14], S13, 0xA679438E);
    b = FF(b, c, d, a, x[k + 15], S14, 0x49B40821);
    a = GG(a, b, c, d, x[k + 1], S21, 0xF61E2562);
    d = GG(d, a, b, c, x[k + 6], S22, 0xC040B340);
    c = GG(c, d, a, b, x[k + 11], S23, 0x265E5A51);
    b = GG(b, c, d, a, x[k + 0], S24, 0xE9B6C7AA);
    a = GG(a, b, c, d, x[k + 5], S21, 0xD62F105D);
    d = GG(d, a, b, c, x[k + 10], S22, 0x2441453);
    c = GG(c, d, a, b, x[k + 15], S23, 0xD8A1E681);
    b = GG(b, c, d, a, x[k + 4], S24, 0xE7D3FBC8);
    a = GG(a, b, c, d, x[k + 9], S21, 0x21E1CDE6);
    d = GG(d, a, b, c, x[k + 14], S22, 0xC33707D6);
    c = GG(c, d, a, b, x[k + 3], S23, 0xF4D50D87);
    b = GG(b, c, d, a, x[k + 8], S24, 0x455A14ED);
    a = GG(a, b, c, d, x[k + 13], S21, 0xA9E3E905);
    d = GG(d, a, b, c, x[k + 2], S22, 0xFCEFA3F8);
    c = GG(c, d, a, b, x[k + 7], S23, 0x676F02D9);
    b = GG(b, c, d, a, x[k + 12], S24, 0x8D2A4C8A);
    a = HH(a, b, c, d, x[k + 5], S31, 0xFFFA3942);
    d = HH(d, a, b, c, x[k + 8], S32, 0x8771F681);
    c = HH(c, d, a, b, x[k + 11], S33, 0x6D9D6122);
    b = HH(b, c, d, a, x[k + 14], S34, 0xFDE5380C);
    a = HH(a, b, c, d, x[k + 1], S31, 0xA4BEEA44);
    d = HH(d, a, b, c, x[k + 4], S32, 0x4BDECFA9);
    c = HH(c, d, a, b, x[k + 7], S33, 0xF6BB4B60);
    b = HH(b, c, d, a, x[k + 10], S34, 0xBEBFBC70);
    a = HH(a, b, c, d, x[k + 13], S31, 0x289B7EC6);
    d = HH(d, a, b, c, x[k + 0], S32, 0xEAA127FA);
    c = HH(c, d, a, b, x[k + 3], S33, 0xD4EF3085);
    b = HH(b, c, d, a, x[k + 6], S34, 0x4881D05);
    a = HH(a, b, c, d, x[k + 9], S31, 0xD9D4D039);
    d = HH(d, a, b, c, x[k + 12], S32, 0xE6DB99E5);
    c = HH(c, d, a, b, x[k + 15], S33, 0x1FA27CF8);
    b = HH(b, c, d, a, x[k + 2], S34, 0xC4AC5665);
    a = II(a, b, c, d, x[k + 0], S41, 0xF4292244);
    d = II(d, a, b, c, x[k + 7], S42, 0x432AFF97);
    c = II(c, d, a, b, x[k + 14], S43, 0xAB9423A7);
    b = II(b, c, d, a, x[k + 5], S44, 0xFC93A039);
    a = II(a, b, c, d, x[k + 12], S41, 0x655B59C3);
    d = II(d, a, b, c, x[k + 3], S42, 0x8F0CCC92);
    c = II(c, d, a, b, x[k + 10], S43, 0xFFEFF47D);
    b = II(b, c, d, a, x[k + 1], S44, 0x85845DD1);
    a = II(a, b, c, d, x[k + 8], S41, 0x6FA87E4F);
    d = II(d, a, b, c, x[k + 15], S42, 0xFE2CE6E0);
    c = II(c, d, a, b, x[k + 6], S43, 0xA3014314);
    b = II(b, c, d, a, x[k + 13], S44, 0x4E0811A1);
    a = II(a, b, c, d, x[k + 4], S41, 0xF7537E82);
    d = II(d, a, b, c, x[k + 11], S42, 0xBD3AF235);
    c = II(c, d, a, b, x[k + 2], S43, 0x2AD7D2BB);
    b = II(b, c, d, a, x[k + 9], S44, 0xEB86D391);
    a = AddUnsigned(a, AA);
    b = AddUnsigned(b, BB);
    c = AddUnsigned(c, CC);
    d = AddUnsigned(d, DD);
  }

  const temp = WordToHex(a) + WordToHex(b) + WordToHex(c) + WordToHex(d);

  return temp.toLowerCase();
}
