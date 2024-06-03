
export type Children = Node[]
export type Attrs = Record<string,any>;
interface ComponentNode extends Node {
    render():string;
}
export interface Component {

    (properties?: Attrs, children?: Children): ComponentNode;
}
export type Element = ((attrs:Attrs, children:Children) => string)


export function jsx(element:Component|ComponentNode, attrs?:Attrs, ...children:Children) {
    if (typeof element === 'function') {
        return element(attrs ?? {}, children);
    }
    if ('render' in element) {
        element.
        return element.render();
    }

    const realChildren = [];
    for (const c of children) {
        if (c) {
            realChildren.push(c);
        }
    }
    children = realChildren;
    const attrarray = [];
    for (const k in attrs) {
        if (k == 'children') {
            for (const child of attrs[k]) {
                children.push(child.Render ? child.Render() : String(child));
            }
            continue;
        }
        attrarray.push(`${k}="${attrs[k]}"`);
    }
    let attrString = attrarray.join(' ');
    if (attrString.length) {
        attrString = " "+attrString;
    }
    return `<${element}${attrString}>${children.join('')}</${element}>`
}
