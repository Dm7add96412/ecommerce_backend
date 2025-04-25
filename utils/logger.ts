const info = (...params: string[]) => {
    console.log(params)
}

const error = (...params: string[]) => {
    console.error(params)
}

module.exports = {
    info, error
}