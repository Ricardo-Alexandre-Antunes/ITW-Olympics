
self.favourites = {
    athletes: [],
    games: [],
    }; 

    self.loadFavourites = function(){
        if (localStorage.getItem('favourites') != null){
            self.favourites = JSON.parse(localStorage.favourites)
        } else {
            localStorage.setItem('favourites', JSON.stringify(self.favourites));
        };

        Favoritos = self.favourites.athletes;

        Favoritos.forEach(id => {
            $("#favourite_"+id).css('color','red');
        });
    }

    self.updateFavourites = function(id){
        let index = Favoritos.indexOf(String(id))
        if(index !== -1){
            $("#favourite_"+id).css('color', '#333')
            Favoritos.splice(index, 1)
        } else if(index == -1){
            $("#favourite_"+id).css('color', 'red')
            Favoritos.push(String(id))
        };
        console.log(Favoritos)
        console.log(self.favourites);
        window.localStorage.setItem('favourites', JSON.stringify(self.favourites))
    }


Dentro do AJAX.done:
self.loadFavourites();

Data-bind dos favoritos:
data-bind: "click:function(data,event) {$parent.updateFavourites(Id)}"