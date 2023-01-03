// ViewModel KnockOut
var vm = function () {
    console.log('ViewModel initiated...');
    //---Variáveis locais
    var self = this;
    self.baseUri = ko.observable('http://192.168.160.58/Olympics/api/Countries?id=');
    self.displayName = 'Olympic Games edition Details';
    self.error = ko.observable('');
    self.passingMessage = ko.observable('');
    //--- Data Record
    self.Id = ko.observable('');
    self.Name = ko.observable('');
    self.IOC = ko.observable('');
    self.Flag = ko.observable('');
    self.Events = ko.observable('');
    self.Participant = ko.observable('');
    self.Organizer = ko.observableArray('');
    self.listerino = ko.observableArray('')

    //--- Page Events
    self.activate = function (id) {
        console.log('CALL: getCountry...');
        var composedUri = self.baseUri() + id;
        ajaxHelper(composedUri, 'GET').done(function (data) {
            console.log(data);
            hideLoading();
            self.Id(data.Id);
            self.Name(data.Name);
            self.IOC(data.IOC);
            self.Flag(data.Flag);
            self.Events(data.Events);
            self.Participant(data.Participant);
            self.Organizer(data.Organizer);
            console.log(data.Events);
            var Events = data.Events
            var dict = [];
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

self.refreshVar = ko.observable(true);
self.refreshList = function (list) {
    self.refreshVar(false);
    self.Events(list);
    self.refreshVar(true);
};

$(document).ready(function () {
    console.log("document.ready!");
    ko.applyBindings(new vm());
});

$(document).ajaxComplete(function (event, xhr, options) {
    $("#myModal").modal('hide');
});

$(document).ajaxComplete(function (data) {
    list = data
    console.log(list)
});