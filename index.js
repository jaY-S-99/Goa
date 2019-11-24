const map = {
  c_unit_map: "./Maps/ga.json",
  c_unit_map_s: "./Maps/ga_s.json",
  pernem: "./Maps/Pernem.json",
  bardez: "./Maps/Bardez.json",
  ponda: "./Maps/Ponda.json",
  sanguem: "./Maps/Sanguem.json",
  sattari: "./Maps/Satari.json",
  bicholim: "./Maps/Bicholim.json",
  canacona: "./Maps/Canacona.json",
  quepem: "./Maps/Quepem.json",
  salcete: "./Maps/Salcete.json",
  tiswadi: "./Maps/Tiswadi.json",
  darbandora: "./Maps/Darbandora.json",
  mormugao: "./Maps/Mormugao.json",
  vp_final: "./Maps/VP_Goa_map.json",
  vp_final_s: "./Maps/VP_Goa_map_simp.json"
};
const data_n = {
  pernem: d3.csv("./data/Pernem_data.csv"),
  bardez: d3.csv("./data/Bardez_data.csv"),
  bicholim: d3.csv("./data/Bicholim_data.csv"),
  tiswadi: d3.csv("./data/Tiswadi_data.csv"),
  mormugao: d3.csv("./data/Mormugao_data.csv"),
  darbandora: d3.csv("./data/Darbandora_data.csv"),
  quepem: d3.csv("./data/Quepem_data.csv"),
  salcete: d3.csv("./data/Salcete_data.csv"),
  sanguem: d3.csv("./data/Sanguem_data.csv"),
  sattari: d3.csv("./data/Sattari_data.csv"),
  canacona: d3.csv("./data/Canacona_data.csv"),
  ponda: d3.csv("./data/Ponda_data.csv"),
  c_unit_map: d3.csv("./data/Database.csv"),
  c_unit_map_s: d3.csv("./data/Database.csv"),
  vp_final: d3.csv("./data/VP_data.csv"),
  vp_final_s: d3.csv("./data/VP_data.csv")
};
const notToBeDisplayed = ["ID","State","District","Subdistt","Town/Village","Ward","EB","Level","Name","TRU","VP/MC","VP Area", "VP Population"]

const urbRuralClassification = {
"I" : "#fec44f",
"II":"#fe9929",
"III":"#ec7014",
"IV":"#cc4c02",
"V": "#993404",
"VI":"#662506",
"A":"#A1D39A",
"B": "#6CC160",
"C": "#408737",
"D": "#156609"
};

const urbRuralColors = ["#fec44f","#fe9929","#ec7014","#cc4c02","#993404","#662506","#A1D39A","#6CC160","#408737","#156609"];

const starting_pos_vp = {
  "Bardez": 0,
  "Bicholim": 34,
  "Canacona": 53,
  "Darbandora": 61,
  "Mormugao": 66,
  "Pernem": 70,
  "Ponda": 91,
  "Quepem": 110,
  "Salcete": 123,
  "Satari": 157,
  "Tiswadi": 170,
  "Sanguem": 190
}

const map_unidentified_color = "#D8D8D8";

const color = d3.scaleThreshold()
  .domain([0.01, 0.03, 0.1, 0.2, 0.45, 0.75])
  .range(["#fee391", "#fec44f", "#fe9929", "#ec7014", "#cc4c02", "#993404", "#662506"]);

const legendColors = ["#fee391", "#fec44f", "#fe9929", "#ec7014", "#cc4c02", "#993404", "#662506","#F0F0F0"];

const height = 680;
const width = 1280;

let legendShiftX = 10;
let legendShiftY = 30;

let div_map = d3.select('.grid-container').append("div")
          .attr("class", "svg-container");

let svg = div_map.append("svg")
                  .attr("height",height)
                  .attr("width",width);

let legend = svg.append("g")
                	.attr("id", "legend");


let g = svg.append('g')
            .attr("class","shapes")
            .attr("transform","translate(270,-120) scale(1)");

let tooltip = d3.select(".grid-container").append("div")
                .attr("class", "tooltip")
                .style("opacity", 0);

function zoomed(){
  g.attr('transform',d3.event.transform);
}

function render (json, csv)
{
  d3.selectAll('.legenditem').remove();
  d3.selectAll('.legend-rect').remove();
  d3.selectAll('.legend-text').remove();
  d3.select('.information-text').remove();

  // removing previously rendered paths and dropdown
  d3.selectAll('.census_unit').remove();
  d3.selectAll('.heatmap-property').remove();

  //projecting lat long on xy
  var projections = d3.geoMercator()
                        .fitExtent([[0,0],[height,width]], json);

  //creating geopaths
  var geoGenerator = d3.geoPath()
                      .projection(projections);

  //using json file to create DOM elements
  var u = g.selectAll('path')
            .data(json.features);

  // filling in for the new elements
  u.enter()
    .append('path')
      .attr('d',geoGenerator)
      .attr('fill',"black")
      .attr('stroke',"white")
      .attr('stroke-width','1px')
      .attr('class',"census_unit")
      .attr('fill-opacity',0.1);

  d3.selectAll('path').on("mouseover", function(d) {

      tooltip.transition()
        .duration(250)
        .style("opacity",1);
      tooltip.html("<p>Name : " + d.properties.NAME + "</p>")//"<p>ID : " + csv[+d.properties.ID-1].ID + "</p>")
      .style("left", (d3.event.pageX + 15) + "px")
            .style("top", (d3.event.pageY - 28) + "px");
    })
    .on("mouseout",function(d){
      tooltip.transition()
      .duration(250)
      .style("opacity",0);
    });

    Object.keys(csv[0]).forEach(function(key) {
        if(!notToBeDisplayed.includes(key))
        {
          d3.select('#property-selector')
            .append('option')
              .attr('class','heatmap-property')
              .html(key);
        };
    });
}
function updateColorsAndTooltip(json, csv)
{
  let selectedProperty = d3.select('#property-selector').node().value;
  let selectedMap = d3.select('#map-selector').node().value;
  let arrayOfSelectedValues = csv.map(function(element){return +element[selectedProperty];});
  let maxValue = d3.max(arrayOfSelectedValues);
  if(maxValue===0){maxValue=1;}

  //TO UPDATE THE INFORMATION text
  d3.select('.information-text').remove();
  d3.select('.grid-container')
    .append('div')
      .attr('class','information-text');

  d3.select('.information-text')
    .append('h2')
      .text(selectedProperty)
      .style('font-family','\'Nunito\', sans-serif');

    d3.select('.information-text')
      .append('p')
        .text('Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.')
        .style('font-family','\'Nunito\', sans-serif');

  //THIS PART IS TO ADD LEGENDS TO THE MAP
  const vals = [0.01, 0.03, 0.1, 0.15, 0.45, 0.75];
  if(selectedMap === "c_unit_map" || selectedMap === "c_unit_map_s")
  {
    let arrayOfLegendValues = vals.map(function(d){return Math.round(maxValue*d);});
  }
  let arrayOfLegendValues = vals.map(function(d){return roundUp(maxValue*d,2);});
  arrayOfLegendValues.unshift(0);
  arrayOfLegendValues.push("above");
  if(selectedProperty === "Class")
  {
    arrayOfLegendValues.unshift("Class");
  }

  updateLegend(arrayOfLegendValues);

  //THIS PART IS FOR CENSUS UNIT
  if (selectedMap === "c_unit_map" || selectedMap === "c_unit_map_s")
  {
    let tf = (selectedMap === "c_unit_map" || selectedMap === "c_unit_map_s");
    cen_codes = json['features'].map(function(d){return +d.properties.CEN_2011});
    linker = json['features'].map(function (d) { let i; for(i=0 ; i < csv.length ;i++){if(+d.properties.CEN_2011 === +(csv[i]['State']+csv[i]['District']+csv[i]['Subdistt']+csv[i]['Town/Village'])){ return i;}} });
    d3.selectAll('path')
      .attr('fill-opacity',1)
      .attr('fill',function(d){if((csv[+linker[+cen_codes.findIndex(function(element){ return element === +d.properties.CEN_2011})]][selectedProperty])){
        if(selectedProperty != "Class"){return color((csv[+linker[+cen_codes.findIndex(function(element){ return element === +d.properties.CEN_2011})]][selectedProperty])/maxValue);}else{return urbRuralClassification[(csv[+linker[+cen_codes.findIndex(function(element){ return element === +d.properties.CEN_2011})]][selectedProperty])];}
      } else {return map_unidentified_color;}
    });

      d3.selectAll('path').on("mouseover", function(d) {
                  tooltip.transition()
                  .duration(250)
                  .style("opacity",1);
                tooltip.html(function(a){if((csv[+linker[+cen_codes.findIndex(function(element){ return element === +d.properties.CEN_2011})]][selectedProperty])){return "<p>Name : " + d.properties.NAME + "</p>"+"<p>" + selectedProperty + " : " + (csv[+linker[+cen_codes.findIndex(function(element){ return element === +d.properties.CEN_2011})]][selectedProperty]) + "</p>"}else{return "<p>Name : " + d.properties.NAME + "</p>"+"<p>" + selectedProperty + " : " + "Data not available." + "</p>";}})
                .style("left", (d3.event.pageX + 15) + "px")
                      .style("top", (d3.event.pageY - 28) + "px");
          })
          .on("mouseout",function(d){
            tooltip.transition()
            .duration(250)
            .style("opacity",0);
          });
  }
  //THIS PART IS FOR VP DATA
  else {

      // THIS IF BLOCK IS FOR VP DATA FULL
      if(selectedMap === "vp_final" || selectedMap === "vp_final_s")
      {

        d3.selectAll('path')
          .attr('fill-opacity',1)
          .attr('fill',function(d){if(+d.properties.ID === 999){return map_unidentified_color}
                                    else{
                                        index = +d.properties.ID + starting_pos_vp[d.properties.layer] - 1;
                                        return color(csv[index][selectedProperty]/maxValue)};
                                    });

        d3.selectAll('path').on("mouseover", function(d) {
              if(+d.properties.ID != 999){
                tooltip.transition()
                .duration(250)
                .style("opacity",1);
              tooltip.html("<p>Name : " + d.properties.NAME + "<p>"+selectedProperty +" : "+csv[d.properties.ID - 1 + starting_pos_vp[d.properties.layer]][selectedProperty] +"</p>")
              .style("left", (d3.event.pageX + 15) + "px")
                    .style("top", (d3.event.pageY - 28) + "px");
                  }
                  else {
                    tooltip.transition()
                    .duration(250)
                    .style("opacity",1);
                  tooltip.html("<p>Name : " + d.properties.NAME)
                  .style("left", (d3.event.pageX + 15) + "px")
                        .style("top", (d3.event.pageY - 28) + "px");
                  }
            })
            .on("mouseout",function(d){
              tooltip.transition()
              .duration(250)
              .style("opacity",0);
            });
      }
      else
      {
        // THIS ELSE BLOCK IS FOR SUB DIST DATA

        d3.selectAll('path')
          .attr('fill-opacity',1)
          .attr('fill',function(d){if(+d.properties.ID === 999){return map_unidentified_color}
                                    else{return color(csv[+d.properties.ID-1][selectedProperty]/maxValue)}});

        d3.selectAll('path').on("mouseover", function(d) {
              if(+d.properties.ID != 999){
                tooltip.transition()
                .duration(250)
                .style("opacity",1);
              tooltip.html("<p>Name : " + d.properties.NAME + "</p>" + "<p>"+selectedProperty +" : "+csv[d.properties.ID - 1][selectedProperty] +"</p>")
              .style("left", (d3.event.pageX + 15) + "px")
                    .style("top", (d3.event.pageY - 28) + "px");
                  }
                  else {
                    tooltip.transition()
                    .duration(250)
                    .style("opacity",1);
                  tooltip.html("<p>Name : " + d.properties.NAME)
                  .style("left", (d3.event.pageX + 15) + "px")
                        .style("top", (d3.event.pageY - 28) + "px");

                  }

            })
            .on("mouseout",function(d){
              tooltip.transition()
              .duration(250)
              .style("opacity",0);
            });
      }

  }
}

// THIS FUNCTION IS USED TO UPDATE LEGENDS
function updateLegend(arrayOfLegendValues)
{

  d3.selectAll('.legenditem').remove();
  d3.selectAll('.legend-rect').remove();
  d3.selectAll('.legend-text').remove();

  if(arrayOfLegendValues[0] === "Class")
  {
    let legenditem = legend.selectAll(".legenditem")
                                .data(d3.range(10))
                                .enter()
                                .append("g")
                                  .attr("class", "legenditem")
                                  .attr("transform", function(d, i) {let shift = height - i*20 - legendShiftY; return ("translate(" + legendShiftX  + "," + shift +")"); });

    legenditem.append("rect")
      .attr("x", legendShiftX)
      .attr("y", -7)
      .attr("width", 30)
      .attr("height", 20)
      .attr("stroke","white")
      .attr("stroke-width","2px")
      .attr("class", "legend-rect")
      .style("fill", function(d, i) { return urbRuralColors[i]; });

    let arrayOfLegendValues = ["Urban Class I","Urban Class II","Urban Class III","Urban Class IV","Urban Class V","Urban Class VI","Rural Class A","Rural Class B","Rural Class C","Rural Class D"]

    legenditem.append("text")
      .attr("x", legendShiftX + 35)
      .attr("y", 6)
      .attr("class","legend-text")
      .style("text-anchor", "start")
      .style("font","12px sans-serif")
      .text(function(d, i) { return arrayOfLegendValues[i]; });

  }
  else
  {
    let i = 0;
    arrayOfLegendValues = [...new Set(arrayOfLegendValues)];
    let range = arrayOfLegendValues.length ;
    var legendColors_up = ["#fee391", "#fec44f", "#fe9929", "#ec7014", "#cc4c02", "#993404", "#662506","#F0F0F0"];

    for(i = 0 ; i < 8 - range ; i++)
    {
      legendColors_up.shift();
    }

    let legenditem = legend.selectAll(".legenditem")
                                .data(d3.range(range))
                                .enter()
                                .append("g")
                                  .attr("class", "legenditem")
                                  .attr("transform", function(d, i) {let shift = height - i*20 - legendShiftY; return ("translate(" + legendShiftX  + "," + shift +")"); });

    legenditem.append("rect")
      .attr("x", legendShiftX)
      .attr("y", -7)
      .attr("width", 30)
      .attr("height", 20)
      .attr("stroke","white")
      .attr("stroke-width","2px")
      .attr("class", "legend-rect")
      .style("fill", function(d, i) { return legendColors_up[i]; });

    legenditem.append("text")
      .attr("x", legendShiftX + 35)
      .attr("y", 8)
      .attr("class","legend-text")
      .style("text-anchor", "start")
      .style("font","12px sans-serif")
      .text(function(d, i) {if(i < arrayOfLegendValues.length-1) {return arrayOfLegendValues[i] + " - " + arrayOfLegendValues[i+1];} else{return "Data not available."} });

  }

}
function roundUp(num, precision) {
  precision = Math.pow(10, precision)
  return Math.ceil(num * precision) / precision
}

d3.select("#map-selector")
  .on("change",function(d){
    let activeMap = d3.select('#map-selector').node().value;
    Promise.all([d3.json(map[activeMap]),data_n[activeMap]]).then(([d1,d2]) => {
      const d1_ext = d1.features.map((d) => {return d.properties.NAME});
      render(d1,d2);
    });
  });

d3.select('#property-selector')
  .on('change',function(d){
    let activeMap = d3.select('#map-selector').node().value;
    Promise.all([d3.json(map[activeMap]),data_n[activeMap]]).then(([d1,d2]) => {
      updateColorsAndTooltip(d1,d2);
    });
  });


svg.call(d3.zoom().scaleExtent([0.5,8]).on('zoom', zoomed));
