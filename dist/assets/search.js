function toArray (list) {
  return Array.prototype.slice.call(list)
}

// remove code examples

var headers = toArray(document.querySelectorAll('.item'))
headers.forEach((e) => {
  if (e.nodeName === 'H3') {
    e.parentElement.classList.add('dn')
  }
})
var section = null
var module = null
var items = headers.map((e) => {
  if (e.nodeName === 'H1') {
    section = e
    module = e
  }
  if (e.nodeName === 'H2') {
    module = e
  }
  return {
    name: e.innerText.toLowerCase(),
    elem: e,
    section: section,
    module: module
  }
})

console.log('items', items)

document.querySelector('#search').addEventListener('keyup', function (e) {
  toArray(document.querySelectorAll('.expanded')).forEach((e) => e.classList.remove('expanded'))
  var search = e.target.value.trim().toLowerCase()
  items.forEach(function (item) {
    var visible = true
    if (!search) {
      // show only module names
      visible = (item.elem.nodeName === 'H2')
    } else {
      visible = (item.name.indexOf(search) !== -1)
    }

    if (item.elem.nodeName === 'H2') {
      // item.elem.classList.remove('mt1')
      // item.elem.classList.remove('mt2')
      // item.elem.classList.add(search ? 'mt2' : 'mt1')
    }

    console.log(item.name, visible)

    if (visible) {
      item.elem.parentElement.classList.remove('dn')
      item.module.parentElement.classList.remove('dn')
      item.module.parentElement.classList.add('flex')
      item.module.parentElement.classList.add('flex-row')
      item.section.parentElement.classList.remove('dn')
    } else {
      item.elem.parentElement.classList.add('dn')
      item.elem.parentElement.classList.remove('flex')
      item.elem.parentElement.classList.remove('flex-row')
    }
  })
})


function expand (e) {
  var wasExpanded = e.nextElementSibling && e.nextElementSibling.classList.contains('expanded')
  toArray(document.querySelectorAll('.expanded')).forEach((e) => e.classList.remove('expanded'))

  if (wasExpanded) {
    return
  }
  if (e.firstChild.nodeName === 'H2') {
    // e.classList.add('expanded')
    var sibling = e.nextElementSibling
    while (sibling && sibling.firstChild.nodeName === 'H3') {
      sibling.classList.add('expanded')
      sibling = sibling.nextElementSibling
    }
  }
}
