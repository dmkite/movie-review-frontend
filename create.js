const server = require('./server-calls')
const {newAlert} = require('./utils')

///////////////////////////////////////////////////////////////////////////////
//      Star Range JS
///////////////////////////////////////////////////////////////////////////////
function changeStars(){
    const rating = Number(document.querySelector('#movieRating').value)
    const stars = document.querySelectorAll('.ratingBox .material-icons')
    for (let i = 0; i < 5; i++) {
        if (i <= Math.floor(rating) - 1) stars[i].textContent = 'star'
        else stars[i].textContent = 'star_border'
    }
    if (rating % 1 !== 0) stars[Math.ceil(rating) - 1].textContent = 'star_half'
}

function changeStarColor(color){
    let stars = document.querySelectorAll('.ratingBox i')
    stars.forEach(star => star.style.color = color)
    document.querySelector('.ratingBox label').style.color = color    
}

function displayPoster(e){
    let posterURL = e.target.value
    document.querySelector('.posterHolder').style.backgroundImage = `url('${posterURL}')`
}

///////////////////////////////////////////////////////////////////////////////
//      Create Movie
///////////////////////////////////////////////////////////////////////////////

function createMovie(e){
    e.preventDefault()
    let postBody = createPostBody()
    server.createMovie(postBody)
        .then(data => {
            newAlert(data.data.data[0].title, 'creation', 'created')
            clearForm()
        })

}

function createPostBody(){
    let inputs = Array.from(document.querySelectorAll('.newMovieForm input'))

    let postBody = inputs.reduce( (acc, input) => {
        acc[input.name] = input.value
        return acc
    }, {})

    return postBody
}


function clearForm(){
    inputs = document.querySelectorAll('.newMovieForm inputs')
    inputs.forEach( input => input.value = '')
    document.querySelector('.posterHolder').style.backgroundImage = ''
}

module.exports = {changeStars, displayPoster, createMovie, createPostBody, changeStars, changeStarColor, displayPoster}