export const RankPerCriteria = (datan, evaluator) => {
    let Sorted = []
    let rank=0;
    let data=[]
    datan.map((d)=>{
        if(d.TotalScore*1!==0){
            data.push(d)
        }
    })
    for (let x = 0; x < data.length; x++) {
        let tot=data[x].TotalScore*1
        if(tot!==0)
        {
            if (data[x + 1] !== undefined) {
                if (data[x].TotalScore === data[x + 1].TotalScore) {
                    const tie = []
                    let rankIndex = 0
                    let count = 0
                    let lastIndex = rank
                    let start = rank
                    let val = data[x].TotalScore
                    for (start; start < data.length; start++) {
                        if (val === data[start].TotalScore) {
                            tie.push(data[start])
                            rankIndex += start+1
                            count++
                            lastIndex = start
                        }
                    }
                    let sortedTie = tie.map(aa => {
                        return {
                            data: aa,
                            rank: rankIndex / count,
                            evalName: evaluator
                        }
                    })
                    rank++;
                    x = lastIndex
                    Sorted.concat(sortedTie)
                    sortedTie.forEach(vv => {
                        Sorted.push(vv)
                    })
                } else {
                    Sorted.push({
                        data: data[x],
                        rank: x + 1,
                        evalName: evaluator
                    })
                    rank++;
                }
            } else {
                Sorted.push({
                    data: data[x],
                    rank: rank + 1,
                    evalName: evaluator
                })
                rank++;
            }
        }
    }
    return Sorted
}


export const FinalRanking = (datan) => {

    let data=[]
    datan.map((d)=>{
        if(d.averageScore){
            data.push(d)
        }
    })
    let Sorted = []
    let rank=0;
    for (let x = 0; x < data.length; x++) {
        let rankAve=data[x].rankAverage*1

        if(rankAve!==0)
        {
            if (data[x + 1] !== undefined) {


                if (data[x].rankAverage === data[x + 1].rankAverage) {


                    const tie = []


                    let rankIndex = 0


                    let count = 0


                    let lastIndex = 0


                    let start = x


                    let val = data[x].rankAverage


                    for (start; start < data.length; start++) {

                        if (val === data[start].rankAverage) {

                            tie.push(data[start])

                            rankIndex += start+1

                            count++
                            rank++

                            lastIndex = start


                        }


                    }
                    rank++;

                    let sortedTie = tie.map(aa => {


                        return {


                            data: aa,


                            rank: rankIndex / count


                        }


                    })


                    x = lastIndex


                    Sorted.concat(sortedTie)


                    sortedTie.forEach(vv => {

                        Sorted.push(vv)

                    })


                } else {


                    Sorted.push({


                        data: data[x],


                        rank: x + 1


                    })
                    rank++;

                }


            } else {


                Sorted.push({


                    data: data[x],


                    rank: x+1


                })
                rank++;


            }
        }


    }



    return Sorted


}


export const ScoreRankAVe = (datan) => {


    let Sorted = []

    let rank=0;

    let data=[]
    datan.map((d)=>{
        if(d.averageScore){
            data.push(d)
        }
    })

    for (let x = 0; x < data.length; x++) {

        if (data[x + 1] !== undefined) {


            if (data[x].averageScore === data[x + 1].averageScore) {


                const tie = []


                let rankIndex = 0



                let count = 0


                let lastIndex = 0


                let start =x


                let val = data[x].averageScore


                for (start; start < data.length; start++) {


                    if (val === data[start].averageScore) {


                        tie.push(data[start])


                        rankIndex += start+1

                        count++

                        rank++;

                        lastIndex = start

                    }


                }


                let sortedTie = tie.map(aa => {


                    return {


                        data: aa,


                        rank: rankIndex / count


                    }


                })


                x = lastIndex


                Sorted.concat(sortedTie)


                sortedTie.forEach(vv => {


                    Sorted.push(vv)


                })


            } else {


                Sorted.push({


                    data: data[x],


                    rank: x+1


                })

                rank++;
            }


        }

    }


    return Sorted


}