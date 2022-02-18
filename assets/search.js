let section = null;
let packageName = null;
const items = Array.from(document.querySelectorAll(".item")).map((e) => {
  if (e.nodeName === "H1") {
    section = e;
    packageName = e;
  }
  if (e.nodeName === "H2") packageName = e;

  if (e.nodeName === "H3") e.parentElement.classList.add("dn");

  return {
    name: e.innerText.toLowerCase(),
    elem: e,
    section,
    packageName,
  };
});

function onSearch({ target }) {
  Array.from(document.querySelectorAll(".expanded")).forEach(({ classList }) =>
    classList.remove("expanded")
  );
  const search = target.value.trim().toLowerCase();
  items.forEach((item) => {
    let visible = true;
    if (!search) {
      visible = item.elem.nodeName === "H2";
    } else {
      visible = item.name.includes(search);
    }

    if (item.elem.nodeName === "H2") {
      if (search) {
        item.elem.parentElement.classList.add("mt2");
      } else {
        item.elem.parentElement.classList.remove("mt2");
      }
    }

    if (visible) {
      item.elem.parentElement.classList.remove("dn");
      item.packageName.parentElement.classList.remove("dn");
      item.packageName.parentElement.classList.add("flex");
      item.packageName.parentElement.classList.add("flex-row");
      item.section.parentElement.classList.remove("dn");
    } else {
      item.elem.parentElement.classList.add("dn");
      item.elem.parentElement.classList.remove("flex");
      item.elem.parentElement.classList.remove("flex-row");
    }
  });
}

document.querySelector("#search").addEventListener("input", onSearch);

function expand({ nextElementSibling, parentElement, firstChild }) {
  const wasExpanded =
    nextElementSibling && nextElementSibling.classList.contains("expanded");
  Array.from(document.querySelectorAll(".expanded")).forEach(({ classList }) =>
    classList.remove("expanded")
  );

  if (wasExpanded) return;

  parentElement.classList.add("expanded");
  if (firstChild.nodeName === "H2") {
    let sibling = nextElementSibling;
    while (sibling && sibling.firstChild.nodeName === "H3") {
      sibling.classList.add("expanded");
      sibling = sibling.nextElementSibling;
    }
  }
}

document
  .querySelectorAll(".item-title")
  .forEach((item) => item.addEventListener("click", () => expand(item)));
