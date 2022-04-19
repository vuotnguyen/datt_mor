export const useConvertFullSizeHalfSize = (val) => {
  let set = val.split(',');
  let charsets = {
    latin: { halfRE: /[!-~]/g, fullRE: /[！-～]/g, delta: 0xfee0 },
    hangul1: { halfRE: /[ﾡ-ﾾ]/g, fullRE: /[ᆨ-ᇂ]/g, delta: -0xedf9 },
    hangul2: { halfRE: /[ￂ-ￜ]/g, fullRE: /[ᅡ-ᅵ]/g, delta: -0xee61 },
    kana: {
      delta: 0,
      half: '｡｢｣､･ｦｧｨｩｪｫｬｭｮｯｰｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝﾞﾟ',
      full:
        '。「」、・ヲァィゥェォャュョッーアイウエオカキクケコサシ' +
        'スセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワン゛゜',
    },
    extras: {
      delta: 0,
      half: '¢£¬¯¦¥₩\u0020|←↑→↓■°',
      full: '￠￡￢￣￤￥￦\u3000￨￩￪￫￬￭￮',
    },
  };
  let toFull = (set) => (c) =>
    set.delta ? String.fromCharCode(c.charCodeAt(0) + set.delta) : [...set.full][[...set.half].indexOf(c)];
  let toHalf = (set) => (c) =>
    set.delta ? String.fromCharCode(c.charCodeAt(0) - set.delta) : [...set.half][[...set.full].indexOf(c)];
  let re = (set, way) => set[way + 'RE'] || new RegExp('[' + set[way] + ']', 'g');
  let sets = Object.keys(charsets).map((i) => charsets[i]);
  const toFullWidth = (str0) => {
    return sets.reduce((str, set) => {
      return str.replace(re(set, 'half'), toFull(set));
    }, str0);
  };
  const toHalfWidth = (str0) => {
    return sets.reduce((str, set) => {
      return str.replace(re(set, 'full'), toHalf(set));
    }, str0);
  };
  const mapSpecialCharacter = (character) => {
    let FulltoHalf = {
      ガ: 'ｶﾞ',
      ギ: 'ｷﾞ',
      グ: 'ｸﾞ',
      ゲ: 'ｹﾞ',
      ゴ: 'ｺﾞ',
      ザ: 'ｻﾞ',
      ジ: 'ｼﾞ',
      ズ: 'ｽﾞ',
      ゼ: 'ｾﾞ',
      ゾ: 'ｿﾞ',
      ダ: 'ﾀﾞ',
      ヂ: 'ﾁﾞ',
      ッ: 'ｯ',
      ヅ: 'ﾂﾞ',
      デ: 'ﾃﾞ',
      ド: 'ﾄﾞ',
      バ: 'ﾊﾞ',
      パ: 'ﾊﾟ',
      ビ: 'ﾋﾞ',
      ピ: 'ﾋﾟ',
      ブ: 'ﾌﾞ',
      プ: 'ﾌﾟ',
      ベ: 'ﾍﾞ',
      ペ: 'ﾍﾟ',
      ボ: 'ﾎﾞ',
      ポ: 'ﾎﾟ',
      ヴ: 'ｳﾞ',
    };
    if (typeof FulltoHalf[character] === 'undefined') {
      return character;
    } else {
      return FulltoHalf[character];
    }
  };
  const convertToSpecialHalfWidth = (string) => {
    let characters = string.split('');
    let halfWidthString = '';
    characters.forEach((character) => {
      halfWidthString += mapSpecialCharacter(character);
    });
    return halfWidthString;
  };
  return {
    fullWidth: set.map(toFullWidth)[0],
    halfWidth: convertToSpecialHalfWidth(set.map(toFullWidth).map(toHalfWidth)[0]),
  };
};
