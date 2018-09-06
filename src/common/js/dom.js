export function addClass(el, className) {
  if (hasClass(el, className)) return
  let newClass = el.className.split(' ')
  newClass.push(className)
  el.className = newClass.join(' ')
}

export function hasClass(el, className) {
  const reg = new RegExp('(^|\\s)' + className + '(\\s|$)')
  return reg.test(el.className)
}

export function getData(el, name, val) {
  const prefix = 'data-'
  name = prefix + name
  if (val) {
    return el.setAttribute(name, val)
  } else {
    return el.getAttribute(name)
  }
}

let elementStyle = document.createElement('div').style

// IIFE
let vendor = (() => {
  let transformNames = {
    webkit: 'webkitTransform',
    Moz: 'MozTransform',
    O: 'OTransform',
    ms: 'msTransform',
    standard: 'transform'
  }

  for (let key in transformNames) {
    if (elementStyle[transformNames[key]] !== undefined) {
      return key
    }
  }

  return false
})()

export function prefixStyle(style) {
  if (vendor === false) {
    return false
  }

  if (vendor === 'standard') {
    return style
  }
  // 拼接 eg：webkitTransform
  return vendor + style.charAt(0).toUpperCase() + style.substr(1)
}

export function getAnimationEnd() {
  const animEndEventNames = {
    WebkitAnimation: 'webkitAnimationEnd',
    animation: 'animationend'
  }
  for (const key in animEndEventNames) {
    if (elementStyle[key] !== undefined) {
      return animEndEventNames[key]
    }
  }
}

// 获取元素style
export function getComputedStyle(el, property, boolean = false) {
  return document.defaultView.getComputedStyle
  ? document.defaultView.getComputedStyle(el, boolean)[property]
  : el.currentStyle[property]
}