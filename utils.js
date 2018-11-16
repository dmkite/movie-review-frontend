///////////////////////////////////////////////////////////////////////////////
//      Listeners and Alerts
///////////////////////////////////////////////////////////////////////////////
function addListener(iterable, trigger, fn){
    let iterables = document.querySelectorAll(iterable)
    iterables.forEach(iter => {
        return iter.addEventListener(trigger, function(e){fn(e)})
    })
    
}

function addMultipleListeners(element, triggerArray, fn){
    triggerArray.forEach( trigger => {
        document.querySelector(element).addEventListener(trigger, fn)
    })
}

function newAlert(title, type, verb) {
    let newAlert = `
    <p class="${type}Alert">${title} has been ${verb}</p>`
    document.querySelector('body').innerHTML += newAlert
    setTimeout(
        function () {
            document.querySelector(`.${type}Alert`).classList.add('fadeOut')
            setTimeout(
                function () { document.querySelector(`.${type}Alert`).remove() },
                1000
            )
        }, 3000)
}

///////////////////////////////////////////////////////////////////////////////
//      Poster data
///////////////////////////////////////////////////////////////////////////////
const posters =
    ['https://image.tmdb.org/t/p/w185_and_h278_bestv2/lHu1wtNaczFPGFDTrjCSzeLPTKN.jpg',
        'https://image.tmdb.org/t/p/w185_and_h278_bestv2/x1txcDXkcM65gl7w20PwYSxAYah.jpg',
        'https://image.tmdb.org/t/p/w185_and_h278_bestv2/AkJQpZp9WoNdj7pLYSj1L0RcMMN.jpg',
        'https://image.tmdb.org/t/p/w185_and_h278_bestv2/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg',
        'https://image.tmdb.org/t/p/w185_and_h278_bestv2/eyWICPcxOuTcDDDbTMOZawoOn8d.jpg',
        'https://image.tmdb.org/t/p/w185_and_h278_bestv2/rWQVj6Z8kPdsbt7XPjVBCltxq90.jpg',
        'https://image.tmdb.org/t/p/w185_and_h278_bestv2/wrFpXMNBRj2PBiN4Z5kix51XaIZ.jpg',
        'https://image.tmdb.org/t/p/w185_and_h278_bestv2/rv1AWImgx386ULjcf62VYaW8zSt.jpg',
        'https://image.tmdb.org/t/p/w185_and_h278_bestv2/rW0A73hjzPWVwADlCTLnjLhAFLX.jpg',
        'https://image.tmdb.org/t/p/w185_and_h278_bestv2/2L8ehd95eSW9x7KINYtZmRkAlrZ.jpg',
        'https://image.tmdb.org/t/p/w185_and_h278_bestv2/afdZAIcAQscziqVtsEoh2PwsYTW.jpg',
        'https://image.tmdb.org/t/p/w185_and_h278_bestv2/pk9R56ZFlofbBzfwBnHlDyg5DMs.jpg',
        'https://image.tmdb.org/t/p/w185_and_h278_bestv2/5LYSsOPzuP13201qSzMjNxi8FxN.jpg',
        'https://image.tmdb.org/t/p/w185_and_h278_bestv2/gnTqi4nhIi1eesT5uYMmhEPGNih.jpg',
        'https://image.tmdb.org/t/p/w185_and_h278_bestv2/uxzzxijgPIY7slzFvMotPv8wjKA.jpg',
        'https://image.tmdb.org/t/p/w185_and_h278_bestv2/l76Rgp32z2UxjULApxGXAPpYdAP.jpg',
        'https://image.tmdb.org/t/p/w185_and_h278_bestv2/bXs0zkv2iGVViZEy78teg2ycDBm.jpg',
        'https://image.tmdb.org/t/p/w185_and_h278_bestv2/to0spRl1CMDvyUbOnbb4fTk3VAd.jpg',
        'https://image.tmdb.org/t/p/w185_and_h278_bestv2/rT49ousKUWN3dV7UlhaC9onTNdl.jpg',
        'https://image.tmdb.org/t/p/w185_and_h278_bestv2/9qYKrgzHbYtKej9Gvd7NxJvGiC2.jpg',
        'https://image.tmdb.org/t/p/w185_and_h278_bestv2/4Y1AlIP3SIOTje3ky9p68XhQmHU.jpg',
        'https://image.tmdb.org/t/p/w185_and_h278_bestv2/h70wRv6iWxiqED4orqfxcEl74Rc.jpg',
        'https://image.tmdb.org/t/p/w185_and_h278_bestv2/e7ACYk5KSDRKYBHcwQVcojxJknN.jpg',
        'https://image.tmdb.org/t/p/w185_and_h278_bestv2/6jBuc4l7ixM8S5PCcSYvGKDmIX9.jpg',
        'https://image.tmdb.org/t/p/w185_and_h278_bestv2/huSncs4RyvQDBmHjBBYHSBYJbSJ.jpg',
        'https://image.tmdb.org/t/p/w185_and_h278_bestv2/ahF5c6vyP8HWMqIwlhecbRALkjq.jpg',
        'https://image.tmdb.org/t/p/w185_and_h278_bestv2/e3P2Ed0sbmQ6RsoS4dcT3aeEPR.jpg',
        'https://image.tmdb.org/t/p/w185_and_h278_bestv2/lfJSDT8KYk5k34AEw1eTa4ahscL.jpg',
        'https://image.tmdb.org/t/p/w185_and_h278_bestv2/7rUnZrcSyfwfloeI5aoccztSLSg.jpg',
        'https://image.tmdb.org/t/p/w185_and_h278_bestv2/AfybH6GbGFw1F9bcETe2yu25mIE.jpg',
        'https://image.tmdb.org/t/p/w185_and_h278_bestv2/94RaS52zmsqaiAe1TG20pdbJCZr.jpg',
        'https://image.tmdb.org/t/p/w185_and_h278_bestv2/hKHZhUbIyUAjcSrqJThFGYIR6kI.jpg',
        'https://image.tmdb.org/t/p/w185_and_h278_bestv2/iOMkwo6X4vyNtpanM84TX4m8poT.jpg',
        'https://image.tmdb.org/t/p/w185_and_h278_bestv2/5IPrT71JTNxPTClpzzytRhkGTkk.jpg',
        'https://image.tmdb.org/t/p/w185_and_h278_bestv2/v5HlmJK9bdeHxN2QhaFP1ivjX3U.jpg',
        'https://image.tmdb.org/t/p/w185_and_h278_bestv2/SDbTy4IzTFnxvGycW7cePjEDDP.jpg',
        'https://image.tmdb.org/t/p/w185_and_h278_bestv2/anIVgBJyG3fKnCuBshCfiJBsR8z.jpg',
        'https://image.tmdb.org/t/p/w185_and_h278_bestv2/jjPJ4s3DWZZvI4vw8Xfi4Vqa1Q8.jpg',
        'https://image.tmdb.org/t/p/w185_and_h278_bestv2/8fDtXi6gVw8WUMWGT9XFz7YwkuE.jpg',
        'https://image.tmdb.org/t/p/w185_and_h278_bestv2/p2HbBHBx2yog6cWPKJDwMlYZauf.jpg',
        'https://image.tmdb.org/t/p/w185_and_h278_bestv2/4nKoB6wMVXfsYgRZK5lHZ5VMQ6J.jpg',
        'https://image.tmdb.org/t/p/w185_and_h278_bestv2/pU1ULUq8D3iRxl1fdX2lZIzdHuI.jpg',
        'https://image.tmdb.org/t/p/w185_and_h278_bestv2/55W6mUVv4CXMMQHHhV2zXtLSpXQ.jpg',
        'https://image.tmdb.org/t/p/w185_and_h278_bestv2/dOtenLPIbTUZ8dcYKEA7T7qRURz.jpg',
        'https://image.tmdb.org/t/p/w185_and_h278_bestv2/gjAFM4xhA5vyLxxKMz38ujlUfDL.jpg',
        'https://image.tmdb.org/t/p/w185_and_h278_bestv2/qcnOKCPleLOTWPPgYI0YT1MOQwR.jpg',
        'https://image.tmdb.org/t/p/w185_and_h278_bestv2/3gIO6mCd4Q4PF1tuwcyI3sjFrtI.jpg',
        'https://image.tmdb.org/t/p/w185_and_h278_bestv2/nAU74GmpUk7t5iklEp3bufwDq4n.jpg',
        'https://image.tmdb.org/t/p/w185_and_h278_bestv2/wJhvud2zC8AzrKOH7nEGK3ObaIV.jpg',
        'https://image.tmdb.org/t/p/w185_and_h278_bestv2/tj4lbeWQBvPwGjadEAAjJdQolko.jpg',
        'https://image.tmdb.org/t/p/w185_and_h278_bestv2/zfDN0YX1BNRsnCnp1mWOaiGeN9y.jpg',
        'https://image.tmdb.org/t/p/w185_and_h278_bestv2/gjAFM4xhA5vyLxxKMz38ujlUfDL.jpg',
        'https://image.tmdb.org/t/p/w185_and_h278_bestv2/qcnOKCPleLOTWPPgYI0YT1MOQwR.jpg',
        'https://image.tmdb.org/t/p/w185_and_h278_bestv2/3gIO6mCd4Q4PF1tuwcyI3sjFrtI.jpg',
        'https://image.tmdb.org/t/p/w185_and_h278_bestv2/nAU74GmpUk7t5iklEp3bufwDq4n.jpg',
        'https://image.tmdb.org/t/p/w185_and_h278_bestv2/wJhvud2zC8AzrKOH7nEGK3ObaIV.jpg',
        'https://image.tmdb.org/t/p/w185_and_h278_bestv2/tj4lbeWQBvPwGjadEAAjJdQolko.jpg',
        'https://image.tmdb.org/t/p/w185_and_h278_bestv2/zfDN0YX1BNRsnCnp1mWOaiGeN9y.jpg'

    ]

const posterBacks = [
    'https://image.tmdb.org/t/p/w185_and_h278_bestv2/x2I7eZNMDZKPUFM6QuKkmHKZDQm.jpg',
    'https://image.tmdb.org/t/p/w185_and_h278_bestv2/sFC1ElvoKGdHJIWRpNB3xWJ9lJA.jpg',
    'https://image.tmdb.org/t/p/w185_and_h278_bestv2/MvYpKlpFukTivnlBhizGbkAe3v.jpg',
    'https://image.tmdb.org/t/p/w185_and_h278_bestv2/w4ibr8R702DCjwYniry1D1XwQXj.jpg',
    'https://image.tmdb.org/t/p/w185_and_h278_bestv2/c9XxwwhPHdaImA2f1WEfEsbhaFB.jpg',
    'https://image.tmdb.org/t/p/w185_and_h278_bestv2/litjsBoiydO6JlO70uOX4N3WnNL.jpg',
    'https://image.tmdb.org/t/p/w185_and_h278_bestv2/3IGbjc5ZC5yxim5W0sFING2kdcz.jpg',
    'https://image.tmdb.org/t/p/w185_and_h278_bestv2/v2KnosS7G2M9pMymvX0XXTcf04c.jpg',
    'https://image.tmdb.org/t/p/w185_and_h278_bestv2/i91mfvFcPPlaegcbOyjGgiWfZzh.jpg',
    'https://image.tmdb.org/t/p/w185_and_h278_bestv2/msqWSQkU403cQKjQHnWLnugv7EY.jpg',
    'https://image.tmdb.org/t/p/w185_and_h278_bestv2/pU1ULUq8D3iRxl1fdX2lZIzdHuI.jpg',
    'https://image.tmdb.org/t/p/w185_and_h278_bestv2/55W6mUVv4CXMMQHHhV2zXtLSpXQ.jpg',
    'https://image.tmdb.org/t/p/w185_and_h278_bestv2/dOtenLPIbTUZ8dcYKEA7T7qRURz.jpg',
    'https://image.tmdb.org/t/p/w185_and_h278_bestv2/gjAFM4xhA5vyLxxKMz38ujlUfDL.jpg',
    'https://image.tmdb.org/t/p/w185_and_h278_bestv2/qcnOKCPleLOTWPPgYI0YT1MOQwR.jpg',
    'https://image.tmdb.org/t/p/w185_and_h278_bestv2/3gIO6mCd4Q4PF1tuwcyI3sjFrtI.jpg',
    'https://image.tmdb.org/t/p/w185_and_h278_bestv2/nAU74GmpUk7t5iklEp3bufwDq4n.jpg',
    'https://image.tmdb.org/t/p/w185_and_h278_bestv2/wJhvud2zC8AzrKOH7nEGK3ObaIV.jpg',
    'https://image.tmdb.org/t/p/w185_and_h278_bestv2/tj4lbeWQBvPwGjadEAAjJdQolko.jpg',
    'https://image.tmdb.org/t/p/w185_and_h278_bestv2/zfDN0YX1BNRsnCnp1mWOaiGeN9y.jpg'
]

///////////////////////////////////////////////////////////////////////////////
//     Media Queries
///////////////////////////////////////////////////////////////////////////////
const windowSize = window.matchMedia("(max-width: 450px)")

function mediaQuery(windowSize){
    const editBtns = document.querySelectorAll('.edit')
    const deleteBtns = document.querySelectorAll('.delete')

    if(windowSize.matches){
        editBtns.forEach(btn => btn.innerHTML = '<i class="material-icons">edit</i>')
        deleteBtns.forEach(btn => btn.innerHTML = '<i class="material-icons">delete</i>')
    }
    else{
        editBtns.forEach(btn => btn.textCtonet = 'edit')
        deleteBtns.forEach(btn => btn.textContent = 'delete') 
    }
}


module.exports = {addListener, newAlert, addMultipleListeners, posters, posterBacks, mediaQuery, windowSize}