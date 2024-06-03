import * as JSX from 'htlx';
import type {Renderable} from './table.ts';

function Box(attrs:JSX.Attrs, children:JSX.Children) {

}
export function IndexPage(...children:Renderable[]) {
    console.log(children);

    return (<body>{children}</body>);
}
