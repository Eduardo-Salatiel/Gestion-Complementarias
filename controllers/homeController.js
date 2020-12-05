exports.homeView = (req,res) => {
    res.render('index',{
        nombrePagina: "Home",
        usuario: req.user
    })
}