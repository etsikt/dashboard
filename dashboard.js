//Kilde: https://bl.ocks.org/alokkshukla/3d6be4be0ef9f6977ec6718b2916d168
//http://www.barnehagefakta.no/swagger/ui/index#!/Kommune/Kommune_Get
//http://bl.ocks.org/d3noob/8150631
this.dashboard=this.dashboard||{};

this.dashboard.barnehagefakta = function() {
    const BHF_NO_ALARM = 0;
    const BHF_ALARM = 1;
    const BHF_NO_DATA = 2;
    var token = null;
    var norge = {fylker:[]};
    var fetchBarnehageOversiktOnly = false;
    var fetchBarnehageInfoOnly = false;
    return {
        process : function() {
            if(fetchBarnehageOversiktOnly) {
                dashboard.barnehagefakta.fetchBarnehageOversikt();
            } else if (fetchBarnehageInfoOnly) {
                norge = barnehagefaktadata;
                dashboard.barnehagefakta.fetchBarnehageInfo();
            } else {
                norge = barnehageinfo;
                dashboard.barnehagefakta.updateStatistics();
                dashboard.barnehagefakta.displayNorge();
            }
        },
        updateHeader : function(s) {
            $("#dashboardHeader").html("<h2>" + s + "</h2>");
        },
        displayNorge : function() {
            $("#barnehagefaktaGrafikk").html("")
            dashboard.barnehagefakta.updateHeader("Norge");
            dashboard.barnehagefakta.displayBubbleChart(norge.fylker);
        },
        displayFylke : function(f) {
            $("#barnehagefaktaGrafikk").html("")
            $("#dashboardMenu").html("<button id='dashboardVisNorge'>Vis Norge</button>");
            $("#dashboardVisNorge").click(function(){
                dashboard.barnehagefakta.displayNorge();
            });
            dashboard.barnehagefakta.updateHeader(norge.fylker[f].Name);
            dashboard.barnehagefakta.displayBubbleChart(norge.fylker[f].kommuner);
        },
        getKommunenavnByIndeks : function(i,j) {
            var kommunenavn = null;
            try {
              kommunenavn = norge.fylker[i].kommuner[j].Name;
            }
            catch(err) {
                console.log("getKommunenavnByIndeks exception:"+err);
            }
            return kommunenavn;
        },
        getKommuneIndeksByKommunenr : function(knr) {
            var result = null;
            for(var i = 0; i< norge.fylker.length; i++)
            {
                for(var j = 0; j< norge.fylker[i].kommuner.length; j++)
                {
                    if(norge.fylker[i].kommuner[j].bhfKommune.kommunenummer == knr)
                    {
                        result = {fylkesIndeks: i, kommuneIndeks: j} ;
                        return result;
                    }
                }
            }
            return result;
        },
        getBarnehagenavnByIndeks : function(i,j,k) {
            var barnehageNavn = null;
            try {
              barnehageNavn = norge.fylker[i].kommuner[j].bhfBarnehager[k].navn;
            }
            catch(err) {
                console.log("getBarnehageNavnByIndeks exception:"+err);
            }
            return barnehageNavn;
        },
        getBarnehageIndeksByOrgnr : function(orgnr) {
            var result = null;
            for(var i = 0; i< norge.fylker.length; i++)
            {
                for(var j = 0; j< norge.fylker[i].kommuner.length; j++)
                {
                    for(var k = 0; k< norge.fylker[i].kommuner[j].barnehager.length; k++)
                    {
                        if(norge.fylker[i].kommuner[j].bhfBarnehager[k].bhfBarnehage.orgnr == orgnr)
                        {
                            result = {fylkesIndeks: i, kommuneIndeks: j, barnehageIndeks: k};
                            return result;
                        }
                    }
                }
            }
            return result;
        },
        displayKommune : function(f, k) {
            $("#barnehagefaktaGrafikk").html("")
            $("#dashboardMenu").html("<button id='dashboardVisFylke'>Vis fylket kommunen tilhører</button>");
            $("#dashboardVisFylke").click(function(){
                dashboard.barnehagefakta.displayFylke(f);
            });
            dashboard.barnehagefakta.updateHeader(norge.fylker[f].kommuner[k].Name);
            dashboard.barnehagefakta.displayBubbleChart(norge.fylker[f].kommuner[k].barnehager);
        },
        displayBarnehage : function(f, k, b) {
            $("#barnehagefaktaGrafikk").html("")
            $("#dashboardMenu").html("<button id='dashboardVisKommune'>Vis kommunen barnehagen tilhører</button>");
            $("#dashboardVisKommune").click(function(){
                dashboard.barnehagefakta.displayKommune(f,k);
            });
            //console.log(norge.fylker[f].kommuner[k].bhfBarnehager[b]);
            var url = "https://barnehagefakta.no/barnehage/" + norge.fylker[f].kommuner[k].bhfBarnehager[b].nsrId;
            var iframe = "<iframe src='" + url + "' width='100%' height='1000'></frame>";
            $("#barnehagefaktaGrafikk").html(iframe);
        },
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
                }});
        },
        getFylkerOgKommuner : function(callback) {
            let url = "http://www.barnehagefakta.no/api/Fylker";
            this._get(url, callback);
        },
        addBarnehager : function(k, l, bhfBarnehager) {
            norge.fylker[k].kommuner[l].bhfBarnehager = bhfBarnehager;
        },
        addBarnehage : function(k, l, m, bhfKommuneBarnehage, alarm) {
            var antallBarn = bhfKommuneBarnehage.antallBarn;
            
            if(alarm == BHF_NO_DATA)
            {
                antallBarn = 100;
            }
            var barnehage = {
                Alarm: alarm,
                Name: bhfKommuneBarnehage.navn, 
                Count: antallBarn,
                Level: "Barnehage",
                Fylkesindeks: k,
                Kommuneindeks: l,
                Barnehageindeks: m
            };
            norge.fylker[k].kommuner[l].barnehager.push(barnehage);
        },
        addBarnehageFakta : function(k, l, m, bhfBarnehage) {
            norge.fylker[k].kommuner[l].bhfBarnehager[m].bhfBarnehage = bhfBarnehage;
        },
        addKommune : function(k, l, bhfKommune) {
            var kommune = {
                Name: bhfKommune.kommunenavn,
                Count: 0,
                Level: "Kommune",
                Fylkesindeks: k,
                Kommuneindeks: l,
                barnehager: [],
                bhfKommune: bhfKommune
            };
            norge.fylker[k].kommuner.push(kommune);
        },
        addFylke : function(k, bhfFylke)
        {
            var fylke = {
                Name: bhfFylke.fylkesnavn,
                Count: 0,
                Level: "Fylke",
                Fylkesindeks: k,
                kommuner: [],
                bhfFylke: bhfFylke
            };
            norge.fylker.push(fylke);
        },
        updateStatistics : function() {
            for(var i = 0; i< norge.fylker.length; i++)
            {
                for(var j = 0; j< norge.fylker[i].kommuner.length; j++)
                {
                    for(var k = 0; k < norge.fylker[i].kommuner[j].bhfBarnehager.length; k++)
                    {
                        dashboard.barnehagefakta.updateBarnehageInfo(i, j, k, norge.fylker[i].kommuner[j].bhfBarnehager[k]);
                    }
                }
            }    
            console.log(norge);    
        },
        updateBarnehageInfo : function(k,l,m, bhfKommuneBarnehage) {
            //console.log(bhfKommuneBarnehage.navn);
        
            var antallBarn = bhfKommuneBarnehage.antallBarn;
            antallBarn = antallBarn ? antallBarn : 100;
            
            var antallBarnPerAnsatt = 0;
            var alarm = BHF_ALARM;
            if(bhfKommuneBarnehage.bhfBarnehage.indikatorDataBarnehage)
            {
                bhfKommuneBarnehage.bhfBarnehage.indikatorDataBarnehage.antallBarnPerAnsatt;
                antallBarnPerAnsatt = bhfKommuneBarnehage.bhfBarnehage.indikatorDataBarnehage.antallBarnPerAnsatt ? bhfKommuneBarnehage.bhfBarnehage.indikatorDataBarnehage.antallBarnPerAnsatt : 0;
                if(antallBarnPerAnsatt <= 6.0)
                {
                    alarm = BHF_NO_ALARM;
                }
            }
            else
            {
                alarm = BHF_NO_DATA;
            }
            
            norge.fylker[k].Count += antallBarn;
            if(!norge.fylker[k].Alarm || (norge.fylker[k].Alarm == BHF_NO_ALARM) || (norge.fylker[k].Alarm == BHF_NO_DATA))
            {
                norge.fylker[k].Alarm = alarm;
            }

            norge.fylker[k].kommuner[l].Count += antallBarn; 
            if(!norge.fylker[k].kommuner[l].Alarm || (norge.fylker[k].kommuner[l].Alarm == BHF_NO_ALARM) || (norge.fylker[k].kommuner[l].Alarm == BHF_NO_DATA))
            {
                norge.fylker[k].kommuner[l].Alarm = alarm;
            }

            dashboard.barnehagefakta.addBarnehage(k,l,m, bhfKommuneBarnehage, alarm);
        },
        updateProgress : function() {
            $("#dashboardProgress").append(".");
        },
        getNumberOfKommuner: function(fylker)
        {
            var noOfKommuner = 0;
            for(var i = 0; i< fylker.length; i++)
            {
                noOfKommuner += fylker[i].kommuner.length;
            }
            return noOfKommuner;
        },
        getNumberOfBarnehager : function() {
            var noOfBarnehager = 0;
            for(var i = 0; i< norge.fylker.length; i++)
            {
                for(var j = 0; j < norge.fylker[i].kommuner.length; j++)
                {
                    noOfBarnehager += norge.fylker[i].kommuner[j].bhfBarnehager.length;
                }
            }
            return noOfBarnehager;
        },
        fetchBarnehageInfo : function () {
            let asyncBarnehagerTbd = dashboard.barnehagefakta.getNumberOfBarnehager();
            let asyncBarnehagerDone = 0;
            
            for(var i = 0; i< norge.fylker.length; i++)
            {
                for(var j = 0; j< norge.fylker[i].kommuner.length; j++)
                {
                    for(var k = 0; k < norge.fylker[i].kommuner[j].bhfBarnehager.length; k++)
                    {
                        var bhfBarnehage = norge.fylker[i].kommuner[j].bhfBarnehager[k];

                        dashboard.barnehagefakta.getBarnehageInfo(bhfBarnehage.nsrId,  
                            (function(n,o,p) {
                              return function(bhfBarnehageInfo) {
                                asyncBarnehagerDone++;

                                dashboard.barnehagefakta.addBarnehageFakta(n,o, p, bhfBarnehageInfo);

                                if(asyncBarnehagerDone == asyncBarnehagerTbd)
                                {                                                
                                    console.log(norge);
                                }
                              };
                            })(i,j,k) // calling the function with the current value
                        );
                    }
                }
            }
        },
        fetchBarnehageOversikt : function() {
            dashboard.barnehagefakta.getFylkerOgKommuner(function(data) {
                var asyncFylkesArray = [];
                var asyncKommuneArray = [];
                var antallFylker = data.fylker.length;
                let asyncKommunerTbd = dashboard.barnehagefakta.getNumberOfKommuner(data.fylker);
                let asyncKommunerDone = 0;

                for(var i = 0; i< antallFylker; i++)
                {
                    var bhfFylke = data.fylker[i];
                    dashboard.barnehagefakta.addFylke(i, bhfFylke);
                    
                    var antallKommunerIFylke = bhfFylke.kommuner.length;
                    
                    for(var j = 0; j < antallKommunerIFylke; j++) {
                        var bhfKommune = bhfFylke.kommuner[j];
                        dashboard.barnehagefakta.addKommune(i,j,bhfKommune);

                        dashboard.barnehagefakta.getBarnehager(bhfKommune.kommunenummer,  
                            (function(k,l) {
                              return function(bhfBarnehager) {
                                dashboard.barnehagefakta.addBarnehager(k, l, bhfBarnehager);
                                asyncKommunerDone++;
                                if(asyncKommunerDone == asyncKommunerTbd)
                                {
                                    console.log(norge);
                                    //dashboard.barnehagefakta.processBarnehager();
                                }
                              };
                            })(i,j) // calling the function with the current value
                        );
                    } //end for alle kommuner i fylket
                } //end for all fylker
            });
        },
        getBarnehager : function(kommuneNr, callback) {
            let url = "http://www.barnehagefakta.no/api/Location/kommune/" + kommuneNr;
            this._get(url, callback);
        },
        getBarnehageInfo : function(nsrid, callback) {
            let url = "http://www.barnehagefakta.no/api/Barnehage/" + nsrid;
            this._get(url, callback);
        },
        getKommuneInfo : function(kommuneNr, callback) {
            let url = "http://www.barnehagefakta.no/api/Kommune/" + kommuneNr;
            this._get(url, callback);
        },
        displayBubbleChart : function(children) {
            dataset = {
                "children": children
            };

            var diameter = 600;
            var color = d3.scaleOrdinal(d3.schemeCategory20);

            var bubble = d3.pack(dataset)
                .size([diameter, diameter])
                .padding(1.5);

            var svg = d3.select("#barnehagefaktaGrafikk")
                .append("svg")
                .attr("width", diameter)
                .attr("height", diameter)
                .attr("class", "bubble");

            var nodes = d3.hierarchy(dataset)
                .sum(function(d) { return d.Count; });

            var node = svg.selectAll(".node")
                .data(bubble(nodes).descendants())
                .enter()
                .filter(function(d){
                    return  !d.children
                })
                .append("g")
                .attr("class", "node")
                .attr("transform", function(d) {
                    return "translate(" + d.x + "," + d.y + ")";
                });

            node.append("title")
                .text(function(d) {
                    return d.Name + ": " + d.Count;
                });

            node.append("circle")
                .on('click', function(d) {
                    console.log("Level:" + d.data.Level + " Indeks:" + d.data.Fylkesindeks);
                    
                    if(d.data.Level == "Fylke")
                    {
                        dashboard.barnehagefakta.displayFylke(d.data.Fylkesindeks);
                    }
                    else if(d.data.Level == "Kommune")
                    {
                        dashboard.barnehagefakta.displayKommune(d.data.Fylkesindeks, d.data.Kommuneindeks);
                    }
                    else if(d.data.Level == "Barnehage")
                    {
                        dashboard.barnehagefakta.displayBarnehage(d.data.Fylkesindeks, d.data.Kommuneindeks, d.data.Barnehageindeks);
                    }
                })
                .attr("r", function(d) {
                    return d.r;
                })
                .style("fill", function(d,i) {
                    if(d.data.Alarm == BHF_ALARM) {
                        return "#ff0000";
                    }
                    else if (d.data.Alarm == BHF_NO_DATA) {
                        return "#ffff00";
                    }
                    else
                    {
                        return "#00ff00";
                    }
                    
                });
            node.append("text")
                .attr("dy", ".2em")
                .style("text-anchor", "middle")
                .style("pointer-events", "none")
                .text(function(d) {
                    return d.data.Name.substring(0, d.r / 3);
                })
                .attr("font-family", "sans-serif")
                .attr("font-size", function(d){
                    return d.r/5;
                })
                .attr("fill", "black");

            node.append("text")
                .attr("dy", "1.3em")
                .style("text-anchor", "middle")
                .style("pointer-events", "none")
                .text(function(d) {
                    return d.data.Count;
                })
                .attr("font-family",  "Gill Sans", "Gill Sans MT")
                .attr("font-size", function(d){
                    return d.r/5;
                })
                .attr("fill", "black");

            d3.select(self.frameElement)
                .style("height", diameter + "px");
        }
    }
}();

