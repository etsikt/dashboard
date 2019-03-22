//Kilde: https://bl.ocks.org/alokkshukla/3d6be4be0ef9f6977ec6718b2916d168
this.dashboard=this.dashboard||{};

this.dashboard.barnehagefakta = function() {
    var token = null;

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
                .attr("r", function(d) {
                    return d.r;
                })
                .style("fill", function(d,i) {
                    if(d.data.Count < 50.0) {
                        return "#ff0000";
                    }
                    else
                    {
                        return "#00ff00";
                    }
                    
                });
            node.append("text")
                .attr("dy", ".2em")
                .style("text-anchor", "middle")
                .text(function(d) {
                    return d.data.Name.substring(0, d.r / 3);
                })
                .attr("font-family", "sans-serif")
                .attr("font-size", function(d){
                    return d.r/5;
                })
                .attr("fill", "white");

            node.append("text")
                .attr("dy", "1.3em")
                .style("text-anchor", "middle")
                .text(function(d) {
                    return d.data.Count;
                })
                .attr("font-family",  "Gill Sans", "Gill Sans MT")
                .attr("font-size", function(d){
                    return d.r/5;
                })
                .attr("fill", "white");

            d3.select(self.frameElement)
                .style("height", diameter + "px");
        }
    }
}();

jQuery(function($) {
    var children = [];
    dashboard.barnehagefakta.getKommuneInfo(1902, function(data) {
        //{"Name":"Olives","Count":4319}
        var kommune = {
            Name: data.navn,
            Count: data.indikatorDataKommune.andelBarnehagerSomIkkeOppfyllerPedagognormen
        };
        children.push(kommune)
        console.log(children);
        dashboard.barnehagefakta.displayBubbleChart(children);
    });
    
});