// ViewModel KnockOut
var vm = function () {
    console.log('ViewModel initiated...');
    //---Variáveis locais
    var self = this;
    self.baseUri = ko.observable('http://192.168.160.58/Olympics/api/Games/FullDetails?id=');
    self.displayName = 'Olympic Games edition Details';
    self.error = ko.observable('');
    self.passingMessage = ko.observable('');
    //--- Data Record
    self.Id = ko.observable('');
    self.CountryName = ko.observable('');
    self.Name = ko.observable('');
    self.Year = ko.observable('');
    self.Season = ko.observable('');
    self.City = ko.observable('');
    self.Logo = ko.observable('');
    self.Photo = ko.observable('');
    self.Athletes = ko.observable('');
    self.Modalities = ko.observable('');
    self.Competitions = ko.observable('');
    self.Medals = ko.observable('');
    self.listerino = ko.observable('');


    //--- Page Events
    self.activate = function (id) {
        console.log('CALL: getGame...');
        var composedUri = self.baseUri() + id;
        ajaxHelper(composedUri, 'GET').done(function (data) {
            console.log(data);
            hideLoading();
            self.Id(data.Id);
            self.CountryName(data.CountryName);
            self.Name(data.Name);
            self.Year(data.Year);
            self.Season(data.Season);
            self.City(data.City);
            self.Logo(data.Logo);
            self.Photo(data.Photo);
            self.Athletes(data.Athletes);
            self.Modalities(data.Modalities);
            self.Competitions(data.Competitions);
            self.Medals(data.Medals);
            var Events = data.Competitions;
            console.log(Events);
            var dict = [];
            console.log(dict);
            var count = 1;
            for (let i = 0; i < Events.length; i++) {
                var trinket = Events[i]
                console.log(trinket)
                var done = false
                for (let k = 0; k < dict.length; k++) {
                    if (dict[k].Sport == trinket.Modality) {
                        done = true;
                        console.log(dict[k].SportList)
                        var list = dict[k].SportList
                        list.push(trinket);
                    };
                };
                if (!(done)) {
                    dict.push({ 'Id': count, 'Sport': trinket.Modality, 'SportList': [trinket] });
                    count = count + 1;
                };
            };
            console.log(dict);
            self.listerino(dict)

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

    function showLoading() {
        $('#myModal').modal('show', {
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

        for (i = 0; i < sURLVariables.length; i++) {
            sParameterName = sURLVariables[i].split('=');

            if (sParameterName[0] === sParam) {
                return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
            }
        }
    };

    //--- start ....
    showLoading();
    var pg = getUrlParameter('id');
    console.log(pg);
    if (pg == undefined)
        self.activate(1);
    else {
        self.activate(pg);
    }
    console.log("VM initialized!");
};

$(document).ready(function () {
    console.log("document.ready!");
    ko.applyBindings(new vm());
});

$(document).ajaxComplete(function (event, xhr, options) {
    $("#myModal").modal('hide');
})