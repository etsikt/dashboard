this.dashboard=this.dashboard||{};

this.dashboard.dataporten = function() {
    var token = null;
    var testBarnehageOrgnr = true;

//Production
    let request = ['email','longterm', 'openid', 'profile', 'userid-feide', 'groups'];
    let dataportenCallback = 'http://localhost:8880/dashboard/index.html';
    let dataportenClientId = '8469a56c-4bc5-4b0a-89ef-132e054a99c1';

//Localhost testing:
/*
    let request = ['email','longterm', 'openid', 'profile', 'userid-feide', 'groups'];
    let dataportenCallback = 'udirditdashboard.azurewebsites.net/index.html';
    let dataportenClientId = '7f4af0bd-622f-4299-abcb-f979f79c0ab4';
*/        
    var client = new jso.JSO({
                providerID: "Dataporten",
                client_id: dataportenClientId,
                redirect_uri: dataportenCallback, 
                authorization: "https://auth.dataporten.no/oauth/authorization"
            });

    return {
        getClient : function() {
            return client;
        },
        updateStatus : function(s, waitIcon = true) {
            $("#dataportenStatus").html(s);
            if(waitIcon) {
                $("#dataportenStatus").append("<span class='loading-gif'></span>");
            }
        },
        clearStatus : function() {
            $("#dataportenStatus").html("");
        },
        updateContent : function(s) {
            $("#dataportenContent").html(s);
        },
        appendContent : function(s){
            $("#dataportenContent").append(s);
        },
        clearContent : function() {
            $("#dataportenContent").html("");
        },
        dataportenCallback : function() {
            client.callback();
        },
        
        display: function() {
            $("#dataporten").html("<div id='dataportenStatus'/><div id='dataportenContent'/>");
            let dataporten_opts = {
                scopes: {request: request},
//                request: {prompt: "none"},
                response_type: 'id_token token',
                redirect_uri: dataportenCallback
            };

            dashboard.dataporten.updateStatus("Sjekker forbindelse til dataporten...");
            this.token = client.checkToken(dataporten_opts);
            if(this.token) {
                console.log(this.token.access_token);
                this.validToken();
            } 
            else
            {
                dashboard.dataporten.clearStatus();
                this.printLoginOptions();
            }
        },
        validToken: function() {
            dashboard.dataporten.displayGroups();
        },
        getFeideIdFromDataportenUserInfo(userIdSec)
        {
            let start = userIdSec.indexOf(":") + 1;
            let feideid = userIdSec.substr(start);
            return feideid;
        },
        printLogoutOptions : function() {
            dashboard.dataporten.appendContent("<div><button class='button' id='dataportenWipeToken'>Logg ut av dataporten</button></div>");
            $(document).on("click","#dataportenWipeToken",function(e){
                dashboard.dataporten.wipeToken();
                $("#dashboardPersonalKommuneMenu").html("");
                $("#dashboardPersonalBarnehageMenu").html("");
                dashboard.dataporten.display();
            });
        },
        printLoginOptions : function() {
            var dataportenHtml = "Logg deg på dataporten for å få skreddersydd visning.<div>\
 <button class='button' id='dataportenPopupLogin'>Login dataporten</button>\
 </div>";

            dashboard.dataporten.updateContent(dataportenHtml);
            $(document).off('click', "#dataportenPopupLogin");
            $(document).on ("click", "#dataportenPopupLogin",function(e) {dashboard.dataporten.authorize()});
        },
        _get : function(url, callback) {
            var self = this;
            $.ajax({
                    url: url,
                    beforeSend: function(xhr) {
                         xhr.setRequestHeader("Authorization", "Bearer " + self.token.access_token)
                    }, success: function(data){
                        callback(data)
                    }, error: function(XMLHttpRequest, textStatus, errorThrown) {
                        let errMsg = 'Det oppstod en feil:' + errorThrown;
                        alert(errMsg);
                        console.log(errMsg);
                }});
        },
        _post : function(url, data, callback) {
            var self = this;
            $.ajax({
                type: "POST",
                url: url,
                beforeSend: function(xhr) {
                    xhr.setRequestHeader("Authorization", "Bearer " + self.token.access_token)
                }, 
                data: data,
                success: function(result) {
                    callback(result)
                },
                error(XMLHttpRequest, textStatus, errorThrown) {
                    let errMsg = 'Det oppstod en feil:' + errorThrown;
                    alert(errMsg);
                    console.log(errMsg);
                }
            });
        },
        getUserInfo : function(callback) {
            let url = "https://auth.dataporten.no/userinfo";
            this._get(url, callback);
        },
        displayPersonalKommuneMenu : function(NOorgnr) {
            dashboard.brreg.getOrgFromNO_OrgNr(NOorgnr, function(org) {
                try {
                    var knr = org.postadresse.kommunenummer;
                    var r = dashboard.barnehagefakta.getKommuneIndeksByKommunenr(knr);
                    if(r){
                        var navn = dashboard.barnehagefakta.getKommunenavnByIndeks(r.fylkesIndeks,r.kommuneIndeks);
                        if(navn)
                        {
                            var kommuneMenu = "<button id='visMinKommune'>Vis min kommune - " + navn + "</button>";
                            $("#dashboardPersonalKommuneMenu").html(kommuneMenu);
                            $("#visMinKommune").click(function(){
                                dashboard.barnehagefakta.displayKommune(r.fylkesIndeks,r.kommuneIndeks);
                            });
                        } else
                        {
                            var kommuneMenu = "Fant ikke kommune for organisasjonen" + NOorgnr;
                            $("#dashboardPersonalKommuneMenu").html(kommuneMenu);
                        }
                    }
                    else {
                        console.log("Fant ikke kommune for organisasjonen" + NOorgnr);
                        var kommuneMenu = "Fant ikke kommune for organisasjonen" + NOorgnr;
                        $("#dashboardPersonalKommuneMenu").html(kommuneMenu);
                    }
                } catch(err) {
                    console.log("displayPersonalKommuneMenu exception:" + err);
                }
            });
        },
        displayPersonalBarnehageMenu : function(orgnr) {
                                
            if(testBarnehageOrgnr)
            {
                orgnr = "973503065";
            }

            var r = dashboard.barnehagefakta.getBarnehageIndeksByOrgnr(orgnr);
            if(r) {
                var navn = dashboard.barnehagefakta.getBarnehagenavnByIndeks(r.fylkesIndeks,r.kommuneIndeks,r.barnehageIndeks);
                if(navn)
                {
                    var barnehageMenu = "<button id='visMinBarnehage'>Vis min barnehage - " + navn + "</button>";
                    if(testBarnehageOrgnr)
                    {
                        barnehageMenu += "(TEST - slå av variabel i javascript dersom du har en Feideid fra en barnehage)";
                    }

                    $("#dashboardPersonalBarnehageMenu").html(barnehageMenu);
                    $("#visMinBarnehage").click(function(){
                        dashboard.barnehagefakta.displayBarnehage(r.fylkesIndeks,r.kommuneIndeks,r.barnehageIndeks);
                        dashboard.barnehagefakta.displayBarnehageByOrgnr(orgnr);
                    });
                }
                else
                {
                    $("#dashboardPersonalBarnehageMenu").html("Fant ikke navn på barnehage for organisasjonsnummer " + orgnr);
                }
            }
            else
            {
                $("#dashboardPersonalBarnehageMenu").html("Fant ikke barnehage for organisasjonsnummer " + orgnr);
            }
        },
        displayGroups: function() {
            dashboard.dataporten.clearContent();
            let url = 'https://groups-api.dataporten.no/groups/me/groups';
            dashboard.dataporten.updateStatus("Henter grupper fra dataporten...");
            this._get(url, function(dataportenGroups) {
                var NOorgnr = "";
                var NOorgnrParent = "";
                var parentOrgFound = false;
                var orgFound = false;
                for(var i = 0; i < dataportenGroups.length; i++) {
                    var dataportenGroup = dataportenGroups[i];
                    if(dataportenGroup.type == "fc:org")
                    {
                        if(dataportenGroup.parent)
                        {
                            orgFound = true;
                            var a = dataportenGroup.id.split(":");
                            NOorgnr = a[a.length-1];
                        }
                        else
                        {
                            parentOrgFound = true;
                            NOorgnrParent = dataportenGroup.norEduOrgNIN;
                        }
                    }
                }
                if(parentOrgFound)
                {
                    dashboard.dataporten.displayPersonalKommuneMenu(NOorgnrParent);
                }
                if(orgFound)
                {
                    var orgnr = NOorgnr.substr(2);
                    dashboard.dataporten.displayPersonalBarnehageMenu(orgnr);
                }                
                dashboard.dataporten.clearStatus();
                dashboard.dataporten.printLogoutOptions();
            }); //end fetched dataporten Groups
        },
        
        wipeToken: function()  {
            client.wipeTokens()
        },
        authorize : function() {
            let opts = {
                scopes: {
                    request: request
                },
                response_type: 'id_token token'
            }

            let token = client.getToken(opts);

            client.getToken(opts)
                .then((token) => {
                    dashboard.dataporten.valideToken();
                    console.log("I got the token: ", token)
                })
        },

        authorizePopup: function()  {
            var self = this;
            let opts = {
                scopes: {
                    request: request
                },
                response_type: 'id_token token'
            }

            client.setLoader(jso.Popup)
            client.getToken(opts)
                .then((token) => {
                    console.log("I got the token: " + token.access_token);
                    self.token = token;
                    self.validToken();
                })
                .catch((err) => {
                    console.error("Error from popup loader", err)
                })
        }        
    }
}();
