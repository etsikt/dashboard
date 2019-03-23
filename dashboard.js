//Kilde: https://bl.ocks.org/alokkshukla/3d6be4be0ef9f6977ec6718b2916d168
//http://www.barnehagefakta.no/swagger/ui/index#!/Kommune/Kommune_Get
//http://bl.ocks.org/d3noob/8150631
this.dashboard=this.dashboard||{};

this.dashboard.barnehagefakta = function() {
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
                dashboard.barnehagefakta.displayBubbleChart(norge.fylker);
            }
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
        addBarnehage : function(k, l, m, bhfBarnehage, c) {
            var barnehage = {
                Name: bhfBarnehage.navn, 
                Count: c,
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
                barnehager: []
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
                kommuner: []
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
                        dashboard.barnehagefakta.updateBarnehageInfo(i, j, k, norge.fylker[i].kommuner[j].bhfBarnehager[k].bhfBarnehage);
                    }
                }
            }        
        },
        updateBarnehageInfo : function(k,l,m, bhfBarnehageInfo) {
            norge.fylker[k].Count = Math.max(norge.fylker[k].Count, bhfBarnehageInfo.indikatorDataKommune.andelBarnehagerSomIkkeOppfyllerPedagognormen); 
            norge.fylker[k].kommuner[l].Count = Math.max(norge.fylker[k].Count, bhfBarnehageInfo.indikatorDataKommune.andelBarnehagerSomIkkeOppfyllerPedagognormen); 

            dashboard.barnehagefakta.addBarnehage(k,l,m, bhfBarnehageInfo, 100);
            return;

            if(!bhfBarnehageInfo.indikatorDataBarnehage)
            {
                norge.fylker[k].kommuner[l].barnehager[m].Count = 100;
                return;
            }

            var a = bhfBarnehageInfo.indikatorDataBarnehage.andelAnsatteMedBarneOgUngdomsarbeiderfag;
            var b = bhfBarnehageInfo.indikatorDataBarnehage.andelAnsatteBarnehagelarer;
            var c = bhfBarnehageInfo.indikatorDataBarnehage.andelAnsatteMedAnnenHoyereUtdanning;
            var d = bhfBarnehageInfo.indikatorDataBarnehage.andelAnsatteMedAnnenFagarbeiderutdanning;
            var e = bhfBarnehageInfo.indikatorDataBarnehage.andelAnsatteMedAnnenBakgrunn;
            var f = bhfBarnehageInfo.indikatorDataBarnehage.andelAnsatteMedAnnenPedagogiskUtdanning;

            var s = 0;
            
            if(a) s += a;
            if(b) s += b;
            if(c) s += c;
            if(d) s += d;
            if(e) s += e;
            if(f) s += f;
             
            norge.fylker[k].kommuner[l].barnehager[m].Count = s;

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

            var svg = d3.select("body")
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
                    
                    $("body").html("")
                    if(d.data.Level == "Fylke")
                    {
                        dashboard.barnehagefakta.displayBubbleChart(norge.fylker[d.data.Fylkesindeks].kommuner);
                    }
                    else if(d.data.Level == "Kommune")
                    {
                        dashboard.barnehagefakta.displayBubbleChart(norge.fylker[d.data.Fylkesindeks].kommuner[d.data.Kommuneindeks].barnehager);
                    }
                })
                .attr("r", function(d) {
                    return d.r;
                })
                .style("fill", function(d,i) {
                    if(d.data.Count > 50.0) {
                        return "#ff0000";
                    }
                    else if(d.data.Count > 25.0) {
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

jQuery(function($) {
    dashboard.barnehagefakta.process();
});