//Kilde: https://bl.ocks.org/alokkshukla/3d6be4be0ef9f6977ec6718b2916d168
//http://www.barnehagefakta.no/swagger/ui/index#!/Kommune/Kommune_Get
//http://bl.ocks.org/d3noob/8150631
this.dashboard=this.dashboard||{};

this.dashboard.barnehagefakta = function() {
    var token = null;
    var norge = {children: [], fylker:[]};
    var testing = true;
    if(testing)
    {
        norge = dashboardtestdata;
    }
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
                }});
        },
        getFylkerOgKommuner : function(callback) {
            let url = "http://www.barnehagefakta.no/api/Fylker";
            this._get(url, callback);
        },
        displayFylkesInfo : function() {
            if(testing)
            {
                dashboard.barnehagefakta.displayBubbleChart(norge.children);
                return;
            }
            dashboard.barnehagefakta.getFylkerOgKommuner(function(data) {
                var asyncArray = [];
                var antallFylker = data.fylker.length;
                for(var i = 0; i< antallFylker; i++)
                {
                    var bhfFylke = data.fylker[i];
                    var fylke = {navn: bhfFylke.fylkesnavn, children: [], percent: 0, kommuner: []};
                    norge.fylker.push(fylke);
                    
                    var antallKommunerIFylke = bhfFylke.kommuner.length;
                    let async = {kommunerDone: 0, kommunerTbd: antallKommunerIFylke};
                    asyncArray.push(async);
                    
                    for(var j = 0; j < bhfFylke.kommuner.length; j++) {
                        var bhfKommune = bhfFylke.kommuner[j];
                        dashboard.barnehagefakta.getKommuneInfo(bhfKommune.kommunenummer,  
                            (function(k,l) {
                              return function(data) {
                                    norge.fylker[k].percent = Math.max(norge.fylker[k].percent, data.indikatorDataKommune.andelBarnehagerSomIkkeOppfyllerPedagognormen); 
                                    var kommuneChild = {
                                        Name: data.navn,
                                        Count: data.indikatorDataKommune.andelBarnehagerSomIkkeOppfyllerPedagognormen,
                                        Level: "Kommune",
                                        Index: l
                                    };
                                    norge.fylker[k].children.push(kommuneChild);
                                    asyncArray[k].kommunerDone++;
                                    if(asyncArray[k].kommunerDone == asyncArray[k].kommunerTbd)
                                    {
                                        var fylkeChild = {
                                            Name: norge.fylker[k].navn,
                                            Count: norge.fylker[k].percent,
                                            Level: "Fylke",
                                            Index: k
                                        };
                                        norge.children.push(fylkeChild);
                                        if(norge.children.length == antallFylker) {
                                            console.log(norge);
                                            dashboard.barnehagefakta.displayBubbleChart(norge.children);
                                        }
                                    }
                              };
                            })(i,j) // calling the function with the current value
                        );
                    }
                }
            });
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
                    console.log("Level:" + d.data.Level + " Indeks:" + d.data.Index);
                    
                    $("body").html("")
                    if(testing) {
                        dashboard.barnehagefakta.displayBubbleChart(norge.fylker[d.data.Index].children);
                        return;
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
    dashboard.barnehagefakta.displayFylkesInfo();
});