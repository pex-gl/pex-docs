function toArray (list) {
  return Array.prototype.slice.call(list)
}

// remove code examples

var headers = toArray(document.querySelectorAll('.item'))
headers.forEach((e) => {
  if (e.nodeName === 'H3') {
    e.classList.add('dn')
  }
})
var parent = null
var items = headers.map((e) => {
  if (e.nodeName === 'H2') {
    parent = e
  }
  return {
    name: e.innerText.toLowerCase(),
    elem: e,
    parent: parent
  }
})

console.log(items)

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
      item.elem.classList.remove('mt1')
      item.elem.classList.remove('mt2')
      item.elem.classList.add(search ? 'mt2' : 'mt1')
    }

    if (visible) {
      item.elem.classList.remove('dn')
      item.parent.classList.remove('dn')
    } else {
      item.elem.classList.add('dn')
    }
  })
})

function expand (e) {
  var wasExpanded = e.firstChild.classList.contains('expanded')
  console.log('expand', e.firstChild, wasExpanded)
  toArray(document.querySelectorAll('.expanded')).forEach((e) => e.classList.remove('expanded'))

  if (wasExpanded) {
    return
  }
  if (e.firstChild.nodeName === 'H2') {
    e.firstChild.classList.add('expanded')
    var sibling = e.nextElementSibling
    while (sibling && sibling.firstChild.nodeName === 'H3') {
      sibling.firstChild.classList.add('expanded')
      sibling = sibling.nextElementSibling
    }
  }
}
