





export const SummaryDocs=(allDocs = [], uniqueDocs = [])=>{



    const Rank=allDocs.map(val=>{





       return  val.map((v,rank)=>{





            return {


                rank:v.rank,


                title:v.data.file.title,


                totalScore:v.data.TotalScore,


                author:v.data.author,


                campus:v.data.campus


            }


        })


    })


    const RankSet=uniqueDocs.map((val,index)=>{


        let rk=0


        let count=0


        Rank.forEach((v,index)=>{





            v.forEach(aa=>{


                if(val.title===aa.title){


                    rk+=aa.rank
                    count++

                }


            })




        })




        return{


            docId:val.docId,


            title:val.title,


            ranking:rk/count,


            author:val.author,


            campus:val.campus


        }


    })


    const SortedRankSet=RankSet.sort((a,b)=>{


        if ( a.ranking < b.ranking ){


            return -1;


        }


        if ( a.ranking > b.ranking ){


            return 1;


        }


        return 0;


    })









    let un=uniqueDocs.map((val,index)=>{


        let totalScore=0


        let count=0


        let FilnalRank


        for(let x=0;x<SortedRankSet.length;x++){


            if(val.docId===SortedRankSet[x].docId){


                FilnalRank=SortedRankSet[x].ranking


                break;


            }


        }






        allDocs.forEach((v,rank)=>{





            v.forEach(v=>{


                if(v.data.file.id===val.docId){


                    if(v.data.criteria.length>0){


                        count++


                    }


                    totalScore+=v.data.TotalScore





                }


            })


        })





        return {


            title:val,


            totalScore:totalScore,


            averageScore:totalScore/count,


            rankAverage:FilnalRank


        }


    })


    return un


}


const Sorter=(allDocs)=>{


    


}