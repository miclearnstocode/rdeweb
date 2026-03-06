import {Path, Request} from "../../../../lib/lib.js";

export class ScoreRank
{
    constructor(document) {
        this.document = document;
    }
    getEvaluator(){
        const req= new Request('/ranking')
        req.Post([
            {
                name:'getEval',
                value:'1'
            },
            {
                name:'eventId',
                value:Path(4)+''
            },
            {
                name:'categoryId',
                value:Path(6)+''
            }
        ])
        req.Json()
        return req.Send()
    }
    SampleCommand(){
        this.getEvaluator().then(data=>{
            console.log(data)
        })
    }
    groupDocs(get){
        this.getEvaluator().then(data=>{
            get(data)
        })
    }
    getDocs(get){
        this.getEvaluator().then(data=>{
            data.forEach(val=>{
                const req= new Request('/ranking')
                req.Post([
                    {
                        name:'getDocPerEv',
                        value:'1',
                    },
                    {
                        name:'eventId',
                        value:val.eventid+''
                    },
                    {
                        name:'categoryId',
                        value:val.categoryId+'',
                    },
                ])
                req.Json()
                req.Send().then(data=>{
                    get(data)
                })
            })
        })
    }
}