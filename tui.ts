
class tui {
    constructor() {

    }

}


class TUITable extends HTMLTableElement {

  constructor() {
    // Always call super first in constructor
    super();
  }

  connectedCallback() {
    console.log("Custom element added to page.");
    var ele = document.getElementById("table-content");
    if (ele) {
      var tmpl:HTMLTemplateElement = ele as HTMLTemplateElement;
      this.appendChild(tmpl.content);
    }
  }

  disconnectedCallback() {
    console.log("Custom element removed from page.");
  }

  adoptedCallback() {
    console.log("Custom element moved to new page.");
  }

  attributeChangedCallback(name:string, oldValue:any, newValue:any) {
    console.log(`Attribute ${name} has changed.`);
  }
}

customElements.define("tui-table", TUITable, { extends: "table" })
