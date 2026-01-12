import {$} from "../../../lib/lib.js";


export const PrintWindow=(Pages)=>{
    let WinPrint = window.open('', '', 'toolbar=0,scrollbars=0,status=0');

    WinPrint.document.write('<head><link rel="stylesheet" media="print" href="/client/component/otherComponent/style/review.css"></head>')

    WinPrint.document.write($({
        tag:'div',
        style:{
            width:'100%',

        },
        child:Pages
    }).innerHTML);

    WinPrint.document.close();

    WinPrint.focus();

    WinPrint.print();

    WinPrint.close();
}