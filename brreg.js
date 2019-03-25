//https://data.brreg.no/enhetsregisteret/api/docs/index.html#_eksempel_1_hent_enhet
//curl 'https://data.brreg.no/enhetsregisteret/api/enheter/123456789' -i
this.dashboard=this.dashboard||{};

this.dashboard.brreg = function() {
    return {
        _get : function(url, callback) {
            var self = this;
            $.ajax({
                    url: url,
                    success: function(data){
                        callback(data)
                    }, error: function(XMLHttpRequest, textStatus, errorThrown) {
                        let errMsg = 'Det oppstod en feil:' + errorThrown;
                        alert(errMsg);
                        console.log(errMsg);
                }
            });
        },
        getKommuneNrFromOrgNr : function(NOorgnr, callback) {
            var orgnr = NOorgnr.substr(2);
            let url = "https://data.brreg.no/enhetsregisteret/api/enheter/" + orgnr;
            this._get(url, callback);
        }
    }
}();
        