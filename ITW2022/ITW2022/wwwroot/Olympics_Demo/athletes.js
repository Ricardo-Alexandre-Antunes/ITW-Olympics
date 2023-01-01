// ViewModel KnockOut
var vm = function () {
    console.log('ViewModel initiated...');
    //---Vari�veis locais
    var self = this;
    self.baseUri = ko.observable('http://192.168.160.58/Olympics/api/athletes');
    //self.baseUri = ko.observable('http://localhost:62595/api/drivers');
    self.displayName = 'Olympic Games editions List';
    self.error = ko.observable('');
    self.passingMessage = ko.observable('');
    self.records = ko.observableArray([]);
    self.currentPage = ko.observable(1);
    self.pagesize = ko.observable(20);
    self.totalRecords = ko.observable(50);
    self.hasPrevious = ko.observable(false);
    self.hasNext = ko.observable(false);

    self.previousPage = ko.computed(function () {
        return self.currentPage() * 1 - 1;
    }, self);
    self.nextPage = ko.computed(function () {
        return self.currentPage() * 1 + 1;
    }, self);
    self.fromRecord = ko.computed(function () {
        return self.previousPage() * self.pagesize() + 1;
    }, self);
    self.toRecord = ko.computed(function () {
        return Math.min(self.currentPage() * self.pagesize(), self.totalRecords());
    }, self);
    self.totalPages = ko.observable(0);
    self.pageArray = function () {
        var list = [];
        var size = Math.min(self.totalPages(), 9);
        var step;
        if (size < 9 || self.currentPage() === 1)
            step = 0;
        else if (self.currentPage() >= self.totalPages() - 4)
            step = self.totalPages() - 9;
        else
            step = Math.max(self.currentPage() - 5, 0);

        for (var i = 1; i <= size; i++)
            list.push(i + step);
        return list;
    };

    //--- Page Events
    self.activate = function (id, sortby = 'NameUp') {
        console.log('CALL: getAthletes...');
        var composedUri = self.baseUri() + "?page=" + id + "&pageSize=" + self.pagesize() + "&sortby=" + sortby;
        ajaxHelper(composedUri, 'GET').done(function (data) {
            console.log(data);
            hideLoading();
            self.records(data.Records);
            self.currentPage(data.CurrentPage);
            self.hasNext(data.HasNext);
            self.hasPrevious(data.HasPrevious);
            self.pagesize(data.PageSize)
            self.totalPages(data.TotalPages);
            self.totalRecords(data.TotalRecords);
            self.SetFavourites();
        });
    };
    self.activate2 = function (search, page) {
        console.log('CALL: searchAthletes...');
        var composedUri = "http://192.168.160.58/Olympics/api/Athletes/SearchByName?q=" + search;
        ajaxHelper(composedUri, 'GET').done(function (data) {
            console.log("search Athletes", data);
            hideLoading();
            self.records(data.slice(0 + 21 * (page - 1), 21 * page));
            console.log(self.records())
            self.totalRecords(data.length);
            self.currentPage(page);
            if (page == 1) {
                self.hasPrevious(false)
            } else {
                self.hasPrevious(true)
            }
            if (self.records() - 21 > 0) {
                self.hasNext(true)
            } else {
                self.hasNext(false)
            }
            if (Math.floor(self.totalRecords() / 21) == 0) {
                self.totalPages(1);
            } else {
                self.totalPages(Math.ceil(self.totalRecords() / 21));
            }
        });

    };

    //--- Internal functions
    function ajaxHelper(uri, method, data) {
        self.error(''); // Clear error message
        return $.ajax({
            type: method,
            url: uri,
            dataType: 'json',
            contentType: 'application/json',
            data: data ? JSON.stringify(data) : null,
            error: function (jqXHR, textStatus, errorThrown) {
                console.log("AJAX Call[" + uri + "] Fail...");
                hideLoading();
                self.error(errorThrown);
            }
        });
    }

    function sleep(milliseconds) {
        const start = Date.now();
        while (Date.now() - start < milliseconds);
    }

    function showLoading() {
        $("#myModal").modal('show', {
            backdrop: 'static',
            keyboard: false
        });
    }
    function hideLoading() {
        $('#myModal').on('shown.bs.modal', function (e) {
            $("#myModal").modal('hide');
        })
    }

    function getUrlParameter(sParam) {
        var sPageURL = window.location.search.substring(1),
            sURLVariables = sPageURL.split('&'),
            sParameterName,
            i;
        console.log("sPageURL=", sPageURL);
        for (i = 0; i < sURLVariables.length; i++) {
            sParameterName = sURLVariables[i].split('=');

            if (sParameterName[0] === sParam) {
                return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
            }
        }
    };
    self.pesquisa = function () {
        self.pesquisado($("#searchbarall").val().toLowerCase());
        if (self.pesquisado().length > 0) {
            window.location.href = "athletes.html?search=" + self.pesquisado();
        }
    }

    //--- start ....
    showLoading();
    $("#searchbarall").val(undefined);
    self.pesquisado = ko.observable(getUrlParameter('search'));
    var pg = getUrlParameter('page');
    console.log(pg);
    self.pesquisado = ko.observable(getUrlParameter('search'));
    self.sortby = ko.observable(getUrlParameter('sortby'));
    if (self.pesquisado() == undefined) {
        if (pg == undefined) {
            if (self.sortby() != undefined) self.activate(1, self.sortby());
            else self.activate(1)
        }
        else {
            if (self.sortby() != undefined) self.activate(pg, self.sortby());
            else self.activate(pg)
        }
    } else {
        if (pg == undefined) self.activate2(self.pesquisado(), 1);
        else self.activate2(self.pesquisado(), pg)
        self.displayName = 'Founded results for <b>' + self.pesquisado() + '</b>';
    }

    console.log("VM initialized!");
    ko.bindingHandlers.safeSrc = {
        update: function (element, valueAccessor) {
            var options = valueAccessor();
            var src = ko.unwrap(options.src);
            if (src == null) {
                $(element).attr('src', ko.unwrap(options.fallback));
            }
            $('<img />').attr('src', src).on('load', function () {
                $(element).attr('src', src);
            }).on('error', function () {
                $(element).attr('src', ko.unwrap(options.fallback));
            });

        }
    };
};

$(document).ready(function () {
    console.log("ready!");
    ko.applyBindings(new vm());
});

$(document).ajaxComplete(function (event, xhr, options) {
    $("#myModal").modal('hide');
});

    //--- Internal functions
    function ajaxHelper(uri, method, data) {
        self.error(''); // Clear error message
        return $.ajax({
            type: method,
            url: uri,
            dataType: 'json',
            contentType: 'application/json',
            data: data ? JSON.stringify(data) : null,
            error: function (jqXHR, textStatus, errorThrown) {
                console.log("AJAX Call[" + uri + "] Fail...");
                hideLoading();
                self.error(errorThrown);
            }
        });
    }

    function sleep(milliseconds) {
        const start = Date.now();
        while (Date.now() - start < milliseconds);
    }

    function showLoading() {
        $("#myModal").modal('show', {
            backdrop: 'static',
            keyboard: false
        });
    }
    function hideLoading() {
        $('#myModal').on('shown.bs.modal', function (e) {
            $("#myModal").modal('hide');
        })
    }

    function getUrlParameter(sParam) {
        var sPageURL = window.location.search.substring(1),
            sURLVariables = sPageURL.split('&'),
            sParameterName,
            i;
        console.log("sPageURL=", sPageURL);
        for (i = 0; i < sURLVariables.length; i++) {
            sParameterName = sURLVariables[i].split('=');

            if (sParameterName[0] === sParam) {
                return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
            }
        }
    };


ko.bindingHandlers.safeSrc = {
    update: function (element, valueAccessor) {
        var options = valueAccessor();
        var src = ko.unwrap(options.src);
        if (src == null) {
            $(element).attr('src', ko.unwrap(options.fallback));
        }
        $('<img />').attr('src', src).on('load', function () {
            $(element).attr('src', src);
        }).on('error', function () {
            $(element).attr('src', ko.unwrap(options.fallback));
        });

    }
};

function conv(BestPosition) {
    if (BestPosition == 1)
        return '<img src="goldmedal.png" style="height: 30px; width: 30px">';
    else if (BestPosition == 2)
        return '<img src="silvermedal.png" style="height: 30px; width: 30px">';
    else if (BestPosition == 3)
        return '<img src="bronzemedal.png" style="height: 30px; width: 30px">';
    else return '<img src="nomedal.png" style="height: 30px; width: 30px">';
}; 


$(document).ready(function () {
    console.log("ready!");
    ko.applyBindings(new vm());
});

$(document).ajaxComplete(function (event, xhr, options) {
    $("#myModal").modal('hide');
});

var flag = true;
var arrayFavsIDS = new Array();

var arrayLocalStorage = new Array(localStorage.getItem("IDS"));

arrayLocalStorage = arrayLocalStorage[0].split(",");

function addfav(event) {
    console.log("iM IN")
    var clicked = event.currentTarget;
    var outElemtn = clicked.parentElement.parentElement.parentElement;

    console.log("heyheyhey" + $("#tab1").children("td:first"));


    var infoTr = new Array(outElemtn.innerText.split("    "));
    var stelem = infoTr[0][0];
    console.log("abacate " + stelem);


    actualArray = arrayLocalStorage;

    clicked.classList.remove("fa-heart-o");
    clicked.classList.add("fa-heart");

    if (flag) {
        clicked.classList.remove("fa-heart-o");
        clicked.classList.add("fa-heart");
        if (arrayFavsIDS.includes(stelem)) {
            console.log("j� existente no array!")
        } else {
            arrayFavsIDS.push(stelem)
            localStorage.setItem("IDS", arrayFavsIDS);
        }

    } else {
        clicked.classList.add("fa-heart-o");
        clicked.classList.remove("fa-heart");
        if (arrayFavsIDS.includes(stelem)) {
            arrayFavsIDS.splice(arrayFavsIDS.indexOf(stelem), 1)
            localStorage.setItem("IDS", arrayFavsIDS);
        } else {
            console.log("j� existente no array!")
        }
    }

    flag = !flag;
    console.log(arrayFavsIDS);
}

function name_search() {
    let input = document.getElementById('searchbar').value
    input = input.toLowerCase();
    console.log(input)
    let x = document.getElementsByClassName('Name');
    console.log(x)

    for (i = 0; i < x.length; i++) {
        if (!x[i].innerHTML.toLowerCase().includes(input)) {
            x[i].parentElement.parentElement.parentElement.style.display = "none";
        }
        else {
            x[i].parentElement.parentElement.parentElement.style.display = "inline"
        }
    }
};



